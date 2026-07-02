import { describe, expect, it, vi } from 'vitest';
import { installVitePreloadErrorHandler } from './vite-preload-error';

type TestStorage = Pick<Storage, 'getItem' | 'setItem'>;

const reloadStorageKey = 'docs-portal:vite-preload-error-reload-attempted';

function createStorage(initialValue?: string): TestStorage {
  const storage = new Map<string, string>();

  if (initialValue) {
    storage.set(reloadStorageKey, initialValue);
  }

  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
  };
}

function createTestWindow(storage: TestStorage | undefined = createStorage()) {
  const eventTarget = new EventTarget();
  const reload = vi.fn();
  const window = {
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    location: {
      href: 'https://docs.agora.io/en/introduction/billing/account-settlement',
      reload,
    },
    name: '',
    sessionStorage: storage,
  };

  return {
    dispatchPreloadError(
      message = 'Failed to fetch dynamically imported module',
    ) {
      const event = new Event('vite:preloadError', {
        cancelable: true,
      }) as Event & { payload?: Error };

      event.payload = new Error(message);
      eventTarget.dispatchEvent(event);

      return event;
    },
    reload,
    window,
  };
}

describe('installVitePreloadErrorHandler', () => {
  it('prevents the preload error default and reloads the page once', () => {
    const { dispatchPreloadError, reload, window } = createTestWindow();

    installVitePreloadErrorHandler(window);

    const event = dispatchPreloadError();

    expect(event.defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when the same failure was already recovered', () => {
    const { dispatchPreloadError, reload, window } = createTestWindow(
      createStorage('Failed to fetch dynamically imported module'),
    );

    installVitePreloadErrorHandler(window);

    const event = dispatchPreloadError();
    expect(event.defaultPrevented).toBe(true);
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads a later distinct preload failure in the same tab', () => {
    const storage = createStorage('old chunk A');
    const { dispatchPreloadError, reload, window } = createTestWindow(storage);

    installVitePreloadErrorHandler(window);

    dispatchPreloadError('old chunk B');

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('falls back to window.name when session storage fails', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked storage');
      },
      setItem: () => {
        throw new Error('blocked storage');
      },
    };
    const { dispatchPreloadError, reload, window } = createTestWindow(storage);

    installVitePreloadErrorHandler(window);

    expect(() => dispatchPreloadError()).not.toThrow();
    expect(() => dispatchPreloadError()).not.toThrow();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when installed without a browser window', () => {
    expect(() => installVitePreloadErrorHandler(undefined)).not.toThrow();
  });
});
