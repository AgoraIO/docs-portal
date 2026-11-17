import type { Folder, Node, Root } from 'fumadocs-core/page-tree';
import type { DocsMeta } from './docs-meta-schema';

export function resolveNavigationParent(
  root: Root,
  activePath: string,
  getMeta: (folder: Folder) => DocsMeta | undefined,
): { title: string; url: string } | undefined {
  const path = activePath.split(/[?#]/)[0];
  const find = (
    nodes: Node[],
    url: string,
  ): { title: string; url: string } | undefined => {
    for (const node of nodes) {
      if (node.type === 'page' && node.url === url)
        return { title: String(node.name), url };
      if (node.type === 'folder') {
        if (node.index?.url === url)
          return { title: String(node.index.name), url };
        const match = find(node.children, url);
        if (match) return match;
      }
    }
  };
  // Visible pages keep their existing position, even if a declaration includes them.
  if (find(root.children, path)) return undefined;
  const matches = new Map<string, { title: string; url: string }>();
  const visit = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.type !== 'folder') continue;
      for (const [url, children] of Object.entries(
        getMeta(node)?.navigationParents ?? {},
      )) {
        if (!children.includes(path)) continue;
        // The parent must exist in the declaring folder's visible tree.
        const parent = find(node.children, url);
        if (parent) matches.set(url, parent);
      }
      visit(node.children);
    }
  };
  visit(root.children);
  // Conflicting ownership must not pick a parent based on traversal order.
  return matches.size === 1 ? [...matches.values()][0] : undefined;
}
