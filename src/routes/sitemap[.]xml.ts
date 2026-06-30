import { createFileRoute } from '@tanstack/react-router';
import { MACHINE_READABLE_LOCALE } from '@/lib/machine-readable-docs';
import { getOpenApiMarkdownPages } from '@/lib/openapi/markdown';
import { createSitemapXml, getSitemapUrls } from '@/lib/sitemap';
import { source } from '@/lib/source';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      async GET() {
        return new Response(
          createSitemapXml(
            getSitemapUrls({
              openApiPages: await getOpenApiMarkdownPages(),
              pages: source.getPages(MACHINE_READABLE_LOCALE),
            }),
          ),
          {
            headers: {
              'Content-Type': 'application/xml',
            },
          },
        );
      },
    },
  },
});
