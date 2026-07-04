// Recently-viewed docs pages, persisted in localStorage so the search dialog
// can offer them as a starting point before the user types anything.

export const RECENTLY_VIEWED_STORAGE_KEY = 'docs-portal:recently-viewed:v1';

// How many entries we retain. The dialog shows a smaller slice; the extra
// headroom means a page that scrolls off the visible list is still remembered.
const MAX_STORED = 12;

export type RecentPage = {
  description?: string;
  title: string;
  url: string;
};

export function getRecentPages(): RecentPage[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is RecentPage =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as RecentPage).url === 'string' &&
        typeof (item as RecentPage).title === 'string',
    );
  } catch {
    return [];
  }
}

export function recordRecentPage(entry: RecentPage): void {
  if (typeof window === 'undefined' || !entry.url || !entry.title) {
    return;
  }

  try {
    // Move a revisited page to the front (with its latest title/description)
    // rather than duplicating it, and cap the retained history.
    const next = [
      { description: entry.description, title: entry.title, url: entry.url },
      ...getRecentPages().filter((page) => page.url !== entry.url),
    ].slice(0, MAX_STORED);

    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Ignore storage errors (private mode, quota, disabled storage).
  }
}
