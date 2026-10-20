import { describe, expect, it } from 'vitest';
import { toPublicRedirectTarget } from './shengwang-redirect-targets.mjs';

describe('Shengwang public redirect targets', () => {
  it.each([
    ['/zh-CN/realtime-media/rtc', '/realtime-media/rtc'],
    ['/zh-CN/api-reference/rtc#join', '/api-reference/rtc#join'],
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
