import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSearchDocsTool } from './search-docs-tool';

const baseHit = (overrides: Record<string, unknown> = {}) => ({
  id: 'section-1',
  sourceId: 'zh-CN:api:manualSOS',
  pageTitle: 'Conversational AI API',
  sectionTitle: 'manualSOS',
  content: '手动触发 SOS。'.repeat(20),
  headingPath: ['Conversational AI API', 'manualSOS'],
  url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
  locale: 'zh-CN',
  product: 'conversational-ai',
  platform: ['web'],
  version: undefined,
  docType: 'docs',
  audience: ['developer'],
  status: 'published',
  hidden: false,
  ...overrides,
});

describe('createSearchDocsTool', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queries only the fixed demo index with bounded public filters', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ hits: [baseHit()] }), { status: 200 }),
      );
    const tool = createSearchDocsTool({
      host: 'http://127.0.0.1:7700',
      masterKey: 'server-master-key',
    });

    const result = await tool.searchDocs({
      query: 'manualSOS',
      product: 'conversational-ai',
      platform: ['web'],
      audience: 'developer',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:7700/indexes/cn-kb-demo-v1/search',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer server-master-key',
          'Content-Type': 'application/json',
        },
      }),
    );
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(request).toMatchObject({
      q: 'manualSOS',
      limit: 5,
    });
    expect(request.attributesToRetrieve).toContain('docType');
    expect(request.filter).toContain('locale = "zh-CN"');
    expect(request.filter).toContain('hidden = false');
    expect(request.filter).toContain('status = "published"');
    expect(request.filter).toContain('product = "conversational-ai"');
    expect(request.filter).toContain('platform = "web"');
    expect(request.filter).toContain('audience = "developer"');
    expect(result.results[0]).toMatchObject({
      id: 'section-1',
      title: 'manualSOS',
      url: expect.stringContaining('#manualsos'),
      headingPath: ['Conversational AI API', 'manualSOS'],
    });
    expect(result.results[0]?.content.length).toBeLessThanOrEqual(1200);
    expect(result.results[0]?.content).not.toContain('<em>');
  });

  it('does not return hidden, internal, non-CN, or deprecated hits', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [
            baseHit({ id: 'hidden', hidden: true }),
            baseHit({ id: 'internal', status: 'internal' }),
            baseHit({ id: 'english', locale: 'en' }),
            baseHit({ id: 'deprecated', status: 'deprecated' }),
            baseHit({ id: 'valid' }),
          ],
        }),
        { status: 200 },
      ),
    );
    const tool = createSearchDocsTool({
      host: 'http://127.0.0.1:7700',
      masterKey: 'server-master-key',
    });

    await expect(tool.searchDocs({ query: 'manualSOS' })).resolves.toEqual({
      results: [expect.objectContaining({ id: 'valid' })],
    });
  });

  it('rejects empty or oversized queries before contacting Meilisearch', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const tool = createSearchDocsTool({
      host: 'http://127.0.0.1:7700',
      masterKey: 'server-master-key',
    });

    await expect(tool.searchDocs({ query: '   ' })).rejects.toThrow(
      'query must not be empty',
    );
    await expect(tool.searchDocs({ query: 'a'.repeat(501) })).rejects.toThrow(
      'query is too long',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('converts Meilisearch failures to a bounded tool error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('secret server details', { status: 503 }),
    );
    const tool = createSearchDocsTool({
      host: 'http://127.0.0.1:7700',
      masterKey: 'server-master-key',
    });

    await expect(tool.searchDocs({ query: 'manualSOS' })).rejects.toThrow(
      'search service unavailable',
    );
    await expect(tool.searchDocs({ query: 'manualSOS' })).rejects.not.toThrow(
      'secret server details',
    );
  });
});
