import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCnDocsSearchClient } from './cn-search-client';
import { loadCnSearchCatalog, searchCnDocsPage } from './cn-search-page';
import { normalizeMeilisearchHit } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';

afterEach(() => vi.restoreAllMocks());
const empty = { groups: [], totalHits: 0, totalPages: 0, page: 1, facets: {} };
describe('browser search API transport', () => {
  it('reserves three preview slots per family and carries full family counts', async () => {
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
          sectionTitle: `${family}-${i}`,
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
    const result = await createCnDocsSearchClient({}).search('method');
    expect(result).toMatchObject([
      ...[0, 1, 2].map((i) => ({
        id: `docs-${i}`,
        family: 'docs',
        familyTotalHits: 7,
      })),
      ...[0, 1, 2].map((i) => ({
        id: `api-${i}`,
        family: 'api',
        familyTotalHits: 39,
      })),
      ...[0, 1, 2].map((i) => ({
        id: `faq-${i}`,
        family: 'faq',
        familyTotalHits: 11,
      })),
    ]);
  });
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
