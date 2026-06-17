import { createFileRoute, notFound } from '@tanstack/react-router';
export const Route = createFileRoute('/llms.mdx/docs/$')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { getDocsMarkdownByContentPath } = await import(
          '@/lib/docs-static/docs-index-llms.server'
        );
        const { fetchStaticOpenApiText } = await import(
          '@/lib/openapi/static-asset.server'
        );
        const ordinaryDocsMarkdown = getDocsMarkdownByContentPath(
          params._splat ?? '',
        );

        if (!ordinaryDocsMarkdown) {
          const openApiMarkdown = await fetchStaticOpenApiText(
            request,
            `/generated/openapi/llms-mdx-docs/${params._splat ?? ''}`,
          );

          if (!openApiMarkdown) {
            throw notFound();
          }

          return new Response(openApiMarkdown, {
            headers: {
              'Content-Type': 'text/markdown',
            },
          });
        }

        return new Response(ordinaryDocsMarkdown, {
          headers: {
            'Content-Type': 'text/markdown',
          },
        });
      },
    },
  },
});
