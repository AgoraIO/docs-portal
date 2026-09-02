const LOCATION_CHANGE_EVENT = 'docs-portal-location-change';

let historyPatchDepth = 0;
let restoreHistoryMethods: (() => void) | null = null;

export function subscribeToLocationChange(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const restoreHistoryPatch = patchHistoryForLocationChanges();
  window.addEventListener('popstate', onChange);
  window.addEventListener(LOCATION_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(LOCATION_CHANGE_EVENT, onChange);
    restoreHistoryPatch();
  };
}

function patchHistoryForLocationChanges() {
  historyPatchDepth += 1;

  if (!restoreHistoryMethods) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const result = originalPushState.call(this, data, unused, url);
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
      return result;
    } as History['pushState'];

    window.history.replaceState = function replaceState(
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const result = originalReplaceState.call(this, data, unused, url);
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
      return result;
    } as History['replaceState'];

    restoreHistoryMethods = () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }

  return () => {
    historyPatchDepth -= 1;

    if (historyPatchDepth === 0 && restoreHistoryMethods) {
      restoreHistoryMethods();
      restoreHistoryMethods = null;
    }
  };
}
