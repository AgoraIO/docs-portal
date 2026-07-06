const LEGACY_SOLUTIONS_PRODUCT_SLUGS = new Set([
  'agora-analytics',
  'flexible-classroom',
  'interactive-live-streaming',
  'iot',
]);

export function getLegacySolutionsRedirectUrl({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  if (locale !== 'en' || tab !== 'solutions') {
    return null;
  }

  if (slugSegments.length === 0) {
    return '/en/realtime-media/overview';
  }

  const [productSlug, ...restSegments] = slugSegments;
  if (!productSlug || !LEGACY_SOLUTIONS_PRODUCT_SLUGS.has(productSlug)) {
    return null;
  }

  return ['/en/realtime-media', productSlug, ...restSegments].join('/');
}
