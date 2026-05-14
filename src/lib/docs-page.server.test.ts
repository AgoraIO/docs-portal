import { describe, expect, it } from 'vitest';
import { loadDocsTabIndex } from './docs-page.server';

describe('loadDocsTabIndex', () => {
  it(
    'uses the real tab index page when the tab has index content',
    async () => {
      await expect(loadDocsTabIndex('en', 'ai')).resolves.toMatchObject({
        locale: 'en',
        tab: 'ai',
        url: '/en/ai',
      });
    },
    20_000,
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
    20_000,
  );
});
