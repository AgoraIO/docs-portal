import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import {
  getProductScopes,
  getSidebarBreadcrumb,
  getSidebarEntries,
  getSidebarNodes,
  getTabSummaries,
  mapSidebarEntriesToTree,
  pageTreeNodeToSidebarNodes,
} from './docs-tree';

const scopeTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'rt-folder',
          children: [
            {
              $id: 'voice-folder',
              children: [],
              index: {
                $id: 'voice-index',
                name: 'Voice Calling',
                type: 'page',
                url: '/en/realtime-media/voice',
              },
              name: 'Voice Calling',
              type: 'folder',
            },
            {
              $id: 'video-folder',
              children: [],
              index: {
                $id: 'video-index',
                name: 'Video Calling',
                type: 'page',
                url: '/en/realtime-media/video',
              },
              name: 'Video Calling',
              type: 'folder',
            },
          ],
          index: {
            $id: 'rt-index',
            name: 'Realtime Media',
            type: 'page',
            url: '/en/realtime-media',
          },
          name: 'Realtime Media',
          root: true,
          type: 'folder',
        },
        {
          $id: 'ai-folder',
          children: [],
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
        {
          $id: 'intro-folder',
          children: [],
          index: {
            $id: 'intro-index',
            name: 'Introduction',
            type: 'page',
            url: '/en/introduction',
          },
          name: 'Introduction',
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

describe('getProductScopes', () => {
  const scopes = getProductScopes(scopeTree);

  it('expands product tabs into per-product scopes with section groups', () => {
    expect(scopes).toContainEqual({
      filter: 'product:"video"',
      group: 'Realtime Media',
      id: 'product:video',
      label: 'Video Calling',
    });
    expect(scopes).toContainEqual({
      filter: 'product:"voice"',
      group: 'Realtime Media',
      id: 'product:voice',
      label: 'Voice Calling',
    });
  });

  it('offers a non-product tab as a single tab-level scope', () => {
    expect(scopes).toContainEqual({
      filter: 'tab:"ai"',
      id: 'tab:ai',
      label: 'Voice Agent',
    });
  });

  it('excludes onboarding tabs', () => {
    expect(scopes.some((s) => s.id.includes('introduction'))).toBe(false);
  });
});

const nestedRootTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'intro-folder',
          children: [
            {
              $id: 'intro-page-about',
              name: 'About Agora',
              type: 'page',
              url: '/en/introduction/about-agora',
            },
          ],
          index: {
            $id: 'intro-page-index',
            name: 'Introduction',
            type: 'page',
            url: '/en/introduction',
          },
          name: 'Introduction',
          root: true,
          type: 'folder',
        },
        {
          $id: 'ai-folder',
          children: [
            {
              $id: 'ai-page-quickstart',
              name: 'Quickstart',
              type: 'page',
              url: '/en/ai/get-started/quickstart',
            },
          ],
          index: {
            $id: 'ai-page-index',
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

const groupedSidebarTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'guides-folder',
          children: [
            {
              $id: 'guides-index',
              name: 'Guides',
              type: 'page',
              url: '/en/guides',
            },
            {
              $id: 'guides-separator-get-started',
              name: 'Get Started',
              type: 'separator',
            },
            {
              $id: 'guides-overview',
              name: 'Overview',
              type: 'page',
              url: '/en/guides/overview',
            },
            {
              $id: 'guides-install',
              name: 'Install',
              type: 'page',
              url: '/en/guides/install',
            },
            {
              $id: 'guides-separator-reference',
              name: 'Reference',
              type: 'separator',
            },
            {
              $id: 'guides-api',
              name: 'API',
              type: 'page',
              url: '/en/guides/api',
            },
          ],
          name: 'Guides',
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

describe('docs tree helpers', () => {
  it('builds tab summaries from nested root folders', () => {
    expect(getTabSummaries(nestedRootTree)).toEqual([
      {
        id: 'introduction',
        title: 'Introduction',
        url: '/en/introduction',
      },
      {
        id: 'ai',
        title: 'AI',
        url: '/en/ai',
      },
    ]);
  });

  it('includes best-practices tabs from root folders', () => {
    const tree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'intro-folder',
              children: [],
              index: {
                $id: 'intro-index',
                name: 'Introduction',
                type: 'page',
                url: '/en/introduction',
              },
              name: 'Introduction',
              root: true,
              type: 'folder',
            },
            {
              $id: 'best-practices-folder',
              children: [],
              index: {
                $id: 'best-practices-index',
                name: 'Best Practices',
                type: 'page',
                url: '/en/best-practices',
              },
              name: 'Best Practices',
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

    expect(getTabSummaries(tree)).toEqual([
      {
        id: 'introduction',
        title: 'Introduction',
        url: '/en/introduction',
      },
      {
        id: 'best-practices',
        title: 'Best Practices',
        url: '/en/best-practices',
      },
    ]);
  });

  it('preserves configured tab and section icons from the page tree', () => {
    const tree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'intro-folder',
              children: [
                {
                  $id: 'intro-separator-get-started',
                  icon: 'BookOpen',
                  name: 'Get started',
                  type: 'separator',
                },
                {
                  $id: 'intro-about',
                  name: 'About Agora',
                  type: 'page',
                  url: '/en/introduction/about-agora',
                },
              ],
              icon: 'BookOpen',
              index: {
                $id: 'intro-index',
                name: 'Overview',
                type: 'page',
                url: '/en/introduction',
              },
              name: 'Introduction',
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

    expect(getTabSummaries(tree)).toEqual([
      {
        icon: 'BookOpen',
        id: 'introduction',
        title: 'Introduction',
        url: '/en/introduction',
      },
    ]);
    expect(getSidebarNodes(tree, 'introduction')).toEqual([
      {
        id: '/en/introduction',
        title: 'Overview',
        type: 'page',
        url: '/en/introduction',
      },
      {
        children: [
          {
            id: '/en/introduction/about-agora',
            title: 'About Agora',
            type: 'page',
            url: '/en/introduction/about-agora',
          },
        ],
        collapsible: false,
        icon: 'BookOpen',
        id: 'separator-Get started',
        title: 'Get started',
        type: 'section',
      },
    ]);
  });

  it('preserves external page tree links in sidebar nodes', () => {
    const tree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'intro-folder',
              children: [
                {
                  $id: 'intro-external-resource',
                  external: true,
                  name: 'External Resource',
                  type: 'page',
                  url: 'https://example.com/resources',
                },
              ],
              index: {
                $id: 'intro-index',
                name: 'Overview',
                type: 'page',
                url: '/en/introduction',
              },
              name: 'Introduction',
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

    expect(getSidebarNodes(tree, 'introduction')).toEqual([
      {
        id: '/en/introduction',
        title: 'Overview',
        type: 'page',
        url: '/en/introduction',
      },
      {
        external: true,
        href: 'https://example.com/resources',
        id: 'https://example.com/resources',
        title: 'External Resource',
        type: 'page',
        url: 'https://example.com/resources',
      },
    ]);
  });

  it('builds sidebar entries from the active nested root folder', () => {
    expect(getSidebarEntries(nestedRootTree, 'introduction')).toEqual([
      {
        id: '/en/introduction',
        title: 'Introduction',
        type: 'page',
        url: '/en/introduction',
      },
      {
        id: '/en/introduction/about-agora',
        title: 'About Agora',
        type: 'page',
        url: '/en/introduction/about-agora',
      },
    ]);
  });

  it('preserves nested separator groups inside folder sidebar sections', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'build-folder',
        children: [
          {
            $id: 'build-separator-create',
            name: 'Create and connect an agent',
            type: 'separator',
          },
          {
            $id: 'build-start-stop',
            name: 'Start and stop an agent',
            type: 'page',
            url: '/en/ai/build/start-stop-agent',
          },
          {
            $id: 'build-build-server-client',
            name: 'Build a backend and client from scratch',
            type: 'page',
            url: '/en/ai/build/build-server-client',
          },
          {
            $id: 'build-separator-shape',
            name: 'Shape the conversation',
            type: 'separator',
          },
          {
            $id: 'build-filler-words',
            name: 'Fill response silence',
            type: 'page',
            url: '/en/ai/build/filler-words',
          },
        ],
        name: 'Build',
        type: 'folder',
      }),
    ).toEqual([
      {
        children: [
          {
            children: [
              {
                id: '/en/ai/build/start-stop-agent',
                title: 'Start and stop an agent',
                type: 'page',
                url: '/en/ai/build/start-stop-agent',
              },
              {
                id: '/en/ai/build/build-server-client',
                title: 'Build a backend and client from scratch',
                type: 'page',
                url: '/en/ai/build/build-server-client',
              },
            ],
            collapsible: false,
            id: 'separator-Create and connect an agent',
            title: 'Create and connect an agent',
            type: 'section',
          },
          {
            children: [
              {
                id: '/en/ai/build/filler-words',
                title: 'Fill response silence',
                type: 'page',
                url: '/en/ai/build/filler-words',
              },
            ],
            collapsible: false,
            id: 'separator-Shape the conversation',
            title: 'Shape the conversation',
            type: 'section',
          },
        ],
        collapsible: true,
        id: 'folder-build-folder',
        title: 'Build',
        type: 'section',
      },
    ]);
  });

  it('uses structured separator flags for sidebar group collapsibility', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'build-folder',
        children: [
          {
            $id: 'build-separator-create',
            icon: 'Play',
            name: 'Create and connect an agent{dropdown}',
            type: 'separator',
          },
          {
            $id: 'build-start-stop',
            name: 'Start and stop an agent',
            type: 'page',
            url: '/en/ai/build/start-stop-agent',
          },
          {
            $id: 'build-separator-realtime',
            name: 'Realtime{flat}',
            type: 'separator',
          },
          {
            $id: 'build-monitor-runtime',
            name: 'Monitor agent runtime',
            type: 'page',
            url: '/en/ai/build/monitor-agent-runtime',
          },
        ],
        name: 'Build',
        type: 'folder',
      }),
    ).toEqual([
      {
        children: [
          {
            children: [
              {
                id: '/en/ai/build/start-stop-agent',
                title: 'Start and stop an agent',
                type: 'page',
                url: '/en/ai/build/start-stop-agent',
              },
            ],
            collapsible: true,
            icon: 'Play',
            id: 'separator-Create and connect an agent',
            title: 'Create and connect an agent',
            type: 'section',
          },
          {
            children: [
              {
                id: '/en/ai/build/monitor-agent-runtime',
                title: 'Monitor agent runtime',
                type: 'page',
                url: '/en/ai/build/monitor-agent-runtime',
              },
            ],
            collapsible: false,
            id: 'separator-Realtime',
            title: 'Realtime',
            type: 'section',
          },
        ],
        collapsible: true,
        id: 'folder-build-folder',
        title: 'Build',
        type: 'section',
      },
    ]);
  });

  it('builds recursive sidebar nodes from nested product folders', () => {
    const productTree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'realtime-folder',
              children: [
                {
                  $id: 'online-ktv-folder',
                  children: [
                    {
                      $id: 'uikit-folder',
                      children: [
                        {
                          $id: 'uikit-overview-folder',
                          children: [
                            {
                              $id: 'uikit-overview-introduction',
                              name: 'Introduction',
                              type: 'page',
                              url: '/en/realtime-media/online-ktv/uikit/overview/introduction',
                            },
                          ],
                          name: 'Overview',
                          type: 'folder',
                        },
                      ],
                      index: {
                        $id: 'uikit-index',
                        name: 'UIKit Open Source',
                        type: 'page',
                        url: '/en/realtime-media/online-ktv/uikit',
                      },
                      name: 'UIKit Open Source',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'online-ktv-index',
                    name: 'Online KTV',
                    type: 'page',
                    url: '/en/realtime-media/online-ktv',
                  },
                  name: 'Online KTV',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'realtime-index',
                name: 'Realtime & Media',
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

    expect(getSidebarNodes(productTree, 'realtime-media')).toEqual([
      {
        id: '/en/realtime-media',
        title: 'Realtime & Media',
        type: 'page',
        url: '/en/realtime-media',
      },
      {
        children: [
          {
            id: '/en/realtime-media/online-ktv',
            title: 'Overview',
            type: 'page',
            url: '/en/realtime-media/online-ktv',
          },
          {
            children: [
              {
                id: '/en/realtime-media/online-ktv/uikit',
                title: 'Overview',
                type: 'page',
                url: '/en/realtime-media/online-ktv/uikit',
              },
              {
                children: [
                  {
                    id: '/en/realtime-media/online-ktv/uikit/overview/introduction',
                    title: 'Introduction',
                    type: 'page',
                    url: '/en/realtime-media/online-ktv/uikit/overview/introduction',
                  },
                ],
                collapsible: true,
                id: 'folder-uikit-overview-folder',
                title: 'Overview',
                type: 'section',
              },
            ],
            collapsible: true,
            id: 'folder-uikit-folder',
            title: 'UIKit Open Source',
            type: 'section',
            url: '/en/realtime-media/online-ktv/uikit',
          },
        ],
        collapsible: true,
        id: 'folder-online-ktv-folder',
        title: 'Online KTV',
        type: 'section',
        url: '/en/realtime-media/online-ktv',
      },
    ]);
  });

  it('keeps nested product folders under their parent top-level tab', () => {
    const nestedProductTree: Root = {
      children: [
        {
          $id: 'zh-root',
          children: [
            {
              $id: 'realtime-folder',
              children: [
                {
                  $id: 'rtm2-folder',
                  children: [
                    {
                      $id: 'rtm2-android',
                      name: 'Android',
                      type: 'page',
                      url: '/zh-CN/realtime-media/rtm2/android',
                    },
                  ],
                  index: {
                    $id: 'rtm2-index',
                    name: '实时消息 RTM',
                    type: 'page',
                    url: '/zh-CN/realtime-media/rtm2',
                  },
                  name: '实时消息 RTM',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'realtime-index',
                name: '实时与媒体',
                type: 'page',
                url: '/zh-CN/realtime-media',
              },
              name: '实时与媒体',
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

    expect(getTabSummaries(nestedProductTree)).toEqual([
      {
        id: 'realtime-media',
        title: '实时与媒体',
        url: '/zh-CN/realtime-media',
      },
    ]);

    expect(getSidebarNodes(nestedProductTree, 'realtime-media')).toEqual([
      {
        id: '/zh-CN/realtime-media',
        title: '实时与媒体',
        type: 'page',
        url: '/zh-CN/realtime-media',
      },
      {
        children: [
          {
            id: '/zh-CN/realtime-media/rtm2',
            title: '总览',
            type: 'page',
            url: '/zh-CN/realtime-media/rtm2',
          },
          {
            id: '/zh-CN/realtime-media/rtm2/android',
            title: 'Android',
            type: 'page',
            url: '/zh-CN/realtime-media/rtm2/android',
          },
        ],
        collapsible: true,
        id: 'folder-rtm2-folder',
        title: '实时消息 RTM',
        type: 'section',
        url: '/zh-CN/realtime-media/rtm2',
      },
    ]);
  });

  it('maps grouped sidebar entries into section nodes', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: 'get-started',
          title: 'Get Started',
          type: 'separator',
        },
        {
          id: '/en/introduction/overview',
          title: 'Overview',
          type: 'page',
          url: '/en/introduction/overview',
        },
        {
          id: '/en/introduction/install',
          title: 'Install',
          type: 'page',
          url: '/en/introduction/install',
        },
      ]),
    ).toEqual([
      {
        children: [
          {
            id: '/en/introduction/overview',
            title: 'Overview',
            type: 'page',
            url: '/en/introduction/overview',
          },
          {
            id: '/en/introduction/install',
            title: 'Install',
            type: 'page',
            url: '/en/introduction/install',
          },
        ],
        collapsible: false,
        id: 'get-started',
        title: 'Get Started',
        type: 'section',
      },
    ]);
  });

  it('maps external sidebar entries into page nodes', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          external: true,
          href: 'https://example.com/resources',
          id: 'https://example.com/resources',
          title: 'External Resource',
          type: 'page',
          url: 'https://example.com/resources',
        },
      ]),
    ).toEqual([
      {
        external: true,
        href: 'https://example.com/resources',
        id: 'https://example.com/resources',
        title: 'External Resource',
        type: 'page',
        url: 'https://example.com/resources',
      },
    ]);
  });

  it('preserves folder structure as a collapsible product directory', () => {
    const productTree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'realtime-folder',
              children: [
                {
                  $id: 'rtc-folder',
                  children: [
                    {
                      $id: 'rtc-quick-start',
                      name: 'Quick Start',
                      type: 'page',
                      url: '/en/realtime-media/rtc/quick-start',
                    },
                  ],
                  index: {
                    $id: 'rtc-index',
                    name: 'Realtime RTC',
                    type: 'page',
                    url: '/en/realtime-media/rtc',
                  },
                  name: 'Realtime RTC',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'realtime-index',
                name: 'Realtime & Media',
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

    expect(
      mapSidebarEntriesToTree(getSidebarEntries(productTree, 'realtime-media')),
    ).toEqual([
      {
        id: '/en/realtime-media',
        title: 'Realtime & Media',
        type: 'page',
        url: '/en/realtime-media',
      },
      {
        children: [
          {
            id: '/en/realtime-media/rtc',
            title: 'Overview',
            type: 'page',
            url: '/en/realtime-media/rtc',
          },
          {
            id: '/en/realtime-media/rtc/quick-start',
            title: 'Quick Start',
            type: 'page',
            url: '/en/realtime-media/rtc/quick-start',
          },
        ],
        collapsible: true,
        id: 'separator-rtc-folder',
        title: 'Realtime RTC',
        type: 'section',
      },
    ]);
  });

  it('keeps a product folder visible even when it only has an index page', () => {
    const productTree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'realtime-folder',
              children: [
                {
                  $id: 'rtm-folder',
                  children: [],
                  index: {
                    $id: 'rtm-index',
                    name: 'Realtime Messaging RTM',
                    type: 'page',
                    url: '/en/realtime-media/rtm',
                  },
                  name: 'Realtime Messaging RTM',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'realtime-index',
                name: 'Realtime & Media',
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

    expect(
      mapSidebarEntriesToTree(getSidebarEntries(productTree, 'realtime-media')),
    ).toEqual([
      {
        id: '/en/realtime-media',
        title: 'Realtime & Media',
        type: 'page',
        url: '/en/realtime-media',
      },
      {
        children: [
          {
            id: '/en/realtime-media/rtm',
            title: 'Overview',
            type: 'page',
            url: '/en/realtime-media/rtm',
          },
        ],
        collapsible: true,
        id: 'separator-rtm-folder',
        title: 'Realtime Messaging RTM',
        type: 'section',
      },
    ]);
  });

  it('marks the media infrastructure section as collapsible', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: 'media-infra',
          title: '媒体基础设施',
          type: 'separator',
        },
        {
          id: '/zh-CN/introduction/rtsa',
          title: '设备侧实时媒体传输',
          type: 'page',
          url: '/zh-CN/introduction/rtsa',
        },
      ]),
    ).toEqual([
      {
        children: [
          {
            id: '/zh-CN/introduction/rtsa',
            title: '设备侧实时媒体传输',
            type: 'page',
            url: '/zh-CN/introduction/rtsa',
          },
        ],
        collapsible: true,
        id: 'media-infra',
        title: '媒体基础设施',
        type: 'section',
      },
    ]);
  });

  it('marks the realtime section as collapsible', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: 'realtime',
          title: 'Realtime',
          type: 'separator',
        },
        {
          id: '/en/introduction/realtime-audio-video',
          title: 'Audio & Video',
          type: 'page',
          url: '/en/introduction/realtime-audio-video',
        },
        {
          id: '/en/introduction/messaging',
          title: 'Messaging',
          type: 'page',
          url: '/en/introduction/messaging',
        },
      ]),
    ).toEqual([
      {
        children: [
          {
            id: '/en/introduction/realtime-audio-video',
            title: 'Audio & Video',
            type: 'page',
            url: '/en/introduction/realtime-audio-video',
          },
          {
            id: '/en/introduction/messaging',
            title: 'Messaging',
            type: 'page',
            url: '/en/introduction/messaging',
          },
        ],
        collapsible: true,
        id: 'realtime',
        title: 'Realtime',
        type: 'section',
      },
    ]);
  });

  it('marks the extensions section as collapsible', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: 'extensions',
          title: '扩展能力',
          type: 'separator',
        },
        {
          id: '/zh-CN/introduction/whiteboard',
          title: '实时协作白板',
          type: 'page',
          url: '/zh-CN/introduction/whiteboard',
        },
        {
          id: '/zh-CN/introduction/recording',
          title: '云端/本地录制',
          type: 'page',
          url: '/zh-CN/introduction/recording',
        },
        {
          id: '/zh-CN/introduction/ppt-transcoding',
          title: 'PPT 转码',
          type: 'page',
          url: '/zh-CN/introduction/ppt-transcoding',
        },
      ]),
    ).toEqual([
      {
        children: [
          {
            id: '/zh-CN/introduction/whiteboard',
            title: '实时协作白板',
            type: 'page',
            url: '/zh-CN/introduction/whiteboard',
          },
          {
            id: '/zh-CN/introduction/recording',
            title: '云端/本地录制',
            type: 'page',
            url: '/zh-CN/introduction/recording',
          },
          {
            id: '/zh-CN/introduction/ppt-transcoding',
            title: 'PPT 转码',
            type: 'page',
            url: '/zh-CN/introduction/ppt-transcoding',
          },
        ],
        collapsible: true,
        id: 'extensions',
        title: '扩展能力',
        type: 'section',
      },
    ]);
  });

  it('preserves order for top-level pages and later sections', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: '/en/introduction',
          title: 'Introduction',
          type: 'page',
          url: '/en/introduction',
        },
        {
          id: 'guides',
          title: 'Guides',
          type: 'separator',
        },
        {
          id: '/en/introduction/quick-start',
          title: 'Quick Start',
          type: 'page',
          url: '/en/introduction/quick-start',
        },
        {
          id: '/en/introduction/advanced',
          title: 'Advanced',
          type: 'page',
          url: '/en/introduction/advanced',
        },
      ]),
    ).toEqual([
      {
        id: '/en/introduction',
        title: 'Introduction',
        type: 'page',
        url: '/en/introduction',
      },
      {
        children: [
          {
            id: '/en/introduction/quick-start',
            title: 'Quick Start',
            type: 'page',
            url: '/en/introduction/quick-start',
          },
          {
            id: '/en/introduction/advanced',
            title: 'Advanced',
            type: 'page',
            url: '/en/introduction/advanced',
          },
        ],
        collapsible: false,
        id: 'guides',
        title: 'Guides',
        type: 'section',
      },
    ]);
  });

  it('passes long labels through unchanged for UI-level truncation', () => {
    const longTitle =
      'This is a very long documentation title that should stay untouched for UI-level truncation';

    expect(
      mapSidebarEntriesToTree([
        {
          id: 'reference',
          title: 'Reference',
          type: 'separator',
        },
        {
          id: '/en/reference/really-long-page-title',
          title: longTitle,
          type: 'page',
          url: '/en/reference/really-long-page-title',
        },
      ]),
    ).toEqual([
      {
        children: [
          {
            id: '/en/reference/really-long-page-title',
            title: longTitle,
            type: 'page',
            url: '/en/reference/really-long-page-title',
          },
        ],
        collapsible: false,
        id: 'reference',
        title: 'Reference',
        type: 'section',
      },
    ]);
  });

  it('builds a breadcrumb from nested sidebar sections', () => {
    expect(
      getSidebarBreadcrumb(
        [
          {
            children: [
              {
                children: [
                  {
                    id: '/en/realtime-media/online-ktv/scenario-api',
                    title: 'Scenario API',
                    type: 'page',
                    url: '/en/realtime-media/online-ktv/scenario-api',
                  },
                ],
                collapsible: true,
                id: 'paths',
                title: 'Product paths',
                type: 'section',
              },
            ],
            collapsible: true,
            id: 'online-ktv',
            title: 'Online KTV',
            type: 'section',
          },
        ],
        '/en/realtime-media/online-ktv/scenario-api',
      ),
    ).toEqual([
      {
        title: 'Online KTV',
      },
      {
        title: 'Product paths',
      },
      {
        title: 'Scenario API',
        url: '/en/realtime-media/online-ktv/scenario-api',
      },
    ]);
  });

  it('maps getSidebarEntries output into a tree while preserving producer order', () => {
    expect(
      mapSidebarEntriesToTree(getSidebarEntries(groupedSidebarTree, 'guides')),
    ).toEqual([
      {
        id: '/en/guides',
        title: 'Guides',
        type: 'page',
        url: '/en/guides',
      },
      {
        children: [
          {
            id: '/en/guides/overview',
            title: 'Overview',
            type: 'page',
            url: '/en/guides/overview',
          },
          {
            id: '/en/guides/install',
            title: 'Install',
            type: 'page',
            url: '/en/guides/install',
          },
        ],
        collapsible: false,
        id: 'separator-Get Started',
        title: 'Get Started',
        type: 'section',
      },
      {
        children: [
          {
            id: '/en/guides/api',
            title: 'API',
            type: 'page',
            url: '/en/guides/api',
          },
        ],
        collapsible: false,
        id: 'separator-Reference',
        title: 'Reference',
        type: 'section',
      },
    ]);
  });

  it('keeps the tab overview above the first section when separators are present', () => {
    const tree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'realtime-folder',
              children: [
                {
                  $id: 'realtime-separator-live',
                  name: 'Build Live Interaction',
                  type: 'separator',
                },
                {
                  $id: 'realtime-rtc',
                  name: 'Voice & Video',
                  type: 'page',
                  url: '/en/realtime-media/rtc',
                },
              ],
              index: {
                $id: 'realtime-index',
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

    expect(getSidebarNodes(tree, 'realtime-media')).toEqual([
      {
        id: '/en/realtime-media',
        title: 'Overview',
        type: 'page',
        url: '/en/realtime-media',
      },
      {
        children: [
          {
            id: '/en/realtime-media/rtc',
            title: 'Voice & Video',
            type: 'page',
            url: '/en/realtime-media/rtc',
          },
        ],
        collapsible: false,
        id: 'separator-Build Live Interaction',
        title: 'Build Live Interaction',
        type: 'section',
      },
    ]);
  });

  it('does not emit empty sections for consecutive or trailing separators', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: 'getting-started',
          title: 'Getting Started',
          type: 'separator',
        },
        {
          id: 'reference',
          title: 'Reference',
          type: 'separator',
        },
        {
          id: '/en/reference/api',
          title: 'API',
          type: 'page',
          url: '/en/reference/api',
        },
        {
          id: 'trailing',
          title: 'Trailing',
          type: 'separator',
        },
      ]),
    ).toEqual([
      {
        children: [
          {
            id: '/en/reference/api',
            title: 'API',
            type: 'page',
            url: '/en/reference/api',
          },
        ],
        collapsible: false,
        id: 'reference',
        title: 'Reference',
        type: 'section',
      },
    ]);
  });

  it('maps an external page-tree item to an external sidebar node', () => {
    const folder = {
      $id: 'voice-video-group',
      type: 'folder',
      name: 'Voice & Video',
      children: [
        {
          $id: 'vv-android',
          type: 'page',
          name: 'Android',
          url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
          external: true,
        },
      ],
    } as unknown as Parameters<typeof pageTreeNodeToSidebarNodes>[0];

    const nodes = pageTreeNodeToSidebarNodes(folder);
    const section = nodes.find((node) => node.type === 'section');
    const child =
      section && 'children' in section ? section.children[0] : undefined;

    expect(child).toMatchObject({
      type: 'page',
      external: true,
      href: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
      title: 'Android',
    });
  });

  it('treats an unnamed separator as a section boundary without creating an empty section', () => {
    expect(
      mapSidebarEntriesToTree([
        {
          id: 'media',
          title: '媒体基础设施',
          type: 'separator',
        },
        {
          id: 'end-media',
          title: '',
          type: 'separator',
        },
        {
          id: '/zh-CN/introduction/whiteboard',
          title: '实时协作白板',
          type: 'page',
          url: '/zh-CN/introduction/whiteboard',
        },
      ]),
    ).toEqual([
      {
        id: '/zh-CN/introduction/whiteboard',
        title: '实时协作白板',
        type: 'page',
        url: '/zh-CN/introduction/whiteboard',
      },
    ]);
  });

  it('collapses an index-only folder into a single leaf link', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'faq-integration-folder',
        children: [],
        index: {
          $id: 'faq-integration-index',
          name: 'Integration Issues',
          type: 'page',
          url: '/en/api-reference/faq/integration',
        },
        name: 'Integration',
        type: 'folder',
      }),
    ).toEqual([
      {
        id: '/en/api-reference/faq/integration',
        title: 'Integration',
        type: 'page',
        url: '/en/api-reference/faq/integration',
      },
    ]);
  });

  it('shows a matching-index folder index as an Overview child and keeps the section url', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'faq-folder',
        children: [
          {
            $id: 'faq-integration-folder',
            children: [],
            index: {
              $id: 'faq-integration-index',
              name: 'Integration Issues',
              type: 'page',
              url: '/en/api-reference/faq/integration',
            },
            name: 'Integration',
            type: 'folder',
          },
        ],
        index: {
          $id: 'faq-index',
          name: 'FAQ',
          type: 'page',
          url: '/en/api-reference/faq',
        },
        name: 'FAQ',
        type: 'folder',
      }),
    ).toEqual([
      {
        children: [
          {
            id: '/en/api-reference/faq',
            title: 'Overview',
            type: 'page',
            url: '/en/api-reference/faq',
          },
          {
            id: '/en/api-reference/faq/integration',
            title: 'Integration',
            type: 'page',
            url: '/en/api-reference/faq/integration',
          },
        ],
        collapsible: true,
        id: 'folder-faq-folder',
        title: 'FAQ',
        type: 'section',
        url: '/en/api-reference/faq',
      },
    ]);
  });

  it('collapses an index-only folder (index exposed as a single page child) into a leaf', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'faq-integration-folder',
        children: [
          {
            $id: 'faq-integration-index-child',
            name: 'Integration Issues',
            type: 'page',
            url: '/en/api-reference/faq/integration',
          },
        ],
        name: 'Integration',
        type: 'folder',
      }),
    ).toEqual([
      {
        id: '/en/api-reference/faq/integration',
        title: 'Integration',
        type: 'page',
        url: '/en/api-reference/faq/integration',
      },
    ]);
  });

  it('leaves a normal folder (distinct visible index) as a plain section', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'build-folder',
        children: [
          {
            $id: 'build-start-stop',
            name: 'Start and stop an agent',
            type: 'page',
            url: '/en/ai/build/start-stop-agent',
          },
        ],
        index: {
          $id: 'build-index',
          name: 'Overview',
          type: 'page',
          url: '/en/ai/build',
        },
        name: 'Build',
        type: 'folder',
      }),
    ).toEqual([
      {
        children: [
          {
            id: '/en/ai/build',
            title: 'Overview',
            type: 'page',
            url: '/en/ai/build',
          },
          {
            id: '/en/ai/build/start-stop-agent',
            title: 'Start and stop an agent',
            type: 'page',
            url: '/en/ai/build/start-stop-agent',
          },
        ],
        collapsible: true,
        id: 'folder-build-folder',
        title: 'Build',
        type: 'section',
      },
    ]);
  });

  it('carries defaultOpen:false from a folder so a hub section stays collapsed when active', () => {
    expect(
      pageTreeNodeToSidebarNodes({
        $id: 'faq-folder',
        defaultOpen: false,
        children: [
          {
            $id: 'faq-integration',
            name: 'Integration',
            type: 'page',
            url: '/en/api-reference/faq/integration',
          },
        ],
        index: {
          $id: 'faq-index',
          name: 'FAQ',
          type: 'page',
          url: '/en/api-reference/faq',
        },
        name: 'FAQ',
        type: 'folder',
      }),
    ).toEqual([
      {
        children: [
          {
            id: '/en/api-reference/faq',
            title: 'Overview',
            type: 'page',
            url: '/en/api-reference/faq',
          },
          {
            id: '/en/api-reference/faq/integration',
            title: 'Integration',
            type: 'page',
            url: '/en/api-reference/faq/integration',
          },
        ],
        collapsible: true,
        defaultOpen: false,
        id: 'folder-faq-folder',
        title: 'FAQ',
        type: 'section',
        url: '/en/api-reference/faq',
      },
    ]);
  });

  it('builds a breadcrumb for a linked section index page', () => {
    expect(
      getSidebarBreadcrumb(
        [
          {
            children: [{ id: '/x/a', title: 'A', type: 'page', url: '/x/a' }],
            collapsible: true,
            id: 'folder-x',
            title: 'X',
            type: 'section',
            url: '/x',
          },
        ],
        '/x',
      ),
    ).toEqual([{ title: 'X', url: '/x' }]);
  });
});

const scopeTreeWithDescriptions: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'rt-folder',
          children: [
            {
              $id: 'video-folder',
              children: [],
              index: {
                $id: 'video-index',
                description: 'Multi-party video with adaptive quality.',
                name: 'Video Calling',
                type: 'page',
                url: '/en/realtime-media/video',
              },
              name: 'Video Calling',
              type: 'folder',
            },
          ],
          index: {
            $id: 'rt-index',
            name: 'Realtime Media',
            type: 'page',
            url: '/en/realtime-media',
          },
          name: 'Realtime Media',
          root: true,
          type: 'folder',
        },
        {
          $id: 'ai-folder',
          children: [],
          index: {
            $id: 'ai-index',
            description: 'Voice agents with LLM, ASR, and TTS.',
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

describe('getProductScopes descriptions', () => {
  const scopes = getProductScopes(scopeTreeWithDescriptions);

  it('carries the product index description onto product-level scopes', () => {
    expect(scopes).toContainEqual({
      description: 'Multi-party video with adaptive quality.',
      filter: 'product:"video"',
      group: 'Realtime Media',
      id: 'product:video',
      label: 'Video Calling',
    });
  });

  it('carries the tab index description onto tab-level scopes', () => {
    expect(scopes).toContainEqual({
      description: 'Voice agents with LLM, ASR, and TTS.',
      filter: 'tab:"ai"',
      id: 'tab:ai',
      label: 'Voice Agent',
    });
  });

  it('omits the description key entirely when the index page has none', () => {
    const scope = getProductScopes(scopeTree).find(
      (s) => s.id === 'product:video',
    );
    expect(scope).toBeDefined();
    expect(scope).not.toHaveProperty('description');
  });
});
