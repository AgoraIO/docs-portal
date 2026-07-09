import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { ensureDocsLastUpdatedMetadata } from '@/lib/docs-last-updated';
import { getDocsPagePayload } from '@/lib/docs-page';
import type {
  DocsPagePayload,
  DocsRedirectPayload,
} from '@/lib/docs-page.server';
import { resolveMovedDocsRedirect } from '@/lib/docs-moved-redirects';
import { preloadDocsPageContent } from '@/lib/docs-route-preload';
import { isPublishedDocLocale } from '@/lib/docs-routing';
import {
  resolvePlatformStaticDocsPayload,
  shouldUseStaticDocsPayload,
} from '@/lib/docs-static-manifest';
import { resolveStaticLegacySitemapRedirect } from '@/lib/legacy-sitemap/static-redirects';
import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from '@/lib/platforms/registry';
import { recordRecentPage } from '@/lib/recently-viewed';
import { createDocsRouteSeoHead } from '@/lib/static-seo';

export const Route = createFileRoute('/$locale/$tab/$')({
  server: {
    handlers: {
      GET: async ({ next, params }) => {
        const { getPublicDocsMarkdownResponse } = await import(
          '@/lib/docs-markdown.server'
        );
        const response = await getPublicDocsMarkdownResponse({
          locale: params.locale,
          slugSegments: (params._splat ?? '').split('/').filter(Boolean),
          tab: params.tab,
        });

        return response ?? next();
      },
    },
  },
  loader: async ({ location, params }) => {
    if (!isPublishedDocLocale(params.locale)) {
      throw notFound();
    }

    const slugSegments = (params._splat ?? '').split('/').filter(Boolean);
    const movedDocsRedirect = resolveMovedDocsRedirect(
      params.locale,
      params.tab,
      slugSegments,
    );

    if (movedDocsRedirect) {
      throw redirect({
        href: preserveRedirectSearch(movedDocsRedirect, location),
      });
    }

    if (shouldUseStaticDocsPayload()) {
      const legacyRedirect = resolveStaticLegacySitemapRedirect(
        `/${[params.locale, params.tab, ...slugSegments].join('/')}`,
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

    const loadPayload = (segments: string[]) =>
      shouldUseStaticDocsPayload()
        ? resolvePlatformStaticDocsPayload<
            DocsPagePayload | DocsRedirectPayload
          >({
            locale: params.locale,
            slugSegments: segments,
            tab: params.tab,
          })
        : getDocsPagePayload({
            data: {
              locale: params.locale,
              search: location.searchStr,
              slugSegments: segments,
              tab: params.tab,
            },
          });

    let payload = await loadPayload(slugSegments);
    const queryPlatform = getKnownPlatformSearchParam(location.searchStr);

    if (
      payload &&
      queryPlatform &&
      !slugAlreadyTargetsPlatform(slugSegments) &&
      payloadSupportsPlatform(payload, queryPlatform)
    ) {
      const platformPayload = await loadPayload([
        ...slugSegments,
        queryPlatform,
      ]);

      if (platformPayload && !('redirectUrl' in platformPayload)) {
        payload = platformPayload;
      }
    }

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

    return normalizeDocsPagePayload(payload);
  },
  head: ({ loaderData }) =>
    loaderData ? createDocsRouteSeoHead(loaderData) : {},
  component: Page,
});

function Page() {
  const params = Route.useParams();
  const {
    body,
    breadcrumb,
    contentPath,
    description,
    lastUpdated,
    layoutMode,
    hideToc,
    markdownUrl,
    sidebarHeader,
    slug,
    toc,
    title,
  } = Route.useLoaderData();

  // Remember this page so the search dialog can offer it under "Recent". Keyed
  // on the resolved title so a client-side navigation to another page re-records.
  useEffect(() => {
    if (typeof window === 'undefined' || !title) {
      return;
    }
    recordRecentPage({
      description,
      title,
      url: window.location.pathname,
    });
  }, [description, title]);

  return (
    <DocsContent
      body={body}
      breadcrumb={breadcrumb}
      contentPath={contentPath}
      description={description}
      lastUpdated={lastUpdated}
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

function normalizeDocsPagePayload(payload: DocsPagePayload): DocsPagePayload {
  return {
    ...payload,
    lastUpdated: ensureDocsLastUpdatedMetadata(payload.lastUpdated),
  };
}

export function getKnownPlatformSearchParam(searchStr?: string) {
  const platform = new URLSearchParams(searchStr ?? '').get('platform');
  const normalizedPlatform = platform ? normalizePlatformKey(platform) : null;

  return normalizedPlatform && isKnownPlatform(normalizedPlatform)
    ? normalizedPlatform
    : undefined;
}

export function payloadSupportsPlatform(
  payload: DocsPagePayload | DocsRedirectPayload,
  platform: PlatformKey,
) {
  const platformTabs = getPayloadPlatformTabs(payload);

  if (!platformTabs) {
    return false;
  }

  try {
    const platforms = JSON.parse(platformTabs.platforms) as unknown;
    return Array.isArray(platforms) && platforms.includes(platform);
  } catch {
    return false;
  }
}

function getPayloadPlatformTabs(
  payload: DocsPagePayload | DocsRedirectPayload,
) {
  if ('redirectUrl' in payload || payload.body.kind === 'openapi') {
    return undefined;
  }

  return payload.body.platformTabs;
}

function slugAlreadyTargetsPlatform(slugSegments: string[]) {
  const lastSegment = slugSegments.at(-1);

  return lastSegment ? isKnownPlatform(lastSegment) : false;
}
