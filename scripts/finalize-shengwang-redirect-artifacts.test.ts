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
import { afterEach, describe, expect, it } from 'vitest';

const tempDirs: string[] = [];
const inputRoot = 'docs/migration/redirect-inputs';
const source = '/doc/rtc/mini-program/get-started/enable-service';

async function fixture(sourceFile?: string) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shengwang-finalize-'));
  tempDirs.push(root);
  const files = [
    'scripts/finalize-shengwang-redirect-artifacts.mjs',
    'scripts/shengwang-redirect-targets.mjs',
    'src/lib/retired-cn-docs.mjs',
    'src/lib/platforms/registry.ts',
    ...[
      'legacy-url-map-candidate-32883e92e9-2026-10-15.json',
      'legacy-url-inventory-2026-10-14.json',
      'target-routes-32883e92e9.json',
      'target-build-meta-32883e92e9.json',
      'legacy-sitemap-2026-10-14.xml',
    ].map((file) => `${inputRoot}/${file}`),
  ];
  for (const file of files) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await copyFile(file, path.join(root, file));
  }
  await writeFile(
    path.join(root, 'src/lib/shengwang-guide-redirects.json'),
    JSON.stringify({ [source]: '/test-guide#section' }),
  );
  if (sourceFile) {
    const target = path.join(root, 'content/docs/zh-CN', sourceFile);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, '---\ntitle: Test guide\n---\n\n## Section\n');
  }
  return root;
}

function finalize(root: string) {
  return execFileSync(
    process.execPath,
    ['scripts/finalize-shengwang-redirect-artifacts.mjs'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

describe('reviewed Shengwang redirect target validation', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((root) => rm(root, { recursive: true, force: true })),
    );
  });

  it.each([
    'test-guide.mdx',
    'test-guide.md',
    'test-guide/index.mdx',
    'test-guide/index.md',
  ])('publishes a reviewed target backed by %s', async (sourceFile) => {
    const root = await fixture(sourceFile);
    finalize(root);
    const map = JSON.parse(
      await readFile(path.join(root, inputRoot, 'legacy-url-map.json'), 'utf8'),
    );
    expect(
      map.records.find(
        (record: { legacyPath: string }) => record.legacyPath === source,
      ),
    ).toMatchObject({ target: '/test-guide#section', status: 'candidate' });
  });

  it('rejects a reviewed target whose current content is missing', async () => {
    const root = await fixture();
    expect(() => finalize(root)).toThrow();
  });

  it.each([
    ['api-reference/demo/(current)/guide.mdx', '/api-reference/demo/guide'],
    ['new-guide.mdx', '/new-guide/android'],
  ])('appends a post-snapshot source backed by %s', async (file, target) => {
    const root = await fixture('test-guide.mdx');
    const content = path.join(root, 'content/docs/zh-CN', file);
    await mkdir(path.dirname(content), { recursive: true });
    await writeFile(
      content,
      '<PlatformStructured platform="android">Android guide</PlatformStructured>\n\n<PlatformStructured platform="web">Web guide</PlatformStructured>',
    );
    const extraSource = '/doc/demo/android/new-guide';
    await writeFile(
      path.join(root, 'src/lib/shengwang-guide-redirects.json'),
      JSON.stringify({
        [source]: '/test-guide#section',
        [extraSource]: target,
      }),
    );
    finalize(root);
    const map = JSON.parse(
      await readFile(path.join(root, inputRoot, 'legacy-url-map.json'), 'utf8'),
    );
    expect(
      map.records.find(
        (row: { legacyPath: string }) => row.legacyPath === extraSource,
      ),
    ).toMatchObject({
      target,
      status: 'candidate',
      targetExists: true,
      preserveQuery: true,
      mappingType: 'reviewed-hotfix-addition',
    });
    const rules = JSON.parse(
      await readFile(
        path.join(root, inputRoot, 'legacy-url-redirects.vercel.json'),
        'utf8',
      ),
    );
    expect(rules).toContainEqual({
      source: extraSource,
      destination: target,
      statusCode: 301,
      preserveQueryParams: true,
    });
    expect(
      await readFile(
        path.join(root, inputRoot, 'legacy-url-redirects.nginx.conf'),
        'utf8',
      ),
    ).toContain(`return 301 ${target}$is_args$args;`);
  });

  it('rejects a platform path absent from its parent document', async () => {
    const root = await fixture('test-guide.mdx');
    await writeFile(
      path.join(root, 'src/lib/shengwang-guide-redirects.json'),
      JSON.stringify({ [source]: '/test-guide/ios' }),
    );
    expect(() => finalize(root)).toThrow();
  });

  it.each([
    '<PlatformStructured platform="android">Android only</PlatformStructured>',
    '<PlatformInline platform="android">Android</PlatformInline>\n\n<PlatformInline platform="web">Web</PlatformInline>',
    '<PlatformStructured platform="android">Android</PlatformStructured>\n\n<PlatformStructured platform="unknown">Unknown</PlatformStructured>',
  ])(
    'does not publish a virtual path for a single or inline platform group',
    async (content) => {
      const root = await fixture('test-guide.mdx');
      await writeFile(
        path.join(root, 'content/docs/zh-CN/test-guide.mdx'),
        content,
      );
      await writeFile(
        path.join(root, 'src/lib/shengwang-guide-redirects.json'),
        JSON.stringify({ [source]: '/test-guide/android' }),
      );
      expect(() => finalize(root)).toThrow();
    },
  );
});
