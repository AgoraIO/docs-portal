import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload, getDocsTabIndex } from '@/lib/docs-page';
import { isSidebarDeferredContentPath } from '@/lib/docs-source-buckets';
import { isSupportedDocLocale } from '@/lib/docs-routing';

export const Route = createFileRoute('/$locale/$tab/')({
  loader: async ({ params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    const page = await getDocsTabIndex({
      data: {
        locale: params.locale,
        tab: params.tab,
      },
    });

    if (!page) {
      throw notFound();
    }

    if (page.url !== `/${params.locale}/${params.tab}`) {
      throw redirect({
        href: page.url,
      });
    }

    const payload = await getDocsPagePayload({
      data: {
        includeSidebar: !isSidebarDeferredContentPath(
          `${params.locale}/${params.tab}.mdx`,
        ),
        locale: params.locale,
        slugSegments: [],
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
  component: TabIndexPage,
});

function TabIndexPage() {
  const params = Route.useParams();
  const {
    activePath,
    body,
    breadcrumb,
    contentPath,
    description,
    markdownUrl,
    sidebarHeader,
    slug,
    toc,
    title,
  } = Route.useLoaderData();

  return (
    <DocsContent
      activePath={body?.kind === 'mdx' ? activePath : undefined}
      body={body}
      breadcrumb={breadcrumb}
      contentPath={contentPath}
      description={description}
      locale={params.locale}
      markdownUrl={markdownUrl}
      sidebarHeader={sidebarHeader}
      slug={slug}
      title={title}
      toc={toc}
    />
  );
}
