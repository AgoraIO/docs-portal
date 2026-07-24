#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';

const ALLOWED_PREFIX = 'content/docs/';
const PUBLIC_MAIN_REF = 'refs/private-release/public-main';

function parseArgs(argv) {
  const values = new Map();

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near ${key ?? '<end>'}.`);
    }
    values.set(key.slice(2), value);
  }

  return values;
}

function requiredArg(args, name) {
  const value = args.get(name);
  if (!value) {
    throw new Error(`--${name} is required.`);
  }
  return value;
}

function git(cwd, args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    }).trim();
  } catch (error) {
    const stderr = error?.stderr?.toString().trim();
    throw new Error(stderr || 'Git command failed.');
  }
}

function gitSucceeds(cwd, args) {
  return (
    spawnSync('git', args, {
      cwd,
      stdio: 'ignore',
    }).status === 0
  );
}

export function validateReleaseBranch(branch) {
  if (
    !/^releases\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch) ||
    branch.includes('..') ||
    branch.includes('//') ||
    branch.endsWith('/')
  ) {
    throw new Error(
      'Source branch must match releases/** and be a valid Git branch name.',
    );
  }
}

function parseChangedPaths(buffer) {
  const fields = buffer.toString('utf8').split('\0').filter(Boolean);
  const paths = [];

  for (let index = 0; index < fields.length; ) {
    const status = fields[index];
    index += 1;
    const pathCount = status.startsWith('R') || status.startsWith('C') ? 2 : 1;
    for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
      const changedPath = fields[index];
      if (!changedPath) {
        throw new Error(
          'Unable to parse changed paths from the private release.',
        );
      }
      paths.push(changedPath);
      index += 1;
    }
  }

  return [...new Set(paths)];
}

function assertAllowedPaths(paths) {
  const disallowed = paths.filter(
    (changedPath) => !changedPath.startsWith(ALLOWED_PREFIX),
  );
  if (disallowed.length > 0) {
    throw new Error(
      `Private release contains changes outside content/docs/**: ${disallowed.join(', ')}`,
    );
  }
}

function assertChangedFilesAreRegular(sourceRepo, sourceSha, paths) {
  for (const changedPath of paths) {
    const treeEntry = git(sourceRepo, [
      'ls-tree',
      sourceSha,
      '--',
      changedPath,
    ]);
    if (treeEntry && !/^100\d{3} blob /.test(treeEntry)) {
      throw new Error(
        `Private release cannot publish non-regular files: ${changedPath}`,
      );
    }
  }
}

function assertCleanTarget(targetRepo) {
  if (git(targetRepo, ['status', '--porcelain'])) {
    throw new Error(
      'Public target checkout must be clean before preparing a release.',
    );
  }
}

export function preparePrivateRelease({
  sourceBranch,
  sourceRef,
  sourceRepo,
  targetRepo,
}) {
  validateReleaseBranch(sourceBranch);

  const source = path.resolve(sourceRepo);
  const target = path.resolve(targetRepo);
  assertCleanTarget(target);

  const publicSha = git(target, ['rev-parse', 'HEAD^{commit}']);
  const sourceSha = git(source, ['rev-parse', `${sourceRef}^{commit}`]);

  git(source, [
    'fetch',
    '--no-tags',
    '--force',
    target,
    `${publicSha}:${PUBLIC_MAIN_REF}`,
  ]);

  if (
    !gitSucceeds(source, [
      'merge-base',
      '--is-ancestor',
      PUBLIC_MAIN_REF,
      sourceSha,
    ])
  ) {
    throw new Error(
      'Private release does not contain the latest public main. Update it from private/main and retry.',
    );
  }

  const changedPathBuffer = execFileSync(
    'git',
    ['diff', '--name-status', '-z', PUBLIC_MAIN_REF, sourceSha, '--'],
    { cwd: source, encoding: 'buffer', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const changedPaths = parseChangedPaths(changedPathBuffer);
  if (changedPaths.length === 0) {
    throw new Error('Private release has no changes to publish.');
  }

  assertAllowedPaths(changedPaths);
  assertChangedFilesAreRegular(source, sourceSha, changedPaths);

  const patch = execFileSync(
    'git',
    [
      'diff',
      '--binary',
      '--full-index',
      PUBLIC_MAIN_REF,
      sourceSha,
      '--',
      'content/docs',
    ],
    { cwd: source, encoding: 'buffer', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const applyResult = spawnSync('git', ['apply', '--binary', '--index', '-'], {
    cwd: target,
    input: patch,
    encoding: 'buffer',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (applyResult.status !== 0) {
    throw new Error(
      applyResult.stderr.toString().trim() ||
        'Unable to apply private release patch.',
    );
  }

  const stagedPaths = git(target, ['diff', '--cached', '--name-only', '-z'])
    .split('\0')
    .filter(Boolean);
  assertAllowedPaths(stagedPaths);

  return {
    changedPaths,
    publicSha,
    sourceBranch,
    sourceSha,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = preparePrivateRelease({
    sourceBranch: requiredArg(args, 'source-branch'),
    sourceRef: args.get('source-ref') ?? 'HEAD',
    sourceRepo: requiredArg(args, 'source-repo'),
    targetRepo: requiredArg(args, 'target-repo'),
  });

  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename)
) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
