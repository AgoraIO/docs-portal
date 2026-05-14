import type { Root } from 'fumadocs-core/page-tree';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { source } from './source.server';
import { loadDocsTabIndex } from './docs-page.server';

vi.mock('./source.server', () => ({
  source: {
    getPageTree: vi.fn(),
  },
}));

const mockedGetPageTree = vi.mocked(source.getPageTree);

const pageTree: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'introduction-folder',
          children: [
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
              $id: 'ai-quick-start',
              name: 'Quick Start',
              type: 'page',
              url: '/en/ai/quick-start',
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

describe('loadDocsTabIndex', () => {
  beforeEach(() => {
    mockedGetPageTree.mockReturnValue(pageTree);
  });

  it(
    'uses the real tab index page when the tab has index content',
    async () => {
      await expect(loadDocsTabIndex('en', 'ai')).resolves.toMatchObject({
        locale: 'en',
        tab: 'ai',
        url: '/en/ai',
      });
    },
  );

  it(
    'falls back to the first real page when the tab has no index content',
    async () => {
      await expect(
        loadDocsTabIndex('en', 'introduction'),
      ).resolves.toMatchObject({
        locale: 'en',
        tab: 'introduction',
        url: '/en/introduction/about-agora',
      });
    },
  );
});
