import type { Root } from 'fumadocs-core/page-tree';
import { isRetiredCnDocsPath } from './retired-cn-docs.mjs';

const filteredTrees = new WeakMap<Root, Root>();

// Fumadocs can add English fallback folders to a Chinese tree. Filter only that
// tree, keeping the English source and its own navigation available.
export function filterRetiredCnDocsTree(tree: Root): Root {
  const cached = filteredTrees.get(tree);
  if (cached) return cached;
  function isRetiredReference(value?: string) {
    if (!value) return false;
    const path = value.startsWith('/') ? value : `/zh-CN/${value}`;
    return isRetiredCnDocsPath(path.replace(/^\/en\//, '/zh-CN/'));
  }

  function filter(nodes: Root['children']): Root['children'] {
    return nodes.flatMap<Root['children'][number]>((node) => {
      if (node.type === 'page' && isRetiredReference(node.url)) return [];
      if (node.type !== 'folder') return [node];
      if (
        isRetiredReference(node.$ref?.folder) ||
        isRetiredReference(node.index?.url)
      )
        return [];
      return [{ ...node, children: filter(node.children) }];
    });
  }

  const filtered = { ...tree, children: filter(tree.children) };
  filteredTrees.set(tree, filtered);
  if (tree.fallback) {
    filtered.fallback = filterRetiredCnDocsTree(tree.fallback);
  }
  return filtered;
}
