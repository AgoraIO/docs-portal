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
  'src/lib/legacy-sitemap/gsc-observed-redirects.json',
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

function generateArtifacts(root: string) {
  return execFileSync(
    process.execPath,
    [path.join(root, 'scripts/generate-legacy-redirect-artifacts.mjs')],
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
      '[legacy-redirects] Vercel query redirect routes:',
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

  it('keeps query-specific preserveSearch false rules out of bulk redirects', async () => {
    const root = await createFixture();
    const redirectsPath = path.join(
      root,
      'src/lib/legacy-sitemap/redirects.json',
    );
    const redirectsConfig = JSON.parse(await readFile(redirectsPath, 'utf8'));

    redirectsConfig.rules.push({
      legacyUrl: 'https://docs.agora.io/en/query-only/source?platform=Web',
      legacyPath: '/en/query-only/source',
      legacySearch: '?platform=Web',
      target: '/en/query-only/target',
      type: 'semantic-page-match',
      confidence: 'high',
      evidence: ['fixture'],
      preserveSearch: false,
    });
    await writeFile(
      redirectsPath,
      `${JSON.stringify(redirectsConfig, null, 2)}\n`,
      'utf8',
    );

    expect(generateArtifacts(root)).toContain(
      '[legacy-redirects] Vercel query redirect routes:',
    );

    const bulkRedirects = JSON.parse(
      await readFile(path.join(root, 'vercel-legacy-redirects.json'), 'utf8'),
    );
    const vercelConfig = JSON.parse(
      await readFile(path.join(root, 'vercel.json'), 'utf8'),
    );

    expect(bulkRedirects).not.toContainEqual(
      expect.objectContaining({
        source: '/en/query-only/source',
      }),
    );
    expect(vercelConfig.routes).toContainEqual({
      src: '^/en/query-only/source/?$',
      headers: {
        Location: '/en/query-only/target',
      },
      has: [
        {
          type: 'query',
          key: 'platform',
          value: 'Web',
        },
      ],
      status: 301,
    });
    expect(vercelConfig.redirects).not.toContainEqual(
      expect.objectContaining({ source: '/en/query-only/source' }),
    );
  });

  it('encodes Vercel redirect paths that contain spaces', async () => {
    const root = await createFixture();
    const redirectsPath = path.join(
      root,
      'src/lib/legacy-sitemap/redirects.json',
    );
    const redirectsConfig = JSON.parse(await readFile(redirectsPath, 'utf8'));

    redirectsConfig.rules.push(
      {
        legacyUrl: 'https://docs.agora.io/en/Space%20Path/query?platform=All',
        legacyPath: '/en/Space Path/query',
        legacySearch: '?platform=All',
        target: '/en/current/query-target',
        type: 'semantic-page-match',
        confidence: 'high',
        evidence: ['fixture'],
        preserveSearch: false,
      },
      {
        legacyUrl: 'https://docs.agora.io/en/Space%20Path/bulk',
        legacyPath: '/en/Space Path/bulk',
        target: '/en/current/bulk-target',
        type: 'semantic-page-match',
        confidence: 'high',
        evidence: ['fixture'],
        preserveSearch: true,
      },
    );
    await writeFile(
      redirectsPath,
      `${JSON.stringify(redirectsConfig, null, 2)}\n`,
      'utf8',
    );

    generateArtifacts(root);

    const bulkRedirects = JSON.parse(
      await readFile(path.join(root, 'vercel-legacy-redirects.json'), 'utf8'),
    );
    const vercelConfig = JSON.parse(
      await readFile(path.join(root, 'vercel.json'), 'utf8'),
    );

    expect(bulkRedirects).toContainEqual({
      source: '/en/Space%20Path/bulk',
      destination: '/en/current/bulk-target',
      statusCode: 301,
      preserveQueryParams: true,
    });
    expect(vercelConfig.routes).toContainEqual({
      src: '^/en/Space%20Path/query/?$',
      headers: {
        Location: '/en/current/query-target',
      },
      has: [
        {
          type: 'query',
          key: 'platform',
          value: 'All',
        },
      ],
      status: 301,
    });
  });

  it('spills query-preserving redirects beyond the bulk limit into vercel.json', async () => {
    const root = await createFixture();
    const redirectsPath = path.join(
      root,
      'src/lib/legacy-sitemap/redirects.json',
    );
    const gscObservedRedirectsPath = path.join(
      root,
      'src/lib/legacy-sitemap/gsc-observed-redirects.json',
    );
    const rules = Array.from({ length: 1_001 }, (_, index) => ({
      legacyUrl: `https://docs.agora.io/en/overflow/source-${index}`,
      legacyPath: `/en/overflow/source-${index}`,
      target: `/en/overflow/target-${index}`,
      type: 'semantic-page-match',
      confidence: 'high',
      evidence: ['fixture'],
      preserveSearch: true,
    }));
    await writeFile(
      redirectsPath,
      `${JSON.stringify({ rules }, null, 2)}\n`,
      'utf8',
    );
    await writeFile(gscObservedRedirectsPath, '[]\n', 'utf8');

    expect(generateArtifacts(root)).toContain(
      '[legacy-redirects] Vercel bulk redirects: 1000',
    );

    const bulkRedirects = JSON.parse(
      await readFile(path.join(root, 'vercel-legacy-redirects.json'), 'utf8'),
    );
    const vercelConfig = JSON.parse(
      await readFile(path.join(root, 'vercel.json'), 'utf8'),
    );
    const generatedRedirects = [
      ...bulkRedirects,
      ...vercelConfig.redirects.filter((redirect: { source: string }) =>
        redirect.source.startsWith('/en/overflow/'),
      ),
    ];

    expect(bulkRedirects).toHaveLength(1_000);
    expect(generatedRedirects).toHaveLength(1_001);
    expect(
      vercelConfig.redirects.some(
        (redirect: Record<string, unknown>) =>
          'preserveQueryParams' in redirect,
      ),
    ).toBe(false);
  });
});
