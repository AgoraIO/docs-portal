import { describe, expect, it, vi } from 'vitest';
import {
  getStaticDocsPayloadPath,
  readStaticDocsPayload,
  resolvePlatformStaticDocsPayload,
} from './docs-static-manifest';

describe('docs-static-manifest', () => {
  it('builds index payload paths for tab roots', () => {
    expect(
      getStaticDocsPayloadPath({
        locale: 'en',
        slugSegments: [],
        tab: 'ai',
      }),
    ).toBe('/__static/docs/en/ai/index.json');
  });

  it('builds nested payload paths for docs pages', () => {
    expect(
      getStaticDocsPayloadPath({
        locale: 'zh-CN',
        slugSegments: ['device-kit', 'start-here', 'quickstart'],
        tab: 'ai',
      }),
    ).toBe('/__static/docs/zh-CN/ai/device-kit/start-here/quickstart.json');
  });

  it('canonicalizes legacy English solutions root payload paths', () => {
    expect(
      getStaticDocsPayloadPath({
        locale: 'en',
        slugSegments: [],
        tab: 'solutions',
      }),
    ).toBe('/__static/docs/en/realtime-media/overview.json');
  });

  it('canonicalizes legacy English solutions product payload paths', () => {
    expect(
      getStaticDocsPayloadPath({
        locale: 'en',
        slugSegments: ['flexible-classroom', 'quickstart'],
        tab: 'solutions',
      }),
    ).toBe('/__static/docs/en/realtime-media/flexible-classroom/quickstart.json');
  });

  it('keeps non-English and unknown legacy solutions payload paths unchanged', () => {
    expect(
      getStaticDocsPayloadPath({
        locale: 'zh-CN',
        slugSegments: ['flexible-classroom'],
        tab: 'solutions',
      }),
    ).toBe('/__static/docs/zh-CN/solutions/flexible-classroom.json');

    expect(
      getStaticDocsPayloadPath({
        locale: 'en',
        slugSegments: ['unknown-product'],
        tab: 'solutions',
      }),
    ).toBe('/__static/docs/en/solutions/unknown-product.json');
  });

  it('returns null for missing static payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    );

    await expect(
      readStaticDocsPayload({
        locale: 'en',
        slugSegments: ['missing'],
        tab: 'introduction',
      }),
    ).resolves.toBeNull();
  });

  it('reads payload json when static payload exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ title: 'Quickstart' }),
        ok: true,
        status: 200,
        statusText: 'OK',
      }),
    );

    await expect(
      readStaticDocsPayload<{ title: string }>({
        locale: 'en',
        slugSegments: ['get-started', 'quickstart'],
        tab: 'ai',
      }),
    ).resolves.toEqual({ title: 'Quickstart' });
  });

  it('throws for unexpected fetch failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }),
    );

    await expect(
      readStaticDocsPayload({
        locale: 'en',
        slugSegments: ['get-started', 'quickstart'],
        tab: 'ai',
      }),
    ).rejects.toThrow('Failed to load static docs payload');
  });

  it('resolves platform paths from the canonical static payload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })
      .mockResolvedValueOnce({
        json: async () => ({
          body: {
            kind: 'mdx',
            platformTabs: {
              canonicalPlatform: 'web',
              platforms: '["web","android"]',
            },
          },
          markdownUrl: '/en/introduction/about-agora.md',
        }),
        ok: true,
        status: 200,
        statusText: 'OK',
      });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      resolvePlatformStaticDocsPayload({
        locale: 'en',
        slugSegments: ['about-agora', 'android'],
        tab: 'introduction',
      }),
    ).resolves.toMatchObject({
      body: {
        platformTabs: {
          initialPlatform: 'android',
        },
      },
      markdownUrl: '/en/introduction/about-agora/android.md',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/__static/docs/en/introduction/about-agora/android.json',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/__static/docs/en/introduction/about-agora.json',
    );
  });

  it('replaces default-platform static fields and clears stale TOC for platform fallbacks', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
        .mockResolvedValueOnce({
          json: async () => ({
            body: {
              kind: 'mdx',
              platformTabs: {
                canonicalPlatform: 'web',
                defaultPlatform: 'android',
                platforms: '["android","web"]',
              },
            },
            markdownUrl: '/en/introduction/about-agora/android.md',
            toc: [
              {
                depth: 2,
                title: 'Install Android SDK',
                url: '#install-android-sdk',
              },
            ],
          }),
          ok: true,
          status: 200,
          statusText: 'OK',
        }),
    );

    await expect(
      resolvePlatformStaticDocsPayload({
        locale: 'en',
        slugSegments: ['about-agora', 'web'],
        tab: 'introduction',
      }),
    ).resolves.toMatchObject({
      body: {
        platformTabs: {
          initialPlatform: 'web',
        },
      },
      markdownUrl: '/en/introduction/about-agora/web.md',
      toc: [],
    });
  });

  it('treats static HTML fallbacks as missing platform payloads', async () => {
    const htmlJsonMock = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'text/html; charset=utf-8',
        }),
        json: htmlJsonMock,
        ok: true,
        status: 200,
        statusText: 'OK',
      })
      .mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          body: {
            kind: 'mdx',
            platformTabs: {
              canonicalPlatform: 'web',
              platforms: '["android","ios","web","electron"]',
            },
          },
          markdownUrl:
            '/llms.mdx/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom.md',
        }),
        ok: true,
        status: 200,
        statusText: 'OK',
      });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      resolvePlatformStaticDocsPayload({
        locale: 'en',
        slugSegments: [
          'flexible-classroom',
          'build',
          'customize-the-ui-and-plugins',
          'customize-classroom',
          'ios',
        ],
        tab: 'solutions',
      }),
    ).resolves.toMatchObject({
      body: {
        platformTabs: {
          initialPlatform: 'ios',
        },
      },
      markdownUrl:
        '/llms.mdx/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom/ios.md',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/__static/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom/ios.json',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/__static/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom.json',
    );
    expect(htmlJsonMock).not.toHaveBeenCalled();
  });

  it('does not render canonical static payloads for unsupported platform paths', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
        .mockResolvedValueOnce({
          json: async () => ({
            body: {
              kind: 'mdx',
              platformTabs: {
                canonicalPlatform: 'web',
                platforms: '["web"]',
              },
            },
            markdownUrl: '/en/introduction/about-agora.md',
          }),
          ok: true,
          status: 200,
          statusText: 'OK',
        }),
    );

    await expect(
      resolvePlatformStaticDocsPayload({
        locale: 'en',
        slugSegments: ['about-agora', 'android'],
        tab: 'introduction',
      }),
    ).resolves.toBeNull();
  });

  it('resolves static platform group panel paths to the selected platform payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
        .mockResolvedValueOnce({
          json: async () => ({
            activePath: '/en/ai/get-started/platform-split',
            body: {
              kind: 'platform-group',
              platformTabs: {
                canonicalPlatform: 'ios',
                platforms: '["ios","android"]',
              },
            },
            markdownUrl: '/en/ai/get-started/platform-split.md',
          }),
          ok: true,
          status: 200,
          statusText: 'OK',
        }),
    );

    await expect(
      resolvePlatformStaticDocsPayload({
        locale: 'en',
        slugSegments: ['get-started', 'platform-split', 'ios'],
        tab: 'ai',
      }),
    ).resolves.toMatchObject({
      activePath: '/en/ai/get-started/platform-split',
      body: {
        platformTabs: {
          initialPlatform: 'ios',
        },
      },
      markdownUrl: '/en/ai/get-started/platform-split/ios.md',
    });
  });
});
