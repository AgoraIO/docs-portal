import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryCnSearch } from './cn-search.server';
import { mergeSearchPageGroups } from './cn-search-page';
import { getCnSearchResultEntries } from './cn-search-presentation';
import type { SearchHit } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';

const config = {
  host: 'http://127.0.0.1:7700',
  indexUid: 'presentation-test',
  searchOnlyKey: 'local-test-key',
};

function section(url: string, content = '搜索说明'): SearchHit {
  return {
    id: url,
    sourceId: url,
    url,
    canonicalUrl: url.split('#')[0],
    pageTitle: '文档',
    sectionTitle: url.split('#')[1] ?? '文档',
    headingPath: ['文档', url.split('#')[1] ?? '文档'],
    content,
    snippet: content,
    locale: 'zh-CN',
    product: 'rtc',
    platform: ['web'],
    docType: 'docs',
    audience: ['developer'],
    status: 'published',
    hidden: false,
    highlights: {
      sectionTitle: [{ text: '文档', highlighted: false }],
      content: [{ text: content, highlighted: false }],
    },
  };
}

// Only the external engine is replaced. Exercise production request building,
// normalization, grouping, pagination merging and card selection together.
function engine(hits: SearchHit[]) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    const result = (query: {
      filter: string;
      page: number;
      hitsPerPage: number;
    }) => {
      const family = query.filter.match(/searchFamily = "(\w+)"/)?.[1];
      const matching = hits.filter((hit) =>
        family === 'api'
          ? hit.url.startsWith('/api-reference/')
          : family === 'docs'
            ? hit.url.startsWith('/realtime-media/')
            : false,
      );
      const offset = (query.page - 1) * query.hitsPerPage;
      return {
        hits: matching.slice(offset, offset + query.hitsPerPage),
        totalHits: matching.length,
        totalPages: Math.ceil(matching.length / query.hitsPerPage),
        page: query.page,
        facetDistribution: {},
      };
    };
    return Response.json(
      body.queries ? { results: body.queries.map(result) } : result(body),
    );
  });
}

afterEach(() => vi.restoreAllMocks());

describe('CN search result ranking across views', () => {
  it('keeps intervening API pages ahead of a later section from the first page', async () => {
    engine([
      section('/api-reference/rtc/web/first#one'),
      section('/api-reference/rtc/web/second#two'),
      section('/api-reference/rtc/web/third#three'),
      section('/api-reference/rtc/web/first#four'),
    ]);
    const result = await queryCnSearch(
      config,
      parseSearchPageState({ q: '排序', type: 'api' }),
    );
    expect(
      getCnSearchResultEntries(result.groups, '排序').map(({ hit }) => hit.url),
    ).toEqual([
      '/api-reference/rtc/web/first#one',
      '/api-reference/rtc/web/second#two',
      '/api-reference/rtc/web/third#three',
      '/api-reference/rtc/web/first#four',
    ]);
  });

  it('uses the same default-platform guide section in overview and category results', async () => {
    const canonicalUrl = '/realtime-media/rtc/guide';
    engine([
      {
        ...section(`${canonicalUrl}/android#android-config`, 'Android 配置'),
        canonicalUrl,
        platform: ['android'],
        defaultPlatform: 'web',
      },
      ...Array.from({ length: 4 }, (_, index) =>
        section(`/realtime-media/rtc/other-${index}#setup`),
      ),
      {
        ...section(`${canonicalUrl}/web#web-config`, 'Web 配置'),
        canonicalUrl,
        defaultPlatform: 'web',
      },
    ]);
    for (const type of ['all', 'docs'] as const) {
      const result = await queryCnSearch(
        config,
        parseSearchPageState({ q: '配置', type }),
      );
      const [entry] = getCnSearchResultEntries(result.groups, '配置');
      expect(entry.hit.url).toBe('/realtime-media/rtc/guide/web#web-config');
      expect(entry.hit.content).toBe('Web 配置');
    }
  });

  it('appends a later API section without inserting it ahead of earlier results when loading more', async () => {
    engine([
      section('/api-reference/rtc/web/first#one'),
      ...Array.from({ length: 19 }, (_, index) =>
        section(`/api-reference/rtc/web/other-${index}#method`),
      ),
      section('/api-reference/rtc/web/first#later'),
    ]);
    const first = await queryCnSearch(
      config,
      parseSearchPageState({ q: '排序', type: 'api' }),
    );
    const second = await queryCnSearch(
      config,
      parseSearchPageState({ q: '排序', type: 'api', page: 2 }),
    );
    const merged = mergeSearchPageGroups([first.groups, second.groups]);
    const urls = getCnSearchResultEntries(merged, '排序').map(
      ({ hit }) => hit.url,
    );
    expect(urls.slice(0, 3)).toEqual([
      '/api-reference/rtc/web/first#one',
      '/api-reference/rtc/web/other-0#method',
      '/api-reference/rtc/web/other-1#method',
    ]);
    expect(urls).toHaveLength(21);
    expect(urls[20]).toBe('/api-reference/rtc/web/first#later');
  });
});
