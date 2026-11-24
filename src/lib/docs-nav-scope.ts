import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';
import { resolveDocVersion } from './doc-versions';
import type {
  DocsMeta,
  DocsNavScope,
  DocsNavScopeVersion,
} from './docs-meta-schema';
import { isSamePathOrDescendant } from './docs-routing';
import {
  type DocsSidebarNode,
  getConfiguredIconName,
  getFirstTabPageUrl,
  getSidebarNodes,
  isCollapsibleSectionTitle,
  pageTreeNodeToSidebarNodes,
  parseSidebarGroupMetadata,
} from './docs-tree';

export type DocsSidebarHeaderVersion = {
  href: string;
  id: string;
  label: string;
};

export type DocsSidebarHeader = {
  backHref?: string;
  backLabel?: string;
  productDocsHref?: string;
  title: string;
  versionSwitcher?: {
    currentId: string;
    presentation?: 'dropdown' | 'tabs';
    versions: DocsSidebarHeaderVersion[];
  };
};

export type DocsNavScopeResolution = {
  activeVersion?: DocsNavScopeVersion & { node: Folder };
  header: DocsSidebarHeader;
  parentScope?: {
    href: string;
    node: Folder;
    title: string;
  };
  scope: {
    meta: DocsMeta;
    node: Folder;
  };
  sidebarRoot: Folder;
};

export type DocsNavScopeVersionLink = {
  href: string;
  id: string;
  label: string;
};

export type GetDocsNodeMeta = (node: Folder | Root) => DocsMeta | undefined;

type FolderAncestor = {
  meta?: DocsMeta;
  node: Folder;
};

export function resolveDocsNavScope({
  activePath: requestedActivePath,
  contentPath,
  getNodePath,
  getNodeMeta,
  root,
  tab,
}: {
  activePath: string;
  contentPath?: string;
  getNodePath?: (node: Folder) => string | undefined;
  getNodeMeta: GetDocsNodeMeta;
  root: Root;
  tab: string;
}): DocsNavScopeResolution | null {
  const activePath = requestedActivePath.split(/[?#]/)[0];
  const tabNode = findTabFolder(root, tab);
  if (!tabNode) {
    return null;
  }

  const documentVersion = resolveDocVersion(activePath);
  if (documentVersion) {
    const { scope, version } = documentVersion;
    const findVersionRoot = (node: Folder): Folder | undefined => {
      if (getFolderHref(node) === version.rootUrl) return node;
      for (const child of node.children) {
        if (child.type !== 'folder') continue;
        const match = findVersionRoot(child);
        if (match) return match;
      }
      return undefined;
    };
    const versionRoot = findVersionRoot(tabNode);
    if (versionRoot) {
      // Legacy ConvoAI roots contain Platform and independent products. Keep
      // only this edition's pages plus explicitly shared articles in its tree.
      const filterVersionNode = (node: Node): Node | undefined => {
        const ownsUrl = (url: string) => {
          const owner = resolveDocVersion(url);
          return (
            ((owner?.scope.preferenceKey ?? owner?.scope.id) ===
              (scope.preferenceKey ?? scope.id) &&
              owner?.version.id === version.id) ||
            version.navigationUrls?.includes(url) ||
            scope.sharedUrls?.includes(url)
          );
        };
        if (node.type === 'page') return ownsUrl(node.url) ? node : undefined;
        if (node.type !== 'folder') return node;
        const folderVersion = resolveDocVersion(getFolderHref(node));
        if (
          folderVersion?.scope.id === scope.id &&
          folderVersion.version.id !== version.id
        )
          return undefined;
        const children = node.children.flatMap((child) => {
          const filtered = filterVersionNode(child);
          return filtered ? [filtered] : [];
        });
        const { index, ...folder } = node;
        const visibleIndex = index && ownsUrl(index.url) ? index : undefined;
        if (
          !visibleIndex &&
          !children.some((child) => child.type !== 'separator')
        )
          return undefined;
        return {
          ...folder,
          ...(visibleIndex ? { index: visibleIndex } : {}),
          children,
        };
      };
      const sidebarRoot = version.restrictToMappedPages
        ? (filterVersionNode(versionRoot) as Folder)
        : versionRoot;
      return {
        header: {
          ...(!version.restrictToMappedPages
            ? {
                backHref: scope.entryUrl.split('/').slice(0, 3).join('/'),
                backLabel: normalizeLabel(tabNode.name, tab),
              }
            : {}),
          title: scope.label,
        },
        scope: { meta: getNodeMeta(versionRoot) ?? {}, node: versionRoot },
        sidebarRoot,
      };
    }
  }

  const ancestors = findFolderAncestorsByUrl(tabNode, activePath) ?? [];
  if (!ancestors.length && contentPath && getNodePath) {
    const visit = (node: Folder) => {
      const path = getNodePath(node);
      const directory = path?.slice(0, path.lastIndexOf('/') + 1);
      if (directory && contentPath.startsWith(directory)) ancestors.push(node);
      for (const child of node.children)
        if (child.type === 'folder') visit(child);
    };
    visit(tabNode);
    ancestors.sort(
      (a, b) => (getNodePath(a)?.length ?? 0) - (getNodePath(b)?.length ?? 0),
    );
  }

  const scopedAncestors = ancestors
    .map((node) => ({ meta: getNodeMeta(node), node }))
    .filter((item): item is FolderAncestor & { meta: DocsMeta } =>
      Boolean(item.meta?.navScope),
    );

  const scope =
    scopedAncestors.at(-1) ??
    (activePath.startsWith('/zh-CN/')
      ? findScopeByVersionHref(tabNode, activePath, getNodeMeta)
      : undefined);
  if (!scope) {
    return null;
  }

  const parentScope = findNearestVisibleParentScope(scopedAncestors);
  const versions = resolveContextVersions(
    scope.node,
    scope.meta.navScope,
    activePath,
  );
  const activeVersion = resolveActiveVersion({
    activePath,
    contentPath,
    getNodePath,
    scope: scope.node,
    versions,
  });
  const sidebarRoot = activeVersion?.node ?? scope.node;
  const backTarget = parentScope
    ? {
        href: getFolderHref(parentScope.node),
        node: parentScope.node,
        title: getMetaTitle(parentScope.meta, parentScope.node),
      }
    : {
        href: getFirstTabPageUrl(root, tab) ?? getFolderHref(tabNode),
        node: tabNode,
        title: normalizeLabel(tabNode.name, tab),
      };
  const header: DocsSidebarHeader = {
    backHref: backTarget.href,
    backLabel: backTarget.title,
    title: getMetaTitle(scope.meta, scope.node),
  };
  const versionSwitcher = buildVersionSwitcher({
    activePath,
    activeVersion,
    presentation: scope.meta.navScope?.presentation,
    scope: scope.node,
    versions,
  });

  if (versionSwitcher) {
    header.versionSwitcher = versionSwitcher;
  }

  return {
    ...(activeVersion ? { activeVersion } : {}),
    header,
    ...(parentScope
      ? {
          parentScope: {
            href: backTarget.href,
            node: parentScope.node,
            title: backTarget.title,
          },
        }
      : {}),
    scope: {
      meta: scope.meta,
      node: scope.node,
    },
    sidebarRoot,
  };
}

function findScopeByVersionHref(
  folder: Folder,
  activePath: string,
  getNodeMeta: GetDocsNodeMeta,
): (FolderAncestor & { meta: DocsMeta }) | undefined {
  const meta = getNodeMeta(folder);
  const contextPath = meta?.navScope?.versionOverrides?.length
    ? getScopeContextPath(folder, meta.navScope)
    : undefined;
  if (
    (contextPath && isSamePathOrDescendant(activePath, contextPath)) ||
    meta?.navScope?.versions?.some(
      (version) =>
        version.href && isSamePathOrDescendant(activePath, version.href),
    )
  ) {
    if (meta) return { meta, node: folder };
  }

  for (const child of folder.children) {
    if (child.type !== 'folder') {
      continue;
    }

    const scope = findScopeByVersionHref(child, activePath, getNodeMeta);
    if (scope) {
      return scope;
    }
  }

  return undefined;
}

function resolveContextVersions(
  scope: Folder,
  navScope: DocsNavScope | undefined,
  activePath: string,
): DocsNavScopeVersion[] | undefined {
  if (!navScope?.versionOverrides?.length) return navScope?.versions;

  const contextPath = getScopeContextPath(scope, navScope);
  if (!contextPath) return navScope.versions;

  const override = navScope.versionOverrides
    .filter(({ path }) =>
      isSamePathOrDescendant(activePath, `${contextPath}/${path}`),
    )
    .sort(
      (left, right) =>
        right.path.split('/').length - left.path.split('/').length,
    )
    .at(0);

  return override?.versions ?? navScope.versions;
}

function getScopeContextPath(
  scope: Folder,
  navScope: DocsNavScope,
): string | undefined {
  const urls = getLocalPageUrls(scope);
  const current = navScope.versions?.find(
    ({ id, path }) =>
      path === '.' &&
      id === (navScope.defaultVersion ?? navScope.versions?.[0]?.id),
  );
  const currentHref =
    current?.href?.startsWith('/') && !current.href.startsWith('//')
      ? current.href.split(/[?#]/)[0]
      : undefined;
  const anchor = currentHref ?? scope.index?.url;

  // A current href may be a landing page rather than the folder itself. Keep
  // cross-scope sidebar links out of this trusted local boundary calculation.
  if (anchor?.startsWith('/') && !anchor.startsWith('//')) {
    const path = anchor.replace(/\/$/, '');
    // Without an explicit current href, the canonical index is also the
    // version entry point. Cross-scope sidebar links cannot widen its boundary.
    if (!currentHref) return path;

    // Explicit override entry points also establish the directory boundary
    // when its descendants are hidden or absent from the visible page tree.
    const hasOverrideDescendant = navScope.versionOverrides?.some((override) =>
      override.versions.some(
        (version) =>
          version.path === '.' &&
          version.href &&
          isSamePathOrDescendant(
            version.href.split(/[?#]/)[0],
            `${path}/${override.path}`,
          ),
      ),
    );
    return urls.some((url) => url.startsWith(`${path}/`)) ||
      hasOverrideDescendant
      ? path
      : path.slice(0, path.lastIndexOf('/')) || undefined;
  }

  const [first, ...rest] = urls.map((url) => url.split('/'));
  if (!first) return undefined;

  const common = first.slice();
  for (const segments of rest) {
    while (!common.every((segment, index) => segments[index] === segment)) {
      common.pop();
    }
  }
  if (urls.length === 1) common.pop();
  return common.join('/') || undefined;
}

function getLocalPageUrls(folder: Folder): string[] {
  const pages = folder.index
    ? [folder.index, ...folder.children]
    : folder.children;
  return pages.flatMap((node) => {
    if (node.type === 'folder') return getLocalPageUrls(node);
    return node.type === 'page' &&
      !node.external &&
      node.url.startsWith('/') &&
      !node.url.startsWith('//')
      ? [node.url.split(/[?#]/)[0]]
      : [];
  });
}

export function getNavScopeSidebarNodes({
  getNodeMeta,
  root,
  tab,
}: {
  getNodeMeta: GetDocsNodeMeta;
  root: Root;
  tab: string;
}): DocsSidebarNode[] {
  const tabNode = findTabFolder(root, tab);
  if (!tabNode) {
    return getSidebarNodes(root, tab);
  }

  if (!hasNavScopeDescendant(tabNode, getNodeMeta)) {
    return getSidebarNodes(root, tab);
  }

  return flattenParentNavScopeSidebarNodes(tabNode, tab, getNodeMeta);
}

export function getScopedNavScopeSidebarNodes({
  getNodeMeta,
  navScope,
}: {
  getNodeMeta: GetDocsNodeMeta;
  navScope: DocsNavScopeResolution;
}): DocsSidebarNode[] {
  const versionSidebar =
    navScope.activeVersion?.sidebar ?? navScope.scope.meta.navScope?.sidebar;
  if (versionSidebar) {
    return versionSidebar.map((entry) =>
      'pages' in entry
        ? {
            children: entry.pages.map(({ title, url }) => ({
              id: url,
              title,
              type: 'page' as const,
              url,
            })),
            collapsible: entry.collapsible ?? true,
            id: `version-sidebar-${entry.title}`,
            title: entry.title,
            type: 'section' as const,
          }
        : {
            id: entry.url,
            title: entry.title,
            type: 'page' as const,
            url: entry.url,
          },
    );
  }

  const sidebarRootMeta = getNodeMeta(navScope.sidebarRoot);
  return flattenNavScopeSidebarNodes(navScope.sidebarRoot, getNodeMeta, {
    ...navScope.scope.meta,
    ...(sidebarRootMeta?.sidebarLabels
      ? { sidebarLabels: sidebarRootMeta.sidebarLabels }
      : {}),
  });
}

export function getSharedNavScopeSidebarNodes({
  getNodeMeta,
  navScope,
}: {
  getNodeMeta: GetDocsNodeMeta;
  navScope: DocsNavScopeResolution;
}): DocsSidebarNode[] {
  const versions = navScope.scope.meta.navScope?.versions;
  if (!versions?.length) {
    return getScopedNavScopeSidebarNodes({ getNodeMeta, navScope });
  }

  const defaultVersionId =
    navScope.scope.meta.navScope?.defaultVersion ?? versions[0]?.id;
  const canonicalFolder = versions
    .map((version) => ({
      folder: findVersionFolder(navScope.scope.node, version),
      version,
    }))
    .find(
      (entry): entry is { folder: Folder; version: DocsNavScopeVersion } =>
        Boolean(entry.folder) && entry.version.id === defaultVersionId,
    )?.folder;
  const targetFolder = navScope.activeVersion?.node ?? canonicalFolder;

  if (!canonicalFolder || !targetFolder) {
    return getScopedNavScopeSidebarNodes({ getNodeMeta, navScope });
  }

  const remappedFolder: Folder = {
    ...navScope.scope.node,
    children: remapSharedSidebarChildren({
      canonicalRoot: canonicalFolder,
      nodes: canonicalFolder.children,
      targetRoot: targetFolder,
    }),
  };

  return flattenNavScopeSidebarNodes(
    remappedFolder,
    getNodeMeta,
    navScope.scope.meta,
  );
}

export function getNavScopeVersionLinks({
  activePath,
  getNodeMeta,
  root,
  tab,
}: {
  activePath: string;
  getNodeMeta: GetDocsNodeMeta;
  root: Root;
  tab: string;
}): DocsNavScopeVersionLink[] {
  const navScope = resolveDocsNavScope({
    activePath,
    getNodeMeta,
    root,
    tab,
  });

  return navScope?.header.versionSwitcher?.versions ?? [];
}

function hasNavScopeDescendant(
  folder: Folder,
  getNodeMeta: GetDocsNodeMeta,
): boolean {
  if (getNodeMeta(folder)?.navScope) {
    return true;
  }

  return folder.children.some(
    (child) =>
      child.type === 'folder' && hasNavScopeDescendant(child, getNodeMeta),
  );
}

function findNearestVisibleParentScope(
  ancestors: Array<FolderAncestor & { meta: DocsMeta }>,
) {
  for (let index = ancestors.length - 2; index >= 0; index -= 1) {
    const ancestor = ancestors[index];
    if (!ancestor.meta.sidebarHidden) {
      return ancestor;
    }
  }

  return undefined;
}

function flattenParentNavScopeSidebarNodes(
  folder: Folder,
  tab: string,
  getNodeMeta: GetDocsNodeMeta,
): DocsSidebarNode[] {
  const nodes: DocsSidebarNode[] = [];
  const indexUrl = folder.index?.url;

  if (folder.index) {
    nodes.push({
      id: folder.index.url,
      title: normalizeLabel(folder.index.name, tab),
      type: 'page',
      url: folder.index.url,
    });
  }

  let currentSection: Extract<DocsSidebarNode, { type: 'section' }> | null =
    null;
  let hideCurrentGroup = false;

  for (const child of folder.children) {
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

    for (const node of navScopeParentNodeToSidebarNodes(
      child,
      getNodeMeta,
      getFolderHref(folder).startsWith('/zh-CN/'),
    )) {
      if (node.type === 'page' && node.url === indexUrl) {
        continue;
      }

      if (currentSection) {
        currentSection.children.push(node);
      } else {
        nodes.push(node);
      }
    }
  }

  return nodes;
}

function navScopeParentNodeToSidebarNodes(
  node: Node,
  getNodeMeta: GetDocsNodeMeta,
  chinese: boolean,
): DocsSidebarNode[] {
  if (node.type === 'separator') {
    return [];
  }

  if (node.type === 'page') {
    return [pageTreePageToSidebarNode(node, chinese)];
  }

  if (node.type !== 'folder') {
    return [];
  }

  const meta = getNodeMeta(node);
  if (meta?.sidebarHidden) {
    return [];
  }
  if (meta?.navScope) {
    return [getFolderLinkedSectionNode(node, meta)];
  }

  return hasNavScopeDescendant(node, getNodeMeta)
    ? pageTreeFolderToParentSidebarNodes(node, getNodeMeta)
    : navScopeNodeToSidebarNodes(node, getNodeMeta);
}

function pageTreePageToSidebarNode(
  item: Item,
  chinese: boolean,
): DocsSidebarNode {
  return {
    ...(chinese && item.external ? { external: true, href: item.url } : {}),
    id: item.url,
    title: normalizeLabel(item.name, item.url),
    type: 'page',
    url: item.url,
  };
}

function flattenNavScopeSidebarNodes(
  folder: Folder,
  getNodeMeta: GetDocsNodeMeta,
  rootMeta?: DocsMeta,
): DocsSidebarNode[] {
  const nodes: DocsSidebarNode[] = [];
  const indexUrl = folder.index?.url;

  if (folder.index) {
    nodes.push({
      id: folder.index.url,
      title:
        rootMeta?.sidebarIndexTitle ??
        normalizeLabel(folder.index.name, folder.index.url),
      type: 'page',
      url: folder.index.url,
    });
  }

  let currentSection: Extract<DocsSidebarNode, { type: 'section' }> | null =
    null;
  let hideCurrentGroup = false;

  for (const child of folder.children) {
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

    for (const node of navScopeNodeToSidebarNodes(
      child,
      getNodeMeta,
      rootMeta,
    )) {
      if (node.type === 'page' && node.url === indexUrl) {
        continue;
      }

      if (currentSection) {
        currentSection.children.push(node);
      } else {
        nodes.push(node);
      }
    }
  }

  return nodes;
}

function remapSharedSidebarChildren({
  canonicalRoot,
  nodes,
  targetRoot,
}: {
  canonicalRoot: Folder;
  nodes: Node[];
  targetRoot: Folder;
}): Node[] {
  return nodes.map((node) =>
    remapSharedSidebarNode({
      canonicalRoot,
      node,
      targetRoot,
    }),
  );
}

function remapSharedSidebarNode({
  canonicalRoot,
  node,
  targetRoot,
}: {
  canonicalRoot: Folder;
  node: Node;
  targetRoot: Folder;
}): Node {
  if (node.type === 'separator') {
    return node;
  }

  if (node.type === 'page') {
    return {
      ...node,
      url: remapSharedSidebarUrl(canonicalRoot, node.url, targetRoot),
    };
  }

  if (node.type !== 'folder') {
    return node;
  }

  return {
    ...node,
    children: remapSharedSidebarChildren({
      canonicalRoot,
      nodes: node.children,
      targetRoot,
    }),
    ...(node.index
      ? {
          index: {
            ...node.index,
            url: remapSharedSidebarUrl(
              canonicalRoot,
              node.index.url,
              targetRoot,
            ),
          },
        }
      : {}),
  };
}

function remapSharedSidebarUrl(
  canonicalRoot: Folder,
  url: string,
  targetRoot: Folder,
) {
  const relativePath = getRelativePath(canonicalRoot, url);
  return findRelativePageUrl(targetRoot, relativePath) ?? url;
}

function navScopeNodeToSidebarNodes(
  node: Node,
  getNodeMeta: GetDocsNodeMeta,
  rootMeta?: DocsMeta,
): DocsSidebarNode[] {
  if (node.type === 'separator') {
    return [];
  }

  if (node.type === 'page') {
    return [
      {
        ...(node.external ? { external: true } : {}),
        id: node.url,
        title:
          rootMeta?.sidebarLabels?.[node.url] ??
          normalizeLabel(node.name, node.url),
        type: 'page',
        url: node.url,
      },
    ];
  }

  if (node.type !== 'folder') {
    return [];
  }

  const meta = getNodeMeta(node);
  if (meta?.sidebarHidden) {
    return [];
  }
  if (meta?.navScope) {
    return shouldUseScopedFolderEntryInParent(node, meta, getNodeMeta)
      ? [getFolderPageNode(node, meta)]
      : pageTreeNodeToSidebarNodes(node, rootMeta?.sidebarLabels);
  }

  if (node.index && node.children.length === 0) {
    return [
      {
        id: node.index.url,
        title:
          rootMeta?.sidebarLabels?.[node.index.url] ??
          normalizeLabel(node.index.name, node.index.url),
        type: 'page',
        url: node.index.url,
      },
    ];
  }

  return pageTreeNodeToSidebarNodes(node, rootMeta?.sidebarLabels);
}

function pageTreeFolderToParentSidebarNodes(
  node: Folder,
  getNodeMeta: GetDocsNodeMeta,
): DocsSidebarNode[] {
  const children: DocsSidebarNode[] = [];
  let pendingIndexNode: Extract<DocsSidebarNode, { type: 'page' }> | null =
    null;
  let currentSection: Extract<DocsSidebarNode, { type: 'section' }> | null =
    null;
  let hideCurrentGroup = false;

  for (const child of node.children) {
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

    for (const sidebarNode of navScopeParentNodeToSidebarNodes(
      child,
      getNodeMeta,
      getFolderHref(node).startsWith('/zh-CN/'),
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
      collapsible: false,
      ...(icon ? { icon } : {}),
      id: `folder-${String(node.$id ?? node.name ?? 'folder')}`,
      title: normalizeLabel(node.name, node.index?.url ?? 'Folder'),
      type: 'section',
    },
  ];
}

function shouldUseScopedFolderEntryInParent(
  node: Folder,
  meta: DocsMeta,
  getNodeMeta: GetDocsNodeMeta,
): boolean {
  if (node.index) {
    return true;
  }

  if (meta.navScope?.versions?.length) {
    return true;
  }

  const childFolders = node.children.filter(
    (child): child is Folder => child.type === 'folder',
  );

  if (childFolders.length === 0) {
    return true;
  }

  return childFolders.some((child) =>
    hasVersionedNavScopeDescendant(child, getNodeMeta),
  );
}

function hasVersionedNavScopeDescendant(
  folder: Folder,
  getNodeMeta: GetDocsNodeMeta,
): boolean {
  if (getNodeMeta(folder)?.navScope?.versions?.length) {
    return true;
  }

  return folder.children.some(
    (child) =>
      child.type === 'folder' &&
      hasVersionedNavScopeDescendant(child, getNodeMeta),
  );
}

function getFolderPageNode(
  node: Folder,
  meta: DocsMeta,
): Extract<DocsSidebarNode, { type: 'page' }> {
  const href = getFolderHref(node);
  return {
    id: href,
    title: meta.sidebarIndexTitle ?? getMetaTitle(meta, node),
    type: 'page',
    url: href,
  };
}

function getFolderLinkedSectionNode(
  node: Folder,
  meta: DocsMeta,
): Extract<DocsSidebarNode, { type: 'section' }> {
  return {
    children: [],
    collapsible: true,
    id: `folder-${String(node.$id ?? node.name ?? 'folder')}`,
    title: getMetaTitle(meta, node),
    type: 'section',
    url: getFolderHref(node),
  };
}

function resolveActiveVersion({
  activePath,
  contentPath,
  getNodePath,
  scope,
  versions,
}: {
  activePath: string;
  contentPath?: string;
  getNodePath?: (node: Folder) => string | undefined;
  scope: Folder;
  versions?: DocsNavScopeVersion[];
}) {
  if (!versions?.length) {
    return undefined;
  }

  const matches = versions.flatMap((version) => {
    const node = findVersionFolder(scope, version) ?? scope;
    const versionNode = findVersionFolder(scope, version);
    const sourcePath = versionNode && getNodePath?.(versionNode);
    const sourceDirectory = sourcePath?.slice(
      0,
      sourcePath.lastIndexOf('/') + 1,
    );
    const ownsSource = Boolean(
      contentPath && sourceDirectory && contentPath.startsWith(sourceDirectory),
    );
    const matchesVersion =
      ownsSource ||
      (version.href
        ? isSamePathOrDescendant(activePath, version.href)
        : nodeContainsUrl(node, activePath));

    if (!matchesVersion) {
      return [];
    }

    return [
      {
        ...version,
        node,
        specificity: ownsSource
          ? (sourceDirectory?.length ?? 0)
          : (version.href?.length ?? 0),
      },
    ];
  });

  return (
    matches.sort((left, right) => right.specificity - left.specificity).at(0) ??
    versions
      .map((version) => {
        const node = findVersionFolder(scope, version);
        return node ? { ...version, node } : null;
      })
      .find((version) => version?.id === versions.at(0)?.id) ??
    undefined
  );
}

function buildVersionSwitcher({
  activePath,
  activeVersion,
  presentation,
  scope,
  versions,
}: {
  activePath: string;
  activeVersion?: DocsNavScopeVersion & { node: Folder };
  presentation?: 'dropdown' | 'tabs';
  scope: Folder;
  versions?: DocsNavScopeVersion[];
}): DocsSidebarHeader['versionSwitcher'] | undefined {
  if (!versions?.length || !activeVersion) {
    return undefined;
  }

  const switcherVersions = resolveVersionSwitcherLinks({
    activePath,
    activeVersionNode: activeVersion.node,
    scope,
    versions,
  });

  return {
    currentId: activeVersion.id,
    ...(presentation ? { presentation } : {}),
    versions: switcherVersions,
  };
}

function resolveVersionSwitcherLinks({
  activePath,
  activeVersionNode,
  scope,
  versions,
}: {
  activePath: string;
  activeVersionNode: Folder;
  scope: Folder;
  versions: DocsNavScopeVersion[];
}) {
  const relativePath = getRelativePath(activeVersionNode, activePath);

  return versions.flatMap((version) => {
    const node = findVersionFolder(scope, version);
    if (version.href) {
      return [
        {
          href: version.href,
          id: version.id,
          label: version.label,
        },
      ];
    }
    if (!node) {
      return [];
    }

    return [
      {
        href:
          findRelativePageUrl(node, relativePath) ??
          getFolderHref(node) ??
          activePath,
        id: version.id,
        label: version.label,
      },
    ];
  });
}

function findTabFolder(root: Root, activeTab: string): Folder | null {
  for (const child of root.children) {
    const result = findRootTabFolderInNode(child, activeTab);
    if (result) {
      return result;
    }
  }

  for (const child of root.children) {
    const result = findTabFolderInNode(child, activeTab);
    if (result) {
      return result;
    }
  }

  return null;
}

function findRootTabFolderInNode(node: Node, activeTab: string): Folder | null {
  if (node.type !== 'folder') {
    return null;
  }

  const index = getFolderIndex(node);
  if (node.root === true && index && getTabIdFromUrl(index.url) === activeTab) {
    return node;
  }

  for (const child of node.children) {
    const result = findRootTabFolderInNode(child, activeTab);
    if (result) {
      return result;
    }
  }

  return null;
}

function findTabFolderInNode(node: Node, activeTab: string): Folder | null {
  if (node.type !== 'folder') {
    return null;
  }

  const index = getFolderIndex(node);
  if (index && getTabIdFromUrl(index.url) === activeTab) {
    return node;
  }

  for (const child of node.children) {
    const result = findTabFolderInNode(child, activeTab);
    if (result) {
      return result;
    }
  }

  return null;
}

function findFolderAncestorsByUrl(
  folder: Folder,
  url: string,
  ancestors: Folder[] = [],
): Folder[] | null {
  const nextAncestors = [...ancestors, folder];

  if (folder.index?.url === url) {
    return nextAncestors;
  }

  for (const child of folder.children) {
    if (child.type === 'page' && child.url === url) {
      return nextAncestors;
    }

    if (child.type === 'folder') {
      const result = findFolderAncestorsByUrl(child, url, nextAncestors);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

function findVersionFolder(
  scope: Folder,
  version: DocsNavScopeVersion,
): Folder | null {
  if (version.path === '.') {
    return scope;
  }

  return findDescendantFolder(
    scope,
    (folder) =>
      String(folder.name) === version.path ||
      String(folder.$id ?? '').includes(version.path) ||
      folderPathMatchesVersion(folder, version),
  );
}

function findDescendantFolder(
  folder: Folder,
  predicate: (folder: Folder) => boolean,
): Folder | null {
  for (const child of folder.children) {
    if (child.type !== 'folder') {
      continue;
    }

    if (predicate(child)) {
      return child;
    }

    const match = findDescendantFolder(child, predicate);
    if (match) {
      return match;
    }
  }

  return null;
}

function folderPathMatchesVersion(
  folder: Folder,
  version: DocsNavScopeVersion,
) {
  const href = getFolderHref(folder);

  if (version.path.startsWith('(') && version.path.endsWith(')')) {
    return href === getFolderHref(folder);
  }

  return href.split('/').includes(version.path);
}

function nodeContainsUrl(node: Node, url: string): boolean {
  if (node.type === 'page') {
    return node.url === url;
  }

  if (node.type !== 'folder') {
    return false;
  }

  return (
    node.index?.url === url ||
    node.children.some((child) => nodeContainsUrl(child, url))
  );
}

function getRelativePath(folder: Folder, activePath: string): string[] {
  const folderHref = getFolderHref(folder).replace(/\/$/, '');
  const normalizedPath = activePath.replace(/\/$/, '');

  if (normalizedPath === folderHref) {
    return [];
  }

  if (!normalizedPath.startsWith(`${folderHref}/`)) {
    return [];
  }

  return normalizedPath
    .slice(folderHref.length + 1)
    .split('/')
    .filter(Boolean);
}

function findRelativePageUrl(folder: Folder, relativePath: string[]) {
  if (relativePath.length === 0) {
    return getFolderHref(folder);
  }

  const candidateUrl = `${getFolderHref(folder).replace(/\/$/, '')}/${relativePath.join('/')}`;
  return findPageUrl(folder, candidateUrl);
}

function findPageUrl(node: Node, url: string): string | null {
  if (node.type === 'page') {
    return node.url === url ? node.url : null;
  }

  if (node.type !== 'folder') {
    return null;
  }

  if (node.index?.url === url) {
    return node.index.url;
  }

  for (const child of node.children) {
    const result = findPageUrl(child, url);
    if (result) {
      return result;
    }
  }

  return null;
}

function getFolderHref(folder: Folder) {
  return folder.index?.url ?? getFirstDescendantPageUrl(folder) ?? '';
}

function getFirstDescendantPageUrl(folder: Folder): string | null {
  for (const child of folder.children) {
    if (child.type === 'page') {
      return child.url;
    }

    if (child.type === 'folder') {
      const href = getFolderHref(child);
      if (href) {
        return href;
      }
    }
  }

  return null;
}

function getFolderIndex(node: Folder): Item | undefined {
  return (
    node.index ??
    node.children.find((child): child is Item => child.type === 'page')
  );
}

function getMetaTitle(meta: DocsMeta, folder: Folder) {
  return meta.title ?? normalizeLabel(folder.name, getFolderHref(folder));
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
