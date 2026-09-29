import { normalizePlatformKey, type PlatformKey } from './platforms/registry';

export const RTC_RELEASE_NOTES_PATH =
  '/en/realtime-media/rtc/reference/release-notes';
const RTC_RELEASE_NOTES_PLATFORMS = new Set<PlatformKey>([
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
]);

function isRtcReleaseNotesPlatform(value: unknown): value is PlatformKey {
  return (
    typeof value === 'string' &&
    RTC_RELEASE_NOTES_PLATFORMS.has(value as PlatformKey)
  );
}

export function resolveRtcReleaseNotesLegacyTarget(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  anchorPlatforms: Readonly<Record<string, string>> = {},
) {
  if (location.pathname !== RTC_RELEASE_NOTES_PATH) return null;

  const params = new URLSearchParams(location.search);
  const requested = params.get('platform')?.toLowerCase();
  const alias = requested === 'windows-cpp' ? 'windows' : requested;
  const platform = alias ? normalizePlatformKey(alias) : undefined;
  let anchor: string;
  try {
    anchor = decodeURIComponent(location.hash.slice(1));
  } catch {
    return null;
  }

  // Notifications were shared across all platforms and stay on the index.
  if (anchor === 'notifications' || anchor === '202210') return null;

  const target = isRtcReleaseNotesPlatform(platform)
    ? platform
    : anchorPlatforms[anchor];
  if (!isRtcReleaseNotesPlatform(target)) return null;

  params.delete('platform');
  const query = params.toString();
  return {
    platform: target,
    url: `${RTC_RELEASE_NOTES_PATH}/${target}${query ? `?${query}` : ''}${location.hash}`,
  };
}
