import type { Root } from 'fumadocs-core/page-tree';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDocsPagePayload, loadDocsTabIndex } from './docs-page.server';
import { source } from './source.server';

vi.mock('./source.server', () => ({
  getPageMarkdownUrl: (page: { path: string }) => ({
    segments: page.path.split('/').filter(Boolean),
    url: `/llms.mdx/docs/${page.path}`,
  }),
  source: {
    getPage: vi.fn(),
    getPages: vi.fn(),
    getPageTree: vi.fn(),
  },
}));

const mockedGetPage = vi.mocked(source.getPage);
const mockedGetPages = vi.mocked(source.getPages);
const mockedGetPageTree = vi.mocked(source.getPageTree);

const pageTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'introduction-folder',
          children: [
            {
              $id: 'introduction-get-started',
              icon: 'BookOpen',
              name: 'Get started',
              type: 'separator',
            },
            {
              $id: 'introduction-about-agora',
              name: 'About Agora',
              type: 'page',
              url: '/en/introduction/about-agora',
            },
          ],
          name: 'Introduction',
          root: true,
          type: 'folder',
        },
        {
          $id: 'ai-folder',
          children: [
            {
              $id: 'ai-quick-start',
              name: 'Quick Start',
              type: 'page',
              url: '/en/ai/quick-start',
            },
          ],
          index: {
            $id: 'ai-index',
            name: 'AI',
            type: 'page',
            url: '/en/ai',
          },
          name: 'AI',
          root: true,
          type: 'folder',
        },
      ],
      name: 'English',
      type: 'folder',
    },
  ],
  name: 'Docs',
};

function createPage() {
  return {
    data: {
      _exports: {},
      body: vi.fn(),
      description:
        'Build a working mental model of Agora by understanding what it is.',
      getMDAST: vi.fn(async () => ({
        children: [],
        type: 'root' as const,
      })),
      getText: vi.fn(
        async () => `## What is

Agora overview.

## Why

Why teams use it.`,
      ),
      info: {
        fullPath: '/virtual/content/docs/en/introduction/about-agora.md',
        path: 'en/introduction/about-agora.md',
      },
      structuredData: {
        headings: [],
        contents: [],
      },
      title: 'About Agora',
      toc: [],
    },
    path: 'en/introduction/about-agora.md',
    slugs: ['en', 'introduction', 'about-agora'],
    url: '/en/introduction/about-agora',
  };
}

describe('loadDocsTabIndex', () => {
  beforeEach(() => {
    mockedGetPageTree.mockReturnValue(pageTree);
  });

  it('uses the real tab index page when the tab has index content', async () => {
    await expect(loadDocsTabIndex('en', 'ai')).resolves.toMatchObject({
      locale: 'en',
      tab: 'ai',
      url: '/en/ai',
    });
  });

  it('falls back to the first real page when the tab has no index content', async () => {
    await expect(loadDocsTabIndex('en', 'introduction')).resolves.toMatchObject(
      {
        locale: 'en',
        tab: 'introduction',
        url: '/en/introduction/about-agora',
      },
    );
  });
});

describe('loadDocsPagePayload', () => {
  beforeEach(() => {
    const page = createPage();

    mockedGetPage.mockReturnValue(page);
    mockedGetPages.mockReturnValue([page]);
    mockedGetPageTree.mockReturnValue(pageTree);
  });

  it('falls back to generating TOC from processed markdown', async () => {
    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora']),
    ).resolves.toMatchObject({
      activePath: '/en/introduction/about-agora',
      activeTab: 'introduction',
      breadcrumb: [
        {
          title: 'Get started',
        },
        {
          title: 'About Agora',
          url: '/en/introduction/about-agora',
        },
      ],
      contentPath: 'en/introduction/about-agora.md',
      markdownUrl: '/llms.mdx/docs/en/introduction/about-agora.md',
      slug: 'about-agora',
      title: 'About Agora',
      toc: [
        {
          depth: 2,
          title: 'What is',
          url: '#what-is',
        },
        {
          depth: 2,
          title: 'Why',
          url: '#why',
        },
      ],
    });
  });

  it('loads nested product pages from multi-segment slugs', async () => {
    const basePage = createPage();
    const nestedPage = {
      ...basePage,
      data: {
        ...basePage.data,
        info: {
          fullPath:
            '/virtual/content/docs/en/realtime-media/rtc/quick-start.md',
          path: 'en/realtime-media/rtc/quick-start.md',
        },
        title: 'RTC Quick Start',
      },
      path: 'en/realtime-media/rtc/quick-start.md',
      slugs: ['en', 'realtime-media', 'rtc', 'quick-start'],
      url: '/en/realtime-media/rtc/quick-start',
    };

    mockedGetPage.mockReturnValue(nestedPage as ReturnType<typeof createPage>);
    mockedGetPages.mockReturnValue([
      nestedPage as ReturnType<typeof createPage>,
    ]);

    await expect(
      loadDocsPagePayload('en', 'realtime-media', ['rtc', 'quick-start']),
    ).resolves.toMatchObject({
      activePath: '/en/realtime-media/rtc/quick-start',
      activeTab: 'realtime-media',
      contentPath: 'en/realtime-media/rtc/quick-start.md',
      slug: 'quick-start',
      title: 'RTC Quick Start',
    });
  });
});
