import { describe, expect, it, vi } from 'vitest';
import {
  createSearchDocsRequestHandler,
  type SearchDocsTool,
} from './search-docs-server';

const tool: SearchDocsTool = {
  searchDocs: vi.fn(async () => ({
    results: [
      {
        id: 'section-1',
        title: 'manualSOS',
        content: '手动触发 SOS。',
        url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
        headingPath: ['Conversational AI API', 'manualSOS'],
      },
    ],
  })),
};

describe('createSearchDocsRequestHandler', () => {
  it('accepts the tool-call JSON contract', async () => {
    const handler = createSearchDocsRequestHandler(tool);
    const response = await handler(
      new Request('http://localhost/api/search-docs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'manualSOS' }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      results: [
        expect.objectContaining({
          id: 'section-1',
          url: expect.stringContaining('#manualsos'),
        }),
      ],
    });
    expect(tool.searchDocs).toHaveBeenCalledWith({ query: 'manualSOS' });
  });

  it('rejects non-POST, invalid JSON, and tool failures without leaking details', async () => {
    const handler = createSearchDocsRequestHandler({
      searchDocs: vi.fn(async () => {
        throw new Error('secret master key and Meilisearch internals');
      }),
    });

    await expect(
      handler(new Request('http://localhost/api/search-docs')),
    ).resolves.toMatchObject({ status: 405 });
    await expect(
      handler(
        new Request('http://localhost/api/search-docs', {
          method: 'POST',
          body: '{',
        }),
      ),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      handler(
        new Request('http://localhost/api/search-docs', {
          method: 'POST',
          body: 'null',
        }),
      ),
    ).resolves.toMatchObject({ status: 400 });
    const response = await handler(
      new Request('http://localhost/api/search-docs', {
        method: 'POST',
        body: JSON.stringify({ query: 'manualSOS' }),
      }),
    );
    expect(response.status).toBe(502);
    await expect(response.text()).resolves.not.toContain('master key');
  });
});
