import {
  DOC_VERSION_SCOPES,
  type DocVersionSelections,
  getDocVersionSelections,
} from './doc-versions';

export const DOC_VERSION_STORAGE_KEY = 'agora-docs:document-versions:v1';
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
}

export function getStoredDocVersionSelections(href: string) {
  return getDocVersionSelections(
    href,
    parseDocVersionPreferences(getSnapshot()),
  );
}
