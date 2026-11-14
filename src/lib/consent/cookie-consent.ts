// Typed access to the consent bridge in public/js/consent-bridge.js. `null` means the visitor's
// choice is not known yet; every caller must treat anything other than `true` as denied.

export const CONSENT_EVENT = 'agora:consent';

export type CategoryConsent = {
  advertisement: boolean | null;
  analytics: boolean | null;
  functionality: boolean | null;
};

type AgoraCookieConsent = {
  getCategoryConsent: () => CategoryConsent;
  isGlobalPrivacyControlActive: () => boolean;
  isReady: () => boolean;
};

declare global {
  interface Window {
    AgoraCookieConsent?: AgoraCookieConsent;
  }
}

const UNKNOWN_CONSENT: CategoryConsent = {
  advertisement: null,
  analytics: null,
  functionality: null,
};

export function getCategoryConsent(): CategoryConsent {
  if (typeof window === 'undefined') {
    return UNKNOWN_CONSENT;
  }

  try {
    const consent =
      window.AgoraCookieConsent?.getCategoryConsent() ?? UNKNOWN_CONSENT;

    return isGlobalPrivacyControlActive()
      ? { ...consent, advertisement: false }
      : consent;
  } catch {
    return UNKNOWN_CONSENT;
  }
}

export function isGlobalPrivacyControlActive() {
  return (
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

export function subscribeToConsent(
  onChange: (consent: CategoryConsent) => void,
) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleConsent = () => onChange(getCategoryConsent());
  window.addEventListener(CONSENT_EVENT, handleConsent);

  return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
}
