import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPendingSearchLanding,
  consumePendingSearchLanding,
  savePendingSearchLanding,
} from './search-attribution';

describe('search attribution storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('consumes a matching pending landing once', () => {
    savePendingSearchLanding({
      createdAt: 1_000,
      href: '/en/realtime-media/rtc/quickstart#join',
      queryAttemptId: 'attempt-1',
      searchSessionId: 'session-1',
    });

    expect(
      consumePendingSearchLanding('/en/realtime-media/rtc/quickstart', 2_000),
    ).toEqual({
      createdAt: 1_000,
      href: '/en/realtime-media/rtc/quickstart#join',
      queryAttemptId: 'attempt-1',
      searchSessionId: 'session-1',
    });
    expect(
      consumePendingSearchLanding('/en/realtime-media/rtc/quickstart', 2_000),
    ).toBeNull();
  });

  it('keeps a pending record for a different pathname', () => {
    savePendingSearchLanding({
      createdAt: 1_000,
      href: '/en/introduction/quickstart',
      queryAttemptId: 'attempt-1',
      searchSessionId: 'session-1',
    });

    expect(consumePendingSearchLanding('/en/introduction/other', 2_000)).toBe(
      null,
    );
    expect(
      consumePendingSearchLanding('/en/introduction/quickstart?source=search', 2_000),
    ).not.toBeNull();
  });

  it('removes expired and malformed records', () => {
    savePendingSearchLanding({
      createdAt: 1_000,
      href: '/en/expired',
      queryAttemptId: 'attempt-1',
      searchSessionId: 'session-1',
    });
    expect(consumePendingSearchLanding('/en/expired', 1_000 + 30 * 60 * 1000 + 1)).toBe(
      null,
    );

    window.sessionStorage.setItem('docs-portal:search-attribution:v1', '{bad');
    expect(consumePendingSearchLanding('/en/anything', 2_000)).toBeNull();
    expect(window.sessionStorage.getItem('docs-portal:search-attribution:v1')).toBeNull();
  });

  it('does not throw when session storage is unavailable', () => {
    const storagePrototype = Object.getPrototypeOf(window.sessionStorage);
    vi.spyOn(storagePrototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(storagePrototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(storagePrototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() =>
      savePendingSearchLanding({
        createdAt: 1_000,
        href: '/en/anything',
        queryAttemptId: 'attempt-1',
        searchSessionId: 'session-1',
      }),
    ).not.toThrow();
    expect(consumePendingSearchLanding('/en/anything', 2_000)).toBeNull();
    expect(() => clearPendingSearchLanding()).not.toThrow();
  });
});
