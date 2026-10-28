import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryCnSearch } from './cn-search.server';
import {
  cleanSearchSnippet,
  groupSearchSections,
  isPublicCnSearchUrl,
  mergeSearchPageGroups,
  searchCnDocsPage,
} from './cn-search-page';
import { buildCnSearchDocument } from './cn-search-strategy';
import { parseSearchPageState } from './search-page-state';

const config = {
  host: 'http://127.0.0.1:7700/',
  indexUid: 'cn-kb-demo-v1',
  searchOnlyKey: 'public-search-only',
};
const hit = {
  id: 'one',
  sourceId: 'one',
  url: '/zh-CN/api-reference/conversational-ai/web/api#token',
  pageTitle: 'API 参考',
  sectionTitle: 'Token',
  content: '调用 Token',
  snippet: '调用 Token',
  headingPath: ['API 参考', 'Token'],
  audience: ['developer'],
  highlights: {
    sectionTitle: [{ text: 'Token', highlighted: true }],
    content: [{ text: '调用 Token', highlighted: false }],
  },
  locale: 'zh-CN',
  product: 'conversational-ai',
  platform: ['web'],
  version: '4.6.0',
  docType: 'docs' as const,
  status: 'published' as const,
  hidden: false,
};
afterEach(() => vi.restoreAllMocks());

describe('full CN search adapter', () => {
  it('returns a product-document preview before API matches from the legacy-style overview', async () => {
    const guide = {
      ...hit,
      id: 'guide',
      url: '/realtime-media/rtc/build/video/advanced-beauty/android',
      pageTitle: '高级美颜',
      sectionTitle: '高级美颜',
      product: 'rtc',
      tab: 'realtime-media',
    };
    const api = {
      ...hit,
      id: 'api',
      url: '/api-reference/rtc/android/video#beauty',
      pageTitle: '视频增强',
      sectionTitle: 'setBeautyEffectOptions',
      product: 'rtc',
      tab: 'api-reference',
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        results: [
          {
            hits: [guide],
            totalHits: 1,
            totalPages: 1,
            page: 1,
            facetDistribution: { products: { rtc: 1 } },
          },
          {
            hits: [api],
            totalHits: 1,
            totalPages: 1,
            page: 1,
            facetDistribution: { products: { rtc: 1 } },
          },
          {
            hits: [
              {
                ...hit,
                id: 'faq',
                url: '/reference/faq/integration/set_log_file',
                pageTitle: '如何设置日志文件？',
                sectionTitle: '设置日志文件',
              },
            ],
            totalHits: 1,
            totalPages: 1,
            page: 1,
          },
        ],
      }),
    );
    const result = await queryCnSearch(
      config,
      parseSearchPageState({ q: '高级美颜' }),
    );
    expect(result.groups.map((group) => group.title)).toEqual([
      '高级美颜',
      '视频增强',
      '如何设置日志文件？',
    ]);
    expect(result.totalHits).toBe(3);
    expect(result.familyTotalHits).toEqual({ docs: 1, api: 1, faq: 1 });
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:7700/multi-search');
    const { queries } = JSON.parse(request?.body as string);
    expect(queries[0].filter).toContain('searchFamily = "docs"');
    expect(queries[1].filter).toContain('searchFamily = "api"');
    expect(queries[2].filter).toContain('searchFamily = "faq"');
    expect(
      queries.every(
        (query: { filter: string }) => !query.filter.includes('version ='),
      ),
    ).toBe(true);
  });
  it('hides retired documents and product facets returned by an older search service', async () => {
    const groups = groupSearchSections([
      hit,
      {
        ...hit,
        id: 'retired',
        url: '/realtime-media/fusion-cdn/build/enable-service',
        product: 'fusion-cdn',
      },
      {
        ...hit,
        id: 'analytics',
        url: '/realtime-media/usage-analytics/build/view-live-data',
        product: 'analytics',
      },
    ]);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        groups,
        totalHits: 3,
        totalPages: 1,
        page: 1,
        facets: {
          product: { 'conversational-ai': 1, 'fusion-cdn': 1, analytics: 1 },
        },
      }),
    );
    const result = await searchCnDocsPage(parseSearchPageState({ q: 'CDN' }));
    expect(result.groups.map((group) => group.pageUrl)).toEqual([
      hit.url.split('#')[0],
    ]);
    expect(result.facets.product).not.toHaveProperty('fusion-cdn');
  });
  it('deduplicates platform copies of a canonical chapter within and across pages', () => {
    const canonicalUrl = '/zh-CN/realtime-media/rtc/build/token-authentication';
    const android = {
      ...hit,
      canonicalUrl,
      url: `${canonicalUrl}/android#token`,
    };
    const ios = { ...hit, canonicalUrl, url: `${canonicalUrl}/ios#token` };
    const groups = groupSearchSections([android, ios]);
    expect(groups).toHaveLength(1);
    expect(groups[0].sections).toHaveLength(1);
    expect(
      mergeSearchPageGroups([
        groupSearchSections([android]),
        groupSearchSections([ios]),
      ])[0].sections,
    ).toHaveLength(1);
  });

  it.each([undefined, 'ios'])(
    'filters platform copies before engine pagination (platform=%s)',
    async (platform) => {
      const request = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          Response.json({ hits: [], totalHits: 0, totalPages: 0, page: 1 }),
        );
      await queryCnSearch(
        config,
        parseSearchPageState({ q: 'Token', platform, type: 'api' }),
      );
      const body = JSON.parse(request.mock.calls[0][1]?.body as string);
      if (platform) {
        expect(body.filter).toContain('platform = "ios"');
        expect(body.filter).not.toContain('isDefaultPlatform');
      } else {
        expect(body.filter).toContain('isDefaultPlatform = true');
      }
    },
  );
  it('groups platform variants under the canonical document when no platform is selected', () => {
    const groups = groupSearchSections([
      {
        ...hit,
        id: 'android',
        url: `${hit.url.replace('/web/', '/android/')}`,
        canonicalUrl: '/zh-CN/api-reference/conversational-ai/api',
        platform: ['android'],
        availablePlatforms: ['android', 'ios', 'web'],
      },
      {
        ...hit,
        id: 'ios',
        url: `${hit.url.replace('/web/', '/ios/')}`,
        canonicalUrl: '/zh-CN/api-reference/conversational-ai/api',
        platform: ['ios'],
        availablePlatforms: ['android', 'ios', 'web'],
      },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      pageUrl: '/zh-CN/api-reference/conversational-ai/api',
      platform: ['android', 'ios', 'web'],
    });
  });

  it('keeps platform URLs when a platform filter is selected', () => {
    const groups = groupSearchSections(
      [
        {
          ...hit,
          url: '/zh-CN/api-reference/conversational-ai/android/api#token',
          canonicalUrl: '/zh-CN/api-reference/conversational-ai/api',
          platform: ['android'],
          availablePlatforms: ['android', 'ios', 'web'],
        },
      ],
      { platformFiltered: true },
    );

    expect(groups[0]).toMatchObject({
      pageUrl: '/zh-CN/api-reference/conversational-ai/android/api',
      platform: ['android'],
    });
  });

  it('shows only the selected platform when a legacy hit lists several platforms', () => {
    const groups = groupSearchSections(
      [
        {
          ...hit,
          url: '/zh-CN/api-reference/conversational-ai/android/api#token',
          canonicalUrl: '/zh-CN/api-reference/conversational-ai/api',
          platform: ['android', 'ios', 'web'],
          availablePlatforms: ['android', 'ios', 'web'],
        },
      ],
      { platformFiltered: true, selectedPlatform: 'android' },
    );

    expect(groups[0].platform).toEqual(['android']);
  });

  it('merges the same canonical document across loaded pages', async () => {
    const { mergeSearchPageGroups } = await import('./cn-search-page');
    const first = groupSearchSections([
      {
        ...hit,
        id: 'android',
        url: '/zh-CN/api-reference/conversational-ai/android/api#token',
        canonicalUrl: '/zh-CN/api-reference/conversational-ai/api',
        platform: ['android'],
        availablePlatforms: ['android', 'ios'],
      },
    ]);
    const second = groupSearchSections([
      {
        ...hit,
        id: 'ios',
        url: '/zh-CN/api-reference/conversational-ai/ios/api#token',
        canonicalUrl: '/zh-CN/api-reference/conversational-ai/api',
        platform: ['ios'],
        availablePlatforms: ['android', 'ios'],
      },
    ]);

    expect(mergeSearchPageGroups([first, second])).toHaveLength(1);
  });

  it('uses the primary product when an old record has an empty product list', () => {
    const document = buildCnSearchDocument({
      id: 'reference',
      url: '/zh-CN/reference/faq/account/billing_account',
      canonicalUrl: '/zh-CN/reference/faq/account/billing_account',
      pageTitle: '账单、结算与账户冻结',
      sectionTitle: '账单、结算与账户冻结',
      content: 'FAQ 正文。',
      headingPath: ['账单、结算与账户冻结'],
      product: 'reference',
      products: [],
      locale: 'zh-CN',
      docType: 'docs',
      audience: ['developer'],
      status: 'published',
      hidden: false,
    });

    expect(document).toMatchObject({
      product: 'reference',
      products: ['reference'],
    });
  });

  it('preserves an explicit primary product when legacy memberships are reordered', () => {
    const document = buildCnSearchDocument({
      id: 'faq',
      url: '/zh-CN/reference/faq/account/billing_basis',
      pageTitle: '计时方式',
      sectionTitle: '计时方式',
      content: 'FAQ 正文。',
      headingPath: ['计时方式'],
      product: 'rtc',
      products: ['analytics', 'rtc'],
      locale: 'zh-CN',
      docType: 'docs',
      audience: ['developer'],
      status: 'published',
      hidden: false,
    });

    expect(document.product).toBe('rtc');
  });

  it('removes table separators and generated OpenAPI metadata without losing highlights', () => {
    expect(
      cleanSearchSnippet(
        '| name | 描述 |\n| --- | --- |\n| <mark>Token</mark> | 有效期 |',
      ),
    ).toBe('name 描述 <mark>Token</mark> 有效期');
    expect(
      cleanSearchSnippet('生成 Token。 OpenAPI: /openapi/whiteboard/api.yaml'),
    ).toBe('生成 Token。');
    expect(
      cleanSearchSnippet('a || b；https://example.com/openapi/file.yaml'),
    ).toBe('a || b；https://example.com/openapi/file.yaml');
  });
  it('cleans source syntax from snippets while retaining search highlights', () => {
    expect(cleanSearchSnippet('<#Your <mark>Token</mark>#>')).toBe(
      '<#Your <mark>Token</mark>#>',
    );
    expect(
      cleanSearchSnippet(
        '点击 **[生成 <mark>Token</mark>](/zh-CN/guide)**，调用 `renewToken`。<a id="token"></a>',
      ),
    ).toBe('点击 生成 <mark>Token</mark>，调用 renewToken。');
    expect(cleanSearchSnippet('参考[生成 Token](/zh-CN/a/cropped')).toBe(
      '参考生成 Token',
    );
  });
  it('removes code-tab fence metadata from old-index snippets without dropping code or highlights', () => {
    expect(
      cleanSearchSnippet(
        '生成 <mark>Token</mark>。\n```cpp tab="C++" tabGroup="token-sample-code"\nconst char* tabGroup = "app";\n```\n```python tab="Python3" tabGroup="token-sample-code"\nprint("Token")\n```',
      ),
    ).toBe(
      '生成 <mark>Token</mark>。 const char* tabGroup = "app"; print("Token")',
    );
  });
  it.each(['```cpp', '~~~~cpp'])(
    'removes fence metadata after the Meilisearch crop marker (%s)',
    (fence) => {
      expect(
        cleanSearchSnippet(
          `…${fence} tab="C++" tabGroup="token-sample-code"\nconst char* tabGroup = "app"; // <mark>Token</mark>\n…`,
        ),
      ).toBe('… const char* tabGroup = "app"; // <mark>Token</mark> …');
    },
  );
  it('cleans cropped indented fences without removing literal metadata in prose or code', () => {
    expect(
      cleanSearchSnippet(
        '正文 tab="C++" tabGroup="example"\n  …  ```cpp tab="C++" tabGroup="token-sample-code"\nconst char* tabGroup = "app";\n```',
      ),
    ).toBe('正文 tab="C++" tabGroup="example" … const char* tabGroup = "app";');
  });
  it('cleans a cropped old-index result through the search adapter while preserving highlights', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        hits: [
          {
            ...hit,
            _formatted: {
              content:
                '…```cpp tab="C++" tabGroup="token-sample-code"\nconst char* token = "<mark>Token</mark>";\n```…',
            },
          },
        ],
        totalHits: 1,
        totalPages: 1,
        page: 1,
      }),
    );
    const result = await queryCnSearch(
      config,
      parseSearchPageState({ q: 'Token', type: 'docs' }),
    );
    expect(result.groups[0].sections[0].highlights?.content).toEqual([
      { text: '… const char* token = "', highlighted: false },
      { text: 'Token', highlighted: true },
      { text: '";', highlighted: false },
    ]);
  });
  it('uses exact pagination and filters, groups sections in ranking order, and discards non-public results', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [
            hit,
            {
              ...hit,
              id: 'two',
              url: hit.url.replace('#token', '#renew'),
              sectionTitle: '续期',
            },
            { ...hit, id: 'duplicate' },
            { ...hit, id: 'hidden', hidden: true },
            { ...hit, id: 'draft', status: 'draft' },
            { ...hit, id: 'en', locale: 'en' },
            { ...hit, id: 'external', url: 'https://evil.example/' },
          ],
          totalHits: 24,
          totalPages: 2,
          page: 2,
          facetDistribution: { product: { 'conversational-ai': 24 } },
        }),
      ),
    );
    const signal = new AbortController().signal;
    const result = await queryCnSearch(
      config,
      parseSearchPageState({
        q: '#Token',
        product: 'conversational-ai',
        platform: 'web',
        version: '4.6.0',
        type: 'docs',
        page: 2,
      }),
      signal,
    );
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:7700/indexes/cn-kb-demo-v1/search');
    expect(request?.signal).toBe(signal);
    expect(JSON.parse(request?.body as string)).toMatchObject({
      q: 'Token',
      page: 2,
      hitsPerPage: 20,
      filter:
        'locale = "zh-CN" AND hidden = false AND status = "published" AND (product = "conversational-ai" OR products = "conversational-ai") AND platform = "web" AND searchFamily = "docs"',
    });
    expect(result.groups).toHaveLength(1);
    expect(
      result.groups[0].sections.map((section) => section.sectionTitle),
    ).toEqual(['Token', '续期']);
    expect(result.totalHits).toBe(24);
  });

  it('distinguishes a server failure from a successful empty response', async () => {
    const mock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ hits: [], totalHits: 0, totalPages: 0, page: 1 }),
        ),
      );
    await expect(
      queryCnSearch(config, parseSearchPageState({ q: 'Token', type: 'api' })),
    ).rejects.toThrow('503');
    await expect(
      queryCnSearch(config, parseSearchPageState({ q: 'none', type: 'api' })),
    ).resolves.toMatchObject({ groups: [], totalHits: 0 });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed engine responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ hits: [] })),
    );
    await expect(
      queryCnSearch(config, parseSearchPageState({ q: 'Token', type: 'api' })),
    ).rejects.toThrow('Invalid search response');
  });

  it('only accepts same-site CN document URLs, including section anchors', () => {
    expect(isPublicCnSearchUrl(hit.url)).toBe(true);
    for (const url of [
      'javascript:alert(1)',
      '//evil.example',
      '/en/guide',
      '/zh-CN/../private',
      '/zh-CN/\\evil',
      '/zh-CN/a\n',
    ])
      expect(isPublicCnSearchUrl(url)).toBe(false);
  });
});
