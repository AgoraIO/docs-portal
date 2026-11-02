import { describe, expect, it } from 'vitest';
import {
  filterDocsToc,
  getDocsHeadingTitle,
  resolveDocsTocMaxDepth,
} from './docs-toc';

describe('docs TOC display policy', () => {
  it.each(['appledoc', 'doxygen', 'javadoc', 'typedoc'])(
    'keeps %s members and hides their detail subsections',
    (generator) => {
      expect(resolveDocsTocMaxDepth({ _migration: { generator } }, true)).toBe(
        3,
      );
    },
  );
  it('uses the member level in Oxygen output, including class-only pages', () => {
    expect(
      resolveDocsTocMaxDepth({ _migration: { generator: 'oxygen' } }, true, [
        { depth: 2 },
        { depth: 3 },
      ]),
    ).toBe(2);
    expect(
      resolveDocsTocMaxDepth({ _migration: { generator: 'oxygen' } }, true, [
        { depth: 3 },
      ]),
    ).toBe(3);
  });
  it('keeps DITA class member headings', () => {
    expect(
      resolveDocsTocMaxDepth({ _migration: { generator: 'dita' } }, true),
    ).toBe(3);
  });
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

describe('rendered TOC heading names', () => {
  it('uses the heading label and excludes changing copy-button announcements', () => {
    const heading = document.createElement('h3');
    heading.setAttribute('aria-labelledby', 'toc-api-label toc-platform-label');
    heading.innerHTML =
      '<span id="toc-api-label">initialize</span><span id="toc-platform-label">Android</span><button aria-live="polite">Copy Anchor Link</button>';
    document.body.append(heading);
    try {
      expect(getDocsHeadingTitle(heading)).toBe('initialize Android');
      const button = heading.querySelector('button');
      if (!button) throw new Error('Missing copy button fixture');
      button.textContent = 'Copied Anchor Link';
      expect(getDocsHeadingTitle(heading)).toBe('initialize Android');
    } finally {
      heading.remove();
    }
  });

  it('preserves titles without an accessible label, including accordion headings', () => {
    const heading = document.createElement('h3');
    heading.textContent = 'v4.24.9';
    expect(getDocsHeadingTitle(heading)).toBe('v4.24.9');
    heading.setAttribute('aria-labelledby', 'missing-toc-heading-label');
    expect(getDocsHeadingTitle(heading)).toBe('v4.24.9');
  });
});
