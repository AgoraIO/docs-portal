import { useMemo, useSyncExternalStore } from 'react';
import {
  DOC_VERSION_SCOPES,
  type DocVersionSelections,
  getDocVersionSelections,
} from './doc-versions';

export const DOC_VERSION_STORAGE_KEY = 'agora-docs:document-versions:v1';
const CHANGE_EVENT = 'agora-docs:document-version-change';
let memorySnapshot: string | null = null;
let storageUnavailable = false;

function getSnapshot() {
  try {
    return storageUnavailable
      ? memorySnapshot
      : window.localStorage.getItem(DOC_VERSION_STORAGE_KEY);
  } catch {
    return memorySnapshot;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === DOC_VERSION_STORAGE_KEY || event.key === null) {
      memorySnapshot = null;
      storageUnavailable = false;
      onChange();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
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
  if (
    !DOC_VERSION_SCOPES.some(
      (scope) =>
        scope.id === scopeId &&
        scope.versions.some((version) => version.id === versionId),
    )
  )
    return;
  const next = JSON.stringify({
    ...parseDocVersionPreferences(getSnapshot()),
    [scopeId]: versionId,
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

export function useDocVersionSelections(href = '') {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return useMemo(
    () => getDocVersionSelections(href, parseDocVersionPreferences(snapshot)),
    [href, snapshot],
  );
}

export function getStoredDocVersionSelections(href: string) {
  return getDocVersionSelections(
    href,
    parseDocVersionPreferences(getSnapshot()),
  );
}
