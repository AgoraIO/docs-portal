import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';
import type { DocsMeta, DocsNavScopeVersion } from './docs-meta-schema';
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
  backHref: string;
  backLabel: string;
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
  activePath,
  getNodeMeta,
  root,
  tab,
}: {
  activePath: string;
  getNodeMeta: GetDocsNodeMeta;
  root: Root;
  tab: string;
}): DocsNavScopeResolution | null {
  const tabNode = findTabFolder(root, tab);
  if (!tabNode) {
    return null;
  }

  const ancestors = findFolderAncestorsByUrl(tabNode, activePath);
  if (!ancestors) {
    return null;
  }

  const scopedAncestors = ancestors
    .map((node) => ({ meta: getNodeMeta(node), node }))
    .filter((item): item is FolderAncestor & { meta: DocsMeta } =>
      Boolean(item.meta?.navScope),
    );

  const scope = scopedAncestors.at(-1);
  if (!scope) {
    return null;
  }

  const parentScope = findNearestVisibleParentScope(scopedAncestors);
  const activeVersion = resolveActiveVersion({
    activePath,
    scope: scope.node,
    versions: scope.meta.navScope?.versions,
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
    versions: scope.meta.navScope?.versions,
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
  return flattenNavScopeSidebarNodes(
    navScope.sidebarRoot,
    getNodeMeta,
    navScope.scope.meta,
  );
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

  for (const child of folder.children) {
    if (child.type === 'separator') {
      const group = parseSidebarGroupMetadata(child.name);
      const title = group.title;
      currentSection = null;

      if (title.length > 0) {
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

    for (const node of navScopeParentNodeToSidebarNodes(child, getNodeMeta)) {
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
): DocsSidebarNode[] {
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

  for (const child of folder.children) {
    if (child.type === 'separator') {
      const group = parseSidebarGroupMetadata(child.name);
      const title = group.title;
      currentSection = null;

      if (title.length > 0) {
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

    for (const node of navScopeNodeToSidebarNodes(child, getNodeMeta)) {
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
): DocsSidebarNode[] {
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

  const meta = getNodeMeta(node);
  if (meta?.sidebarHidden) {
    return [];
  }
  if (meta?.navScope) {
    return shouldUseScopedFolderEntryInParent(node, meta, getNodeMeta)
      ? [getFolderPageNode(node, meta)]
      : pageTreeNodeToSidebarNodes(node);
  }

  if (node.index && node.children.length === 0) {
    return [
      {
        id: node.index.url,
        title: normalizeLabel(node.index.name, node.index.url),
        type: 'page',
        url: node.index.url,
      },
    ];
  }

  return pageTreeNodeToSidebarNodes(node);
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

  for (const child of node.children) {
    if (child.type === 'separator') {
      const group = parseSidebarGroupMetadata(child.name);
      const title = group.title;
      currentSection = null;

      if (title.length > 0) {
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

    for (const sidebarNode of navScopeParentNodeToSidebarNodes(
      child,
      getNodeMeta,
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
    title: getMetaTitle(meta, node),
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
  scope,
  versions,
}: {
  activePath: string;
  scope: Folder;
  versions?: DocsNavScopeVersion[];
}) {
  if (!versions?.length) {
    return undefined;
  }

  const matches = versions.flatMap((version) => {
    const node = findVersionFolder(scope, version);
    if (!node || !nodeContainsUrl(node, activePath)) {
      return [];
    }

    return [{ ...version, node }];
  });

  return (
    matches.at(0) ??
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
    const result = findTabFolderInNode(child, activeTab);
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
  return (
    scope.children.find(
      (child): child is Folder =>
        child.type === 'folder' &&
        (String(child.name) === version.path ||
          String(child.$id ?? '').includes(version.path) ||
          folderPathMatchesVersion(child, version)),
    ) ?? null
  );
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
