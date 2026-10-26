// @vitest-environment node
import { execFileSync } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const scriptPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'generate-docs-last-updated-manifest.mjs',
);
const manifestPath = 'src/generated/docs-last-updated-manifest.ts';
const pagePath = 'content/docs/zh-CN/page.mdx';
const tempDirs: string[] = [];

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'docs-update-times-'));
  tempDirs.push(root);
  await mkdir(path.join(root, 'scripts'), { recursive: true });
  await mkdir(path.join(root, 'content/docs/zh-CN'), { recursive: true });
  await mkdir(path.join(root, 'src/generated'), { recursive: true });
  await copyFile(
    scriptPath,
    path.join(root, 'scripts', path.basename(scriptPath)),
  );
  await writeFile(path.join(root, pagePath), '# First version\n');
  return root;
}

function git(root: string, args: string[], date?: string) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...(date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {}),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function commitPage(root: string, date: string) {
  git(root, ['add', pagePath]);
  git(root, ['commit', '-m', 'Update guide'], date);
}

async function initHistory(root: string) {
  git(root, ['init', '--initial-branch=main']);
  git(root, ['config', 'user.name', 'Docs test']);
  git(root, ['config', 'user.email', 'docs-test@example.invalid']);
  await commitPage(root, '2026-09-11T09:24:43Z');
}

function generate(root: string) {
  execFileSync(
    process.execPath,
    ['scripts/generate-docs-last-updated-manifest.mjs'],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

async function readTimes(root: string) {
  const source = await readFile(path.join(root, manifestPath), 'utf8');
  return Object.fromEntries(
    [...source.matchAll(/'([^']+)':\s*'([^']+)'/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

describe('documentation update-time generation', { timeout: 15_000 }, () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((root) => rm(root, { force: true, recursive: true })),
    );
  });

  it('refreshes a page from its actual latest content commit', async () => {
    const root = await createFixture();
    await initHistory(root);
    generate(root);
    await writeFile(path.join(root, pagePath), '# September release\n');
    await commitPage(root, '2026-09-22T10:37:43Z');
    generate(root);
    expect(await readTimes(root)).toMatchObject({
      [pagePath]: '2026-09-22T10:37:43.000Z',
    });
  });

  it('preserves a verified snapshot for an unchanged Git-free build context', async () => {
    const root = await createFixture();
    await initHistory(root);
    generate(root);
    await rm(path.join(root, '.git'), { recursive: true });
    generate(root);
    expect(await readTimes(root)).toMatchObject({
      [pagePath]: '2026-09-11T09:24:43.000Z',
    });
  });

  it('does not reuse a stale snapshot after content changes without Git history', async () => {
    const root = await createFixture();
    await initHistory(root);
    generate(root);
    await rm(path.join(root, '.git'), { recursive: true });
    await writeFile(path.join(root, pagePath), '# September release\n');
    generate(root);
    expect(await readTimes(root)).not.toHaveProperty(pagePath);
  });

  it('does not trust an older snapshot without content verification', async () => {
    const root = await createFixture();
    await writeFile(
      path.join(root, manifestPath),
      `export const DOCS_LAST_UPDATED_BY_PATH: Record<string, string> = { '${pagePath}': '2026-09-11T09:24:43.000Z' };\n`,
    );
    generate(root);
    expect(await readTimes(root)).toEqual({});
  });

  it('uses only actual changes after a shallow boundary when the snapshot is stale', async () => {
    const root = await createFixture();
    await initHistory(root);
    generate(root);
    const previousSnapshot = await readFile(
      path.join(root, manifestPath),
      'utf8',
    );
    const boundaryPage = 'content/docs/zh-CN/boundary.mdx';
    await writeFile(path.join(root, boundaryPage), '# Earlier guide\n');
    git(root, ['add', boundaryPage]);
    git(root, ['commit', '-m', 'Add earlier guide'], '2026-09-12T10:00:00Z');
    await writeFile(path.join(root, pagePath), '# September release\n');
    await commitPage(root, '2026-09-22T10:37:43Z');

    const shallow = await createFixture();
    const checkout = path.join(shallow, 'checkout');
    git(shallow, ['clone', '--depth=2', `file://${root}`, checkout]);
    await mkdir(path.join(checkout, 'scripts'), { recursive: true });
    await mkdir(path.join(checkout, 'src/generated'), { recursive: true });
    await copyFile(
      scriptPath,
      path.join(checkout, 'scripts', path.basename(scriptPath)),
    );
    await writeFile(path.join(checkout, manifestPath), previousSnapshot);
    generate(checkout);

    const times = await readTimes(checkout);
    expect(times[pagePath]).toBe('2026-09-22T10:37:43.000Z');
    expect(times).not.toHaveProperty(boundaryPage);
  });
});
