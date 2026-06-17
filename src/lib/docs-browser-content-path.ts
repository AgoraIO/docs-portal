const RTC_ANDROID_CURRENT_PREFIX = '/api-reference/rtc/android/(current)/';
const RTC_ANDROID_VERSION = '4.6.0';

export function resolveDocsBrowserContentPath(contentPath: string) {
  const normalizedPath = `/${contentPath}`;
  const currentIndex = normalizedPath.indexOf(RTC_ANDROID_CURRENT_PREFIX);

  if (currentIndex === -1) {
    return contentPath;
  }

  const prefix = normalizedPath.slice(
    0,
    currentIndex + RTC_ANDROID_CURRENT_PREFIX.length,
  );
  const suffix = normalizedPath.slice(prefix.length);
  const resolvedPath = `${normalizedPath.slice(
    0,
    currentIndex,
  )}/api-reference/rtc/android/${RTC_ANDROID_VERSION}/${suffix}`;

  return resolvedPath.slice(1);
}
