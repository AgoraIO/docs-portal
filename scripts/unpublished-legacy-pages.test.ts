import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { glob } from 'tinyglobby';
import { describe, expect, it } from 'vitest';
import { resolveZhCnProductIaRedirect } from '../src/lib/zh-cn-product-ia-redirects';
import { apiTargets, docsTargets } from './generate-legacy-file-mapping.mjs';
import {
  migrateLegacyPage,
  migrateLegacyPages,
} from './migrate-legacy-docs.mjs';
import { readControlTable } from './migration-control-table.mjs';

const sources = [
  'docs-api-reference/rtc-server-sdk/go-api/_remotevideotrack.go.mdx',
  'docs-api-reference/rtc-server-sdk/go-api/_videoencodedimagereceiver.go.mdx',
  'docs-api-reference/rtc-server-sdk/python-api/_ivideoencodedimagereceiver.python.mdx',
  'docs-api-reference/rtc-server-sdk/python-api/_localusercopy.python.mdx',
  'docs-api-reference/rtc-server-sdk/python-api/_remotevideotrack.python.mdx',
  'docs-api-reference/rtc-server-sdk/python-api/_rtcconnectionobserver_backup.python.mdx',
  'docs/iot-apaas/_resources.mdx',
  'docs/toybox/_resources.mdx',
];
const targets = [
  ...sources
    .slice(0, 6)
    .map((source) =>
      source.replace(
        'docs-api-reference/',
        'content/docs/zh-CN/api-reference/',
      ),
    ),
  'content/docs/zh-CN/solutions/iot-apaas/reference/downloads.mdx',
  'content/docs/zh-CN/ai/device-kit/resources.mdx',
];

describe('legacy pages excluded by the source publication rules', () => {
  it('preserves the archived bytes and removes their actual page entrances', async () => {
    const manifest = JSON.parse(
      readFileSync('docs/migration/unpublished/manifest.json', 'utf8'),
    );
    const { source } = await import('../src/lib/source');
    const publishedUrls = new Set(
      source.getPages('zh-CN').map((page) => page.url),
    );
    expect(manifest.pages).toHaveLength(8);
    for (const page of manifest.pages) {
      expect(
        createHash('sha256').update(readFileSync(page.archive)).digest('hex'),
      ).toBe(page.sha256);
      const route =
        '/' +
        page.previousTarget
          .replace(/^content\/docs\//, '')
          .replace(/\.mdx$/, '');
      expect(publishedUrls.has(route)).toBe(false);
      expect(
        source.getPage(route.split('/').slice(2), 'zh-CN'),
      ).toBeUndefined();
    }
    expect(
      resolveZhCnProductIaRedirect('zh-CN', 'solutions', [
        'iot-apaas',
        'resources',
      ]),
    ).toBeNull();
  }, 20_000);

  it('does not reinstate special resource mappings or API copies', () => {
    for (const sourcePath of sources) {
      const result = sourcePath.startsWith('docs/')
        ? docsTargets({ sourcePath, productMap: new Map() })
        : apiTargets({ sourcePath, apiMaps: new Map() });
      expect(result).toMatchObject([{ status: 'ignore', target: '' }]);
    }
  });

  it('still expands an unpublished fragment inside a published guide', async () => {
    const sourceRoot = await mkdtemp(
      path.join(os.tmpdir(), 'unpublished-fragment-'),
    );
    try {
      const folder = path.join(sourceRoot, 'docs/rtc');
      await mkdir(folder, { recursive: true });
      await writeFile(
        path.join(folder, '_fragment.mdx'),
        'Shared fragment text.\n',
      );
      await writeFile(
        path.join(folder, 'guide.mdx'),
        '---\ntitle: Guide\n---\n\nimport Fragment from "./_fragment.mdx";\n\n<Fragment />\n',
      );
      const page = await migrateLegacyPage({
        sourceRoot,
        sourcePath: 'docs/rtc/guide.mdx',
        targetPath: 'content/docs/zh-CN/realtime-media/rtc/guide.mdx',
        pathMap: new Map(),
      });
      expect(page.content).toContain('Shared fragment text.');
    } finally {
      await rm(sourceRoot, { recursive: true, force: true });
    }
  });

  it('keeps the eight originals outside the published collection', async () => {
    const published = new Set(await glob('content/docs/**/*.{md,mdx}'));
    for (const target of targets) {
      expect(published.has(target), target).toBe(false);
      expect(existsSync(`docs/migration/unpublished/${target}`), target).toBe(
        true,
      );
    }
    for (const official of ['localuser', 'irtcconnectionobserver']) {
      expect(
        published.has(
          `content/docs/zh-CN/api-reference/rtc-server-sdk/python-api/${official}.python.mdx`,
        ),
      ).toBe(true);
    }
  });

  it('does not regenerate an unpublished page even with an explicit target', async () => {
    await expect(
      migrateLegacyPage({
        sourcePath: sources[3],
        sourceRoot: '/nonexistent-legacy-root',
        targetPath: targets[3],
        pathMap: new Map(),
      }),
    ).rejects.toThrow('not published by the legacy site');
    expect(
      await migrateLegacyPages({
        sourcePath: sources[3],
        sourceRoot: '/nonexistent-legacy-root',
        pathMap: new Map(),
      }),
    ).toEqual([]);
  });

  it('does not advertise the unpublished sources as redirectable content', async () => {
    const table = await readControlTable('docs/migration/path-map.csv');
    for (const source of sources) {
      const row = table.rows.find(
        (row: { source_path: string }) => row.source_path === source,
      );
      expect(row, source).toMatchObject({
        target_path: '',
        new_url: '',
        redirect_status: 'ignore',
      });
    }
    const reference = JSON.parse(
      readFileSync(
        'content/docs/zh-CN/solutions/iot-apaas/reference/meta.json',
        'utf8',
      ),
    );
    expect(reference.pages).not.toContain('downloads');
    expect(
      readFileSync(
        'content/docs/zh-CN/solutions/iot-apaas/build/customize-and-extend/alarm.mdx',
        'utf8',
      ),
    ).not.toContain('/iot-apaas/reference/downloads');
  });
});
