import { createFileRoute, Outlet, useMatch } from '@tanstack/react-router';
import { DocsContentSideRail } from '@/components/docs-shell/DocsContent';
import { DocsShell } from '@/components/docs-shell/DocsShell';
import type { DocsPagePayload } from '@/lib/docs-page.server';

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
    body,
    localeLinks,
    layoutMode,
    navigation,
    pages,
    sidebar,
    sidebarHeader,
    tabs,
    toc,
  } = payload;

  return (
    <DocsShell
      activePath={activePath}
      activeTab={activeTab}
      localeLinks={localeLinks}
      layoutMode={layoutMode}
      locale={params.locale}
      next={navigation.next}
      pages={pages}
      previous={navigation.previous}
      sidebar={sidebar}
      sidebarHeader={sidebarHeader}
      sideRail={<DocsContentSideRail body={body} />}
      tabs={tabs}
      toc={toc}
    >
      <Outlet />
    </DocsShell>
  );
}
