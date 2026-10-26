import { isKnownPlatform, type PlatformKey } from '../platforms/registry';

export type CnSearchSession = {
  query: string;
  platform: PlatformKey | null;
  scope: string | null;
};

const storageKey = 'docs-portal:cn-search-sessions:v1';
export const CN_SEARCH_SESSION_CHANGED =
  'docs-portal:cn-search-session-changed';
const maxAge = 30 * 60 * 1000;
type SavedSession = CnSearchSession & { path: string; savedAt: number };

function readSessions(): SavedSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const items: unknown = JSON.parse(
      window.sessionStorage.getItem(storageKey) ?? '[]',
    );
    if (!Array.isArray(items)) return [];
    return items
      .filter(
        (item): item is SavedSession =>
          item &&
          typeof item === 'object' &&
          typeof item.path === 'string' &&
          item.path.startsWith('/') &&
          typeof item.query === 'string' &&
          item.query.length <= 500 &&
          (item.platform === null ||
            (typeof item.platform === 'string' &&
              isKnownPlatform(item.platform))) &&
          (item.scope === null ||
            (typeof item.scope === 'string' && item.scope.length <= 200)) &&
          typeof item.savedAt === 'number' &&
          Number.isFinite(item.savedAt) &&
          item.savedAt <= Date.now() &&
          Date.now() - item.savedAt < maxAge,
      )
      .slice(-8);
  } catch {
    return [];
  }
}

export function readCnSearchSession(path: string): CnSearchSession | undefined {
  const item = readSessions().find((item) => item.path === path);
  return item
    ? { query: item.query, platform: item.platform, scope: item.scope }
    : undefined;
}

export function saveCnSearchSession(path: string, session: CnSearchSession) {
  if (typeof window === 'undefined') return;
  try {
    const items = readSessions().filter((item) => item.path !== path);
    items.push({
      ...session,
      query: session.query.slice(0, 500),
      path,
      savedAt: Date.now(),
    });
    window.sessionStorage.setItem(storageKey, JSON.stringify(items.slice(-8)));
    window.dispatchEvent(new Event(CN_SEARCH_SESSION_CHANGED));
  } catch {
    // Storage is optional; blocked storage must not prevent search/navigation.
  }
}
