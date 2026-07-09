import type { Root } from 'fumadocs-core/page-tree';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { resolveDocsLastUpdatedMetadataMock } = vi.hoisted(() => ({
  resolveDocsLastUpdatedMetadataMock: vi.fn(),
}));

vi.mock('./docs-last-updated.server', () => ({
  resolveDocsLastUpdatedMetadata: resolveDocsLastUpdatedMetadataMock,
}));

import {
  loadDocsPagePayload,
  loadDocsSearchIndex,
  loadDocsTabIndex,
} from './docs-page.server';
import { type PageWithSource, source } from './source.server';

vi.mock('./source.server', () => ({
  getPageMarkdownUrl: (page: { url: string }, platform?: string) => {
    const url = platform ? `${page.url}/${platform}.md` : `${page.url}.md`;

    return {
      segments: url.split('/').filter(Boolean),
      url,
    };
  },
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

const platformGroupPageTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'ai-folder',
          children: [
            {
              $id: 'ai-get-started-separator',
              name: 'Get started',
              type: 'separator',
            },
            {
              $id: 'ai-platform-split-folder',
              children: [
                {
                  $id: 'ai-platform-split-ios',
                  name: 'iOS',
                  type: 'page',
                  url: '/en/ai/get-started/platform-split/ios',
                },
                {
                  $id: 'ai-platform-split-android',
                  name: 'Android',
                  type: 'page',
                  url: '/en/ai/get-started/platform-split/android',
                },
              ],
              index: {
                $id: 'ai-platform-split-index',
                name: 'Split platform page',
                type: 'page',
                url: '/en/ai/get-started/platform-split',
              },
              name: 'Split platform page',
              type: 'folder',
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
                  $id: 'api-reference-conversational-ai-authentication',
                  name: 'Authentication',
                  type: 'page',
                  url: '/en/api-reference/api-ref/conversational-ai/authentication',
                },
              ],
              index: {
                $id: 'api-reference-conversational-ai-index',
                name: 'Conversational AI',
                type: 'page',
                url: '/en/api-reference/api-ref/conversational-ai',
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
                url: '/en/api-reference/api-ref/rtc',
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

function createChatApiReferencePageTree(): Root {
  return {
    children: [
      {
        $id: 'en-root',
        children: [
          {
            $id: 'api-reference-folder',
            children: [
              {
                $id: 'api-reference-api-ref-folder',
                children: [
                  {
                    $id: 'api-reference-api-ref-im-folder',
                    children: [
                      {
                        $id: 'api-reference-api-ref-im-model-separator',
                        icon: 'Play',
                        name: 'Understand the server-side model',
                        type: 'separator',
                      },
                      {
                        $id: 'api-reference-api-ref-im-limitations',
                        name: 'Limitations',
                        type: 'page',
                        url: '/en/api-reference/api-ref/im/limitations',
                      },
                      {
                        $id: 'api-reference-api-ref-im-messaging-separator',
                        icon: 'MessageSquare',
                        name: 'Manage messaging and users',
                        type: 'separator',
                      },
                      {
                        $id: 'api-reference-api-ref-im-message-management',
                        name: 'Message management',
                        type: 'page',
                        url: '/en/api-reference/api-ref/im/message-management',
                      },
                      {
                        $id: 'api-reference-api-ref-im-groups-separator',
                        icon: 'Users',
                        name: 'Manage groups, rooms, and threads',
                        type: 'separator',
                      },
                      {
                        $id: 'api-reference-api-ref-im-chat-group-management',
                        name: 'Chat group management',
                        type: 'page',
                        url: '/en/api-reference/api-ref/im/chat-group-management',
                      },
                    ],
                    index: {
                      $id: 'api-reference-api-ref-im-index',
                      name: 'Chat',
                      type: 'page',
                      url: '/en/api-reference/api-ref/im',
                    },
                    name: 'Chat',
                    type: 'folder',
                  },
                ],
                index: {
                  $id: 'api-reference-api-ref-index',
                  name: 'API reference',
                  type: 'page',
                  url: '/en/api-reference/api-ref',
                },
                name: 'API Reference',
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
}

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

function createRealtimeMediaApiReferenceJumpPageTree(): Root {
  return {
    children: [
      {
        $id: 'en-root',
        children: [
          {
            $id: 'realtime-media-folder',
            children: [
              {
                $id: 'realtime-media-broadcast-streaming-folder',
                children: [
                  {
                    $id: 'realtime-media-broadcast-streaming-reference-separator',
                    name: 'Reference',
                    type: 'separator',
                  },
                  {
                    $id: 'realtime-media-broadcast-streaming-reference-folder',
                    children: [
                      {
                        $id: 'realtime-media-broadcast-streaming-pricing',
                        name: 'Pricing',
                        type: 'page',
                        url: '/en/realtime-media/broadcast-streaming/reference/pricing',
                      },
                    ],
                    name: 'Reference',
                    type: 'folder',
                  },
                ],
                index: {
                  $id: 'realtime-media-broadcast-streaming-index',
                  name: 'Broadcast Streaming',
                  type: 'page',
                  url: '/en/realtime-media/broadcast-streaming',
                },
                name: 'Broadcast Streaming',
                type: 'folder',
              },
              {
                $id: 'realtime-media-video-folder',
                children: [
                  {
                    $id: 'realtime-media-video-quickstart',
                    name: 'Quickstart',
                    type: 'page',
                    url: '/en/realtime-media/video/get-started-sdk',
                  },
                  {
                    $id: 'realtime-media-video-reference-separator',
                    name: 'Reference',
                    type: 'separator',
                  },
                  {
                    $id: 'realtime-media-video-reference-folder',
                    children: [
                      {
                        $id: 'realtime-media-video-release-notes',
                        name: 'Release Notes',
                        type: 'page',
                        url: '/en/realtime-media/video/reference/release-notes',
                      },
                    ],
                    name: 'Reference',
                    type: 'folder',
                  },
                ],
                index: {
                  $id: 'realtime-media-video-index',
                  name: 'Video Calling',
                  type: 'page',
                  url: '/en/realtime-media/video',
                },
                name: 'Video Calling',
                type: 'folder',
              },
              {
                $id: 'realtime-media-rtm-folder',
                children: [
                  {
                    $id: 'realtime-media-rtm-reference-separator',
                    name: 'Reference',
                    type: 'separator',
                  },
                  {
                    $id: 'realtime-media-rtm-reference-folder',
                    children: [
                      {
                        $id: 'realtime-media-rtm-rest-api',
                        name: 'Signaling REST API',
                        type: 'page',
                        url: '/en/realtime-media/rtm/reference/rest-api',
                      },
                      {
                        $id: 'realtime-media-rtm-downloads',
                        name: 'Downloads',
                        type: 'page',
                        url: '/en/realtime-media/rtm/reference/downloads',
                      },
                    ],
                    name: 'Reference',
                    type: 'folder',
                  },
                ],
                index: {
                  $id: 'realtime-media-rtm-index',
                  name: 'Signaling',
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
}

function createApiReferenceOverviewPageTree(): Root {
  const productFolders = [
    [
      'api-reference-api-ref-conversational-ai-folder',
      'Conversational AI',
      '/en/api-reference/api-ref/conversational-ai',
    ],
    [
      'api-reference-api-ref-rtc-folder',
      'RTC',
      '/en/api-reference/api-ref/rtc',
    ],
    [
      'api-reference-api-ref-video-folder',
      'Video Calling',
      '/en/api-reference/api-ref/video',
    ],
    [
      'api-reference-api-ref-voice-folder',
      'Voice Calling',
      '/en/api-reference/api-ref/voice',
    ],
    [
      'api-reference-api-ref-broadcast-streaming-folder',
      'Broadcast Streaming',
      '/en/api-reference/api-ref/broadcast-streaming',
    ],
    ['api-reference-api-ref-im-folder', 'Chat', '/en/api-reference/api-ref/im'],
    [
      'api-reference-api-ref-signaling-folder',
      'Signaling',
      '/en/api-reference/api-ref/signaling',
    ],
    [
      'api-reference-api-ref-cloud-recording-folder',
      'Cloud Recording',
      '/en/api-reference/api-ref/cloud-recording',
    ],
    [
      'api-reference-api-ref-cloud-transcoding-folder',
      'Cloud Transcoding',
      '/en/api-reference/api-ref/cloud-transcoding',
    ],
    [
      'api-reference-api-ref-speech-to-text-folder',
      'Speech-to-Text',
      '/en/api-reference/api-ref/speech-to-text',
    ],
    [
      'api-reference-api-ref-rtmp-gateway-folder',
      'Media Gateway',
      '/en/api-reference/api-ref/rtmp-gateway',
    ],
    [
      'api-reference-api-ref-whiteboard-folder',
      'Interactive Whiteboard REST API',
      '/en/api-reference/api-ref/whiteboard',
    ],
    [
      'api-reference-api-ref-uikit-sdk-folder',
      'Fastboard API',
      '/en/api-reference/api-ref/uikit-sdk',
    ],
    [
      'api-reference-api-ref-media-pull-folder',
      'Media Pull',
      '/en/api-reference/api-ref/media-pull',
    ],
    [
      'api-reference-api-ref-media-push-folder',
      'Media Push',
      '/en/api-reference/api-ref/media-push',
    ],
    [
      'api-reference-api-ref-on-premise-recording-folder',
      'On-Premise Recording',
      '/en/api-reference/api-ref/on-premise-recording',
    ],
  ].map(([id, name, url]) => ({
    $id: id,
    children: [],
    index: {
      $id: `${id}-index`,
      name,
      type: 'page' as const,
      url,
    },
    name,
    type: 'folder' as const,
  }));

  return {
    children: [
      {
        $id: 'en-root',
        children: [
          {
            $id: 'api-reference-folder',
            children: [
              {
                $id: 'api-reference-recipes-folder',
                children: [],
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
                $id: 'api-reference-api-ref-folder',
                children: productFolders,
                index: {
                  $id: 'api-reference-api-ref-index',
                  name: 'API reference',
                  type: 'page',
                  url: '/en/api-reference/api-ref',
                },
                name: 'API Reference',
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
}

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

function mockPagesByRequestedSlugs() {
  mockedGetPage.mockImplementation((slugs: string[], locale = 'en') => {
    const slugPath = slugs.join('/');

    return {
      ...createPage(),
      path: `${locale}/${slugPath}.md`,
      slugs: [locale, ...slugs],
      url: `/${locale}/${slugPath}`,
    };
  });
}

function createOpenApiPage(): PageWithSource {
  return {
    data: {
      _openapi: {
        method: 'post',
      },
      description: 'Create and join a conversational AI agent.',
      getOpenAPIPageProps: vi.fn(async () => ({
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
    path: 'en/api-reference/api-ref/conversational-ai/join.mdx',
    slugs: ['en', 'api-reference', 'api-ref', 'conversational-ai', 'join'],
    type: 'openapi',
    url: '/en/api-reference/api-ref/conversational-ai/join',
  } as unknown as PageWithSource;
}

function createOpenApiStaticPage(): PageWithSource {
  return {
    ...createPage(),
    data: {
      ...createPage().data,
      title: 'RESTful authentication',
    },
    path: 'en/api-reference/api-ref/cloud-recording/authentication.md',
    slugs: [
      'en',
      'api-reference',
      'api-ref',
      'cloud-recording',
      'authentication',
    ],
    url: '/en/api-reference/api-ref/cloud-recording/authentication',
  } as unknown as PageWithSource;
}

function createZhOpenApiPage(): PageWithSource {
  return {
    ...createOpenApiPage(),
    path: 'zh-CN/api-reference/api-ref/conversational-ai/join.mdx',
    slugs: ['zh-CN', 'api-reference', 'api-ref', 'conversational-ai', 'join'],
    url: '/zh-CN/api-reference/api-ref/conversational-ai/join',
  } as unknown as PageWithSource;
}

function createPlatformGroupPage(): PageWithSource {
  return {
    ...createPage(),
    data: {
      ...createPage().data,
      defaultPlatform: 'ios',
      layout: 'platform-group',
      platforms: ['ios', 'android'],
      title: 'Split platform page',
    },
    path: 'en/ai/get-started/platform-split/index.mdx',
    slugs: ['en', 'ai', 'get-started', 'platform-split'],
    url: '/en/ai/get-started/platform-split',
  } as unknown as PageWithSource;
}

function createPlatformPanelPage(platform: 'android' | 'ios'): PageWithSource {
  return {
    ...createPage(),
    data: {
      ...createPage().data,
      title: platform === 'ios' ? 'iOS panel' : 'Android panel',
    },
    path: `en/ai/get-started/platform-split/${platform}.mdx`,
    slugs: ['en', 'ai', 'get-started', 'platform-split', platform],
    url: `/en/ai/get-started/platform-split/${platform}`,
  } as unknown as PageWithSource;
}

describe('loadDocsTabIndex', () => {
  beforeEach(() => {
    mockedGetPage.mockImplementation((slugs, locale) => {
      if (locale !== 'en' || slugs.join('/') !== 'ai') {
        return undefined;
      }

      return {
        ...createPage(),
        path: 'en/ai/index.md',
        slugs: ['en', 'ai', 'index'],
        url: '/en/ai',
      };
    });
    mockedGetPages.mockReturnValue([]);
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

  it('redirects tab roots without index content to the first descendant page', async () => {
    const nestedProductTree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'realtime-media-folder',
              children: [
                {
                  $id: 'rtc-folder',
                  children: [],
                  index: {
                    $id: 'rtc-index',
                    name: 'RTC',
                    type: 'page',
                    url: '/en/realtime-media/rtc',
                  },
                  name: 'RTC',
                  type: 'folder',
                },
              ],
              name: 'Realtime Media',
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

    mockedGetPage.mockReturnValue(undefined);
    mockedGetPageTree.mockReturnValue(nestedProductTree);

    await expect(
      loadDocsTabIndex('en', 'realtime-media'),
    ).resolves.toMatchObject({
      locale: 'en',
      tab: 'realtime-media',
      url: '/en/realtime-media/rtc',
    });
  });
});

describe('loadDocsSearchIndex', () => {
  beforeEach(() => {
    mockedGetPages.mockReturnValue([createPage()]);
    mockedGetPageTree.mockReturnValue({
      children: [
        {
          children: [
            {
              children: [
                {
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
              children: [
                {
                  children: [
                    {
                      name: 'Start a conversational AI agent',
                      type: 'page',
                      url: '/en/api-reference/api-ref/conversational-ai/join',
                    },
                  ],
                  name: 'Conversational AI',
                  type: 'folder',
                },
              ],
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
    });
  });

  it('returns locale page entries and generated OpenAPI endpoints for the static docs search index', async () => {
    const page = createPage();

    mockedGetPages.mockReturnValue([page, createOpenApiPage()]);

    await expect(loadDocsSearchIndex('en')).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          breadcrumbs: ['Introduction'],
          content: expect.stringContaining('Why teams use it.'),
          description:
            'Build a working mental model of Agora by understanding what it is.',
          objectType: 'docs',
          product: 'about-agora',
          tab: 'introduction',
          title: 'About Agora',
          url: '/en/introduction/about-agora',
        }),
        expect.objectContaining({
          breadcrumbs: ['API Reference', 'Conversational AI'],
          content: expect.stringContaining('/v2/projects/{appid}/join'),
          objectType: 'openapi',
          tab: 'api-reference',
          title: 'Start a conversational AI agent',
          url: '/en/api-reference/api-ref/conversational-ai/join',
        }),
      ]),
    );
    expect('getText' in page.data && page.data.getText).toHaveBeenCalledWith(
      'raw',
    );
    const pages = await loadDocsSearchIndex('en');

    expect(
      pages.filter(
        (item) =>
          item.url === '/en/api-reference/api-ref/conversational-ai/join',
      ),
    ).toHaveLength(1);
  });

  it('excludes source pages absent from the canonical page tree', async () => {
    const hiddenPage = {
      ...createPage(),
      path: 'en/introduction/hidden.md',
      slugs: ['en', 'introduction', 'hidden'],
      url: '/en/introduction/hidden',
    } as PageWithSource;

    mockedGetPages.mockReturnValue([createPage(), hiddenPage]);

    const pages = await loadDocsSearchIndex('en');

    expect(pages.map((page) => page.url)).not.toContain(hiddenPage.url);
  });

  it('returns an empty index for unsupported locales', async () => {
    await expect(loadDocsSearchIndex('fr')).resolves.toEqual([]);
  });

  it('returns an empty index for locales outside the deployment region', async () => {
    await expect(loadDocsSearchIndex('zh-CN')).resolves.toEqual([]);
  });

  it('excludes split-file platform panel pages from search entries', async () => {
    const parentPage = createPlatformGroupPage();
    const iosPage = createPlatformPanelPage('ios');
    const androidPage = createPlatformPanelPage('android');

    mockedGetPages.mockReturnValue([parentPage, iosPage, androidPage]);
    mockedGetPageTree.mockReturnValue(platformGroupPageTree);

    await expect(loadDocsSearchIndex('en')).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description:
            'Build a working mental model of Agora by understanding what it is.',
          title: 'Split platform page',
          url: '/en/ai/get-started/platform-split',
        }),
      ]),
    );
    const pages = await loadDocsSearchIndex('en');

    expect(pages.map((page) => page.url)).not.toContain(
      '/en/ai/get-started/platform-split/ios',
    );
    expect(pages.map((page) => page.url)).not.toContain(
      '/en/ai/get-started/platform-split/android',
    );
  });
});

describe('loadDocsPagePayload', () => {
  beforeEach(() => {
    const page = createPage();

    resolveDocsLastUpdatedMetadataMock.mockReset();
    resolveDocsLastUpdatedMetadataMock.mockResolvedValue({
      formatted: '2026/07/06 13:32:13',
      iso: '2026-07-06T13:32:13.000Z',
      source: 'git',
    });
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
      ],
      lastUpdated: {
        formatted: '2026/07/06 13:32:13',
        iso: '2026-07-06T13:32:13.000Z',
        source: 'git',
      },
      markdownUrl: '/en/introduction/about-agora.md',
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
    expect(resolveDocsLastUpdatedMetadataMock).toHaveBeenCalledWith([
      'content/docs/en/introduction/about-agora.md',
    ]);
  });

  it('generates TOC from shared content plus canonical platform headings only', async () => {
    const page = createPage();

    const docsPage = page as PageWithSource & {
      data: { getText: (kind: 'processed') => Promise<string> };
    };

    docsPage.data.getText = vi.fn(
      async () => `## Shared intro

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
## Install Android SDK
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
## Install Web SDK
Web body
<_PlatformProcessedMarker close="true" />

## Shared follow-up`,
    );

    mockedGetPage.mockImplementation((_slugs, locale) =>
      locale === 'zh-CN' ? undefined : page,
    );

    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora']),
    ).resolves.toMatchObject({
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
          title: 'Shared intro',
          url: '#shared-intro',
        },
        {
          depth: 2,
          title: 'Install Android SDK',
          url: '#install-android-sdk',
        },
        {
          depth: 2,
          title: 'Shared follow-up',
          url: '#shared-follow-up',
        },
      ],
    });
  });

  it('defaults a no-explicit-platform structured page to Android when Android is present', async () => {
    const page = createPage();

    const docsPage = page as PageWithSource & {
      data: { getText: (kind: 'processed') => Promise<string> };
    };

    docsPage.data.getText = vi.fn(
      async () => `## Shared intro

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="windows" />
## Windows setup
Windows body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
## Android setup
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
## Web setup
Web body
<_PlatformProcessedMarker close="true" />`,
    );

    mockedGetPage.mockImplementation((slugs, locale) => {
      if (locale === 'zh-CN') {
        return undefined;
      }

      return slugs.join('/') === 'introduction/about-agora' ? page : undefined;
    });
    mockedGetPages.mockReturnValue([page]);

    const canonicalPayload = await loadDocsPagePayload('en', 'introduction', [
      'about-agora',
    ]);

    expect(canonicalPayload).toMatchObject({
      body: {
        kind: 'mdx',
        platformTabs: {
          canonicalPlatform: 'web',
          defaultPlatform: 'android',
          platforms: '["windows","android","web"]',
        },
      },
      markdownUrl: '/en/introduction/about-agora/android.md',
      toc: [
        {
          depth: 2,
          title: 'Shared intro',
          url: '#shared-intro',
        },
        {
          depth: 2,
          title: 'Android setup',
          url: '#android-setup',
        },
      ],
    });
    expect(unwrapPayload(canonicalPayload).toc).not.toContainEqual(
      expect.objectContaining({ title: 'Windows setup' }),
    );

    const windowsPayload = await loadDocsPagePayload('en', 'introduction', [
      'about-agora',
      'windows',
    ]);

    expect(windowsPayload).toMatchObject({
      activePath: '/en/introduction/about-agora',
      body: {
        kind: 'mdx',
        platformTabs: {
          canonicalPlatform: 'web',
          defaultPlatform: 'android',
          initialPlatform: 'windows',
          platforms: '["windows","android","web"]',
        },
      },
      markdownUrl: '/en/introduction/about-agora/windows.md',
      toc: [
        {
          depth: 2,
          title: 'Shared intro',
          url: '#shared-intro',
        },
        {
          depth: 2,
          title: 'Windows setup',
          url: '#windows-setup',
        },
      ],
    });
  });

  it('resolves a trailing platform URL segment to the canonical docs page', async () => {
    const page = createPage();

    const docsPage = page as PageWithSource & {
      data: { getText: (kind: 'processed') => Promise<string> };
    };

    docsPage.data.getText = vi.fn(
      async () => `## Shared intro

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
## Android setup
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
## Web setup
Web body
<_PlatformProcessedMarker close="true" />`,
    );

    mockedGetPage.mockImplementation((slugs, locale) => {
      if (locale === 'zh-CN') {
        return undefined;
      }

      return slugs.join('/') === 'introduction/about-agora' ? page : undefined;
    });

    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora', 'android']),
    ).resolves.toMatchObject({
      activePath: '/en/introduction/about-agora',
      body: {
        kind: 'mdx',
        platformTabs: {
          canonicalPlatform: 'web',
          defaultPlatform: 'android',
          initialPlatform: 'android',
          platforms: '["android","web"]',
        },
      },
      markdownUrl: '/en/introduction/about-agora/android.md',
      toc: [
        {
          depth: 2,
          title: 'Shared intro',
          url: '#shared-intro',
        },
        {
          depth: 2,
          title: 'Android setup',
          url: '#android-setup',
        },
      ],
    });
  });

  it('resolves platform alias URL segments to their canonical platform tabs', async () => {
    const page = createPage();

    const docsPage = page as PageWithSource & {
      data: { getText: (kind: 'processed') => Promise<string> };
    };

    docsPage.data.getText = vi.fn(
      async () => `## Shared intro

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="javascript" platform="javascript" />
## React setup
React body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="javascript" platform="web" />
## Web setup
Web body
<_PlatformProcessedMarker close="true" />`,
    );

    mockedGetPage.mockImplementation((slugs, locale) => {
      if (locale === 'zh-CN') {
        return undefined;
      }

      return slugs.join('/') === 'introduction/about-agora' ? page : undefined;
    });

    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora', 'react-js']),
    ).resolves.toMatchObject({
      activePath: '/en/introduction/about-agora',
      body: {
        kind: 'mdx',
        platformTabs: {
          canonicalPlatform: 'javascript',
          defaultPlatform: 'javascript',
          initialPlatform: 'javascript',
          platforms: '["javascript","web"]',
        },
      },
      markdownUrl: '/en/introduction/about-agora/javascript.md',
      toc: [
        {
          depth: 2,
          title: 'Shared intro',
          url: '#shared-intro',
        },
        {
          depth: 2,
          title: 'React setup',
          url: '#react-setup',
        },
      ],
    });
  });

  it('keeps the selected platform route but marks opted-out pages to hide platform labels', async () => {
    const page = {
      ...createPage(),
      data: {
        ...createPage().data,
        hidePlatformTabs: true,
      },
    };

    const docsPage = page as PageWithSource & {
      data: { getText: (kind: 'processed') => Promise<string> };
    };

    docsPage.data.getText = vi.fn(
      async () => `## Shared intro

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
## Android setup
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
## Web setup
Web body
<_PlatformProcessedMarker close="true" />`,
    );

    mockedGetPage.mockImplementation((slugs, locale) => {
      if (locale === 'zh-CN') {
        return undefined;
      }

      return slugs.join('/') === 'introduction/about-agora' ? page : undefined;
    });

    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora', 'android']),
    ).resolves.toMatchObject({
      activePath: '/en/introduction/about-agora',
      body: {
        hidePlatformTabs: true,
        kind: 'mdx',
        platformTabs: {
          canonicalPlatform: 'web',
          initialPlatform: 'android',
          platforms: '["android","web"]',
        },
      },
    });
  });

  it('builds split-file platform group body payloads and hides panel pages', async () => {
    const parentPage = createPlatformGroupPage();
    const iosPage = createPlatformPanelPage('ios');
    const androidPage = createPlatformPanelPage('android');

    mockedGetPage.mockImplementation((slugs, locale) => {
      if (locale === 'zh-CN') {
        return undefined;
      }

      if (slugs.join('/') === 'ai/get-started/platform-split') {
        return parentPage;
      }

      return undefined;
    });
    mockedGetPages.mockReturnValue([parentPage, iosPage, androidPage]);
    mockedGetPageTree.mockReturnValue(platformGroupPageTree);

    const payload = await loadDocsPagePayload('en', 'ai', [
      'get-started',
      'platform-split',
    ]);

    expect(payload).toMatchObject({
      body: {
        canonicalPlatform: 'ios',
        contentPath: 'en/ai/get-started/platform-split/index.mdx',
        kind: 'platform-group',
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
        platformTabs: {
          canonicalPlatform: 'ios',
          defaultPlatform: 'ios',
          initialPlatform: undefined,
          platforms: '["ios","android"]',
        },
        platforms: ['ios', 'android'],
      },
      navigation: {
        next: undefined,
        previous: undefined,
      },
    });
    expect(
      flattenSidebarPageUrls(unwrapPayload(payload).sidebar),
    ).not.toContain('/en/ai/get-started/platform-split/ios');
  });

  it('resolves split-file platform panel routes with the selected platform active', async () => {
    const parentPage = createPlatformGroupPage();
    const iosPage = createPlatformPanelPage('ios');

    mockedGetPage.mockImplementation((slugs) =>
      slugs.includes('ios') ? iosPage : parentPage,
    );
    mockedGetPages.mockReturnValue([parentPage, iosPage]);
    mockedGetPageTree.mockReturnValue(pageTree);

    const payload = await loadDocsPagePayload('en', 'ai', [
      'get-started',
      'platform-split',
      'ios',
    ]);

    expect(payload).toMatchObject({
      activePath: '/en/ai/get-started/platform-split',
      body: {
        contentPath: 'en/ai/get-started/platform-split/index.mdx',
        kind: 'platform-group',
        platformTabs: {
          initialPlatform: 'ios',
        },
      },
      markdownUrl: '/en/ai/get-started/platform-split/ios.md',
    });
  });

  it('returns OpenAPI content inside the existing docs shell payload from the merged source', async () => {
    mockedGetPage.mockImplementation((_slugs, locale) =>
      locale === 'zh-CN' ? createZhOpenApiPage() : createOpenApiPage(),
    );
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'conversational-ai',
      'join',
    ]);

    expect(payload).toMatchObject({
      activePath: '/en/api-reference/api-ref/conversational-ai/join',
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
      contentPath: 'en/api-reference/api-ref/conversational-ai/join.mdx',
      layoutMode: 'openapi',
      localeLinks: [
        {
          href: '/en/api-reference/api-ref/conversational-ai/join',
          isActive: true,
          locale: 'en',
        },
      ],
      markdownUrl: '/en/api-reference/api-ref/conversational-ai/join.md',
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
    expect(resolveDocsLastUpdatedMetadataMock).toHaveBeenCalledWith([
      'content/docs/en/api-reference/api-ref/conversational-ai/join.mdx',
      'content/openapi/conversational-ai/rest-api.en.yaml',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected an OpenAPI docs page payload');
    }

    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference',
        '/en/api-reference/api-ref/conversational-ai',
        '/en/api-reference/api-ref/conversational-ai/authentication',
        '/en/api-reference/api-ref/conversational-ai/join',
      ]),
    );
    expect(
      findSidebarPage(
        payload.sidebar,
        '/en/api-reference/api-ref/conversational-ai/join',
      ),
    ).toMatchObject({
      method: 'POST',
      title: 'Start a conversational AI agent',
    });
    expect(
      flattenSidebarPageUrls(payload.sidebar).filter(
        (url) => url === '/en/api-reference/api-ref/conversational-ai/join',
      ),
    ).toHaveLength(1);
    expect(payload.navigation).toEqual({
      next: {
        title: 'Stop a conversational AI agent',
        url: '/en/api-reference/api-ref/conversational-ai/leave',
      },
      previous: undefined,
    });
  });

  it('removes category icons from scoped Chat Reference sidebars', async () => {
    const page = createPage();
    const chatPage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath:
            '/virtual/content/docs/en/api-reference/api-ref/im/index.mdx',
          path: 'en/api-reference/api-ref/im/index.mdx',
        },
        title: 'Chat',
      },
      path: 'en/api-reference/api-ref/im/index.mdx',
      slugs: ['en', 'api-reference', 'api-ref', 'im', 'index'],
      url: '/en/api-reference/api-ref/im',
    };

    mockedGetPage.mockReturnValue(chatPage);
    mockedGetPages.mockReturnValue([chatPage]);
    mockedGetPageTree.mockReturnValue(createChatApiReferencePageTree());
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'api-reference-api-ref-im-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Chat',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'im',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    const sidebarSections = flattenSidebarSections(payload.sidebar);
    const categoryTitles = [
      'Understand the server-side model',
      'Manage messaging and users',
      'Manage groups, rooms, and threads',
    ];

    for (const title of categoryTitles) {
      const section = sidebarSections.find((node) => node.title === title);

      expect(section).toBeDefined();
      expect(section).not.toHaveProperty('icon');
    }
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference/api-ref/im',
        '/en/api-reference/api-ref/im/message-management',
        '/en/api-reference/api-ref/im/chat-group-management',
      ]),
    );
  });

  it('keeps static pages inside OpenAPI lanes on the same wide layout as generated operations', async () => {
    const staticPage = createOpenApiStaticPage();

    mockedGetPage.mockReturnValue(staticPage);
    mockedGetPages.mockReturnValue([staticPage]);
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'cloud-recording',
      'authentication',
    ]);

    expect(payload).toMatchObject({
      activePath: '/en/api-reference/api-ref/cloud-recording/authentication',
      activeTab: 'api-reference',
      body: {
        kind: 'mdx',
      },
      layoutMode: 'openapi',
      title: 'RESTful authentication',
    });
  });

  it('redirects legacy Conversational AI REST endpoint URLs to the OpenAPI lane', async () => {
    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'conversational-ai',
        'rest-api',
        'agent',
        'join',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/conversational-ai/join',
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'api-reference', [
        'conversational-ai',
        'rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/api-reference/api-ref/conversational-ai',
    });
  });

  it('includes OpenAPI endpoint sidebar items on the real MDX parent page', async () => {
    const overviewPage = {
      ...createPage(),
      data: {
        ...createPage().data,
        info: {
          fullPath:
            '/virtual/content/docs/en/api-reference/api-ref/conversational-ai/index.mdx',
          path: 'en/api-reference/api-ref/conversational-ai/index.mdx',
        },
        title: 'Overview',
      },
      path: 'en/api-reference/api-ref/conversational-ai/index.mdx',
      slugs: ['en', 'api-reference', 'api-ref', 'conversational-ai', 'index'],
      url: '/en/api-reference/api-ref/conversational-ai',
    };

    mockedGetPage.mockReturnValue(overviewPage);
    mockedGetPages.mockReturnValue([overviewPage]);
    mockedGetPageTree.mockReturnValue(apiReferencePageTree);

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'conversational-ai',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload).toMatchObject({
      activePath: '/en/api-reference/api-ref/conversational-ai',
      body: {
        kind: 'mdx',
      },
      title: 'Overview',
    });
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual(
      expect.arrayContaining([
        '/en/api-reference/api-ref/conversational-ai',
        '/en/api-reference/api-ref/conversational-ai/join',
      ]),
    );
    expect(
      findSidebarPage(
        payload.sidebar,
        '/en/api-reference/api-ref/conversational-ai/join',
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
          fullPath:
            '/virtual/content/docs/en/api-reference/api-ref/rtc/index.md',
          path: 'en/api-reference/api-ref/rtc/index.md',
        },
        title: 'RTC API Reference',
      },
      path: 'en/api-reference/api-ref/rtc/index.md',
      slugs: ['en', 'api-reference', 'api-ref', 'rtc', 'index'],
      url: '/en/api-reference/api-ref/rtc',
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

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'rtc',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebarHeader).toEqual({
      backHref: '/en/api-reference',
      backLabel: 'API Reference',
      title: 'RTC',
    });
    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual([
      '/en/api-reference/api-ref/rtc',
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

  it('propagates hidePlatformTabs into mdx body payloads for opted-out pages', async () => {
    const page = {
      ...createPage(),
      data: {
        ...createPage().data,
        hidePlatformTabs: true,
      },
    };

    mockedGetPage.mockImplementation((_slugs, locale) =>
      locale === 'zh-CN' ? undefined : page,
    );
    mockedGetPages.mockReturnValue([page]);

    await expect(
      loadDocsPagePayload('en', 'introduction', ['about-agora']),
    ).resolves.toMatchObject({
      body: {
        hidePlatformTabs: true,
        kind: 'mdx',
      },
    });
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
        'realtime-media/rtc/quick-start/android/integrate-with-ai-tools'
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

  it('redirects the legacy video quickstart path to the get-started-sdk path', async () => {
    mockPagesByRequestedSlugs();

    await expect(
      loadDocsPagePayload('en', 'realtime-media', ['video', 'quickstart']),
    ).resolves.toEqual({
      redirectUrl: '/en/realtime-media/video/get-started-sdk',
    });
  });

  it('does not expose locale links outside the deployment region', async () => {
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
      ],
    });
  });

  it('redirects migrated legacy best-practices pages to their new product paths', async () => {
    await expect(
      loadDocsPagePayload('zh-CN', 'best-practices', ['http-basic-auth']),
    ).resolves.toEqual({
      redirectUrl:
        '/zh-CN/api-reference/api-ref/conversational-ai/authentication',
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'best-practices', ['release-notes']),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/ai/release-notes',
    });
  });

  it('redirects merged platform suffix pages to the canonical page with platform selection', async () => {
    mockedGetPage.mockImplementation((slugs: string[], locale = 'en') => {
      if (
        locale === 'zh-CN' &&
        slugs.join('/') ===
          'api-reference/conversational-ai/client-toolkit/overview'
      ) {
        return {
          ...createPage(),
          path: 'zh-CN/api-reference/conversational-ai/client-toolkit/overview.mdx',
          slugs: [
            'zh-CN',
            'api-reference',
            'conversational-ai',
            'client-toolkit',
            'overview',
          ],
          url: '/zh-CN/api-reference/conversational-ai/client-toolkit/overview',
        };
      }

      return undefined;
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'api-reference', [
        'conversational-ai',
        'client-toolkit',
        'overview.go',
      ]),
    ).resolves.toEqual({
      preserveSearch: false,
      redirectUrl:
        '/zh-CN/api-reference/conversational-ai/client-toolkit/overview?platform=go',
    });
  });

  it('redirects legacy docs.agora.io sitemap URLs to article-level targets when available', async () => {
    await expect(
      loadDocsPagePayload(
        'en',
        'video-calling',
        ['get-started', 'get-started-sdk'],
        '?platform=android',
      ),
    ).resolves.toEqual({
      preserveSearch: true,
      redirectUrl: '/en/realtime-media/video/get-started-sdk',
    });

    await expect(
      loadDocsPagePayload(
        'en',
        'agora-chat',
        ['client-api', 'messages', 'send-receive-messages'],
        '?platform=android',
      ),
    ).resolves.toEqual({
      preserveSearch: true,
      redirectUrl:
        '/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages',
    });

    await expect(
      loadDocsPagePayload('en', 'convo-ai-device-kit', [
        'overview',
        'product-overview',
      ]),
    ).resolves.toEqual({
      preserveSearch: true,
      redirectUrl: '/en/ai/device-kit',
    });
  });

  it('redirects legacy sitemap URLs with platform query to platform-specific targets', async () => {
    await expect(
      loadDocsPagePayload(
        'en',
        'broadcast-streaming',
        ['overview', 'release-notes'],
        '?platform=ios',
      ),
    ).resolves.toEqual({
      preserveSearch: false,
      redirectUrl:
        '/en/realtime-media/broadcast-streaming/reference/release-notes/ios',
    });

    await expect(
      loadDocsPagePayload(
        'en',
        'broadcast-streaming',
        ['overview', 'release-notes'],
        '?platform=react-js',
      ),
    ).resolves.toEqual({
      preserveSearch: false,
      redirectUrl:
        '/en/realtime-media/broadcast-streaming/reference/release-notes/javascript',
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

  it('redirects legacy Conversational AI client toolkit URLs to the API reference lane', async () => {
    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'conversational-ai',
        'client-toolkit',
        'android',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/conversational-ai/client-toolkit/android',
    });

    await expect(
      loadDocsPagePayload('en', 'conversational-ai', [
        'reference',
        'toolkot',
        'android',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/conversational-ai/client-toolkit/android',
    });
  });

  it('redirects the legacy SDKs tab to the API Reference SDKs page', async () => {
    await expect(loadDocsTabIndex('en', 'sdks')).resolves.toEqual({
      locale: 'en',
      tab: 'sdks',
      url: '/en/api-reference/sdks',
    });
  });

  it('keeps Recipes visible in the API Reference root sidebar while hiding the legacy alias', async () => {
    const page = createPage();
    mockedGetPage.mockReturnValue({
      ...page,
      path: 'en/api-reference/index.mdx',
      slugs: ['en', 'api-reference', 'index'],
      url: '/en/api-reference',
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/index.mdx',
          path: 'en/api-reference/index.mdx',
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
        '/en/api-reference/api-ref/conversational-ai',
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

  it('renders the catalog page without the legacy "RESTful API" grouping when the api-ref folder is hidden', async () => {
    const page = createPage();
    mockedGetPage.mockReturnValue({
      ...page,
      path: 'en/api-reference/api-ref/index.mdx',
      slugs: ['en', 'api-reference', 'api-ref', 'index'],
      url: '/en/api-reference/api-ref',
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/api-ref/index.mdx',
          path: 'en/api-reference/api-ref/index.mdx',
        },
        title: 'API reference',
      },
    });
    mockedGetPageTree.mockReturnValue(createApiReferenceOverviewPageTree());
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'api-reference-api-ref-folder'
        ? ({
            data: {
              sidebarHidden: true,
              sidebarIndexTitle: 'Overview',
              title: 'API Reference',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    // The legacy "All SDK versions"/"RESTful API" grouping is gone: nothing
    // wraps the lanes under a synthesized "RESTful API" section anymore.
    expect(
      payload.sidebar.find((node) => node.title === 'RESTful API'),
    ).toBeUndefined();
    expect(
      payload.sidebar.find(
        (node) =>
          node.type === 'section' && node.id === 'api-reference-restful-api',
      ),
    ).toBeUndefined();
  });

  it('redirects moved Realtime Media API reference pages to the API Reference tab', async () => {
    await expect(
      loadDocsPagePayload('en', 'api-reference', ['api-ref', 'video']),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/rtc',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'solutions-agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'analytics-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'analytics-restful-authentication',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/agora-analytics/analytics-restful-authentication',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'classroom-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'broadcast-streaming',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'video',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'voice',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'broadcast-streaming',
        'reference',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'video',
        'reference',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'voice',
        'reference',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'broadcast-streaming',
        'reference',
        'restful-api',
        'stream-management',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/broadcast-streaming/stream-management',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'video',
        'reference',
        'api-sunset',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/rtc',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'im',
        'reference',
        'server-api',
        'chatroom-management',
        'manage-chatrooms',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/im/chatroom-management/manage-chatrooms',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'rtm',
        'reference',
        'rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/signaling',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'whiteboard',
        'reference',
        'uikit-sdk',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/uikit-sdk',
    });
  });

  it('redirects moved Solutions API reference pages to the API reference', async () => {
    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'agora-analytics',
        'reference',
        'api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'agora-analytics',
        'reference',
        'restful-authentication',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/agora-analytics/analytics-restful-authentication',
    });

    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'flexible-classroom',
        'reference',
        'restful-authentication',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'interactive-live-streaming',
        'reference',
        'agora-console-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'flexible-classroom',
        'reference',
        'classroom-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    });

    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'iot',
        'reference',
        'restful-authentication',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/rtc/authentication',
    });

    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'iot',
        'reference',
        'channel-management-rest-api',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/iot-channel-management-rest-api',
    });
  });

  it('redirects the legacy Solutions root to the Realtime Media overview', async () => {
    await expect(loadDocsPagePayload('en', 'solutions', [])).resolves.toEqual({
      preserveSearch: true,
      redirectUrl: '/en/realtime-media/overview',
    });
  });

  it('redirects legacy Solutions product routes to realtime-media', async () => {
    await expect(
      loadDocsPagePayload('en', 'solutions', [
        'interactive-live-streaming',
        'quickstart',
      ]),
    ).resolves.toEqual({
      preserveSearch: true,
      redirectUrl: '/en/realtime-media/interactive-live-streaming/quickstart',
    });
  });

  it('redirects legacy standalone REST reference pages to canonical targets', async () => {
    await expect(
      loadDocsPagePayload('en', 'interactive-whiteboard', [
        'develop',
        'generate-token-rest',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/realtime-media/whiteboard/build/generate-token-rest',
    });

    await expect(
      loadDocsPagePayload('en', 'media-gateway', [
        'reference',
        'restful-authentication',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/rtmp-gateway/authentication',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'rtmp-gateway',
        'reference',
        'restful-authentication',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/api-reference/api-ref/rtmp-gateway/authentication',
    });
  });

  it('redirects the Chinese Whiteboard RESTful product root to its API overview', async () => {
    await expect(
      loadDocsPagePayload('zh-CN', 'api-reference', [
        'api-ref',
        'whiteboard',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/api-reference/api-ref/whiteboard/restful',
    });
  });

  it('adds a linked API Reference entry to Realtime Media product sidebars', async () => {
    const page = createPage();
    const broadcastPage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath:
            '/virtual/content/docs/en/realtime-media/broadcast-streaming/index.mdx',
          path: 'en/realtime-media/broadcast-streaming/index.mdx',
        },
        title: 'Broadcast Streaming',
      },
      path: 'en/realtime-media/broadcast-streaming/index.mdx',
      slugs: ['en', 'realtime-media', 'broadcast-streaming', 'index'],
      url: '/en/realtime-media/broadcast-streaming',
    };

    mockedGetPage.mockReturnValue(broadcastPage);
    mockedGetPages.mockReturnValue([broadcastPage]);
    mockedGetPageTree.mockReturnValue(
      createRealtimeMediaApiReferenceJumpPageTree(),
    );
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-broadcast-streaming-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Broadcast Streaming',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = await loadDocsPagePayload('en', 'realtime-media', [
      'broadcast-streaming',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a docs page payload');
    }

    expect(payload.sidebar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          children: expect.arrayContaining([
            {
              id: '/en/api-reference/api-ref/rtc',
              linked: true,
              title: 'RESTful API',
              type: 'page',
              url: '/en/api-reference/api-ref/rtc',
            },
          ]),
          title: 'Reference',
          type: 'section',
        }),
      ]),
    );
    expect(flattenSidebarPageUrls(payload.sidebar)).not.toContain(
      '/en/api-reference/api-ref/broadcast-streaming',
    );

    const videoPage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/realtime-media/video/index.mdx',
          path: 'en/realtime-media/video/index.mdx',
        },
        title: 'Video Calling',
      },
      path: 'en/realtime-media/video/index.mdx',
      slugs: ['en', 'realtime-media', 'video', 'index'],
      url: '/en/realtime-media/video',
    };

    mockedGetPage.mockReturnValue(videoPage);
    mockedGetPages.mockReturnValue([videoPage]);
    mockedGetPageTree.mockReturnValue(
      createRealtimeMediaApiReferenceJumpPageTree(),
    );
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-video-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Video Calling',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const videoPayload = await loadDocsPagePayload('en', 'realtime-media', [
      'video',
    ]);

    if (!videoPayload || 'redirectUrl' in videoPayload) {
      throw new Error('expected a docs page payload');
    }

    expect(videoPayload.sidebar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          children: expect.arrayContaining([
            {
              id: '/en/api-reference/api-ref/rtc',
              linked: true,
              title: 'RESTful API',
              type: 'page',
              url: '/en/api-reference/api-ref/rtc',
            },
          ]),
          title: 'Reference',
          type: 'section',
        }),
      ]),
    );
    expect(flattenSidebarPageUrls(videoPayload.sidebar)).not.toContain(
      '/en/api-reference/api-ref/video',
    );

    const rtmPage = {
      ...page,
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/realtime-media/rtm/index.mdx',
          path: 'en/realtime-media/rtm/index.mdx',
        },
        title: 'Signaling',
      },
      path: 'en/realtime-media/rtm/index.mdx',
      slugs: ['en', 'realtime-media', 'rtm', 'index'],
      url: '/en/realtime-media/rtm',
    };

    mockedGetPage.mockReturnValue(rtmPage);
    mockedGetPages.mockReturnValue([rtmPage]);
    mockedGetPageTree.mockReturnValue(
      createRealtimeMediaApiReferenceJumpPageTree(),
    );
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-rtm-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Signaling',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const rtmPayload = unwrapPayload(
      await loadDocsPagePayload('en', 'realtime-media', ['rtm']),
    );

    expect(rtmPayload.sidebar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          children: expect.arrayContaining([
            {
              id: '/en/api-reference/api-ref/signaling',
              linked: true,
              title: 'Signaling REST API',
              type: 'page',
              url: '/en/api-reference/api-ref/signaling',
            },
          ]),
          title: 'Reference',
          type: 'section',
        }),
      ]),
    );
    expect(flattenSidebarPageUrls(rtmPayload.sidebar)).not.toContain(
      '/en/realtime-media/rtm/reference/rest-api',
    );
  });

  it('removes deleted source-backed API directory indexes from scoped Chinese RESTful navigation', async () => {
    const basePage = createPage();
    const publishPage = {
      ...basePage,
      data: {
        ...basePage.data,
        info: {
          fullPath:
            '/virtual/content/docs/zh-CN/api-reference/api-ref/signaling/publish.mdx',
          path: 'zh-CN/api-reference/api-ref/signaling/publish.mdx',
        },
        title: '发送消息',
      },
      path: 'zh-CN/api-reference/api-ref/signaling/publish.mdx',
      slugs: ['zh-CN', 'api-reference', 'api-ref', 'signaling', 'publish'],
      url: '/zh-CN/api-reference/api-ref/signaling/publish',
    } as unknown as PageWithSource;
    const receivePage = {
      ...publishPage,
      data: {
        ...publishPage.data,
        title: '接收历史消息',
      },
      path: 'zh-CN/api-reference/api-ref/signaling/receive.mdx',
      slugs: ['zh-CN', 'api-reference', 'api-ref', 'signaling', 'receive'],
      url: '/zh-CN/api-reference/api-ref/signaling/receive',
    } as unknown as PageWithSource;
    const zhCnApiReferenceTree: Root = {
      children: [
        {
          $id: 'zh-cn-root',
          children: [
            {
              $id: 'api-reference-folder',
              children: [
                {
                  $id: 'api-reference-api-ref-folder',
                  children: [
                    {
                      $id: 'api-reference-api-ref-signaling-folder',
                      children: [
                        {
                          $id: 'api-reference-api-ref-signaling-publish',
                          name: '发送消息',
                          type: 'page',
                          url: publishPage.url,
                        },
                        {
                          $id: 'api-reference-api-ref-signaling-receive',
                          name: '接收历史消息',
                          type: 'page',
                          url: receivePage.url,
                        },
                      ],
                      index: {
                        $id: 'api-reference-api-ref-signaling-index',
                        name: 'Signaling Overview',
                        type: 'page',
                        url: '/zh-CN/api-reference/api-ref/signaling',
                      },
                      name: '实时消息 RTM',
                      type: 'folder',
                    },
                  ],
                  name: 'API',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'api-reference-overview',
                name: '参考概览',
                type: 'page',
                url: '/zh-CN/api-reference/overview',
              },
              name: '参考中心',
              root: true,
              type: 'folder',
            },
          ],
          name: '简体中文',
          type: 'folder',
        },
      ],
      name: 'Docs',
    };
    const pages = [publishPage, receivePage];

    mockedGetPage.mockImplementation((slugs: string[], locale = 'en') => {
      if (locale !== 'zh-CN') {
        return undefined;
      }

      const url = `/zh-CN/${slugs.join('/')}`;
      return pages.find((page) => page.url === url);
    });
    mockedGetPages.mockReturnValue(pages);
    mockedGetPageTree.mockReturnValue(zhCnApiReferenceTree);
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'api-reference-api-ref-signaling-folder'
        ? ({
            data: {
              navScope: {},
              title: '实时消息 RTM',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const payload = unwrapPayload(
      await loadDocsPagePayload('zh-CN', 'api-reference', [
        'api-ref',
        'signaling',
        'publish',
      ]),
    );

    expect(flattenSidebarPageUrls(payload.sidebar)).toEqual([
      publishPage.url,
      receivePage.url,
    ]);
    expect(payload.navigation.previous).toBeUndefined();
    expect(payload.navigation.next).toEqual({
      title: '接收历史消息',
      url: receivePage.url,
    });
  });

  it('uses the get-started-sdk page as the video quickstart sidebar entry', async () => {
    const basePage = createPage();
    const videoPage = {
      ...basePage,
      data: {
        ...basePage.data,
        info: {
          fullPath:
            '/virtual/content/docs/en/realtime-media/video/get-started-sdk.mdx',
          path: 'en/realtime-media/video/get-started-sdk.mdx',
        },
        title: 'Quickstart',
      },
      path: 'en/realtime-media/video/get-started-sdk.mdx',
      slugs: ['en', 'realtime-media', 'video', 'get-started-sdk'],
      url: '/en/realtime-media/video/get-started-sdk',
    };

    mockedGetPage.mockReturnValue(videoPage);
    mockedGetPages.mockReturnValue([videoPage]);
    mockedGetPageTree.mockReturnValue(
      createRealtimeMediaApiReferenceJumpPageTree(),
    );
    mockedGetNodeMeta.mockImplementation((node) =>
      node.$id === 'realtime-media-video-folder'
        ? ({
            data: {
              navScope: {},
              title: 'Video Calling',
            },
          } as unknown as ReturnType<typeof source.getNodeMeta>)
        : undefined,
    );

    const videoPayload = unwrapPayload(
      await loadDocsPagePayload('en', 'realtime-media', ['video']),
    );

    expect(flattenSidebarPageUrls(videoPayload.sidebar)).toContain(
      '/en/realtime-media/video/get-started-sdk',
    );
    expect(flattenSidebarPageUrls(videoPayload.sidebar)).not.toContain(
      '/en/realtime-media/video/quickstart',
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

    await expect(loadDocsPagePayload('en', 'ai', ['pricing'])).resolves.toEqual(
      {
        redirectUrl: '/en/ai/reference/pricing',
      },
    );

    await expect(
      loadDocsPagePayload('en', 'ai', ['best-practices', 'filler-words']),
    ).resolves.toEqual({
      redirectUrl: '/en/ai/build/filler-words',
    });
  });

  it('redirects moved zh-CN pages to their new product tabs', async () => {
    await expect(
      loadDocsPagePayload('zh-CN', 'introduction', ['usage-analytics']),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/realtime-media/usage-analytics',
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'introduction', [
        'usage-analytics',
        'rtc',
        'monitor',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/realtime-media/usage-analytics/build/rtc/monitor',
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'introduction', ['ppt-transcoding']),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/solutions/ppt-transcoding',
    });

    await expect(
      loadDocsPagePayload('zh-CN', 'introduction', [
        'ppt-transcoding',
        'get-started',
        'quick-start',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/solutions/ppt-transcoding/get-started/quick-start',
    });
  });

  it('redirects moved Reference pages to their new product paths', async () => {
    mockPagesByRequestedSlugs();

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'cloud-recording',
        'pricing-webpage-recording',
      ]),
    ).resolves.toEqual({
      redirectUrl:
        '/en/realtime-media/cloud-recording/reference/pricing-webpage-recording',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', ['whiteboard', 'overview']),
    ).resolves.toEqual({
      redirectUrl: '/en/realtime-media/whiteboard',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'whiteboard',
        'overview',
        'core-concepts',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/realtime-media/whiteboard',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'whiteboard',
        'overview',
        'pricing',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/realtime-media/whiteboard/reference/pricing',
    });

    await expect(
      loadDocsPagePayload('en', 'realtime-media', [
        'whiteboard',
        'overview',
        'whiteboard-fastboard',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/en/realtime-media/whiteboard/whiteboard-fastboard',
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
                      $id: 'ai-reference-ten-agent',
                      children: [
                        {
                          $id: 'ai-reference-ten-agent-create-asr-extension',
                          name: 'Contribute an ASR extension',
                          type: 'page',
                          url: '/en/ai/reference/ten-agent/create-asr-extension',
                        },
                        {
                          $id: 'ai-reference-ten-agent-create-tts-extension',
                          name: 'Contribute a TTS extension',
                          type: 'page',
                          url: '/en/ai/reference/ten-agent/create-tts-extension',
                        },
                      ],
                      name: 'Contribute an ASR/TTS extension',
                      type: 'folder',
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
                      $id: 'device-kit-release-notes',
                      name: 'Release notes',
                      type: 'page',
                      url: '/en/ai/device-kit/reference/release-notes',
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
                name: 'Voice Agent overview',
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
        '/en/api-reference/api-ref/server-sdk/typescript',
        '/en/ai/reference/event-types',
        '/en/ai/reference/ten-agent/create-asr-extension',
        '/en/ai/reference/ten-agent/create-tts-extension',
        '/en/ai/reference/release-notes',
        '/en/ai/reference/pricing',
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
        '/en/ai/create_asr_extension',
        '/en/ai/create_tts_extension',
        '/en/ai/reference/ten-agent/build-dependencies',
        '/en/ai/reference/ten-agent/package-and-runtime-architecture',
        '/en/ai/reference/ten-agent/debug-ten-applications',
        '/en/ai/reference/ten-agent/test-ten-extensions-and-apps',
      ]),
    );
    expect(payload.sidebar.map((node) => node.title)).toEqual([
      'Voice Agent overview',
      'Voice agent in apps',
      'Voice agent on dedicated devices',
    ]);

    const softwareSection = payload.sidebar.find(
      (node) => node.type === 'section' && node.title === 'Voice agent in apps',
    );

    if (!softwareSection || softwareSection.type !== 'section') {
      throw new Error('expected the apps section');
    }

    expect(softwareSection.children.slice(0, 2)).toMatchObject([
      {
        type: 'page',
        url: '/en/ai/reference/release-notes',
      },
      {
        type: 'page',
        url: '/en/ai/get-started/quickstart',
      },
    ]);
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
    expect(
      softwareReferenceSection.children.some(
        (node) =>
          node.type === 'page' && node.url === '/en/ai/reference/release-notes',
      ),
    ).toBe(false);

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

    expect(dedicatedDevicesSection.children.slice(0, 2)).toMatchObject([
      {
        type: 'page',
        url: '/en/ai/device-kit/reference/release-notes',
      },
      {
        type: 'section',
        title: 'Build',
      },
    ]);
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
    ).toBe(false);
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
    ).toBe(false);
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
      dedicatedDevicesSection.children.some(
        (node) =>
          node.type === 'section' &&
          node.title === 'Contribute an ASR/TTS extension',
      ),
    ).toBe(false);
    expect(
      softwareReferenceSection.children.some(
        (node) =>
          node.type === 'page' && node.url === '/en/ai/reference/event-types',
      ),
    ).toBe(true);
    const tenAgentSection = softwareReferenceSection.children.find(
      (node) =>
        node.type === 'section' &&
        node.title === 'Contribute an ASR/TTS extension',
    );

    if (!tenAgentSection || tenAgentSection.type !== 'section') {
      throw new Error('expected Contribute an ASR/TTS extension section');
    }

    expect(
      tenAgentSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/reference/ten-agent/create-asr-extension',
      ),
    ).toBe(true);
    expect(
      tenAgentSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/reference/ten-agent/create-tts-extension',
      ),
    ).toBe(true);
    expect(
      tenAgentSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/reference/ten-agent/build-dependencies',
      ),
    ).toBe(false);
    expect(
      tenAgentSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url ===
            '/en/ai/reference/ten-agent/package-and-runtime-architecture',
      ),
    ).toBe(false);
    expect(
      tenAgentSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url === '/en/ai/reference/ten-agent/debug-ten-applications',
      ),
    ).toBe(false);
    expect(
      tenAgentSection.children.some(
        (node) =>
          node.type === 'page' &&
          node.url ===
            '/en/ai/reference/ten-agent/test-ten-extensions-and-apps',
      ),
    ).toBe(false);
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
        title: 'Voice Agent overview',
        type: 'page',
        url: '/en/ai',
      }),
    );
  });

  it('returns a scoped Recipes sidebar with a Back to Reference header', async () => {
    const page = createPage();
    const recipesPageTree: Root = {
      ...apiReferencePageTree,
      children: apiReferencePageTree.children.map((localeNode) =>
        localeNode.type === 'folder' && localeNode.$id === 'en-root'
          ? {
              ...localeNode,
              children: localeNode.children.map((tabNode) =>
                tabNode.type === 'folder' &&
                tabNode.$id === 'api-reference-folder'
                  ? {
                      ...tabNode,
                      children: tabNode.children.map((node) =>
                        node.$id === 'api-reference-recipes-folder' &&
                        node.type === 'folder'
                          ? {
                              ...node,
                              children: node.children.map((child) => {
                                if (
                                  child.$id ===
                                    'api-reference-recipes-quickstarts-separator' &&
                                  child.type === 'separator'
                                ) {
                                  return {
                                    ...child,
                                    name: 'Content Quickstarts',
                                  };
                                }

                                if (
                                  child.$id ===
                                    'api-reference-recipes-integration-separator' &&
                                  child.type === 'separator'
                                ) {
                                  return {
                                    ...child,
                                    name: 'Content Integration Patterns',
                                  };
                                }

                                if (
                                  child.$id ===
                                    'api-reference-recipes-use-cases-separator' &&
                                  child.type === 'separator'
                                ) {
                                  return {
                                    ...child,
                                    name: 'Content Use Cases',
                                  };
                                }

                                return child;
                              }),
                            }
                          : node,
                      ),
                    }
                  : tabNode,
              ),
            }
          : localeNode,
      ),
    };
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
        hideToc: true,
        title: 'Recipes',
      },
    });
    mockedGetPageTree.mockReturnValue(recipesPageTree);
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
    expect(payload.layoutMode).toBe('docs');
    expect(payload.hideToc).toBe(true);
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
        '/en/api-reference/api-ref/conversational-ai',
      ]),
    );
    expect(payload.sidebar).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Content Quickstarts',
          type: 'section',
        }),
        expect.objectContaining({
          title: 'Content Integration Patterns',
          type: 'section',
        }),
        expect.objectContaining({
          title: 'Content Use Cases',
          type: 'section',
        }),
      ]),
    );
    expect(payload.sidebar).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Quickstarts',
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

function flattenSidebarSections(
  nodes: Exclude<
    Awaited<ReturnType<typeof loadDocsPagePayload>>,
    null | { redirectUrl: string }
  >['sidebar'],
): Extract<
  Exclude<
    Awaited<ReturnType<typeof loadDocsPagePayload>>,
    null | { redirectUrl: string }
  >['sidebar'][number],
  { type: 'section' }
>[] {
  return nodes.flatMap((node) =>
    node.type === 'section'
      ? [node, ...flattenSidebarSections(node.children)]
      : [],
  );
}

function unwrapPayload(
  payload: Awaited<ReturnType<typeof loadDocsPagePayload>>,
): Exclude<
  Awaited<ReturnType<typeof loadDocsPagePayload>>,
  null | { redirectUrl: string }
> {
  if (!payload || 'redirectUrl' in payload) {
    throw new Error('expected a docs page payload');
  }

  return payload;
}
