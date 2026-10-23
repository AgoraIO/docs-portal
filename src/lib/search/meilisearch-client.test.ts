import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createMeilisearchClient,
  normalizeMeilisearchHit,
  normalizeMeilisearchQuery,
} from './meilisearch-client';

describe('createMeilisearchClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
              locale: 'zh-CN',
              docType: 'docs',
              audience: ['developer'],
              status: 'published',
              hidden: false,
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
          filter:
            'locale = "zh-CN" AND hidden = false AND status = "published" AND platform = web',
          attributesToHighlight: ['sectionTitle', 'content'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
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

  it('normalizes engine highlight tags into structured segments and preserves raw AI content', () => {
    const hit = normalizeMeilisearchHit({
      id: 'safe-id',
      sourceId: 'zh-CN:api:manualSOS',
      url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
      pageTitle: 'Conversational AI API',
      sectionTitle: 'manualSOS',
      content: '调用 manualSOS 方法。',
      headingPath: ['Conversational AI API', 'manualSOS'],
      locale: 'zh-CN',
      product: 'conversational-ai',
      platform: ['web'],
      docType: 'docs',
      audience: ['developer'],
      status: 'published',
      hidden: false,
      _formatted: {
        sectionTitle: '<em>manualSOS</em>',
        content: '调用 <em>manualSOS</em> 方法。',
      },
    });

    expect(hit.content).toBe('调用 manualSOS 方法。');
    expect(hit.url).toContain('#manualsos');
    expect(hit.highlights.sectionTitle).toEqual([
      { text: 'manualSOS', highlighted: true },
    ]);
    expect(hit.highlights.content).toEqual([
      { text: '调用 ', highlighted: false },
      { text: 'manualSOS', highlighted: true },
      { text: ' 方法。', highlighted: false },
    ]);
    expect(JSON.stringify(hit)).not.toContain('<em>');
    expect(JSON.stringify(hit)).not.toContain('<mark>');
  });

  it('drops hidden, non-CN, and non-published hits at the CN adapter boundary', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [
            {
              id: 'hidden',
              url: '/hidden',
              pageTitle: 'Hidden',
              sectionTitle: 'Hidden',
              content: 'Hidden',
              headingPath: ['Hidden'],
              locale: 'zh-CN',
              docType: 'docs',
              audience: ['developer'],
              status: 'published',
              hidden: true,
            },
            {
              id: 'english',
              url: '/en/page',
              pageTitle: 'English',
              sectionTitle: 'English',
              content: 'English',
              headingPath: ['English'],
              locale: 'en',
              docType: 'docs',
              audience: ['developer'],
              status: 'published',
              hidden: false,
            },
            {
              id: 'deprecated',
              url: '/zh-CN/deprecated',
              pageTitle: 'Deprecated',
              sectionTitle: 'Deprecated',
              content: 'Deprecated',
              headingPath: ['Deprecated'],
              locale: 'zh-CN',
              docType: 'docs',
              audience: ['developer'],
              status: 'deprecated',
              hidden: false,
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const client = createMeilisearchClient({
      host: 'http://127.0.0.1:7700',
      indexUid: 'cn-kb-demo-v1',
      searchOnlyKey: 'search-only-key',
    });

    await expect(client.searchCnDocuments('anything')).resolves.toEqual([]);
  });

  it.each([401, 403, 500])(
    'converts HTTP %s into a bounded search error',
    async (status) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', { status }),
      );
      const client = createMeilisearchClient({
        host: 'http://127.0.0.1:7700',
        indexUid: 'cn-kb-demo-v1',
        searchOnlyKey: 'search-only-key',
      });

      await expect(client.searchCnDocuments('manualSOS')).rejects.toThrow(
        `Meilisearch search failed (HTTP ${status})`,
      );
    },
  );

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
