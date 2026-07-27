import { readFile, symlink, unlink } from 'node:fs/promises';
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
  'prepare-private-release.mjs',
);

describe('prepare-private-release', () => {
  afterEach(cleanupTempDirs);

  it('applies document additions, edits, and deletions onto a clean public checkout', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const sourceRepo = path.join(root, 'private-source');
    const targetRepo = path.join(root, 'public-target');
    git(root, 'clone', publicRepo, sourceRepo);
    git(root, 'clone', publicRepo, targetRepo);
    configureGit(sourceRepo);
    git(sourceRepo, 'switch', '-c', 'releases/test1');

    await writeFixture(
      sourceRepo,
      'content/docs/guide.md',
      'Private release guide\n',
    );
    await writeFixture(sourceRepo, 'content/docs/new.md', 'New release page\n');
    await unlink(path.join(sourceRepo, 'content/docs/remove.md'));
    git(sourceRepo, 'add', '--all');
    git(sourceRepo, 'commit', '-m', 'prepare private release');

    runScript(SCRIPT, [
      '--source-repo',
      sourceRepo,
      '--target-repo',
      targetRepo,
      '--source-branch',
      'releases/test1',
      '--source-ref',
      'HEAD',
    ]);

    expect(
      await readFile(path.join(targetRepo, 'content/docs/guide.md'), 'utf8'),
    ).toBe('Private release guide\n');
    expect(
      await readFile(path.join(targetRepo, 'content/docs/new.md'), 'utf8'),
    ).toBe('New release page\n');
    expect(git(targetRepo, 'status', '--short')).toBe(
      'M  content/docs/guide.md\nA  content/docs/new.md\nD  content/docs/remove.md',
    );
  });

  it('rejects a release branch that does not contain the latest public main', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const sourceRepo = path.join(root, 'private-source');
    git(root, 'clone', publicRepo, sourceRepo);
    configureGit(sourceRepo);
    git(sourceRepo, 'switch', '-c', 'releases/stale');
    await writeFixture(
      sourceRepo,
      'content/docs/guide.md',
      'Stale release guide\n',
    );
    git(sourceRepo, 'add', '.');
    git(sourceRepo, 'commit', '-m', 'prepare stale release');

    await writeFixture(
      publicRepo,
      'content/docs/public-only.md',
      'New public page\n',
    );
    git(publicRepo, 'add', '.');
    git(publicRepo, 'commit', '-m', 'advance public main');

    const output = runScriptFailure(SCRIPT, [
      '--source-repo',
      sourceRepo,
      '--target-repo',
      publicRepo,
      '--source-branch',
      'releases/stale',
      '--source-ref',
      'HEAD',
    ]);

    expect(output).toContain('does not contain the latest public main');
  });

  it('rejects invalid release names and changes outside content/docs', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const sourceRepo = path.join(root, 'private-source');
    git(root, 'clone', publicRepo, sourceRepo);
    configureGit(sourceRepo);
    git(sourceRepo, 'switch', '-c', 'releases/code-change');
    await writeFixture(
      sourceRepo,
      'src/app.ts',
      "export const app = 'private';\n",
    );
    git(sourceRepo, 'add', '.');
    git(sourceRepo, 'commit', '-m', 'change private code');

    const invalidBranchOutput = runScriptFailure(SCRIPT, [
      '--source-repo',
      sourceRepo,
      '--target-repo',
      publicRepo,
      '--source-branch',
      'feature/code-change',
      '--source-ref',
      'HEAD',
    ]);
    expect(invalidBranchOutput).toContain('must match releases/**');

    const invalidPathOutput = runScriptFailure(SCRIPT, [
      '--source-repo',
      sourceRepo,
      '--target-repo',
      publicRepo,
      '--source-branch',
      'releases/code-change',
      '--source-ref',
      'HEAD',
    ]);
    expect(invalidPathOutput).toContain('outside content/docs/**');
  });

  it('rejects symbolic links inside the allowed content path', async () => {
    const root = await makeTempDir();
    const publicRepo = await createPublicRepo(root);
    const sourceRepo = path.join(root, 'private-source');
    git(root, 'clone', publicRepo, sourceRepo);
    configureGit(sourceRepo);
    git(sourceRepo, 'switch', '-c', 'releases/symlink');
    await symlink(
      '../../../src/app.ts',
      path.join(sourceRepo, 'content/docs/app-link.md'),
    );
    git(sourceRepo, 'add', '.');
    git(sourceRepo, 'commit', '-m', 'add content symlink');

    const output = runScriptFailure(SCRIPT, [
      '--source-repo',
      sourceRepo,
      '--target-repo',
      publicRepo,
      '--source-branch',
      'releases/symlink',
      '--source-ref',
      'HEAD',
    ]);

    expect(output).toContain('cannot publish non-regular files');
  });
});
