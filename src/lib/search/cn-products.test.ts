import { describe, expect, it } from 'vitest';
import {
  getCnProductAliases,
  getCnSearchPathProduct,
  isExcludedCnProduct,
  normalizeCnProduct,
  normalizeCnProductList,
} from './cn-products';

describe('Chinese search product identifiers', () => {
  it.each([
    ['/api-reference/api-ref/danmaku/start-cloud-game', 'danmaku'],
    ['/zh-CN/api-reference/api-ref/danmaku/start-cloud-game#body', 'danmaku'],
    ['/realtime-media/cloud-transcoding/overview', 'transcoding'],
    ['/solutions/private-room/overview', 'one-to-one-live'],
    ['/api-reference/rtc/android/channel', 'rtc'],
    ['/ai/device-kit/overview', 'device-kit'],
    ['/zh-CN/ai/build/transcripts', 'conversational-ai'],
    ['/reference/faq/integration/token', 'reference'],
    ['/api-reference/api-ref/danmaku-extra/start-cloud-game', 'danmaku-extra'],
  ])('resolves shared route ownership for %s', (url, product) => {
    expect(getCnSearchPathProduct(url)).toBe(product);
  });

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
