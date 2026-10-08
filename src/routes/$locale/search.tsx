import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsShell } from '@/components/docs-shell/DocsShell';
import { DocsSearchPage } from '@/components/search/DocsSearchPage';
import { getDocsPagePayload } from '@/lib/docs-page';
import type {
  DocsPagePayload,
  DocsRedirectPayload,
} from '@/lib/docs-page.server';
import { isPublishedDocLocale } from '@/lib/docs-routing';
import {
  readStaticDocsPayload,
  shouldUseStaticDocsPayload,
} from '@/lib/docs-static-manifest';
import { parseSearchPageState } from '@/lib/search/search-page-state';

export const Route = createFileRoute('/$locale/search')({
  validateSearch: parseSearchPageState,
  loader: async ({ params }) => {
    if (params.locale !== 'zh-CN' || !isPublishedDocLocale(params.locale))
      throw notFound();
    const input = {
      locale: params.locale,
      slugSegments: [],
      tab: 'introduction',
    };
    const payload = shouldUseStaticDocsPayload()
      ? await readStaticDocsPayload<DocsPagePayload | DocsRedirectPayload>(
          input,
        )
      : await getDocsPagePayload({ data: input });
    if (!payload || 'redirectUrl' in payload) throw notFound();
    return {
      tabs: payload.tabs,
      productScopes: payload.productScopes,
      localeLinks: payload.localeLinks,
    };
  },
  head: () => ({
    meta: [
      { title: '搜索文档 | 声网文档中心' },
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  component: SearchRoute,
});

function SearchRoute() {
  const state = Route.useSearch();
  const { locale } = Route.useParams();
  const payload = Route.useLoaderData();
  const navigate = Route.useNavigate();
  return (
    <DocsShell
      activePath={`/${locale}/search`}
      activeTab="search"
      hideToc
      layoutMode="search"
      loadPages={async () => []}
      locale={locale}
      localeLinks={payload.localeLinks}
      productScopes={payload.productScopes}
      sidebar={[]}
      tabs={payload.tabs}
      toc={[]}
    >
      <DocsSearchPage
        productScopes={payload.productScopes}
        state={state}
        onChange={(patch) => {
          void navigate({
            search: (previous) =>
              parseSearchPageState({
                ...previous,
                ...patch,
                page: patch.page ?? 1,
              }),
            resetScroll: patch.page !== undefined && patch.q === undefined,
          });
        }}
      />
    </DocsShell>
  );
}
