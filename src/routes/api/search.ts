import { createFileRoute } from '@tanstack/react-router';
import { createFromSource } from 'fumadocs-core/search/server';

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { source } = await import('@/lib/source');
        const { searchOpenApiDocuments } = await import('@/lib/openapi/search');
        const server = createFromSource(source, {
          // https://docs.orama.com/docs/orama-js/supported-languages
          language: 'english',
          localeMap: {
            en: 'english',
            'zh-CN': 'english',
          },
        });
        const url = new URL(request.url);
        const query = url.searchParams.get('query');
        const response = await server.GET(request);

        if (!query) {
          return response;
        }

        const existing = (await response.json()) as unknown[];
        const openApi = await searchOpenApiDocuments(
          query,
          url.searchParams.get('locale'),
        );

        return Response.json([...existing, ...openApi]);
      },
    },
  },
});
