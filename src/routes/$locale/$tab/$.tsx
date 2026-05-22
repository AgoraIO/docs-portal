import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload } from '@/lib/docs-page';
import { isSupportedDocLocale } from '@/lib/docs-routing';

export const Route = createFileRoute('/$locale/$tab/$')({
  loader: async ({ params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    const slugSegments = (params._splat ?? '').split('/').filter(Boolean);

    const payload = await getDocsPagePayload({
      data: {
        locale: params.locale,
        slugSegments,
        tab: params.tab,
      },
    });

    if (!payload) {
      throw notFound();
    }

    if ('redirectUrl' in payload) {
      throw redirect({
        href: payload.redirectUrl,
      });
    }

    return {
      ...payload,
    };
  },
  component: Page,
});

function Page() {
  const {
    body,
    breadcrumb,
    contentPath,
    description,
    markdownUrl,
    slug,
    toc,
    title,
  } = Route.useLoaderData();

  return (
    <DocsContent
      body={body}
      breadcrumb={breadcrumb}
      contentPath={contentPath}
      description={description}
      markdownUrl={markdownUrl}
      slug={slug}
      title={title}
      toc={toc}
    />
  );
}
