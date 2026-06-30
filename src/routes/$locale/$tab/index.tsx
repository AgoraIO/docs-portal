import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload, getDocsTabIndex } from '@/lib/docs-page';
import type {
  DocsPagePayload,
  DocsRedirectPayload,
} from '@/lib/docs-page.server';
import { preloadDocsPageContent } from '@/lib/docs-route-preload';
import { isSupportedDocLocale } from '@/lib/docs-routing';
import {
  readStaticDocsPayload,
  shouldUseStaticDocsPayload,
} from '@/lib/docs-static-manifest';
import { resolveStaticLegacySitemapRedirect } from '@/lib/legacy-sitemap/static-redirects';
import { createDocsRouteSeoHead } from '@/lib/static-seo';

export const Route = createFileRoute('/$locale/$tab/')({
  loader: async ({ location, params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    if (shouldUseStaticDocsPayload()) {
      const legacyRedirect = resolveStaticLegacySitemapRedirect(
        `/${params.locale}/${params.tab}`,
        location.searchStr,
      );

      if (legacyRedirect) {
        throw redirect({
          href: preserveRedirectSearch(
            legacyRedirect.redirectUrl,
            location,
            legacyRedirect.preserveSearch,
          ),
        });
      }
    }

    const payload = shouldUseStaticDocsPayload()
      ? await readStaticDocsPayload<DocsPagePayload | DocsRedirectPayload>({
          locale: params.locale,
          slugSegments: [],
          tab: params.tab,
        })
      : await (async () => {
          const page = await getDocsTabIndex({
            data: {
              locale: params.locale,
              tab: params.tab,
            },
          });

          if (!page) {
            return null;
          }

          if (page.url !== `/${params.locale}/${params.tab}`) {
            throw redirect({
              href: preserveRedirectSearch(page.url, location),
            });
          }

          return getDocsPagePayload({
            data: {
              locale: params.locale,
              search: location.searchStr,
              slugSegments: [],
              tab: params.tab,
            },
          });
        })();

    if (!payload) {
      throw notFound();
    }

    if ('redirectUrl' in payload) {
      const { redirectUrl } = payload;
      const preserveSearch =
        'preserveSearch' in payload ? payload.preserveSearch : true;

      if (!redirectUrl) {
        throw notFound();
      }

      throw redirect({
        href: preserveRedirectSearch(redirectUrl, location, preserveSearch),
      });
    }

    await preloadDocsPageContent(payload);

    return {
      ...payload,
    };
  },
  head: ({ loaderData }) =>
    loaderData ? createDocsRouteSeoHead(loaderData) : {},
  component: TabIndexPage,
});

function TabIndexPage() {
  const params = Route.useParams();
  const {
    body,
    breadcrumb,
    contentPath,
    description,
    layoutMode,
    hideToc,
    markdownUrl,
    sidebarHeader,
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
      layoutMode={layoutMode}
      hideToc={hideToc}
      locale={params.locale}
      markdownUrl={markdownUrl}
      sidebarHeader={sidebarHeader}
      slug={slug}
      title={title}
      toc={toc}
    />
  );
}

function preserveRedirectSearch(
  href: string,
  location: { hash?: string; searchStr?: string },
  preserveSearch = true,
) {
  if (/[?#]/.test(href)) {
    return href;
  }

  return `${href}${preserveSearch ? (location.searchStr ?? '') : ''}${location.hash ?? ''}`;
}
