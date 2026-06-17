import { describe, expect, it } from 'vitest';
import { getDocsManifest } from './docs-manifest.server';

describe('getDocsManifest', () => {
  it('indexes docs pages with route metadata', () => {
    const manifest = getDocsManifest();
    const page = manifest.pagesByRoutePath.get('/en/ai/custom-llm');

    expect(page).toMatchObject({
      contentPath: 'en/ai/custom-llm.mdx',
      locale: 'en',
      routePath: '/en/ai/custom-llm',
      slugSegments: ['custom-llm'],
      sourceSlugs: ['ai', 'custom-llm'],
      tab: 'ai',
    });
    expect(page?.title).toBeTruthy();
  });

  it('includes tab index pages without slug segments', () => {
    const manifest = getDocsManifest();
    const page = manifest.pagesByRoutePath.get('/en/ai');

    expect(page).toMatchObject({
      contentPath: 'en/ai/index.mdx',
      routePath: '/en/ai',
      slugSegments: [],
      sourceSlugs: ['ai'],
      tab: 'ai',
    });
  });

  it('groups pages by locale', () => {
    const manifest = getDocsManifest();

    expect(manifest.pagesByLocale.en.length).toBeGreaterThan(0);
    expect(manifest.pagesByLocale['zh-CN'].length).toBeGreaterThan(0);
  });
});
