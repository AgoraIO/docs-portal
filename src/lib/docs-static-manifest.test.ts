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
          markdownUrl: '/llms.mdx/docs/en/introduction/about-agora.md',
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
      markdownUrl: '/llms.mdx/docs/en/introduction/about-agora/android.md',
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
            markdownUrl: '/llms.mdx/docs/en/introduction/about-agora.md',
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
});
