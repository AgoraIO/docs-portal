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

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const FIXTURE_PATHS = [
  'scripts/generate-legacy-redirect-artifacts.mjs',
  'src/lib/legacy-sitemap/redirects.json',
  'src/lib/legacy-sitemap/static-redirects.json',
  'vercel-legacy-redirects.json',
  'vercel.base.json',
  'vercel.json',
] as const;
const tempDirs: string[] = [];

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'legacy-redirects-'));
  tempDirs.push(root);

  await Promise.all(
    FIXTURE_PATHS.map(async (relativePath) => {
      const target = path.join(root, relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(path.join(REPO_ROOT, relativePath), target);
    }),
  );

  return root;
}

function checkArtifacts(root: string) {
  return execFileSync(
    process.execPath,
    [
      path.join(root, 'scripts/generate-legacy-redirect-artifacts.mjs'),
      '--check',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

function checkArtifactsFailure(root: string) {
  try {
    checkArtifacts(root);
  } catch (error) {
    return String((error as Error & { stderr?: string }).stderr ?? error);
  }

  throw new Error('Expected redirect artifact validation to fail.');
}

describe('generate-legacy-redirect-artifacts', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => rm(dir, { force: true, recursive: true })),
    );
  });

  it('accepts a semantically identical minified vercel.json', async () => {
    const root = await createFixture();
    const vercelPath = path.join(root, 'vercel.json');
    const config = JSON.parse(await readFile(vercelPath, 'utf8'));
    await writeFile(vercelPath, `${JSON.stringify(config)}\n`, 'utf8');

    expect(checkArtifacts(root)).toContain(
      '[legacy-redirects] Vercel query redirects:',
    );
  });

  it('rejects a semantic change to vercel.json', async () => {
    const root = await createFixture();
    const vercelPath = path.join(root, 'vercel.json');
    const config = JSON.parse(await readFile(vercelPath, 'utf8'));
    config.buildCommand = 'do not build';
    await writeFile(vercelPath, `${JSON.stringify(config)}\n`, 'utf8');

    expect(checkArtifactsFailure(root)).toContain('vercel.json is out of date');
  });

  it('keeps byte-level validation for other generated artifacts', async () => {
    const root = await createFixture();
    const redirectsPath = path.join(root, 'vercel-legacy-redirects.json');
    const redirects = JSON.parse(await readFile(redirectsPath, 'utf8'));
    await writeFile(
      redirectsPath,
      `${JSON.stringify(redirects, null, 2)}\n`,
      'utf8',
    );

    expect(checkArtifactsFailure(root)).toContain(
      'vercel-legacy-redirects.json is out of date',
    );
  });
});
