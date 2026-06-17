import { describe, expect, it } from 'vitest';
import { getDocsIndex } from './docs-index.server';
import {
  getDocsIndexNodeMeta,
  getDocsIndexPage,
  getDocsIndexPages,
  getDocsIndexPageTree,
} from './docs-index-tree';

describe('docs index tree helpers', () => {
  it('returns ordinary docs pages by locale and source slugs', () => {
    const index = getDocsIndex();

    expect(getDocsIndexPages(index, 'en').length).toBeGreaterThan(0);
    expect(getDocsIndexPage(index, ['ai', 'custom-llm'], 'en')?.routePath).toBe(
      '/en/ai/custom-llm',
    );
    expect(getDocsIndexPage(index, ['introduction'], 'en')?.routePath).toBe(
      '/en/introduction',
    );
  });

  it('returns a locale page tree and folder meta for nav-scope consumers', () => {
    const index = getDocsIndex();
    const root = getDocsIndexPageTree(index, 'en');

    expect(root.type).toBe('folder');
    expect(root.children.length).toBeGreaterThan(0);
    expect(getDocsIndexNodeMeta(index, 'en/realtime-media/rtc')?.navScope)
      .toMatchObject({
        defaultVersion: 'android',
      });
  });
});
