import { describe, expect, it } from 'vitest';
import { stripLocalePrefix, toLocalizedPath } from './locale-routes';

describe('locale routes', () => {
  it('prefixes localized paths', () => {
    expect(toLocalizedPath('en', '/docs')).toBe('/en/docs');
    expect(toLocalizedPath('zh-CN', '/api-ref')).toBe('/zh-CN/api-ref');
    expect(toLocalizedPath('en', '/')).toBe('/en');
  });

  it('strips known locale prefixes', () => {
    expect(stripLocalePrefix('/en/docs/convoai')).toBe('/docs/convoai');
    expect(stripLocalePrefix('/zh-CN/api-ref/foo')).toBe('/api-ref/foo');
    expect(stripLocalePrefix('/docs/convoai')).toBe('/docs/convoai');
  });
});
