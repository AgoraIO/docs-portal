// Cell geometry is explicit. Equal text never implies a merge: repeated rates,
// defaults and independent totals must remain independent unless the source spans.
export function layoutMergedTable(
  inputRows,
  configuredHeader,
  { strict = false } = {},
) {
  const headers = configuredHeader
    ? (Array.isArray(configuredHeader[0])
        ? configuredHeader
        : [configuredHeader]
      ).map((row) =>
        row.map((cell) =>
          typeof cell === 'string'
            ? { kind: 'h', raw: cell }
            : { ...cell, kind: 'h' },
        ),
      )
    : null;
  const rows = headers ? [...headers, ...inputRows] : inputRows;
  const grid = [];
  const physicalRows = rows.map(() => []);
  for (const [r, row] of rows.entries()) {
    grid[r] ??= [];
    let column = 0;
    for (const source of row) {
      while (grid[r][column]) column++;
      const requested = positiveSpan(source.rowspan);
      const rowspan = Math.min(requested, rows.length - r);
      if (strict && requested !== rowspan)
        throw new Error(`Row ${r + 1}: rowspan extends beyond the table`);
      const colspan = positiveSpan(source.colspan);
      const cell = {
        ...source,
        raw: source.raw ?? '',
        rowspan,
        colspan,
        row: r,
        column,
      };
      for (let y = 0; y < rowspan; y++) {
        grid[r + y] ??= [];
        for (let x = 0; x < colspan; x++) {
          if (grid[r + y][column + x])
            throw new Error(
              `Row ${r + 1}: overlapping merged cells at column ${column + x + 1}`,
            );
          grid[r + y][column + x] = cell;
        }
      }
      physicalRows[r].push(cell);
      column += colspan;
    }
  }
  const width = Math.max(0, ...grid.map((row) => row.length));
  if (strict) {
    grid.forEach((row, r) => {
      if (
        Array.from({ length: width }, (_, c) => row[c]).some((cell) => !cell)
      ) {
        throw new Error(
          `Row ${r + 1}: merged cells do not cover all ${width} columns`,
        );
      }
    });
  } else {
    // HTML permits omitted trailing blank cells. Make only those empty slots
    // explicit; never fill them with a preceding group's text or price.
    grid.forEach((row, r) => {
      for (let c = 0; c < width; c++) {
        if (row[c]) continue;
        const blank = {
          raw: '',
          kind: 'd',
          rowspan: 1,
          colspan: 1,
          row: r,
          column: c,
        };
        row[c] = blank;
        physicalRows[r].push(blank);
      }
      physicalRows[r].sort((a, b) => a.column - b.column);
    });
  }
  let headerCount = headers?.length ?? 0;
  if (!configuredHeader) {
    while (
      headerCount < rows.length &&
      rows[headerCount].length &&
      rows[headerCount].every((cell) => cell.kind === 'h')
    )
      headerCount++;
    headerCount = Math.max(1, headerCount);
    if (rows[0]?.some((cell) => cell.kind === 'h')) {
      headerCount = Math.min(
        rows.length,
        Math.max(headerCount, ...physicalRows[0].map((cell) => cell.rowspan)),
      );
    }
  }
  return {
    width,
    grid,
    rows: physicalRows,
    headerCount,
    hasSpans: physicalRows.some((row) =>
      row.some((cell) => cell.rowspan > 1 || cell.colspan > 1),
    ),
  };
}

// Parse data-only legacy header arrays without evaluating source JavaScript.
// Array nesting defines header rows; row/col remain explicit cell spans.
export function parseLegacyTableHeaders(content) {
  const result = new Map();
  const exports = /^export\s+const\s+(\w+)\s*=\s*(?=\[)/gm;
  for (const match of content.matchAll(exports)) {
    const start = match.index + match[0].length;
    let depth = 0;
    let quote = null;
    let escaped = false;
    let rowIndex = 0;
    let nested = false;
    const rows = [[]];
    for (let i = start; i < content.length; i++) {
      const char = content[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char;
        continue;
      }
      if (char === '[') {
        depth++;
        if (depth === 2) {
          nested = true;
          rows[rowIndex] ??= [];
        }
      } else if (char === ']') {
        if (depth === 2) rowIndex++;
        depth--;
        if (depth === 0) break;
      } else if (char === '{') {
        const end = content.indexOf('}', i + 1);
        if (end < 0) break;
        const raw = content.slice(i + 1, end);
        const label = raw.match(/\blabel\s*:\s*(['"])(.*?)\1/s);
        if (label) {
          rows[nested ? rowIndex : 0] ??= [];
          rows[nested ? rowIndex : 0].push({
            raw: label[2],
            kind: 'h',
            rowspan: Number(raw.match(/\brow\s*:\s*(\d+)/)?.[1] ?? 1),
            colspan: Number(raw.match(/\bcol\s*:\s*(\d+)/)?.[1] ?? 1),
          });
        }
        i = end;
      }
    }
    if (rows.some((row) => row.length))
      result.set(
        match[1],
        rows.filter((row) => row.length),
      );
  }
  return result;
}

function positiveSpan(value = 1) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1)
    throw new Error(`Invalid table span: ${value}`);
  return number;
}

export function renderMergedTable(inputRows, configuredHeader) {
  const layout = layoutMergedTable(inputRows, configuredHeader);
  const renderRow = (row, header) => {
    const cells = row.map((cell) => {
      const tag = header || cell.kind === 'h' ? 'th' : 'td';
      const attributes = [
        cell.rowspan > 1 ? `rowSpan={${cell.rowspan}}` : '',
        cell.colspan > 1 ? `colSpan={${cell.colspan}}` : '',
        tag === 'th'
          ? `scope="${header ? (cell.colspan > 1 ? 'colgroup' : 'col') : cell.rowspan > 1 ? 'rowgroup' : 'row'}"`
          : '',
      ]
        .filter(Boolean)
        .map((s) => ` ${s}`)
        .join('');
      const value = cell.raw.trim();
      if (/<Slot\s+name=/.test(value))
        throw new Error(
          'Resolve rich Slot content before rendering a native merged table',
        );
      if (!value) return `<${tag}${attributes} />`;
      const block =
        value.includes('\n') || /^(?:[-*] |\d+[.)] |```|:::|!\[|<)/.test(value);
      return `<${tag}${attributes}>${block ? `\n\n${value}\n\n` : value}</${tag}>`;
    });
    return cells.length ? ['<tr>', ...cells, '</tr>'].join('\n') : '<tr />';
  };
  return [
    '<DocsTable>',
    '<thead>',
    ...layout.rows
      .slice(0, layout.headerCount)
      .map((row) => renderRow(row, true)),
    '</thead>',
    '<tbody>',
    ...layout.rows
      .slice(layout.headerCount)
      .map((row) => renderRow(row, false)),
    '</tbody>',
    '</DocsTable>',
  ].join('\n');
}
