import { describe, expect, it } from 'vitest';
import {
  buildSearchPageHref,
  parseSearchPageState,
  searchScopeProduct,
} from './search-page-state';

describe('search page URL state', () => {
  it.each([['cloud-transcoding', 'transcoding'], ['signaling', 'rtm']])(
    'uses one product option for legacy links with %s', (product, canonical) => {
      expect(parseSearchPageState({ product }).product).toBe(canonical);
    },
  );
  it('round trips a shareable query, filters, and page without defaults', () => {
    const input = {
      q: ' Token 过期 ',
      product: 'conversational-ai',
      platform: 'web',
      version: '4.6.0',
      type: 'openapi' as const,
      page: 3,
    };
    const href = buildSearchPageHref('zh-CN', input);
    expect(
      parseSearchPageState(
        Object.fromEntries(new URL(href, 'https://docs.local').searchParams),
      ),
    ).toEqual({ ...input, q: 'Token 过期' });
    expect(buildSearchPageHref('zh-CN', { q: '' })).toBe('/zh-CN/search');
  });

  it('rejects malformed filters and bounds query and page input', () => {
    expect(
      parseSearchPageState({
        q: 'x'.repeat(600),
        product: 'rtc" OR hidden = true',
        platform: 'fake-platform',
        version: '../secret',
        type: 'ai',
        page: -1,
      }),
    ).toEqual({
      q: 'x'.repeat(500),
      product: undefined,
      platform: undefined,
      version: undefined,
      type: 'all',
      page: 1,
    });
    expect(parseSearchPageState({ page: '9999' }).page).toBe(500);
    expect(parseSearchPageState({ page: '1.2' }).page).toBe(1);
  });

  it('carries product scope from the quick search dialog', () => {
    expect(searchScopeProduct({ field: 'product', value: 'rtc' })).toBe('rtc');
    expect(searchScopeProduct({ field: 'tab', value: 'ai' })).toBe(
      'conversational-ai',
    );
    expect(
      searchScopeProduct({ field: 'tab', value: 'introduction' }),
    ).toBeUndefined();
  });
});
