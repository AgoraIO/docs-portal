import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import {
  type CnSdkPublicationScope,
  createCnSdkPublicationPolicy,
} from '../../src/lib/search/cn-sdk-publication';
import type { SearchSection } from '../../src/lib/search/kb-record';
import type { SearchIndexReceipt } from '../../src/lib/search/meilisearch-index.server';

export type ReleaseCommand = (
  args: string[],
  env?: Record<string, string>,
) => Promise<string>;

type Manifest = {
  format: 1;
  revision: string;
  count: number;
  artifacts: Record<keyof typeof artifacts, string>;
  publication: string;
};

const artifacts = {
  records: 'dist/search/cn-records.json',
  coverage: 'dist/search/cn-coverage-audit.json',
  site: 'dist/client',
  service: '.output',
} as const;
const manifestFile = 'dist/search/cn-publication.json';
const receiptFile = 'dist/search/cn-release.json';
const generatedFiles = new Set([
  'src/generated/docs-last-updated-manifest.ts',
  'src/routeTree.gen.ts',
]);
const digest = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex');

// Include names as well as bytes; reject symlinks so a release is self-contained.
async function hashArtifact(root: string): Promise<string> {
  const hash = createHash('sha256');
  const visit = async (file: string) => {
    const stat = await lstat(file);
    assert.ok(!stat.isSymbolicLink(), `Release artifact is a symlink: ${file}`);
    hash.update(`${path.relative(root, file).split(path.sep).join('/')}\0`);
    if (stat.isDirectory()) {
      hash.update('directory\0');
      for (const name of (await readdir(file)).sort())
        await visit(path.join(file, name));
    } else {
      assert.ok(stat.isFile(), `Not a release file: ${file}`);
      hash.update(`file:${stat.size}\0`);
      for await (const bytes of createReadStream(file)) hash.update(bytes);
    }
  };
  await visit(root);
  return hash.digest('hex');
}

async function publicationScopes(root: string) {
  const scopes: CnSdkPublicationScope[] = [];
  const visit = async (directory: string) => {
    for (const entry of (
      await readdir(directory, { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(filename);
      else if (entry.name === 'meta.json') {
        const { navScope } = JSON.parse(await readFile(filename, 'utf8'));
        if (navScope) {
          scopes.push({
            scopeUrl: `/${path
              .relative(path.join(root, 'content/docs'), directory)
              .split(path.sep)
              .filter((segment) => !/^\(.+\)$/.test(segment))
              .join('/')}`,
            navScope,
          });
        }
      }
    }
  };
  await visit(path.join(root, 'content/docs/zh-CN/api-reference'));
  return scopes;
}

async function snapshotManifest(root: string, revision: string) {
  const records = JSON.parse(
    await readFile(path.join(root, artifacts.records), 'utf8'),
  ) as SearchSection[];
  assert.ok(
    Array.isArray(records) && records.length,
    'Empty CN search snapshot',
  );
  const scopes = await publicationScopes(root);
  const resolve = createCnSdkPublicationPolicy(scopes);
  for (const record of records) {
    const publication = resolve(
      record.url.startsWith('/zh-CN/') ? record.url : `/zh-CN${record.url}`,
    );
    assert.ok(publication.searchable, `Historical SDK record: ${record.url}`);
    if (publication.version)
      assert.equal(
        record.version,
        publication.version,
        `SDK version: ${record.url}`,
      );
  }
  const hashes = {} as Manifest['artifacts'];
  for (const [key, filename] of Object.entries(artifacts))
    hashes[key as keyof typeof artifacts] = await hashArtifact(
      path.join(root, filename),
    );
  const coverage = JSON.parse(
    await readFile(path.join(root, artifacts.coverage), 'utf8'),
  );
  assert.equal(
    coverage.snapshot.sha256,
    digest(await readFile(path.join(root, artifacts.records))),
    'Coverage audit must describe this exact snapshot',
  );
  return {
    format: 1 as const,
    revision,
    count: records.length,
    artifacts: hashes,
    publication: digest(JSON.stringify(scopes)),
  };
}

/** The deployment caller serializes prepare -> deploy -> promote for one index. */
export async function releaseCnSearch(
  mode: 'bundle' | 'prepare' | 'promote',
  options: { root: string; revision: string; origin?: string },
  command: ReleaseCommand,
  request: typeof fetch = fetch,
) {
  const { root, revision } = options;
  assert.match(revision, /^[a-f0-9]{40}$/, 'Use the full release commit SHA');
  const checkSource = async (allowGenerated: boolean) => {
    assert.equal(
      (await command(['git', 'rev-parse', 'HEAD'])).trim(),
      revision,
      'Checkout must match release SHA',
    );
    const dirty = (
      await command([
        'git',
        'status',
        '--porcelain',
        '--untracked-files=normal',
      ])
    )
      .split('\n')
      .filter(Boolean)
      .filter((line) => !allowGenerated || !generatedFiles.has(line.slice(3)));
    assert.equal(dirty.length, 0, 'Use a clean release checkout');
  };
  await checkSource(mode !== 'bundle');
  const manifestPath = path.join(root, manifestFile);
  const cnEnv = { VITE_DOCS_REGION: 'cn' };
  const audit = () =>
    command(
      [
        'node',
        'scripts/search/audit-cn-coverage.mjs',
        `--records=${artifacts.records}`,
        '--html=dist/client',
        `--out=${artifacts.coverage}`,
      ],
      cnEnv,
    );
  if (mode === 'bundle') {
    // A failed rebuild must not leave a previously valid manifest behind.
    await rm(manifestPath, { force: true });
    await command(['bun', 'run', 'build:static'], cnEnv);
    await command(['bun', 'run', 'build:service'], cnEnv);
    await command(['bun', 'run', 'search:export:cn'], cnEnv);
    await audit();
    await checkSource(true);
    const manifest = await snapshotManifest(root, revision);
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    return;
  }

  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString()) as Manifest;
  assert.deepEqual(
    manifest,
    await snapshotManifest(root, revision),
    'Release artifacts or publication metadata changed; rebuild the bundle',
  );
  // Re-run the maintained gate, including checks added after this entry point.
  // Preserve the sealed report: its timestamps/paths may differ on another runner.
  await command(
    [
      'node',
      'scripts/search/audit-cn-coverage.mjs',
      `--records=${artifacts.records}`,
      '--html=dist/client',
      '--out=dist/search/cn-preflight-audit.json',
    ],
    cnEnv,
  );
  const sync = (action: string) =>
    command(
      [
        'bun',
        'scripts/search/sync-cn.ts',
        action,
        `--revision=${revision}`,
        `--records=${artifacts.records}`,
        `--receipt=${receiptFile}`,
      ],
      cnEnv,
    );
  const receiptPath = path.join(root, receiptFile);
  if (mode === 'prepare') {
    await checkSource(true);
    await sync('prepare');
    const receipt = JSON.parse(
      await readFile(receiptPath, 'utf8'),
    ) as SearchIndexReceipt;
    assert.equal(receipt.revision, revision, 'Prepared revision mismatch');
    assert.equal(
      receipt.count,
      manifest.count,
      'Prepared record count mismatch',
    );
    await writeFile(
      receiptPath,
      `${JSON.stringify({ ...receipt, bundleSha256: digest(manifestBytes) }, null, 2)}\n`,
      { mode: 0o600 },
    );
    return;
  }

  assert.ok(
    options.origin,
    'Promotion requires the deployed frontend --origin',
  );
  const origin = new URL(options.origin);
  assert.ok(
    ['http:', 'https:'].includes(origin.protocol) &&
      !origin.username &&
      !origin.password &&
      origin.pathname === '/' &&
      !origin.search &&
      !origin.hash,
    'Use a frontend origin without a path or credentials',
  );
  const receipt = JSON.parse(
    await readFile(receiptPath, 'utf8'),
  ) as SearchIndexReceipt & { bundleSha256?: string };
  assert.equal(
    receipt.bundleSha256,
    digest(manifestBytes),
    'Receipt belongs to a different release bundle',
  );
  assert.equal(receipt.revision, revision, 'Receipt revision mismatch');
  assert.equal(receipt.count, manifest.count, 'Receipt record count mismatch');
  const response = await request(new URL('/api/health', origin), {
    redirect: 'error',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, 'Deployed search API unavailable');
  const health = await response.json();
  assert.equal(health.status, 'ok', 'Deployed API must be healthy');
  assert.equal(
    health.revision,
    revision,
    'Deployed API must report this release SHA',
  );
  await command(
    [
      'bun',
      'run',
      'search:verify:urls:cn',
      `--origin=${origin.origin}`,
      `--records=${artifacts.records}`,
      '--html=dist/client',
    ],
    cnEnv,
  );
  await checkSource(true);
  await sync('promote');
}
