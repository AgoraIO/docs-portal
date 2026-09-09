import { describe, expect, it } from 'vitest';
import { normalizeApiReferenceUrl } from './api-url-normalizer';

describe('normalizeApiReferenceUrl', () => {
  it('converges repeated language values in an absolute URL without changing its fragment', () => {
    expect(
      normalizeApiReferenceUrl(
        'https://api-ref.agora.io/method?foo=1&language=objc,objc&bar=2#app-main',
      ),
    ).toBe(
      'https://api-ref.agora.io/method?foo=1&language=objc&bar=2#app-main',
    );
  });

  it('uses the first non-empty language token from repeated relative query parameters', () => {
    expect(
      normalizeApiReferenceUrl(
        '/method?language=&keep=a&language=swift,objc#section%201',
      ),
    ).toBe('/method?language=swift&keep=a#section%201');
  });

  it('uses the first language token from a comma-separated value', () => {
    expect(
      normalizeApiReferenceUrl(
        '/method?language=swift,objc&language=objc#fragment',
      ),
    ).toBe('/method?language=swift#fragment');
  });

  it('removes language parameters when every language token is empty', () => {
    expect(
      normalizeApiReferenceUrl('/method?language=,&keep=1&language=#fragment'),
    ).toBe('/method?keep=1#fragment');
  });

  it('returns URLs without a language parameter byte-for-byte', () => {
    const url = '/method?keep=a%20b&encoded=%2Fvalue#fragment';

    expect(normalizeApiReferenceUrl(url)).toBe(url);
  });

  it('preserves non-language query segments byte-for-byte', () => {
    expect(
      normalizeApiReferenceUrl(
        '/method?keep=a%20b&language=objc,objc&encoded=%2Fvalue#fragment',
      ),
    ).toBe('/method?keep=a%20b&language=objc&encoded=%2Fvalue#fragment');
  });
});
