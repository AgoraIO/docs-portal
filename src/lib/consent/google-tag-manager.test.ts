import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CategoryConsent } from './cookie-consent';
import { startGoogleTagManagerWhenConsented } from './google-tag-manager';

type GtmWindow = Window & {
  __agoraGtmStarted?: boolean;
  dataLayer?: unknown[];
};

let consent: CategoryConsent;
let stop: () => void = () => {};

function publish(next: Partial<CategoryConsent>) {
  consent = { ...consent, ...next };
  window.dispatchEvent(new CustomEvent('agora:consent', { detail: consent }));
}

function gtmScripts() {
  return document.querySelectorAll('script[src*="googletagmanager.com"]');
}

describe('startGoogleTagManagerWhenConsented', () => {
  beforeEach(() => {
    consent = { advertisement: null, analytics: null, functionality: null };
    window.AgoraCookieConsent = {
      getCategoryConsent: () => consent,
      isGlobalPrivacyControlActive: () => false,
      isReady: () => consent.analytics !== null,
    };
  });

  afterEach(() => {
    stop();
    vi.unstubAllGlobals();
    delete window.AgoraCookieConsent;
    delete (window as GtmWindow).__agoraGtmStarted;
    delete (window as GtmWindow).dataLayer;
    for (const script of gtmScripts()) {
      script.remove();
    }
  });

  it('does not load GTM before consent or with only one category granted', () => {
    stop = startGoogleTagManagerWhenConsented('GTM-TKTWGML');
    expect(gtmScripts()).toHaveLength(0);

    publish({ advertisement: false, analytics: true });
    expect(gtmScripts()).toHaveLength(0);

    publish({ advertisement: true, analytics: false });
    expect(gtmScripts()).toHaveLength(0);
    expect((window as GtmWindow).dataLayer).toBeUndefined();
  });

  it('starts GTM once when Analytics and Advertising are granted', () => {
    stop = startGoogleTagManagerWhenConsented('GTM-TKTWGML');

    publish({ advertisement: true, analytics: true });
    publish({ functionality: true });

    expect(gtmScripts()).toHaveLength(1);
    expect(gtmScripts()[0]).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtm.js?id=GTM-TKTWGML',
    );
    expect((window as GtmWindow).dataLayer).toEqual([
      expect.objectContaining({ event: 'gtm.js' }),
    ]);
  });

  it('starts immediately when consent was already granted', () => {
    consent = { advertisement: true, analytics: true, functionality: false };
    stop = startGoogleTagManagerWhenConsented('GTM-TKTWGML');

    expect(gtmScripts()).toHaveLength(1);
  });

  it('never starts under Global Privacy Control, even if the provider reports a grant', () => {
    vi.stubGlobal('navigator', {
      ...window.navigator,
      globalPrivacyControl: true,
    });
    stop = startGoogleTagManagerWhenConsented('GTM-TKTWGML');

    publish({ advertisement: true, analytics: true });

    expect(gtmScripts()).toHaveLength(0);
  });

  it('does nothing without a container ID', () => {
    consent = { advertisement: true, analytics: true, functionality: true };
    stop = startGoogleTagManagerWhenConsented(' ');

    expect(gtmScripts()).toHaveLength(0);
  });
});
