import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCnDocsSearchClient } from './cn-search-client';
import { loadCnSearchCatalog, searchCnDocsPage } from './cn-search-page';
import { normalizeMeilisearchHit } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';

afterEach(() => vi.restoreAllMocks());
const empty = { groups: [], totalHits: 0, totalPages: 0, page: 1, facets: {} };
describe('browser search API transport', () => {
  it.each(['method', 'apiMethod'])(
    'preserves API member slots and document groups for %s',
    async (query) => {
      const paths = {
        api: '/api-reference/rtc/android/method',
        docs: '/realtime-media/rtc/guide',
        faq: '/reference/faq/integration/set_log_file',
      };
      const groups = (['api', 'docs', 'faq'] as const).map((family) => ({
        pageUrl: paths[family],
        title: family,
        platform: ['android'],
        docType: 'docs',
        sections: Array.from({ length: 5 }, (_, i) =>
          normalizeMeilisearchHit({
            id: `${family}-${i}`,
            url: `${paths[family]}#section-${i}`,
            pageTitle: family,
            sectionTitle:
              family === 'api' && i === 3 ? 'apiMethod' : `${family}-${i}`,
            content: 'summary',
            headingPath: [],
            locale: 'zh-CN',
            audience: [],
            docType: 'docs',
            status: 'published',
            hidden: false,
          }),
        ),
      }));
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          ...empty,
          groups,
          totalHits: 57,
          familyTotalHits: { docs: 7, api: 39, faq: 11 },
        }),
      );
      const result = await createCnDocsSearchClient({}).search(query);
      expect(result[0].id).toBe(query === 'apiMethod' ? 'api-0' : 'docs-0');
      // The exact API match is fourth and is omitted from the three-item
      // preview. Its evidence must still determine both surfaces' group order.
      expect(
        result.every(
          (hit) =>
            JSON.stringify(
              (hit as typeof hit & { familyOrder?: unknown }).familyOrder,
            ) ===
            JSON.stringify(
              query === 'apiMethod'
                ? ['api', 'docs', 'faq']
                : ['docs', 'api', 'faq'],
            ),
        ),
      ).toBe(true);
      expect(result).toHaveLength(5);
      expect(result.filter((item) => item.id.startsWith('api-'))).toHaveLength(
        3,
      );
      if (query === 'apiMethod') return;
      expect(result).toMatchObject([
        { id: 'docs-0', family: 'docs', familyTotalHits: 7 },
        ...[0, 1, 2].map((i) => ({
          id: `api-${i}`,
          family: 'api',
          familyTotalHits: 39,
        })),
        { id: 'faq-0', family: 'faq', familyTotalHits: 11 },
      ]);
    },
  );
  it.each([undefined, 'web'])(
    'keeps one quick-search entry per document group with platform context (%s)',
    async (platform) => {
      const sections = ['android', 'web'].map((variant) =>
        normalizeMeilisearchHit({
          id: `select-${variant}`,
          url: `/realtime-media/rtc/guide/${variant}#steps`,
          canonicalUrl: '/realtime-media/rtc/guide',
          pageTitle: '音强选流',
          sectionTitle: '音强选流',
          platform: [variant],
          content: '开启音强选流',
          headingPath: [],
          locale: 'zh-CN',
          audience: [],
          docType: 'docs',
          status: 'published',
          hidden: false,
        }),
      );
      const selected = platform ? [sections[1]] : sections;
      const groups = [
        {
          pageUrl: selected[0].url.split('#')[0],
          title: '音强选流',
          platform: platform ? ['web'] : ['android', 'web'],
          docType: 'docs',
          product: 'rtc',
          sections: selected,
        },
        ...['rtm', 'cloud-recording', 'rtc-server-sdk'].map((product) => ({
          pageUrl: `/realtime-media/${product}/guide`,
          title: '选流',
          platform: ['web'],
          docType: 'docs',
          product,
          sections: [
            {
              ...sections[1],
              id: product,
              url: `/realtime-media/${product}/guide#steps`,
            },
          ],
        })),
      ];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({ ...empty, groups }),
      );
      const result = await createCnDocsSearchClient({ platform }).search('选');
      expect(result).toHaveLength(3);
      expect(result.map((entry) => entry.id)).toEqual([
        selected[0].id,
        'rtm',
        'cloud-recording',
      ]);
      expect(result[0]).toMatchObject({
        url: selected[0].url,
        platform: platform ? ['web'] : ['android', 'web'],
      });
    },
  );
  it.each([undefined, 'web'])(
    'opens the document default unless a platform was selected (%s)',
    async (platform) => {
      const canonicalUrl = '/realtime-media/rtc/guide';
      const hit = normalizeMeilisearchHit({
        id: 'web-match',
        url: `${canonicalUrl}/web#web-only`,
        canonicalUrl,
        defaultPlatform: 'android',
        platform: ['web'],
        pageTitle: '指南',
        sectionTitle: 'Web 专属配置',
        content: '配置说明',
        headingPath: ['指南', 'Web 专属配置'],
        locale: 'zh-CN',
        audience: [],
        docType: 'docs',
        status: 'published',
        hidden: false,
      });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          ...empty,
          groups: [
            {
              pageUrl: `${canonicalUrl}/web`,
              title: '指南',
              platform: platform ? ['web'] : ['web', 'android'],
              docType: 'docs',
              sections: [hit],
            },
          ],
        }),
      );
      const result = await createCnDocsSearchClient({ platform }).search(
        '配置',
      );
      expect(result[0].url).toBe(
        platform ? hit.url : `${canonicalUrl}/android`,
      );
      expect(result[0]).toMatchObject({
        title: platform ? 'Web 专属配置' : '指南',
      });
    },
  );
  it('keeps an inferred platform and API member destinations instead of using a guide default', async () => {
    const hit = normalizeMeilisearchHit({
      id: 'web-match',
      url: '/realtime-media/rtc/guide/web#setup',
      canonicalUrl: '/realtime-media/rtc/guide',
      defaultPlatform: 'android',
      platform: ['web'],
      pageTitle: '指南',
      sectionTitle: '配置',
      content: '配置说明',
      headingPath: [],
      locale: 'zh-CN',
      audience: [],
      docType: 'docs',
      status: 'published',
      hidden: false,
    });
    const groups = [
      {
        pageUrl: hit.url.split('#')[0],
        title: '指南',
        platform: ['web'],
        docType: 'docs',
        sections: [hit],
      },
      {
        pageUrl: '/api-reference/rtc/web/audio',
        title: '音频',
        platform: ['web'],
        docType: 'docs',
        sections: [
          { ...hit, id: 'api', url: '/api-reference/rtc/web/audio#configure' },
        ],
      },
    ];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ ...empty, groups }),
    );
    const result = await createCnDocsSearchClient({}).search('Web 配置');
    expect(result.map((entry) => entry.url)).toEqual([
      hit.url,
      '/api-reference/rtc/web/audio#configure',
    ]);
  });
  it('uses a matching default-platform section with its own title, summary and anchor', async () => {
    const canonicalUrl = '/realtime-media/rtc/guide';
    const sections = ['web', 'android'].map((platform) =>
      normalizeMeilisearchHit({
        id: platform,
        url: `${canonicalUrl}/${platform}#${platform}-setup`,
        canonicalUrl,
        defaultPlatform: 'android',
        platform: [platform],
        pageTitle: '指南',
        sectionTitle: `${platform} 配置`,
        content: `${platform} 说明`,
        headingPath: [],
        locale: 'zh-CN',
        audience: [],
        docType: 'docs',
        status: 'published',
        hidden: false,
      }),
    );
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        ...empty,
        groups: [
          {
            pageUrl: `${canonicalUrl}/web`,
            title: '指南',
            platform: ['web', 'android'],
            docType: 'docs',
            sections,
          },
        ],
      }),
    );
    const result = await createCnDocsSearchClient({}).search('配置');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      url: sections[1].url,
      title: 'android 配置',
      snippet: 'android 说明',
    });
  });
  it.each([
    ['C#', 'csharp'],
    ['C++', 'cplusplus'],
  ])(
    'keeps the concrete %s SDK entry instead of a guide default',
    async (query, language) => {
      const canonicalUrl = '/realtime-media/rtc/reference/downloads';
      const hit = normalizeMeilisearchHit({
        id: 'language-entry',
        url: `${canonicalUrl}/windows#sdk`,
        canonicalUrl,
        defaultPlatform: 'android',
        languageEntryTerms: [language],
        platform: ['windows'],
        pageTitle: '下载',
        sectionTitle: `${query} SDK`,
        content: '下载 SDK',
        headingPath: [],
        locale: 'zh-CN',
        audience: [],
        docType: 'docs',
        status: 'published',
        hidden: false,
      });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          ...empty,
          groups: [
            {
              pageUrl: `${canonicalUrl}/windows`,
              title: '下载',
              platform: ['windows'],
              docType: 'docs',
              sections: [hit],
            },
          ],
        }),
      );
      const result = await createCnDocsSearchClient({}).search(query);
      expect(result[0].url).toBe(hit.url);
    },
  );
  it('loads the publication catalog without query or selected filters', async () => {
    const facets = {
      platform: { android: 3, harmonyos: 2, swift: 1 },
      product: { rtc: 3 },
    };
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ ...empty, facets }));
    const signal = new AbortController().signal;
    await expect(loadCnSearchCatalog(signal)).resolves.toEqual(facets);
    expect(fetchMock).toHaveBeenCalledWith('/api/search?q=&page=1&type=all', {
      signal,
      headers: { Accept: 'application/json' },
    });
  });

  it('calls only the same-origin API and propagates cancellation without engine credentials', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json(empty));
    const signal = new AbortController().signal;
    await searchCnDocsPage(
      parseSearchPageState({ q: 'Token & key', product: 'rtc', page: 2 }),
      signal,
    );
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/search?q=Token+%26+key&page=2&type=all&product=rtc');
    expect(options?.signal).toBe(signal);
    expect(options?.headers).toEqual({ Accept: 'application/json' });
  });
  it('shares filters for quick search and never falls back to a local index on API failure', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 503 }));
    const client = createCnDocsSearchClient({
      platform: 'web',
      scope: { field: 'tab', value: 'ai' },
    });
    await expect(client.search('  ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(client.search('#Token')).rejects.toThrow('503');
    expect(fetchMock.mock.calls[0][0]).toBe(
      '/api/search?q=Token&page=1&type=all&platform=web&tab=ai',
    );
  });
});
