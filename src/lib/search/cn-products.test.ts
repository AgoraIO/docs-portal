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
    expect(normalizeCnProduct('micro-calling')).toBe('voip-callkit');
    expect(normalizeCnProduct('cloud-transcoding')).toBe('transcoding');
  });

  it('returns canonical and legacy identifiers for compatibility filters', () => {
    expect(getCnProductAliases('ppt-transcoding')).toEqual([
      'ppt-transcoding',
      'ppt-conversion-service',
    ]);
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
