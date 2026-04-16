import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { source } from '@/lib/source';

export const Route = createFileRoute('/docs/')({
  loader: () => {
    const firstPage = source.getPages()[0];
    if (!firstPage) throw notFound();

    throw redirect({
      to: '/docs/$',
      params: {
        _splat: firstPage.slugs.join('/'),
      },
    });
  },
  component: () => null,
});
