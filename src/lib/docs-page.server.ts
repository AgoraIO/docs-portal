import { buildDocPath } from './docs-routing';
import { getDocsManifest } from './docs-manifest.server';
import { loadDocsLitePagePayload } from './docs-payload-lite.server';

export async function loadDocsTabIndex(locale: string, tab: string) {
  const page = getDocsManifest().pagesByRoutePath.get(`/${locale}/${tab}`);

  if (page) {
    return {
      locale,
      url: page.routePath,
      tab,
    };
  }

  const { loadDocsTabIndexHeavy } = await import('./docs-page-heavy.server');
  return loadDocsTabIndexHeavy(locale, tab);
}

export async function loadDocsSearchIndex() {
  const manifest = getDocsManifest();

  return manifest.pages.map((page) => ({
    description: page.description,
    title: page.title,
    url: page.routePath,
  }));
}

export async function loadDocsPageToc(contentPath: string) {
  const { loadDocsPageTocHeavy } = await import('./docs-page-heavy.server');
  return loadDocsPageTocHeavy(contentPath);
}

export async function loadDocsPagePayload(
  locale: string,
  tab: string,
  slugSegments: string[],
  includeSidebar = true,
) {
  if (!includeSidebar) {
    const litePayload = loadDocsLitePagePayload(locale, tab, slugSegments);
    if (litePayload) {
      return litePayload;
    }
  }

  const { loadDocsPagePayloadHeavy } = await import('./docs-page-heavy.server');
  return loadDocsPagePayloadHeavy(locale, tab, slugSegments, includeSidebar);
}

export type DocsPagePayload = Exclude<
  Awaited<ReturnType<typeof loadDocsPagePayload>>,
  null | { redirectUrl: string }
>;

export type DocsPageUrl = ReturnType<typeof buildDocPath>;
