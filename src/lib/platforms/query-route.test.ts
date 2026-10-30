import { describe, expect, it } from 'vitest';
import {
  createPlatformQueryIndex,
  getPlatformForUrl,
  normalizeInitialPlatformLocation,
  resolvePlatformQueryUrl,
} from './query-route';
import { platformRegistry } from './registry';

const canonicalPath = '/zh-CN/realtime-media/rtc/guide';
const index = createPlatformQueryIndex(
  Object.keys(platformRegistry).map((platform) => ({
    canonicalPath,
    platform,
    url: `${canonicalPath}/${platform}`,
  })),
);
const url = (value: string) => new URL(value, 'https://docs.example');

describe('published platform query routes', () => {
  it('normalizes a cold-load URL before hydration while preserving router history state', () => {
    const previous = window.location.href;
    const state = { __TSR_index: 3, key: 'entry' };
    try {
      window.history.replaceState(
        state,
        '',
        '/realtime-media/rtc/guide?platform=ios&from=legacy#h',
      );
      normalizeInitialPlatformLocation(index);
      expect(window.location.pathname).toBe('/realtime-media/rtc/guide/ios');
      expect(window.location.search).toBe('?from=legacy');
      expect(window.location.hash).toBe('#h');
      expect(window.history.state).toEqual(state);
    } finally {
      window.history.replaceState({}, '', previous);
    }
  });
  it.each(Object.keys(platformRegistry))(
    'resolves published platform %s',
    (platform) => {
      const original = url(
        `/realtime-media/rtc/guide?platform=${platform}&from=legacy#heading`,
      );
      expect(resolvePlatformQueryUrl(original, index)?.href).toBe(
        `https://docs.example/realtime-media/rtc/guide/${platform}?from=legacy#heading`,
      );
      expect(getPlatformForUrl(original, index)).toBe(platform);
      expect(original.searchParams.get('platform')).toBe(platform);
    },
  );

  it.each([
    ['iOS', 'ios'],
    ['Android', 'android'],
    ['react-js', 'javascript'],
    ['cscrip', 'csharp'],
  ])('normalizes %s to %s', (value, platform) => {
    expect(
      resolvePlatformQueryUrl(url(`${canonicalPath}/?platform=${value}`), index)
        ?.pathname,
    ).toBe(`${canonicalPath}/${platform}`);
  });

  it('preserves other repeated parameters and an encoded fragment', () => {
    const original = url(
      `${canonicalPath}?tag=a&platform=ios&tag=b&from=%2Fai#%E6%A0%87%E9%A2%98`,
    );
    const next = resolvePlatformQueryUrl(original, index);
    expect(next?.searchParams.getAll('tag')).toEqual(['a', 'b']);
    expect(next?.searchParams.get('from')).toBe('/ai');
    expect(next?.hash).toBe(original.hash);
    expect(next?.searchParams.has('platform')).toBe(false);
  });

  it('lets an explicit published platform path win over all platform parameters', () => {
    const original = url(
      `${canonicalPath}/android/?platform=ios&platform=web&from=legacy#h`,
    );
    expect(resolvePlatformQueryUrl(original, index)?.href).toBe(
      `https://docs.example${canonicalPath}/android?from=legacy#h`,
    );
    expect(getPlatformForUrl(original, index)).toBe('android');
    expect(
      resolvePlatformQueryUrl(url(`${canonicalPath}/android`), index),
    ).toBeNull();
  });

  it.each(['unknown', 'constructor', '__proto__', 'all'])(
    'does not invent a route for %s',
    (platform) => {
      expect(
        resolvePlatformQueryUrl(
          url(`${canonicalPath}?platform=${platform}`),
          index,
        ),
      ).toBeNull();
      expect(
        getPlatformForUrl(url(`${canonicalPath}?platform=${platform}`), index),
      ).toBeUndefined();
    },
  );

  it.each([
    '/search',
    '/reference/sdks',
    '/api-reference/api',
    '/assets/sample.zip',
    '/ai/unpublished',
  ])('leaves filter and unmapped routes %s unchanged', (pathname) => {
    expect(
      resolvePlatformQueryUrl(url(`${pathname}?platform=ios`), index),
    ).toBeNull();
  });

  it('only selects platforms published for that page', () => {
    const androidOnly = createPlatformQueryIndex([
      { canonicalPath, platform: 'android', url: `${canonicalPath}/android` },
    ]);
    expect(
      resolvePlatformQueryUrl(
        url(`${canonicalPath}?platform=ios`),
        androidOnly,
      ),
    ).toBeNull();
  });

  it('uses the published target rather than assuming a suffix layout', () => {
    const apiIndex = createPlatformQueryIndex([
      {
        canonicalPath: '/zh-CN/api-reference/rtc/example',
        platform: 'ios',
        url: '/zh-CN/api-reference/rtc/ios/example',
      },
    ]);
    expect(
      resolvePlatformQueryUrl(
        url('/api-reference/rtc/example?platform=ios'),
        apiIndex,
      )?.pathname,
    ).toBe('/api-reference/rtc/ios/example');
  });

  it('does not choose arbitrarily between ambiguous published targets', () => {
    const ambiguous = createPlatformQueryIndex([
      { canonicalPath, platform: 'ios', url: `${canonicalPath}/ios` },
      { canonicalPath, platform: 'ios', url: `${canonicalPath}/ios-other` },
    ]);
    expect(
      resolvePlatformQueryUrl(url(`${canonicalPath}?platform=ios`), ambiguous),
    ).toBeNull();
  });
});
