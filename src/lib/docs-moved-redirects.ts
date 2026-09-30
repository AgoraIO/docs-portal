import { ZH_CN_MOVED_SOLUTION_PRODUCT_REDIRECTS } from './zh-cn-moved-solution-product-redirects';

export function resolveMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'zh-CN') {
    return null;
  }

  if (
    tab === 'realtime-media' &&
    slugSegments.join('/') === 'rtc/reference/release'
  ) {
    return '/zh-CN/realtime-media/rtc/build/extensions/web/release';
  }

  if (
    tab === 'realtime-media' &&
    slugSegments.join('/') ===
      'rtc/build/initialize-and-channel/channel-management'
  ) {
    return '/zh-CN/realtime-media/rtc/build/security-and-auth/channel-management';
  }

  if (
    tab === 'realtime-media' &&
    slugSegments.join('/') === 'rtc/build/media/media-player'
  ) {
    return '/zh-CN/realtime-media/rtc/build/audio/media-player';
  }

  if (
    tab === 'realtime-media' &&
    [
      'cloud-recording/get-started/quick-start-go',
      'cloud-recording/get-started/quick-start-java',
      'cloud-recording/get-started/quick-start-nodejs',
    ].includes(slugSegments.join('/'))
  ) {
    return '/zh-CN/realtime-media/cloud-recording/get-started/quick-start';
  }

  if (tab === 'solutions') {
    const [root, ...rest] = slugSegments;
    if (root === 'ppt-transcoding' || root === 'status-page') {
      const legacyAlias =
        ZH_CN_MOVED_SOLUTION_PRODUCT_REDIRECTS[
          `solutions/${slugSegments.join('/')}`
        ];
      if (legacyAlias) {
        return legacyAlias;
      }

      const suffixSegments = rest.at(-1) === 'index' ? rest.slice(0, -1) : rest;
      const suffix =
        suffixSegments.length > 0 ? `/${suffixSegments.join('/')}` : '';

      return `/zh-CN/realtime-media/${root}${suffix}`;
    }
  }

  if (tab !== 'introduction') {
    return null;
  }

  const [root, ...rest] = slugSegments;
  const movedRootTargets: Record<string, string> = {
    'ppt-transcoding': '/zh-CN/realtime-media/ppt-transcoding',
    'usage-analytics': '/zh-CN/realtime-media/usage-analytics',
  };
  const targetRoot = root ? movedRootTargets[root] : undefined;

  if (!targetRoot) {
    return null;
  }

  const suffixSegments = rest.at(-1) === 'index' ? rest.slice(0, -1) : rest;
  const suffix =
    suffixSegments.length > 0 ? `/${suffixSegments.join('/')}` : '';

  return `${targetRoot}${suffix}`;
}

export function isPermanentMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  return (
    locale === 'zh-CN' &&
    tab === 'solutions' &&
    `solutions/${slugSegments.join('/')}` in
      ZH_CN_MOVED_SOLUTION_PRODUCT_REDIRECTS
  );
}
