// Simple tables remain GFM. Explicit merges must go through the native table
// renderer so no conversion can silently repeat or discard a spanning cell.
export function normalizeTableGrid(rows, configuredHeader) {
  if (
    rows.some((row) =>
      row.some((cell) => (cell.rowspan ?? 1) > 1 || (cell.colspan ?? 1) > 1),
    )
  ) {
    throw new Error(
      'Merged cells require renderMergedTable; flattening is not supported',
    );
  }
  const sourceHeader = configuredHeader
    ? configuredHeader.map((raw) => ({ raw, kind: 'h' }))
    : (rows[0] ?? []);
  const bodyRows = (configuredHeader ? rows : rows.slice(1)).filter(
    (row) => row.length,
  );
  const width = Math.max(
    sourceHeader.length,
    ...bodyRows.map((row) => row.length),
  );
  const pad = (row) =>
    Array.from(
      { length: width },
      (_, index) => row[index] ?? { kind: 'd', raw: '' },
    );
  return { header: pad(sourceHeader), bodyRows: bodyRows.map(pad) };
}
