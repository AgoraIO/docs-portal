import type { DocsMeta } from '../docs-meta-schema';
import type { AppLocale } from '../i18n/i18n-config';
import type { DocsIndex, DocsIndexNode, DocsIndexPage } from './docs-index-types';

export function getDocsIndexPages(index: DocsIndex, locale?: AppLocale) {
  if (!locale) {
    return index.pages;
  }

  return index.pagesByLocale[locale];
}

export function getDocsIndexPage(
  index: DocsIndex,
  slugs: string[],
  locale?: AppLocale,
) {
  if (!locale) {
    return index.pages.find((page) => matchesSlugs(page, slugs)) ?? null;
  }

  return index.pagesByLocale[locale].find((page) => matchesSlugs(page, slugs)) ?? null;
}

export function getDocsIndexNodeMeta(index: DocsIndex, key: string) {
  return index.nodesByKey.get(key)?.meta;
}

export function getDocsIndexPageTree(index: DocsIndex, locale: AppLocale) {
  return materializeNode(index, locale);
}

function materializeNode(index: DocsIndex, key: string): MaterializedDocsNode {
  const node = index.nodesByKey.get(key);

  if (!node) {
    throw new Error(`Unknown docs index node "${key}"`);
  }

  return {
    ...node,
    children: node.children.map((childKey) => materializeNode(index, childKey)),
  };
}

function matchesSlugs(page: DocsIndexPage, slugs: string[]) {
  if (slugs.length === 0) {
    return false;
  }

  return page.sourceSlugs.length === slugs.length
    && page.sourceSlugs.every((segment, index) => segment === slugs[index]);
}

export type MaterializedDocsNode = Omit<DocsIndexNode, 'children'> & {
  children: MaterializedDocsNode[];
};
