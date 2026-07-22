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

// A search scope the user can narrow to. `filter` is an Algolia filter
// expression over the already-indexed `product`/`tab` fields, so scoping needs
// no re-sync. `group` is the section header shown in the scope dropdown.
export type ProductScope = {
  description?: string;
  filter: string;
  group?: string;
  id: string;
  label: string;
};

export type SidebarEntry =
  | {
      external?: boolean;
      href?: string;
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
  external?: boolean;
  href?: string;
  id: string;
  linked?: boolean;
  method?: string;
  pickerItems?: DocsSidebarPickerItem[];
  title: string;
  type: 'page';
  url: string;
};

export type DocsSidebarPickerItem = {
  platformId: string;
  title: string;
  url: string;
};

export type DocsSidebarSectionNode = {
  children: DocsSidebarNode[];
  collapsible?: boolean;
  // When explicitly `false`, the section starts collapsed even when it (or one of
  // its children) is the active page — used for hub folders like FAQ whose landing
  // page already lists its children, so auto-expanding the sidebar is redundant.
  defaultOpen?: boolean;
  icon?: string;
  id: string;
  title: string;
  type: 'section';
  url?: string;
};

export type DocsSidebarNode = DocsSidebarPageNode | DocsSidebarSectionNode;

export type DocsBreadcrumbItem = {
  title: string;
  url?: string;
};

export type DocsSidebarGroupMetadata = {
  collapsible?: boolean;
  sidebarHidden?: boolean;
  title: string;
};

const STRUCTURED_GROUP_FLAG_PATTERN = /\{(dropdown|flat|hidden)\}$/;

// Tabs whose second-level folders are genuine products (Voice, Video, …) and so
// expand into per-product search scopes. Other tabs are offered as a single
// tab-level scope; onboarding tabs aren't useful scopes at all.
const PRODUCT_SCOPE_TAB_IDS = new Set(['realtime-media', 'solutions']);
const NON_SCOPE_TAB_IDS = new Set(['introduction', 'best-practices']);

export function getProductScopes(root: Root): ProductScope[] {
  return getTabNodes(root).flatMap((node): ProductScope[] => {
    const item = getTabIndex(node);
    const tabId = getTabIdFromNode(node);
    if (!tabId || NON_SCOPE_TAB_IDS.has(tabId)) {
      return [];
    }

    const tabLabel =
      node.type === 'folder'
        ? normalizeLabel(node.name, tabId)
        : normalizeLabel(item?.name, tabId);

    if (PRODUCT_SCOPE_TAB_IDS.has(tabId) && node.type === 'folder') {
      return node.children.flatMap((child): ProductScope[] => {
        if (child.type !== 'folder') {
          return [];
        }

        const childIndex = getTabIndex(child);
        // Product id = the folder's URL segment after locale + tab, which is
        // exactly the value the index stores in `product`.
        const productId = childIndex?.url.split('/').filter(Boolean)[2];
        if (!productId) {
          return [];
        }

        const scope: ProductScope = {
          filter: `product:"${productId}"`,
          group: tabLabel,
          id: `product:${productId}`,
          label: normalizeLabel(child.name, productId),
        };

        if (typeof childIndex.description === 'string') {
          scope.description = childIndex.description;
        }

        return [scope];
      });
    }

    // A whole tab (e.g. AI, Reference) as one scope.
    const scope: ProductScope = {
      filter: `tab:"${tabId}"`,
      id: `tab:${tabId}`,
      label: tabLabel,
    };

    if (typeof item?.description === 'string') {
      scope.description = item.description;
    }

    return [scope];
  });
}

export function getTabSummaries(root: Root): TabSummary[] {
  return getTabNodes(root).flatMap((node) => {
    const item = getTabIndex(node);
    const id = getTabIdFromNode(node);
    if (!id) {
      return [];
    }

    const url =
      item?.url ??
      (node.type === 'folder' ? getFirstDescendantPageUrl(node) : null);
    if (!url) {
      return [];
    }

    const summary: TabSummary = {
      id,
      title:
        node.type === 'folder'
          ? normalizeLabel(node.name, id)
          : normalizeLabel(item?.name, id),
      url,
    };

    if (typeof item?.description === 'string') {
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
    return [pageTreeItemToSidebarEntry(tabNode, activeTab)];
  }

  if (tabNode.type !== 'folder') {
    return [];
  }

  const entries: SidebarEntry[] = [];
  const indexItem = getTabIndex(tabNode);
  const indexUrl = indexItem?.url;

  if (indexItem) {
    entries.push(pageTreeItemToSidebarEntry(indexItem, activeTab));
  }

  let hideCurrentGroup = false;
  for (const node of tabNode.children) {
    if (node.type === 'separator') {
      hideCurrentGroup =
        parseSidebarGroupMetadata(node.name).sidebarHidden === true;
    } else if (hideCurrentGroup) {
      continue;
    }

    if (hideCurrentGroup) {
      continue;
    }

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
    return [pageTreeItemToSidebarPageNode(tabNode, activeTab)];
  }

  if (tabNode.type !== 'folder') {
    return [];
  }

  const nodes: DocsSidebarNode[] = [];
  const indexItem = tabNode.index;
  const indexUrl = indexItem?.url;
  let pendingIndexNode: DocsSidebarPageNode | null = indexItem
    ? pageTreeItemToSidebarPageNode(indexItem, activeTab)
    : null;
  if (pendingIndexNode) {
    nodes.push(pendingIndexNode);
    pendingIndexNode = null;
  }

  let currentSection: DocsSidebarSectionNode | null = null;
  let hideCurrentGroup = false;

  for (const child of tabNode.children) {
    if (child.type === 'separator') {
      const group = parseSidebarGroupMetadata(child.name);
      const title = group.title;
      currentSection = null;
      hideCurrentGroup = group.sidebarHidden === true;

      if (!hideCurrentGroup && title.length > 0) {
        const icon = getConfiguredIconName(child);
        currentSection = {
          children: [],
          collapsible: group.collapsible ?? isCollapsibleSectionTitle(title),
          ...(icon ? { icon } : {}),
          id: `separator-${title}`,
          title,
          type: 'section',
        };
        nodes.push(currentSection);
      }

      continue;
    }

    if (hideCurrentGroup) {
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
      }

      if (currentSection) {
        currentSection.children.push(node);
      } else {
        nodes.push(node);
      }
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
      ...(entry.external ? { external: true } : {}),
      ...(entry.href ? { href: entry.href } : {}),
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

export function pageTreeNodeToSidebarNodes(
  node: Node,
  sidebarLabels: Record<string, string> = {},
): DocsSidebarNode[] {
  if (node.type === 'separator') {
    return [];
  }

  if (node.type === 'page') {
    return [
      pageTreeItemToSidebarPageNode(node, undefined, {
        title: sidebarLabels[node.url],
      }),
    ];
  }

  if (node.type !== 'folder') {
    return [];
  }

  // A folder whose index shares the folder's title keeps a `url` on its section
  // (so it stays a collapsible toggle at the root) while still showing the index
  // as an "Overview" child so the landing page remains reachable.
  const indexLinksHeader = Boolean(
    node.index &&
      normalizeLabel(node.index.name, '') === normalizeLabel(node.name, ''),
  );

  const children: DocsSidebarNode[] = [];
  let pendingIndexNode: DocsSidebarPageNode | null =
    node.index &&
    !shouldHideFolderIndexInSidebar(node.index, node.name, node.children)
      ? pageTreeItemToSidebarPageNode(node.index, undefined, {
          title:
            sidebarLabels[node.index.url] ??
            getFolderIndexTitle(node.index, node.name),
        })
      : null;
  let currentSection: DocsSidebarSectionNode | null = null;
  let hideCurrentGroup = false;

  // A folder's own index can also appear in its `children` (e.g. when meta lists
  // `pages: ["index"]`). Skip that duplicate so the index is only represented once
  // (as the section's "Overview" child or, for index-only folders, as a leaf).
  const indexUrl = node.index?.url;
  const visibleChildren = node.children.filter(
    (child) => !(child.type === 'page' && child.url === indexUrl),
  );

  // An index-only folder whose index is exposed as its single page child (Fumadocs
  // does this for `pages: ["index"]`) collapses to one leaf link carrying the
  // folder's title — e.g. an FAQ category folder becomes a flat "Integration" link.
  // The child is the folder's own index (not a deeper sub-page) when its last URL
  // segment matches the folder slug, or when localized titles hide the canonical
  // URL slug but the child title still matches the folder title.
  const nonSeparatorChildren = visibleChildren.filter(
    (child) => child.type !== 'separator',
  );
  const onlyChild = nonSeparatorChildren[0];
  if (
    !node.index &&
    nonSeparatorChildren.length === 1 &&
    onlyChild.type === 'page' &&
    isExposedFolderIndexChild(onlyChild, node.name)
  ) {
    return [
      pageTreeItemToSidebarPageNode(onlyChild, undefined, {
        title:
          sidebarLabels[onlyChild.url] ??
          normalizeLabel(node.name, onlyChild.url),
      }),
    ];
  }

  for (const child of visibleChildren) {
    if (child.type === 'separator') {
      const group = parseSidebarGroupMetadata(child.name);
      const title = group.title;
      currentSection = null;
      hideCurrentGroup = group.sidebarHidden === true;

      if (!hideCurrentGroup && title.length > 0) {
        const icon = getConfiguredIconName(child);
        currentSection = {
          children: [],
          collapsible: group.collapsible ?? isCollapsibleSectionTitle(title),
          ...(icon ? { icon } : {}),
          id: `separator-${title}`,
          title,
          type: 'section',
        };
        children.push(currentSection);
      }

      continue;
    }

    if (hideCurrentGroup) {
      continue;
    }

    for (const sidebarNode of pageTreeNodeToSidebarNodes(
      child,
      sidebarLabels,
    )) {
      if (pendingIndexNode) {
        if (currentSection) {
          currentSection.children.push(pendingIndexNode);
        } else {
          children.push(pendingIndexNode);
        }
        pendingIndexNode = null;
      }

      if (currentSection) {
        currentSection.children.push(sidebarNode);
      } else {
        children.push(sidebarNode);
      }
    }
  }

  // Rule: an index-only folder collapses to a single leaf link.
  // Fires before flushing the pending index so that children.length reflects
  // only real built children (not the index itself).
  const hasRealChildren = visibleChildren.some((c) => c.type !== 'separator');
  if (!hasRealChildren && node.index) {
    return [
      pageTreeItemToSidebarPageNode(node.index, undefined, {
        title:
          sidebarLabels[node.index.url] ??
          normalizeLabel(node.name, node.index.url),
      }),
    ];
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
      // Honor an explicit `defaultOpen: false` from the folder's meta so hub
      // folders (e.g. FAQ) stay collapsed even when active.
      ...(node.defaultOpen === false ? { defaultOpen: false } : {}),
      ...(icon ? { icon } : {}),
      // Rule: a folder whose index matches its title links the header to it.
      ...(indexLinksHeader && node.index ? { url: node.index.url } : {}),
      id: `folder-${String(node.$id ?? node.name ?? 'folder')}`,
      title:
        (node.index ? sidebarLabels[node.index.url] : undefined) ??
        normalizeLabel(node.name, node.index?.url ?? 'Folder'),
      type: 'section',
    },
  ];
}

type PageUrlPredicate = (url: string) => boolean;

export function getPrevNextLinks(
  root: Root,
  currentUrl: string,
  isValidPageUrl?: PageUrlPredicate,
) {
  if (!isValidPageUrl) {
    const neighbours = findNeighbour(root, currentUrl);

    return {
      next: neighbours.next ? mapPageLink(neighbours.next) : undefined,
      previous: neighbours.previous
        ? mapPageLink(neighbours.previous)
        : undefined,
    };
  }

  const pages = collectPageTreeItems(root, isValidPageUrl);
  const index = pages.findIndex((item) => item.url === currentUrl);

  const next = index >= 0 ? pages[index + 1] : undefined;
  const previous = index >= 0 ? pages[index - 1] : undefined;

  return {
    next: next ? mapPageLink(next) : undefined,
    previous: previous ? mapPageLink(previous) : undefined,
  };
}

export function getPrevNextLinksFromNode(
  node: Folder | Root,
  currentUrl: string,
  isValidPageUrl?: PageUrlPredicate,
) {
  if (node.type === 'folder') {
    return getPrevNextLinks(
      {
        children: [node],
        name: 'Scoped root',
      },
      currentUrl,
      isValidPageUrl,
    );
  }

  return getPrevNextLinks(node, currentUrl, isValidPageUrl);
}

function collectPageTreeItems(
  node: Node | Root,
  isValidPageUrl: PageUrlPredicate,
): Item[] {
  if ('type' in node && node.type === 'page') {
    return isValidPageUrl(node.url) ? [node] : [];
  }

  if ('type' in node && node.type !== 'folder') {
    return [];
  }

  const items: Item[] = [];

  if ('index' in node && node.index && isValidPageUrl(node.index.url)) {
    items.push(node.index);
  }

  for (const child of node.children) {
    items.push(...collectPageTreeItems(child, isValidPageUrl));
  }

  return items;
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
    return getTabIdFromNode(node) === activeTab;
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
    const group = parseSidebarGroupMetadata(node.name);

    return [
      {
        ...(group.collapsible !== undefined
          ? { collapsible: group.collapsible }
          : {}),
        ...(icon ? { icon } : {}),
        id: `${prefix}separator-${group.title || 'unnamed'}`,
        title: group.title,
        type: 'separator',
      },
    ];
  }

  if (node.type === 'page') {
    return [pageTreeItemToSidebarEntry(node)];
  }

  if (node.type !== 'folder') {
    return [];
  }

  const childEntries: SidebarEntry[] = [];

  let hideCurrentGroup = false;
  for (const child of node.children) {
    if (child.type === 'separator') {
      hideCurrentGroup =
        parseSidebarGroupMetadata(child.name).sidebarHidden === true;
    } else if (hideCurrentGroup) {
      continue;
    }

    if (hideCurrentGroup) {
      continue;
    }

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
    entries.push(
      pageTreeItemToSidebarEntry(node.index, undefined, {
        title: getFolderIndexTitle(node.index, node.name),
      }),
    );
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

function pageTreeItemToSidebarEntry(
  item: Item,
  fallback?: string,
  overrides: { title?: string } = {},
): Extract<SidebarEntry, { type: 'page' }> {
  return {
    ...(item.external ? { external: true } : {}),
    ...(item.external ? { href: item.url } : {}),
    id: item.url,
    title: overrides.title ?? normalizeLabel(item.name, fallback ?? item.url),
    type: 'page',
    url: item.url,
  };
}

function pageTreeItemToSidebarPageNode(
  item: Item,
  fallback?: string,
  overrides: { title?: string } = {},
): DocsSidebarPageNode {
  return {
    ...(item.external ? { external: true } : {}),
    ...(item.external ? { href: item.url } : {}),
    id: item.url,
    title: overrides.title ?? normalizeLabel(item.name, fallback ?? item.url),
    type: 'page',
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

  if (node.url === activePath) {
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

const KNOWN_ROOT_TAB_IDS = [
  'api-reference',
  'best-practices',
  'realtime-media',
  'introduction',
  'solutions',
  'sdks',
  'ai',
] as const;

const ROOT_TAB_IDS_BY_TITLE: Record<
  string,
  (typeof KNOWN_ROOT_TAB_IDS)[number]
> = {
  'API 参考': 'api-reference',
  AI: 'ai',
  介绍: 'introduction',
  实时互动: 'realtime-media',
  解决方案: 'solutions',
};

function getTabIdFromNode(node: Node) {
  const item = getTabIndex(node);
  const urlTabId = item ? getTabIdFromUrl(item.url) : undefined;

  if (urlTabId) {
    return urlTabId;
  }

  if (node.type !== 'folder') {
    return undefined;
  }

  const nodeId = typeof node.$id === 'string' ? node.$id : '';
  const idTab = KNOWN_ROOT_TAB_IDS.find(
    (tabId) =>
      nodeId === tabId ||
      nodeId === `${tabId}-folder` ||
      nodeId.endsWith(`-${tabId}`) ||
      nodeId.endsWith(`-${tabId}-folder`),
  );

  if (idTab) {
    return idTab;
  }

  if (typeof node.name === 'string' && ROOT_TAB_IDS_BY_TITLE[node.name]) {
    return ROOT_TAB_IDS_BY_TITLE[node.name];
  }

  const nameSlug = folderSlug(node.name);
  return /^[a-z0-9-]+$/.test(nameSlug) ? nameSlug : undefined;
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

function lastUrlSegment(url: string): string {
  return url.split('/').filter(Boolean).at(-1)?.toLowerCase() ?? '';
}

function folderSlug(name: ReactNode): string {
  return normalizeLabel(name, '').toLowerCase().replace(/\s+/g, '-');
}

function isExposedFolderIndexChild(child: Item, folderName: ReactNode) {
  const childTitle = normalizeLabel(child.name, child.url);
  const normalizedFolderName = normalizeLabel(folderName, childTitle);

  return (
    lastUrlSegment(child.url) === folderSlug(folderName) ||
    childTitle === normalizedFolderName
  );
}

export function getConfiguredIconName(node: Node, fallback?: Item) {
  if ('icon' in node && typeof node.icon === 'string' && node.icon.length > 0) {
    return node.icon;
  }

  return typeof fallback?.icon === 'string' && fallback.icon.length > 0
    ? fallback.icon
    : undefined;
}

export function isCollapsibleSectionTitle(title: string) {
  return (
    title === 'SDK Quickstarts' ||
    title === 'SDK 快速开始' ||
    title === 'Realtime' ||
    title === '实时互动' ||
    title === 'Extensions' ||
    title === '扩展能力' ||
    title === 'Media Infrastructure' ||
    title === '媒体基础设施' ||
    title === 'Server APIs' ||
    title === 'Console and analytics'
  );
}

export function parseSidebarGroupMetadata(
  value: ReactNode,
): DocsSidebarGroupMetadata {
  if (typeof value !== 'string' || value.length === 0) {
    return {
      title: '',
    };
  }

  const flagMatch = value.match(STRUCTURED_GROUP_FLAG_PATTERN);
  if (!flagMatch) {
    return {
      title: value,
    };
  }

  return {
    ...(flagMatch[1] === 'hidden'
      ? { sidebarHidden: true }
      : { collapsible: flagMatch[1] === 'dropdown' }),
    title: value.slice(0, flagMatch.index).trimEnd(),
  };
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
