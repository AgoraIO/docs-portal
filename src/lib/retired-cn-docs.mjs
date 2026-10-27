// Keep retired documentation in Git while excluding it from publication.
export const retiredCnProductIds = [
  'fusion-cdn',
  'flexible-classroom',
  'cloud-scene',
  'proctor',
  'sdk-extensions',
  'metakit',
  'portrait-rhythm',
];

export const retiredCnDocDirectories = [
  'zh-CN/realtime-media/fusion-cdn',
  'zh-CN/api-reference/fusion-cdn',
  'zh-CN/api-reference/api-ref/fusion-cdn',
  'zh-CN/solutions/flexible-classroom',
  'zh-CN/api-reference/flexible-classroom',
  'zh-CN/realtime-media/flexible-classroom',
  'zh-CN/api-reference/api-ref/flexible-classroom',
  'zh-CN/realtime-media/sdk-extensions',
];

export const retiredCnDocPages = [
  'zh-CN/realtime-media/usage-analytics/build/view-live-data',
  'zh-CN/introduction/security/sdk-compliance/flexible-classroom-sdk',
  'zh-CN/introduction/security/sdk-compliance/flexible-classroom-sdk-third-party',
  ...[
    'agora_class_custom_properties',
    'cant_upload_courseware',
    'chat_issues',
    'class_custom_ui',
    'class_packaging',
    'class_recording_fails',
    'classroom_statuses',
    'common_mistakes_flexible_classroom',
    'multi_language_support',
    'obtain_restful_api_id',
    'stop_class',
    'turn_off_3a_config',
  ].map((page) => `zh-CN/reference/faq/integration/${page}`),
  'zh-CN/reference/faq/quality/audio_video_issues_in_classroom',
];

export const retiredCnDocPaths = [
  ...retiredCnDocDirectories,
  ...retiredCnDocPages,
];

// Old Shengwang namespaces stay retired even when their migration mapping
// points to a shared introduction page (for example MCP or Skills).
const retiredCnLegacyDirectories = [
  'doc/fusion-cdn',
  'api-ref/fusion-cdn',
  'doc/flexible-classroom',
  'api-ref/flexible-classroom',
  'doc/sdk-extension',
];
const retiredCnLegacyPages = [
  'doc/analytics/general/fls/data',
  'basics/security/flexible-classroom-sdk',
  'basics/security/flexible-classroom-sdk-third-party',
  ...[
    'class-courseware',
    'class-custom-ui',
    'class-errors',
    'class-im',
    'class-language',
    'class-packaging',
    'class-properties',
    'class-record',
    'class-restapi',
    'class-states',
    'class-stop',
    'class-threea',
  ].map((page) => `faq/integration-issues/${page}`),
  'faq/quality-issues/class-audio-video',
];

export const retiredCnLegacyDocsRoute = {
  src: `^/(?:${[...retiredCnLegacyDirectories, ...retiredCnLegacyPages].join('|')})(?:/.*|\\.(?:html|mdx?))?/?$`,
  dest: '/404.html',
  status: 404,
};
const retiredCnLegacyMatcher = new RegExp(retiredCnLegacyDocsRoute.src);

/** @param {string} value A path from the old Shengwang documentation site. */
export function isRetiredCnLegacyDocsPath(value) {
  try {
    return retiredCnLegacyMatcher.test(
      decodeURIComponent(value.split(/[?#]/, 1)[0]),
    );
  } catch {
    return false;
  }
}

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
    retiredCnDocPages.some(
      (page) => path === page || path.startsWith(`${page}/`),
    ) ||
    path === 'openapi/fusion-cdn/streaming.zh-CN.yaml'
  );
}
