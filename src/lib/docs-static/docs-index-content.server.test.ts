import { describe, expect, it } from 'vitest';
import {
  getDocsIndexPageSource,
  getDocsIndexPageSourceByContentPath,
  getDocsIndexPageSourceByRoutePath,
  getDocsIndexPageTocFromSource,
} from './docs-index-content.server';

describe('docs index content helpers', () => {
  it('loads raw source text by route path for ordinary docs pages', () => {
    const page = getDocsIndexPageSourceByRoutePath('/en/introduction/about-agora');

    expect(page).toMatchObject({
      contentPath: 'en/introduction/about-agora.mdx',
      routePath: '/en/introduction/about-agora',
      title: 'About Agora',
    });
    expect(page?.sourceText).toContain('## What Agora is');
  });

  it('loads raw source text by content path for ordinary docs pages', () => {
    const page = getDocsIndexPageSourceByContentPath(
      'en/introduction/about-agora.mdx',
    );

    expect(page?.routePath).toBe('/en/introduction/about-agora');
    expect(page?.sourceText).toContain('## Product families');
  });

  it('extracts a basic toc from markdown headings', () => {
    const page = getDocsIndexPageSource('en', ['introduction', 'about-agora']);
    const toc = page ? getDocsIndexPageTocFromSource(page.sourceText) : [];

    expect(toc).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          depth: 2,
          title: 'What Agora is',
          url: '#what-agora-is',
        }),
        expect.objectContaining({
          depth: 2,
          title: 'Product families',
          url: '#product-families',
        }),
      ]),
    );
  });
});
