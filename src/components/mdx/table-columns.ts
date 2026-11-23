import {
  Children,
  type ComponentProps,
  type CSSProperties,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
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

export type { DocsTableColumnKind } from './table-metadata';

type CellProps = ComponentProps<'td'> & {
  'data-table-column'?: string;
  'data-table-column-kind'?: DocsTableColumnKind;
  'data-table-column-size'?: string;
  'data-table-align'?: 'center';
  'data-table-vertical-align'?: 'middle';
  'data-table-bottom-edge'?: string;
};
type CellPosition = {
  node: ReactElement<CellProps>;
  column: number;
  span: number;
};
const elements = (children: ReactNode) =>
  Children.toArray(children).filter(isValidElement<CellProps>);
const sectionTags = new Set(['thead', 'tbody', 'tfoot']);

function text(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<CellProps>(child)
          ? text(child.props.children)
          : '',
    )
    .join('');
}

function cellContent(children: ReactNode): TableCellContent {
  const content: TableCellContent = {
    text: text(children),
    blocks: [],
    paragraphs: 0,
  };
  const visit = (nodes: ReactNode, inList = false) => {
    for (const node of elements(nodes)) {
      const tag = String(node.type);
      if (tag === 'table') {
        content.nestedTable = true;
        continue;
      }
      if (tag === 'p' && !inList)
        content.paragraphs = (content.paragraphs ?? 0) + 1;
      if (tag === 'p' || tag === 'li')
        content.blocks?.push(text(node.props.children));
      if (tag === 'ul' || tag === 'ol') content.list = true;
      if (tag === 'pre') content.codeBlock = true;
      if (tag === 'img' || tag === 'video') content.media = true;
      if (typeof node.type !== 'string') content.opaque = true;
      visit(node.props.children, inList || tag === 'ul' || tag === 'ol');
    }
  };
  visit(children);
  return content;
}

// Read only the native table's own sections. Nested tables plan their columns
// independently. A new row group starts a new rowspan grid, as in HTML.
export function prepareTableColumns(
  children: ReactNode,
  declared?: readonly DocsTableColumnKind[],
) {
  let width = 0;
  let merged = false;
  let valid = true;
  const sections = elements(children)
    .filter((node) => sectionTags.has(String(node.type)))
    .map((section) => {
      const occupied: number[] = [];
      const rows = elements(section.props.children).map((row) => {
        if (row.type !== 'tr') valid = false;
        let column = 0;
        const positions: CellPosition[] = [];
        for (const cell of elements(row.props.children)) {
          while (occupied[column] > 0) column++;
          const span = Number(cell.props.colSpan ?? 1);
          const rowspan = Number(cell.props.rowSpan ?? 1);
          if (
            !['td', 'th'].includes(String(cell.type)) ||
            !Number.isSafeInteger(span) ||
            span < 1 ||
            !Number.isSafeInteger(rowspan) ||
            rowspan < 1
          ) {
            valid = false;
            continue;
          }
          merged ||= span > 1 || rowspan > 1;
          positions.push({ node: cell, column, span });
          for (let offset = 0; offset < span; offset++) {
            if (occupied[column + offset] > 0) valid = false;
            occupied[column + offset] = rowspan;
          }
          column += span;
        }
        const covered = occupied.map((remaining) => remaining > 0);
        width = Math.max(width, occupied.length);
        for (let index = 0; index < occupied.length; index++)
          occupied[index] = Math.max(0, (occupied[index] ?? 0) - 1);
        return { node: row, positions, covered };
      });
      if (occupied.some((remaining) => remaining > 0)) valid = false;
      return { node: section, rows };
    });
  if (
    sections.some((section) =>
      section.rows.some((row) =>
        Array.from({ length: width }, (_, index) => row.covered[index]).some(
          (value) => !value,
        ),
      ),
    )
  )
    valid = false;
  if (!width) return { children, headers: undefined, kinds: [] };
  if (declared && declared.length !== width)
    throw new Error(
      `DocsTable columns must describe all ${width} logical columns`,
    );

  const sizingCells: TableMetadataCell[] = sections.flatMap((section) =>
    section.rows.flatMap((row, rowIndex) =>
      row.positions.map((cell) => ({
        column: cell.column,
        span: cell.span,
        rowSpan: Number(cell.node.props.rowSpan ?? 1),
        row: rowIndex,
        section: section.node.type as TableMetadataCell['section'],
        header: section.node.type === 'thead',
        content: cellContent(cell.node.props.children),
      })),
    ),
  );
  const kinds = planTableColumnKinds(width, sizingCells, declared);
  if (!valid) return { children, headers: undefined, kinds };
  const head = sections.find((section) => section.node.type === 'thead');
  const headers =
    !merged && head?.rows.length === 1
      ? head.rows[0].positions.map(({ node }) =>
          text(node.props.children).trim().toLowerCase(),
        )
      : undefined;
  const sizing = planTableSizing(width, sizingCells);
  const lastSection = [...sections]
    .reverse()
    .find((section) => section.rows.length > 0);
  let sectionIndex = 0;
  const result = Children.map(children, (section) => {
    if (
      !isValidElement<CellProps>(section) ||
      !sectionTags.has(String(section.type))
    )
      return section;
    const plan = sections[sectionIndex++];
    let rowIndex = 0;
    return cloneElement(section, {
      children: Children.map(section.props.children, (row) => {
        if (!isValidElement<CellProps>(row)) return row;
        const index = rowIndex++;
        const positions = plan.rows[index].positions;
        let cellIndex = 0;
        return cloneElement(row, {
          children: Children.map(row.props.children, (cell) => {
            if (!isValidElement<CellProps>(cell)) return cell;
            const { column, span } = positions[cellIndex++];
            const kind = tableCellKind(kinds, column, span);
            const rowSpan = Number(cell.props.rowSpan ?? 1);
            const size = sizingForCell(sizing.columns, {
              column,
              span,
              header: section.type === 'thead',
              content: cellContent(cell.props.children),
            });
            const alignment = tableCellAlignment(
              { span, rowSpan, header: section.type === 'thead' },
              kind,
              size,
            );
            return cloneElement(cell, {
              'data-table-column': String(column),
              'data-table-column-kind': kind,
              'data-table-column-size': size.kind,
              'data-table-bottom-edge':
                plan === lastSection && index + rowSpan === plan.rows.length
                  ? ''
                  : undefined,
              'data-table-align': alignment.textAlign,
              'data-table-vertical-align': alignment.verticalAlign,
              style: {
                ...cell.props.style,
                '--docs-table-cell-min': `${size.minCh}ch`,
              } as CSSProperties,
            });
          }),
        });
      }),
    });
  });
  return { children: result, headers, kinds, sizing };
}
