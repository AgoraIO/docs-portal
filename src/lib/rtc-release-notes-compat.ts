import { isKnownPlatform, normalizePlatformKey } from './platforms/registry';

export const RTC_RELEASE_NOTES_PATH =
  '/en/realtime-media/rtc/reference/release-notes';

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

  const target =
    platform && isKnownPlatform(platform) ? platform : anchorPlatforms[anchor];
  if (!target || !isKnownPlatform(target)) return null;

  params.delete('platform');
  const query = params.toString();
  return {
    platform: target,
    url: `${RTC_RELEASE_NOTES_PATH}/${target}${query ? `?${query}` : ''}${location.hash}`,
  };
}
