import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { DocsShell } from '@/components/docs-shell/DocsShell';
import { getContentPath } from '@/lib/docs-routing';
import { getDocsPagePayload } from '@/lib/docs-page';

export const Route = createFileRoute('/$locale/$tab/$slug')({
  loader: async ({ params }) => {
    const payload = await getDocsPagePayload({
      data: {
        locale: params.locale,
        slug: params.slug,
        tab: params.tab,
      },
    });

    if (!payload) {
      throw notFound();
    }

    return {
      contentPath: getContentPath({
        locale: params.locale,
        tab: params.tab,
        slug: params.slug,
      }),
      ...payload,
    };
  },
  component: Page,
});

function Page() {
  const {
    activePath,
    activeTab,
    contentPath,
    description,
    navigation,
    pages,
    sidebar,
    slug,
    tabs,
    toc,
    title,
  } =
    Route.useLoaderData();

  return (
    <DocsShell
      activePath={activePath}
      activeTab={activeTab}
      next={navigation.next}
      pages={pages}
      previous={navigation.previous}
      sidebar={sidebar}
      tabs={tabs}
      toc={toc}
    >
      <DocsContent
        contentPath={contentPath}
        description={description}
        slug={slug}
        title={title}
        toc={toc}
      />
    </DocsShell>
  );
}
