import { describe, expect, it } from 'vitest';
import { createPublishedDocsRoutes } from './published-docs-routes';

describe('published docs routes', () => {
  it('expands platform views while preserving the parent canonical path', () => {
    expect(
      createPublishedDocsRoutes({
        canonicalPaths: [
          '/en/api-reference/api-ref/uikit-sdk',
          '/en/introduction',
        ],
        platformPages: [
          {
            platforms: ['android', 'ios', 'web'],
            url: '/en/api-reference/api-ref/uikit-sdk',
          },
        ],
      }),
    ).toEqual([
      {
        canonicalPath: '/en/api-reference/api-ref/uikit-sdk',
        markdownPath: '/en/api-reference/api-ref/uikit-sdk.md',
        url: '/en/api-reference/api-ref/uikit-sdk',
      },
      {
        canonicalPath: '/en/api-reference/api-ref/uikit-sdk',
        markdownPath: '/en/api-reference/api-ref/uikit-sdk/android.md',
        platform: 'android',
        url: '/en/api-reference/api-ref/uikit-sdk/android',
      },
      {
        canonicalPath: '/en/api-reference/api-ref/uikit-sdk',
        markdownPath: '/en/api-reference/api-ref/uikit-sdk/ios.md',
        platform: 'ios',
        url: '/en/api-reference/api-ref/uikit-sdk/ios',
      },
      {
        canonicalPath: '/en/api-reference/api-ref/uikit-sdk',
        markdownPath: '/en/api-reference/api-ref/uikit-sdk/web.md',
        platform: 'web',
        url: '/en/api-reference/api-ref/uikit-sdk/web',
      },
      {
        canonicalPath: '/en/introduction',
        markdownPath: '/en/introduction.md',
        url: '/en/introduction',
      },
    ]);
  });
});
