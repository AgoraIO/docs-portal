import {
  DOC_VERSION_SCOPES,
  type DocVersionScope,
  type DocVersionSelections,
  getDocVersionTarget,
  resolveDocVersion,
} from './doc-versions';
import type { DocsSidebarNode } from './docs-tree';

/** Resolve a navigation entry before following the link. Content URLs stay pinned. */
export function getDocVersionEntryHref(
  href: string,
  selections: DocVersionSelections,
) {
  const scope = DOC_VERSION_SCOPES.find(
    (scope) => scope.entryUrl === href || scope.entryLinks?.includes(href),
  );
  if (!scope) return href;
  return (
    getDocVersionTarget(
      scope.entryUrl,
      selections[scope.id] ?? scope.defaultVersion,
    )?.href ?? href
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
