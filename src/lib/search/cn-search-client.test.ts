import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCnDocsSearchClient } from './cn-search-client';
import { searchCnDocsPage } from './cn-search-page';
import { parseSearchPageState } from './search-page-state';

afterEach(() => vi.restoreAllMocks());
const empty = { groups: [], totalHits: 0, totalPages: 0, page: 1, facets: {} };
describe('browser search API transport', () => {
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
  it('prefers the current copy of the same API without moving unrelated results or hiding history', async () => {
    const api = {
      sourceId: 'join',
      pageTitle: '频道相关',
      sectionTitle: 'joinChannel [1/2]',
      content: '加入频道。',
      snippet: '加入频道。',
      headingPath: ['频道相关', 'joinChannel [1/2]'],
      locale: 'zh-CN',
      product: 'rtc',
      platform: ['android'],
      docType: 'docs' as const,
      audience: ['developer'],
      status: 'published' as const,
      hidden: false,
      highlights: {
        sectionTitle: [{ text: 'joinChannel [1/2]', highlighted: false }],
        content: [{ text: '加入频道。', highlighted: false }],
      },
    };
    // Existing releases have version + URL, without a versionStatus field.
    const historical = {
      ...api,
      id: 'old',
      version: '4.6.0',
      url: '/api-reference/rtc/android/4.6.0/channel#joinchannel-12',
    };
    const current = {
      ...api,
      id: 'current',
      version: '4.7.0',
      url: '/api-reference/rtc/android/channel#joinchannel-12',
    };
    const unrelated = {
      ...api,
      id: 'other-platform',
      version: '4.8.0',
      platform: ['ios'],
      url: '/api-reference/rtc/ios/channel#joinchannel-12',
    };
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json({
        ...empty,
        groups: [historical, unrelated, current].map((section) => ({
          pageUrl: section.url.split('#')[0],
          title: section.pageTitle,
          platform: section.platform,
          docType: section.docType,
          sections: [section],
        })),
      }),
    );
    const client = createCnDocsSearchClient({});
    const results = await client.search('joinChannel');
    expect(results.map((result) => result.id)).toEqual([
      'current',
      'other-platform',
      'old',
    ]);
    expect(results[0]).toMatchObject({
      version: '4.7.0',
      versionStatus: 'current',
    });
    expect(results[2]).toMatchObject({
      version: '4.6.0',
      versionStatus: 'historical',
    });
    // A content-only query must preserve engine relevance, even for same-name methods.
    expect(
      (await client.search('legacy token behavior')).map((result) => result.id),
    ).toEqual(['old', 'other-platform', 'current']);
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
