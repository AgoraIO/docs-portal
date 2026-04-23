import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';

export const Route = createFileRoute('/docs/')({
  loader: async () => {
    const firstPage = await getFirstPage();
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

const getFirstPage = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const { source } = await import('@/lib/source');
    const firstPage = source.getPages()[0];

    return firstPage
      ? {
          slugs: firstPage.slugs,
        }
      : null;
  });
