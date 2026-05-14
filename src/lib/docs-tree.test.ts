import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import { getSidebarEntries, getTabSummaries } from './docs-tree';

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
});
