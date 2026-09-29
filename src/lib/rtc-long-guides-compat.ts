import { normalizePlatformKey, type PlatformKey } from './platforms/registry';

export const RTC_LONG_GUIDE_PLATFORMS: Readonly<
  Record<string, readonly PlatformKey[]>
> = {
  '/en/realtime-media/rtc/get-started-sdk': [
    'android',
    'ios',
    'macos',
    'web',
    'windows',
    'electron',
    'flutter',
    'react-native',
    'javascript',
    'unity',
    'unreal',
    'blueprint',
  ],
  '/en/realtime-media/rtc/voice-quickstart': [
    'android',
    'ios',
    'macos',
    'web',
    'windows',
    'electron',
    'flutter',
    'react-native',
    'javascript',
    'unity',
    'unreal',
    'blueprint',
    'python',
  ],
  '/en/realtime-media/rtc/build/optimize-and-operate/app-size-optimization': [
    'android',
    'ios',
    'macos',
    'web',
    'windows',
    'electron',
    'flutter',
    'react-native',
    'unity',
  ],
};

const RTC_ROOT = '/en/realtime-media/rtc/';

export function isRtcLongGuidePath(pathname: string) {
  return Object.hasOwn(RTC_LONG_GUIDE_PLATFORMS, pathname);
}

export function resolveRtcLongGuideLegacyTarget(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  anchorPlatforms: Readonly<Record<string, Readonly<Record<string, string>>>>,
) {
  if (!isRtcLongGuidePath(location.pathname)) return null;
  const platforms = RTC_LONG_GUIDE_PLATFORMS[location.pathname];

  const params = new URLSearchParams(location.search);
  const rawPlatform = params.get('platform')?.trim().toLowerCase();
  const alias =
    rawPlatform === 'windows-cpp'
      ? 'windows'
      : rawPlatform?.replace(/[\s_]+/g, '-');
  const requested = alias ? normalizePlatformKey(alias) : undefined;
  let anchor: string;
  try {
    anchor = decodeURIComponent(location.hash.slice(1));
  } catch {
    return null;
  }

  const guide = location.pathname.slice(RTC_ROOT.length);
  const matchingPlatform =
    typeof requested === 'string' &&
    platforms.includes(requested as PlatformKey)
      ? requested
      : anchorPlatforms[guide]?.[anchor];
  if (
    !matchingPlatform ||
    !platforms.includes(matchingPlatform as PlatformKey)
  ) {
    return null;
  }

  params.delete('platform');
  const query = params.toString();
  // The old React Native migration link used Flutter's numbered heading ID.
  const hash =
    guide === 'get-started-sdk' &&
    matchingPlatform === 'react-native' &&
    anchor === 'set-up-your-project-6'
      ? '#set-up-your-project-7'
      : location.hash;
  return {
    platform: matchingPlatform as PlatformKey,
    url: `${location.pathname}/${matchingPlatform}${query ? `?${query}` : ''}${hash}`,
  };
}
