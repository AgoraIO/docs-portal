import { describe, expect, it, vi } from 'vitest';
import {
  fetchStaticOpenApiJson,
  fetchStaticOpenApiText,
} from './static-asset.server';

describe('openapi static asset loader', () => {
  it('fetches static openapi json from the current request origin', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      return new Response(
        JSON.stringify([
          {
            id: 'en-start-agent',
          },
        ]),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchStaticOpenApiJson<Array<{ id: string }>>(
      new Request('https://docs.example.com/api/search?query=agent'),
      '/generated/openapi/search-documents.json',
    );

    expect(result).toEqual([{ id: 'en-start-agent' }]);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        '/generated/openapi/search-documents.json',
        'https://docs.example.com/api/search?query=agent',
      ),
    );
  });

  it('fetches static openapi markdown from the current request origin', async () => {
    const fetchMock = vi.fn(async () => {
      return new Response('# start-agent', {
        headers: {
          'Content-Type': 'text/markdown',
        },
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchStaticOpenApiText(
      new Request('https://docs.example.com/llms.mdx/docs/en/example.md'),
      '/generated/openapi/llms-mdx-docs/en/example.md',
    );

    expect(result).toBe('# start-agent');
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        '/generated/openapi/llms-mdx-docs/en/example.md',
        'https://docs.example.com/llms.mdx/docs/en/example.md',
      ),
    );
  });

  it('returns null when the static openapi markdown asset is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response('not found', {
          status: 404,
        });
      }),
    );

    const result = await fetchStaticOpenApiText(
      new Request('https://docs.example.com/llms.mdx/docs/en/missing.md'),
      '/generated/openapi/llms-mdx-docs/en/missing.md',
    );

    expect(result).toBeNull();
  });
});
