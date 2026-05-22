import { createFileRoute } from '@tanstack/react-router';
import { llms } from 'fumadocs-core/source';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      async GET() {
        const { source } = await import('@/lib/source');
        const { getOpenApiMarkdownPages } = await import('@/lib/openapi/markdown');
        const openApiPages = await getOpenApiMarkdownPages();
        const openApiIndex = openApiPages
          .map((page) => `- [${page.title}](${page.url})`)
          .join('\n');

        return new Response(`${llms(source).index()}\n\n${openApiIndex}\n`);
      },
    },
  },
});
