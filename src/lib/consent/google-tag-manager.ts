import {
  type CategoryConsent,
  getCategoryConsent,
  isGlobalPrivacyControlActive,
  subscribeToConsent,
} from './cookie-consent';

// The docs GTM container runs analytics and advertising Custom HTML tags (PostHog, Reo.dev)
// without consent triggers, so the container starts only once both categories are granted and
// never under Global Privacy Control. A started container cannot be unloaded; withdrawal takes
// full effect on the next page load, while the consent bridge expires optional cookies at once.

type GtmWindow = Window & {
  __agoraGtmStarted?: boolean;
  dataLayer?: unknown[];
};

export function canStartGoogleTagManager(consent: CategoryConsent) {
  return (
    !isGlobalPrivacyControlActive() &&
    consent.analytics === true &&
    consent.advertisement === true
  );
}

export function startGoogleTagManagerWhenConsented(containerId?: string) {
  const id = containerId?.trim();

  if (typeof window === 'undefined' || !id) {
    return () => {};
  }

  const start = (consent: CategoryConsent) => {
    const gtmWindow = window as GtmWindow;

    if (!canStartGoogleTagManager(consent) || gtmWindow.__agoraGtmStarted) {
      return;
    }

    gtmWindow.__agoraGtmStarted = true;
    gtmWindow.dataLayer = gtmWindow.dataLayer || [];
    gtmWindow.dataLayer.push({
      event: 'gtm.js',
      'gtm.start': Date.now(),
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  };

  start(getCategoryConsent());
  return subscribeToConsent(start);
}
