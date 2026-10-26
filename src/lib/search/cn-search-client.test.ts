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
