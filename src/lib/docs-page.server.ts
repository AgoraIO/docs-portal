import { getSourceSlugs } from './docs-routing';
import {
  getPrevNextLinks,
  getSidebarEntries,
  getTabSummaries,
} from './docs-tree';

export async function loadDocsTabIndex(locale: string, tab: string) {
  const { source } = await import('./source.server');
  const page = source.getPage(
    getSourceSlugs({
      locale,
      tab,
    }),
  );

  if (!page) {
    return null;
  }

  return {
    locale,
    tab,
  };
}

export async function loadDocsPagePayload(
  locale: string,
  tab: string,
  slug: string,
) {
  const { source } = await import('./source.server');
  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      tab,
    }),
  );

  if (!page) {
    return null;
  }

  const pageTree = source.getPageTree(locale);

  return {
    activePath: page.url,
    activeTab: tab,
    description: page.data.description,
    navigation: getPrevNextLinks(pageTree, page.url),
    pages: source.getPages(locale).map((item) => ({
      description: item.data.description,
      title: item.data.title ?? item.slugs.at(-1) ?? item.url,
      url: item.url,
    })),
    sidebar: getSidebarEntries(pageTree, tab),
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc: (page.data.toc ?? []).map((item) => ({
      depth: item.depth,
      title: typeof item.title === 'string' ? item.title : '',
      url: item.url,
    })),
  };
}
