import { createFileRoute } from '@tanstack/react-router';
import { llms } from 'fumadocs-core/source';
import { createMarkdownLlmsIndex } from '@/lib/llms-index';
import { MACHINE_READABLE_LOCALE } from '@/lib/machine-readable-docs';
import { getSitemapBaseUrl } from '@/lib/sitemap';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      async GET() {
        const { source } = await import('@/lib/source');
        const { getOpenApiMarkdownPages } = await import(
          '@/lib/openapi/markdown'
        );
        const openApiPages = await getOpenApiMarkdownPages();

        return new Response(
          createMarkdownLlmsIndex({
            baseUrl: getSitemapBaseUrl(),
            docsIndex: llms(source).index(MACHINE_READABLE_LOCALE),
            openApiPages,
          }),
        );
      },
    },
  },
});
