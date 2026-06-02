import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';
import type { DocsMeta, DocsNavScopeVersion } from './docs-meta-schema';
import {
  type DocsSidebarNode,
  getFirstTabPageUrl,
  getSidebarNodes,
  pageTreeNodeToSidebarNodes,
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

  const parentScope = scopedAncestors.at(-2);
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

  return flattenTabSidebarNodes(tabNode, getNodeMeta);
}

function flattenTabSidebarNodes(
  folder: Folder,
  getNodeMeta: GetDocsNodeMeta,
): DocsSidebarNode[] {
  return [
    ...(folder.index
      ? [
          {
            id: folder.index.url,
            title: normalizeLabel(folder.index.name, folder.index.url),
            type: 'page' as const,
            url: folder.index.url,
          },
        ]
      : []),
    ...folder.children.flatMap((child) =>
      navScopeNodeToSidebarNodes(child, getNodeMeta),
    ),
  ];
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
  if (meta?.navScope) {
    const href = getFolderHref(node);
    return [
      {
        id: href,
        title: getMetaTitle(meta, node),
        type: 'page',
        url: href,
      },
    ];
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
  scope,
  versions,
}: {
  activePath: string;
  activeVersion?: DocsNavScopeVersion & { node: Folder };
  scope: Folder;
  versions?: DocsNavScopeVersion[];
}): DocsSidebarHeader['versionSwitcher'] | undefined {
  if (!versions?.length || !activeVersion) {
    return undefined;
  }

  const relativePath = getRelativePath(activeVersion.node, activePath);
  const switcherVersions = versions.flatMap((version) => {
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

  return {
    currentId: activeVersion.id,
    versions: switcherVersions,
  };
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
    node.index?.url === url || node.children.some((child) => nodeContainsUrl(child, url))
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

  return normalizedPath.slice(folderHref.length + 1).split('/').filter(Boolean);
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
  return node.index ?? node.children.find((child): child is Item => child.type === 'page');
}

function getFolderIndexTitle(index: Item, folderName: ReactNode) {
  const title = normalizeLabel(index.name, index.url);
  const normalizedFolderName = normalizeLabel(folderName, title);

  if (title !== normalizedFolderName) {
    return title;
  }

  return index.url.includes('/zh-CN/') ? '总览' : 'Overview';
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
