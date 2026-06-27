import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload } from '@/lib/docs-page';
import type { DocsPagePayload } from '@/lib/docs-page.server';
import { preloadDocsPageContent } from '@/lib/docs-route-preload';
import { isSupportedDocLocale } from '@/lib/docs-routing';
import {
  resolvePlatformStaticDocsPayload,
  shouldUseStaticDocsPayload,
} from '@/lib/docs-static-manifest';

export const Route = createFileRoute('/$locale/$tab/$')({
  loader: async ({ location, params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    const slugSegments = (params._splat ?? '').split('/').filter(Boolean);

    const payload = shouldUseStaticDocsPayload()
      ? await resolvePlatformStaticDocsPayload<
          DocsPagePayload | { redirectUrl: string }
        >({
          locale: params.locale,
          slugSegments,
          tab: params.tab,
        })
      : await getDocsPagePayload({
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
      const { redirectUrl } = payload;

      if (!redirectUrl) {
        throw notFound();
      }

      throw redirect({
        href: preserveRedirectSearch(redirectUrl, location),
      });
    }

    await preloadDocsPageContent(payload);

    return {
      ...payload,
    };
  },
  component: Page,
});

function Page() {
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
) {
  if (/[?#]/.test(href)) {
    return href;
  }

  return `${href}${location.searchStr ?? ''}${location.hash ?? ''}`;
}
