import { createFileRoute, Outlet, useMatch } from '@tanstack/react-router';
import { DocsShell } from '@/components/docs-shell/DocsShell';
import type { DocsPagePayload } from '@/lib/docs-page.server';
import { readStaticDocsSearchIndex } from '@/lib/docs-search-index';

export const Route = createFileRoute('/$locale/$tab')({
  component: DocsTabLayout,
});

function DocsTabLayout() {
  const params = Route.useParams();
  const indexMatch = useMatch({
    from: '/$locale/$tab/',
    shouldThrow: false,
  });
  const pageMatch = useMatch({
    from: '/$locale/$tab/$',
    shouldThrow: false,
  });
  const payload = (pageMatch?.loaderData ?? indexMatch?.loaderData) as
    | DocsPagePayload
    | undefined;

  if (!payload) {
    return <Outlet />;
  }

  const {
    activePath,
    activeTab,
    localeLinks,
    layoutMode,
    navigation,
    sidebar,
    sidebarHeader,
    tabs,
    toc,
  } = payload;

  return (
    <DocsShell
      activePath={activePath}
      activeTab={activeTab}
      loadPages={() => readStaticDocsSearchIndex(params.locale)}
      localeLinks={localeLinks}
      layoutMode={layoutMode}
      locale={params.locale}
      next={navigation.next}
      previous={navigation.previous}
      sidebar={sidebar}
      sidebarHeader={sidebarHeader}
      tabs={tabs}
      toc={toc}
    >
      <Outlet />
    </DocsShell>
  );
}
