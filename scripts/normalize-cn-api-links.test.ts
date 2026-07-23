import { describe, expect, it } from 'vitest';
import { isApiRelatedMissingInternal } from './normalize-cn-api-links.mjs';

describe('CN API link normalization', () => {
  it('includes missing pages linked from API reference content', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/zh-CN/retired-product',
        sourcePath: 'zh-CN/api-reference/faq/example.mdx',
      }),
    ).toBe(true);
  });

  it('includes missing API targets linked from product documentation', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/api-ref/rtc/android/removed-method',
        sourcePath: 'zh-CN/realtime-media/rtc/example.mdx',
      }),
    ).toBe(true);
  });

  it('includes missing pages linked from Chinese OpenAPI sources', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/zh-CN/retired-guide',
        sourcePath: 'openapi/example/example.zh-CN.yaml',
      }),
    ).toBe(true);
  });

  it('excludes unrelated missing product pages', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/zh-CN/realtime-media/rtc/retired-guide',
        sourcePath: 'zh-CN/realtime-media/rtc/example.mdx',
      }),
    ).toBe(false);
  });
});
