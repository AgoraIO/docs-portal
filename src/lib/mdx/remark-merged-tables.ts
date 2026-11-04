import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

type TableNode = {
  type: string;
  name?: string;
  value?: string;
  children?: TableNode[];
  attributes?: { type: string; name?: string; value?: unknown }[];
};

// MDX may group consecutive inline <td>/<th> elements in a paragraph. A
// paragraph is valid inside a cell, but never between a <tr> and its cells.
// Normalize only table structure; cell Markdown and nested tables stay intact.
export function remarkMergedTables() {
  return (tree: Root) => {
    visit(tree, 'mdxJsxFlowElement', (node) => {
      if (node.name === 'DocsTable') {
        normalize(node as TableNode);
        annotateCellEdges(node as TableNode);
      }
    });
  };
}

function annotateCellEdges(table: TableNode) {
  const sections = (table.children ?? []).filter((node) =>
    ['thead', 'tbody', 'tfoot'].includes(node.name ?? ''),
  );
  const lastSection = sections
    .filter((section) => section.children?.length)
    .at(-1);
  for (const section of sections) {
    const rows = section.children ?? [];
    const occupied: number[] = [];
    for (const [rowIndex, row] of rows.entries()) {
      let column = 0;
      for (const cell of row.children ?? []) {
        while (occupied[column] > 0) column++;
        const rowspan = readSpan(cell, 'rowSpan');
        const colspan = readSpan(cell, 'colSpan');
        if (rowIndex + rowspan > rows.length)
          throw new Error('DocsTable rowSpan extends beyond its row group');
        setAttribute(cell, 'data-table-column', String(column));
        setAttribute(
          cell,
          'data-table-bottom-edge',
          section === lastSection && rowIndex + rowspan === rows.length
            ? ''
            : undefined,
        );
        for (let offset = 0; offset < colspan; offset++) {
          if (occupied[column + offset] > 0)
            throw new Error('DocsTable cells overlap');
          occupied[column + offset] = rowspan;
        }
        column += colspan;
      }
      for (let index = 0; index < occupied.length; index++)
        occupied[index] = Math.max(0, occupied[index] - 1);
    }
  }
}

function readSpan(node: TableNode, name: string) {
  const value = node.attributes?.find(
    (attribute) => attribute.name === name,
  )?.value;
  const raw =
    value && typeof value === 'object' && 'value' in value
      ? value.value
      : (value ?? '1');
  const number = Number(raw);
  if (!/^\d+$/.test(String(raw)) || !Number.isSafeInteger(number) || number < 1)
    throw new Error(`DocsTable ${name} must be an explicit positive integer`);
  return number;
}

function setAttribute(
  node: TableNode,
  name: string,
  value: string | undefined,
) {
  node.attributes = (node.attributes ?? []).filter(
    (attribute) => attribute.name !== name,
  );
  if (value !== undefined)
    node.attributes.push({ type: 'mdxJsxAttribute', name, value });
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
