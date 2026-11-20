import { ZH_CN_MOVED_SOLUTION_PRODUCT_REDIRECTS } from './zh-cn-moved-solution-product-redirects';

const ZH_CN_AI_GUIDE_REDIRECTS = new Map([
  ['user-guides/rest-tool', '/zh-CN/ai/build/shape-the-conversation/rest-tool'],
  [
    'user-guides/asr-keywords',
    '/zh-CN/ai/build/custom-model-integration/asr-keywords',
  ],
  [
    'user-guides/filler-words',
    '/zh-CN/ai/build/shape-the-conversation/filler-words',
  ],
]);

const ZH_CN_RTC_EVENTS_REDIRECTS = new Map([
  ['rtc/reference/events', '/zh-CN/api-reference/rtc/restful/webhook/events'],
  ['rtc/webhook/events', '/zh-CN/api-reference/rtc/restful/webhook/events'],
]);

const ZH_CN_MERGED_RESTFUL_GUIDE_REDIRECTS = new Map(
  [
    'whiteboard/whiteboard-sdk/build/setup-and-access/generate-token',
    'whiteboard/fastboard-sdk/build/setup-and-access/generate-token',
  ].map((path) => [`${path}/restful`, `/zh-CN/realtime-media/${path}-restful`]),
);

const ZH_CN_RTM_SCENARIO_REDIRECTS = new Map(
  ['web', 'android', 'ios', 'cpp', 'swift', 'harmonyos'].flatMap((platform) =>
    ['voice-room', 'one-to-one-call'].map((scenario): [string, string] => [
      `rtm/best-practice/${platform}/${scenario}`,
      `/zh-CN/realtime-media/rtm/best-practice/${scenario}/${platform}`,
    ]),
  ),
);

const RTC_SERVICE_SETUP_PATH = 'rtc/build/setup-and-access/enable-service';
const ZH_CN_RTC_SERVICE_SETUP_REDIRECTS = new Map([
  [
    `${RTC_SERVICE_SETUP_PATH}-restful`,
    `/zh-CN/realtime-media/${RTC_SERVICE_SETUP_PATH}#restful-service`,
  ],
  [
    `${RTC_SERVICE_SETUP_PATH}/restful`,
    `/zh-CN/realtime-media/${RTC_SERVICE_SETUP_PATH}#restful-service`,
  ],
  [
    'rtc/build/setup-and-access/enable-mini-program',
    `/zh-CN/realtime-media/${RTC_SERVICE_SETUP_PATH}#mini-program-service`,
  ],
  ...[
    'android',
    'ios',
    'macos',
    'web',
    'windows',
    'harmonyos',
    'mini-program',
    'electron',
    'unity',
    'flutter',
    'react-native',
    'unreal',
    'blueprint',
    'react',
  ].map((platform): [string, string] => [
    `${RTC_SERVICE_SETUP_PATH}/${platform}`,
    `/zh-CN/realtime-media/${RTC_SERVICE_SETUP_PATH}#sdk-service`,
  ]),
]);

const EN_MCP_GUIDE_PATHS = new Set([
  'ai/get-started/mcp-integrate',
  'ai/platform/get-started/mcp-integrate',
  'ai/device-kit/get-started/mcp',
  'realtime-media/on-premise-recording/mcp',
  'realtime-media/broadcast-streaming/mcp',
  'realtime-media/transcoding/mcp',
  'realtime-media/video/mcp',
  'realtime-media/rtc/mcp',
  'realtime-media/rtmp-gateway/build/mcp',
  'realtime-media/cloud-recording/mcp',
  'realtime-media/im/get-started/mcp',
  'realtime-media/voice/mcp',
  'realtime-media/media-pull/build/mcp',
  'realtime-media/media-push/build/mcp',
  'realtime-media/whiteboard/build/mcp',
]);

const EN_SKILLS_GUIDE_PATHS = new Set([
  'ai/get-started/skills-integrate',
  'ai/platform/get-started/skills-integrate',
  'ai/device-kit/get-started/skills',
  'realtime-media/on-premise-recording/skills',
  'realtime-media/broadcast-streaming/skills',
  'realtime-media/transcoding/skills',
  'realtime-media/video/skills',
  'realtime-media/rtc/skills',
  'realtime-media/rtmp-gateway/build/skills',
  'realtime-media/cloud-recording/skills',
  'realtime-media/im/get-started/skills',
  'realtime-media/voice/skills',
  'realtime-media/media-pull/build/skills',
  'realtime-media/media-push/build/skills',
  'realtime-media/whiteboard/build/skills',
]);

const EN_REMOVED_AI_PAGE_PATHS = new Set([
  'ai/models/tts/humeai',
  'ai/platform/models/tts/humeai',
]);

function resolveEnglishMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en') return null;
  const path = [tab, ...slugSegments].join('/');
  const suffix = path.endsWith('.md') ? '.md' : '';
  const guidePath = path.replace(/\.md$/, '');
  if (guidePath === 'realtime-media/cloud-recording/reference/common-errors') {
    return `/en/api-reference/api-ref/cloud-recording/status-codes${suffix}`;
  }
  if (
    guidePath === 'realtime-media/iot/reference/communicate-with-rtc-sdk' ||
    guidePath === 'iot/reference/communicate_with_rtc_sdk'
  ) {
    return `/en/realtime-media/iot/build/send-messages/interoperate-with-rtc-sdk${suffix}`;
  }
  // Hume AI retired its legacy TTS API on 2026-11-13; the vendor pages were removed.
  if (EN_REMOVED_AI_PAGE_PATHS.has(guidePath)) {
    return `/en/ai${suffix}`;
  }
  if (EN_MCP_GUIDE_PATHS.has(guidePath)) {
    return `/en/introduction/agora-mcp${suffix}`;
  }
  if (EN_SKILLS_GUIDE_PATHS.has(guidePath)) {
    return `/en/introduction/agora-skills${suffix}`;
  }
  return null;
}

export function resolveMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'zh-CN') {
    return resolveEnglishMovedDocsRedirect(locale, tab, slugSegments);
  }

  if (tab === 'ai') {
    return ZH_CN_AI_GUIDE_REDIRECTS.get(slugSegments.join('/')) ?? null;
  }

  if (tab === 'realtime-media') {
    const rtmScenarioRedirect = ZH_CN_RTM_SCENARIO_REDIRECTS.get(
      slugSegments.join('/'),
    );
    if (rtmScenarioRedirect) return rtmScenarioRedirect;

    const rtcServiceSetupRedirect = ZH_CN_RTC_SERVICE_SETUP_REDIRECTS.get(
      slugSegments.join('/'),
    );
    if (rtcServiceSetupRedirect) return rtcServiceSetupRedirect;

    const mergedGuideRedirect = ZH_CN_MERGED_RESTFUL_GUIDE_REDIRECTS.get(
      slugSegments.join('/'),
    );
    if (mergedGuideRedirect) return mergedGuideRedirect;

    const rtcEventsRedirect = ZH_CN_RTC_EVENTS_REDIRECTS.get(
      slugSegments.join('/'),
    );
    if (rtcEventsRedirect) return rtcEventsRedirect;
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
  if (locale === 'en')
    return resolveEnglishMovedDocsRedirect(locale, tab, slugSegments) !== null;
  const root = slugSegments[0];

  return (
    locale === 'zh-CN' &&
    ((tab === 'ai' && ZH_CN_AI_GUIDE_REDIRECTS.has(slugSegments.join('/'))) ||
      (tab === 'realtime-media' &&
        (ZH_CN_RTM_SCENARIO_REDIRECTS.has(slugSegments.join('/')) ||
          ZH_CN_RTC_SERVICE_SETUP_REDIRECTS.has(slugSegments.join('/')) ||
          ZH_CN_RTC_EVENTS_REDIRECTS.has(slugSegments.join('/')) ||
          ZH_CN_MERGED_RESTFUL_GUIDE_REDIRECTS.has(slugSegments.join('/')))) ||
      (tab === 'solutions' &&
        (root === 'ppt-transcoding' || root === 'status-page')))
  );
}
