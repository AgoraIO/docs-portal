import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isNotFound } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { zhCNSdkDownloadPlatforms } from '../components/docs-overview/sdk-downloads-data.zh-cn';
import {
  zhCnFaqItems,
  zhCnFaqProducts,
} from '../components/faq/faq-data.zh-cn';
import { zhCNApiReferenceCards } from './api-reference-cards-data.zh-cn';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import { loadDocsPagePayload } from './docs-page.server';
import { getOpenApiLanes, resolveOpenApiEndpointRoute } from './openapi/lanes';
import { getContentDocsPrerenderPaths } from './prerender-content-routes';
import { isRetiredCnDocsPath, retiredCnDocPages } from './retired-cn-docs.mjs';
import { isPublicCnSearchUrl } from './search/cn-search-urls.mjs';
import { getLLMText, source } from './source.server';

const retiredPaths = [
  '/zh-CN/realtime-media/fusion-cdn',
  '/zh-CN/realtime-media/fusion-cdn/build/enable-service',
  '/zh-CN/api-reference/fusion-cdn/restful/api/reference',
  '/zh-CN/api-reference/api-ref/fusion-cdn/domain-list',
  '/zh-CN/realtime-media/usage-analytics/build/view-live-data',
  '/zh-CN/solutions/flexible-classroom',
  '/zh-CN/realtime-media/sdk-extensions',
  '/zh-CN/realtime-media/sdk-extensions/metakit',
  '/zh-CN/realtime-media/sdk-extensions/metakit/reference/api-ref',
  '/zh-CN/realtime-media/sdk-extensions/metakit/reference/downloads',
  '/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/face',
  '/zh-CN/realtime-media/sdk-extensions/portrait-rhythm',
  '/zh-CN/realtime-media/sdk-extensions/portrait-rhythm/downloads',
  '/zh-CN/realtime-media/sdk-extensions/portrait-rhythm/build/implement-core-features/key-value',
  '/zh-CN/realtime-media/sdk-extensions/portrait-rhythm/overview',
  '/zh-CN/solutions/flexible-classroom/get-started/integrate-new',
  '/zh-CN/solutions/flexible-classroom/reference/downloads/web',
  '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  '/zh-CN/api-reference/flexible-classroom/web/api-reference/classroom-sdk',
  '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/classes/agora-edu-core-src-configs-index-du-classroom-config',
  ...retiredCnDocPages.map((page) => `/${page}`),
];

describe('retired Chinese product documentation', () => {
  it.each([
    ['introduction'],
    ['realtime-media', 'overview'],
    ['realtime-media', 'rtc', 'build', 'extensions', 'face-capture'],
  ])(
    'omits retired plugin recommendations from %s Markdown',
    async (...slugs) => {
      const page = source.getPage(slugs, 'zh-CN');
      expect(page).toBeDefined();
      if (!page) throw new Error('Missing active page');
      const markdown = await getLLMText(page);
      expect(markdown).not.toMatch(
        /sdk-extensions|MetaKit|摄像头律动|人像节奏/,
      );
    },
  );

  it('retains plugin sources and keeps English plugin documentation available', () => {
    for (const path of [
      'sdk-extensions/index.mdx',
      'sdk-extensions/metakit/index.mdx',
      'sdk-extensions/metakit/reference/api-ref.mdx',
      'sdk-extensions/metakit/reference/downloads.mdx',
      'sdk-extensions/portrait-rhythm/index.mdx',
      'sdk-extensions/portrait-rhythm/downloads.mdx',
    ]) {
      expect(existsSync(`content/docs/zh-CN/realtime-media/${path}`)).toBe(
        true,
      );
    }
    expect(
      source.getPage(
        [
          'realtime-media',
          'marketplace',
          'build',
          'add-video-and-ar-effects',
          'metakit',
        ],
        'en',
      ),
    ).toBeDefined();
    expect(JSON.stringify(source.getPageTree('zh-CN'))).not.toMatch(
      /sdk-extensions/,
    );
    expect(
      isRetiredCnDocsPath('/zh-CN/realtime-media/sdk-extensions-other'),
    ).toBe(false);
  });
  it.each([
    ['solutions', 'overview'],
    ['solutions', 'one-to-one-classroom'],
    ['solutions', 'small-classroom'],
    ['solutions', 'online-music-class'],
    ['solutions', 'digital-learning', 'course-resource'],
    ['solutions', 'digital-learning', 'school-resource'],
    ['solutions', 'art-class', 'build', 'enable-service'],
    ['realtime-media', 'speech-to-text'],
    ['realtime-media', 'whiteboard'],
  ])(
    'keeps active %s pages free of classroom recommendations in public Markdown',
    async (...slugs) => {
      const page = source.getPage(slugs, 'zh-CN');
      expect(page).toBeDefined();
      if (!page) throw new Error('Missing independent product page');
      const markdown = await getLLMText(page);
      expect(markdown).not.toContain('flexible-classroom');
      expect(markdown).not.toContain('灵动课堂');
      expect(markdown).not.toMatch(/apaas/i);
    },
  );
  it.each([
    ['realtime-media', 'overview'],
    ['api-reference', 'overview'],
    ['solutions', 'digital-learning', 'course-resource'],
    ['solutions', 'digital-learning', 'school-resource'],
  ])(
    'omits hidden source sections from public Markdown for %s',
    async (...slugs) => {
      const page = source.getPage(slugs, 'zh-CN');
      expect(page).toBeDefined();
      if (!page) throw new Error('Missing active overview');
      const markdown = await getLLMText(page);
      expect(markdown).not.toContain('fusion-cdn');
      expect(markdown).not.toContain('融合 CDN');
    },
  );
  it.each(retiredPaths)('stops serving %s and its Markdown', async (url) => {
    const [locale, tab, ...slugSegments] = url.split('/').filter(Boolean);
    expect(source.getPage([tab, ...slugSegments], locale)).toBeUndefined();
    expect(await loadDocsPagePayload(locale, tab, slugSegments)).toBeNull();
    const markdownSegments = [...slugSegments];
    markdownSegments[markdownSegments.length - 1] += '.md';
    await expect(
      getPublicDocsMarkdownResponse({
        locale,
        tab,
        slugSegments: markdownSegments,
      }),
    ).rejects.toSatisfy(isNotFound);
  });

  it('excludes retired content from source, navigation, API catalog and prerendering', () => {
    expect(
      source.getPages('zh-CN').some((page) => isRetiredCnDocsPath(page.url)),
    ).toBe(false);
    expect(JSON.stringify(source.getPageTree('zh-CN'))).not.toContain(
      'fusion-cdn',
    );
    expect(JSON.stringify(source.getPageTree('zh-CN'))).not.toContain(
      'view-live-data',
    );
    expect(
      JSON.stringify(source.getPageTree('zh-CN')).match(
        /.{0,70}flexible-classroom.{0,100}/g,
      ) ?? [],
    ).toEqual([]);
    expect(
      zhCNApiReferenceCards.all.some((entry) =>
        ['fusion-cdn', 'flexible-classroom'].includes(entry.productId),
      ),
    ).toBe(false);
    expect(
      getOpenApiLanes().some((lane) => lane.id === 'fusion-cdn-rest'),
    ).toBe(false);
    expect(
      resolveOpenApiEndpointRoute('zh-CN', 'api-reference', [
        'api-ref',
        'fusion-cdn',
        'domain-list',
      ]),
    ).toBeNull();
    expect(getContentDocsPrerenderPaths().some(isRetiredCnDocsPath)).toBe(
      false,
    );
  });

  it('rejects old search URLs even if the external index still returns them', () => {
    for (const url of retiredPaths) {
      expect(isPublicCnSearchUrl(url)).toBe(false);
      expect(isPublicCnSearchUrl(url.replace('/zh-CN', ''))).toBe(false);
    }
    expect(isPublicCnSearchUrl('/realtime-media/rtc')).toBe(true);
    expect(zhCnFaqProducts).not.toContain('融合 CDN');
    expect(zhCnFaqItems.flatMap((item) => item.products)).not.toContain(
      '融合 CDN',
    );
    expect(zhCnFaqProducts).not.toContain('灵动课堂');
    expect(zhCnFaqItems.flatMap((item) => item.products)).not.toContain(
      '灵动课堂',
    );
    expect(zhCnFaqItems.some((item) => isRetiredCnDocsPath(item.href))).toBe(
      false,
    );
    expect(
      zhCnFaqItems.find((item) => item.href.endsWith('/dynamic_storage_path'))
        ?.products,
    ).toContain('声网会议');
    expect(
      zhCnFaqItems.find((item) =>
        item.href.endsWith('/restful_api_call_frequency'),
      )?.products,
    ).toContain('实时互动');
  });

  it('keeps unrelated products and English pages available', () => {
    expect(source.getPage(['realtime-media', 'rtc'], 'zh-CN')).toBeDefined();
    expect(
      source.getPage(['realtime-media', 'media-push'], 'zh-CN'),
    ).toBeDefined();
    expect(source.getPage(['ai'], 'en')).toBeDefined();
    expect(isRetiredCnDocsPath('/en/realtime-media/fusion-cdn')).toBe(false);
    expect(
      source
        .getPages('en')
        .some((page) => page.url.includes('/flexible-classroom/')),
    ).toBe(true);
    expect(
      JSON.stringify(source.getPageTree('en')).includes(
        '/en/realtime-media/flexible-classroom',
      ),
    ).toBe(true);
    expect(
      source.getPage(['solutions', 'one-to-one-classroom'], 'zh-CN'),
    ).toBeDefined();
    expect(
      source.getPage(['solutions', 'small-classroom'], 'zh-CN'),
    ).toBeDefined();
    expect(isRetiredCnDocsPath('/zh-CN/realtime-media/fusion-cdn-other')).toBe(
      false,
    );
  });

  it('hides the classroom SDK family while retaining its source records', () => {
    expect(
      retiredCnDocPages.every((page) => existsSync(`content/docs/${page}.mdx`)),
    ).toBe(true);
    const products = zhCNSdkDownloadPlatforms.flatMap((platform) => [
      ...platform.core,
      ...(platform.addOns ?? []),
    ]);
    expect(
      products.some((product) =>
        /^(flexible-classroom|cloud-scene|proctor)-sdk-/.test(product.id),
      ),
    ).toBe(false);
    expect(products.some((product) => product.id === 'video-sdk-android')).toBe(
      true,
    );
    const source = readFileSync(
      'src/components/docs-overview/sdk-downloads-data.zh-cn.ts',
      'utf8',
    );
    expect(source).toContain("id: 'flexible-classroom-sdk-web'");
    expect(source).toContain("id: 'cloud-scene-sdk-web'");
    expect(source).toContain("id: 'proctor-sdk-web'");
    expect(
      existsSync('content/docs/zh-CN/solutions/flexible-classroom/index.mdx'),
    ).toBe(true);
    expect(
      existsSync(
        'content/docs/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom.mdx',
      ),
    ).toBe(true);
  });

  it('retains source files but omits retired public OpenAPI assets', () => {
    execFileSync(process.execPath, ['scripts/sync-openapi-assets.mjs']);
    expect(existsSync('content/openapi/fusion-cdn/streaming.zh-CN.yaml')).toBe(
      true,
    );
    expect(
      existsSync('content/docs/zh-CN/realtime-media/fusion-cdn/index.mdx'),
    ).toBe(true);
    expect(
      existsSync(
        'content/docs/zh-CN/realtime-media/usage-analytics/build/view-live-data.mdx',
      ),
    ).toBe(true);
    expect(existsSync('public/openapi/fusion-cdn/streaming.zh-CN.yaml')).toBe(
      false,
    );
    expect(
      existsSync('public/openapi/cloud-recording/cloud-recording.zh-CN.yaml'),
    ).toBe(true);
  });

  it('returns HTTP 404 before the hosting fallback for retired paths', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const rule = config.routes[0];
    expect(rule).toMatchObject({ dest: '/404.html', status: 404 });
    const matcher = new RegExp(rule.src);
    for (const url of retiredPaths) {
      expect(matcher.test(url)).toBe(true);
      expect(matcher.test(`${url}.md`)).toBe(true);
      expect(matcher.test(url.replace('/zh-CN', ''))).toBe(true);
    }
    expect(matcher.test('/openapi/fusion-cdn/streaming.zh-CN.yaml')).toBe(true);
    expect(matcher.test('/en/realtime-media/fusion-cdn')).toBe(false);
    expect(matcher.test('/zh-CN/realtime-media/media-push')).toBe(false);
  });
});
