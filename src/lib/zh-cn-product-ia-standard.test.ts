import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';
import {
  resolveZhCnProductIaRedirect,
  ZH_CN_PRODUCT_IA_REDIRECTS,
} from './zh-cn-product-ia-redirects';

type DocsMeta = {
  pages?: string[];
  sidebarIndexTitle?: string;
  title?: string;
};

const speechToTextRoot = resolve(
  process.cwd(),
  'content/docs/zh-CN/realtime-media/speech-to-text',
);
const contentRoot = resolve(process.cwd(), 'content/docs/zh-CN');
const standardFirstLevelPages = ['index', 'get-started', 'build', 'reference'];
const standardFirstLevelPageSet = new Set(standardFirstLevelPages);
const allowedProductFamilyEntries: Record<string, Set<string>> = {
  'realtime-media/whiteboard': new Set(['whiteboard-sdk', 'fastboard-sdk']),
};

function readMeta(path: string): DocsMeta {
  return JSON.parse(readFileSync(path, 'utf8')) as DocsMeta;
}

function stripPagePrefix(page: string) {
  return page.replace(/^[!.-]+/, '');
}

function getFirstLevelPage(page: string) {
  return stripPagePrefix(page).split('/')[0];
}

function pageExistsAtRelativePath(productRoot: string, page: string) {
  const relativePath = resolve(contentRoot, productRoot, stripPagePrefix(page));
  const candidates = [
    `${relativePath}.mdx`,
    `${relativePath}.md`,
    resolve(relativePath, 'index.mdx'),
    resolve(relativePath, 'index.md'),
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

function parseZhCnDocsUrl(url: string) {
  const [pathname] = url.split(/[?#]/, 1);
  const parts = pathname.replace(/^\/zh-CN\//, '').split('/');
  const [tab, ...slugSegments] = parts;

  return { slugSegments, tab };
}

function getContentPagePathForUrl(url: string) {
  const { slugSegments, tab } = parseZhCnDocsUrl(url);
  const relativePath = resolve(contentRoot, tab, ...slugSegments);
  const candidates = [
    `${relativePath}.mdx`,
    `${relativePath}.md`,
    resolve(relativePath, 'index.mdx'),
    resolve(relativePath, 'index.md'),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function getRedirectTargetProductRoots() {
  const roots = new Set<string>();

  for (const redirectUrl of Object.values(ZH_CN_PRODUCT_IA_REDIRECTS)) {
    const { slugSegments, tab } = parseZhCnDocsUrl(redirectUrl);

    if (tab !== 'realtime-media' && tab !== 'solutions') {
      continue;
    }

    const standardEntryIndex = slugSegments.findIndex((segment) =>
      standardFirstLevelPageSet.has(segment),
    );
    const productRootSegments =
      standardEntryIndex === -1
        ? slugSegments
        : slugSegments.slice(0, standardEntryIndex);

    roots.add([tab, ...productRootSegments].join('/'));
  }

  return [...roots].sort();
}

describe('zh-CN product IA standard', () => {
  it('uses standard root entries for speech-to-text', () => {
    const meta = readMeta(resolve(speechToTextRoot, 'meta.json'));

    expect(meta.title).toBe('实时转录翻译');
    expect(meta.sidebarIndexTitle).toBe('实时转录翻译概览');
    expect(meta.pages).toEqual([
      'index',
      'get-started/quick-start',
      'build',
      'reference',
    ]);
  });

  it('uses Chinese titles for the standard speech-to-text groups', () => {
    expect(
      readMeta(resolve(speechToTextRoot, 'get-started/meta.json')),
    ).toEqual({
      pages: ['quick-start'],
      title: '快速开始',
    });
    expect(
      readMeta(resolve(speechToTextRoot, 'build/meta.json')),
    ).toMatchObject({
      title: '构建功能',
    });
    expect(
      readMeta(resolve(speechToTextRoot, 'reference/meta.json')),
    ).toMatchObject({
      title: '参考',
    });
  });

  it('removes legacy speech-to-text top-level grouping folders', () => {
    for (const legacyFolder of [
      'overview',
      'user-guides',
      'best-practices',
      'api',
      'webhook',
    ]) {
      expect(existsSync(resolve(speechToTextRoot, legacyFolder))).toBe(false);
    }
  });

  it.each([
    [['overview', 'product-overview'], '/zh-CN/realtime-media/speech-to-text'],
    [
      ['get-started', 'enable-service'],
      '/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service',
    ],
    [
      ['user-guides', 'record-captions'],
      '/zh-CN/realtime-media/speech-to-text/build/process-transcription-data/record-captions',
    ],
    [
      ['best-practices', 'optimize-quality'],
      '/zh-CN/realtime-media/speech-to-text/build/extend-and-optimize/optimize-quality',
    ],
    [
      ['api', 'supported-languages'],
      '/zh-CN/realtime-media/speech-to-text/reference/supported-languages',
    ],
    [
      ['webhook', 'ncs-events'],
      '/zh-CN/realtime-media/speech-to-text/reference/ncs-events',
    ],
  ] as const)('redirects old speech-to-text path %j', async (slugSegments, redirectUrl) => {
    const result = await loadDocsPagePayload('zh-CN', 'realtime-media', [
      'speech-to-text',
      ...slugSegments,
    ]);

    expect(result).toEqual({ redirectUrl });
  });

  it.each([
    [
      'realtime-media',
      ['rtc', 'basic-features', 'join-leave-channel'],
      '/zh-CN/realtime-media/rtc/build/channel-and-connection/join-leave-channel',
    ],
    [
      'realtime-media',
      ['rtm', 'user-guide', 'message', 'send-message'],
      '/zh-CN/realtime-media/rtm/build/manage-messages/send-message',
    ],
    [
      'realtime-media',
      [
        'recording',
        'cloud-recording',
        'user-guides',
        'manage-file',
        'playback',
      ],
      '/zh-CN/realtime-media/cloud-recording/build/manage-recorded-files/playback',
    ],
    [
      'solutions',
      ['smart-doorbell', 'paas', 'overview', 'paas-overview'],
      '/zh-CN/solutions/smart-doorbell/build/paas/paas-overview',
    ],
    [
      'solutions',
      ['smart-doorbell', 'product-overview'],
      '/zh-CN/solutions/smart-doorbell',
    ],
  ] as const)('redirects representative old %s path %j', async (tab, slugSegments, redirectUrl) => {
    const result = await loadDocsPagePayload('zh-CN', tab, [...slugSegments]);

    expect(result).toEqual({ redirectUrl });
  });

  it('serves canonical speech-to-text build and reference pages', async () => {
    const buildResult = await loadDocsPagePayload('zh-CN', 'realtime-media', [
      'speech-to-text',
      'build',
      'process-transcription-data',
      'record-captions',
    ]);
    const referenceResult = await loadDocsPagePayload(
      'zh-CN',
      'realtime-media',
      ['speech-to-text', 'reference', 'supported-languages'],
    );

    expect(buildResult).toBeTruthy();
    expect(referenceResult).toBeTruthy();
    expect(buildResult).not.toHaveProperty('redirectUrl');
    expect(referenceResult).not.toHaveProperty('redirectUrl');
  }, 30_000);

  it('keeps every zh-CN product IA redirect source and target routable', () => {
    const failures: string[] = [];

    for (const [sourcePath, redirectUrl] of Object.entries(
      ZH_CN_PRODUCT_IA_REDIRECTS,
    )) {
      const [sourceTab, ...sourceSlugSegments] = sourcePath.split('/');
      const resolvedRedirect = resolveZhCnProductIaRedirect(
        'zh-CN',
        sourceTab,
        sourceSlugSegments,
      );
      const targetPath = getContentPagePathForUrl(redirectUrl);

      if (resolvedRedirect !== redirectUrl) {
        failures.push(
          `${sourcePath} expected redirect to ${redirectUrl}, got ${resolvedRedirect}`,
        );
      }

      if (!targetPath) {
        failures.push(
          `${sourcePath} redirects to missing target ${redirectUrl}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });

  it('uses only standard first-level entries or direct page leaves in migrated product roots', () => {
    const failures: string[] = [];

    for (const productRoot of getRedirectTargetProductRoots()) {
      const absoluteRoot = resolve(contentRoot, productRoot);
      const meta = readMeta(resolve(absoluteRoot, 'meta.json'));
      const pages = (meta.pages ?? []).map(stripPagePrefix);
      const allowedFamilyEntries =
        allowedProductFamilyEntries[productRoot] ?? new Set<string>();
      const disallowedPages = pages.filter(
        (page) =>
          !standardFirstLevelPageSet.has(getFirstLevelPage(page)) &&
          !allowedFamilyEntries.has(getFirstLevelPage(page)),
      );
      const missingFlattenedLeaves = pages.filter(
        (page) =>
          page.includes('/') && !pageExistsAtRelativePath(productRoot, page),
      );
      const extraTopLevelMarkdownFiles = readdirSync(absoluteRoot, {
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => /\.mdx?$/.test(name) && !/^index\.mdx?$/.test(name));

      if (disallowedPages.length > 0) {
        failures.push(
          `${productRoot} has non-standard first-level pages: ${disallowedPages.join(
            ', ',
          )}`,
        );
      }

      if (missingFlattenedLeaves.length > 0) {
        failures.push(
          `${productRoot} has flattened page leaves that do not resolve: ${missingFlattenedLeaves.join(
            ', ',
          )}`,
        );
      }

      if (extraTopLevelMarkdownFiles.length > 0) {
        failures.push(
          `${productRoot} has extra top-level markdown files: ${extraTopLevelMarkdownFiles.join(
            ', ',
          )}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });
});
