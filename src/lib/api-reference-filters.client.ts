export type ApiReferenceFilterName = 'apiType' | 'platform' | 'product';

const API_REFERENCE_FILTERS_CHANGED_EVENT =
  'docs:api-reference-filters-changed';

export function readApiReferenceFilter(name: ApiReferenceFilterName) {
  if (typeof window === 'undefined') {
    return 'all';
  }

  return new URLSearchParams(window.location.search).get(name) ?? 'all';
}

export function replaceApiReferenceFilters(
  filters: Partial<Record<ApiReferenceFilterName, string>>,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  for (const [name, value] of Object.entries(filters)) {
    if (!value || value === 'all') {
      params.delete(name);
    } else {
      params.set(name, value);
    }
  }

  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl === currentUrl) {
    return;
  }

  window.history.replaceState(window.history.state, '', nextUrl);
  window.dispatchEvent(new Event(API_REFERENCE_FILTERS_CHANGED_EVENT));
}

export function subscribeToApiReferenceFilters(callback: () => void) {
  window.addEventListener(API_REFERENCE_FILTERS_CHANGED_EVENT, callback);
  window.addEventListener('popstate', callback);

  return () => {
    window.removeEventListener(API_REFERENCE_FILTERS_CHANGED_EVENT, callback);
    window.removeEventListener('popstate', callback);
  };
}
