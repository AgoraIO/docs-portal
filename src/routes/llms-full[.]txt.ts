import { createFileRoute } from '@tanstack/react-router';
import { MACHINE_READABLE_LOCALE } from '@/lib/machine-readable-docs';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { getLLMText, source } = await import('@/lib/source');
        const { getOpenApiMarkdownPages } = await import(
          '@/lib/openapi/markdown'
        );
        const scan = source.getPages(MACHINE_READABLE_LOCALE).map(getLLMText);
        const scanned = await Promise.all(scan);
        const openApiPages = await getOpenApiMarkdownPages();
        return new Response(
          [...scanned, ...openApiPages.map((page) => page.markdown)].join(
            '\n\n',
          ),
        );
      },
    },
  },
});
