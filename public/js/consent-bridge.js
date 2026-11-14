// Consent bridge between the Securiti cookie consent SDK and docs-portal code.
// Loaded synchronously in <head>, after Securiti auto-blocking and before the SDK loader, so its
// SecuritiDataLayer callbacks are queued before the SDK starts. Mirrors the www.agora.io bridge:
// categories are matched by their unique base_category name, never numeric IDs, and Global
// Privacy Control always denies Advertising. Unknown consent (SDK not ready) means denied.
(() => {
  if (window.AgoraCookieConsent) return;

  const CONSENT_EVENT = 'agora:consent';
  const CATEGORY_BASES = {
    analytics: 'Analytics & Customization',
    advertisement: 'Advertising',
    functionality: 'Performance & Functionality',
  };
  // Optional first-party cookies and storage keys to remove when their category is denied.
  const ANALYTICS_PREFIXES = ['ph_'];

  const gpc = () => window.navigator?.globalPrivacyControl === true;
  let ready = false;
  let state = {
    analytics: null,
    advertisement: gpc() ? false : null,
    functionality: null,
  };

  window.AgoraCookieConsent = Object.freeze({
    getCategoryConsent: () => Object.freeze({ ...state }),
    isGlobalPrivacyControlActive: gpc,
    isReady: () => ready,
  });

  // Expire host-only and agora.io parent-domain cookies at every visible path scope.
  const expireCookies = (prefixes) => {
    const names = document.cookie
      .split(';')
      .map((part) => part.split('=')[0].trim())
      .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)));
    if (names.length === 0) return;
    const { hostname, pathname } = window.location;
    const domains = new Set(['', hostname]);
    if (hostname === 'agora.io' || hostname.endsWith('.agora.io')) {
      domains.add('agora.io');
    }
    const paths = new Set(['/']);
    let path = '';
    for (const segment of pathname.split('/').filter(Boolean)) {
      path += `/${segment}`;
      paths.add(path);
      paths.add(`${path}/`);
    }
    for (const name of names) {
      for (const domain of domains) {
        for (const cookiePath of paths) {
          document.cookie = `${name}=; Max-Age=0; Path=${cookiePath}${domain ? `; Domain=${domain}` : ''}`;
        }
      }
    }
  };

  const removeStorage = (prefixes) => {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        for (const key of Object.keys(storage)) {
          if (prefixes.some((prefix) => key.startsWith(prefix))) {
            storage.removeItem(key);
          }
        }
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }
    }
  };

  const findCategory = (api, base) => {
    const matches = api
      .getCategories()
      .filter((category) => category.base_category === base);
    return matches.length === 1 ? matches[0] : undefined;
  };

  const publish = (api, consent) => {
    const resolve = (key) => {
      if (key === 'advertisement' && gpc()) return false;
      try {
        const category = findCategory(api, CATEGORY_BASES[key]);
        return Boolean(
          category && consent?.category?.[category.name] === 'granted',
        );
      } catch {
        return false;
      }
    };
    ready = true;
    state = {
      analytics: resolve('analytics'),
      advertisement: resolve('advertisement'),
      functionality: resolve('functionality'),
    };
    if (state.analytics === false) {
      try {
        expireCookies(ANALYTICS_PREFIXES);
        removeStorage(ANALYTICS_PREFIXES);
      } catch {
        // Cookie restrictions must not block publishing the denied state.
      }
    }
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT, {
        detail: window.AgoraCookieConsent.getCategoryConsent(),
      }),
    );
  };

  window.SecuritiDataLayer = window.SecuritiDataLayer || [];
  window.SecuritiDataLayer.push([
    'onReady',
    (api) => publish(api, api.getConsent()),
  ]);
  window.SecuritiDataLayer.push([
    'onConsentGiven',
    (api, consent) => publish(api, consent),
  ]);

  document.addEventListener('click', (event) => {
    const trigger =
      event.target instanceof Element
        ? event.target.closest('[data-cookie-preferences]')
        : null;
    if (!trigger) return;
    event.preventDefault();
    if (ready && typeof window.showConsentPreferencesPopup === 'function') {
      window.showConsentPreferencesPopup();
    }
  });
})();
