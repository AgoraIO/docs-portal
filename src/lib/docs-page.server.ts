import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import { getSourceSlugs } from './docs-routing';
import {
  getFirstChildPageUrl,
  getFirstTabPageUrl,
  getPrevNextLinks,
  getSidebarNodes,
  getTabSummaries,
} from './docs-tree';
import type { PageWithSource } from './source.server';

export async function loadDocsTabIndex(locale: string, tab: string) {
  const { source } = await import('./source.server');
  const pageTree = source.getPageTree(locale);
  const tabSummaries = getTabSummaries(pageTree);
  const tabSummary = tabSummaries.find((item) => item.id === tab);

  if (tabSummary?.url === `/${locale}/${tab}`) {
    return {
      locale,
      url: tabSummary.url,
      tab,
    };
  }

  const firstPageUrl = getFirstTabPageUrl(pageTree, tab);

  if (!firstPageUrl) {
    return null;
  }

  return {
    locale,
    url: firstPageUrl,
    tab,
  };
}

export async function loadDocsPagePayload(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  const { source } = await import('./source.server');
  const slug = slugSegments.at(-1) ?? 'index';
  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      slugSegments,
      tab,
    }),
    locale,
  );

  if (!page) {
    const pageTree = source.getPageTree(locale);
    const fallbackUrl = getFirstChildPageUrl(pageTree, tab, slugSegments);

    if (fallbackUrl) {
      return {
        redirectUrl: fallbackUrl,
      };
    }

    return null;
  }

  const pageTree = source.getPageTree(locale);
  const toc = await resolvePageToc(page);

  return {
    activePath: page.url,
    activeTab: tab,
    contentPath: page.path,
    description: page.data.description,
    navigation: getPrevNextLinks(pageTree, page.url),
    pages: source.getPages(locale).map((item) => ({
      description: item.data.description,
      title: item.data.title ?? item.slugs.at(-1) ?? item.url,
      url: item.url,
    })),
    sidebar: getSidebarNodes(pageTree, tab),
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc,
  };
}

async function resolvePageToc(page: PageWithSource) {
  const directToc = normalizeToc(page.data.toc);

  if (directToc.length > 0) {
    return directToc;
  }

  try {
    const processedMarkdown = await page.data.getText('processed');
    return normalizeToc(await getTableOfContents(processedMarkdown));
  } catch {
    return [];
  }
}

function normalizeToc(toc: TOCItemType[] | undefined) {
  return (toc ?? []).flatMap((item) => {
    if (
      typeof item.title !== 'string' ||
      item.title.trim().length === 0 ||
      typeof item.url !== 'string' ||
      item.url.length === 0
    ) {
      return [];
    }

    return [
      {
        depth: item.depth,
        title: item.title,
        url: item.url,
      },
    ];
  });
}
