import { describe, expect, it } from 'vitest';
import { resolveZhCnProductIaRedirect } from './zh-cn-product-ia-redirects';

describe('zh-CN rehomed API reference redirects', () => {
  it.each([
    [['sdks'], '/zh-CN/reference/sdks'],
    [
      ['recipes', 'python-quickstart'],
      '/zh-CN/reference/demo/python-quickstart',
    ],
    [
      ['faq', 'integration', 'system_volume'],
      '/zh-CN/reference/faq/integration/system_volume',
    ],
  ] as const)(
    'redirects the old API Reference resource path %j',
    (slugSegments, expected) => {
      expect(
        resolveZhCnProductIaRedirect('zh-CN', 'api-reference', [
          ...slugSegments,
        ]),
      ).toBe(expected);
    },
  );

  it('redirects the previous Reference recipes path to Demo', () => {
    expect(
      resolveZhCnProductIaRedirect('zh-CN', 'reference', [
        'recipes',
        'python-quickstart',
      ]),
    ).toBe('/zh-CN/reference/demo/python-quickstart');
  });

  it.each([
    [
      'realtime-media',
      ['online-ktv', 'ktv-scenario', 'api', 'ktv-api'],
      '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/ktv-api',
    ],
    [
      'solutions',
      ['online-ktv', 'auikaraoke', 'reference', 'lyrics-api'],
      '/zh-CN/api-reference/online-ktv/android/auikaraoke/api/lyrics-api',
    ],
    [
      'realtime-media',
      ['transcoding', 'webhook', 'ncs-events'],
      '/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events',
    ],
    [
      'realtime-media',
      ['transcoding', 'reference', 'ncs-events'],
      '/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events',
    ],
  ] as const)(
    'redirects %s/%s to its canonical API reference route',
    (tab, slugSegments, expected) => {
      expect(
        resolveZhCnProductIaRedirect('zh-CN', tab, [...slugSegments]),
      ).toBe(expected);
    },
  );

  it('does not apply zh-CN redirects to other locales', () => {
    expect(
      resolveZhCnProductIaRedirect('en', 'realtime-media', [
        'transcoding',
        'webhook',
        'ncs-events',
      ]),
    ).toBeNull();
  });
});
