const SEARCH_ATTRIBUTION_STORAGE_KEY = 'docs-portal:search-attribution:v1';
const SEARCH_ATTRIBUTION_MAX_AGE_MS = 30 * 60 * 1000;

export type PendingSearchLanding = {
  createdAt: number;
  href: string;
  queryAttemptId: string;
  searchSessionId: string;
};

export function savePendingSearchLanding(record: PendingSearchLanding) {
  try {
    window.sessionStorage.setItem(
      SEARCH_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(record),
    );
  } catch {
    // Storage may be blocked by browser privacy settings.
  }
}

export function consumePendingSearchLanding(
  pathname: string,
  now = Date.now(),
): PendingSearchLanding | null {
  let raw: string | null;

  try {
    raw = window.sessionStorage.getItem(SEARCH_ATTRIBUTION_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  let record: Partial<PendingSearchLanding>;
  try {
    record = JSON.parse(raw) as Partial<PendingSearchLanding>;
  } catch {
    clearPendingSearchLanding();
    return null;
  }

  if (
    typeof record.createdAt !== 'number' ||
    typeof record.href !== 'string' ||
    typeof record.queryAttemptId !== 'string' ||
    typeof record.searchSessionId !== 'string'
  ) {
    clearPendingSearchLanding();
    return null;
  }

  if (
    now - record.createdAt > SEARCH_ATTRIBUTION_MAX_AGE_MS ||
    now < record.createdAt
  ) {
    clearPendingSearchLanding();
    return null;
  }

  if (getPathname(record.href) !== getPathname(pathname)) {
    return null;
  }

  clearPendingSearchLanding();
  return record as PendingSearchLanding;
}

export function clearPendingSearchLanding() {
  try {
    window.sessionStorage.removeItem(SEARCH_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Storage may be blocked by browser privacy settings.
  }
}

function getPathname(value: string) {
  try {
    return new URL(value, window.location.origin).pathname;
  } catch {
    return value.split(/[?#]/u)[0] ?? value;
  }
}
