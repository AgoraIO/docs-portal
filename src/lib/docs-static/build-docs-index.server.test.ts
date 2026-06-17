import { describe, expect, it } from 'vitest';
import {
  buildDocsIndex,
  parseDocsMetaJson,
} from './build-docs-index.server';

describe('buildDocsIndex', () => {
  it('builds ordinary docs pages with route lookup, markdown url, and locale grouping', () => {
    const index = buildDocsIndex();
    const page = index.pagesByRoutePath.get('/en/ai/custom-llm');

    expect(index.pages.length).toBeGreaterThan(0);
    expect(page).toMatchObject({
      contentPath: 'en/ai/custom-llm.mdx',
      locale: 'en',
      markdownUrl: '/content/docs/en/ai/custom-llm.md',
      routePath: '/en/ai/custom-llm',
      slugSegments: ['custom-llm'],
      sourceSlugs: ['ai', 'custom-llm'],
      tab: 'ai',
    });
    expect(index.pagesByLocale.en.length).toBeGreaterThan(0);
    expect(index.pagesByLocale['zh-CN'].length).toBeGreaterThan(0);
  });

  it('loads meta.json data for nav-scope folders', () => {
    const index = buildDocsIndex();
    const node = index.nodesByKey.get('en/realtime-media/rtc');

    expect(node).toMatchObject({
      key: 'en/realtime-media/rtc',
      locale: 'en',
      name: 'rtc',
      type: 'folder',
    });
    expect(node?.meta?.navScope).toMatchObject({
      defaultVersion: 'android',
      platformTabs: true,
      sharedSidebar: true,
    });
  });

  it('includes api-reference pages in the ordinary docs index for static docs payloads', () => {
    const index = buildDocsIndex();

    expect(index.pagesByRoutePath.has('/en/api-reference')).toBe(true);
    expect(
      index.pages.some((page) => page.contentPath.startsWith('en/api-reference/')),
    ).toBe(true);
  });

  it('parses the subset of meta.json fields used by the docs index without Fumadocs runtime helpers', () => {
    expect(
      parseDocsMetaJson(
        JSON.stringify({
          icon: 'book',
          navScope: {
            defaultVersion: 'android',
            platformTabs: true,
            sharedSidebar: true,
            versions: [{ id: 'android', label: 'Android', path: 'android' }],
          },
          pages: ['index', 'android'],
          root: true,
          title: 'RTC',
        }),
      ),
    ).toEqual({
      icon: 'book',
      navScope: {
        defaultVersion: 'android',
        platformTabs: true,
        sharedSidebar: true,
        versions: [{ id: 'android', label: 'Android', path: 'android' }],
      },
      pages: ['index', 'android'],
      root: true,
      title: 'RTC',
    });
  });

  it('rejects invalid navScope version entries in meta.json', () => {
    expect(() =>
      parseDocsMetaJson(
        JSON.stringify({
          navScope: {
            versions: [{ id: 'android', label: 'Android' }],
          },
          title: 'RTC',
        }),
      ),
    ).toThrow(/navScope/i);
  });
});
