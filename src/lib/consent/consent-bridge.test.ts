import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CategoryConsent, getCategoryConsent } from './cookie-consent';

// public/js/consent-bridge.js runs as a classic script before the Securiti SDK loads.
const bridgeSource = readFileSync(
  join(process.cwd(), 'public/js/consent-bridge.js'),
  'utf8',
);

type SecuritiCallback = (api: FakeSecuritiApi, consent?: unknown) => void;
type FakeSecuritiApi = {
  getCategories: () => Array<{ base_category: string; name: string }>;
  getConsent: () => unknown;
};
type BridgeWindow = Window & {
  SecuritiDataLayer?: Array<[string, SecuritiCallback]>;
  showConsentPreferencesPopup?: () => void;
};

const categories = [
  { base_category: 'Strictly Necessary', name: 'Essential' },
  { base_category: 'Analytics & Customization', name: 'Analytics' },
  { base_category: 'Advertising', name: 'Marketing' },
  { base_category: 'Performance & Functionality', name: 'Functional' },
];

function createApi(consent: unknown): FakeSecuritiApi {
  return { getCategories: () => categories, getConsent: () => consent };
}

function receipt(choices: Record<string, 'granted' | 'denied'>) {
  return { category: choices };
}

function runSdkCallback(name: string, api: FakeSecuritiApi, consent?: unknown) {
  for (const [event, callback] of (window as BridgeWindow).SecuritiDataLayer ??
    []) {
    if (event === name) {
      callback(api, consent);
    }
  }
}

const documentListeners: Array<[string, EventListenerOrEventListenerObject]> =
  [];

function loadBridge() {
  // Track the bridge's document listeners so each test starts from a clean page.
  const addListener = document.addEventListener.bind(document);
  const spy = vi
    .spyOn(document, 'addEventListener')
    .mockImplementation((type: string, listener, options?) => {
      documentListeners.push([type, listener]);
      addListener(type, listener, options);
    });
  new Function(bridgeSource)();
  spy.mockRestore();
}

describe('consent bridge', () => {
  let events: CategoryConsent[];
  const recordEvent = (event: Event) =>
    events.push((event as CustomEvent<CategoryConsent>).detail);

  beforeEach(() => {
    events = [];
    window.addEventListener('agora:consent', recordEvent);
  });

  afterEach(() => {
    window.removeEventListener('agora:consent', recordEvent);
    for (const [type, listener] of documentListeners.splice(0)) {
      document.removeEventListener(type, listener);
    }
    vi.unstubAllGlobals();
    delete window.AgoraCookieConsent;
    delete (window as BridgeWindow).SecuritiDataLayer;
    delete (window as BridgeWindow).showConsentPreferencesPopup;
    for (const name of document.cookie.split(';').map((c) => c.split('=')[0])) {
      // biome-ignore lint/suspicious/noDocumentCookie: Test cleanup for cookies set by the bridge tests.
      document.cookie = `${name.trim()}=; Max-Age=0; Path=/`;
    }
    window.localStorage.clear();
  });

  it('reports unknown consent until the SDK is ready', () => {
    loadBridge();

    expect(window.AgoraCookieConsent?.isReady()).toBe(false);
    expect(getCategoryConsent()).toEqual({
      advertisement: null,
      analytics: null,
      functionality: null,
    });
  });

  it('resolves categories by base_category name and publishes them', () => {
    loadBridge();
    runSdkCallback(
      'onReady',
      createApi(
        receipt({
          Analytics: 'granted',
          Functional: 'denied',
          Marketing: 'granted',
        }),
      ),
    );

    expect(window.AgoraCookieConsent?.isReady()).toBe(true);
    expect(events).toEqual([
      { advertisement: true, analytics: true, functionality: false },
    ]);
  });

  it('treats a missing receipt or an ambiguous category as denied', () => {
    loadBridge();
    runSdkCallback('onReady', createApi(null));

    const duplicateApi = {
      getCategories: () => [
        ...categories,
        { base_category: 'Analytics & Customization', name: 'Analytics 2' },
      ],
      getConsent: () => receipt({ Analytics: 'granted' }),
    };
    runSdkCallback('onConsentGiven', duplicateApi, duplicateApi.getConsent());

    expect(events).toEqual([
      { advertisement: false, analytics: false, functionality: false },
      { advertisement: false, analytics: false, functionality: false },
    ]);
  });

  it('forces Advertising off under Global Privacy Control without granting Analytics', () => {
    vi.stubGlobal('navigator', {
      ...window.navigator,
      globalPrivacyControl: true,
    });
    loadBridge();

    expect(getCategoryConsent()).toEqual({
      advertisement: false,
      analytics: null,
      functionality: null,
    });

    runSdkCallback(
      'onConsentGiven',
      createApi(null),
      receipt({ Analytics: 'denied', Marketing: 'granted' }),
    );

    expect(events.at(-1)).toEqual({
      advertisement: false,
      analytics: false,
      functionality: false,
    });
  });

  it('removes PostHog cookies and storage when Analytics is denied', () => {
    // biome-ignore lint/suspicious/noDocumentCookie: Seeds a PostHog cookie for the cleanup test.
    document.cookie = 'ph_phc_test_posthog=1; Path=/';
    // biome-ignore lint/suspicious/noDocumentCookie: Seeds an unrelated cookie that must survive.
    document.cookie = 'docs_theme=dark; Path=/';
    window.localStorage.setItem('ph_phc_test_posthog', '{}');
    window.localStorage.setItem('__ph_opt_in_out_phc_test', '0');
    loadBridge();

    runSdkCallback(
      'onConsentGiven',
      createApi(null),
      receipt({ Analytics: 'denied' }),
    );

    expect(document.cookie).not.toContain('ph_phc_test_posthog');
    expect(document.cookie).toContain('docs_theme=dark');
    expect(window.localStorage.getItem('ph_phc_test_posthog')).toBeNull();
    // PostHog's own opt-out marker must survive so the SDK stays opted out.
    expect(window.localStorage.getItem('__ph_opt_in_out_phc_test')).toBe('0');
  });

  it('opens the Securiti preference center from [data-cookie-preferences]', () => {
    const showPopup = vi.fn();
    (window as BridgeWindow).showConsentPreferencesPopup = showPopup;
    document.body.innerHTML =
      '<button type="button" data-cookie-preferences><span>Manage My Cookies</span></button>';
    loadBridge();

    const button = document.querySelector('span') as HTMLElement;
    button.click();
    expect(showPopup).not.toHaveBeenCalled();

    runSdkCallback('onReady', createApi(null));
    button.click();
    expect(showPopup).toHaveBeenCalledTimes(1);
    document.body.innerHTML = '';
  });
});
