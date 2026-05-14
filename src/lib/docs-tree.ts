import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import { findNeighbour, getPageTreeRoots } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';
import { buildDocPath } from './docs-routing';

export type TabSummary = {
  description?: string;
  id: string;
  title: string;
  url: string;
};

export type SidebarEntry =
  | {
      id: string;
      title: string;
      type: 'page';
      url: string;
    }
  | {
      id: string;
      title: string;
      type: 'separator';
    };

export type DocsSidebarPageNode = {
  id: string;
  title: string;
  type: 'page';
  url: string;
};

export type DocsSidebarSectionNode = {
  children: DocsSidebarPageNode[];
  id: string;
  title: string;
  type: 'section';
};

export type DocsSidebarNode = DocsSidebarPageNode | DocsSidebarSectionNode;

export function getTabSummaries(root: Root): TabSummary[] {
  return getTabNodes(root).flatMap((node) => {
    const item = getTabIndex(node);

    if (!item) {
      return [];
    }

    const id = getTabIdFromUrl(item.url);
    if (!id) {
      return [];
    }

    return [
      {
        description:
          typeof item.description === 'string' ? item.description : undefined,
        id,
        title:
          node.type === 'folder'
            ? normalizeLabel(node.name, id)
            : normalizeLabel(item.name, id),
        url: item.url,
      },
    ];
  });
}

export function getSidebarEntries(
  root: Root,
  activeTab: string,
): SidebarEntry[] {
  const tabNode = findTabNode(root, activeTab);

  if (!tabNode) {
    return [];
  }

  if (tabNode.type === 'page') {
    return [
      {
        id: tabNode.url,
        title: normalizeLabel(tabNode.name, activeTab),
        type: 'page',
        url: tabNode.url,
      },
    ];
  }

  if (tabNode.type !== 'folder') {
    return [];
  }

  const entries: SidebarEntry[] = [];
  const indexItem = getTabIndex(tabNode);
  const indexUrl = indexItem?.url;

  if (indexItem) {
    entries.push({
      id: indexItem.url,
      title: normalizeLabel(indexItem.name, activeTab),
      type: 'page',
      url: indexItem.url,
    });
  }

  for (const node of tabNode.children) {
    entries.push(
      ...flattenSidebarNode(node).filter(
        (entry) => entry.type !== 'page' || entry.url !== indexUrl,
      ),
    );
  }

  return entries;
}

export function mapSidebarEntriesToTree(
  entries: SidebarEntry[],
): DocsSidebarNode[] {
  const nodes: DocsSidebarNode[] = [];
  let currentSection: DocsSidebarSectionNode | null = null;
  let pendingSectionEntry: Extract<SidebarEntry, { type: 'separator' }> | null =
    null;

  for (const entry of entries) {
    if (entry.type === 'separator') {
      currentSection = null;
      pendingSectionEntry = entry;
      continue;
    }

    const pageNode: DocsSidebarPageNode = {
      id: entry.id,
      title: entry.title,
      type: 'page',
      url: entry.url,
    };

    if (pendingSectionEntry) {
      currentSection = {
        children: [],
        id: pendingSectionEntry.id,
        title: pendingSectionEntry.title,
        type: 'section',
      };
      nodes.push(currentSection);
      pendingSectionEntry = null;
    }

    if (currentSection) {
      currentSection.children.push(pageNode);
    } else {
      nodes.push(pageNode);
    }
  }

  return nodes;
}

export function getPrevNextLinks(root: Root, currentUrl: string) {
  const neighbours = findNeighbour(root, currentUrl);

  return {
    next: neighbours.next ? mapPageLink(neighbours.next) : undefined,
    previous: neighbours.previous
      ? mapPageLink(neighbours.previous)
      : undefined,
  };
}

export function buildPublicDocUrl(locale: string, tab: string, slug?: string) {
  return buildDocPath(locale, tab, slug);
}

export function getFirstTabPageUrl(root: Root, activeTab: string) {
  const tabNode = findTabNode(root, activeTab);

  if (!tabNode) {
    return null;
  }

  const item = getTabIndex(tabNode);
  return item?.url ?? null;
}

function getTabIndex(node: Node): Item | undefined {
  if (node.type === 'page') {
    return node;
  }

  if (node.type === 'folder') {
    if (node.index) {
      return node.index;
    }

    return node.children.find((child): child is Item => child.type === 'page');
  }

  return undefined;
}

function findTabNode(root: Root, activeTab: string): Node | undefined {
  return getTabNodes(root).find((node) => {
    const item = getTabIndex(node);
    if (!item) {
      return false;
    }

    return getTabIdFromUrl(item.url) === activeTab;
  });
}

function flattenSidebarNode(node: Node, prefix = ''): SidebarEntry[] {
  if (node.type === 'separator') {
    return [
      {
        id: `${prefix}separator-${String(node.name ?? 'unnamed')}`,
        title: typeof node.name === 'string' ? node.name : '',
        type: 'separator',
      },
    ];
  }

  if (node.type === 'page') {
    return [
      {
        id: node.url,
        title: normalizeLabel(node.name, node.url),
        type: 'page',
        url: node.url,
      },
    ];
  }

  if (node.type !== 'folder') {
    return [];
  }

  const entries: SidebarEntry[] = [];

  if (node.index) {
    entries.push({
      id: node.index.url,
      title: normalizeLabel(node.index.name, node.index.url),
      type: 'page',
      url: node.index.url,
    });
  }

  for (const child of node.children) {
    entries.push(...flattenSidebarNode(child, `${node.$id ?? node.name}-`));
  }

  return entries;
}

function mapPageLink(item: Item) {
  return {
    title: normalizeLabel(item.name, item.url),
    url: item.url,
  };
}

function getTabIdFromUrl(url: string) {
  const segments = url.split('/').filter(Boolean);
  return segments[1];
}

function getTabNodes(root: Root): Node[] {
  const localeFolder = root.children.find(
    (node): node is Folder =>
      node.type === 'folder' && node.children.some(isTabRootFolder),
  );

  if (localeFolder) {
    return localeFolder.children.filter(
      (node): node is Folder => node.type === 'folder' && node.root === true,
    );
  }

  const nestedRoots = getPageTreeRoots(root).filter(
    (node): node is Folder => node.type === 'folder' && node.root === true,
  );

  if (nestedRoots.length > 0) {
    return nestedRoots;
  }

  return root.children;
}

function isTabRootFolder(node: Node): node is Folder {
  return node.type === 'folder' && node.root === true;
}

function normalizeLabel(value: ReactNode, fallback: string) {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return fallback;
}
