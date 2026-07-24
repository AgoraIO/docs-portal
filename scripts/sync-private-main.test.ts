import { execFileSync } from 'node:child_process';
import { chmod } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanupTempDirs,
  configureGit,
  createPublicRepo,
  git,
  makeTempDir,
  runScript,
  runScriptFailure,
  writeFixture,
} from './private-docs-workflow-test-helpers';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'sync-private-main.mjs',
);

describe('sync-private-main', () => {
  afterEach(cleanupTempDirs);

  it('makes private main point at the exact public commit even after private diverges', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const privateBare = path.join(root, 'private.git');
    git(root, 'init', '--bare', privateBare);
    git(publicRepo, 'remote', 'add', 'private', privateBare);
    git(publicRepo, 'push', 'private', 'HEAD:main');

    const privateWork = path.join(root, 'private-work');
    git(root, 'clone', '--branch', 'main', privateBare, privateWork);
    configureGit(privateWork);
    await writeFixture(privateWork, 'private-only.md', 'Do not preserve\n');
    git(privateWork, 'add', '.');
    git(privateWork, 'commit', '-m', 'diverge private main');
    git(privateWork, 'push', 'origin', 'main');

    await writeFixture(
      publicRepo,
      'content/docs/guide.md',
      'Updated public guide\n',
    );
    git(publicRepo, 'add', '.');
    git(publicRepo, 'commit', '-m', 'update public main');

    runScript(SCRIPT, [
      '--public-repo',
      publicRepo,
      '--public-ref',
      'HEAD',
      '--private-url',
      privateBare,
    ]);

    expect(git(privateBare, 'rev-parse', 'refs/heads/main')).toBe(
      git(publicRepo, 'rev-parse', 'HEAD'),
    );
  });

  it('creates private main when the private repository is still empty', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const privateBare = path.join(root, 'private.git');
    git(root, 'init', '--bare', privateBare);

    runScript(SCRIPT, [
      '--public-repo',
      publicRepo,
      '--public-ref',
      'HEAD',
      '--private-url',
      privateBare,
    ]);

    expect(git(privateBare, 'rev-parse', 'refs/heads/main')).toBe(
      git(publicRepo, 'rev-parse', 'HEAD'),
    );
  });

  it('refuses to overwrite private main when it changes after observation', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const privateBare = path.join(root, 'private.git');
    git(root, 'init', '--bare', privateBare);
    git(publicRepo, 'remote', 'add', 'private', privateBare);
    git(publicRepo, 'push', 'private', 'HEAD:main');

    const privateWork = path.join(root, 'private-work');
    git(root, 'clone', '--branch', 'main', privateBare, privateWork);
    configureGit(privateWork);
    await writeFixture(privateWork, 'race.md', 'Concurrent private update\n');
    git(privateWork, 'add', '.');
    git(privateWork, 'commit', '-m', 'concurrent private update');
    const raceSha = git(privateWork, 'rev-parse', 'HEAD');
    git(privateWork, 'push', 'origin', 'HEAD:refs/heads/race-candidate');

    await writeFixture(
      publicRepo,
      'content/docs/guide.md',
      'New public main\n',
    );
    git(publicRepo, 'add', '.');
    git(publicRepo, 'commit', '-m', 'advance public main');

    const wrapperDir = path.join(root, 'git-wrapper');
    const wrapperPath = path.join(wrapperDir, 'git');
    const realGit = execFileSync('sh', ['-c', 'command -v git'], {
      encoding: 'utf8',
    }).trim();
    await writeFixture(
      root,
      'git-wrapper/git',
      `#!/bin/sh
if [ "$1" = "push" ]; then
  "${realGit}" --git-dir="${privateBare}" update-ref refs/heads/main "${raceSha}"
fi
exec "${realGit}" "$@"
`,
    );
    await chmod(wrapperPath, 0o755);

    const output = runScriptFailure(
      SCRIPT,
      [
        '--public-repo',
        publicRepo,
        '--public-ref',
        'HEAD',
        '--private-url',
        privateBare,
      ],
      { ...process.env, PATH: `${wrapperDir}:${process.env.PATH}` },
    );

    expect(output).toContain('stale info');
    expect(git(privateBare, 'rev-parse', 'refs/heads/main')).toBe(raceSha);
  });
});
