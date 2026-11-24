import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditSingleDocContentFidelity } from './audit-single-doc-fidelity.mjs';
import {
  inferContextFromSourcePath,
  migrateLegacyPage,
  transformLegacyMdx,
} from './migrate-legacy-docs.mjs';

type Replacement = { line: number; before: string; after: string };
const manifest = JSON.parse(
  readFileSync(
    path.resolve('scripts/fixtures/cn-product-label-repair.json'),
    'utf8',
  ),
) as {
  documents: {
    path: string;
    product: string;
    label: string;
    replacements: Replacement[];
  }[];
  descriptions: ({ path: string } & Replacement)[];
};
// Independent expectations come from pinned source metadata, not the resolver.
const metadata = readFileSync(
  path.resolve('scripts/fixtures/legacy-products.meta.js.txt'),
  'utf8',
);
const sourceLabels = new Map(
  [...metadata.matchAll(/value:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"/g)].map(
    (match) => [match[1], match[2]],
  ),
);
const products = [...new Set(manifest.documents.map((doc) => doc.product))].map(
  (product) => [product, sourceLabels.get(product)!] as const,
);
const tempDirs: string[] = [];

function createState(product: string, productLabel?: string) {
  const sourcePath = `docs/${product}/enable-service.mdx`;
  return {
    context: { ...inferContextFromSourcePath(sourcePath), productLabel },
    currentSourcePath: sourcePath,
    issues: [],
    linkLists: new Map(),
    pathMap: new Map(),
    sharedDependencies: new Set(),
    sourceRoot: '/legacy',
    tableHeaders: new Map(),
  };
}

async function createSource(
  product: string,
  shared = false,
  sourceMetadata = metadata,
) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cn-product-label-'));
  tempDirs.push(root);
  const sourcePath = `docs/${product}/enable-service.mdx`;
  const oldPath = path.join(root, sourcePath);
  await mkdir(path.dirname(oldPath), { recursive: true });
  await writeFile(path.join(root, 'docs/_products_.meta.js'), sourceMetadata);
  const body = shared
    ? "import Shared from '../shared/enable.mdx';\n\n<Shared ag_product_label={frontMatter.ag_product_label} />"
    : '本文介绍如何开通{frontMatter.ag_product_label}服务。';
  if (shared) {
    await mkdir(path.join(root, 'docs/shared'), { recursive: true });
    await writeFile(
      path.join(root, 'docs/shared/enable.mdx'),
      '本文介绍如何开通{props.ag_product_label}服务。',
    );
  }
  await writeFile(oldPath, `---\ntitle: 开通服务\n---\n\n${body}\n`);
  return { root, oldPath, sourcePath, newPath: path.join(root, 'target.mdx') };
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe('legacy product display names', () => {
  it.each(products)(
    'expands %s from source display metadata',
    (product, label) => {
      const result = transformLegacyMdx(
        '本文介绍如何开通{frontMatter.ag_product_label}服务。\n\n产品标识：{frontMatter.ag_product}。',
        createState(product),
      );
      expect(result).toContain(`本文介绍如何开通${label}服务。`);
      expect(result).toContain(`产品标识：${product}。`);
    },
  );

  it.each(products)(
    'expands %s through shared props and audits the Chinese result',
    async (product, label) => {
      const fixture = await createSource(product, true);
      const result = await migrateLegacyPage({
        pathMap: new Map(),
        sourceRoot: fixture.root,
        sourcePath: fixture.sourcePath,
        targetPath: 'target.mdx',
      });
      expect(result.content).toContain(`本文介绍如何开通${label}服务。`);
      await writeFile(fixture.newPath, result.content);
      const audit = auditSingleDocContentFidelity({
        oldPath: fixture.oldPath,
        newPath: fixture.newPath,
        product,
        sourceRoot: fixture.root,
      });
      expect(audit.summary.unresolvedDifferences).toBe(0);
    },
  );

  it.each(products)(
    'rejects %s used as a display label during fidelity audit',
    async (product) => {
      const fixture = await createSource(product);
      await writeFile(
        fixture.newPath,
        `---\ntitle: 开通服务\n---\n\n本文介绍如何开通${product}服务。\n`,
      );
      const report = auditSingleDocContentFidelity({
        oldPath: fixture.oldPath,
        newPath: fixture.newPath,
        product,
        sourceRoot: fixture.root,
      });
      expect(report.summary.unresolvedDifferences).toBeGreaterThan(0);
    },
  );

  it('prefers current source metadata over the offline snapshot in migration and audit', async () => {
    const fixture = await createSource(
      'cloud-recording',
      false,
      metadata.replace('label: "云端录制"', 'label: "源配置录制名称"'),
    );
    const result = await migrateLegacyPage({
      pathMap: new Map(),
      sourceRoot: fixture.root,
      sourcePath: fixture.sourcePath,
      targetPath: 'target.mdx',
    });
    expect(result.content).toContain('本文介绍如何开通源配置录制名称服务。');
    await writeFile(fixture.newPath, result.content);
    const options = {
      oldPath: fixture.oldPath,
      newPath: fixture.newPath,
      product: 'cloud-recording',
      sourceRoot: fixture.root,
    };
    expect(
      auditSingleDocContentFidelity(options).summary.unresolvedDifferences,
    ).toBe(0);
    await writeFile(fixture.newPath, '本文介绍如何开通云端录制服务。');
    expect(
      auditSingleDocContentFidelity(options).summary.unresolvedDifferences,
    ).toBeGreaterThan(0);
  });

  it('supports a new product from source metadata without changing a hardcoded map', async () => {
    const fixture = await createSource(
      'new-product',
      true,
      "module.exports = [{ value: 'new-product', label: '新产品' }];",
    );
    const result = await migrateLegacyPage({
      pathMap: new Map(),
      sourceRoot: fixture.root,
      sourcePath: fixture.sourcePath,
      targetPath: 'target.mdx',
    });
    expect(result.content).toContain('本文介绍如何开通新产品服务。');
  });

  it('keeps explicitly supplied display names for API Center callers', () => {
    expect(
      transformLegacyMdx(
        '{frontMatter.ag_product_label}',
        createState('new-product', '明确的源名称'),
      ),
    ).toBe('明确的源名称');
  });

  it('fails instead of silently publishing an unknown product slug as a display name', () => {
    expect(() =>
      transformLegacyMdx(
        '{frontMatter.ag_product_label}',
        createState('new-product'),
      ),
    ).toThrow(/new-product/);
  });

  it('does not resolve display names when only a product identifier is needed', () => {
    expect(
      transformLegacyMdx(
        '标识：{frontMatter.ag_product}。',
        createState('new-product'),
      ),
    ).toBe('标识：new-product。');
  });

  it.each([
    ['art-class', '在线美术教学'],
    ['online-music-class', '在线音乐教学'],
  ])(
    'resolves the authoritative name of %s without changing deferred content',
    (product, label) => {
      expect(
        transformLegacyMdx(
          '{frontMatter.ag_product_label}',
          createState(product),
        ),
      ).toBe(label);
    },
  );
});

describe('approved Chinese product label content repairs', () => {
  it.each(manifest.documents)(
    'restores display names in $path',
    ({ path: file, replacements }) => {
      const content = readFileSync(path.resolve(file), 'utf8');
      for (const replacement of replacements) {
        if (
          file ===
          'content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/enable-service.mdx'
        ) {
          // The user removed this introduction, including its legacy placeholder.
          expect(content).not.toContain(replacement.before);
          expect(content).not.toContain(replacement.after);
        } else {
          // Preserve the historical repair fixture while checking the current
          // product name used by the published meeting documentation.
          const expected = file.startsWith(
            'content/docs/zh-CN/realtime-media/meeting/',
          )
            ? replacement.after.replaceAll('灵动会议', '智能云会议')
            : replacement.after;
          expect(content).toContain(expected);
        }
      }
    },
  );

  it.each(manifest.descriptions)(
    'fixes the RTMP Gateway description in $path',
    ({ path: file, after }) => {
      const content = readFileSync(path.resolve(file), 'utf8');
      expect(content).toContain(after);
      expect(content.match(/^description:.*$/m)?.[0]).not.toContain(
        '实时消息 RTM',
      );
    },
  );
});
