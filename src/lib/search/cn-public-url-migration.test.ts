import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportPublishedCnRecords } from './cn-records.server';
import { queryCnSearch } from './cn-search.server';
import { isPublicCnSearchUrl } from './cn-search-page';
import { buildCnSearchDocument } from './cn-search-strategy';
import {
  toCnContentSearchUrl,
  toCnPublicSearchUrl,
} from './cn-search-urls.mjs';
import type { SearchSection } from './kb-record';
import { parseSearchPageState } from './search-page-state';

afterEach(() => vi.restoreAllMocks());

describe('CN search public URL migration', () => {
  it('changes only the leading locale while preserving query and fragment', () => {
    const original = '/zh-CN/realtime-media/rtc?from=/zh-CN/example#生成-token';
    const publicUrl = '/realtime-media/rtc?from=/zh-CN/example#生成-token';
    expect(toCnPublicSearchUrl(original)).toBe(publicUrl);
    expect(toCnContentSearchUrl(publicUrl)).toBe(original);
    expect(toCnPublicSearchUrl(publicUrl)).toBe(publicUrl);
  });

  it.each(['/zh-CN', ''])(
    'exports public platform and canonical links from %s build paths',
    async (prefix) => {
      const canonical = `${prefix}/realtime-media/rtc/build/token-authentication`;
      const records = await exportPublishedCnRecords({
        pages: [{ url: canonical, title: '使用 Token 鉴权' }],
        routes: ['android', 'ios'].map((platform) => ({
          canonicalPath: canonical,
          url: `${canonical}/${platform}`,
          markdownPath: `/zh-CN/realtime-media/rtc/build/token-authentication/${platform}.md`,
          platform: platform as 'android' | 'ios',
          defaultPlatform: 'ios',
        })),
        readMarkdown: async () =>
          '# 使用 Token 鉴权\n\n## 生成 Token [#token]\n\n说明。',
        readRenderedHtml: async () => '<h2 id="token">生成 Token</h2>',
      });
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject({
        url: '/realtime-media/rtc/build/token-authentication/android#token',
        canonicalUrl: '/realtime-media/rtc/build/token-authentication',
        locale: 'zh-CN',
        tab: 'realtime-media',
        product: 'rtc',
        availablePlatforms: ['android', 'ios'],
        defaultPlatform: 'ios',
        isDefaultPlatform: false,
      });
      expect(records[1]).toMatchObject({
        url: '/realtime-media/rtc/build/token-authentication/ios#token',
        isDefaultPlatform: true,
      });
    },
  );

  it.each([
    '/realtime-media/rtc/build/token-authentication/ios?platform=ios#token',
    '/reference/faq/integration/return_404',
    '/api-reference/api-ref/cloud-recording/acquire',
  ])('accepts published CN result URL %s', (url) => {
    expect(isPublicCnSearchUrl(url)).toBe(true);
  });

  it.each([
    '/api/health',
    '/__static/docs.json',
    '/en/introduction',
    '//evil.example/ai',
    '/realtime-media/../api/health',
    '/realtime-media/%2e%2e/api/health',
    '/realtime-media/%5cevil',
    '/realtime-media/a\n',
    '/zh-CN/../api/health',
  ])('rejects unsafe or non-document URL %s', (url) => {
    expect(isPublicCnSearchUrl(url)).toBe(false);
  });

  it('retains API name tokens and product-entry ranking after changing only the URL', () => {
    const record: SearchSection = {
      id: 'api',
      url: '/api-reference/rtc/web/api#removehandler',
      canonicalUrl: '/api-reference/rtc/web/api',
      pageTitle: 'RTC API',
      sectionTitle: 'removeHandler',
      content: '调用 removeHandler',
      headingPath: ['RTC API', 'removeHandler'],
      locale: 'zh-CN',
      product: 'rtc',
      platform: ['web'],
      docType: 'docs',
      audience: ['developer'],
      status: 'published',
      hidden: false,
    };
    expect(buildCnSearchDocument(record)).toMatchObject({
      nameSplit: 'remove Handler',
      groupNameSplit: 'RTC API',
      entrySeq: 3,
    });
    expect(
      buildCnSearchDocument({
        ...record,
        url: '/realtime-media/rtc',
        pageTitle: '实时互动概览',
        sectionTitle: '实时互动概览',
      }),
    ).toMatchObject({ entrySeq: 0, entryTitle: ['实时互动'] });
  });

  it.each([undefined, 'ios'])(
    'returns unprefixed result links for platform=%s',
    async (platform) => {
      const url = '/realtime-media/rtc/build/token-authentication/ios#token';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          hits: [
            {
              id: 'ios',
              url,
              canonicalUrl: '/realtime-media/rtc/build/token-authentication',
              pageTitle: '使用 Token 鉴权',
              sectionTitle: '生成 Token',
              content: '说明',
              headingPath: ['使用 Token 鉴权', '生成 Token'],
              locale: 'zh-CN',
              product: 'rtc',
              platform: ['ios'],
              availablePlatforms: ['android', 'ios'],
              docType: 'docs',
              audience: ['developer'],
              status: 'published',
              hidden: false,
            },
          ],
          totalHits: 1,
          totalPages: 1,
          page: 1,
        }),
      );
      const result = await queryCnSearch(
        {
          host: 'http://search.test',
          indexUid: 'docs_cn',
          searchOnlyKey: 'search',
        },
        parseSearchPageState({ q: 'Token', platform, type: 'docs' }),
      );
      expect(result.groups).toHaveLength(1);
      expect(result.groups[0].pageUrl).toBe(
        '/realtime-media/rtc/build/token-authentication/ios',
      );
      expect(result.groups[0].sections[0].url).toBe(url);
    },
  );
});
