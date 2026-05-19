import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { DocsShell } from '@/components/docs-shell/DocsShell';
import { getDocsPagePayload, getDocsTabIndex } from '@/lib/docs-page';
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

    if (page.url === `/${params.locale}/${params.tab}`) {
      const payload = await getDocsPagePayload({
        data: {
          locale: params.locale,
          slugSegments: [],
          tab: params.tab,
        },
      });

      if (!payload) {
        throw notFound();
      }

      return {
        ...payload,
      };
    }

    throw redirect({
      href: page.url,
    });
  },
  component: Page,
});

function Page() {
  const {
    activePath,
    activeTab,
    breadcrumb,
    contentPath,
    description,
    markdownUrl,
    navigation,
    pages,
    sidebar,
    slug,
    tabs,
    toc,
    title,
  } = Route.useLoaderData();

  return (
    <DocsShell
      activePath={activePath}
      activeTab={activeTab}
      locale={Route.useParams().locale}
      next={navigation.next}
      pages={pages}
      previous={navigation.previous}
      sidebar={sidebar}
      tabs={tabs}
      toc={toc}
    >
      <DocsContent
        breadcrumb={breadcrumb}
        contentPath={contentPath}
        description={description}
        markdownUrl={markdownUrl}
        slug={slug}
        title={title}
        toc={toc}
      />
    </DocsShell>
  );
}
