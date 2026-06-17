import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getDocsIndex } = await import('@/lib/docs-static/docs-index.server');
        const { fetchStaticOpenApiJson } = await import(
          '@/lib/openapi/static-asset.server'
        );
        const url = new URL(request.url);
        const query = url.searchParams.get('query');

        if (!query) {
          return Response.json([]);
        }

        const locale = url.searchParams.get('locale');
        const normalizedQuery = query.trim().toLowerCase();
        const ordinaryDocs = getDocsIndex().pages
          .filter((page) => !locale || page.locale === locale)
          .filter((page) =>
            `${page.title}\n${page.description ?? ''}\n${page.routePath}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
          .map((page) => ({
            breadcrumbs: [page.locale === 'zh-CN' ? '文档' : 'Docs', page.tab],
            content: [page.title, page.description, page.routePath]
              .filter(Boolean)
              .join('\n'),
            id: `${page.locale}-${page.routePath}`,
            type: 'page' as const,
            url: page.routePath,
          }));
        const openApiDocuments = await fetchStaticOpenApiJson<
          Array<{
            content: string;
            id: string;
            url: string;
          }>
        >(
          request,
          '/generated/openapi/search-documents.json',
        );
        const openApi = openApiDocuments
          .filter((document) => !locale || document.id.startsWith(`${locale}-`))
          .filter((document) =>
            `${document.content}\n${document.url}`
              .toLowerCase()
              .includes(normalizedQuery),
          );

        return Response.json([...ordinaryDocs, ...openApi]);
      },
    },
  },
});
