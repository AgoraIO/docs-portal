import { layoutMergedTable } from './merged-table.mjs';

const jsx = (node, name) =>
  ['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) &&
  node.name === name;

export function auditMergedTable(node) {
  const sections = (node.children ?? []).filter((child) =>
    ['thead', 'tbody', 'tfoot'].some((name) => jsx(child, name)),
  );
  if (!sections.length || node.children.some((child) => jsx(child, 'tr'))) {
    throw new Error('DocsTable rows must be inside thead, tbody or tfoot');
  }
  const allRows = [];
  for (const section of sections) {
    const rows = section.children
      .filter((child) => jsx(child, 'tr'))
      .map((row) => {
        const cells = row.children.filter(
          (child) => jsx(child, 'th') || jsx(child, 'td'),
        );
        return cells.map((cell) => ({
          kind: cell.name === 'th' ? 'h' : 'd',
          raw: '',
          rowspan: readSpan(cell, 'rowSpan'),
          colspan: readSpan(cell, 'colSpan'),
        }));
      });
    // HTML rowspans cannot cross row-group boundaries.
    layoutMergedTable(rows, null, { strict: true });
    allRows.push(...rows);
  }
  layoutMergedTable(allRows, null, { strict: true });
}

function readSpan(node, name) {
  if (
    node.attributes.some((attr) => attr.type === 'mdxJsxExpressionAttribute')
  ) {
    throw new Error(
      'DocsTable cells require explicit attributes, not spread properties',
    );
  }
  if (node.attributes.some((attr) => attr.name === name.toLowerCase())) {
    throw new Error(`Use native MDX ${name}, not ${name.toLowerCase()}`);
  }
  const attr = node.attributes.find((attr) => attr.name === name);
  if (!attr) return 1;
  const value = typeof attr.value === 'object' ? attr.value?.value : attr.value;
  if (!/^\d+$/.test(String(value)))
    throw new Error(`${name} must be an explicit positive integer`);
  return Number(value);
}
