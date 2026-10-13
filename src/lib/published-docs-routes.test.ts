import { describe, expect, it } from 'vitest';
import {
  createPublishedDocsRoutes,
  createStaticDocsRouteSets,
} from './published-docs-routes';

describe('published docs routes', () => {
  it('carries the rendered document default platform into every published variant', () => {
    const url = '/zh-CN/realtime-media/rtc/build/token-authentication';
    const sets = createStaticDocsRouteSets({
      canonicalPaths: [url],
      canonicalPayloads: new Map([
        [
          url,
          {
            body: {
              platformTabs: {
                canonicalPlatform: 'web',
                defaultPlatform: 'ios',
              },
            },
          },
        ],
      ]),
      platformPages: [{ url, platforms: ['android', 'ios', 'web'] }],
    });
    expect(sets.machineReadableRoutes).toHaveLength(4);
    expect(
      sets.machineReadableRoutes.map((route) => route.defaultPlatform),
    ).toEqual(['ios', 'ios', 'ios', 'ios']);
  });
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

  it('keeps redirects prerendered but excludes them from machine-readable routes', () => {
    const routeSets = createStaticDocsRouteSets({
      canonicalPaths: [
        '/en/realtime-media/rtm/reference/rest-api',
        '/en/api-reference/api-ref/signaling',
      ],
      canonicalPayloads: new Map([
        ['/en/api-reference/api-ref/signaling', { title: 'Signaling' }],
      ]),
      platformPages: [],
    });

    expect(routeSets.prerenderRoutes).toContainEqual({
      canonicalPath: '/en/realtime-media/rtm/reference/rest-api',
      markdownPath: '/en/realtime-media/rtm/reference/rest-api.md',
      url: '/en/realtime-media/rtm/reference/rest-api',
    });
    expect(routeSets.machineReadableRoutes).toEqual([
      {
        canonicalPath: '/en/api-reference/api-ref/signaling',
        markdownPath: '/en/api-reference/api-ref/signaling.md',
        url: '/en/api-reference/api-ref/signaling',
      },
    ]);
  });
});
