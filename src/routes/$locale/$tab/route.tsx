import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
  useMatch,
} from '@tanstack/react-router';
import { DocsShell } from '@/components/docs-shell/DocsShell';
import { getDocsTabIndex } from '@/lib/docs-page';
import type { DocsPagePayload } from '@/lib/docs-page.server';
import { isSupportedDocLocale } from '@/lib/docs-routing';
import { readStaticDocsSearchIndex } from '@/lib/docs-search-index';

export const Route = createFileRoute('/$locale/$tab')({
  server: {
    handlers: {
      GET: async ({ next, params }) => {
        const { getPublicDocsMarkdownResponse } = await import(
          '@/lib/docs-markdown.server'
        );
        const response = await getPublicDocsMarkdownResponse({
          locale: params.locale,
          slugSegments: [],
          tab: params.tab,
        });

        return response ?? next();
      },
    },
  },
  loader: async ({ location, params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    const tabPath = `/${params.locale}/${params.tab}`;
    if (normalizePathname(location.pathname) !== tabPath) {
      return null;
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

    if (page.url !== tabPath) {
      throw redirect({
        href: preserveRedirectSearch(page.url, location),
      });
    }

    return null;
  },
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
    contentPath,
    localeLinks,
    layoutMode,
    hideToc,
    navigation,
    productScopes,
    sidebar,
    sidebarHeader,
    tabs,
    toc,
  } = payload;

  return (
    <DocsShell
      activePath={activePath}
      activeTab={activeTab}
      contentPath={contentPath}
      loadPages={() => readStaticDocsSearchIndex(params.locale)}
      localeLinks={localeLinks}
      layoutMode={layoutMode}
      hideToc={hideToc}
      locale={params.locale}
      next={navigation.next}
      previous={navigation.previous}
      productScopes={productScopes}
      sidebar={sidebar}
      sidebarHeader={sidebarHeader}
      tabs={tabs}
      toc={toc}
    >
      <Outlet />
    </DocsShell>
  );
}

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function preserveRedirectSearch(
  href: string,
  location: { hash?: string; searchStr?: string },
) {
  if (/[?#]/.test(href)) {
    return href;
  }

  return `${href}${location.searchStr ?? ''}${location.hash ?? ''}`;
}
