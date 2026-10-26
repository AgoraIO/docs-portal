import { describe, expect, it } from 'vitest';
import {
  getCnProductAliases,
  isExcludedCnProduct,
  normalizeCnProduct,
  normalizeCnProductList,
} from './cn-products';

describe('Chinese search product identifiers', () => {
  it('normalizes legacy product identifiers to the navigation IDs', () => {
    expect(normalizeCnProduct('ppt-conversion-service')).toBe(
      'ppt-transcoding',
    );
    expect(normalizeCnProduct('micro-calling')).toBe('voip-call');
    expect(normalizeCnProduct('cloud-transcoding')).toBe('transcoding');
  });

  it('returns canonical and legacy identifiers for compatibility filters', () => {
    expect(getCnProductAliases('ppt-transcoding')).toEqual(
      expect.arrayContaining(['ppt-transcoding', 'ppt-conversion-service']),
    );
  });

  it.each([
    ['agora-analytics', 'analytics'],
    ['usage-analytics', 'analytics'],
    ['online-art-teaching', 'art-class'],
    ['online-music-teaching', 'online-music-class'],
    ['private-room', 'one-to-one-live'],
    ['voip-callkit', 'voip-call'],
  ])('unifies guide and API product %s as %s', (alias, canonical) => {
    expect(normalizeCnProduct(alias)).toBe(canonical);
    expect(getCnProductAliases(canonical)).toContain(alias);
  });

  it('removes excluded products while preserving valid product memberships', () => {
    expect(normalizeCnProductList(['danmaku'])).toEqual([]);
    expect(normalizeCnProductList(['danmaku', 'rtc', 'rtc'])).toEqual(['rtc']);
    expect(isExcludedCnProduct('danmaku')).toBe(true);
    expect(isExcludedCnProduct('rtc')).toBe(false);
    expect(
      normalizeCnProductList([
        'sdk-extensions',
        'metakit',
        'portrait-rhythm',
        'rtc',
      ]),
    ).toEqual(['rtc']);
  });
});
