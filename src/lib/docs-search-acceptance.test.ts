import { describe, expect, it } from 'vitest';
import { loadDocsSearchIndex } from './docs-page.server';
import type { SearchEntry } from './docs-search';

function findMatches(pages: SearchEntry[], query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return pages.filter((page) => {
    const haystack = [page.title, page.description, page.url]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

describe('docs search acceptance coverage', () => {
  it('keeps the requested English dev search queries discoverable', async () => {
    const pages = await loadDocsSearchIndex('en');

    expect(findMatches(pages, 'cloud recording start')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: '/en/realtime-media/cloud-recording/rest-quickstart',
        }),
      ]),
    );
    expect(findMatches(pages, 'voice agent quickstart')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: '/en/ai/get-started/quickstart',
        }),
      ]),
    );
  });
});
