import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import { findNeighbour, getPageTreeRoots } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';
import { buildDocPath } from './docs-routing';

export type TabSummary = {
  description?: string;
  icon?: string;
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
      collapsible?: boolean;
      icon?: string;
      id: string;
      title: string;
      type: 'separator';
    };

export type DocsSidebarPageNode = {
  id: string;
  method?: string;
  title: string;
  type: 'page';
  url: string;
};

export type DocsSidebarSectionNode = {
  children: DocsSidebarNode[];
  collapsible?: boolean;
  icon?: string;
  id: string;
  title: string;
  type: 'section';
};

export type DocsSidebarNode = DocsSidebarPageNode | DocsSidebarSectionNode;

export type DocsBreadcrumbItem = {
  title: string;
  url?: string;
};

const HIDDEN_TAB_IDS = new Set(['best-practices']);

export function getTabSummaries(root: Root): TabSummary[] {
  return getTabNodes(root).flatMap((node) => {
    const item = getTabIndex(node);

    if (!item) {
      return [];
    }

    const id = getTabIdFromUrl(item.url);
    if (!id || HIDDEN_TAB_IDS.has(id)) {
      return [];
    }

    const summary: TabSummary = {
      id,
      title:
        node.type === 'folder'
          ? normalizeLabel(node.name, id)
          : normalizeLabel(item.name, id),
      url: item.url,
    };

    if (typeof item.description === 'string') {
      summary.description = item.description;
    }

    const icon = getConfiguredIconName(node, item);
    if (icon) {
      summary.icon = icon;
    }

    return [summary];
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

export function getSidebarNodes(
  root: Root,
  activeTab: string,
): DocsSidebarNode[] {
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

  const nodes: DocsSidebarNode[] = [];
  const indexItem = getTabIndex(tabNode);
  const indexUrl = indexItem?.url;
  let pendingIndexNode: DocsSidebarPageNode | null = indexItem
    ? {
        id: indexItem.url,
        title: normalizeLabel(indexItem.name, activeTab),
        type: 'page',
        url: indexItem.url,
      }
    : null;
  let hasEmittedContent = false;

  if (pendingIndexNode) {
    nodes.push(pendingIndexNode);
    pendingIndexNode = null;
    hasEmittedContent = true;
  }

  let currentSection: DocsSidebarSectionNode | null = null;

  for (const child of tabNode.children) {
    if (child.type === 'separator') {
      const title = typeof child.name === 'string' ? child.name : '';
      currentSection = null;

      if (title.length > 0) {
        const icon = getConfiguredIconName(child);
        currentSection = {
          children: [],
          collapsible: isCollapsibleSectionTitle(title),
          ...(icon ? { icon } : {}),
          id: `separator-${title}`,
          title,
          type: 'section',
        };
        nodes.push(currentSection);
        hasEmittedContent = true;
      }

      continue;
    }

    for (const node of pageTreeNodeToSidebarNodes(child)) {
      if (node.type === 'page' && node.url === indexUrl) {
        continue;
      }

      if (pendingIndexNode) {
        if (currentSection) {
          currentSection.children.push(pendingIndexNode);
        } else {
          nodes.push(pendingIndexNode);
        }
        pendingIndexNode = null;
        hasEmittedContent = true;
      }

      if (currentSection) {
        currentSection.children.push(node);
      } else {
        nodes.push(node);
      }
      hasEmittedContent = true;
    }
  }

  if (pendingIndexNode) {
    if (currentSection) {
      currentSection.children.push(pendingIndexNode);
    } else {
      nodes.push(pendingIndexNode);
    }
  }

  return nodes;
}

export function filterSidebarNodes(
  nodes: DocsSidebarNode[],
  predicate: (node: DocsSidebarNode) => boolean,
): DocsSidebarNode[] {
  const filtered: DocsSidebarNode[] = [];

  for (const node of nodes) {
    if (node.type === 'page') {
      if (predicate(node)) {
        filtered.push(node);
      }
      continue;
    }

    const children = filterSidebarNodes(node.children, predicate);
    if (children.length === 0) {
      continue;
    }

    filtered.push({
      ...node,
      children,
    });
  }

  return filtered;
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

    if (pendingSectionEntry && pendingSectionEntry.title.length > 0) {
      currentSection = {
        children: [],
        collapsible:
          pendingSectionEntry.collapsible ??
          isCollapsibleSectionTitle(pendingSectionEntry.title),
        ...(pendingSectionEntry.icon ? { icon: pendingSectionEntry.icon } : {}),
        id: pendingSectionEntry.id,
        title: pendingSectionEntry.title,
        type: 'section',
      };
      nodes.push(currentSection);
    }
    pendingSectionEntry = null;

    if (currentSection) {
      currentSection.children.push(pageNode);
    } else {
      nodes.push(pageNode);
    }
  }

  return nodes;
}

export function pageTreeNodeToSidebarNodes(node: Node): DocsSidebarNode[] {
  if (node.type === 'separator') {
    return [];
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

  const children: DocsSidebarNode[] = [];
  let pendingIndexNode: DocsSidebarPageNode | null =
    node.index &&
    !shouldHideFolderIndexInSidebar(node.index, node.name, node.children)
      ? {
          id: node.index.url,
          title: getFolderIndexTitle(node.index, node.name),
          type: 'page',
          url: node.index.url,
        }
      : null;
  let hasEmittedContent = false;
  let currentSection: DocsSidebarSectionNode | null = null;

  for (const child of node.children) {
    if (child.type === 'separator') {
      const title = typeof child.name === 'string' ? child.name : '';
      currentSection = null;

      if (title.length > 0) {
        const icon = getConfiguredIconName(child);
        currentSection = {
          children: [],
          collapsible: isCollapsibleSectionTitle(title),
          ...(icon ? { icon } : {}),
          id: `separator-${title}`,
          title,
          type: 'section',
        };
        children.push(currentSection);
        hasEmittedContent = true;
      }

      continue;
    }

    for (const sidebarNode of pageTreeNodeToSidebarNodes(child)) {
      if (pendingIndexNode) {
        if (currentSection) {
          currentSection.children.push(pendingIndexNode);
        } else {
          children.push(pendingIndexNode);
        }
        pendingIndexNode = null;
        hasEmittedContent = true;
      }

      if (currentSection) {
        currentSection.children.push(sidebarNode);
      } else {
        children.push(sidebarNode);
      }
      hasEmittedContent = true;
    }
  }

  if (pendingIndexNode) {
    if (currentSection) {
      currentSection.children.push(pendingIndexNode);
    } else {
      children.push(pendingIndexNode);
    }
  }

  const icon = getConfiguredIconName(node, node.index);

  return [
    {
      children,
      collapsible: true,
      ...(icon ? { icon } : {}),
      id: `folder-${String(node.$id ?? node.name ?? 'folder')}`,
      title: normalizeLabel(node.name, node.index?.url ?? 'Folder'),
      type: 'section',
    },
  ];
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

export function getSidebarBreadcrumb(
  nodes: DocsSidebarNode[],
  activePath: string,
): DocsBreadcrumbItem[] {
  for (const node of nodes) {
    const result = findSidebarBreadcrumb(node, activePath);

    if (result) {
      return result;
    }
  }

  return [];
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

export function getFirstChildPageUrl(
  root: Root,
  activeTab: string,
  slugSegments: string[],
) {
  const tabNode = findTabNode(root, activeTab);

  if (!tabNode || tabNode.type !== 'folder') {
    return null;
  }

  const targetNode = findNodeBySlugSegments(tabNode, slugSegments);

  if (!targetNode || targetNode.type !== 'folder') {
    return null;
  }

  return getFirstDescendantPageUrl(targetNode);
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

function findNodeBySlugSegments(
  node: Node,
  slugSegments: string[],
): Node | undefined {
  if (slugSegments.length === 0) {
    return node;
  }

  if (node.type !== 'folder') {
    return undefined;
  }

  const [segment, ...rest] = slugSegments;
  const child = node.children.find((candidate) => {
    if (candidate.type !== 'folder') {
      return false;
    }

    const slug = candidate.index?.url.split('/').filter(Boolean).at(-1);
    return slug === segment;
  });

  if (!child) {
    return undefined;
  }

  return findNodeBySlugSegments(child, rest);
}

function getFirstDescendantPageUrl(node: Folder): string | null {
  for (const child of node.children) {
    if (child.type === 'page') {
      return child.url;
    }

    if (child.type === 'folder') {
      const directIndex = child.index?.url;
      if (directIndex) {
        return directIndex;
      }

      const nested = getFirstDescendantPageUrl(child);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function flattenSidebarNode(node: Node, prefix = ''): SidebarEntry[] {
  if (node.type === 'separator') {
    const icon = getConfiguredIconName(node);

    return [
      {
        ...(icon ? { icon } : {}),
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

  const childEntries: SidebarEntry[] = [];

  for (const child of node.children) {
    childEntries.push(
      ...flattenSidebarNode(child, `${node.$id ?? node.name}-`),
    );
  }

  if (childEntries.length === 0 && !node.index) {
    return [];
  }

  const icon = getConfiguredIconName(node, node.index);
  const entries: SidebarEntry[] = [
    {
      collapsible: true,
      ...(icon ? { icon } : {}),
      id: `${prefix}separator-${String(node.$id ?? node.name ?? 'folder')}`,
      title: normalizeLabel(node.name, node.index?.url ?? 'Folder'),
      type: 'separator',
    },
  ];

  if (node.index) {
    entries.push({
      id: node.index.url,
      title: getFolderIndexTitle(node.index, node.name),
      type: 'page',
      url: node.index.url,
    });
  }

  entries.push(...childEntries);

  return entries;
}

function mapPageLink(item: Item) {
  return {
    title: normalizeLabel(item.name, item.url),
    url: item.url,
  };
}

function findSidebarBreadcrumb(
  node: DocsSidebarNode,
  activePath: string,
): DocsBreadcrumbItem[] | null {
  if (node.type === 'page') {
    if (node.url !== activePath) {
      return null;
    }

    return [
      {
        title: node.title,
        url: node.url,
      },
    ];
  }

  for (const child of node.children) {
    const childBreadcrumb = findSidebarBreadcrumb(child, activePath);

    if (childBreadcrumb) {
      return [
        {
          title: node.title,
        },
        ...childBreadcrumb,
      ];
    }
  }

  return null;
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

function getConfiguredIconName(node: Node, fallback?: Item) {
  if ('icon' in node && typeof node.icon === 'string' && node.icon.length > 0) {
    return node.icon;
  }

  return typeof fallback?.icon === 'string' && fallback.icon.length > 0
    ? fallback.icon
    : undefined;
}

function isCollapsibleSectionTitle(title: string) {
  return (
    title === 'SDK Quickstarts' ||
    title === 'SDK 快速开始' ||
    title === 'Realtime' ||
    title === '实时互动' ||
    title === 'Extensions' ||
    title === '扩展能力' ||
    title === 'Media Infrastructure' ||
    title === '媒体基础设施'
  );
}

function getFolderIndexTitle(index: Item, folderName: ReactNode) {
  const title = normalizeLabel(index.name, index.url);
  const normalizedFolderName = normalizeLabel(folderName, title);

  if (title !== normalizedFolderName) {
    return title;
  }

  return index.url.includes('/zh-CN/') ? '总览' : 'Overview';
}

function shouldHideFolderIndexInSidebar(
  index: Item,
  folderName: ReactNode,
  children: Node[],
) {
  const title = normalizeLabel(index.name, index.url);
  const normalizedFolderName = normalizeLabel(folderName, title);
  const normalizedIndexTitle =
    title === normalizedFolderName
      ? index.url.includes('/zh-CN/')
        ? '总览'
        : 'Overview'
      : title;

  const hasRealChildPages = children.some(
    (child) => child.type !== 'separator',
  );

  return hasRealChildPages && normalizedIndexTitle === normalizedFolderName;
}
