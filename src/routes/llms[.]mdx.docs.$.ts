import { createFileRoute, notFound } from '@tanstack/react-router';
import { getSourceSlugsFromContentPath } from '@/lib/docs-routing';
import { normalizeLocale } from '@/lib/i18n/i18n-config';

export const Route = createFileRoute('/llms.mdx/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getLLMText, source } = await import('@/lib/source');
        const slugs = getSourceSlugsFromContentPath(params._splat ?? '');
        const locale = normalizeLocale(
          params._splat?.split('/').filter(Boolean)[0],
        );
        const page = source.getPage(slugs, locale ?? undefined);
        if (!page) {
          const { getOpenApiMarkdownByContentPath } = await import(
            '@/lib/openapi/markdown'
          );
          const openApiMarkdown = await getOpenApiMarkdownByContentPath(
            params._splat ?? '',
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

        return new Response(await getLLMText(page), {
          headers: {
            'Content-Type': 'text/markdown',
          },
        });
      },
    },
  },
});
