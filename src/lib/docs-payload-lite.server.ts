import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDocPath } from './docs-routing';
import { getDocsManifest } from './docs-manifest.server';
import { SUPPORTED_LOCALES, type AppLocale } from './i18n/i18n-config';

export type DocsLitePagePayload = {
  activePath: string;
  activeTab: string;
  body: {
    contentPath: string;
    kind: 'mdx';
  };
  breadcrumb: {
    title: string;
    url?: string;
  }[];
  contentPath: string;
  description?: string;
  localeLinks: {
    href: string;
    isActive: boolean;
    locale: AppLocale;
  }[];
  markdownUrl?: string;
  navigation: {
    next?: { title: string; url: string };
    previous?: { title: string; url: string };
  };
  layoutMode: 'docs';
  sidebar: [];
  slug?: string;
  title: string;
  toc: [];
};

export function loadDocsLitePagePayload(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  const manifest = getDocsManifest();
  const routePath = buildDocPath(locale, tab, slugSegments);
  const page = manifest.pagesByRoutePath.get(routePath);

  if (!page) {
    return null;
  }

  const localePages = manifest.pagesByLocale[page.locale];
  const pageIndex = localePages.findIndex(
    (candidate) => candidate.routePath === page.routePath,
  );
  const previousPage = pageIndex > 0 ? localePages[pageIndex - 1] : undefined;
  const nextPage =
    pageIndex >= 0 && pageIndex < localePages.length - 1
      ? localePages[pageIndex + 1]
      : undefined;

  return {
    activePath: page.routePath,
    activeTab: tab,
    body: {
      contentPath: page.contentPath,
      kind: 'mdx' as const,
    },
    breadcrumb: [
      {
        title: page.title,
        url: page.routePath,
      },
    ],
    contentPath: page.contentPath,
    description: page.description,
    layoutMode: 'docs' as const,
    localeLinks: SUPPORTED_LOCALES.map((targetLocale) => ({
      href:
        manifest.pagesByRoutePath.get(
          buildDocPath(targetLocale, tab, slugSegments),
        )?.routePath ?? `/${targetLocale}/introduction`,
      isActive: targetLocale === locale,
      locale: targetLocale,
    })),
    navigation: {
      next: nextPage
        ? { title: nextPage.title, url: nextPage.routePath }
        : undefined,
      previous: previousPage
        ? { title: previousPage.title, url: previousPage.routePath }
        : undefined,
    },
    sidebar: [],
    slug: page.slugSegments.at(-1),
    title: page.title,
    toc: [],
  } satisfies DocsLitePagePayload;
}
