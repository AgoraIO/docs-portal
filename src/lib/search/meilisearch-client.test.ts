import { describe, expect, it, vi } from 'vitest';
import {
  createMeilisearchClient,
  normalizeMeilisearchQuery,
} from './meilisearch-client';

describe('createMeilisearchClient', () => {
  it('normalizes a section-anchor query before searching', () => {
    expect(normalizeMeilisearchQuery('  #manualsos  ')).toBe('manualsos');
    expect(normalizeMeilisearchQuery('manualSOS')).toBe('manualSOS');
  });

  it('maps section hits, highlights, and filters without exposing a master key', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [
            {
              id: 'safe-id',
              sourceId: 'zh-CN:api:manualSOS',
              url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
              pageTitle: 'Conversational AI API',
              sectionTitle: 'manualSOS',
              content: '手动触发 SOS。',
              headingPath: ['Conversational AI API', 'manualSOS'],
              platform: ['web'],
              _formatted: {
                sectionTitle: '<mark>manualSOS</mark>',
                content: '手动触发 <mark>SOS</mark>。',
              },
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const client = createMeilisearchClient({
      host: 'http://127.0.0.1:7700',
      indexUid: 'cn-kb-demo-v1',
      searchOnlyKey: 'search-only-key',
    });
    const results = await client.searchCnDocuments('manualSOS', {
      filters: ['platform = web'],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:7700/indexes/cn-kb-demo-v1/search',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer search-only-key',
        }),
        body: JSON.stringify({
          q: 'manualSOS',
          filter: 'platform = web',
          attributesToHighlight: ['sectionTitle', 'content'],
          attributesToCrop: ['content'],
          cropLength: 30,
          limit: 10,
        }),
      }),
    );
    expect(results).toEqual([
      expect.objectContaining({
        id: 'safe-id',
        title: '<mark>manualSOS</mark>',
        section: '<mark>manualSOS</mark>',
        snippet: '手动触发 <mark>SOS</mark>。',
        content: '<mark>manualSOS</mark>',
        path: ['Conversational AI API', 'manualSOS'],
        url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
      }),
    ]);
    expect(fetchMock.mock.calls[0]?.[1]).not.toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('master'),
        }),
      }),
    );
    fetchMock.mockRestore();
  });

  it('rejects a master key passed as the browser search key', () => {
    expect(() =>
      createMeilisearchClient({
        host: 'http://127.0.0.1:7700',
        indexUid: 'cn-kb-demo-v1',
        searchOnlyKey: 'master-key-for-server-only',
      }),
    ).toThrow(/search-only/i);
  });

  it('returns no results for blank queries without making a request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const client = createMeilisearchClient({
      host: 'http://127.0.0.1:7700',
      indexUid: 'cn-kb-demo-v1',
      searchOnlyKey: 'search-only-key',
    });

    await expect(client.search('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});
