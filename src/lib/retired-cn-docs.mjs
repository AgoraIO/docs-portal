// Keep retired documentation in Git while excluding it from publication.
export const retiredCnDocDirectories = [
  'zh-CN/realtime-media/fusion-cdn',
  'zh-CN/api-reference/fusion-cdn',
  'zh-CN/api-reference/api-ref/fusion-cdn',
];

const retiredAnalyticsPage =
  'zh-CN/realtime-media/usage-analytics/build/view-live-data';

export const retiredCnDocPaths = [
  ...retiredCnDocDirectories,
  retiredAnalyticsPage,
];

/** @param {string} value A locale-prefixed content URL or public OpenAPI asset. */
export function isRetiredCnDocsPath(value) {
  let path;
  try {
    path = decodeURIComponent(value.split(/[?#]/, 1)[0])
      .replace(/^\/+|\/+$/g, '')
      .replace(/\.mdx?$/, '');
  } catch {
    return false;
  }
  return (
    retiredCnDocDirectories.some(
      (directory) => path === directory || path.startsWith(`${directory}/`),
    ) ||
    path === retiredAnalyticsPage ||
    path.startsWith(`${retiredAnalyticsPage}/`) ||
    path === 'openapi/fusion-cdn/streaming.zh-CN.yaml'
  );
}
