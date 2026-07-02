const VITE_PRELOAD_ERROR_RELOAD_KEY =
  'docs-portal:vite-preload-error-reload-attempted';
const VITE_PRELOAD_ERROR_WINDOW_NAME_PREFIX = 'docs-portal:vite-preload-error:';

type VitePreloadErrorWindow = {
  addEventListener: (type: string, listener: EventListener) => void;
  location: Pick<Location, 'href' | 'reload'>;
  name?: string;
  sessionStorage?: Pick<Storage, 'getItem' | 'setItem'>;
};

type VitePreloadErrorEvent = Event & { payload?: unknown };

const installedWindows = new WeakSet<VitePreloadErrorWindow>();

export function installVitePreloadErrorHandler(
  browserWindow: VitePreloadErrorWindow | undefined = getBrowserWindow(),
) {
  if (!browserWindow || installedWindows.has(browserWindow)) {
    return;
  }

  installedWindows.add(browserWindow);

  browserWindow.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();

    const signature = getPreloadErrorSignature(
      event as VitePreloadErrorEvent,
      browserWindow.location.href,
    );

    if (!markReloadAttempt(browserWindow, signature)) {
      return;
    }

    browserWindow.location.reload();
  });
}

function getBrowserWindow(): VitePreloadErrorWindow | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window;
}

function getPreloadErrorSignature(
  event: VitePreloadErrorEvent,
  currentUrl: string,
) {
  const { payload } = event;

  if (payload instanceof Error && payload.message) {
    return payload.message;
  }

  if (typeof payload === 'string' && payload) {
    return payload;
  }

  return currentUrl;
}

function markReloadAttempt(
  browserWindow: VitePreloadErrorWindow,
  signature: string,
) {
  const storageResult = markStorageReloadAttempt(
    browserWindow.sessionStorage,
    signature,
  );

  if (storageResult !== undefined) {
    return storageResult;
  }

  return markWindowNameReloadAttempt(browserWindow, signature);
}

function markStorageReloadAttempt(
  storage: VitePreloadErrorWindow['sessionStorage'],
  signature: string,
) {
  if (!storage) {
    return undefined;
  }

  try {
    if (storage.getItem(VITE_PRELOAD_ERROR_RELOAD_KEY) === signature) {
      return false;
    }

    storage.setItem(VITE_PRELOAD_ERROR_RELOAD_KEY, signature);
    return true;
  } catch {
    return undefined;
  }
}

function markWindowNameReloadAttempt(
  browserWindow: VitePreloadErrorWindow,
  signature: string,
) {
  const encodedSignature = encodeURIComponent(signature);
  const guardValue = `${VITE_PRELOAD_ERROR_WINDOW_NAME_PREFIX}${encodedSignature}`;

  if (browserWindow.name === guardValue) {
    return false;
  }

  browserWindow.name = guardValue;
  return true;
}
