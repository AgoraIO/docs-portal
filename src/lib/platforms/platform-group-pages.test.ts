import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import {
  extendPlatformGroupPanelSearchNavigation,
  filterPlatformGroupPanelNodes,
  getCanonicalSourcePages,
  getPlatformGroupPanelUrls,
  type PlatformGroupSourcePage,
  resolvePlatformGroupDefinition,
  resolvePlatformGroupParentPage,
} from './platform-group-pages';

describe('platform group pages', () => {
  it('gives hidden panel routes the parent search breadcrumbs', () => {
    const pages = createPlatformGroupPages();
    const parentUrl = pages[0].url;
    const navigation = extendPlatformGroupPanelSearchNavigation(
      new Map([[parentUrl, ['RTC', 'Video Calling', 'Reference']]]),
      pages,
    );

    expect(navigation.get(`${parentUrl}/ios`)).toEqual([
      'RTC',
      'Video Calling',
      'Reference',
      'Split platform page',
    ]);
  });

  it('makes a platform group searchable when its parent is outside navigation', () => {
    const pages = createPlatformGroupPages();
    const navigation = extendPlatformGroupPanelSearchNavigation(
      new Map<string, string[]>(),
      pages,
    );

    expect(navigation.get(pages[0].url)).toEqual([]);
    expect(navigation.get(pages[1].url)).toEqual(['Split platform page']);
  });
  it('resolves platform panels from a platform-group index page', () => {
    const pages = createPlatformGroupPages();
    const definition = resolvePlatformGroupDefinition(pages[0], pages);

    expect(definition).toEqual({
      canonicalPlatform: 'ios',
      panels: [
        {
          contentPath: 'en/ai/get-started/platform-split/ios.mdx',
          platform: 'ios',
        },
        {
          contentPath: 'en/ai/get-started/platform-split/android.mdx',
          platform: 'android',
        },
      ],
      platforms: ['ios', 'android'],
    });
  });

  it('falls back to a canonical platform that has a panel file', () => {
    const pages = createPlatformGroupPages();
    pages[0].data.defaultPlatform = 'web';

    expect(resolvePlatformGroupDefinition(pages[0], pages)).toMatchObject({
      canonicalPlatform: 'android',
    });
  });

  it('filters platform child files from canonical page lists', () => {
    const pages = createPlatformGroupPages();

    expect(getCanonicalSourcePages(pages).map((page) => page.url)).toEqual([
      '/en/ai/get-started/platform-split',
      '/en/ai/get-started/ordinary',
    ]);
    expect(resolvePlatformGroupParentPage(pages[1], pages)?.url).toBe(
      '/en/ai/get-started/platform-split',
    );
    expect(getPlatformGroupPanelUrls(pages)).toEqual(
      new Set([
        '/en/ai/get-started/platform-split/ios',
        '/en/ai/get-started/platform-split/android',
      ]),
    );
  });

  it('removes platform child nodes from page trees', () => {
    const root: Root = {
      children: [
        {
          children: [
            {
              children: [
                {
                  name: 'Split',
                  type: 'page',
                  url: '/en/ai/get-started/platform-split',
                },
                {
                  name: 'iOS',
                  type: 'page',
                  url: '/en/ai/get-started/platform-split/ios',
                },
              ],
              name: 'Get started',
              type: 'folder',
            },
          ],
          name: 'AI',
          type: 'folder',
        },
      ],
      name: 'Docs',
    };

    expect(
      filterPlatformGroupPanelNodes(
        root,
        new Set(['/en/ai/get-started/platform-split/ios']),
      ),
    ).toEqual({
      children: [
        {
          children: [
            {
              children: [
                {
                  name: 'Split',
                  type: 'page',
                  url: '/en/ai/get-started/platform-split',
                },
              ],
              index: undefined,
              name: 'Get started',
              type: 'folder',
            },
          ],
          index: undefined,
          name: 'AI',
          type: 'folder',
        },
      ],
      name: 'Docs',
    });
  });
});

function createPlatformGroupPages(): PlatformGroupSourcePage[] {
  return [
    {
      data: {
        defaultPlatform: 'ios',
        layout: 'platform-group',
        platforms: ['ios', 'android', 'web'],
        title: 'Split platform page',
      },
      path: 'en/ai/get-started/platform-split/index.mdx',
      slugs: ['en', 'ai', 'get-started', 'platform-split'],
      url: '/en/ai/get-started/platform-split',
    },
    {
      data: {},
      path: 'en/ai/get-started/platform-split/ios.mdx',
      slugs: ['en', 'ai', 'get-started', 'platform-split', 'ios'],
      url: '/en/ai/get-started/platform-split/ios',
    },
    {
      data: {},
      path: 'en/ai/get-started/platform-split/android.mdx',
      slugs: ['en', 'ai', 'get-started', 'platform-split', 'android'],
      url: '/en/ai/get-started/platform-split/android',
    },
    {
      data: {},
      path: 'en/ai/get-started/ordinary.mdx',
      slugs: ['en', 'ai', 'get-started', 'ordinary'],
      url: '/en/ai/get-started/ordinary',
    },
  ];
}
