import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

type TableNode = {
  type: string;
  name?: string;
  value?: string;
  children?: TableNode[];
};

// MDX may group consecutive inline <td>/<th> elements in a paragraph. A
// paragraph is valid inside a cell, but never between a <tr> and its cells.
// Normalize only table structure; cell Markdown and nested tables stay intact.
export function remarkMergedTables() {
  return (tree: Root) => {
    visit(tree, 'mdxJsxFlowElement', (node) => {
      if (node.name === 'DocsTable') normalize(node as TableNode);
    });
  };
}

function normalize(node: TableNode) {
  const allowed =
    node.name === 'DocsTable'
      ? ['caption', 'colgroup', 'thead', 'tbody', 'tfoot']
      : ['thead', 'tbody', 'tfoot'].includes(node.name ?? '')
        ? ['tr']
        : node.name === 'tr'
          ? ['th', 'td']
          : null;
  if (!allowed) return;
  const structural = (child: TableNode) =>
    ['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(child.type) &&
    allowed.includes(child.name ?? '');
  const whitespace = (child: TableNode) =>
    child.type === 'text' && !child.value?.trim();
  node.children = (node.children ?? [])
    .flatMap((child) =>
      child.type === 'paragraph' &&
      child.children?.every((entry) => structural(entry) || whitespace(entry))
        ? child.children
        : [child],
    )
    .filter((child) => !whitespace(child));
  for (const child of node.children) {
    if (!structural(child))
      throw new Error(
        `DocsTable ${node.name} must contain only ${allowed.join(', ')} elements`,
      );
    normalize(child);
  }
}
