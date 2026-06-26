import { createFileRoute, notFound } from '@tanstack/react-router';
import { normalizeLocale } from '@/lib/i18n/i18n-config';

export const Route = createFileRoute('/__static/docs-search/$')({
  server: {
    handlers: {
      GET: ({ params }) => getDocsSearchIndexResponse(params._splat),
    },
  },
});

export async function getDocsSearchIndexResponse(fileName = '') {
  if (!fileName.endsWith('.json')) {
    throw notFound();
  }

  const locale = normalizeLocale(fileName.replace(/\.json$/, ''));

  if (!locale) {
    throw notFound();
  }

  const { loadDocsSearchIndex } = await import('@/lib/docs-page.server');

  return Response.json(await loadDocsSearchIndex(locale));
}
