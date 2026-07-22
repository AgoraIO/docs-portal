import { describe, expect, it } from 'vitest';
import { resolveZhCnProductIaRedirect } from './zh-cn-product-ia-redirects';

describe('zh-CN rehomed API reference redirects', () => {
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
  ] as const)('redirects %s/%s to its canonical API reference route', (tab, slugSegments, expected) => {
    expect(resolveZhCnProductIaRedirect('zh-CN', tab, [...slugSegments])).toBe(
      expected,
    );
  });

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
