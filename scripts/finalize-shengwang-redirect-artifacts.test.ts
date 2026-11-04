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
});
