import { describe, expect, it } from 'vitest';
import { toPublicRedirectTarget } from './shengwang-redirect-targets.mjs';

describe('Shengwang public redirect targets', () => {
  it.each([
    ['/zh-CN/realtime-media/rtc', '/realtime-media/rtc'],
    ['/zh-CN/api-reference/rtc#join', '/api-reference/rtc#join'],
    [
      '/zh-CN/realtime-media/rtc/reference/events',
      '/api-reference/rtc/restful/webhook/events',
    ],
    [
      '/zh-CN/realtime-media/rtc/reference/events?from=legacy#103-broadcaster-join-channel',
      '/api-reference/rtc/restful/webhook/events?from=legacy#103-broadcaster-join-channel',
    ],
    [
      '/realtime-media/rtc/reference/events#104',
      '/api-reference/rtc/restful/webhook/events#104',
    ],
    [
      '/zh-CN/realtime-media/rtc/reference/events-extra',
      '/realtime-media/rtc/reference/events-extra',
    ],
    [
      '/en/realtime-media/rtc/reference/events',
      '/en/realtime-media/rtc/reference/events',
    ],
    ['/zh-CN/search?q=rtc#results', '/search?q=rtc#results'],
    ['/zh-CN', '/'],
    ['/zh-CN/', '/'],
    ['/zh-CN?q=rtc#results', '/?q=rtc#results'],
    ['/zh-CN#overview', '/#overview'],
    ['', ''],
    ['/realtime-media/rtc', '/realtime-media/rtc'],
    ['/en/realtime-media/rtc', '/en/realtime-media/rtc'],
    ['/zh-CN-extra/page', '/zh-CN-extra/page'],
    ['/other/zh-CN/page', '/other/zh-CN/page'],
    ['/search?q=/zh-CN/rtc#zh-CN', '/search?q=/zh-CN/rtc#zh-CN'],
    ['https://example.com/zh-CN/page', 'https://example.com/zh-CN/page'],
  ])(
    'converts %j to %j without changing other URL parts',
    (input, expected) => {
      expect(toPublicRedirectTarget(input)).toBe(expected);
      expect(toPublicRedirectTarget(expected)).toBe(expected);
    },
  );
});
