import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import { getSourceSlugs } from './docs-routing';
import {
  getFirstTabPageUrl,
  getPrevNextLinks,
  getSidebarBreadcrumb,
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
    return null;
  }

  const pageTree = source.getPageTree(locale);
  const processedText = await readProcessedText(page);
  const toc = await resolvePageToc(page, processedText);
  const sidebar = getSidebarNodes(pageTree, tab);
  const title = page.data.title ?? page.slugs.at(-1) ?? page.url;
  const breadcrumb = getSidebarBreadcrumb(sidebar, page.url);

  return {
    activePath: page.url,
    activeTab: tab,
    breadcrumb:
      breadcrumb.length > 0
        ? breadcrumb
        : [
            {
              title,
              url: page.url,
            },
          ],
    contentPath: page.path,
    description: page.data.description,
    navigation: getPrevNextLinks(pageTree, page.url),
    pages: source.getPages(locale).map((item) => ({
      description: item.data.description,
      title: item.data.title ?? item.slugs.at(-1) ?? item.url,
      url: item.url,
    })),
    readingTime: getReadingTime(processedText),
    sidebar,
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc,
  };
}

async function readProcessedText(page: PageWithSource) {
  try {
    return await page.data.getText('processed');
  } catch {
    return '';
  }
}

async function resolvePageToc(page: PageWithSource, processedText: string) {
  const directToc = normalizeToc(page.data.toc);

  if (directToc.length > 0) {
    return directToc;
  }

  try {
    return normalizeToc(await getTableOfContents(processedText));
  } catch {
    return [];
  }
}

function getReadingTime(text: string) {
  const words = text
    .replace(/[#*_`~>\-[\]()]/g, ' ')
    .replace(/[\u4e00-\u9fff]/g, ' $& ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    minutes: Math.max(1, Math.ceil(words / 220)),
    words,
  };
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
