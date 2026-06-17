import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { buildDocsLlmsFullText } = await import(
          '@/lib/docs-static/docs-index-llms.server'
        );
        const { fetchStaticOpenApiJson } = await import(
          '@/lib/openapi/static-asset.server'
        );
        const openApiPages = await fetchStaticOpenApiJson<
          Array<{
            markdown: string;
          }>
        >(request, '/generated/openapi/markdown-pages.json');
        return new Response(
          [buildDocsLlmsFullText(), ...openApiPages.map((page) => page.markdown)].join(
            '\n\n',
          ),
        );
      },
    },
  },
});
