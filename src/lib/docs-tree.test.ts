import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import {
  getSidebarEntries,
  getTabSummaries,
  mapSidebarEntriesToTree,
} from './docs-tree';

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
              $id: 'ai-page-quick-start',
              name: 'Quick Start',
              type: 'page',
              url: '/en/ai/quick-start',
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
});
