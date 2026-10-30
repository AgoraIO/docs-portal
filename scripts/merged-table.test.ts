import { describe, expect, it } from 'vitest';
import {
  layoutMergedTable,
  parseLegacyTableHeaders,
  renderMergedTable,
} from './lib/merged-table.mjs';

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

describe('native merged table conversion', () => {
  it('preserves nested groups as single cells without merging independent equal types', () => {
    const rows = [
      [d('makeup', 3), d('lip', 2), d('enable'), d('float')],
      [d('strength'), d('float')],
      [d('brow'), d('enable'), d('float')],
    ];
    const source = renderMergedTable(rows, ['option', 'part', 'key', 'type']);
    expect(source).toContain('<td rowSpan={3}>makeup</td>');
    expect(source).toContain('<td rowSpan={2}>lip</td>');
    expect(source.match(/>makeup</g)).toHaveLength(1);
    expect(source.match(/>float</g)).toHaveLength(3);
    expect(layoutMergedTable(rows, null, { strict: true }).width).toBe(4);
  });

  it('retains both header levels, source groups and shared total colspans', () => {
    const source = renderMergedTable([
      [h('Date', 1, 2), h('Usage', 2)],
      [h('Audio'), h('Video')],
      [d('Monday'), d('1'), d('2')],
      [d('Total'), d('3 minutes', 1, 2)],
    ]);
    expect(source).toContain('<th rowSpan={2} scope="col">Date</th>');
    expect(source).toContain('<th colSpan={2} scope="colgroup">Usage</th>');
    expect(source).toContain('<td colSpan={2}>3 minutes</td>');
    expect(source.match(/<tr>/g)).toHaveLength(4);
    expect(source.match(/>Usage</g)).toHaveLength(1);
  });

  it('keeps rich content in its owning cell and does not manufacture duplicate services', () => {
    const source = renderMergedTable([
      [h('Service'), h('Details')],
      [d('Conversion', 2), d('- One\n- Two', 2)],
      [],
      [d('Recording'), d('Rate')],
    ]);
    expect(source).toContain('<td rowSpan={2}>\n\n- One\n- Two\n\n</td>');
    expect(source.match(/>Conversion</g)).toHaveLength(1);
    expect(source).not.toContain('Slot');
  });

  it('clips erroneous source spans without adding rows', () => {
    const source = renderMergedTable(
      [[d('SDK', 5), d('one')], [d('two')]],
      ['Group', 'File'],
    );
    expect(source).toContain('<td rowSpan={2}>SDK</td>');
    expect(source).not.toContain('rowSpan={5}');
    expect(source.match(/<tr>/g)).toHaveLength(3);
  });

  it('rejects overlaps, gaps and out-of-range spans when auditing authored tables', () => {
    expect(() =>
      layoutMergedTable([[d('a', 2), d('b')], []], null, { strict: true }),
    ).toThrow('do not cover');
    expect(() =>
      layoutMergedTable([[d('a', 3)], []], null, { strict: true }),
    ).toThrow('beyond');
    expect(() =>
      layoutMergedTable([[d('a'), d('b', 2)], [d('c', 1, 2)]], null, {
        strict: true,
      }),
    ).toThrow('overlapping');
    expect(() => layoutMergedTable([[d('a', 0)]])).toThrow(
      'Invalid table span',
    );
  });

  it('parses nested legacy headers as two rows without evaluating source expressions', () => {
    const headers = parseLegacyTableHeaders(`export const columns = [
  [{ label: '日期', row: 2 }, { label: '用量', col: 2 }],
  [{ label: '音频' }, { label: '视频' }]
];`).get('columns');
    const model = layoutMergedTable([[d('Monday'), d('1'), d('2')]], headers, {
      strict: true,
    });
    expect(model.headerCount).toBe(2);
    expect(model.width).toBe(3);
    expect(model.rows[0][0].rowspan).toBe(2);
    expect(model.rows[0][1].colspan).toBe(2);
  });
});
