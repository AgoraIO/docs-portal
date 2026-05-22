import type { Root } from 'fumadocs-core/page-tree';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDocsPagePayload, loadDocsTabIndex } from './docs-page.server';
import { loadOpenApiEndpointPage } from './openapi/docs-page.server';
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

vi.mock('./openapi/docs-page.server', () => ({
  loadOpenApiEndpointPage: vi.fn(),
}));

const mockedGetPage = vi.mocked(source.getPage);
const mockedGetPages = vi.mocked(source.getPages);
const mockedGetPageTree = vi.mocked(source.getPageTree);
const mockedLoadOpenApiEndpointPage = vi.mocked(loadOpenApiEndpointPage);

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
              $id: 'ai-quickstart',
              name: 'Quickstart',
              type: 'page',
              url: '/en/ai/get-started/quickstart',
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

const apiReferencePageTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'api-reference-folder',
          children: [
            {
              $id: 'api-reference-conversational-ai-folder',
              children: [
                {
                  $id: 'api-reference-conversational-ai-rest-api-folder',
                  children: [
                    {
                      $id: 'api-reference-conversational-ai-rest-api-authentication',
                      name: 'Authentication',
                      type: 'page',
                      url: '/en/api-reference/conversational-ai/rest-api/authentication',
                    },
                    {
                      $id: 'api-reference-conversational-ai-rest-api-agent-folder',
                      children: [],
                      index: {
                        $id: 'api-reference-conversational-ai-rest-api-agent-index',
                        name: 'Agent management',
                        type: 'page',
                        url: '/en/api-reference/conversational-ai/rest-api/agent',
                      },
                      name: 'Agent management',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'api-reference-conversational-ai-rest-api-index',
                    name: 'REST API',
                    type: 'page',
                    url: '/en/api-reference/conversational-ai/rest-api',
                  },
                  name: 'REST API',
                  type: 'folder',
                },
                {
                  $id: 'api-reference-conversational-ai-server-sdk-folder',
                  children: [],
                  index: {
                    $id: 'api-reference-conversational-ai-server-sdk-index',
                    name: 'Server SDK',
                    type: 'page',
                    url: '/en/api-reference/conversational-ai/server-sdk',
                  },
                  name: 'Server SDK',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'api-reference-conversational-ai-index',
                name: 'Conversational AI',
                type: 'page',
                url: '/en/api-reference/conversational-ai',
              },
              name: 'Conversational AI',
              type: 'folder',
            },
          ],
          index: {
            $id: 'api-reference-index',
            name: 'API Reference',
            type: 'page',
            url: '/en/api-reference',
          },
          name: 'API Reference',
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
    type: undefined,
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

    mockedLoadOpenApiEndpointPage.mockResolvedValue(null);
    mockedGetPage.mockImplementation((_slugs, locale) =>
      locale === 'zh-CN' ? undefined : page,
    );
    mockedGetPages.mockReturnValue([page]);
    mockedGetPageTree.mockReturnValue(pageTree);
  });

  it('falls back to generating TOC from processed markdown', async () => {
    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora']),
    ).resolves.toMatchObject({
      activePath: '/en/introduction/about-agora',
      activeTab: 'introduction',
      body: {
        contentPath: 'en/introduction/about-agora.md',
        kind: 'mdx',
      },
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
      localeLinks: [
        {
          href: '/en/introduction/about-agora',
          isActive: true,
          locale: 'en',
        },
        {
          href: '/zh-CN/introduction/about-agora',
          isActive: false,
          locale: 'zh-CN',
        },
      ],
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

  it('returns OpenAPI content inside the existing docs shell payload when no MDX page exists', async () => {
    mockedGetPage.mockReturnValue(undefined);
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);
    mockedLoadOpenApiEndpointPage.mockResolvedValue({
      activePath: '/en/api-reference/conversational-ai/rest-api/agent/join',
      body: {
        kind: 'openapi',
        operationPayload: {
          operation: {
            method: 'POST',
            operationId: 'start-agent',
            parameters: [],
            path: '/v2/projects/{appid}/join',
            responses: {},
            servers: [],
          },
          publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
          requestSchemaTree: [],
          responseSchemaTrees: {},
        },
      },
      contentPath: 'en/api-reference/conversational-ai/rest-api/agent/join.md',
      description: undefined,
      markdownUrl:
        '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md',
      operationId: 'start-agent',
      slug: 'join',
      title: 'Start a conversational AI agent',
      toc: [],
    });

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'conversational-ai',
      'rest-api',
      'agent',
      'join',
    ]);

    expect(payload).toMatchObject({
      activePath: '/en/api-reference/conversational-ai/rest-api/agent/join',
      activeTab: 'api-reference',
      body: {
        kind: 'openapi',
      },
      localeLinks: [
        {
          href: '/en/api-reference/conversational-ai/rest-api/agent/join',
          isActive: true,
          locale: 'en',
        },
        {
          href: '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
          isActive: false,
          locale: 'zh-CN',
        },
      ],
      pages: expect.arrayContaining([
        expect.objectContaining({
          title: 'About Agora',
          url: '/en/introduction/about-agora',
        }),
        expect.objectContaining({
          title: 'Start a conversational AI agent',
          url: '/en/api-reference/conversational-ai/rest-api/agent/join',
        }),
      ]),
      tabs: [
        {
          id: 'api-reference',
          title: 'API Reference',
          url: '/en/api-reference',
        },
      ],
      title: 'Start a conversational AI agent',
    });

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected an OpenAPI docs page payload');
    }

    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference',
        '/en/api-reference/conversational-ai/rest-api/authentication',
        '/en/api-reference/conversational-ai/server-sdk',
        '/en/api-reference/conversational-ai/rest-api/agent',
        '/en/api-reference/conversational-ai/rest-api/agent/join',
      ]),
    );
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

  it('falls back locale links to the target tab entry when the same slug is missing', async () => {
    const page = createPage();
    const zhPageTree: Root = {
      children: [
        {
          $id: 'zh-root',
          children: [
            {
              $id: 'zh-ai-folder',
              children: [
                {
                  $id: 'zh-ai-quickstart',
                  name: '快速开始',
                  type: 'page',
                  url: '/zh-CN/ai/quick-start',
                },
              ],
              name: 'AI',
              root: true,
              type: 'folder',
            },
          ],
          name: 'Chinese',
          type: 'folder',
        },
      ],
      name: 'Docs',
    };

    mockedGetPage.mockImplementation((_slugs, locale) => {
      if (locale === 'zh-CN') {
        return undefined;
      }

      return {
        ...page,
        path: 'en/ai/get-started/quickstart.md',
        slugs: ['en', 'ai', 'get-started', 'quickstart'],
        url: '/en/ai/get-started/quickstart',
      };
    });
    mockedGetPageTree.mockImplementation((locale) =>
      locale === 'zh-CN' ? zhPageTree : pageTree,
    );

    await expect(
      loadDocsPagePayload('en', 'ai', ['get-started', 'quickstart']),
    ).resolves.toMatchObject({
      localeLinks: [
        {
          href: '/en/ai/get-started/quickstart',
          isActive: true,
          locale: 'en',
        },
        {
          href: '/zh-CN/ai/quick-start',
          isActive: false,
          locale: 'zh-CN',
        },
      ],
    });
  });
});

function flattenSidebarPageUrls(
  nodes: Exclude<
    Awaited<ReturnType<typeof loadDocsPagePayload>>,
    null | { redirectUrl: string }
  >['sidebar'],
): string[] {
  return nodes.flatMap((node) =>
    node.type === 'page'
      ? [node.url]
      : flattenSidebarPageUrls(node.children),
  );
}
