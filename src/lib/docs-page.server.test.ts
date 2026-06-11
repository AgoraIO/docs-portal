import type { Root } from 'fumadocs-core/page-tree';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDocsPagePayload, loadDocsTabIndex } from './docs-page.server';
import { type PageWithSource, source } from './source.server';

vi.mock('./source.server', () => ({
  getPageMarkdownUrl: (page: { path: string }) => ({
    segments: page.path
      .split('/')
      .filter(Boolean)
      .map((segment, index, array) =>
        index === array.length - 1 ? segment.replace(/\.mdx$/, '.md') : segment,
      ),
    url: `/llms.mdx/docs/${page.path.replace(/\.mdx$/, '.md')}`,
  }),
  source: {
    getNodeMeta: vi.fn(),
    getPage: vi.fn(),
    getPages: vi.fn(),
    getPageTree: vi.fn(),
  },
}));

const mockedGetPage = source.getPage as unknown as ReturnType<typeof vi.fn>;
const mockedGetPages = source.getPages as unknown as ReturnType<typeof vi.fn>;
const mockedGetPageTree = source.getPageTree as unknown as ReturnType<
  typeof vi.fn
>;
const mockedGetNodeMeta = source.getNodeMeta as unknown as ReturnType<
  typeof vi.fn
>;

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
              $id: 'ai-choose-your-path-separator',
              name: 'Get started',
              type: 'separator',
            },
            {
              $id: 'ai-device-kit-entry',
              name: 'Deploy to IoT devices',
              type: 'page',
              url: '/en/ai/choose-your-path/quickstart-device-kit',
            },
            {
              $id: 'ai-device-kit-folder',
              children: [
                {
                  $id: 'device-kit-start-here-separator',
                  name: 'Start here',
                  type: 'separator',
                },
                {
                  $id: 'device-kit-start-here-folder',
                  children: [
                    {
                      $id: 'device-kit-quickstart',
                      name: 'Quickstart',
                      type: 'page',
                      url: '/en/ai/device-kit/start-here/quickstart',
                    },
                    {
                      $id: 'device-kit-enable-services',
                      name: 'Enable services',
                      type: 'page',
                      url: '/en/ai/device-kit/reference/enable-services',
                    },
                  ],
                  name: 'Start here',
                  type: 'folder',
                },
                {
                  $id: 'device-kit-build-separator',
                  name: 'Build',
                  type: 'separator',
                },
                {
                  $id: 'device-kit-build-folder',
                  children: [
                    {
                      $id: 'device-kit-build-baseline-separator',
                      name: 'Baseline bring-up',
                      type: 'separator',
                    },
                    {
                      $id: 'device-kit-run-r1-demo',
                      name: 'Run the R1 demo',
                      type: 'page',
                      url: '/en/ai/device-kit/build/run-the-r1-demo',
                    },
                    {
                      $id: 'device-kit-run-demo-server',
                      name: 'Run the demo server',
                      type: 'page',
                      url: '/en/ai/device-kit/build/run-the-demo-server',
                    },
                    {
                      $id: 'device-kit-demo-server-apis',
                      name: 'Demo server APIs',
                      type: 'page',
                      url: '/en/ai/device-kit/build/demo-server-apis',
                    },
                    {
                      $id: 'device-kit-build-device-setup-separator',
                      name: 'Device setup',
                      type: 'separator',
                    },
                    {
                      $id: 'device-kit-configure-network',
                      name: 'Configure device network',
                      type: 'page',
                      url: '/en/ai/device-kit/build/configure-device-network',
                    },
                    {
                      $id: 'device-kit-device-controls',
                      name: 'Device controls',
                      type: 'page',
                      url: '/en/ai/device-kit/build/device-controls',
                    },
                    {
                      $id: 'device-kit-build-firmware-separator',
                      name: 'Firmware integration',
                      type: 'separator',
                    },
                    {
                      $id: 'device-kit-build-flash',
                      name: 'Build and flash firmware',
                      type: 'page',
                      url: '/en/ai/device-kit/build/build-and-flash-firmware',
                    },
                    {
                      $id: 'device-kit-build-architecture-separator',
                      name: 'System architecture',
                      type: 'separator',
                    },
                    {
                      $id: 'device-kit-architecture-overview',
                      name: 'Architecture overview',
                      type: 'page',
                      url: '/en/ai/device-kit/build/architecture-overview',
                    },
                    {
                      $id: 'device-kit-specs',
                      name: 'Specifications and compatibility',
                      type: 'page',
                      url: '/en/ai/device-kit/build/specifications-and-compatibility',
                    },
                  ],
                  name: 'Build',
                  type: 'folder',
                },
                {
                  $id: 'device-kit-plan-rollout-separator',
                  name: 'Plan rollout',
                  type: 'separator',
                },
                {
                  $id: 'device-kit-plan-rollout-folder',
                  children: [
                    {
                      $id: 'device-kit-pricing',
                      name: 'Pricing',
                      type: 'page',
                      url: '/en/ai/device-kit/plan-rollout/pricing',
                    },
                    {
                      $id: 'device-kit-release-notes',
                      name: 'Release notes',
                      type: 'page',
                      url: '/en/ai/device-kit/plan-rollout/release-notes',
                    },
                  ],
                  name: 'Plan rollout',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'device-kit-index',
                name: 'Convo AI Device Kit',
                type: 'page',
                url: '/en/ai/device-kit',
              },
              name: 'Convo AI Device Kit',
              type: 'folder',
            },
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
              $id: 'api-reference-recipes-entry',
              name: 'Recipes',
              type: 'page',
              url: '/en/api-reference/voice-ai-recipes',
            },
            {
              $id: 'api-reference-recipes-folder',
              children: [
                {
                  $id: 'api-reference-recipes-quickstarts-separator',
                  name: 'Quickstarts',
                  type: 'separator',
                },
                {
                  $id: 'api-reference-recipes-python-quickstart',
                  name: 'Python Quickstart',
                  type: 'page',
                  url: '/en/api-reference/recipes/python-quickstart',
                },
                {
                  $id: 'api-reference-recipes-go-quickstart',
                  name: 'Golang Quickstart',
                  type: 'page',
                  url: '/en/api-reference/recipes/golang-quickstart',
                },
                {
                  $id: 'api-reference-recipes-nextjs-quickstart',
                  name: 'NextJS Quickstart',
                  type: 'page',
                  url: '/en/api-reference/recipes/nextjs-quickstart',
                },
                {
                  $id: 'api-reference-recipes-integration-separator',
                  name: 'Integration patterns',
                  type: 'separator',
                },
                {
                  $id: 'api-reference-recipes-custom-llm',
                  name: 'Custom LLM',
                  type: 'page',
                  url: '/en/api-reference/recipes/custom-llm',
                },
                {
                  $id: 'api-reference-recipes-custom-modalities',
                  name: 'Custom Modalities',
                  type: 'page',
                  url: '/en/api-reference/recipes/custom-modalities',
                },
                {
                  $id: 'api-reference-recipes-use-cases-separator',
                  name: 'Use cases',
                  type: 'separator',
                },
                {
                  $id: 'api-reference-recipes-wellness-coach',
                  name: 'Wellness Coach',
                  type: 'page',
                  url: '/en/api-reference/recipes/wellness-coach',
                },
                {
                  $id: 'api-reference-recipes-thymia-biomarkers',
                  name: 'Thymia Biomarkers',
                  type: 'page',
                  url: '/en/api-reference/recipes/thymia-biomarkers',
                },
              ],
              index: {
                $id: 'api-reference-recipes-index',
                name: 'Recipes',
                type: 'page',
                url: '/en/api-reference/recipes',
              },
              name: 'Recipes',
              type: 'folder',
            },
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
                      children: [
                        {
                          $id: 'api-reference-conversational-ai-rest-api-agent-join',
                          name: '/en/api-reference/conversational-ai/rest-api/agent/join',
                          type: 'page',
                          url: '/en/api-reference/conversational-ai/rest-api/agent/join',
                        },
                      ],
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
            {
              $id: 'api-reference-rtc-folder',
              children: [
                {
                  $id: 'api-reference-rtc-android-folder',
                  children: [
                    {
                      $id: 'api-reference-rtc-android-current-folder',
                      children: [
                        {
                          $id: 'api-reference-rtc-android-current-overview',
                          name: 'Overview',
                          type: 'page',
                          url: '/en/api-reference/rtc/android/overview',
                        },
                      ],
                      index: {
                        $id: 'api-reference-rtc-android-current-index',
                        name: 'Android API Reference',
                        type: 'page',
                        url: '/en/api-reference/rtc/android',
                      },
                      name: 'Current',
                      type: 'folder',
                    },
                    {
                      $id: 'api-reference-rtc-android-4-6-0-folder',
                      children: [
                        {
                          $id: 'api-reference-rtc-android-4-6-0-overview',
                          name: 'Overview',
                          type: 'page',
                          url: '/en/api-reference/rtc/android/4.6.0/overview',
                        },
                      ],
                      index: {
                        $id: 'api-reference-rtc-android-4-6-0-index',
                        name: 'Android API Reference',
                        type: 'page',
                        url: '/en/api-reference/rtc/android/4.6.0',
                      },
                      name: '4.6.0',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'api-reference-rtc-android-index',
                    name: 'Android API Reference',
                    type: 'page',
                    url: '/en/api-reference/rtc/android',
                  },
                  name: 'Android API Reference',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'api-reference-rtc-index',
                name: 'RTC API Reference',
                type: 'page',
                url: '/en/api-reference/rtc',
              },
              name: 'RTC',
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

const realtimeMediaPageTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'realtime-media-folder',
          children: [
            {
              $id: 'realtime-media-build-live-interaction-separator',
              name: 'Build Live Interaction',
              type: 'separator',
            },
            {
              $id: 'realtime-media-rtc-folder',
              children: [
                {
                  $id: 'realtime-media-rtc-android-folder',
                  children: [
                    {
                      $id: 'realtime-media-rtc-android-quick-start-folder',
                      children: [
                        {
                          $id: 'realtime-media-rtc-android-quick-start-build',
                          name: 'Build from scratch',
                          type: 'page',
                          url: '/en/realtime-media/rtc/android/quick-start/build-from-scratch',
                        },
                        {
                          $id: 'realtime-media-rtc-android-quick-start-ai',
                          name: 'Integrate with AI tools',
                          type: 'page',
                          url: '/en/realtime-media/rtc/android/quick-start/integrate-with-ai-tools',
                        },
                      ],
                      index: {
                        $id: 'realtime-media-rtc-android-quick-start-index',
                        name: 'Quick Start',
                        type: 'page',
                        url: '/en/realtime-media/rtc/android/quick-start',
                      },
                      name: 'Quick Start',
                      type: 'folder',
                    },
                    {
                      $id: 'realtime-media-rtc-android-audio-folder',
                      children: [
                        {
                          $id: 'realtime-media-rtc-android-audio-profiles',
                          name: 'Audio profiles and quality',
                          type: 'page',
                          url: '/en/realtime-media/rtc/android/audio/audio-profiles-and-quality',
                        },
                      ],
                      index: {
                        $id: 'realtime-media-rtc-android-audio-index',
                        name: 'Audio',
                        type: 'page',
                        url: '/en/realtime-media/rtc/android/audio',
                      },
                      name: 'Audio',
                      type: 'folder',
                    },
                    {
                      $id: 'realtime-media-rtc-android-video-folder',
                      children: [
                        {
                          $id: 'realtime-media-rtc-android-video-profiles',
                          name: 'Video profiles and quality',
                          type: 'page',
                          url: '/en/realtime-media/rtc/android/video/video-profiles-and-quality',
                        },
                      ],
                      index: {
                        $id: 'realtime-media-rtc-android-video-index',
                        name: 'Video',
                        type: 'page',
                        url: '/en/realtime-media/rtc/android/video',
                      },
                      name: 'Video',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'realtime-media-rtc-android-index',
                    name: 'Android',
                    type: 'page',
                    url: '/en/realtime-media/rtc/android',
                  },
                  name: 'Android',
                  type: 'folder',
                },
                {
                  $id: 'realtime-media-rtc-macos-folder',
                  children: [
                    {
                      $id: 'realtime-media-rtc-macos-audio-folder',
                      children: [
                        {
                          $id: 'realtime-media-rtc-macos-audio-profiles',
                          name: 'Audio profiles and quality',
                          type: 'page',
                          url: '/en/realtime-media/rtc/macOS/audio/audio-profiles-and-quality',
                        },
                      ],
                      index: {
                        $id: 'realtime-media-rtc-macos-audio-index',
                        name: 'Audio',
                        type: 'page',
                        url: '/en/realtime-media/rtc/macOS/audio',
                      },
                      name: 'Audio',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'realtime-media-rtc-macos-index',
                    name: 'macOS',
                    type: 'page',
                    url: '/en/realtime-media/rtc/macOS',
                  },
                  name: 'macOS',
                  type: 'folder',
                },
                {
                  $id: 'realtime-media-rtc-quick-start-folder',
                  children: [
                    {
                      $id: 'realtime-media-rtc-quick-start-build',
                      name: 'Build from scratch',
                      type: 'page',
                      url: '/en/realtime-media/rtc/quick-start/build-from-scratch',
                    },
                  ],
                  index: {
                    $id: 'realtime-media-rtc-quick-start-index',
                    name: 'Quick Start',
                    type: 'page',
                    url: '/en/realtime-media/rtc/quick-start',
                  },
                  name: 'Quick Start',
                  type: 'folder',
                },
                {
                  $id: 'realtime-media-rtc-audio-folder',
                  children: [
                    {
                      $id: 'realtime-media-rtc-audio-profiles',
                      name: 'Audio profiles and quality',
                      type: 'page',
                      url: '/en/realtime-media/rtc/audio/audio-profiles-and-quality',
                    },
                  ],
                  index: {
                    $id: 'realtime-media-rtc-audio-index',
                    name: 'Audio',
                    type: 'page',
                    url: '/en/realtime-media/rtc/audio',
                  },
                  name: 'Audio',
                  type: 'folder',
                },
                {
                  $id: 'realtime-media-rtc-video-folder',
                  children: [
                    {
                      $id: 'realtime-media-rtc-video-profiles',
                      name: 'Video profiles and quality',
                      type: 'page',
                      url: '/en/realtime-media/rtc/video/video-profiles-and-quality',
                    },
                  ],
                  index: {
                    $id: 'realtime-media-rtc-video-index',
                    name: 'Video',
                    type: 'page',
                    url: '/en/realtime-media/rtc/video',
                  },
                  name: 'Video',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'realtime-media-rtc-index',
                name: 'Voice & Video',
                type: 'page',
                url: '/en/realtime-media/rtc',
              },
              name: 'Voice & Video',
              type: 'folder',
            },
            {
              $id: 'realtime-media-rtm-folder',
              children: [],
              index: {
                $id: 'realtime-media-rtm-index',
                name: 'RTM',
                type: 'page',
                url: '/en/realtime-media/rtm',
              },
              name: 'Signaling',
              type: 'folder',
            },
          ],
          index: {
            $id: 'realtime-media-index',
            name: 'Overview',
            type: 'page',
            url: '/en/realtime-media',
          },
          name: 'Realtime & Media',
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

function createPage(): PageWithSource {
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
      type: 'docs',
    },
    path: 'en/introduction/about-agora.md',
    slugs: ['en', 'introduction', 'about-agora'],
    type: 'docs',
    url: '/en/introduction/about-agora',
  } as unknown as PageWithSource;
}

function createOpenApiPage(): PageWithSource {
  return {
    data: {
      _openapi: {
        method: 'post',
      },
      description: 'Create and join a conversational AI agent.',
      getClientAPIPageProps: vi.fn(async () => ({
        document: 'convoai-en',
        operations: [
          {
            method: 'post' as const,
            path: '/v2/projects/{appid}/join',
          },
        ],
        payload: {
          bundled: {
            info: {
              title: 'Conversational AI Agent API Overview',
            },
            openapi: '3.2.0',
            paths: {},
          },
        },
      })),
      getText: vi.fn(async () => ''),
      structuredData: {
        contents: [],
        headings: [],
      },
      title: 'Start a conversational AI agent',
      toc: [
        {
          depth: 2,
          title: 'Request',
          url: '#request',
        },
      ],
      type: 'openapi',
    },
    path: 'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
    slugs: [
      'en',
      'api-reference',
      'conversational-ai',
      'rest-api',
      'agent',
      'join',
    ],
    type: 'openapi',
    url: '/en/api-reference/conversational-ai/rest-api/agent/join',
  } as unknown as PageWithSource;
}

function createZhOpenApiPage(): PageWithSource {
  return {
    ...createOpenApiPage(),
    path: 'zh-CN/api-reference/conversational-ai/rest-api/agent/join.mdx',
    slugs: [
      'zh-CN',
      'api-reference',
      'conversational-ai',
      'rest-api',
      'agent',
      'join',
    ],
    url: '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
  } as unknown as PageWithSource;
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

    mockedGetPage.mockImplementation((_slugs, locale) =>
      locale === 'zh-CN' ? undefined : page,
    );
    mockedGetPages.mockReturnValue([page]);
    mockedGetPageTree.mockReturnValue(pageTree);
    mockedGetNodeMeta.mockReturnValue(undefined);
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
          href: '/zh-CN/introduction',
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

  it('returns OpenAPI content inside the existing docs shell payload from the merged source', async () => {
    mockedGetPage.mockImplementation((_slugs, locale) =>
      locale === 'zh-CN' ? createZhOpenApiPage() : createOpenApiPage(),
    );
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);

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
        pageProps: {
          document: 'convoai-en',
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/join',
            },
          ],
        },
      },
      contentPath: 'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
      layoutMode: 'openapi',
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
      ]),
      markdownUrl:
        '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md',
      tabs: [
        {
          id: 'api-reference',
          title: 'API Reference',
          url: '/en/api-reference',
        },
      ],
      title: 'Start a conversational AI agent',
      toc: [
        {
          depth: 2,
          title: 'Request',
          url: '#request',
        },
      ],
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
    expect(
      findSidebarPage(
        payload.sidebar,
        '/en/api-reference/conversational-ai/rest-api/agent/join',
      ),
    ).toMatchObject({
      method: 'POST',
      title: 'Start a conversational AI agent',
    });
    expect(
      flattenSidebarPageUrls(payload.sidebar).filter(
        (url) =>
          url === '/en/api-reference/conversational-ai/rest-api/agent/join',
      ),
    ).toHaveLength(1);
    expect(payload.navigation).toEqual({
      next: {
        title: 'Stop a conversational AI agent',
        url: '/en/api-reference/conversational-ai/rest-api/agent/leave',
      },
      previous: undefined,
    });
  });

  it('includes OpenAPI endpoint sidebar items on the real MDX parent page', async () => {
    const agentPage = {
      ...createPage(),
      data: {
        ...createPage().data,
        info: {
          fullPath:
            '/virtual/content/docs/en/api-reference/conversational-ai/rest-api/agent/index.md',
          path: 'en/api-reference/conversational-ai/rest-api/agent/index.md',
        },
        title: 'Agent management',
      },
      path: 'en/api-reference/conversational-ai/rest-api/agent/index.md',
      slugs: ['en', 'api-reference', 'conversational-ai', 'rest-api', 'agent'],
      url: '/en/api-reference/conversational-ai/rest-api/agent',
    };

    mockedGetPage.mockReturnValue(agentPage);
    mockedGetPages.mockReturnValue([agentPage]);
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'conversational-ai',
      'rest-api',
      'agent',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload).toMatchObject({
      activePath: '/en/api-reference/conversational-ai/rest-api/agent',
      body: {
        kind: 'mdx',
      },
      title: 'Agent management',
    });
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference/conversational-ai/rest-api/agent',
        '/en/api-reference/conversational-ai/rest-api/agent/join',
      ]),
    );
    expect(
      findSidebarPage(
        payload.sidebar,
        '/en/api-reference/conversational-ai/rest-api/agent/join',
      ),
    ).toMatchObject({
      method: 'POST',
    });
  });

  it('shows only current platform entries in a parent versioned API reference scope', async () => {
    const page = createPage();
    const rtcPage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/rtc/index.md',
          path: 'en/api-reference/rtc/index.md',
        },
        title: 'RTC API Reference',
      },
      path: 'en/api-reference/rtc/index.md',
      slugs: ['en', 'api-reference', 'rtc', 'index'],
      url: '/en/api-reference/rtc',
    };

    mockedGetPage.mockReturnValue(rtcPage);
    mockedGetPages.mockReturnValue([rtcPage]);
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);
    mockedGetNodeMeta.mockImplementation((node) => {
      if (node.$id === 'api-reference-rtc-folder') {
        return {
          data: {
            navScope: {},
            title: 'RTC',
          },
        } as unknown as ReturnType<typeof source.getNodeMeta>;
      }

      if (node.$id === 'api-reference-rtc-android-folder') {
        return {
          data: {
            navScope: {
              defaultVersion: 'current',
              versions: [
                { id: 'current', label: 'v4.6.2', path: '(current)' },
                { id: '4.6.0', label: 'v4.6.0', path: '4.6.0' },
              ],
            },
            title: 'Android API Reference',
          },
        } as unknown as ReturnType<typeof source.getNodeMeta>;
      }

      return undefined;
    });

    const payload = await loadDocsPagePayload('en', 'api-reference', ['rtc']);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader).toEqual({
      backHref: '/en/api-reference',
      backLabel: 'API Reference',
      title: 'RTC',
    });
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual([
      '/en/api-reference/rtc',
      '/en/api-reference/rtc/android',
    ]);
    expect(payload.sidebar).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: '/en/api-reference/rtc/android/4.6.0',
        }),
      ]),
    );
  });

  it('returns a shared platform sidebar for a realtime-media navScope with shared sidebar metadata', async () => {
    const page = createPage();
    const rtcPage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/realtime-media/rtc/index.md',
          path: 'en/realtime-media/rtc/index.md',
        },
        title: 'Voice & Video',
      },
      path: 'en/realtime-media/rtc/index.md',
      slugs: ['en', 'realtime-media', 'rtc', 'index'],
      url: '/en/realtime-media/rtc',
    };

    mockedGetPage.mockReturnValue(rtcPage);
    mockedGetPages.mockReturnValue([rtcPage]);
    mockedGetPageTree.mockReturnValue(realtimeMediaPageTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-rtc-folder'
        ? ({
            data: {
              navScope: {
                defaultVersion: 'android',
                platformTabs: true,
                sharedSidebar: true,
                versions: [
                  { id: 'android', label: 'Android', path: 'android' },
                  { id: 'macOS', label: 'macOS', path: 'macOS' },
                ],
              },
              title: 'Voice & Video',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'realtime-media', ['rtc']);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader).toEqual({
      backHref: '/en/realtime-media',
      backLabel: 'Realtime & Media',
      title: 'Voice & Video',
      versionSwitcher: undefined,
    });
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/realtime-media/rtc',
        '/en/realtime-media/rtc/android/quick-start',
        '/en/realtime-media/rtc/android/audio/audio-profiles-and-quality',
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).not.toContain(
      '/en/realtime-media/rtm',
    );
  });

  it('only exposes platform tabs for realtime-media guide pages that exist on that platform', async () => {
    const page = {
      ...createPage(),
      data: {
        ...createPage().data,
        info: {
          fullPath:
            '/virtual/content/docs/en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
          path: 'en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
        },
        title: 'Build from scratch',
      },
      path: 'en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
      slugs: [
        'en',
        'realtime-media',
        'rtc',
        'android',
        'quick-start',
        'build-from-scratch',
      ],
      url: '/en/realtime-media/rtc/android/quick-start/build-from-scratch',
    };

    mockedGetPage.mockReturnValue(page);
    mockedGetPages.mockReturnValue([page]);
    mockedGetPageTree.mockReturnValue(realtimeMediaPageTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-rtc-folder'
        ? ({
            data: {
              navScope: {
                defaultVersion: 'android',
                platformTabs: true,
                sharedSidebar: true,
                versions: [
                  { id: 'android', label: 'Android', path: 'android' },
                  { id: 'macOS', label: 'macOS', path: 'macOS' },
                ],
              },
              title: 'Voice & Video',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'realtime-media', [
      'rtc',
      'android',
      'quick-start',
      'build-from-scratch',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader?.versionSwitcher).toEqual({
      currentId: 'android',
      presentation: 'tabs',
      versions: [
        {
          href: '/en/realtime-media/rtc/android/quick-start/build-from-scratch',
          id: 'android',
          label: 'Android',
        },
      ],
    });
  });

  it('allows a realtime-media platform page to opt out of platform tabs with page frontmatter', async () => {
    const page = {
      ...createPage(),
      data: {
        ...createPage().data,
        hidePlatformTabs: true,
        info: {
          fullPath:
            '/virtual/content/docs/en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
          path: 'en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
        },
        title: 'Build from scratch',
      },
      path: 'en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
      slugs: [
        'en',
        'realtime-media',
        'rtc',
        'android',
        'quick-start',
        'build-from-scratch',
      ],
      url: '/en/realtime-media/rtc/android/quick-start/build-from-scratch',
    };

    mockedGetPage.mockReturnValue(page);
    mockedGetPages.mockReturnValue([page]);
    mockedGetPageTree.mockReturnValue(realtimeMediaPageTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-rtc-folder'
        ? ({
            data: {
              navScope: {
                defaultVersion: 'android',
                platformTabs: true,
                sharedSidebar: true,
                versions: [
                  { id: 'android', label: 'Android', path: 'android' },
                  { id: 'macOS', label: 'macOS', path: 'macOS' },
                ],
              },
              title: 'Voice & Video',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'realtime-media', [
      'rtc',
      'android',
      'quick-start',
      'build-from-scratch',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader?.versionSwitcher).toBeUndefined();
  });

  it('keeps a plain nav scope as a linked folder group in the parent Realtime & Media sidebar', async () => {
    const page = createPage();
    const realtimePage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/realtime-media/index.md',
          path: 'en/realtime-media/index.md',
        },
        title: 'Overview',
      },
      path: 'en/realtime-media/index.md',
      slugs: ['en', 'realtime-media', 'index'],
      url: '/en/realtime-media',
    };

    mockedGetPage.mockReturnValue(realtimePage);
    mockedGetPages.mockReturnValue([realtimePage]);
    mockedGetPageTree.mockReturnValue(realtimeMediaPageTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-rtc-folder'
        ? ({
            data: {
              navScope: {
                defaultVersion: 'android',
                platformTabs: true,
                sharedSidebar: true,
                versions: [
                  { id: 'android', label: 'Android', path: 'android' },
                  { id: 'macOS', label: 'macOS', path: 'macOS' },
                ],
              },
              title: 'Voice & Video',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'realtime-media', []);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              children: [],
              title: 'Voice & Video',
              type: 'section',
              url: '/en/realtime-media/rtc',
            }),
          ]),
          title: 'Build Live Interaction',
          type: 'section',
        }),
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/realtime-media',
        '/en/realtime-media/rtc',
        '/en/realtime-media/rtm',
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).not.toEqual(
      expect.arrayContaining([
        '/en/realtime-media/rtc/quick-start',
        '/en/realtime-media/rtc/audio/audio-profiles-and-quality',
      ]),
    );
  });

  it('redirects legacy quick-start slugs to the default Android platform scope', async () => {
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
    const androidPage = {
      ...nestedPage,
      path: 'en/realtime-media/rtc/android/quick-start/integrate-with-ai-tools.md',
      slugs: [
        'en',
        'realtime-media',
        'rtc',
        'android',
        'quick-start',
        'integrate-with-ai-tools',
      ],
      url: '/en/realtime-media/rtc/quick-start/android/integrate-with-ai-tools',
    };

    mockedGetPage.mockImplementation((slugs: string[]) => {
      const normalizedSlugs = slugs.join('/');

      if (
        normalizedSlugs ===
        'en/realtime-media/rtc/android/quick-start/integrate-with-ai-tools'
      ) {
        return androidPage;
      }

      return nestedPage;
    });
    mockedGetPages.mockReturnValue([
      nestedPage as ReturnType<typeof createPage>,
      androidPage as ReturnType<typeof createPage>,
    ]);

    await expect(
      loadDocsPagePayload('en', 'realtime-media', ['rtc', 'quick-start']),
    ).resolves.toEqual({
      redirectUrl:
        '/en/realtime-media/rtc/quick-start/android/integrate-with-ai-tools',
    });
  });

  it('keeps realtime media quick-start pages when the hardcoded scoped redirect target is missing', async () => {
    const zhPage = {
      ...createPage(),
      path: 'zh-CN/realtime-media/rtc/quick-start/build-from-scratch.md',
      slugs: [
        'zh-CN',
        'realtime-media',
        'rtc',
        'quick-start',
        'build-from-scratch',
      ],
      url: '/zh-CN/realtime-media/rtc/quick-start/build-from-scratch',
    };

    mockedGetPage.mockImplementation((slugs: string[]) =>
      slugs.join('/') === 'realtime-media/rtc/quick-start/build-from-scratch'
        ? zhPage
        : undefined,
    );
    mockedGetPages.mockReturnValue([zhPage as ReturnType<typeof createPage>]);
    mockedGetPageTree.mockReturnValue(realtimeMediaPageTree);

    const payload = await loadDocsPagePayload('zh-CN', 'realtime-media', [
      'rtc',
      'quick-start',
      'build-from-scratch',
    ]);

    expect(payload).toMatchObject({
      activePath: '/zh-CN/realtime-media/rtc/quick-start/build-from-scratch',
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

  it('redirects migrated legacy best-practices pages to their new product paths', async () => {
    await expect(
      loadDocsPagePayload('zh-CN', 'best-practices', ['http-basic-auth']),
    ).resolves.toEqual({
      redirectUrl:
        '/zh-CN/api-reference/conversational-ai/rest-api/authentication',
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'best-practices', ['release-notes']),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/ai/release-notes',
    });
  });

  it('redirects the Deploy to IoT devices path entry to the Device Kit product space', async () => {
    await expect(
      loadDocsPagePayload('en', 'ai', [
        'choose-your-path',
        'quickstart-device-kit',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/device-kit/start-here/quickstart',
    });
  });

  it('redirects the voice agent path entry to the canonical quickstart page', async () => {
    await expect(
      loadDocsPagePayload('en', 'ai', [
        'choose-your-path',
        'quickstart-coding',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/get-started/quickstart',
    });
  });

  it('redirects the conversational AI overview path to the canonical quickstart page', async () => {
    await expect(
      loadDocsPagePayload('en', 'ai', ['conversational-ai']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/get-started/quickstart',
    });
  });

  it('redirects the Device Kit overview path to the canonical quickstart page', async () => {
    await expect(
      loadDocsPagePayload('en', 'ai', ['device-kit']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/device-kit/start-here/quickstart',
    });
  });

  it('redirects the Recipes path entry to the scoped recipes tree', async () => {
    await expect(
      loadDocsPagePayload('en', 'api-reference', ['voice-ai-recipes']),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/recipes',
    });
  });

  it('keeps Recipes visible in the API Reference root sidebar while hiding the legacy alias', async () => {
    const page = createPage();
    mockedGetPage.mockReturnValue({
      ...page,
      path: 'en/api-reference/index.md',
      slugs: ['en', 'api-reference', 'index'],
      url: '/en/api-reference',
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/index.md',
          path: 'en/api-reference/index.md',
        },
        title: 'API Reference',
      },
    });
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'api-reference-recipes-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Recipes',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'api-reference', []);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference',
        '/en/api-reference/recipes',
        '/en/api-reference/conversational-ai',
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).not.toEqual(
      expect.arrayContaining([
        '/en/api-reference/voice-ai-recipes',
        '/en/api-reference/recipes/python-quickstart',
        '/en/api-reference/recipes/custom-llm',
        '/en/api-reference/recipes/ivr-agent',
      ]),
    );
  });

  it('redirects moved Device Kit docs pages to their new product paths', async () => {
    await expect(
      loadDocsPagePayload('en', 'ai', [
        'device-kit',
        'start-here',
        'enable-services',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/device-kit/reference/enable-services',
    });
  });

  it('redirects moved AI docs pages to their new product paths', async () => {
    await expect(
      loadDocsPagePayload('en', 'ai', ['build', 'code-first-architecture']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/build/architecture',
    });

    await expect(
      loadDocsPagePayload('en', 'ai', ['reference', 'code-first-architecture']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/build/architecture',
    });

    await expect(
      loadDocsPagePayload('en', 'ai', ['reference', 'architecture']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/build/architecture',
    });

    await expect(
      loadDocsPagePayload('en', 'ai', ['build', 'event-types']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/reference/event-types',
    });

    await expect(
      loadDocsPagePayload('en', 'ai', ['best-practices', 'filler-words']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/build/filler-words',
    });
  });

  it('returns a unified Voice Agent sidebar for device pages', async () => {
    const page = createPage();
    const unifiedAiPageTree: Root = {
      children: [
        {
          $id: 'en-root-unified-ai',
          children: [
            {
              $id: 'ai-folder',
              children: [
                {
                  $id: 'ai-legacy-coding-entry',
                  name: 'Voice agent quickstart',
                  type: 'page',
                  url: '/en/ai/choose-your-path/quickstart-coding',
                },
                {
                  $id: 'ai-legacy-device-kit-entry',
                  name: 'Deploy to IoT devices',
                  type: 'page',
                  url: '/en/ai/choose-your-path/quickstart-device-kit',
                },
                {
                  $id: 'ai-get-started-folder',
                  children: [
                    {
                      $id: 'ai-quickstart',
                      name: 'Quickstart',
                      type: 'page',
                      url: '/en/ai/get-started/quickstart',
                    },
                  ],
                  name: 'Get started',
                  type: 'folder',
                },
                {
                  $id: 'ai-build-folder',
                  children: [
                    {
                      $id: 'ai-build-architecture',
                      name: 'Voice agent app architecture',
                      type: 'page',
                      url: '/en/ai/build/architecture',
                    },
                    {
                      $id: 'ai-build-start-stop',
                      name: 'Start and stop an agent',
                      type: 'page',
                      url: '/en/ai/build/start-stop-agent',
                    },
                  ],
                  name: 'Build',
                  type: 'folder',
                },
                {
                  $id: 'ai-best-practices-folder',
                  children: [
                    {
                      $id: 'ai-best-practices-optimize-latency',
                      name: 'Optimize latency',
                      type: 'page',
                      url: '/en/ai/best-practices/optimize-latency',
                    },
                  ],
                  name: 'Best practices',
                  type: 'folder',
                },
                {
                  $id: 'ai-models-folder',
                  children: [
                    {
                      $id: 'ai-models-asr',
                      name: 'ASR',
                      type: 'page',
                      url: '/en/ai/models/asr',
                    },
                  ],
                  index: {
                    $id: 'ai-models-index',
                    name: 'Models',
                    type: 'page',
                    url: '/en/ai/models',
                  },
                  name: 'Models',
                  type: 'folder',
                },
                {
                  $id: 'ai-reference-folder',
                  children: [
                    {
                      $id: 'ai-reference-event-types',
                      name: 'Notification event types',
                      type: 'page',
                      url: '/en/ai/reference/event-types',
                    },
                    {
                      $id: 'ai-reference-release-notes',
                      name: 'Release notes',
                      type: 'page',
                      url: '/en/ai/reference/release-notes',
                    },
                    {
                      $id: 'ai-reference-pricing',
                      name: 'Pricing',
                      type: 'page',
                      url: '/en/ai/reference/pricing',
                    },
                  ],
                  name: 'Reference',
                  type: 'folder',
                },
                {
                  $id: 'ai-device-kit-folder',
                  children: [
                    {
                      $id: 'device-kit-start-here-folder',
                      children: [
                        {
                          $id: 'device-kit-quickstart',
                          name: 'Quickstart',
                          type: 'page',
                          url: '/en/ai/device-kit/start-here/quickstart',
                        },
                        {
                          $id: 'device-kit-enable-services',
                          name: 'Enable services',
                          type: 'page',
                          url: '/en/ai/device-kit/reference/enable-services',
                        },
                      ],
                      name: 'Start here',
                      type: 'folder',
                    },
                    {
                      $id: 'device-kit-build-folder',
                      children: [
                        {
                          $id: 'device-kit-run-r1-demo',
                          name: 'Run the R1 demo',
                          type: 'page',
                          url: '/en/ai/device-kit/build/run-the-r1-demo',
                        },
                        {
                          $id: 'device-kit-device-controls',
                          name: 'Device controls',
                          type: 'page',
                          url: '/en/ai/device-kit/build/device-controls',
                        },
                      ],
                      name: 'Build',
                      type: 'folder',
                    },
                    {
                      $id: 'device-kit-reference-folder',
                      children: [
                        {
                          $id: 'device-kit-release-notes',
                          name: 'Release notes',
                          type: 'page',
                          url: '/en/ai/device-kit/reference/release-notes',
                        },
                        {
                          $id: 'device-kit-pricing',
                          name: 'Pricing',
                          type: 'page',
                          url: '/en/ai/device-kit/reference/pricing',
                        },
                      ],
                      name: 'Reference',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'device-kit-index',
                    name: 'Convo AI Device Kit',
                    type: 'page',
                    url: '/en/ai/device-kit',
                  },
                  name: 'Convo AI Device Kit',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'ai-index',
                name: 'Voice Agent',
                type: 'page',
                url: '/en/ai',
              },
              name: 'Voice Agent',
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
    mockedGetPage.mockReturnValue({
      ...page,
      path: 'en/ai/device-kit/start-here/quickstart.md',
      slugs: ['en', 'ai', 'device-kit', 'start-here', 'quickstart'],
      url: '/en/ai/device-kit/start-here/quickstart',
      data: {
        ...page.data,
        info: {
          fullPath:
            '/virtual/content/docs/en/ai/device-kit/start-here/quickstart.md',
          path: 'en/ai/device-kit/start-here/quickstart.md',
        },
        title: 'Quickstart',
      },
    });
    mockedGetPageTree.mockReturnValue(unifiedAiPageTree);

    const payload = await loadDocsPagePayload('en', 'ai', [
      'device-kit',
      'start-here',
      'quickstart',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader).toBeUndefined();
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/ai',
        '/en/ai/get-started/quickstart',
        '/en/ai/reference/event-types',
        '/en/ai/reference/release-notes',
        '/en/ai/reference/pricing',
        '/en/ai/device-kit/start-here/quickstart',
        '/en/ai/device-kit/build/run-the-r1-demo',
        '/en/ai/device-kit/build/device-controls',
        '/en/ai/device-kit/reference/release-notes',
        '/en/ai/device-kit/reference/pricing',
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).not.toEqual(
      expect.arrayContaining([
        '/en/ai/conversational-ai',
        '/en/ai/device-kit',
        '/en/ai/choose-your-path/quickstart-coding',
        '/en/ai/choose-your-path/quickstart-device-kit',
        '/en/ai/device-kit/reference/enable-services',
      ]),
    );
    expect(payload.sidebar.map((node) => node.title)).toEqual([
      'Overview',
      'Voice agent in apps',
      'Voice agent on dedicated devices',
    ]);

    const softwareSection = payload.sidebar.find(
      (node) => node.type === 'section' && node.title === 'Voice agent in apps',
    );

    if (!softwareSection || softwareSection.type !== 'section') {
      throw new Error('expected the apps section');
    }

    expect(
      softwareSection.children.some(
        (node) => node.type === 'section' && node.title === 'Reference',
      ),
    ).toBe(true);
    const softwareReferenceSection = softwareSection.children.find(
      (node) => node.type === 'section' && node.title === 'Reference',
    );

    if (
      !softwareReferenceSection ||
      softwareReferenceSection.type !== 'section'
    ) {
      throw new Error('expected the software reference section');
    }

    const buildSection = softwareSection.children.find(
      (node) => node.type === 'section' && node.title === 'Build',
    );

    if (!buildSection || buildSection.type !== 'section') {
      throw new Error('expected the Build section');
    }

    expect(
      buildSection.children.some(
        (node) =>
          node.type === 'section' && node.title === 'Harden and optimize',
      ),
    ).toBe(true);

    const dedicatedDevicesSection = payload.sidebar.find(
      (node) =>
        node.type === 'section' &&
        node.title === 'Voice agent on dedicated devices',
    );

    if (
      !dedicatedDevicesSection ||
      dedicatedDevicesSection.type !== 'section'
    ) {
      throw new Error('expected the dedicated devices section');
    }

    expect(
      dedicatedDevicesSection.children.some(
        (node) => node.type === 'section' && node.title === 'Reference',
      ),
    ).toBe(true);
    const dedicatedReferenceSection = dedicatedDevicesSection.children.find(
      (node) => node.type === 'section' && node.title === 'Reference',
    );

    if (
      !dedicatedReferenceSection ||
      dedicatedReferenceSection.type !== 'section'
    ) {
      throw new Error('expected the dedicated reference section');
    }
    expect(
      dedicatedReferenceSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/device-kit/reference/enable-services',
      ),
    ).toBe(false);
    expect(
      dedicatedReferenceSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/device-kit/reference/release-notes',
      ),
    ).toBe(true);
    expect(
      dedicatedReferenceSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/device-kit/reference/pricing',
      ),
    ).toBe(true);
    expect(
      dedicatedDevicesSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/device-kit/start-here/quickstart',
      ),
    ).toBe(true);
    expect(
      dedicatedDevicesSection.children.some(
        (node) => node.type === 'section' && node.title === 'Build',
      ),
    ).toBe(true);
    expect(
      dedicatedDevicesSection.children.some(
        (node) => node.type === 'section' && node.title === 'Reference',
      ),
    ).toBe(true);
    expect(
      softwareReferenceSection.children.some(
        (node) =>
          node.type === 'page' && node.url === '/en/ai/reference/event-types',
      ),
    ).toBe(true);
    expect(
      softwareSection.children.some(
        (node) => node.type === 'section' && node.title === 'Models',
      ),
    ).toBe(true);
    expect(
      softwareSection.children.some(
        (node) =>
          node.type === 'page' && node.url === '/en/ai/get-started/quickstart',
      ),
    ).toBe(true);
    expect(payload.sidebar[0]).toEqual(
      expect.objectContaining({
        title: 'Overview',
        type: 'page',
        url: '/en/ai',
      }),
    );
  });

  it('returns a scoped Recipes sidebar with a Back to Reference header', async () => {
    const page = createPage();
    mockedGetPage.mockReturnValue({
      ...page,
      path: 'en/api-reference/recipes/index.md',
      slugs: ['en', 'api-reference', 'recipes', 'index'],
      url: '/en/api-reference/recipes',
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/recipes/index.md',
          path: 'en/api-reference/recipes/index.md',
        },
        title: 'Recipes',
      },
    });
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'api-reference-recipes-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Recipes',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'recipes',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader).toEqual({
      backHref: '/en/api-reference',
      backLabel: 'API Reference',
      title: 'Recipes',
    });
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference/recipes',
        '/en/api-reference/recipes/python-quickstart',
        '/en/api-reference/recipes/golang-quickstart',
        '/en/api-reference/recipes/nextjs-quickstart',
        '/en/api-reference/recipes/custom-llm',
        '/en/api-reference/recipes/custom-modalities',
        '/en/api-reference/recipes/wellness-coach',
        '/en/api-reference/recipes/thymia-biomarkers',
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).not.toEqual(
      expect.arrayContaining([
        '/en/api-reference/voice-ai-recipes',
        '/en/api-reference/conversational-ai',
      ]),
    );
    expect(payload.sidebar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Quickstarts',
          type: 'section',
        }),
        expect.objectContaining({
          title: 'Integration patterns',
          type: 'section',
        }),
        expect.objectContaining({
          title: 'Use cases',
          type: 'section',
        }),
      ]),
    );
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
      : [
          ...(node.url ? [node.url] : []),
          ...flattenSidebarPageUrls(node.children),
        ],
  );
}

function findSidebarPage(
  nodes: Exclude<
    Awaited<ReturnType<typeof loadDocsPagePayload>>,
    null | { redirectUrl: string }
  >['sidebar'],
  url: string,
):
  | Exclude<
      Awaited<ReturnType<typeof loadDocsPagePayload>>,
      null | { redirectUrl: string }
    >['sidebar'][number]
  | undefined {
  for (const node of nodes) {
    if (node.type === 'page' && node.url === url) {
      return node;
    }

    if (node.type === 'section') {
      const nested = findSidebarPage(node.children, url);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}
