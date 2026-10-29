// Flatten merged cells into a native Markdown grid. Vertical groups repeat their
// value so every row retains its meaning without HTML rowspan support. Horizontal
// body spans retain their value once (especially important for prices/totals).
export function normalizeTableGrid(rows, configuredHeader) {
  const grid = [];
  for (const [rowIndex, row] of rows.entries()) {
    grid[rowIndex] ??= [];
    let column = 0;
    for (const cell of row) {
      while (grid[rowIndex][column]) column++;
      const height = Math.min(
        rows.length - rowIndex,
        Math.max(1, Number(cell.rowspan) || 1),
      );
      const width = Math.max(1, Number(cell.colspan) || 1);
      const origin = `${rowIndex}:${column}`;
      for (let y = 0; y < height; y++) {
        grid[rowIndex + y] ??= [];
        for (let x = 0; x < width; x++) {
          grid[rowIndex + y][column + x] = {
            ...cell,
            raw: x === 0 || cell.kind === 'h' ? cell.raw : '',
            origin,
          };
        }
      }
      column += width;
    }
  }
  const width = Math.max(
    0,
    configuredHeader?.length ?? 0,
    ...grid.map((r) => r.length),
  );
  const filled = grid.map((row) =>
    Array.from({ length: width }, (_, i) => row[i] ?? { kind: 'd', raw: '' }),
  );
  // A physical row with no cells adds no independent data. Some legacy price
  // tables use one under a full-width vertical span; repeating it adds a fee.
  if (configuredHeader) {
    return {
      header: configuredHeader.map((raw) => ({ kind: 'h', raw })),
      bodyRows: filled.filter((_, index) => rows[index].length > 0),
    };
  }
  // Only the leading header band is combined. A th used as a body row label
  // must not turn the rest of a table into a multi-level column header.
  let headerCount = 0;
  while (
    headerCount < rows.length &&
    rows[headerCount].length &&
    rows[headerCount].every((cell) => cell.kind === 'h')
  )
    headerCount++;
  if (headerCount > 0) {
    headerCount = Math.min(
      rows.length,
      Math.max(
        headerCount,
        ...rows[0].map((cell) => Number(cell.rowspan) || 1),
      ),
    );
  }
  headerCount = Math.max(1, headerCount);
  const header = Array.from({ length: width }, (_, column) => {
    const seen = new Set();
    const labels = [];
    for (const row of filled.slice(0, headerCount)) {
      const cell = row[column];
      if (cell.raw && !seen.has(cell.origin)) labels.push(cell.raw);
      seen.add(cell.origin);
    }
    return { kind: 'h', raw: labels.join(' / ') };
  });
  return {
    header,
    bodyRows: filled
      .slice(headerCount)
      .filter((_, index) => rows[index + headerCount].length > 0),
  };
}
