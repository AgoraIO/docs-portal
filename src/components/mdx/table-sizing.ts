export type TableCellContent = {
  text: string;
  blocks?: string[];
  paragraphs?: number;
  codeBlock?: boolean;
  nestedTable?: boolean;
  media?: boolean;
  opaque?: boolean;
  list?: boolean;
};

export type TableSizingCell = {
  column: number;
  span: number;
  header: boolean;
  content: TableCellContent;
};

export type TableColumnSize = {
  kind: 'compact' | 'prose' | 'code';
  minCh: number;
};

// Approximate an intrinsic reading measure, not a pixel width. The browser
// still lays out the native table with its real fonts and available space.
function textWidth(value: string): number {
  return Array.from(value.replace(/\s+/g, ' ').trim()).reduce(
    (width, character) => width + (/[^\u0020-\u024f]/u.test(character) ? 2 : 1),
    0,
  );
}

export function sizeCellContent(content: TableCellContent): TableColumnSize {
  if (content.codeBlock) return { kind: 'code', minCh: 24 };
  if (content.nestedTable || content.media || content.opaque)
    return { kind: 'prose', minCh: 24 };

  let remainder = content.text;
  for (const block of content.blocks ?? [])
    remainder = remainder.replace(block, '');
  const values = content.blocks?.length
    ? [...content.blocks, remainder].filter((value) => value.trim())
    : [content.text];
  const width = Math.max(0, ...values.map(textWidth));
  const numeric = values.every((value) =>
    /^(?:[^:\n]{1,12}:\s*)?[+−-]?(?:[$¥€£]\s*)?\d[\d,.]*(?:\s*(?:%|[a-z]+(?:\/[a-z]+)?|元|秒|分钟|小时))?$/i.test(
      value.trim(),
    ),
  );
  if ((content.paragraphs ?? 0) <= 1 && (width <= 18 || numeric))
    return {
      kind: 'compact',
      minCh: Math.max(3, Math.min(28, width + (content.list ? 5 : 3))),
    };

  if (!content.list && /^[!-~]{19,}$/.test(content.text.trim()))
    return { kind: 'code', minCh: 24 };
  return { kind: 'prose', minCh: 24 };
}

export function planTableSizing(width: number, cells: TableSizingCell[]) {
  const columns = Array.from({ length: width }, (_, column) => {
    const own = cells.filter(
      (cell) => cell.column === column && cell.span === 1,
    );
    const body = own.filter((cell) => !cell.header);
    const sizes = (body.length ? body : own).map((cell) =>
      sizeCellContent(cell.content),
    );
    const headerWidth = Math.max(
      0,
      ...own
        .filter((cell) => cell.header)
        .map((cell) => textWidth(cell.content.text)),
    );
    const kind = sizes.some((size) => size.kind === 'prose')
      ? 'prose'
      : sizes.some((size) => size.kind === 'code')
        ? 'code'
        : 'compact';
    const minCh = Math.max(
      kind === 'compact' ? Math.min(12, headerWidth) + 3 : 24,
      ...sizes.map((size) => size.minCh),
    );
    return { kind, minCh } satisfies TableColumnSize;
  });
  const flexible = columns.filter((column) => column.kind !== 'compact').length;
  const compactCh = columns.reduce(
    (sum, column) => sum + (column.kind === 'compact' ? column.minCh : 0),
    0,
  );
  return { columns, flexible, compactCh, intrinsic: flexible === 0 };
}

export function sizingForCell(
  columns: TableColumnSize[],
  cell: TableSizingCell,
): { kind: TableColumnSize['kind'] | 'span'; minCh: number } {
  return cell.span === 1
    ? columns[cell.column]
    : { ...sizeCellContent(cell.content), kind: 'span' };
}
