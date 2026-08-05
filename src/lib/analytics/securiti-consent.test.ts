import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applySecuritiConsentBannerParams,
  CONSENT_SUBJECT_STORAGE_KEY,
  ensureSecuritiBannerLayoutStyles,
  getConsentSubjectId,
  SECURITI_BANNER_LAYOUT_STYLE_ID,
} from './securiti-consent';

describe('Securiti consent subject ID', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.setConsentBannerParams;
    document.getElementById(SECURITI_BANNER_LAYOUT_STYLE_ID)?.remove();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
    delete window.setConsentBannerParams;
    document.getElementById(SECURITI_BANNER_LAYOUT_STYLE_ID)?.remove();
  });

  it('creates and reuses a stable anonymous ID in localStorage', () => {
    const first = getConsentSubjectId();
    const second = getConsentSubjectId();

    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(second).toBe(first);
    expect(window.localStorage.getItem(CONSENT_SUBJECT_STORAGE_KEY)).toBe(
      first,
    );
  });

  it('falls back to a generated ID when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const id = getConsentSubjectId();

    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('injects layout styles that allow the opt-out label to wrap', () => {
    const cleanup = ensureSecuritiBannerLayoutStyles();
    const style = document.getElementById(SECURITI_BANNER_LAYOUT_STYLE_ID);

    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('white-space: normal !important');
    expect(style?.textContent).toContain('#securitiCmpCookiePrefBtn');

    cleanup();
    expect(document.getElementById(SECURITI_BANNER_LAYOUT_STYLE_ID)).toBeNull();
  });

  it('passes the subject ID to setConsentBannerParams when available', () => {
    const setConsentBannerParams = vi.fn();
    window.setConsentBannerParams = setConsentBannerParams;

    const cleanup = applySecuritiConsentBannerParams();

    expect(setConsentBannerParams).toHaveBeenCalledWith({
      uuid: window.localStorage.getItem(CONSENT_SUBJECT_STORAGE_KEY),
    });
    expect(
      document.getElementById(SECURITI_BANNER_LAYOUT_STYLE_ID),
    ).not.toBeNull();

    cleanup();
  });

  it('waits for setConsentBannerParams when the SDK loads later', async () => {
    vi.useFakeTimers();
    const setConsentBannerParams = vi.fn();

    const cleanup = applySecuritiConsentBannerParams();
    expect(setConsentBannerParams).not.toHaveBeenCalled();

    window.setConsentBannerParams = setConsentBannerParams;
    await vi.advanceTimersByTimeAsync(100);

    expect(setConsentBannerParams).toHaveBeenCalledWith({
      uuid: window.localStorage.getItem(CONSENT_SUBJECT_STORAGE_KEY),
    });

    cleanup();
    vi.useRealTimers();
  });
});
