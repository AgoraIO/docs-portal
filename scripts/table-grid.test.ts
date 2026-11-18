import { describe, expect, it } from 'vitest';
import { normalizeTableGrid } from './lib/table-grid.mjs';

describe('simple GFM table normalization', () => {
  it('retains independent equal values and blank cells', () => {
    const result = normalizeTableGrid([
      [{ raw: 'Type' }, { raw: 'Default' }],
      [{ raw: 'float' }, { raw: '0' }],
      [{ raw: 'float' }, { raw: '' }],
    ]);
    expect(result.bodyRows).toEqual([
      [{ raw: 'float' }, { raw: '0' }],
      [{ raw: 'float' }, { raw: '' }],
    ]);
  });
  it('does not flatten explicitly merged cells', () => {
    expect(() =>
      normalizeTableGrid([[{ raw: 'group', rowspan: 2 }], []]),
    ).toThrow('Merged cells require renderMergedTable');
  });
});
