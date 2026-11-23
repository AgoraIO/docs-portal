import {
  type DocsTableColumnKind,
  planTableColumnKinds,
  type TableMetadataCell,
  tableCellAlignment,
  tableCellKind,
} from './table-metadata';
import {
  planTableSizing,
  sizingForCell,
  type TableCellContent,
} from './table-sizing';

function contentOf(cell: HTMLTableCellElement): TableCellContent {
  const content: TableCellContent = {
    text: cell.textContent ?? '',
    blocks: [],
    paragraphs: 0,
  };
  const visit = (element: Element, inList = false) => {
    for (const child of element.children) {
      const tag = child.tagName;
      if (tag === 'TABLE') {
        content.nestedTable = true;
        continue;
      }
      if (tag === 'P' && !inList)
        content.paragraphs = (content.paragraphs ?? 0) + 1;
      if (tag === 'P' || tag === 'LI')
        content.blocks?.push(child.textContent ?? '');
      if (tag === 'UL' || tag === 'OL') content.list = true;
      if (tag === 'PRE') content.codeBlock = true;
      if (tag === 'IMG' || tag === 'VIDEO') content.media = true;
      visit(child, inList || tag === 'UL' || tag === 'OL');
    }
  };
  visit(cell);
  return content;
}

// Composed API rows and lazy content are only inspectable after rendering.
// This adapter uses the same policy as SSR; it never edits cell contents.
export function applyTableContentSizing(
  table: HTMLTableElement,
  declared?: readonly DocsTableColumnKind[],
) {
  const cells: (TableMetadataCell & {
    element: HTMLTableCellElement;
    bottomEdge: boolean;
  })[] = [];
  let width = 0;
  const sections = [...table.children].filter((node) =>
    ['THEAD', 'TBODY', 'TFOOT'].includes(node.tagName),
  );
  const lastSection = [...sections]
    .reverse()
    .find((section) =>
      [...section.children].some((row) => row.tagName === 'TR'),
    );
  for (const section of sections) {
    const occupied: number[] = [];
    const rows = [...section.children].filter((row) => row.tagName === 'TR');
    for (const [rowIndex, row] of rows.entries()) {
      let column = 0;
      const ownCells = [...row.children].filter(
        (cell) => cell.tagName === 'TD' || cell.tagName === 'TH',
      ) as HTMLTableCellElement[];
      for (const element of ownCells) {
        while (occupied[column] > 0) column++;
        const span = element.colSpan;
        // rowspan=0 means the rest of this row group in native HTML.
        const remainingRows = rows.length - rowIndex;
        const rowSpan = element.rowSpan || remainingRows;
        for (let offset = 0; offset < span; offset++) {
          if (occupied[column + offset] > 0) return;
          occupied[column + offset] = rowSpan;
        }
        cells.push({
          column,
          span,
          rowSpan,
          bottomEdge:
            section === lastSection && rowIndex + rowSpan === rows.length,
          row: rowIndex,
          section:
            section.tagName.toLowerCase() as TableMetadataCell['section'],
          header: section.tagName === 'THEAD',
          content: contentOf(element),
          element,
        });
        column += span;
      }
      width = Math.max(width, occupied.length);
      for (let index = 0; index < occupied.length; index++)
        occupied[index] = Math.max(0, (occupied[index] ?? 0) - 1);
    }
  }
  if (!width) return;
  const kinds = planTableColumnKinds(width, cells, declared);
  const sizing = planTableSizing(width, cells);
  table.dataset.tableContentLayout = sizing.intrinsic ? 'intrinsic' : 'mixed';
  table.style.setProperty(
    '--docs-table-flex-columns',
    String(Math.max(1, sizing.flexible)),
  );
  table.style.setProperty(
    '--docs-table-compact-width',
    `${sizing.compactCh}ch`,
  );
  for (const cell of cells) {
    const size = sizingForCell(sizing.columns, cell);
    const kind = tableCellKind(kinds, cell.column, cell.span);
    const alignment = tableCellAlignment(cell, kind, size);
    cell.element.dataset.tableColumn = String(cell.column);
    cell.element.toggleAttribute('data-table-bottom-edge', cell.bottomEdge);
    if (kind) cell.element.dataset.tableColumnKind = kind;
    else delete cell.element.dataset.tableColumnKind;
    cell.element.dataset.tableColumnSize = size.kind;
    cell.element.style.setProperty('--docs-table-cell-min', `${size.minCh}ch`);
    if (alignment.textAlign)
      cell.element.dataset.tableAlign = alignment.textAlign;
    else delete cell.element.dataset.tableAlign;
    if (alignment.verticalAlign)
      cell.element.dataset.tableVerticalAlign = alignment.verticalAlign;
    else delete cell.element.dataset.tableVerticalAlign;
  }
}
