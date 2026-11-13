import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApiCatalogReturn } from './useApiCatalogReturn';

describe('catalog return within an SDK scope', () => {
  beforeEach(() => sessionStorage.clear());
  const href =
    '/zh-CN/api-reference/api?product=rtc&platform=android#api-reference-product-rtc';
  const search = `?apiReturn=${encodeURIComponent(href)}`;

  it('retains the return filters on sidebar/deep-page navigation in the same SDK', () => {
    const { result, rerender } = renderHook(
      ({ query, path }) => useApiCatalogReturn(query, path, true),
      {
        initialProps: {
          query: search,
          path: '/zh-CN/api-reference/rtc/android/overview',
        },
      },
    );
    expect(result.current).toBe(href);
    rerender({
      query: '',
      path: '/zh-CN/api-reference/rtc/android/class-engine',
    });
    expect(result.current).toBe(href);
    rerender({
      query: '',
      path: '/zh-CN/api-reference/conversational-ai/ios/overview',
    });
    expect(result.current).toBeUndefined();
  });

  it('does not apply catalog state in ordinary documentation', () => {
    const { result } = renderHook(() =>
      useApiCatalogReturn(search, '/zh-CN/realtime-media/rtc', false),
    );
    expect(result.current).toBeUndefined();
  });

  it('expires remembered filters when navigating within the same SDK after thirty minutes', () => {
    let now = 1_000_000;
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => now);
    try {
      const { result, rerender } = renderHook(
        ({ query, path }) => useApiCatalogReturn(query, path, true),
        {
          initialProps: {
            query: search,
            path: '/zh-CN/api-reference/rtc/android/overview',
          },
        },
      );
      rerender({ query: '', path: '/zh-CN/api-reference/rtc/android/engine' });
      expect(result.current).toBe(href);
      now += 31 * 60 * 1000;
      rerender({ query: '', path: '/zh-CN/api-reference/rtc/android/channel' });
      expect(result.current).toBeUndefined();
    } finally {
      clock.mockRestore();
    }
  });

  it('keeps explicit return navigation usable when storage is unavailable', () => {
    const storage = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    try {
      const { result } = renderHook(() =>
        useApiCatalogReturn(
          search,
          '/api-reference/rtc/android/overview',
          true,
        ),
      );
      expect(result.current).toBe(href);
    } finally {
      storage.mockRestore();
    }
  });
});
