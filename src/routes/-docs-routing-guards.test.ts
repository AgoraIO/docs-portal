import { isNotFound, isRedirect } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import type { DocsPagePayload } from '@/lib/docs-page.server';

vi.mock('@/lib/docs-page', () => ({
  getDocsPagePayload: async ({
    data,
  }: {
    data: { locale: string; slugSegments: string[]; tab: string };
  }) => {
    const { loadDocsPagePayload } = await import('@/lib/docs-page.server');

    return loadDocsPagePayload(data.locale, data.tab, data.slugSegments);
  },
  getDocsTabIndex: async ({
    data,
  }: {
    data: { locale: string; tab: string };
  }) => {
    const { loadDocsTabIndex } = await import('@/lib/docs-page.server');

    return loadDocsTabIndex(data.locale, data.tab);
  },
}));

import {
  Route as DocPageRoute,
  getKnownPlatformSearchParam,
  payloadSupportsPlatform,
} from './$locale/$tab/$';
import { Route as TabIndexRoute } from './$locale/$tab/index';
import { Route as LocaleIndexRoute } from './$locale/index';
import { Route as LegacyDocRoute } from './doc/$';
import { Route as LlmsTextRoute } from './llms[.]txt';

function getLoader(route: { options: { loader?: unknown } }) {
  return route.options.loader as (context: never) => Promise<unknown> | unknown;
}

function getGetHandler(route: { options: { server?: unknown } }) {
  return (
    route.options.server as {
      handlers: {
        GET: (context: never) => Promise<unknown> | unknown;
      };
    }
  ).handlers.GET;
}

function createPlatformPayload(platforms: string): DocsPagePayload {
  return {
    activePath: '/en/realtime-media/rtm/build/presence',
    activeTab: 'realtime-media',
    body: {
      contentPath: 'en/realtime-media/rtm/build/presence.mdx',
      kind: 'mdx',
      platformTabs: {
        canonicalPlatform: 'web',
        defaultPlatform: 'web',
        initialPlatform: undefined,
        platforms,
      },
    },
    breadcrumb: [],
    contentPath: 'en/realtime-media/rtm/build/presence.mdx',
    description: undefined,
    hideToc: false,
    layoutMode: 'docs',
    localeLinks: [],
    markdownUrl: '/en/realtime-media/rtm/build/presence.md',
    navigation: {},
    productScopes: [],
    sidebar: [],
    sidebarHeader: {
      backHref: '/en/realtime-media/overview',
      backLabel: 'RTC',
      title: 'Signaling',
    },
    slug: 'presence',
    tabs: [],
    title: 'Presence',
    toc: [],
  };
}

describe('docs route locale guards', () => {
  it('rejects unsupported locale on the locale index route', async () => {
    try {
      await getLoader(LocaleIndexRoute)({
        params: {
          locale: 'docs',
        },
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected loader to reject with notFound');
  });

  it('rejects unsupported locale on the tab index route before content lookup', async () => {
    try {
      await getLoader(TabIndexRoute)({
        params: {
          locale: 'doc',
          tab: 'introduction',
        },
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected loader to reject with notFound');
  });

  it('rejects unsupported locale on the page route before page lookup', async () => {
    try {
      await getLoader(DocPageRoute)({
        params: {
          _splat: 'index',
          locale: 'docs',
          tab: 'introduction',
        },
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected loader to reject with notFound');
  });

  it('redirects supported locale index routes into the introduction tab', async () => {
    try {
      await getLoader(LocaleIndexRoute)({
        params: {
          locale: 'en',
        },
      } as never);
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          href: '/en/introduction',
          statusCode: 307,
        },
        status: 307,
      });
      return;
    }

    throw new Error('expected loader to reject with redirect');
  });

  it('redirects legacy root docs links to the public docs host', async () => {
    try {
      await getLoader(LegacyDocRoute)({
        params: {
          _splat: 'console/general/quickstart',
        },
      } as never);
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          href: 'https://doc.shengwang.cn/doc/console/general/quickstart',
          statusCode: 308,
        },
        status: 308,
      });
      return;
    }

    throw new Error('expected loader to reject with redirect');
  });

  it('recognizes legacy query-string platform values for docs pages', () => {
    expect(getKnownPlatformSearchParam('?platform=macos')).toBe('macos');
    expect(getKnownPlatformSearchParam('?foo=bar&platform=react-native')).toBe(
      'react-native',
    );
    expect(getKnownPlatformSearchParam('?platform=react-js')).toBe(
      'javascript',
    );
    expect(getKnownPlatformSearchParam('?platform=all')).toBeUndefined();
  });

  it('checks whether a docs payload supports a requested platform', () => {
    expect(
      payloadSupportsPlatform(
        createPlatformPayload('["web","macos"]'),
        'macos',
      ),
    ).toBe(true);

    expect(
      payloadSupportsPlatform(
        createPlatformPayload('["web","macos"]'),
        'android',
      ),
    ).toBe(false);
  });

  for (const platform of ['android', 'ios'] as const) {
    it(`loads /en/api-reference/api-ref/uikit-sdk/${platform} without redirect and selects ${platform}`, async () => {
      const payload = await getLoader(DocPageRoute)({
        location: {
          hash: '',
          searchStr: '',
        },
        params: {
          _splat: `api-ref/uikit-sdk/${platform}`,
          locale: 'en',
          tab: 'api-reference',
        },
      } as never);

      expect(payload).toMatchObject({
        body: {
          kind: 'mdx',
          platformTabs: {
            initialPlatform: platform,
          },
        },
        markdownUrl: `/en/api-reference/api-ref/uikit-sdk/${platform}.md`,
      });
    });
  }

  it('serves direct .md docs page URLs as markdown', async () => {
    const response = (await getGetHandler(DocPageRoute)({
      context: {},
      next: vi.fn(() => {
        throw new Error('expected .md request to be handled directly');
      }),
      params: {
        _splat: 'build/shape-the-conversation/filler-words.md',
        locale: 'en',
        tab: 'ai',
      },
      pathname: '/en/ai/build/shape-the-conversation/filler-words.md',
      request: new Request(
        'https://docs.example.com/en/ai/build/shape-the-conversation/filler-words.md',
      ),
    } as never)) as Response;

    await expect(response.text()).resolves.toContain(
      '# Talking while waiting (/en/ai/build/shape-the-conversation/filler-words)',
    );
    expect(response.headers.get('Content-Type')).toBe('text/markdown');
  }, 15_000);

  it('does not serve zh-CN direct .md docs page URLs', async () => {
    try {
      await getGetHandler(DocPageRoute)({
        context: {},
        next: vi.fn(() => {
          throw new Error('expected zh-CN .md request to be rejected');
        }),
        params: {
          _splat: 'build/shape-the-conversation/filler-words.md',
          locale: 'zh-CN',
          tab: 'ai',
        },
        pathname: '/zh-CN/ai/build/shape-the-conversation/filler-words.md',
        request: new Request(
          'https://docs.example.com/zh-CN/ai/build/shape-the-conversation/filler-words.md',
        ),
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected zh-CN .md request to reject with notFound');
  });

  it('serves direct platform .md docs page URLs as markdown', async () => {
    const response = (await getGetHandler(DocPageRoute)({
      context: {},
      next: vi.fn(() => {
        throw new Error('expected platform .md request to be handled directly');
      }),
      params: {
        _splat: 'api-ref/uikit-sdk/android.md',
        locale: 'en',
        tab: 'api-reference',
      },
      pathname: '/en/api-reference/api-ref/uikit-sdk/android.md',
      request: new Request(
        'https://docs.example.com/en/api-reference/api-ref/uikit-sdk/android.md',
      ),
    } as never)) as Response;
    const markdown = await response.text();

    expect(response.headers.get('Content-Type')).toBe('text/markdown');
    expect(markdown).toContain(
      '# Fastboard API (/en/api-reference/api-ref/uikit-sdk/android)',
    );
    expect(markdown).toContain('## FastboardView class');
    expect(markdown).not.toContain('## createFastboard');
  });

  it('does not serve zh-CN direct platform .md docs page URLs', async () => {
    try {
      await getGetHandler(DocPageRoute)({
        context: {},
        next: vi.fn(() => {
          throw new Error('expected zh-CN platform .md request to be rejected');
        }),
        params: {
          _splat: 'api-ref/uikit-sdk/android.md',
          locale: 'zh-CN',
          tab: 'api-reference',
        },
        pathname: '/zh-CN/api-reference/api-ref/uikit-sdk/android.md',
        request: new Request(
          'https://docs.example.com/zh-CN/api-reference/api-ref/uikit-sdk/android.md',
        ),
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected zh-CN platform .md request to reject');
  });

  it('keeps llms index feed English-only', async () => {
    const indexResponse = (await getGetHandler(LlmsTextRoute)({
      params: {},
    } as never)) as Response;

    const indexText = await indexResponse.text();

    expect(indexText).toContain('/en/');
    expect(indexText).not.toContain('/zh-CN/');
  }, 15_000);
});
