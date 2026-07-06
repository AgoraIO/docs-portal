import { afterEach, describe, expect, it } from 'vitest';
import {
  getRecentPages,
  RECENTLY_VIEWED_STORAGE_KEY,
  recordRecentPage,
} from './recently-viewed';

afterEach(() => {
  window.localStorage.clear();
});

describe('recently-viewed', () => {
  it('records a page and reads it back', () => {
    recordRecentPage({ title: 'A', url: '/en/a' });
    expect(getRecentPages()).toEqual([{ title: 'A', url: '/en/a' }]);
  });

  it('orders most-recent first and de-dupes by url, moving a revisit to the front with its latest title', () => {
    recordRecentPage({ title: 'A', url: '/en/a' });
    recordRecentPage({ title: 'B', url: '/en/b' });
    recordRecentPage({ title: 'A (updated)', url: '/en/a' });

    const pages = getRecentPages();
    expect(pages.map((p) => p.url)).toEqual(['/en/a', '/en/b']);
    expect(pages[0].title).toBe('A (updated)');
  });

  it('caps the stored list and keeps the newest entries', () => {
    for (let i = 0; i < 20; i++) {
      recordRecentPage({ title: `P${i}`, url: `/en/p${i}` });
    }
    const pages = getRecentPages();
    expect(pages.length).toBeLessThanOrEqual(12);
    expect(pages[0].url).toBe('/en/p19');
  });

  it('returns an empty list when storage is malformed', () => {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, 'not json');
    expect(getRecentPages()).toEqual([]);
  });

  it('ignores entries missing a url or title', () => {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([{ title: 'A', url: '/en/a' }, { title: 'no url' }, {}]),
    );
    expect(getRecentPages()).toEqual([{ title: 'A', url: '/en/a' }]);
  });
});
