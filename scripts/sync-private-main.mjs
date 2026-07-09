#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';

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

function readRemoteSha(cwd, privateUrl) {
  const result = spawnSync(
    'git',
    ['ls-remote', '--exit-code', privateUrl, 'refs/heads/main'],
    {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  if (result.status === 2) {
    return '';
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'Unable to read private main.');
  }

  return result.stdout.trim().split(/\s+/)[0] ?? '';
}

export function syncPrivateMain({ privateUrl, publicRef, publicRepo }) {
  const repo = path.resolve(publicRepo);
  const publicSha = git(repo, ['rev-parse', `${publicRef}^{commit}`]);
  const observedPrivateSha = readRemoteSha(repo, privateUrl);

  if (observedPrivateSha === publicSha) {
    return { changed: false, privateSha: observedPrivateSha, publicSha };
  }

  git(repo, [
    'push',
    `--force-with-lease=refs/heads/main:${observedPrivateSha}`,
    privateUrl,
    `${publicSha}:refs/heads/main`,
  ]);

  const privateSha = readRemoteSha(repo, privateUrl);
  if (privateSha !== publicSha) {
    throw new Error(
      'Private main did not resolve to the public main commit after synchronization.',
    );
  }

  return { changed: true, privateSha, publicSha };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = syncPrivateMain({
    privateUrl: requiredArg(args, 'private-url'),
    publicRef: args.get('public-ref') ?? 'HEAD',
    publicRepo: requiredArg(args, 'public-repo'),
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
