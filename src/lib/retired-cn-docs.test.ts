import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isNotFound } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import {
  zhCnFaqItems,
  zhCnFaqProducts,
} from '../components/faq/faq-data.zh-cn';
import { zhCNApiReferenceCards } from './api-reference-cards-data.zh-cn';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import { loadDocsPagePayload } from './docs-page.server';
import { getOpenApiLanes, resolveOpenApiEndpointRoute } from './openapi/lanes';
import { getContentDocsPrerenderPaths } from './prerender-content-routes';
import { isRetiredCnDocsPath } from './retired-cn-docs.mjs';
import { isPublicCnSearchUrl } from './search/cn-search-urls.mjs';
import { source } from './source.server';

const retiredPaths = [
  '/zh-CN/realtime-media/fusion-cdn',
  '/zh-CN/realtime-media/fusion-cdn/build/enable-service',
  '/zh-CN/api-reference/fusion-cdn/restful/api/reference',
  '/zh-CN/api-reference/api-ref/fusion-cdn/domain-list',
  '/zh-CN/realtime-media/usage-analytics/build/view-live-data',
];

describe('retired Chinese Fusion CDN documentation', () => {
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
      zhCNApiReferenceCards.all.some(
        (entry) => entry.productId === 'fusion-cdn',
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
    expect(isRetiredCnDocsPath('/zh-CN/realtime-media/fusion-cdn-other')).toBe(
      false,
    );
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
