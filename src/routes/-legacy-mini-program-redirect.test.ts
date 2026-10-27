import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { Route } from './doc/$';

function loadLegacyDoc(splat: string) {
  const loader = Route.options.loader as (context: {
    params: { _splat: string };
  }) => never;
  try {
    loader({ params: { _splat: splat } });
  } catch (error) {
    expect(isRedirect(error)).toBe(true);
    return error;
  }
  throw new Error('Expected the legacy route to redirect.');
}

describe('legacy RTC mini-program setup redirect', () => {
  it.each([
    'rtc/mini-program/get-started/enable-service',
    'rtc/mini-program/get-started/enable-service/',
  ])('permanently redirects %s directly to the mini-program tab', (splat) => {
    expect(loadLegacyDoc(splat)).toMatchObject({
      options: {
        href: '/realtime-media/rtc/build/setup-and-access/enable-service#mini-program-service',
        statusCode: 301,
      },
      status: 301,
    });
  });

  it('keeps other platform guides on the existing legacy fallback', () => {
    expect(
      loadLegacyDoc('rtc/android/get-started/enable-service'),
    ).toMatchObject({
      options: {
        href: 'https://doc.shengwang.cn/doc/rtc/android/get-started/enable-service',
        statusCode: 308,
      },
      status: 308,
    });
  });
});
