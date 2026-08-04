import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applySecuritiConsentBannerParams,
  CONSENT_SUBJECT_STORAGE_KEY,
  getConsentSubjectId,
} from './securiti-consent';

describe('Securiti consent subject ID', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.setConsentBannerParams;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
    delete window.setConsentBannerParams;
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

  it('passes the subject ID to setConsentBannerParams when available', () => {
    const setConsentBannerParams = vi.fn();
    window.setConsentBannerParams = setConsentBannerParams;

    const cleanup = applySecuritiConsentBannerParams();

    expect(setConsentBannerParams).toHaveBeenCalledWith({
      uuid: window.localStorage.getItem(CONSENT_SUBJECT_STORAGE_KEY),
    });

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
