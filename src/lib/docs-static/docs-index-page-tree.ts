import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import type { DocsMeta } from '../docs-meta-schema';
import type { AppLocale } from '../i18n/i18n-config';
import type { DocsIndex, DocsIndexNode, DocsIndexPage } from './docs-index-types';

type CompatibleMeta = {
  data: DocsMeta;
};

const SEPARATOR_PATTERN = /^---(?:\[(?<icon>[^\]]+)])?(?<title>.+)---$/;

export function getDocsIndexCompatiblePageTree(
  index: DocsIndex,
  locale: AppLocale,
): Root {
  const localeNode = materializeFolderNode(index, locale);

  return {
    children: [localeNode],
    name: 'Docs',
  };
}

export function getDocsIndexCompatibleNodeMeta(
  index: DocsIndex,
  node: Folder | Root,
): CompatibleMeta | undefined {
  if (typeof node.$id !== 'string') {
    return undefined;
  }

  const docsNode = index.nodesByKey.get(node.$id);
  return docsNode?.meta ? { data: docsNode.meta } : undefined;
}

export function getDocsIndexPageByUrl(index: DocsIndex, url: string) {
  return index.pagesByRoutePath.get(url) ?? null;
}

export function getDocsIndexPageBySourceSlugs(
  index: DocsIndex,
  locale: AppLocale,
  slugs: string[],
) {
  return (
    index.pagesByLocale[locale].find(
      (page) =>
        page.sourceSlugs.length === slugs.length &&
        page.sourceSlugs.every((segment, index) => segment === slugs[index]),
    ) ?? null
  );
}

function materializeFolderNode(index: DocsIndex, key: string): Folder {
  const node = index.nodesByKey.get(key);

  if (!node || node.type !== 'folder') {
    throw new Error(`Unknown docs index folder "${key}"`);
  }

  const folderChildren = node.children
    .map((childKey) => index.nodesByKey.get(childKey))
    .filter((child): child is DocsIndexNode => Boolean(child));
  const indexPage = resolveFolderIndexPage(folderChildren);
  const orderedChildren = orderFolderChildren(node, folderChildren, indexPage);
  const meta = node.meta;

  return {
    $id: node.key,
    children: orderedChildren.map((child) => materializeCompatibleChild(index, child)),
    ...(indexPage ? { index: materializePageNode(indexPage) } : {}),
    ...(typeof meta?.icon === 'string' ? { icon: meta.icon } : {}),
    name: meta?.title ?? node.name,
    ...(meta?.root === true ? { root: true } : {}),
    type: 'folder',
  };
}

function materializePageNode(page: DocsIndexPage): Item {
  return {
    $id: page.contentPath.replace(/\.(md|mdx)$/, ''),
    name: page.title,
    type: 'page',
    url: page.routePath,
  };
}

function resolveFolderIndexPage(children: DocsIndexNode[]) {
  return children.find(
    (child) =>
      child.type === 'page' &&
      child.page?.slugSegments.length === 0,
  )?.page;
}

function orderFolderChildren(
  folder: DocsIndexNode,
  children: DocsIndexNode[],
  indexPage?: DocsIndexPage,
) {
  const pageOrder = folder.meta?.pages;
  if (!pageOrder?.length) {
    return children.filter((child) => {
      if (child.type === 'folder') {
        return true;
      }

      return child.page?.routePath !== indexPage?.routePath;
    });
  }

  const bySlug = new Map<string, DocsIndexNode>();
  for (const child of children) {
    const slug = child.key.split('/').at(-1);
    if (slug) {
      bySlug.set(slug, child);
    }
  }

  const ordered: Array<DocsIndexNode | CompatibleSeparatorNode> = [];
  const consumedKeys = new Set<string>();
  for (const entry of pageOrder) {
    const separator = parseSeparator(entry);
    if (separator) {
      ordered.push(separator);
      continue;
    }

    const child = bySlug.get(entry);
    if (child && child.page?.routePath !== indexPage?.routePath) {
      ordered.push(child);
      consumedKeys.add(child.key);
      bySlug.delete(entry);
    }
  }

  const remaining = children.filter((child) => {
    if (consumedKeys.has(child.key)) {
      return false;
    }

    if (child.type === 'folder') {
      return true;
    }

    return child.page?.routePath !== indexPage?.routePath;
  });

  return [...ordered, ...remaining];
}

function toIndexPageFromNode(node: DocsIndexNode): DocsIndexPage {
  if (!node.page) {
    throw new Error(`Docs index page node "${node.key}" is missing page data`);
  }

  return node.page;
}

function materializeCompatibleChild(
  index: DocsIndex,
  child: DocsIndexNode | CompatibleSeparatorNode,
): Node {
  if (isCompatibleSeparatorNode(child)) {
    return {
      ...(child.icon ? { icon: child.icon } : {}),
      name: child.name,
      type: 'separator',
    };
  }

  if (child.type === 'folder') {
    return materializeFolderNode(index, child.key);
  }

  return materializePageNode(child.page ?? toIndexPageFromNode(child));
}

function parseSeparator(value: string): CompatibleSeparatorNode | null {
  const match = value.match(SEPARATOR_PATTERN);
  if (!match?.groups?.title) {
    return null;
  }

  return {
    ...(match.groups.icon ? { icon: match.groups.icon } : {}),
    name: match.groups.title,
    type: 'separator',
  };
}

function isCompatibleSeparatorNode(
  value: DocsIndexNode | CompatibleSeparatorNode,
): value is CompatibleSeparatorNode {
  return value.type === 'separator';
}

type CompatibleSeparatorNode = {
  icon?: string;
  name: string;
  type: 'separator';
};
