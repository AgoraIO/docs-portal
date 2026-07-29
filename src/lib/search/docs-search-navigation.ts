import { findPath, flattenTree, type Root } from 'fumadocs-core/page-tree';

export type DocsSearchNavigation = Map<string, string[]>;

export function buildDocsSearchNavigation(
  pageTree: Root,
): DocsSearchNavigation {
  return new Map(
    flattenTree(pageTree.children).map((page) => {
      const treePath = findPath(
        pageTree.children,
        (node) => node.type === 'page' && node.url === page.url,
      );
      const rootIndex =
        treePath?.findIndex(
          (node) => node.type === 'folder' && node.root === true,
        ) ?? -1;
      const breadcrumbs =
        treePath
          ?.slice(rootIndex >= 0 ? rootIndex : 0, -1)
          .flatMap((node) =>
            typeof node.name === 'string' && node.name.length > 0
              ? [node.name]
              : [],
          ) ?? [];

      return [page.url, breadcrumbs];
    }),
  );
}
