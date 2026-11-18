import { describe, expect, it } from 'vitest';
import { resolveZhCnApiReferenceProductDocsHref } from './api-reference-product-docs';

describe('resolveZhCnApiReferenceProductDocsHref', () => {
  it.each([
    ['/zh-CN/api-reference/conversational-ai/android/overview', '/zh-CN/ai'],
    ['/zh-CN/api-reference/conversational-ai/android/enum', '/zh-CN/ai'],
    [
      '/zh-CN/api-reference/rtc/android/rtc-api-overview',
      '/zh-CN/realtime-media/rtc',
    ],
    ['/zh-CN/api-reference/api-ref/console', '/zh-CN/introduction/quickstart'],
  ])('maps %s to %s', (activePath, expectedHref) => {
    expect(resolveZhCnApiReferenceProductDocsHref(activePath)).toBe(
      expectedHref,
    );
  });

  it('keeps the product destination for API descendants', () => {
    expect(
      resolveZhCnApiReferenceProductDocsHref(
        '/zh-CN/api-reference/rtc/android/rtc-api-overview/api-join-channel',
      ),
    ).toBe('/zh-CN/realtime-media/rtc');
  });

  it('does not create a destination for external IM API pages', () => {
    expect(
      resolveZhCnApiReferenceProductDocsHref(
        'https://im.shengwang.cn/docs/sdk/android/api_reference_overview.html',
      ),
    ).toBeUndefined();
  });

  it('does not create a destination for unrelated pages', () => {
    expect(
      resolveZhCnApiReferenceProductDocsHref('/zh-CN/realtime-media/rtc'),
    ).toBeUndefined();
  });
});
