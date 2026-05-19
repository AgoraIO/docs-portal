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
      collapsible?: boolean;
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
  children: DocsSidebarNode[];
  collapsible?: boolean;
  id: string;
  title: string;
  type: 'section';
};

export type DocsSidebarNode = DocsSidebarPageNode | DocsSidebarSectionNode;

export type DocsBreadcrumbItem = {
  title: string;
  url?: string;
};

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
  let leadingSection = getLeadingSidebarSection(activeTab, indexUrl);

  if (indexItem) {
    const indexNode: DocsSidebarPageNode = {
      id: indexItem.url,
      title: normalizeLabel(indexItem.name, activeTab),
      type: 'page',
      url: indexItem.url,
    };

    if (leadingSection) {
      leadingSection.children.push(indexNode);
    } else {
      nodes.push(indexNode);
    }
  }

  let currentSection: DocsSidebarSectionNode | null = null;

  for (const child of tabNode.children) {
    if (child.type === 'separator') {
      if (leadingSection) {
        nodes.push(leadingSection);
        leadingSection = null;
      }

      const title = typeof child.name === 'string' ? child.name : '';
      currentSection = null;

      if (title.length > 0) {
        currentSection = {
          children: [],
          collapsible: isCollapsibleSectionTitle(title),
          id: `separator-${title}`,
          title,
          type: 'section',
        };
        nodes.push(currentSection);
      }

      continue;
    }

    for (const node of pageTreeNodeToSidebarNodes(child)) {
      if (node.type === 'page' && node.url === indexUrl) {
        continue;
      }

      if (leadingSection) {
        leadingSection.children.push(node);
      } else if (currentSection) {
        currentSection.children.push(node);
      } else {
        nodes.push(node);
      }
    }
  }

  if (leadingSection) {
    nodes.push(leadingSection);
  }

  return nodes;
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

  const children = node.children.flatMap((child) =>
    pageTreeNodeToSidebarNodes(child),
  );

  if (node.index) {
    children.unshift({
      id: node.index.url,
      title: getFolderIndexTitle(node.index, node.name),
      type: 'page',
      url: node.index.url,
    });
  }

  return [
    {
      children,
      collapsible: true,
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

  const childEntries: SidebarEntry[] = [];

  for (const child of node.children) {
    childEntries.push(
      ...flattenSidebarNode(child, `${node.$id ?? node.name}-`),
    );
  }

  if (childEntries.length === 0 && !node.index) {
    return [];
  }

  const entries: SidebarEntry[] = [
    {
      collapsible: true,
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

function getLeadingSidebarSection(activeTab: string, indexUrl?: string) {
  if (activeTab !== 'introduction') {
    return null;
  }

  const isChinese = indexUrl?.includes('/zh-CN/') ?? false;

  const section: DocsSidebarSectionNode = {
    children: [],
    collapsible: false,
    id: `separator-${isChinese ? '开始使用' : 'Get started'}`,
    title: isChinese ? '开始使用' : 'Get started',
    type: 'section',
  };

  return section;
}

function getFolderIndexTitle(index: Item, folderName: ReactNode) {
  const title = normalizeLabel(index.name, index.url);
  const normalizedFolderName = normalizeLabel(folderName, title);

  if (title !== normalizedFolderName) {
    return title;
  }

  return index.url.includes('/zh-CN/') ? '总览' : 'Overview';
}
