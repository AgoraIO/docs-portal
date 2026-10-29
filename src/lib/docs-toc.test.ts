import { describe, expect, it } from 'vitest';
import { filterDocsToc, resolveDocsTocMaxDepth } from './docs-toc';

describe('docs TOC display policy', () => {
  it.each(['appledoc', 'doxygen', 'javadoc', 'typedoc'])(
    'keeps %s members and hides their detail subsections',
    (generator) => {
      expect(resolveDocsTocMaxDepth({ _migration: { generator } }, true)).toBe(
        3,
      );
    },
  );
  it('honors an explicit depth before the generator default', () => {
    expect(
      resolveDocsTocMaxDepth(
        { tocMaxDepth: 2, _migration: { generator: 'appledoc' } },
        true,
      ),
    ).toBe(2);
  });
  it('leaves ordinary docs and unknown generators unchanged', () => {
    expect(
      resolveDocsTocMaxDepth({ _migration: { generator: 'appledoc' } }, false),
    ).toBeUndefined();
    expect(
      resolveDocsTocMaxDepth({ _migration: { generator: 'unknown' } }, true),
    ).toBeUndefined();
    expect(resolveDocsTocMaxDepth({ tocMaxDepth: 7 }, true)).toBeUndefined();
  });
  it('filters the navigation without mutating headings or anchor metadata', () => {
    const headings = [
      { depth: 3, url: '#member' },
      { depth: 4, url: '#declared-in' },
    ];
    expect(filterDocsToc(headings, 3)).toEqual([headings[0]]);
    expect(headings).toHaveLength(2);
    expect(filterDocsToc(headings)).toBe(headings);
  });
});
