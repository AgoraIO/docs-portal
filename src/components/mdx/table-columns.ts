import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

export type DocsTableColumnKind =
  | 'name'
  | 'type'
  | 'value'
  | 'content'
  | 'number'
  | 'description'
  | 'required'
  | 'requirement';

type CellProps = ComponentProps<'td'> & {
  'data-table-column'?: string;
  'data-table-column-kind'?: DocsTableColumnKind;
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

function headerKind(label: string): DocsTableColumnKind {
  if (
    /^(?:(?:是否)?(?:必填|必选|必需|必须|可选)|required|optional|mandatory)$/.test(
      label,
    )
  )
    return 'required';
  if (/^(填写要求|requirements?)$/.test(label)) return 'requirement';
  if (
    /^(描述|说明|功能描述|含义与作用|含义|作用|解释|备注|错误描述|原因及解决方法|实现功能|sdk 行为|鉴权步骤|状态说明和排障指导|用法说明|配置方式及示例|连接后的用户体验|description|descriptions|details|meaning|notes)$/.test(
      label,
    )
  )
    return 'description';
  if (/^(类型|数据类型|json\s*类型|type|json\s*type|data\s*type)$/.test(label))
    return 'type';
  if (
    /^(参数|参数名|参数名称|属性|名称|字段|字段名|api|常用 api|日期|date|平台|文件|功能|能力|错误码|配置项|配置路径|服务|分组|parameter|parameters|property|properties|name|names|field|fields|option|group)$/.test(
      label,
    )
  )
    return 'name';
  if (
    /^(单价|价格|服务费用|费用(?:合计|总和)?|数量|时长用量|用量|price|cost|quantity)(?:[（(][^）)]*[）)])?$/.test(
      label,
    )
  )
    return 'number';
  if (
    /^(值|默认值|单位|分辨率|视频质量层|视频质量等级|value|default(?: value)?|unit|resolution|tier)$/.test(
      label,
    )
  )
    return 'value';
  return 'content';
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

  const kinds = Array<DocsTableColumnKind>(width).fill('content');
  const head = sections.find((section) => section.node.type === 'thead');
  for (const row of head?.rows ?? [])
    for (const cell of row.positions) {
      const label = text(cell.node.props.children)
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      for (let offset = 0; offset < cell.span; offset++)
        kinds[cell.column + offset] = headerKind(label);
    }
  if (declared) kinds.splice(0, width, ...declared);
  if (!valid) return { children, headers: undefined, kinds };
  const headers =
    !merged && head?.rows.length === 1
      ? head.rows[0].positions.map(({ node }) =>
          text(node.props.children).trim().toLowerCase(),
        )
      : undefined;
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
        const positions = plan.rows[rowIndex++].positions;
        let cellIndex = 0;
        return cloneElement(row, {
          children: Children.map(row.props.children, (cell) => {
            if (!isValidElement<CellProps>(cell)) return cell;
            const { column, span } = positions[cellIndex++];
            const kind = kinds
              .slice(column, column + span)
              .every((kind) => kind === kinds[column])
              ? kinds[column]
              : undefined;
            const mergedCell = span > 1 || Number(cell.props.rowSpan ?? 1) > 1;
            const centered =
              span > 1 ||
              (section.type === 'thead' && mergedCell) ||
              kind === 'required' ||
              kind === 'requirement';
            return cloneElement(cell, {
              'data-table-column': String(column),
              'data-table-column-kind': kind,
              ...(mergedCell || centered
                ? {
                    style: {
                      ...cell.props.style,
                      ...(centered ? { textAlign: 'center' } : {}),
                      ...(mergedCell ? { verticalAlign: 'middle' } : {}),
                    },
                  }
                : {}),
            });
          }),
        });
      }),
    });
  });
  return { children: result, headers, kinds };
}
