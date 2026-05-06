import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';

export const Route = createFileRoute('/$lang/docs/')({
  loader: async ({ params }) => {
    const firstPage = await getFirstPage({ data: params.lang });
    if (!firstPage) throw notFound();

    throw redirect({
      to: '/$lang/docs/$',
      params: {
        lang: params.lang,
        _splat: firstPage.slugs.join('/'),
      },
    });
  },
  component: () => null,
});

const getFirstPage = createServerFn({ method: 'GET' })
  .inputValidator((lang: string) => lang)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: lang }) => {
    const { source } = await import('@/lib/source');
    const firstPage = source.getPages(lang)[0];

    return firstPage
      ? {
          slugs: firstPage.slugs,
        }
      : null;
  });
