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
  describe('context-specific version lists', () => {
    const base = '/zh-CN/api-reference/rtc/react-sdk';
    const reactVersions = [
      {
        id: 'current',
        label: 'React v2.5.0',
        path: '.',
        href: `${base}/overview`,
      },
      {
        id: 'react-2.4.0',
        label: 'React v2.4.0',
        path: '2.4.0',
        href: 'https://archive.example.com/react/2.4.0',
      },
    ];
    const webVersions = [
      {
        id: 'current',
        label: 'Web v4.24.0',
        path: '.',
        href: `${base}/web-sdk/overview`,
      },
      {
        id: 'web-4.23.0',
        label: 'Web v4.23.0',
        path: '4.23.0',
        href: 'https://archive.example.com/web/4.23.0',
      },
    ];
    const page = (path: string) => ({
      name: path,
      type: 'page' as const,
      url: `${base}/${path}`,
    });
    const reactFolder: Folder = {
      $id: 'react-root',
      name: 'React API',
      type: 'folder',
      // A landing page is not a folder URL; overrides must not append to /overview.
      index: page('overview'),
      children: [
        page('components/LocalVideoTrack'),
        page('web-sdk-other/overview'),
        {
          $id: 'web-folder',
          name: 'Web SDK',
          type: 'folder',
          index: page('web-sdk/overview'),
          children: [
            page('web-sdk/interfaces/IAgoraRTCClient'),
            {
              $id: 'web-types',
              name: 'Types',
              type: 'folder',
              children: [page('web-sdk/types/VisibleType')],
            },
          ],
        },
      ],
    };
    const root: Root = {
      name: 'Docs',
      children: [
        {
          $id: 'reference-root',
          name: 'Reference',
          type: 'folder',
          root: true,
          index: {
            name: 'Reference',
            type: 'page',
            url: '/zh-CN/api-reference',
          },
          children: [reactFolder],
        },
      ],
    };
    const getReactMeta = (node: Folder | Root): DocsMeta | undefined =>
      node.$id === 'react-root'
        ? {
            title: 'React API',
            navScope: {
              defaultVersion: 'current',
              versions: reactVersions,
              versionOverrides: [{ path: 'web-sdk', versions: webVersions }],
            },
          }
        : node.$id === 'web-types'
          ? { sidebarHidden: true }
          : undefined;
    function resolve(path: string, getNodeMeta = getReactMeta) {
      return resolveDocsNavScope({
        activePath: `${base}/${path}`,
        getNodeMeta,
        root,
        tab: 'api-reference',
      });
    }

    it.each([
      ['overview', reactVersions],
      ['components/LocalVideoTrack', reactVersions],
      ['web-sdk/overview', webVersions],
      ['web-sdk/interfaces/IAgoraRTCClient', webVersions],
      ['web-sdk/types/HiddenType', webVersions],
      ['web-sdk-other/overview', reactVersions],
      ['web-sdk/types/VisibleType?query=1#type', webVersions],
      ['overview?from=web-sdk#intro', reactVersions],
    ])(
      'uses the contextual series for %s without narrowing the sidebar',
      (path, versions) => {
        const scope = resolve(path);
        expect(scope?.scope.node).toBe(reactFolder);
        expect(scope?.sidebarRoot).toBe(reactFolder);
        expect(scope?.activeVersion).toMatchObject({
          ...versions[0],
          node: reactFolder,
        });
        expect(scope?.header.versionSwitcher).toEqual({
          currentId: 'current',
          versions: versions.map(({ id, label, href }) => ({
            id,
            label,
            href,
          })),
        });
      },
    );

    it('restores the default list on return without state leaking between resolutions', () => {
      for (const path of [
        'overview',
        'web-sdk/overview',
        'components/LocalVideoTrack',
        'web-sdk/types/HiddenType',
        'overview',
      ]) {
        expect(resolve(path)?.header.versionSwitcher?.versions[0].label).toBe(
          path.startsWith('web-sdk/') ? 'Web v4.24.0' : 'React v2.5.0',
        );
      }
    });

    it.each([false, true])(
      'uses the most specific complete path regardless of declaration order (%s)',
      (reversed) => {
        const typeVersions = [
          {
            id: 'current',
            label: 'Types v1',
            path: '.',
            href: `${base}/web-sdk/types/VisibleType`,
          },
        ];
        const versionOverrides = [
          { path: 'web-sdk', versions: webVersions },
          { path: 'web-sdk/types', versions: typeVersions },
        ];
        if (reversed) versionOverrides.reverse();
        const getNodeMeta = (node: Folder | Root): DocsMeta | undefined => {
          const meta = getReactMeta(node);
          return meta?.navScope
            ? { ...meta, navScope: { ...meta.navScope, versionOverrides } }
            : meta;
        };
        expect(
          resolve('web-sdk/types/HiddenType', getNodeMeta)?.header
            .versionSwitcher?.versions[0].label,
        ).toBe('Types v1');
        expect(
          resolve('web-sdk/types-other/HiddenType', getNodeMeta)?.header
            .versionSwitcher?.versions[0].label,
        ).toBe('Web v4.24.0');
      },
    );

    it('keeps React and Web entry points in the same sidebar on Web pages', () => {
      const scope = resolve('web-sdk/interfaces/IAgoraRTCClient');
      if (!scope) throw new Error('expected React nav scope');
      const sidebar = getScopedNavScopeSidebarNodes({
        getNodeMeta: getReactMeta,
        navScope: scope,
      });
      const serialized = JSON.stringify(sidebar);
      expect(serialized).toContain(`${base}/overview`);
      expect(serialized).toContain(`${base}/components/LocalVideoTrack`);
      expect(serialized).toContain(`${base}/web-sdk/overview`);
    });

    it('finds the scope boundary when it has no index and its first page is overview', () => {
      const { index: _index, ...withoutIndex } = reactFolder;
      const tree: Root = {
        ...root,
        children: [
          {
            ...(root.children[0] as Folder),
            children: [
              {
                ...withoutIndex,
                children: [page('overview'), ...reactFolder.children],
              },
            ],
          },
        ],
      };
      const scope = resolveDocsNavScope({
        activePath: `${base}/web-sdk/interfaces/IAgoraRTCClient`,
        getNodeMeta: getReactMeta,
        root: tree,
        tab: 'api-reference',
      });
      expect(scope?.header.versionSwitcher?.versions[0].label).toBe(
        'Web v4.24.0',
      );
      expect(scope?.sidebarRoot.$id).toBe('react-root');
    });

    it.each([false, true])(
      'anchors single-page scopes and ignores unrelated sidebar links (%s)',
      (includeUnrelated) => {
        const folder = {
          ...reactFolder,
          children: includeUnrelated
            ? [
                ...reactFolder.children,
                {
                  name: 'Shared errors',
                  type: 'page' as const,
                  url: '/zh-CN/api-reference/shared/errors',
                },
                {
                  name: 'External',
                  type: 'page' as const,
                  external: true,
                  url: 'https://example.com/docs',
                },
              ]
            : [],
        };
        const tree: Root = {
          ...root,
          children: [{ ...(root.children[0] as Folder), children: [folder] }],
        };
        const scope = resolveDocsNavScope({
          activePath: `${base}/web-sdk/types/HiddenType`,
          getNodeMeta: getReactMeta,
          root: tree,
          tab: 'api-reference',
        });
        expect(scope?.header.versionSwitcher?.versions[0].label).toBe(
          'Web v4.24.0',
        );
        expect(scope?.sidebarRoot).toBe(folder);
      },
    );

    it('retains a canonical directory index for hidden override pages in an index-only scope', () => {
      const folder: Folder = {
        ...reactFolder,
        index: { name: 'React API', type: 'page', url: base },
        children: [],
      };
      const tree: Root = {
        ...root,
        children: [{ ...(root.children[0] as Folder), children: [folder] }],
      };
      const scope = resolveDocsNavScope({
        activePath: `${base}/web-sdk/types/HiddenType`,
        getNodeMeta(node) {
          const meta = getReactMeta(node);
          return meta?.navScope
            ? {
                ...meta,
                navScope: {
                  ...meta.navScope,
                  versions: [
                    { ...reactVersions[0], href: base },
                    reactVersions[1],
                  ],
                },
              }
            : meta;
        },
        root: tree,
        tab: 'api-reference',
      });

      expect(scope?.scope.node).toBe(folder);
      expect(scope?.sidebarRoot).toBe(folder);
      expect(scope?.activeVersion?.label).toBe('Web v4.24.0');
      expect(scope?.header.versionSwitcher?.versions).toEqual(
        webVersions.map(({ id, label, href }) => ({ id, label, href })),
      );
    });

    it.each([
      [`${base}/web-sdk/types/Hidden`, 'Web v4.24.0', false],
      ['/zh-CN/api-reference/rtc/android/Hidden', null, false],
      [`${base}/web-sdk/types/Hidden`, 'Web v4.24.0', true],
      ['/zh-CN/api-reference/rtc/android/Hidden', null, true],
    ])(
      'keeps a canonical index without explicit hrefs bounded for %s (%s, unrelated links: %s)',
      (activePath, label, includeUnrelated) => {
        const folder: Folder = {
          ...reactFolder,
          index: { name: 'React API', type: 'page', url: base },
          children: includeUnrelated
            ? [
                {
                  name: 'Shared errors',
                  type: 'page',
                  url: '/zh-CN/api-reference/shared/errors',
                },
              ]
            : [],
        };
        const tree: Root = {
          ...root,
          children: [{ ...(root.children[0] as Folder), children: [folder] }],
        };
        const scope = resolveDocsNavScope({
          activePath,
          getNodeMeta: (node) =>
            node.$id === folder.$id
              ? {
                  title: 'React API',
                  navScope: {
                    defaultVersion: 'current',
                    versions: [
                      { id: 'current', label: 'React v2.5.0', path: '.' },
                    ],
                    versionOverrides: [
                      {
                        path: 'web-sdk',
                        versions: [
                          { id: 'current', label: 'Web v4.24.0', path: '.' },
                        ],
                      },
                    ],
                  },
                }
              : undefined,
          root: tree,
          tab: 'api-reference',
        });

        if (label === null) {
          expect(scope).toBeNull();
        } else {
          expect(scope?.activeVersion?.label).toBe(label);
          expect(scope?.header.versionSwitcher?.versions[0].label).toBe(label);
          expect(scope?.scope.node).toBe(folder);
          expect(scope?.sidebarRoot).toBe(folder);
        }
      },
    );
  });

  it.each(['(current)', '.'])(
    'keeps %s current selected with archive-only historical options',
    (currentPath) => {
      const archiveHref =
        'https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/android/API/rtc_api_overview';
      const activePath = '/en/api-reference/rtc/android/overview';
      const scope = resolveDocsNavScope({
        activePath,
        getNodeMeta(node) {
          const meta = getNodeMeta(node);
          return node.$id === 'android-folder'
            ? {
                ...meta,
                navScope: {
                  defaultVersion: 'current',
                  versions: [
                    { id: 'current', label: 'v4.7.0', path: currentPath },
                    {
                      id: '4.6.0',
                      label: 'v4.6.0',
                      path: '4.6.0',
                      href: archiveHref,
                    },
                    {
                      id: '4.2.2',
                      label: 'v4.2.2',
                      path: '4.2.2',
                      href: archiveHref.replace('0.0.405', '0.0.14'),
                    },
                  ],
                },
              }
            : meta;
        },
        root: apiReferenceTree,
        tab: 'api-reference',
      });

      expect(scope?.activeVersion?.id).toBe('current');
      expect(scope?.header.versionSwitcher).toEqual({
        currentId: 'current',
        versions: [
          { id: 'current', label: 'v4.7.0', href: activePath },
          { id: '4.6.0', label: 'v4.6.0', href: archiveHref },
          {
            id: '4.2.2',
            label: 'v4.2.2',
            href: archiveHref.replace('0.0.405', '0.0.14'),
          },
        ],
      });
      expect(scope?.sidebarRoot.$id).toBe(
        currentPath === '.' ? 'android-folder' : 'android-current-folder',
      );
    },
  );

  it.each(['(current)', '.'])(
    'identifies local historical pages even when %s versions link to an external archive',
    (currentPath) => {
      const scope = resolveDocsNavScope({
        activePath: '/en/api-reference/rtc/android/4.6.0/overview',
        getNodeMeta(node) {
          const meta = getNodeMeta(node);
          return node.$id === 'android-folder'
            ? {
                ...meta,
                navScope: {
                  defaultVersion: 'current',
                  versions: [
                    { id: 'current', label: 'v4.7.0', path: currentPath },
                    {
                      id: '4.6.0',
                      label: 'v4.6.0',
                      path: '4.6.0',
                      href: 'https://archive.example.com/android/4.6.0',
                    },
                  ],
                },
              }
            : meta;
        },
        root: apiReferenceTree,
        tab: 'api-reference',
      });

      expect(scope?.activeVersion?.id).toBe('4.6.0');
      expect(scope?.header.versionSwitcher?.currentId).toBe('4.6.0');
      expect(scope?.sidebarRoot.$id).toBe('android-4-6-0-folder');
      expect(
        scope &&
          getScopedNavScopeSidebarNodes({ getNodeMeta, navScope: scope }),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: '/en/api-reference/rtc/android/4.6.0/overview',
          }),
        ]),
      );
      expect(scope?.header.versionSwitcher?.versions).toContainEqual({
        id: '4.6.0',
        label: 'v4.6.0',
        href: 'https://archive.example.com/android/4.6.0',
      });
    },
  );

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

  it('prefers the declared tab root over an earlier folder with cross-tab links', () => {
    const englishRoot = apiReferenceTree.children[0];
    if (englishRoot.type !== 'folder') {
      throw new Error('expected localized docs root');
    }

    const tree: Root = {
      ...apiReferenceTree,
      children: [
        {
          ...englishRoot,
          children: [
            {
              $id: 'solution-reference-folder',
              children: [
                {
                  $id: 'solution-reference-link',
                  name: 'API response codes',
                  type: 'page',
                  url: '/en/api-reference/response-codes',
                },
              ],
              name: 'Solution reference',
              type: 'folder',
            },
            ...englishRoot.children,
          ],
        },
      ],
    };

    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/rtc/android/overview',
      getNodeMeta,
      root: tree,
      tab: 'api-reference',
    });

    expect(scope?.scope.node.$id).toBe('android-folder');
  });

  it('skips hidden structural parent scopes when building the back link', () => {
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/rtc/android/overview',
      getNodeMeta: (node) => {
        const meta = getNodeMeta(node);
        return node.$id === 'rtc-folder' && meta
          ? { ...meta, sidebarHidden: true }
          : meta;
      },
      root: apiReferenceTree,
      tab: 'api-reference',
    });

    expect(scope?.parentScope).toBeUndefined();
    expect(scope?.header.backHref).toBe('/en/api-reference');
    expect(scope?.header.backLabel).toBe('Reference');
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
