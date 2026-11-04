import { describe, expect, it } from 'vitest';
import { parseSearchPageState } from './search-page-state';
import { parseDocsSearch, stringifyDocsSearch } from './search-url-state';

describe('docs query parameter round trips', () => {
  it('preserves repeated values and single JSON literals as different URL parameters', () => {
    const input =
      '?tag=a&tag=b&literal=%5B%22a%22%2C%22b%22%5D&count=001&flag=false';
    const parsed = parseDocsSearch(input);
    expect(parsed).toMatchObject({
      tag: ['a', 'b'],
      literal: '["a","b"]',
      count: '001',
      flag: 'false',
    });
    const output = new URLSearchParams(stringifyDocsSearch(parsed));
    expect([...output]).toEqual([...new URLSearchParams(input)]);
  });

  it.each(['110', 'true', '{"code":110}', '"hello"', 'hello'])(
    'keeps the search term %s stable across repeated navigation',
    (q) => {
      const first = parseDocsSearch(stringifyDocsSearch({ q, page: 2 }));
      const second = parseDocsSearch(stringifyDocsSearch(first));
      expect(parseSearchPageState(first)).toMatchObject({ q, page: 2 });
      expect(second).toEqual(first);
    },
  );

  it('keeps legacy quoted search URLs compatible', () => {
    expect(
      parseSearchPageState(parseDocsSearch('?q=%22110%22&page=2')),
    ).toMatchObject({ q: '110', page: 2 });
  });
});
