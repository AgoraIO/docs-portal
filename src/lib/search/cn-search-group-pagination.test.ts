import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchSection } from './kb-record';
import {
  prepareSearchIndex,
  type SearchIndexClient,
} from './meilisearch-index.server';
import { buildPublishedCnSearchSettings } from './meilisearch-settings';
import { handleSearchRequest, parseSearchApiQuery } from './search-api.server';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const record: SearchSection = {
  id: 'web-one',
  url: '/realtime-media/rtc/token/web#one',
  canonicalUrl: '/realtime-media/rtc/token',
  pageTitle: 'Token',
  sectionTitle: 'Generate Token',
  headingPath: ['Token', 'Generate Token'],
  content: 'Generate a Token',
  locale: 'zh-CN',
  product: 'rtc',
  platform: ['web'],
  docType: 'docs',
  audience: ['developer'],
  status: 'published',
  hidden: false,
  isDefaultPlatform: true,
};

describe('optional document-group pagination', () => {
  it('accepts bounded pageSize without adding a default to existing website requests', () => {
    expect(
      parseSearchApiQuery(new URLSearchParams('q=Token&pageSize=5&page=2')),
    ).toMatchObject({ pageSize: 5, page: 2 });
    expect(
      parseSearchApiQuery(new URLSearchParams('q=Token')),
    ).not.toHaveProperty('pageSize');
  });

  it.each(['0', '-1', '21', '1.5', '05', '', 'NaN', '5&pageSize=6'])(
    'rejects invalid or duplicate pageSize=%s before contacting the engine',
    async (size) => {
      const transport = vi.spyOn(globalThis, 'fetch');
      const response = await handleSearchRequest(
        new Request(`https://docs.example/api/search?q=Token&pageSize=${size}`),
      );
      expect(response.status).toBe(400);
      expect(transport).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['all', '', 'canonicalPageGroupKey'],
    ['docs', '&platform=web', 'platformPageGroupKey'],
    ['api', '', 'canonicalPageGroupKey'],
    ['faq', '', 'canonicalPageGroupKey'],
  ])('paginates %s by groups using %s', async (type, platform, distinct) => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-key');
    const transport = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        hits: [
          {
            ...record,
            canonicalPageGroupKey: 'canonical',
            platformPageGroupKey: 'platform',
          },
        ],
        totalHits: 11,
        totalPages: 3,
        page: 2,
        facetDistribution: { products: { rtc: 11 } },
      }),
    );
    const response = await handleSearchRequest(
      new Request(
        `https://docs.example/api/search?q=Token&type=${type}${platform}&pageSize=5&page=2`,
      ),
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      page: 2,
      pageSize: 5,
      paginationUnit: 'groups',
      totalHits: 11,
      totalPages: 3,
    });
    expect(data.groups[0].sections[0].url).toBe(record.url);
    expect(transport).toHaveBeenCalledOnce();
    expect(transport.mock.calls[0][0]).toBe(
      'http://meili.internal:7700/indexes/docs_cn/search',
    );
    const body = JSON.parse(transport.mock.calls[0][1]?.body as string);
    expect(body).toMatchObject({ page: 2, hitsPerPage: 5, distinct });
    if (type === 'all') expect(body.filter).not.toContain('searchFamily =');
    else expect(body.filter).toContain(`searchFamily = "${type}"`);
  });

  it('indexes stable document keys that collapse sections but retain platform and version boundaries', async () => {
    const documents: Record<string, unknown>[] = [];
    const client: SearchIndexClient = {
      hostHash: 'local',
      getRelease: async () => null,
      ensureIndex: async () => {},
      createIndex: async () => {},
      settings: async () => {},
      documents: async (_uid, batch) => {
        documents.push(...batch);
      },
      count: async () => documents.length,
      swap: async () => 1,
      wait: async () => {},
    };
    await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'groups',
      records: [
        record,
        {
          ...record,
          id: 'web-two',
          url: '/realtime-media/rtc/token/web#two',
          sectionTitle: 'Renew Token',
        },
        {
          ...record,
          id: 'ios',
          url: '/realtime-media/rtc/token/ios#one',
          platform: ['ios'],
        },
        { ...record, id: 'version', version: '4.6.0' },
      ],
    });
    const [web, second, ios, version] = documents;
    expect(web.canonicalPageGroupKey).toEqual(expect.any(String));
    expect(web.canonicalPageGroupKey).toBe(second.canonicalPageGroupKey);
    expect(web.canonicalPageGroupKey).toBe(ios.canonicalPageGroupKey);
    expect(web.platformPageGroupKey).toBe(second.platformPageGroupKey);
    expect(web.platformPageGroupKey).not.toBe(ios.platformPageGroupKey);
    expect(web.canonicalPageGroupKey).not.toBe(version.canonicalPageGroupKey);
    expect(buildPublishedCnSearchSettings().filterableAttributes).toEqual(
      expect.arrayContaining(['canonicalPageGroupKey', 'platformPageGroupKey']),
    );
  });

  it('fails closed when an old index returns hits without document-group keys', async () => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        hits: [record],
        totalHits: 1,
        totalPages: 1,
        page: 1,
      }),
    );
    const response = await handleSearchRequest(
      new Request(
        'https://docs.example/api/search?q=Token&type=docs&pageSize=5',
      ),
    );
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Search service unavailable',
    });
  });
});
