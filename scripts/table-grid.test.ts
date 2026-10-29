import { describe, expect, it } from 'vitest';
import { normalizeTableGrid } from './lib/table-grid.mjs';

const h = (raw: string, colspan = 1, rowspan = 1) => ({
  raw,
  kind: 'h',
  colspan,
  rowspan,
});
const d = (raw: string, rowspan = 1, colspan = 1) => ({
  raw,
  kind: 'd',
  colspan,
  rowspan,
});
const matrix = (rows: { raw: string }[][]) =>
  rows.map((row) => row.map((cell) => cell.raw));

describe('native Markdown table grid', () => {
  it('does not manufacture another service from a physically empty merged row', () => {
    const result = normalizeTableGrid([
      [h('Service'), h('Rate')],
      [d('Conversion', 2), d('3 / 1,000', 2)],
      [],
      [d('Recording'), d('12 / 1,000')],
    ]);
    expect(matrix(result.bodyRows)).toEqual([
      ['Conversion', '3 / 1,000'],
      ['Recording', '12 / 1,000'],
    ]);
  });
  it('clips source rowspans at the final physical row', () => {
    const result = normalizeTableGrid(
      [[d('group', 5), d('one')], [d('two')]],
      ['Group', 'Value'],
    );
    expect(matrix(result.bodyRows)).toEqual([
      ['group', 'one'],
      ['group', 'two'],
    ]);
  });
  it('preserves nested vertical groups and trailing merged values', () => {
    const result = normalizeTableGrid(
      [
        [d('makeup', 3), d('lip', 2), d('enable'), d('bool'), d('total', 3)],
        [d('strength'), d('float')],
        [d('brow'), d('enable'), d('bool')],
      ],
      ['option', 'part', 'key', 'type', 'group total'],
    );
    expect(matrix(result.bodyRows)).toEqual([
      ['makeup', 'lip', 'enable', 'bool', 'total'],
      ['makeup', 'lip', 'strength', 'float', 'total'],
      ['makeup', 'brow', 'enable', 'bool', 'total'],
    ]);
  });

  it('combines grouped headers and keeps body colspan totals only once', () => {
    const result = normalizeTableGrid([
      [h('Date', 1, 2), h('Usage', 2)],
      [h('Audio'), h('Video')],
      [d('Monday'), d('1'), d('2')],
      [d('Total'), d('3 minutes', 1, 2)],
    ]);
    expect(result.header.map((cell: { raw: string }) => cell.raw)).toEqual([
      'Date',
      'Usage / Audio',
      'Usage / Video',
    ]);
    expect(matrix(result.bodyRows)).toEqual([
      ['Monday', '1', '2'],
      ['Total', '3 minutes', ''],
    ]);
  });

  it('reuses rich cell placeholders across vertical groups', () => {
    const result = normalizeTableGrid([
      [h('Name'), h('Details')],
      [d('one'), d('<Slot name="details" />', 2)],
      [d('two')],
    ]);
    expect(matrix(result.bodyRows)).toEqual([
      ['one', '<Slot name="details" />'],
      ['two', '<Slot name="details" />'],
    ]);
  });
});
