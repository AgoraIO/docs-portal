import { createFileRoute, notFound } from '@tanstack/react-router';
import { getSourceSlugsFromContentPath } from '@/lib/docs-routing';

export const Route = createFileRoute('/llms.mdx/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getLLMText, source } = await import('@/lib/source');
        const slugs = getSourceSlugsFromContentPath(params._splat ?? '');
        const page = source.getPage(slugs);
        if (!page) throw notFound();

        return new Response(await getLLMText(page), {
          headers: {
            'Content-Type': 'text/markdown',
          },
        });
      },
    },
  },
});
