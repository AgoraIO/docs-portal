import {
  DOC_VERSION_SCOPES,
  type DocVersionScope,
  getDocVersionTarget,
  resolveDocVersion,
} from './doc-versions';
import type { DocsSidebarNode } from './docs-tree';

export function getDocVersionEntryHref(href: string) {
  return (
    DOC_VERSION_SCOPES.find((scope) => scope.entryLinks?.includes(href))
      ?.entryUrl ?? href
  );
}

export function getDocVersionCatalogScope(
  activePath: string,
  sectionId: string,
) {
  return DOC_VERSION_SCOPES.find((scope) => {
    const catalog = scope.catalog;
    return (
      catalog?.sectionId === sectionId &&
      (activePath === catalog.rootUrl ||
        activePath.startsWith(`${catalog.rootUrl}/`))
    );
  });
}

export function hasDocVersionCatalog(
  nodes: DocsSidebarNode[],
  activePath: string,
): boolean {
  return nodes.some(
    (node) =>
      node.type === 'section' &&
      (Boolean(getDocVersionCatalogScope(activePath, node.id)) ||
        hasDocVersionCatalog(node.children, activePath)),
  );
}

export function getDocVersionCatalogPages(
  nodes: DocsSidebarNode[],
  scope: DocVersionScope,
  versionId: string,
): DocsSidebarNode[] {
  return nodes.map((node) => {
    if (node.type === 'section')
      return {
        ...node,
        children: getDocVersionCatalogPages(node.children, scope, versionId),
      };
    const owner = resolveDocVersion(node.url);
    if (
      !owner ||
      (owner.scope.preferenceKey ?? owner.scope.id) !==
        (scope.preferenceKey ?? scope.id)
    )
      return node;
    const target = getDocVersionTarget(node.url, versionId);
    return target
      ? {
          ...node,
          url: target.href,
          ...(node.href ? { href: target.href } : {}),
        }
      : node;
  });
}
