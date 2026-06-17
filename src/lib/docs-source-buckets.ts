export function isApiReferenceContentPath(contentPath: string) {
  return contentPath.split('/')[1] === 'api-reference';
}

export function isAiContentPath(contentPath: string) {
  return contentPath.split('/')[1] === 'ai';
}

export function isRealtimeMediaRtcContentPath(contentPath: string) {
  const [, section, product] = contentPath.split('/');
  const productSlug = product?.replace(/\.(md|mdx)$/, '');

  return section === 'realtime-media' && productSlug === 'rtc';
}

export function isOrdinaryDocsContentPath(contentPath: string) {
  return !isAiContentPath(contentPath) && !isApiReferenceContentPath(contentPath);
}

export function isSidebarDeferredContentPath(contentPath: string) {
  return (
    isOrdinaryDocsContentPath(contentPath) ||
    isAiContentPath(contentPath) ||
    isRealtimeMediaRtcContentPath(contentPath) ||
    isDeferredOrdinaryApiReferenceContentPath(contentPath) ||
    isRtcAndroidApiReferenceContentPath(contentPath) ||
    isConversationalAiServerSdkApiReferenceContentPath(contentPath)
  );
}

export function isDeferredOrdinaryApiReferenceContentPath(contentPath: string) {
  return (
    isApiReferenceContentPath(contentPath) &&
    !isRtcAndroidApiReferenceContentPath(contentPath) &&
    !isConversationalAiServerSdkApiReferenceContentPath(contentPath)
  );
}

export function isRtcAndroidApiReferenceContentPath(contentPath: string) {
  const segments = contentPath.split('/');
  const [, section, product, platform] = segments;
  const platformSlug = platform?.replace(/\.(md|mdx)$/, '');

  return (
    section === 'api-reference' &&
    product === 'rtc' &&
    platformSlug === 'android'
  );
}

export function isConversationalAiServerSdkApiReferenceContentPath(
  contentPath: string,
) {
  const segments = contentPath.split('/');
  const [, section, product, category] = segments;
  const categorySlug = category?.replace(/\.(md|mdx)$/, '');

  return (
    section === 'api-reference' &&
    product === 'conversational-ai' &&
    categorySlug === 'server-sdk'
  );
}
