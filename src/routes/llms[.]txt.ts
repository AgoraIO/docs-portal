import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      async GET({ request }) {
        const { buildDocsLlmsIndex } = await import(
          '@/lib/docs-static/docs-index-llms.server'
        );
        const { fetchStaticOpenApiJson } = await import(
          '@/lib/openapi/static-asset.server'
        );
        const openApiPages = await fetchStaticOpenApiJson<
          Array<{
            title: string;
            url: string;
          }>
        >(request, '/generated/openapi/markdown-pages.json');
        const openApiIndex = openApiPages
          .map((page) => `- [${page.title}](${page.url})`)
          .join('\n');

        return new Response(`${buildDocsLlmsIndex()}\n\n${openApiIndex}\n`);
      },
    },
  },
});
