import type { Folder, Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import type { DocsMeta } from './docs-meta-schema';
import {
  getNavScopeSidebarNodes,
  getScopedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';

const apiReferenceTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'api-reference-folder',
          children: [
            {
              $id: 'convoai-folder',
              children: [
                {
                  $id: 'convoai-rest-api-folder',
                  children: [
                    {
                      $id: 'convoai-rest-api-authentication',
                      name: 'Authentication',
                      type: 'page',
                      url: '/en/api-reference/api-ref/conversational-ai/rest-api/authentication',
                    },
                  ],
                  index: {
                    $id: 'convoai-rest-api-index',
                    name: 'REST API',
                    type: 'page',
                    url: '/en/api-reference/api-ref/conversational-ai/rest-api',
                  },
                  name: 'REST API',
                  type: 'folder',
                },
                {
                  $id: 'convoai-go-page',
                  name: 'Go',
                  type: 'page',
                  url: '/en/api-reference/api-ref/conversational-ai/go',
                },
              ],
              index: {
                $id: 'convoai-index',
                name: 'Conversational AI',
                type: 'page',
                url: '/en/api-reference/api-ref/conversational-ai',
              },
              name: 'Conversational AI',
              type: 'folder',
            },
            {
              $id: 'rtc-folder',
              children: [
                {
                  $id: 'rtc-index',
                  name: 'RTC',
                  type: 'page',
                  url: '/en/api-reference/api-ref/rtc',
                },
                {
                  $id: 'android-folder',
                  children: [
                    {
                      $id: 'android-current-folder',
                      children: [
                        {
                          $id: 'android-current-overview',
                          name: 'Overview',
                          type: 'page',
                          url: '/en/api-reference/rtc/android/overview',
                        },
                        {
                          $id: 'android-current-audio-folder',
                          children: [
                            {
                              $id: 'android-current-audio-basic',
                              name: 'Audio basic',
                              type: 'page',
                              url: '/en/api-reference/rtc/android/audio/audio-basic',
                            },
                          ],
                          index: {
                            $id: 'android-current-audio-index',
                            name: 'Audio',
                            type: 'page',
                            url: '/en/api-reference/rtc/android/audio',
                          },
                          name: 'Audio',
                          type: 'folder',
                        },
                      ],
                      index: {
                        $id: 'android-current-index',
                        name: 'Android API Reference',
                        type: 'page',
                        url: '/en/api-reference/rtc/android',
                      },
                      name: 'Current',
                      type: 'folder',
                    },
                    {
                      $id: 'android-4-6-0-folder',
                      children: [
                        {
                          $id: 'android-4-6-0-overview',
                          name: 'Overview',
                          type: 'page',
                          url: '/en/api-reference/rtc/android/4.6.0/overview',
                        },
                      ],
                      index: {
                        $id: 'android-4-6-0-index',
                        name: 'Android API Reference',
                        type: 'page',
                        url: '/en/api-reference/rtc/android/4.6.0',
                      },
                      name: '4.6.0',
                      type: 'folder',
                    },
                  ],
                  index: {
                    $id: 'android-index',
                    name: 'Android API Reference',
                    type: 'page',
                    url: '/en/api-reference/rtc/android',
                  },
                  name: 'Android API Reference',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'rtc-index',
                name: 'RTC',
                type: 'page',
                url: '/en/api-reference/api-ref/rtc',
              },
              name: 'RTC',
              type: 'folder',
            },
          ],
          index: {
            $id: 'api-reference-index',
            name: 'Reference',
            type: 'page',
            url: '/en/api-reference',
          },
          name: 'Reference',
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

const metaById = new Map<string, DocsMeta>([
  [
    'convoai-rest-api-folder',
    {
      navScope: {},
      pages: ['authentication'],
      title: 'RESTful',
    },
  ],
  ['rtc-folder', { navScope: {}, pages: ['index', 'android'], title: 'RTC' }],
  [
    'android-folder',
    {
      navScope: {
        defaultVersion: 'current',
        platformTabs: true,
        versions: [
          { id: 'current', label: 'v4.6.2', path: '(current)' },
          { id: '4.6.0', label: 'v4.6.0', path: '4.6.0' },
        ],
      },
      pages: ['(current)', '4.6.0'],
      title: 'Android API Reference',
    },
  ],
]);

function getNodeMeta(node: Folder | Root): DocsMeta | undefined {
  return typeof node.$id === 'string' ? metaById.get(node.$id) : undefined;
}

describe('docs nav scope', () => {
  it('resolves the nearest current-version scope from a clean URL', () => {
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/rtc/android/overview',
      getNodeMeta,
      root: apiReferenceTree,
      tab: 'api-reference',
    });

    expect(scope?.scope.node.$id).toBe('android-folder');
    expect(scope?.activeVersion?.id).toBe('current');
    expect(scope?.sidebarRoot.$id).toBe('android-current-folder');
    expect(scope?.header).toEqual({
      backHref: '/en/api-reference/api-ref/rtc',
      backLabel: 'RTC',
      title: 'Android API Reference',
      versionSwitcher: {
        currentId: 'current',
        versions: [
          {
            href: '/en/api-reference/rtc/android/overview',
            id: 'current',
            label: 'v4.6.2',
          },
          {
            href: '/en/api-reference/rtc/android/4.6.0/overview',
            id: '4.6.0',
            label: 'v4.6.0',
          },
        ],
      },
    });
  });

  it('resolves the previous-version scope from a versioned URL', () => {
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/rtc/android/4.6.0/overview',
      getNodeMeta,
      root: apiReferenceTree,
      tab: 'api-reference',
    });

    expect(scope?.scope.node.$id).toBe('android-folder');
    expect(scope?.activeVersion?.id).toBe('4.6.0');
    expect(scope?.sidebarRoot.$id).toBe('android-4-6-0-folder');
    expect(scope?.header.versionSwitcher).toEqual({
      currentId: '4.6.0',
      versions: [
        {
          href: '/en/api-reference/rtc/android/overview',
          id: 'current',
          label: 'v4.6.2',
        },
        {
          href: '/en/api-reference/rtc/android/4.6.0/overview',
          id: '4.6.0',
          label: 'v4.6.0',
        },
      ],
    });
  });

  it('falls back to the target version index when the relative page is missing', () => {
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/rtc/android/audio/audio-basic',
      getNodeMeta,
      root: apiReferenceTree,
      tab: 'api-reference',
    });

    expect(scope?.header.versionSwitcher?.versions).toEqual([
      {
        href: '/en/api-reference/rtc/android/audio/audio-basic',
        id: 'current',
        label: 'v4.6.2',
      },
      {
        href: '/en/api-reference/rtc/android/4.6.0',
        id: '4.6.0',
        label: 'v4.6.0',
      },
    ]);
  });

  it('compresses nav scopes in the parent sidebar', () => {
    expect(
      getNavScopeSidebarNodes({
        getNodeMeta,
        root: apiReferenceTree,
        tab: 'api-reference',
      }),
    ).toEqual([
      {
        id: '/en/api-reference',
        title: 'Reference',
        type: 'page',
        url: '/en/api-reference',
      },
      {
        children: [
          {
            children: [],
            collapsible: true,
            id: 'folder-convoai-rest-api-folder',
            title: 'RESTful',
            type: 'section',
            url: '/en/api-reference/api-ref/conversational-ai/rest-api',
          },
          {
            id: '/en/api-reference/api-ref/conversational-ai/go',
            title: 'Go',
            type: 'page',
            url: '/en/api-reference/api-ref/conversational-ai/go',
          },
        ],
        collapsible: false,
        id: 'folder-convoai-folder',
        title: 'Conversational AI',
        type: 'section',
      },
      {
        children: [],
        collapsible: true,
        id: 'folder-rtc-folder',
        title: 'RTC',
        type: 'section',
        url: '/en/api-reference/api-ref/rtc',
      },
    ]);
  });

  it('preserves parent separators while rendering plain nav scopes as linked folder groups', () => {
    const realtimeMediaTree: Root = {
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
                      $id: 'realtime-media-rtc-quick-start',
                      name: 'Quick Start',
                      type: 'page',
                      url: '/en/realtime-media/rtc/quick-start',
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

    expect(
      getNavScopeSidebarNodes({
        getNodeMeta: (node) =>
          node.$id === 'realtime-media-rtc-folder'
            ? {
                navScope: {},
                pages: ['index', 'quick-start'],
                title: 'Voice & Video',
              }
            : undefined,
        root: realtimeMediaTree,
        tab: 'realtime-media',
      }),
    ).toEqual([
      {
        id: '/en/realtime-media',
        title: 'Overview',
        type: 'page',
        url: '/en/realtime-media',
      },
      {
        children: [
          {
            children: [],
            collapsible: true,
            id: 'folder-realtime-media-rtc-folder',
            title: 'Voice & Video',
            type: 'section',
            url: '/en/realtime-media/rtc',
          },
          {
            id: '/en/realtime-media/rtm',
            title: 'Signaling',
            type: 'page',
            url: '/en/realtime-media/rtm',
          },
        ],
        collapsible: false,
        id: 'separator-Build Live Interaction',
        title: 'Build Live Interaction',
        type: 'section',
      },
    ]);
  });

  it('preserves separators inside a scoped nav scope sidebar', () => {
    const recipesTree: Root = {
      children: [
        {
          $id: 'en-root',
          children: [
            {
              $id: 'api-reference-folder',
              children: [
                {
                  $id: 'recipes-folder',
                  children: [
                    {
                      $id: 'recipes-quickstarts-separator',
                      name: 'Content Quickstarts',
                      type: 'separator',
                    },
                    {
                      $id: 'recipes-python-quickstart',
                      name: 'Python Quickstart',
                      type: 'page',
                      url: '/en/api-reference/recipes/python-quickstart',
                    },
                    {
                      $id: 'recipes-integration-separator',
                      name: 'Content Integration Patterns',
                      type: 'separator',
                    },
                    {
                      $id: 'recipes-custom-llm',
                      name: 'Custom LLM',
                      type: 'page',
                      url: '/en/api-reference/recipes/custom-llm',
                    },
                  ],
                  index: {
                    $id: 'recipes-index',
                    name: 'Recipes',
                    type: 'page',
                    url: '/en/api-reference/recipes',
                  },
                  name: 'Recipes',
                  type: 'folder',
                },
              ],
              index: {
                $id: 'api-reference-index',
                name: 'Reference',
                type: 'page',
                url: '/en/api-reference',
              },
              name: 'Reference',
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
    const getRecipesMeta = (node: Folder | Root): DocsMeta | undefined =>
      node.$id === 'recipes-folder'
        ? {
            navScope: {},
            pages: [
              'index',
              '---Content Quickstarts---',
              'python-quickstart',
              '---Content Integration Patterns---',
              'custom-llm',
            ],
            title: 'Recipes',
          }
        : undefined;
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/recipes',
      getNodeMeta: getRecipesMeta,
      root: recipesTree,
      tab: 'api-reference',
    });

    if (!scope) {
      throw new Error('expected recipes nav scope');
    }

    expect(
      getScopedNavScopeSidebarNodes({
        getNodeMeta: getRecipesMeta,
        navScope: scope,
      }),
    ).toEqual([
      {
        id: '/en/api-reference/recipes',
        title: 'Recipes',
        type: 'page',
        url: '/en/api-reference/recipes',
      },
      {
        children: [
          {
            id: '/en/api-reference/recipes/python-quickstart',
            title: 'Python Quickstart',
            type: 'page',
            url: '/en/api-reference/recipes/python-quickstart',
          },
        ],
        collapsible: false,
        id: 'separator-Content Quickstarts',
        title: 'Content Quickstarts',
        type: 'section',
      },
      {
        children: [
          {
            id: '/en/api-reference/recipes/custom-llm',
            title: 'Custom LLM',
            type: 'page',
            url: '/en/api-reference/recipes/custom-llm',
          },
        ],
        collapsible: false,
        id: 'separator-Content Integration Patterns',
        title: 'Content Integration Patterns',
        type: 'section',
      },
    ]);
  });
});
