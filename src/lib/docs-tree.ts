import type { Item, Node, Root } from 'fumadocs-core/page-tree';
import { findNeighbour } from 'fumadocs-core/page-tree';
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

export function getTabSummaries(root: Root): TabSummary[] {
  return root.children.flatMap((node) => {
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
        title: normalizeLabel(item.name, id),
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

  return tabNode.children.flatMap((node) => flattenSidebarNode(node));
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

function getTabIndex(node: Node): Item | undefined {
  if (node.type === 'page') {
    return node;
  }

  if (node.type === 'folder') {
    return node.index;
  }

  return undefined;
}

function findTabNode(root: Root, activeTab: string): Node | undefined {
  return root.children.find((node) => {
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

function normalizeLabel(value: ReactNode, fallback: string) {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return fallback;
}
