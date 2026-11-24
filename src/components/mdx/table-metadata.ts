import type { TableColumnSize, TableSizingCell } from './table-sizing';

export type DocsTableColumnKind =
  | 'index'
  | 'name'
  | 'type'
  | 'value'
  | 'content'
  | 'number'
  | 'description'
  | 'required'
  | 'requirement';

export type TableMetadataCell = TableSizingCell & {
  section: 'thead' | 'tbody' | 'tfoot';
  row: number;
  rowSpan: number;
};

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

// SSR and DOM updates derive roles from the same current logical grid.
export function planTableColumnKinds(
  width: number,
  cells: readonly TableMetadataCell[],
  declared?: readonly DocsTableColumnKind[],
): DocsTableColumnKind[] {
  if (declared)
    return Array.from(
      { length: width },
      (_, column) => declared[column] ?? 'content',
    );
  const kinds = Array<DocsTableColumnKind>(width).fill('content');
  const head = cells.filter((cell) => cell.header);
  for (const cell of head) {
    const label = cell.content.text.replace(/\s+/g, ' ').trim().toLowerCase();
    for (let offset = 0; offset < cell.span; offset++)
      kinds[cell.column + offset] = headerKind(label);
  }
  if (
    !cells.some((cell) => cell.span > 1 || cell.rowSpan > 1) &&
    new Set(head.map((cell) => cell.row)).size === 1
  ) {
    for (const header of head) {
      const body = cells.filter(
        (cell) => cell.section === 'tbody' && cell.column === header.column,
      );
      if (
        !header.content.text.trim() &&
        body.length > 1 &&
        body.every(
          (cell, index) => cell.content.text.trim() === String(index + 1),
        )
      )
        kinds[header.column] = 'index';
    }
  }
  return kinds;
}

export function tableCellKind(
  kinds: readonly DocsTableColumnKind[],
  column: number,
  span: number,
) {
  return kinds
    .slice(column, column + span)
    .every((kind) => kind === kinds[column])
    ? kinds[column]
    : undefined;
}

export function tableCellAlignment(
  cell: Pick<TableMetadataCell, 'header' | 'span' | 'rowSpan'>,
  kind: DocsTableColumnKind | undefined,
  size: { kind: TableColumnSize['kind'] | 'span' },
): { textAlign?: 'center'; verticalAlign?: 'middle' } {
  const merged = cell.span > 1 || cell.rowSpan > 1;
  const status = kind === 'required' || kind === 'requirement';
  return {
    textAlign:
      cell.span > 1 ||
      (cell.header && merged) ||
      (status && size.kind === 'compact')
        ? 'center'
        : undefined,
    verticalAlign: merged ? 'middle' : undefined,
  };
}
