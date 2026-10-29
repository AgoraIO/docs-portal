import {
  DOC_VERSION_SCOPES,
  type DocVersionSelections,
  getDocVersionSelections,
} from './doc-versions';

export const DOC_VERSION_STORAGE_KEY = 'agora-docs:document-versions:v1';
let memorySnapshot: string | null = null;
let storageUnavailable = false;
const CHANGE_EVENT = 'docs:document-version-change';

export function getDocVersionPreferenceSnapshot() {
  try {
    return storageUnavailable
      ? memorySnapshot
      : window.localStorage.getItem(DOC_VERSION_STORAGE_KEY);
  } catch {
    return memorySnapshot;
  }
}

export function subscribeDocVersionPreferences(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === DOC_VERSION_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function parseDocVersionPreferences(
  value: string | null,
): DocVersionSelections {
  try {
    const parsed: unknown = JSON.parse(value ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, id]) => typeof id === 'string'),
    );
  } catch {
    return {};
  }
}

export function setDocVersionPreference(scopeId: string, versionId: string) {
  const scope = DOC_VERSION_SCOPES.find((item) => item.id === scopeId);
  if (!scope?.versions.some((version) => version.id === versionId)) return;
  const next = JSON.stringify({
    ...parseDocVersionPreferences(getDocVersionPreferenceSnapshot()),
    [scope.preferenceKey ?? scope.id]: versionId,
  });
  memorySnapshot = next;
  try {
    window.localStorage.setItem(DOC_VERSION_STORAGE_KEY, next);
    storageUnavailable = false;
  } catch {
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getStoredDocVersionSelections(href: string) {
  return getDocVersionSelections(
    href,
    parseDocVersionPreferences(getDocVersionPreferenceSnapshot()),
  );
}
