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
        id: 'get-started',
        title: 'Get Started',
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
        id: 'reference',
        title: 'Reference',
        type: 'section',
      },
    ]);
  });
});
