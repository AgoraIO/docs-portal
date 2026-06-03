import type { Folder, Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import type { DocsMeta } from './docs-meta-schema';
import {
  getNavScopeSidebarNodes,
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
              children: [],
              index: {
                $id: 'convoai-index',
                name: 'Conversational AI',
                type: 'page',
                url: '/en/api-reference/conversational-ai',
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
                  url: '/en/api-reference/rtc',
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
                url: '/en/api-reference/rtc',
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
  ['rtc-folder', { navScope: {}, pages: ['index', 'android'], title: 'RTC' }],
  [
    'android-folder',
    {
      navScope: {
        defaultVersion: 'current',
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
      backHref: '/en/api-reference/rtc',
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
        id: '/en/api-reference/conversational-ai',
        title: 'Conversational AI',
        type: 'page',
        url: '/en/api-reference/conversational-ai',
      },
      {
        id: '/en/api-reference/rtc',
        title: 'RTC',
        type: 'page',
        url: '/en/api-reference/rtc',
      },
    ]);
  });

});
