const UNIFIED_RTC_PRODUCT_SLUGS = new Set([
  'broadcast-streaming',
  'interactive-live-streaming',
  'video',
  'voice',
]);

export function resolveUnifiedRtcProductRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'realtime-media') {
    return null;
  }

  const [productSlug, ...relativePath] = slugSegments;
  if (!productSlug || !UNIFIED_RTC_PRODUCT_SLUGS.has(productSlug)) {
    return null;
  }

  if (productSlug === 'video' && relativePath.join('/') === 'quickstart') {
    return `/${locale}/realtime-media/rtc/get-started-sdk`;
  }

  return `/${locale}/realtime-media/rtc${
    relativePath.length > 0 ? `/${relativePath.join('/')}` : ''
  }`;
}
