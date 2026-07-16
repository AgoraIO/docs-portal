import { existsSync } from 'node:fs';
import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import { resolveDocsLastUpdatedMetadata } from './docs-last-updated.server';
import type { DocsLayoutMode } from './docs-layout';
import { resolveMovedDocsRedirect } from './docs-moved-redirects';
import {
  type DocsNavScopeResolution,
  getNavScopeSidebarNodes,
  getNavScopeVersionLinks,
  getScopedNavScopeSidebarNodes,
  getSharedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';
import { getSourceSlugs } from './docs-routing';
import {
  type DocsSidebarNode,
  type DocsSidebarSectionNode,
  filterSidebarNodes,
  getFirstChildPageUrl,
  getFirstTabPageUrl,
  getPrevNextLinksFromNode,
  getProductScopes,
  getSidebarBreadcrumb,
  getTabSummaries,
} from './docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from './i18n/i18n-config';
import { resolveLegacySitemapRedirectPath } from './legacy-sitemap/redirects';
import { getLegacySolutionsRedirectUrl } from './legacy-solutions-routing';
import {
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
  getOpenApiOperationIds,
  isOpenApiTab,
  type OpenApiLane,
  resolveOpenApiEndpointRoute,
  resolveOpenApiLaneRoute,
} from './openapi/lanes';
import { getOpenApiOperation } from './openapi/source.server';
import {
  filterPlatformGroupPanelNodes,
  getCanonicalSourcePages,
  getPlatformGroupPanelUrls,
  isPlatformGroupPanelPage,
  resolvePlatformGroupDefinition,
  resolvePlatformGroupParentPage,
} from './platforms/platform-group-pages';
import {
  buildCanonicalPlatformTocText,
  buildPlatformMarkdownText,
  extractStructuredPlatformTabs,
} from './platforms/processed-text';
import type { PlatformKey } from './platforms/registry';
import { resolvePlatformRoutePage } from './platforms/route';
import {
  type source as docsSource,
  getPageMarkdownUrl,
  type PageWithSource,
} from './source.server';
import { resolveZhCnProductIaRedirect } from './zh-cn-product-ia-redirects';

const OPENAPI_TAB = 'api-reference';
const DEVICE_KIT_PATH_ENTRY_SLUG = 'quickstart-device-kit';
const CONVERSATIONAL_AI_PATH_ENTRY_SLUG = 'quickstart-coding';
const RECIPES_PATH_ENTRY_SLUG = 'voice-ai-recipes';
const RECIPES_ROOT_SLUG = 'recipes';
const SDKS_ROOT_SLUG = 'sdks';
const ZH_CN_SHARED_CONCEPT_SLUGS = new Set([
  'mcp-integrate',
  'skills-integrate',
]);

type DocsSidebarPageNode = Extract<DocsSidebarNode, { type: 'page' }>;

const ZH_CN_REST_API_PRODUCT_BACK_LINKS: Array<{
  backHref: string;
  backLabel: string;
  prefix: string;
}> = [
  {
    backHref: '/zh-CN/realtime-media/cloud-recording',
    backLabel: '云端录制',
    prefix: '/zh-CN/api-reference/api-ref/cloud-recording',
  },
  {
    backHref: '/zh-CN/realtime-media/transcoding',
    backLabel: '云端转码',
    prefix: '/zh-CN/api-reference/api-ref/cloud-transcoding',
  },
  {
    backHref: '/zh-CN/ai',
    backLabel: '对话式 AI 引擎',
    prefix: '/zh-CN/api-reference/api-ref/conversational-ai',
  },
  {
    backHref: '/zh-CN/realtime-media/danmaku',
    backLabel: '弹幕玩法',
    prefix: '/zh-CN/api-reference/api-ref/danmaku',
  },
  {
    backHref: '/zh-CN/realtime-media/fusion-cdn',
    backLabel: '融合 CDN 直播',
    prefix: '/zh-CN/api-reference/api-ref/fusion-cdn',
  },
  {
    backHref: '/zh-CN/realtime-media/usage-analytics',
    backLabel: '水晶球',
    prefix: '/zh-CN/api-reference/api-ref/agora-analytics',
  },
  {
    backHref: '/zh-CN/realtime-media/media-pull',
    backLabel: '输入在线媒体流',
    prefix: '/zh-CN/api-reference/api-ref/media-pull',
  },
  {
    backHref: '/zh-CN/realtime-media/media-push',
    backLabel: '旁路推流',
    prefix: '/zh-CN/api-reference/api-ref/media-push',
  },
  {
    backHref: '/zh-CN/solutions/ppt-transcoding',
    backLabel: 'PPT 转码服务',
    prefix: '/zh-CN/api-reference/api-ref/ppt-conversion-service',
  },
  {
    backHref: '/zh-CN/realtime-media/rtc',
    backLabel: '实时互动 RTC',
    prefix: '/zh-CN/api-reference/api-ref/rtc',
  },
  {
    backHref: '/zh-CN/realtime-media/rtm',
    backLabel: '实时消息 RTM',
    prefix: '/zh-CN/api-reference/api-ref/signaling',
  },
  {
    backHref: '/zh-CN/realtime-media/speech-to-text',
    backLabel: '实时转录翻译',
    prefix: '/zh-CN/api-reference/api-ref/speech-to-text',
  },
  {
    backHref: '/zh-CN/realtime-media/rtmp-gateway',
    backLabel: 'RTMP 网关',
    prefix: '/zh-CN/api-reference/api-ref/rtmp-gateway',
  },
  {
    backHref: '/zh-CN/realtime-media/whiteboard/fastboard-sdk',
    backLabel: '互动白板',
    prefix: '/zh-CN/api-reference/api-ref/whiteboard/restful',
  },
  {
    backHref: '/zh-CN/solutions/voip-call',
    backLabel: 'VoIP 呼叫服务',
    prefix: '/zh-CN/api-reference/api-ref/voip-callkit',
  },
];

const LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES: Record<string, string> = {
  history: 'history',
  interrupt: 'interrupt',
  join: 'join',
  leave: 'leave',
  list: 'list',
  query: 'query',
  speak: 'speak',
  think: 'think',
  turns: 'turns',
  update: 'update',
};

const LEGACY_BEST_PRACTICES_REDIRECTS: Record<
  string,
  Partial<Record<AppLocale, string>>
> = {
  'audio-settings': {
    'zh-CN': '/zh-CN/ai/best-practices/audio-settings',
  },
  'opt-latency': {
    'zh-CN': '/zh-CN/ai/best-practices/optimize-latency',
  },
  geofencing: {
    en: '/en/ai/best-practices/regional-restrictions',
    'zh-CN': '/zh-CN/ai/best-practices/regional-restrictions',
  },
  'http-basic-auth': {
    'zh-CN': '/zh-CN/api-reference/api-ref/conversational-ai/authentication',
  },
  'release-notes': {
    'zh-CN': '/zh-CN/ai/release-notes',
  },
};

const ZH_CN_API_REFERENCE_PLACEHOLDER_REDIRECTS: Record<string, string> = {
  'conversational-ai/client-toolkit':
    '/zh-CN/api-reference/conversational-ai/android/overview',
  'conversational-ai/client-toolkit/basicauthcredential':
    '/zh-CN/api-reference/conversational-ai/restclient-java/basicauthcredential',
  'conversational-ai/client-toolkit/baseresponse.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/baseresponse.go',
  'conversational-ai/client-toolkit/client.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/client.go',
  'conversational-ai/client-toolkit/conversationalaiapi':
    '/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi',
  'conversational-ai/client-toolkit/conversationalaiapieventhandler':
    '/zh-CN/api-reference/conversational-ai/ios/conversationalaiapieventhandler',
  'conversational-ai/client-toolkit/convoaiclient.java':
    '/zh-CN/api-reference/conversational-ai/restclient-java/convoaiclient.java',
  'conversational-ai/client-toolkit/enum':
    '/zh-CN/api-reference/conversational-ai/android/enum',
  'conversational-ai/client-toolkit/iconversationalaiapi':
    '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi',
  'conversational-ai/client-toolkit/iconversationalaiapieventhandler':
    '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapieventhandler',
  'conversational-ai/client-toolkit/listoptions.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/listoptions.go',
  'conversational-ai/client-toolkit/overview':
    '/zh-CN/api-reference/conversational-ai/android/overview',
  'conversational-ai/client-toolkit/overview.agent-go':
    '/zh-CN/api-reference/conversational-ai/agent-go',
  'conversational-ai/client-toolkit/overview.agent-python':
    '/zh-CN/api-reference/conversational-ai/agent-python',
  'conversational-ai/client-toolkit/overview.agent-typescript':
    '/zh-CN/api-reference/conversational-ai/agent-typescript',
  'conversational-ai/agent-go/overview':
    '/zh-CN/api-reference/conversational-ai/agent-go',
  'conversational-ai/agent-python/overview':
    '/zh-CN/api-reference/conversational-ai/agent-python',
  'conversational-ai/agent-typescript/overview':
    '/zh-CN/api-reference/conversational-ai/agent-typescript',
  'conversational-ai/client-toolkit/response.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/response.go',
  'conversational-ai/client-toolkit/samplelogger.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/samplelogger.go',
  'conversational-ai/client-toolkit/struct':
    '/zh-CN/api-reference/conversational-ai/android/struct',
  'conversational-ai/go-api/baseresponse.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/baseresponse.go',
  'conversational-ai/go-api/basicauthcredential':
    '/zh-CN/api-reference/conversational-ai/restclient-go/basicauthcredential',
  'conversational-ai/go-api/client.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/client.go',
  'conversational-ai/go-api/enum':
    '/zh-CN/api-reference/conversational-ai/restclient-go/enum',
  'conversational-ai/go-api/listoptions.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/listoptions.go',
  'conversational-ai/go-api/overview.go':
    '/zh-CN/api-reference/conversational-ai/agent-go',
  'conversational-ai/go-api/response.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/response.go',
  'conversational-ai/go-api/samplelogger.go':
    '/zh-CN/api-reference/conversational-ai/restclient-go/samplelogger.go',
  'conversational-ai/go-api/struct':
    '/zh-CN/api-reference/conversational-ai/restclient-go/struct',
  'conversational-ai/java':
    '/zh-CN/api-reference/conversational-ai/restclient-java/overview',
  'conversational-ai/java/basicauthcredential':
    '/zh-CN/api-reference/conversational-ai/restclient-java/basicauthcredential',
  'conversational-ai/java/convoaiclient.java':
    '/zh-CN/api-reference/conversational-ai/restclient-java/convoaiclient.java',
  'conversational-ai/java/enum':
    '/zh-CN/api-reference/conversational-ai/restclient-java/enum',
  'conversational-ai/java/overview':
    '/zh-CN/api-reference/conversational-ai/restclient-java/overview',
  'conversational-ai/java/struct':
    '/zh-CN/api-reference/conversational-ai/restclient-java/struct',
  'conversational-ai/python-api/overview.python':
    '/zh-CN/api-reference/conversational-ai/agent-python',
  'conversational-ai/typescript-api/conversationalaiapi':
    '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi',
  'conversational-ai/typescript-api/enum':
    '/zh-CN/api-reference/conversational-ai/web/enum',
  'conversational-ai/typescript-api/overview.typescript':
    '/zh-CN/api-reference/conversational-ai/agent-typescript',
  'conversational-ai/typescript-api/struct':
    '/zh-CN/api-reference/conversational-ai/web/struct',
  'local-server-recording/agoramediartcrecorder.java':
    '/zh-CN/api-reference/local-server-recording/java/agoramediartcrecorder.java',
  'local-server-recording/agoraservice.java':
    '/zh-CN/api-reference/local-server-recording/java/agoraservice.java',
  'local-server-recording/api-overview':
    '/zh-CN/api-reference/local-server-recording/java/api-overview',
  'local-server-recording/enum':
    '/zh-CN/api-reference/local-server-recording/java/enum',
  'local-server-recording/iagoramediacomponentfactory.cpp':
    '/zh-CN/api-reference/local-server-recording/cpp/iagoramediacomponentfactory.cpp',
  'local-server-recording/iagoramediartcrecorder.cpp':
    '/zh-CN/api-reference/local-server-recording/cpp/iagoramediartcrecorder.cpp',
  'local-server-recording/iagoramediartcrecordereventhandler':
    '/zh-CN/api-reference/local-server-recording/java/iagoramediartcrecordereventhandler',
  'local-server-recording/iagoraservice.cpp':
    '/zh-CN/api-reference/local-server-recording/cpp/iagoraservice.cpp',
  'local-server-recording/irecordervideoframeobserver':
    '/zh-CN/api-reference/local-server-recording/java/irecordervideoframeobserver',
  'local-server-recording/struct':
    '/zh-CN/api-reference/local-server-recording/java/struct',
  'meeting/client-api': '/zh-CN/api-reference/meeting/android',
  'api-ref/meeting/android/client-api': '/zh-CN/api-reference/meeting/android',
  'api-ref/meeting/ios/client-api': '/zh-CN/api-reference/meeting/ios',
  'api-ref/meeting/electron/client-api':
    '/zh-CN/api-reference/meeting/electron',
  'private-room/call-api': '/zh-CN/api-reference/private-room/android',
  'api-ref/private-room/android/call-api':
    '/zh-CN/api-reference/private-room/android',
  'api-ref/private-room/ios/call-api': '/zh-CN/api-reference/private-room/ios',
  rtm: '/zh-CN/api-reference/rtm/android/configuration',
  'rtm/components-hooks':
    '/zh-CN/api-reference/rtm/react-native/components-hooks',
  'rtm/enumv': '/zh-CN/api-reference/rtm/android/enumv',
  'rtm/error-codes': '/zh-CN/realtime-media/rtm/build/troubleshooting',
  'rtm/react-native/error-codes':
    '/zh-CN/realtime-media/rtm/build/troubleshooting',
  'rtm/toc-channel/channel': '/zh-CN/api-reference/rtm/android/channel',
  'rtm/toc-configuration/configuration':
    '/zh-CN/api-reference/rtm/android/configuration',
  'rtm/toc-lock/lock': '/zh-CN/api-reference/rtm/android/lock',
  'rtm/toc-message/message': '/zh-CN/api-reference/rtm/android/message',
  'rtm/toc-message/publish': '/zh-CN/api-reference/api-ref/signaling/publish',
  'rtm/toc-message/receive': '/zh-CN/api-reference/api-ref/signaling/receive',
  'rtm/toc-message/response-code':
    '/zh-CN/realtime-media/rtm/reference/response-code',
  'rtm/toc-presence/presence': '/zh-CN/api-reference/rtm/android/presence',
  'rtm/toc-storage/storage': '/zh-CN/api-reference/rtm/android/storage',
  'rtm/toc-token/token': '/zh-CN/api-reference/rtm/android/token',
  'rtm/toc-topic/topic': '/zh-CN/api-reference/rtm/android/topic',
  'api-ref/signaling': '/zh-CN/api-reference/api-ref/signaling/publish',
  'api-ref/signaling/index': '/zh-CN/api-reference/api-ref/signaling/publish',
  'api-ref/signaling/restful': '/zh-CN/api-reference/api-ref/signaling/publish',
  'api-ref/signaling/response-code':
    '/zh-CN/realtime-media/rtm/reference/response-code',
  'api-ref/ppt-conversion-service/status-codes':
    '/zh-CN/solutions/ppt-transcoding/reference/response-code',
  'api-ref/whiteboard': '/zh-CN/api-reference/api-ref/whiteboard/restful',
  'api-ref/fastboard/android/fastboard-api':
    '/zh-CN/api-reference/whiteboard/fastboard/android',
  'api-ref/fastboard/ios/fastboard-api':
    '/zh-CN/api-reference/whiteboard/fastboard/ios',
  'api-ref/fastboard/javascript/fastboard-api':
    '/zh-CN/api-reference/whiteboard/fastboard/web',
  'api-ref/whiteboard/android/fastboard-api':
    '/zh-CN/api-reference/whiteboard/fastboard/android',
  'api-ref/whiteboard/ios/fastboard-api':
    '/zh-CN/api-reference/whiteboard/fastboard/ios',
  'whiteboard/fastboard': '/zh-CN/api-reference/whiteboard/fastboard/android',
  'whiteboard/fastboard/fastboard-api':
    '/zh-CN/api-reference/whiteboard/fastboard/android',
  'flexible-classroom/classroom-sdk':
    '/zh-CN/api-reference/flexible-classroom/android/api-reference/classroom-sdk',
  'flexible-classroom/proctor-sdk':
    '/zh-CN/api-reference/flexible-classroom/ios/api-reference/proctor-sdk',
  'flexible-classroom/fcr-ui-scene':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/fcr-ui-scene',
  'flexible-classroom/android':
    '/zh-CN/api-reference/flexible-classroom/android/api-reference/classroom-sdk',
  'flexible-classroom/ios':
    '/zh-CN/api-reference/flexible-classroom/ios/api-reference/classroom-sdk',
  'flexible-classroom/web':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/classroom-sdk',
  'flexible-classroom/electron':
    '/zh-CN/api-reference/flexible-classroom/electron/api-reference/classroom-sdk',
  'flexible-classroom/restful-api':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  'api-ref/flexible-classroom/android/classroom-sdk':
    '/zh-CN/api-reference/flexible-classroom/android/api-reference/classroom-sdk',
  'api-ref/flexible-classroom/ios/classroom-sdk':
    '/zh-CN/api-reference/flexible-classroom/ios/api-reference/classroom-sdk',
  'api-ref/flexible-classroom/javascript/classroom-sdk':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/classroom-sdk',
  'api-ref/flexible-classroom/electron/classroom-sdk':
    '/zh-CN/api-reference/flexible-classroom/electron/api-reference/classroom-sdk',
  'api-ref/flexible-classroom/ios/proctor-sdk':
    '/zh-CN/api-reference/flexible-classroom/ios/api-reference/proctor-sdk',
  'api-ref/flexible-classroom/javascript/proctor-sdk':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/proctor-sdk',
  'api-ref/flexible-classroom/electron/proctor-sdk':
    '/zh-CN/api-reference/flexible-classroom/electron/api-reference/proctor-sdk',
  'api-ref/flexible-classroom/javascript/fcr-ui-scene':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/fcr-ui-scene',
  'api-ref/flexible-classroom/electron/fcr-ui-scene':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/fcr-ui-scene',
  'api-ref/flexible-classroom/javascript/overview':
    '/zh-CN/api-reference/flexible-classroom/web/api-reference/edu-store',
  'api-ref/flexible-classroom/electron/overview':
    '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store',
  'api-ref/flexible-classroom/classroom-rest-api':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  'api-ref/flexible-classroom/restful-api':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  'flexible-classroom/restful/api/api-classroom':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  'flexible-classroom/restful/api/api-recording':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-recording',
  'flexible-classroom/restful/api/api-sync':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-sync',
  'flexible-classroom/restful/api/api-user':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-user',
  'flexible-classroom/restful/api/api-widget':
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-widget',
  'rtc/error-code': '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/android/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/ios/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/macos/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/windows/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/electron/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/flutter/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/react-native/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/unity/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/unreal/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/mini-program/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'api-ref/rtc/web/error-code':
    '/zh-CN/realtime-media/rtc/reference/error-code',
  'rtc-server-sdk/error-code':
    '/zh-CN/realtime-media/rtc-server-sdk/reference/error-code',
  'api-ref/rtc-server-sdk/go/error-code':
    '/zh-CN/realtime-media/rtc-server-sdk/reference/error-code',
  'api-ref/rtc-server-sdk/python/error-code':
    '/zh-CN/realtime-media/rtc-server-sdk/reference/error-code',
  'rtc/android': '/zh-CN/api-reference/rtc/android/rtc-api-overview',
  'rtc/cpp-all-platforms':
    '/zh-CN/api-reference/rtc/cpp-all-platforms/rtc-api-overview',
  'rtc/csharp-windows':
    '/zh-CN/api-reference/rtc/csharp-windows/rtc-api-overview',
  'rtc/electron': '/zh-CN/api-reference/rtc/electron/rtc-api-overview',
  'rtc/flutter': '/zh-CN/api-reference/rtc/flutter/rtc-api-overview',
  'rtc/harmonyos': '/zh-CN/api-reference/rtc/harmonyos/rtc-api-overview',
  'rtc/ios': '/zh-CN/api-reference/rtc/ios/rtc-api-overview',
  'rtc/macos': '/zh-CN/api-reference/rtc/macos/rtc-api-overview',
  'rtc/react-native': '/zh-CN/api-reference/rtc/react-native/rtc-api-overview',
  'rtc/unity': '/zh-CN/api-reference/rtc/unity/rtc-api-overview',
  'rtc/unreal-blueprint':
    '/zh-CN/api-reference/rtc/unreal-blueprint/rtc-api-overview',
  'rtc/unreal-cpp': '/zh-CN/api-reference/rtc/unreal-cpp/rtc-api-overview',
};

export async function loadDocsTabIndex(locale: string, tab: string) {
  if (locale === 'en' && tab === SDKS_ROOT_SLUG) {
    return {
      locale,
      tab,
      url: `/${locale}/${OPENAPI_TAB}/${SDKS_ROOT_SLUG}`,
    };
  }

  const { source } = await import('./source.server');
  const pageTree = getCanonicalPageTree(source, locale);
  const tabSummaries = getTabSummaries(pageTree);
  const tabSummary = tabSummaries.find((item) => item.id === tab);

  const tabUrl = `/${locale}/${tab}`;
  if (tabSummary?.url === tabUrl && hasDocsPageForUrl(source, tabUrl)) {
    return {
      locale,
      url: tabSummary.url,
      tab,
    };
  }

  const indexedPageUrl = getFirstTabPageUrl(pageTree, tab);
  const firstDescendantPageUrl = getFirstChildPageUrl(pageTree, tab, []);
  const firstPageUrl =
    indexedPageUrl === tabUrl && !hasDocsPageForUrl(source, tabUrl)
      ? firstDescendantPageUrl
      : (indexedPageUrl ?? firstDescendantPageUrl);

  if (!firstPageUrl) {
    return null;
  }

  return {
    locale,
    url: firstPageUrl,
    tab,
  };
}

export async function loadDocsPagePayload(
  locale: string,
  tab: string,
  slugSegments: string[],
  search?: string,
) {
  const movedDocsRedirect = resolveMovedDocsRedirect(locale, tab, slugSegments);
  if (movedDocsRedirect) {
    return {
      redirectUrl: canonicalizeZhCnProductIaRedirectUrl(
        locale,
        movedDocsRedirect,
      ),
    };
  }

  const apiReferenceRedirect = resolveApiReferenceRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (apiReferenceRedirect) {
    return {
      redirectUrl: apiReferenceRedirect,
    };
  }

  const deviceKitRedirect = resolveDeviceKitRedirect(locale, tab, slugSegments);
  if (deviceKitRedirect) {
    return {
      redirectUrl: deviceKitRedirect,
    };
  }

  const aiRedirect = resolveAiDocsRedirect(locale, tab, slugSegments);
  if (aiRedirect) {
    return {
      redirectUrl: aiRedirect,
    };
  }

  const legacyConversationalAiReferenceRedirect =
    resolveLegacyConversationalAiReferenceRedirect(locale, tab, slugSegments);
  if (legacyConversationalAiReferenceRedirect) {
    return {
      redirectUrl: legacyConversationalAiReferenceRedirect,
    };
  }

  const legacyProductRedirect = resolveLegacyProductRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (legacyProductRedirect) {
    return {
      redirectUrl: legacyProductRedirect,
    };
  }

  const legacySitemapRedirect = resolveLegacySitemapRedirect(
    locale,
    tab,
    slugSegments,
    search,
  );
  if (legacySitemapRedirect) {
    return legacySitemapRedirect;
  }

  const legacyRedirect = resolveLegacyBestPracticesRedirect(
    locale,
    tab,
    slugSegments,
  );

  if (legacyRedirect) {
    return {
      redirectUrl: legacyRedirect,
    };
  }

  const sharedConceptRedirect = resolveZhCnSharedConceptRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (sharedConceptRedirect) {
    return {
      redirectUrl: sharedConceptRedirect,
    };
  }

  const zhCnProductIaRedirect = resolveZhCnProductIaRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (zhCnProductIaRedirect) {
    return {
      redirectUrl: zhCnProductIaRedirect,
    };
  }

  const realtimeMediaApiReferenceRedirect =
    resolveRealtimeMediaApiReferenceRedirect(locale, tab, slugSegments);
  if (realtimeMediaApiReferenceRedirect) {
    return {
      redirectUrl: realtimeMediaApiReferenceRedirect,
    };
  }

  const solutionsApiReferenceRedirect = resolveSolutionsApiReferenceRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (solutionsApiReferenceRedirect) {
    return {
      redirectUrl: solutionsApiReferenceRedirect,
    };
  }

  const legacySolutionsRedirect = getLegacySolutionsRedirectUrl({
    locale,
    slugSegments,
    tab,
  });
  if (legacySolutionsRedirect) {
    return {
      preserveSearch: true,
      redirectUrl: legacySolutionsRedirect,
    };
  }

  const { source } = await import('./source.server');
  const realtimeMediaRedirect = resolveRealtimeMediaRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (
    realtimeMediaRedirect &&
    hasDocsPageForUrl(source, realtimeMediaRedirect)
  ) {
    return {
      redirectUrl: realtimeMediaRedirect,
    };
  }

  const requestedSlug = slugSegments.at(-1) ?? 'index';
  let slug = requestedSlug;
  let resolvedSlugSegments = slugSegments;
  let page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      slugSegments,
      tab,
    }),
    locale,
  );

  if (!page) {
    const mergedPlatformSuffixRedirect = resolveMergedPlatformSuffixRedirect({
      locale,
      slugSegments,
      source,
      tab,
    });

    if (mergedPlatformSuffixRedirect) {
      return mergedPlatformSuffixRedirect;
    }
  }

  let requestedPlatform: PlatformKey | undefined;
  let platformResolvedProcessedText: string | undefined;

  if (!page) {
    const platformRoute = await resolvePlatformRoutePage({
      extractPlatformTabs: extractStructuredPlatformTabs,
      locale,
      readProcessedText,
      slugSegments,
      source,
      tab,
    });

    if (platformRoute) {
      page = platformRoute.page;
      requestedPlatform = platformRoute.platform;
      platformResolvedProcessedText = platformRoute.processedText;
      resolvedSlugSegments = platformRoute.slugSegments;
      slug = resolvedSlugSegments.at(-1) ?? 'index';
    }
  }

  if (!page) {
    const pageTree = getCanonicalPageTree(source, locale);
    const fallbackUrl = getFirstChildPageUrl(pageTree, tab, slugSegments);

    if (fallbackUrl) {
      return {
        redirectUrl: fallbackUrl,
      };
    }

    return null;
  }

  const localePages = source.getPages(locale);
  const platformGroupParent = resolvePlatformGroupParentPage(page, localePages);

  if (platformGroupParent) {
    const panelPage = page;
    const platformGroup = resolvePlatformGroupDefinition(
      platformGroupParent,
      localePages,
    );
    const panelPlatform = platformGroup?.panels.find(
      (panel) => panel.contentPath === panelPage.path,
    )?.platform;

    if (!panelPlatform) {
      return {
        redirectUrl: platformGroupParent.url,
      };
    }

    const parentPage = source.getPage(
      platformGroupParent.slugs.slice(1),
      locale,
    );
    if (!parentPage) {
      return {
        redirectUrl: platformGroupParent.url,
      };
    }

    page = parentPage;
    requestedPlatform = panelPlatform;
  }

  const pageTree = getCanonicalPageTree(source, locale);
  const supportedLocale = toSupportedLocale(locale);
  const sourcePageUrls =
    locale === 'zh-CN' && tab === OPENAPI_TAB
      ? new Set(
          localePages
            .filter((item) => hasExistingDocsSourceFile(item, locale))
            .map((item) => item.url),
        )
      : null;
  const openApiPage = isOpenApiPageWithClientProps(page) ? page : null;
  const isOpenApiPage = openApiPage !== null;
  const openApiRoute =
    isOpenApiPage && supportedLocale
      ? resolveOpenApiEndpointRoute(supportedLocale, tab, resolvedSlugSegments)
      : null;
  const openApiLaneRoute =
    supportedLocale && isOpenApiTab(tab)
      ? resolveOpenApiLaneRoute(supportedLocale, tab, resolvedSlugSegments)
      : null;
  const processedText = isOpenApiPage
    ? ''
    : (platformResolvedProcessedText ?? (await readProcessedText(page)));
  const structuredPlatformTabs = extractStructuredPlatformTabs(processedText);
  const defaultStructuredPlatform = structuredPlatformTabs?.defaultPlatform;
  const artifactPlatform = requestedPlatform ?? defaultStructuredPlatform;
  const toc = isOpenApiPage
    ? normalizeToc(getPageToc(page))
    : await resolvePageToc(page, processedText, artifactPlatform);
  const layoutMode: DocsLayoutMode =
    isOpenApiPage || openApiLaneRoute !== null ? 'openapi' : 'docs';
  const sidebar = await getDocsSidebarNodes({
    activePath: page.url,
    locale: supportedLocale,
    pageTree,
    pageUrl: page.url,
    source,
    tab,
  });
  const title = page.data.title ?? page.slugs.at(-1) ?? page.url;
  const navScope = getDocsNavScope({
    activePath: page.url,
    locale,
    pageTree,
    source,
    tab,
  });
  const sidebarHeader = resolveDocsSidebarHeader({
    activePath: page.url,
    hidePlatformTabs:
      'hidePlatformTabs' in page.data ? page.data.hidePlatformTabs : undefined,
    locale,
    navScope,
    pageTree,
    source,
    tab,
  });
  const breadcrumb = getSidebarBreadcrumb(sidebar, page.url);
  const platformGroup = resolvePlatformGroupDefinition(page, localePages);
  const mdxBody = platformGroup
    ? {
        canonicalPlatform: platformGroup.canonicalPlatform,
        contentPath: page.path,
        kind: 'platform-group' as const,
        panels: platformGroup.panels,
        platformTabs: {
          canonicalPlatform: platformGroup.canonicalPlatform,
          defaultPlatform: platformGroup.canonicalPlatform,
          initialPlatform: requestedPlatform,
          platforms: JSON.stringify(platformGroup.platforms),
        },
        platforms: platformGroup.platforms,
      }
    : {
        contentPath: page.path,
        ...('hidePlatformTabs' in page.data && page.data.hidePlatformTabs
          ? { hidePlatformTabs: true }
          : {}),
        kind: 'mdx' as const,
        ...(structuredPlatformTabs
          ? {
              platformTabs: {
                canonicalPlatform: structuredPlatformTabs.canonicalPlatform,
                defaultPlatform: defaultStructuredPlatform,
                initialPlatform: requestedPlatform,
                platforms: JSON.stringify(structuredPlatformTabs.platforms),
              },
            }
          : {}),
      };
  const body = isOpenApiPage
    ? {
        kind: 'openapi' as const,
        pageProps: await openApiPage.data.getClientAPIPageProps(),
      }
    : mdxBody;
  const lastUpdated = await resolveDocsLastUpdatedMetadata(
    Array.from(
      new Set([
        `content/docs/${page.path}`,
        ...(openApiRoute && supportedLocale
          ? [openApiRoute.lane.sourcePath[supportedLocale]]
          : []),
        ...(openApiLaneRoute && supportedLocale
          ? [openApiLaneRoute.sourcePath[supportedLocale]]
          : []),
      ]),
    ),
  );

  return {
    activePath: page.url,
    activeTab: tab,
    body,
    breadcrumb:
      navScope?.scope.meta.sidebarIndexTitle &&
      page.url === navScope.scope.node.index?.url
        ? [
            {
              title,
              url: page.url,
            },
          ]
        : breadcrumb.length > 0
          ? breadcrumb
          : [
              {
                title,
                url: page.url,
              },
            ],
    contentPath: page.path,
    description: page.data.description,
    markdownUrl: getPageMarkdownUrl(page, artifactPlatform).url,
    lastUpdated,
    layoutMode,
    hideToc: ('hideToc' in page.data ? page.data.hideToc : undefined) ?? false,
    localeLinks: SUPPORTED_LOCALES.map((targetLocale) => {
      const targetPage = source.getPage(page.slugs.slice(1), targetLocale);
      const targetTabEntry = getFirstTabPageUrl(
        getCanonicalPageTree(source, targetLocale),
        tab,
      );
      const targetUrl =
        targetPage?.url ??
        (targetTabEntry?.startsWith(`/${targetLocale}/`)
          ? targetTabEntry
          : undefined) ??
        `/${targetLocale}/introduction`;

      return {
        href: targetUrl,
        isActive: targetLocale === locale,
        locale: targetLocale,
      };
    }),
    navigation:
      openApiRoute && supportedLocale
        ? getOpenApiPrevNextLinks(
            openApiRoute.lane,
            supportedLocale,
            openApiRoute.operationId,
          )
        : getPrevNextLinksFromNode(
            navScope?.sidebarRoot ?? pageTree,
            page.url,
            sourcePageUrls ? (url) => sourcePageUrls.has(url) : undefined,
          ),
    productScopes: getProductScopes(pageTree),
    sidebar,
    sidebarHeader,
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc,
  };
}

function canonicalizeZhCnProductIaRedirectUrl(
  locale: string,
  redirectUrl: string,
) {
  if (locale !== 'zh-CN') {
    return redirectUrl;
  }

  const [pathname, suffix = ''] = redirectUrl.split(/([?#].*)/, 2);
  const localePrefix = `/${locale}/`;

  if (!pathname.startsWith(localePrefix)) {
    return redirectUrl;
  }

  const [targetTab, ...targetSlugSegments] = pathname
    .slice(localePrefix.length)
    .split('/');
  const canonicalRedirect = resolveZhCnProductIaRedirect(
    locale,
    targetTab,
    targetSlugSegments,
  );

  return canonicalRedirect ? `${canonicalRedirect}${suffix}` : redirectUrl;
}

export async function loadDocsSearchIndex(locale: string) {
  const supportedLocale = toSupportedLocale(locale);

  if (!supportedLocale) {
    return [];
  }

  const { source } = await import('./source.server');
  const pages = getCanonicalSourcePages(source.getPages(locale)).map(
    (item) => ({
      description: item.data.description,
      title: item.data.title ?? item.slugs.at(-1) ?? item.url,
      url: item.url,
    }),
  );

  return getDocsPages({
    locale: supportedLocale,
    pages,
  });
}

function getCanonicalPageTree(source: typeof docsSource, locale?: string) {
  const pages = source.getPages(locale);

  return filterPlatformGroupPanelNodes(
    source.getPageTree(locale),
    getPlatformGroupPanelUrls(pages),
  );
}

function resolveLegacyBestPracticesRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'best-practices') {
    return null;
  }

  const supportedLocale = toSupportedLocale(locale);
  if (!supportedLocale) {
    return null;
  }

  const slug =
    slugSegments.length === 0 ? 'index' : (slugSegments.at(-1) ?? 'index');
  const redirect =
    LEGACY_BEST_PRACTICES_REDIRECTS[slug]?.[supportedLocale] ?? null;

  return redirect;
}

function resolveZhCnSharedConceptRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'zh-CN') {
    return null;
  }

  const leafSlug = slugSegments.at(-1);
  if (!leafSlug || !ZH_CN_SHARED_CONCEPT_SLUGS.has(leafSlug)) {
    return null;
  }

  if (tab === 'introduction' && slugSegments.length === 1) {
    return null;
  }

  return `/zh-CN/introduction/${leafSlug}`;
}

function resolveDeviceKitRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'ai') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const isZhCn = locale === 'zh-CN';
  const deviceKitOverviewPath = isZhCn
    ? `/${locale}/ai/device-kit/overview/product-overview`
    : `/${locale}/ai/device-kit/start-here/quickstart`;
  const deviceKitQuickstartPath = isZhCn
    ? `/${locale}/ai/device-kit/build/run-r1-demo`
    : `/${locale}/ai/device-kit/start-here/quickstart`;
  const deviceKitRunDemoPath = isZhCn
    ? `/${locale}/ai/device-kit/build/run-r1-demo`
    : `/${locale}/ai/device-kit/build/run-the-r1-demo`;

  if (normalizedPath === 'device-kit') {
    return deviceKitOverviewPath;
  }

  if (normalizedPath === `choose-your-path/${DEVICE_KIT_PATH_ENTRY_SLUG}`) {
    return deviceKitQuickstartPath;
  }

  const redirects: Record<string, string> = {
    'device-kit/get-started': deviceKitQuickstartPath,
    'device-kit/get-started/quickstart': deviceKitQuickstartPath,
    'device-kit/get-started/enable-services': `/${locale}/ai/device-kit/reference/enable-services`,
    'device-kit/get-started/run-the-demo': deviceKitRunDemoPath,
    'device-kit/overview': deviceKitOverviewPath,
    'device-kit/overview/architecture': isZhCn
      ? deviceKitOverviewPath
      : `/${locale}/ai/device-kit/build/architecture-overview`,
    'device-kit/reference': `/${locale}/ai/device-kit/reference/enable-services`,
    'device-kit/reference/device-controls': `/${locale}/ai/device-kit/build/device-controls`,
    'device-kit/overview/pricing': `/${locale}/ai/device-kit/reference/pricing`,
    'device-kit/overview/release-notes': `/${locale}/ai/device-kit/reference/release-notes`,
    'device-kit/start-here/enable-services': `/${locale}/ai/device-kit/reference/enable-services`,
  };

  return redirects[normalizedPath] ?? null;
}

function resolveLegacyConversationalAiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en' || tab !== 'conversational-ai') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const toolkitPrefix = 'reference/toolkot';

  if (normalizedPath === toolkitPrefix) {
    return '/en/api-reference/api-ref/conversational-ai/client-toolkit';
  }

  if (!normalizedPath.startsWith(`${toolkitPrefix}/`)) {
    return null;
  }

  const routeLeaf = normalizedPath.slice(`${toolkitPrefix}/`.length);
  return ['android', 'ios', 'web'].includes(routeLeaf)
    ? `/en/api-reference/api-ref/conversational-ai/client-toolkit/${routeLeaf}`
    : null;
}

function resolveApiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== OPENAPI_TAB) {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const legacyClientToolkitRedirect =
    resolveLegacyConversationalAiClientToolkitRedirect(locale, normalizedPath);
  if (legacyClientToolkitRedirect) {
    return legacyClientToolkitRedirect;
  }

  const legacyConversationalAiRestRedirect =
    resolveLegacyConversationalAiRestRedirect(locale, normalizedPath);
  if (legacyConversationalAiRestRedirect) {
    return legacyConversationalAiRestRedirect;
  }

  const legacyFlexibleClassroomApiRedirect =
    resolveLegacyFlexibleClassroomApiRedirect(locale, normalizedPath);
  if (legacyFlexibleClassroomApiRedirect) {
    return legacyFlexibleClassroomApiRedirect;
  }

  if (normalizedPath === RECIPES_PATH_ENTRY_SLUG) {
    return `/${locale}/${OPENAPI_TAB}/${RECIPES_ROOT_SLUG}`;
  }

  if (locale === 'zh-CN' && normalizedPath === 'api-ref') {
    return '/zh-CN/api-reference/api';
  }

  if (
    locale === 'en' &&
    CONSOLE_API_REFERENCE_DUPLICATE_PATHS.has(normalizedPath)
  ) {
    return '/en/api-reference/api-ref/console/solutions-agora-console-rest-api';
  }

  const legacyFlattenedApiRefRedirect =
    LEGACY_FLATTENED_API_REF_REDIRECTS[normalizedPath];
  if (locale === 'en' && legacyFlattenedApiRefRedirect) {
    return legacyFlattenedApiRefRedirect;
  }

  if (
    locale === 'en' &&
    (normalizedPath === 'api-ref/video' || normalizedPath === 'api-ref/voice')
  ) {
    return '/en/api-reference/api-ref/rtc';
  }

  if (locale === 'zh-CN' && normalizedPath === 'rtc') {
    return '/zh-CN/api-reference/api-ref/rtc';
  }

  if (locale === 'zh-CN') {
    const placeholderRedirect =
      ZH_CN_API_REFERENCE_PLACEHOLDER_REDIRECTS[normalizedPath];
    if (placeholderRedirect) {
      return placeholderRedirect;
    }

    const flexibleClassroomRedirect =
      resolveFlexibleClassroomPlatformRedirect(normalizedPath);
    if (flexibleClassroomRedirect) {
      return flexibleClassroomRedirect;
    }
  }

  if (
    locale === 'en' &&
    isLegacyEnglishApiReferenceProductPath(normalizedPath)
  ) {
    if (normalizedPath === 'video' || normalizedPath === 'voice') {
      return '/en/api-reference/api-ref/rtc';
    }

    return `/en/${getApiReferenceProductRoot(locale)}/${normalizedPath}`;
  }

  return null;
}

function resolveFlexibleClassroomPlatformRedirect(normalizedPath: string) {
  const match = normalizedPath.match(
    /^flexible-classroom\/(android|ios|web|electron)\/(.+)$/,
  );
  if (!match) {
    return null;
  }

  const [, platform, slug] = match;

  if (slug.startsWith('api-reference/')) {
    return null;
  }

  if (platform === 'android' || platform === 'ios') {
    if (slug === 'classroom-sdk' || slug === 'proctor-sdk') {
      return `/zh-CN/api-reference/flexible-classroom/${platform}/api-reference/${slug}`;
    }

    return `/zh-CN/api-reference/flexible-classroom/${platform}/api-reference/edu-context/${slug}`;
  }

  if (
    slug === 'classroom-sdk' ||
    slug === 'proctor-sdk' ||
    slug === 'edu-store'
  ) {
    return `/zh-CN/api-reference/flexible-classroom/${platform}/api-reference/${slug}`;
  }

  if (platform === 'web' && slug === 'fcr-ui-scene') {
    return '/zh-CN/api-reference/flexible-classroom/web/api-reference/fcr-ui-scene';
  }

  return null;
}

function getApiReferenceProductRoot(locale: string) {
  return locale === 'en' ? 'api-reference/api-ref' : 'api-reference';
}

function resolveLegacyConversationalAiClientToolkitRedirect(
  locale: string,
  normalizedPath: string,
) {
  if (locale !== 'en') {
    return null;
  }

  const prefix = 'conversational-ai/client-toolkit';

  if (normalizedPath === prefix) {
    return `/${locale}/api-reference/api-ref/conversational-ai/client-toolkit`;
  }

  if (!normalizedPath.startsWith(`${prefix}/`)) {
    return null;
  }

  const routeLeaf = normalizedPath.slice(`${prefix}/`.length);
  return ['android', 'ios', 'web'].includes(routeLeaf)
    ? `/${locale}/api-reference/api-ref/conversational-ai/client-toolkit/${routeLeaf}`
    : null;
}

function isLegacyEnglishApiReferenceProductPath(path: string) {
  if (!path || path.startsWith('api-ref/')) {
    return false;
  }

  if (path === 'video' || path === 'voice') {
    return true;
  }

  return API_REFERENCE_PRODUCT_SLUGS.includes(path);
}

const API_REFERENCE_PRODUCT_SLUGS = [
  'cloud-recording',
  'cloud-transcoding',
  'conversational-ai',
  'broadcast-streaming',
  'im',
  'media-pull',
  'media-push',
  'on-premise-recording',
  'rtc',
  'signaling',
  'speech-to-text',
];

const CONSOLE_API_REFERENCE_DUPLICATE_PATHS = new Set([
  'api-ref/broadcast-streaming/agora-console-rest-api',
  'api-ref/video/agora-console-rest-api',
  'api-ref/voice/agora-console-rest-api',
]);

const LEGACY_FLATTENED_API_REF_REDIRECTS: Record<string, string> = {
  'api-ref/analytics-rest-api':
    '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
  'api-ref/analytics-restful-authentication':
    '/en/api-reference/api-ref/agora-analytics/analytics-restful-authentication',
  'api-ref/classroom-rest-api':
    '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
  'api-ref/solutions-agora-console-rest-api':
    '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
};

function resolveLegacyConversationalAiRestRedirect(
  locale: string,
  normalizedPath: string,
) {
  const prefix = 'conversational-ai/rest-api';

  if (normalizedPath === prefix) {
    return `/${locale}/api-reference/api-ref/conversational-ai`;
  }

  if (normalizedPath === `${prefix}/authentication`) {
    return `/${locale}/api-reference/api-ref/conversational-ai/authentication`;
  }

  if (normalizedPath === `${prefix}/status-codes`) {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai/status-codes`
      : `/${locale}/ai/api/response-code`;
  }

  if (!normalizedPath.startsWith(`${prefix}/agent/`)) {
    return null;
  }

  const routeLeaf =
    LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES[
      normalizedPath.slice(`${prefix}/agent/`.length)
    ];

  return routeLeaf
    ? `/${locale}/api-reference/api-ref/conversational-ai/${routeLeaf}`
    : null;
}

function resolveAiDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'ai') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');

  const redirects: Record<string, string> = {
    'conversational-ai': `/${locale}/ai/get-started/quickstart`,
    [`choose-your-path/${CONVERSATIONAL_AI_PATH_ENTRY_SLUG}`]: `/${locale}/ai/get-started/quickstart`,
    'build/code-first-architecture': `/${locale}/ai/build/architecture`,
    'build/event-types': `/${locale}/ai/reference/event-types`,
    pricing: `/${locale}/ai/reference/pricing`,
    'reference/code-first-architecture': `/${locale}/ai/build/architecture`,
    'reference/architecture': `/${locale}/ai/build/architecture`,
    create_asr_extension: `/${locale}/ai/reference/ten-agent/create-asr-extension`,
    create_tts_extension: `/${locale}/ai/reference/ten-agent/create-tts-extension`,
    'ten-agent/develop/create-asr-extension-project': `/${locale}/ai/reference/ten-agent/create-asr-extension`,
    'ten-agent/architecture/tts-implementation-modes': `/${locale}/ai/reference/ten-agent/create-tts-extension`,
    'best-practices/filler-words': `/${locale}/ai/build/filler-words`,
  };

  return redirects[normalizedPath] ?? null;
}

function resolveLegacyFlexibleClassroomApiRedirect(
  locale: string,
  normalizedPath: string,
) {
  if (locale !== 'zh-CN') {
    return null;
  }

  const match = normalizedPath.match(
    /^api-ref\/flexible-classroom\/(android|ios)\/API\/([^/]+)$/,
  );
  if (!match) {
    return null;
  }

  const [, platform, legacySlug] = match;
  const slug = legacySlug.replaceAll('_', '-').toLowerCase();

  return `/zh-CN/api-reference/flexible-classroom/${platform}/api-reference/edu-context/${slug}`;
}

function resolveLegacyProductRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const redirects: Record<string, string> = {
    'flexible-classroom/client-api/classroom-sdk':
      '/en/api-reference/api-ref/flexible-classroom/classroom-sdk',
    'flexible-classroom/client-api/edu-context-sdk':
      '/en/api-reference/api-ref/flexible-classroom/classroom-sdk',
    'flexible-classroom/client-api/proctor-sdk':
      '/en/api-reference/api-ref/flexible-classroom/proctor-sdk',
    'flexible-classroom/client-api/ui-scene':
      '/en/api-reference/api-ref/flexible-classroom/ui-scene',
    'flexible-classroom/reference/restful-authentication':
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    'interactive-whiteboard/develop/generate-token-rest':
      '/en/realtime-media/whiteboard/build/generate-token-rest',
    'iot/reference/restful-authentication':
      '/en/api-reference/api-ref/rtc/authentication',
    'media-gateway/reference/restful-authentication':
      '/en/api-reference/api-ref/rtmp-gateway/authentication',
    'solutions/flexible-classroom/reference/restful-authentication':
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    'solutions/iot/reference/restful-authentication':
      '/en/api-reference/api-ref/rtc/authentication',
  };

  return redirects[`${tab}/${normalizedPath}`] ?? null;
}

export function resolveLegacySitemapRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
  search?: string,
) {
  const legacyPath = `/${[locale, tab, ...slugSegments].join('/')}`;
  const rule = resolveLegacySitemapRedirectPath(legacyPath, search);

  return rule
    ? {
        preserveSearch: rule.preserveSearch,
        redirectUrl: rule.target,
      }
    : null;
}

function resolveRealtimeMediaRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'realtime-media') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');

  const zhCnSpeechToTextRedirects: Record<string, string> =
    locale === 'zh-CN'
      ? {
          'speech-to-text/overview': `/${locale}/realtime-media/speech-to-text`,
          'speech-to-text/overview/product-overview': `/${locale}/realtime-media/speech-to-text`,
          'speech-to-text/overview/release-notes': `/${locale}/realtime-media/speech-to-text/reference/release-notes`,
          'speech-to-text/overview/billing': `/${locale}/realtime-media/speech-to-text/reference/billing`,
          'speech-to-text/get-started/enable-service': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service`,
          'speech-to-text/user-guides': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service`,
          'speech-to-text/user-guides/http-basic-auth': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/http-basic-auth`,
          'speech-to-text/user-guides/transcribe-specified-hosts': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/transcribe-specified-hosts`,
          'speech-to-text/user-guides/translation': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/translation`,
          'speech-to-text/user-guides/update-service': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service`,
          'speech-to-text/user-guides/how-to-use-protobuf': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/how-to-use-protobuf`,
          'speech-to-text/user-guides/render-captions': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/render-captions`,
          'speech-to-text/user-guides/record-captions': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/record-captions`,
          'speech-to-text/user-guides/encrypt-captions': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/encrypt-captions`,
          'speech-to-text/best-practices': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/enable-from-client`,
          'speech-to-text/best-practices/enable-from-client': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/enable-from-client`,
          'speech-to-text/best-practices/optimize-quality': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/optimize-quality`,
          'speech-to-text/audio-modality': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/audio-modality`,
          'speech-to-text/api': `/${locale}/realtime-media/speech-to-text/reference/response-code`,
          'speech-to-text/api/supported-languages': `/${locale}/realtime-media/speech-to-text/reference/supported-languages`,
          'speech-to-text/api/response-code': `/${locale}/realtime-media/speech-to-text/reference/response-code`,
          'speech-to-text/webhook': `/${locale}/realtime-media/speech-to-text/build/monitor-events/receive-webhook`,
          'speech-to-text/webhook/receive-webhook': `/${locale}/realtime-media/speech-to-text/build/monitor-events/receive-webhook`,
          'speech-to-text/webhook/ncs-events': `/${locale}/realtime-media/speech-to-text/reference/ncs-events`,
        }
      : {};

  const redirects: Record<string, string> = {
    'rtc/quick-start': `/${locale}/realtime-media/rtc/quick-start/android/integrate-with-ai-tools`,
    'rtc/quick-start/integrate-with-ai-tools': `/${locale}/realtime-media/rtc/quick-start/android/integrate-with-ai-tools`,
    'rtc/quick-start/build-from-scratch': `/${locale}/realtime-media/rtc/quick-start/android/build-from-scratch`,
    'video/quickstart': `/${locale}/realtime-media/video/get-started-sdk`,
    'cloud-recording/pricing-webpage-recording': `/${locale}/realtime-media/cloud-recording/reference/pricing-webpage-recording`,
    'whiteboard/overview': `/${locale}/realtime-media/whiteboard`,
    'whiteboard/overview/account-settlement': `/${locale}/realtime-media/whiteboard/reference/account-settlement`,
    'whiteboard/overview/core-concepts': `/${locale}/realtime-media/whiteboard`,
    'whiteboard/overview/pricing': `/${locale}/realtime-media/whiteboard/reference/pricing`,
    'whiteboard/overview/product-overview': `/${locale}/realtime-media/whiteboard`,
    'whiteboard/overview/release-notes': `/${locale}/realtime-media/whiteboard/reference/release-notes`,
    'whiteboard/overview/release-notes-uikit': `/${locale}/realtime-media/whiteboard/reference/release-notes-uikit`,
    'whiteboard/overview/supported-platforms': `/${locale}/realtime-media/whiteboard/reference/supported-platforms`,
    'whiteboard/overview/whiteboard-fastboard': `/${locale}/realtime-media/whiteboard/whiteboard-fastboard`,
    ...zhCnSpeechToTextRedirects,
  };

  return redirects[normalizedPath] ?? null;
}

function resolveRealtimeMediaApiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en' || tab !== 'realtime-media') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const exactRedirects: Record<string, string> = {
    'broadcast-streaming/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'broadcast-streaming/reference/api-sunset':
      '/en/api-reference/api-ref/broadcast-streaming/api-sunset',
    'broadcast-streaming/reference/restful-api':
      '/en/api-reference/api-ref/broadcast-streaming',
    'cloud-recording/reference/rest-api-overview':
      '/en/api-reference/api-ref/cloud-recording/api-callback-service',
    'cloud-recording/reference/restful-api':
      '/en/api-reference/api-ref/cloud-recording',
    'cloud-recording/reference/restful-authentication':
      '/en/api-reference/api-ref/cloud-recording/authentication',
    'im/reference/server-api': '/en/api-reference/api-ref/im',
    'im/reference/http-status-codes':
      '/en/api-reference/api-ref/im/http-status-codes',
    'im/reference/limitations': '/en/api-reference/api-ref/im/limitations',
    'im/reference/server-api/restful-overview': '/en/api-reference/api-ref/im',
    'media-pull/reference/restful-api': '/en/api-reference/api-ref/media-pull',
    'media-pull/reference/restful-authentication':
      '/en/api-reference/api-ref/media-pull/restful-authentication',
    'media-push/build/restful-api': '/en/api-reference/api-ref/media-push',
    'media-push/reference/restful-authentication':
      '/en/api-reference/api-ref/media-push/restful-authentication',
    'media-push/reference/restful-type-definition':
      '/en/api-reference/api-ref/media-push/restful-type-definition',
    'on-premise-recording/reference/api-reference':
      '/en/api-reference/api-ref/on-premise-recording',
    'rtm/reference/rest-api': '/en/api-reference/api-ref/signaling',
    'rtmp-gateway/reference/rest-api': '/en/api-reference/api-ref/rtmp-gateway',
    'rtmp-gateway/reference/restful-authentication':
      '/en/api-reference/api-ref/rtmp-gateway/authentication',
    'speech-to-text/reference/api-callback-service':
      '/en/api-reference/api-ref/speech-to-text/api-callback-service',
    'speech-to-text/reference/rest-api':
      '/en/api-reference/api-ref/speech-to-text',
    'speech-to-text/reference/restful-authentication':
      '/en/api-reference/api-ref/speech-to-text/restful-authentication',
    'video/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'video/reference/api-sunset': '/en/api-reference/api-ref/rtc',
    'voice/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'voice/reference/api-sunset': '/en/api-reference/api-ref/rtc',
    'whiteboard/reference/rest-api': '/en/api-reference/api-ref/whiteboard',
    'whiteboard/reference/rest-api/overview':
      '/en/api-reference/api-ref/whiteboard',
    'whiteboard/reference/uikit-sdk': '/en/api-reference/api-ref/uikit-sdk',
  };

  if (exactRedirects[normalizedPath]) {
    return exactRedirects[normalizedPath];
  }

  const prefixRedirects: [string, string][] = [
    [
      'broadcast-streaming/reference/restful-api/',
      '/en/api-reference/api-ref/broadcast-streaming/',
    ],
    ['im/reference/server-api/', '/en/api-reference/api-ref/im/'],
    [
      'rtmp-gateway/reference/rest-api/',
      '/en/api-reference/api-ref/rtmp-gateway/',
    ],
    [
      'speech-to-text/reference/rest-api-v5/',
      '/en/api-reference/api-ref/speech-to-text/rest-api-v5/',
    ],
    [
      'speech-to-text/reference/rest-api-v6/',
      '/en/api-reference/api-ref/speech-to-text/rest-api-v6/',
    ],
    ['whiteboard/reference/rest-api/', '/en/api-reference/api-ref/whiteboard/'],
  ];

  for (const [oldPrefix, newPrefix] of prefixRedirects) {
    if (normalizedPath.startsWith(oldPrefix)) {
      return `${newPrefix}${normalizedPath.slice(oldPrefix.length)}`;
    }
  }

  return null;
}

function resolveSolutionsApiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'solutions') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');

  if (locale === 'zh-CN') {
    const redirects: Record<string, string> = {
      'flexible-classroom/reference/api-classroom':
        '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
      'flexible-classroom/reference/api-recording':
        '/zh-CN/api-reference/flexible-classroom/restful-api/api-recording',
      'flexible-classroom/reference/api-sync':
        '/zh-CN/api-reference/flexible-classroom/restful-api/api-sync',
      'flexible-classroom/reference/api-user':
        '/zh-CN/api-reference/flexible-classroom/restful-api/api-user',
      'flexible-classroom/reference/api-widget':
        '/zh-CN/api-reference/flexible-classroom/restful-api/api-widget',
    };

    return redirects[normalizedPath] ?? null;
  }

  if (locale !== 'en') {
    return null;
  }

  const redirects: Record<string, string> = {
    'agora-analytics/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'agora-analytics/reference/api':
      '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    'agora-analytics/reference/restful-authentication':
      '/en/api-reference/api-ref/agora-analytics/analytics-restful-authentication',
    'flexible-classroom/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'flexible-classroom/reference/classroom-rest-api':
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    'interactive-live-streaming/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'interactive-live-streaming/reference/api-sunset':
      '/en/api-reference/api-ref/rtc/api-sunset',
    'iot/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'iot/reference/channel-management-rest-api':
      '/en/api-reference/api-ref/iot-channel-management-rest-api',
  };

  return redirects[normalizedPath] ?? null;
}

const MERGED_PLATFORM_SUFFIXES: Record<string, PlatformKey> = {
  cpp: 'cpp',
  csharp: 'csharp',
  cscrip: 'csharp',
  cscript: 'csharp',
  go: 'go',
  java: 'java',
  swift: 'swift',
  typescript: 'typescript',
};

function resolveMergedPlatformSuffixRedirect({
  locale,
  slugSegments,
  source,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  source: typeof docsSource;
  tab: string;
}) {
  const requestedSlug = slugSegments.at(-1);
  const platformSeparatorIndex = requestedSlug?.lastIndexOf('.') ?? -1;

  if (!requestedSlug || platformSeparatorIndex <= 0) {
    return null;
  }

  const baseSlug = requestedSlug.slice(0, platformSeparatorIndex);
  const suffix = requestedSlug.slice(platformSeparatorIndex + 1);
  const platform = MERGED_PLATFORM_SUFFIXES[suffix];

  if (!platform) {
    return null;
  }

  const targetSegments = [...slugSegments.slice(0, -1), baseSlug];
  const targetUrl = `/${[locale, tab, ...targetSegments].join('/')}`;

  if (!hasDocsPageForUrl(source, targetUrl)) {
    return null;
  }

  return {
    preserveSearch: false,
    redirectUrl: `${targetUrl}?platform=${platform}`,
  };
}

function hasDocsPageForUrl(source: typeof docsSource, url: string) {
  const [locale, tab, ...slugSegments] = url.split('/').filter(Boolean);
  const slug = slugSegments.at(-1) ?? 'index';

  if (!locale || !tab) {
    return false;
  }

  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      slugSegments,
      tab,
    }),
    locale,
  );

  return Boolean(
    page &&
      page.url === url &&
      !isPlatformGroupPanelPage(page, source.getPages(locale)),
  );
}

export type DocsPagePayload = Exclude<
  Awaited<ReturnType<typeof loadDocsPagePayload>>,
  null | DocsRedirectPayload
>;

export type DocsRedirectPayload = {
  preserveSearch?: boolean;
  redirectUrl: string;
};

async function readProcessedText(page: PageWithSource) {
  try {
    if (!hasProcessedText(page)) {
      return '';
    }

    return await page.data.getText('processed');
  } catch {
    return '';
  }
}

async function resolvePageToc(
  page: PageWithSource,
  processedText: string,
  platform?: PlatformKey,
) {
  const directToc = normalizeToc(getPageToc(page));

  if (directToc.length > 0 && !platform) {
    return directToc;
  }

  try {
    const tocText = platform
      ? buildPlatformMarkdownText(processedText, platform)
      : buildCanonicalPlatformTocText(processedText);

    return normalizeToc(await getTableOfContents(tocText));
  } catch {
    try {
      return normalizeToc(
        await getTableOfContents(buildCanonicalPlatformTocText(processedText)),
      );
    } catch {
      return directToc;
    }
  }
}

function normalizeToc(toc: TOCItemType[] | undefined) {
  return (toc ?? []).flatMap((item) => {
    if (
      typeof item.title !== 'string' ||
      item.title.trim().length === 0 ||
      typeof item.url !== 'string' ||
      item.url.length === 0
    ) {
      return [];
    }

    return [
      {
        depth: item.depth,
        title: item.title,
        url: item.url,
      },
    ];
  });
}

function hasProcessedText(page: PageWithSource): page is PageWithSource & {
  data: { getText: (kind: 'processed') => Promise<string> };
} {
  return 'getText' in page.data && typeof page.data.getText === 'function';
}

function isOpenApiPageWithClientProps(
  page: PageWithSource,
): page is PageWithSource & {
  data: { getClientAPIPageProps: () => Promise<ClientApiPageProps> };
} {
  return (
    page.type === 'openapi' &&
    'getClientAPIPageProps' in page.data &&
    typeof page.data.getClientAPIPageProps === 'function'
  );
}

function getPageToc(page: PageWithSource) {
  return 'toc' in page.data && Array.isArray(page.data.toc)
    ? page.data.toc
    : undefined;
}

function toSupportedLocale(locale: string): AppLocale | null {
  return SUPPORTED_LOCALES.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : null;
}

async function getDocsSidebarNodes({
  activePath,
  locale,
  pageTree,
  pageUrl,
  source,
  tab,
}: {
  activePath?: string;
  locale: AppLocale | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  pageUrl?: string;
  source: typeof docsSource;
  tab: string;
}) {
  if (tab === 'ai') {
    const aiNodes = getNavScopeSidebarNodes({
      getNodeMeta: (node) =>
        getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
      root: pageTree,
      tab,
    });
    const apiReferenceNodes =
      locale === null
        ? []
        : getNavScopeSidebarNodes({
            getNodeMeta: (node) =>
              getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
            root: pageTree,
            tab: OPENAPI_TAB,
          });

    return buildAiProductSidebar(aiNodes, apiReferenceNodes);
  }

  if (
    shouldUseSharedPlatformSidebar(
      tab,
      activePath ?? pageUrl,
      locale,
      pageTree,
      source,
    )
  ) {
    return getSharedRtcSidebarNodes({
      locale,
      pageTree,
      source,
      tab,
      activePath,
    });
  }

  const navScope = activePath
    ? getDocsNavScope({
        activePath,
        locale,
        pageTree,
        source,
        tab,
      })
    : null;
  const sidebar = navScope
    ? getScopedSidebarNodes({
        locale,
        navScope,
        source,
      })
    : getNavScopeSidebarNodes({
        getNodeMeta: (node) =>
          getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
        root: pageTree,
        tab,
      });
  const sourcePageUrls =
    locale === 'zh-CN' && tab === OPENAPI_TAB
      ? getLocaleSourcePageUrls(source, locale)
      : null;
  const sidebarWithSourcePagesOnly = sourcePageUrls
    ? filterSourceBackedSidebarNodes(sidebar, sourcePageUrls)
    : sidebar;
  const scopedReferenceProductSidebar =
    Boolean(navScope) && isReferenceProductSidebarPath(activePath ?? pageUrl);
  const sidebarWithoutReferenceProductIcons = scopedReferenceProductSidebar
    ? stripSidebarSectionIcons(sidebarWithSourcePagesOnly)
    : sidebarWithSourcePagesOnly;

  const sidebarWithRealtimeMediaApiReference =
    addRealtimeMediaApiReferenceSidebarItem(
      sidebarWithoutReferenceProductIcons,
      activePath,
    );

  if (!isOpenApiTab(tab) || !locale) {
    return sidebarWithRealtimeMediaApiReference;
  }

  const openApiSidebar = await addOpenApiEndpointSidebarItems(
    sidebarWithRealtimeMediaApiReference,
    locale,
    tab,
  );

  if (isRecipesApiReferencePath(activePath)) {
    return restoreRecipesSidebarSections(openApiSidebar);
  }

  return openApiSidebar;
}

function getLocaleSourcePageUrls(source: typeof docsSource, locale: AppLocale) {
  return new Set(
    source
      .getPages(locale)
      .filter((page) => hasExistingDocsSourceFile(page, locale))
      .map((page) => page.url),
  );
}

function hasExistingDocsSourceFile(page: PageWithSource, locale: AppLocale) {
  if (!('info' in page.data)) {
    return true;
  }

  if (!page.path.startsWith(`${locale}/`)) {
    return false;
  }

  const fullPath = page.data.info.fullPath;

  if (fullPath.startsWith('/virtual/')) {
    return true;
  }

  return existsSync(fullPath) || existsSync(`content/docs/${page.path}`);
}

function filterSourceBackedSidebarNodes(
  nodes: DocsSidebarNode[],
  sourcePageUrls: Set<string>,
): DocsSidebarNode[] {
  const filtered: DocsSidebarNode[] = [];

  for (const node of nodes) {
    if (node.type === 'page') {
      if (
        node.external ||
        node.href ||
        sourcePageUrls.has(node.url) ||
        isOpenApiTabUrl(node.url)
      ) {
        filtered.push(node);
      }
      continue;
    }

    const children = filterSourceBackedSidebarNodes(
      node.children,
      sourcePageUrls,
    );

    if (children.length === 0) {
      continue;
    }

    const filteredSection: DocsSidebarNode = {
      ...node,
      children,
    };

    if (node.url && !sourcePageUrls.has(node.url)) {
      delete filteredSection.url;
    }

    filtered.push(filteredSection);
  }

  return filtered;
}

function isOpenApiTabUrl(url: string) {
  return url.includes('/api-reference/openapi/');
}

const PRODUCT_API_REFERENCE_LINKS = [
  {
    locale: 'en',
    productSlug: 'broadcast-streaming',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    locale: 'en',
    productSlug: 'cloud-recording',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/cloud-recording',
  },
  {
    locale: 'en',
    productSlug: 'im',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/im',
  },
  {
    locale: 'en',
    productSlug: 'media-pull',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/media-pull',
  },
  {
    locale: 'en',
    productSlug: 'media-push',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/media-push',
  },
  {
    locale: 'en',
    productSlug: 'on-premise-recording',
    tab: 'realtime-media',
    title: 'API reference',
    url: '/en/api-reference/api-ref/on-premise-recording',
  },
  {
    locale: 'en',
    productSlug: 'rtm',
    tab: 'realtime-media',
    title: 'Signaling REST API',
    url: '/en/api-reference/api-ref/signaling',
  },
  {
    locale: 'en',
    productSlug: 'rtmp-gateway',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtmp-gateway',
  },
  {
    locale: 'en',
    productSlug: 'speech-to-text',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/speech-to-text',
  },
  {
    locale: 'en',
    productSlug: 'video',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    locale: 'en',
    productSlug: 'voice',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    locale: 'en',
    productSlug: 'whiteboard',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/whiteboard',
  },
  {
    locale: 'zh-CN',
    productSlug: 'rtc',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/rtc',
  },
  {
    locale: 'zh-CN',
    productSlug: 'rtm',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/signaling/publish',
  },
  {
    locale: 'zh-CN',
    productSlug: 'speech-to-text',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/speech-to-text',
  },
  {
    locale: 'zh-CN',
    productSlug: 'cloud-recording',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/cloud-recording',
  },
  {
    locale: 'zh-CN',
    productSlug: 'transcoding',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/cloud-transcoding',
  },
  {
    locale: 'zh-CN',
    productSlug: 'usage-analytics',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/agora-analytics',
  },
  {
    locale: 'zh-CN',
    productSlug: 'media-push',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/media-push',
  },
  {
    locale: 'zh-CN',
    productSlug: 'media-pull',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/media-pull',
  },
  {
    locale: 'zh-CN',
    productSlug: 'rtmp-gateway',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/rtmp-gateway',
  },
  {
    locale: 'zh-CN',
    productSlug: 'fusion-cdn',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/fusion-cdn',
  },
  {
    locale: 'zh-CN',
    productSlug: 'whiteboard',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/whiteboard/restful',
  },
  {
    locale: 'zh-CN',
    productSlug: 'danmaku',
    tab: 'realtime-media',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/danmaku',
  },
  {
    locale: 'zh-CN',
    productSlug: 'ppt-transcoding',
    tab: 'solutions',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/ppt-conversion-service',
  },
  {
    locale: 'zh-CN',
    productSlug: 'voip-call',
    tab: 'solutions',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/api-ref/voip-callkit',
  },
  {
    locale: 'zh-CN',
    productSlug: 'flexible-classroom',
    tab: 'solutions',
    title: 'RESTful API',
    url: '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  },
] as const;

type ProductApiReferenceLink = (typeof PRODUCT_API_REFERENCE_LINKS)[number];

function addRealtimeMediaApiReferenceSidebarItem(
  nodes: DocsSidebarNode[],
  activePath?: string,
): DocsSidebarNode[] {
  const link = getProductApiReferenceLink(activePath);

  if (!link) {
    return nodes;
  }

  const pageNode = {
    id: link.url,
    linked: true,
    title: link.title,
    type: 'page',
    url: link.url,
  } satisfies DocsSidebarPageNode;

  const existingUrls = new Set([
    link.url,
    ...getProductLegacyApiReferenceUrls(link),
  ]);

  return nodes.map((node) => {
    if (node.type !== 'section') {
      return node;
    }

    if (isProductReferenceSectionTitle(node.title, link.locale)) {
      return {
        ...node,
        children: [
          pageNode,
          ...filterSidebarNodes(
            node.children,
            (child) => child.type !== 'page' || !existingUrls.has(child.url),
          ),
        ],
      };
    }

    return {
      ...node,
      children: addRealtimeMediaApiReferenceSidebarItem(
        node.children,
        activePath,
      ),
    };
  });
}

function getProductApiReferenceLink(activePath?: string) {
  const [, locale, tab, productSlug] = activePath?.split('/') ?? [];

  if (!locale || !tab || !productSlug) {
    return null;
  }

  return (
    PRODUCT_API_REFERENCE_LINKS.find(
      (link) =>
        link.locale === locale &&
        link.tab === tab &&
        link.productSlug === productSlug,
    ) ?? null
  );
}

function isProductReferenceSectionTitle(
  title: string,
  locale: ProductApiReferenceLink['locale'],
) {
  return locale === 'zh-CN'
    ? title === '参考' || title === '参考信息'
    : title === 'Reference';
}

function getProductLegacyApiReferenceUrls(link: ProductApiReferenceLink) {
  if (link.locale !== 'en') {
    return [];
  }

  const prefix = `/en/${link.tab}/${link.productSlug}`;

  switch (link.productSlug) {
    case 'broadcast-streaming':
      return [
        `${prefix}/reference/agora-console-rest-api`,
        `${prefix}/reference/api-sunset`,
        `${prefix}/reference/restful-api`,
      ];
    case 'cloud-recording':
      return [
        `${prefix}/reference/rest-api-overview`,
        `${prefix}/reference/restful-api`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'im':
      return [`${prefix}/reference/server-api`];
    case 'media-pull':
      return [
        `${prefix}/reference/restful-api`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'media-push':
      return [
        `${prefix}/build/restful-api`,
        `${prefix}/reference/restful-authentication`,
        `${prefix}/reference/restful-type-definition`,
      ];
    case 'on-premise-recording':
      return [`${prefix}/reference/api-reference`];
    case 'rtm':
      return [`${prefix}/reference/rest-api`];
    case 'rtmp-gateway':
      return [
        `${prefix}/reference/rest-api`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'speech-to-text':
      return [
        `${prefix}/reference/api-callback-service`,
        `${prefix}/reference/rest-api`,
        `${prefix}/reference/rest-api-v5`,
        `${prefix}/reference/rest-api-v6`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'video':
      return [
        `${prefix}/reference/agora-console-rest-api`,
        `${prefix}/reference/api-sunset`,
      ];
    case 'voice':
      return [
        `${prefix}/reference/agora-console-rest-api`,
        `${prefix}/reference/api-sunset`,
      ];
    case 'whiteboard':
      return [`${prefix}/reference/rest-api`, `${prefix}/reference/uikit-sdk`];
    default:
      return [];
  }
}

function isRecipesApiReferencePath(path?: string) {
  return (
    path?.startsWith('/en/api-reference/recipes') ||
    path?.startsWith('/zh-CN/api-reference/recipes') ||
    false
  );
}

function isReferenceProductSidebarPath(path?: string) {
  const [, locale, tab, scopeRoot] = path?.split('/') ?? [];

  return (
    SUPPORTED_LOCALES.includes(locale as AppLocale) &&
    tab === OPENAPI_TAB &&
    Boolean(scopeRoot) &&
    !['faq', 'recipes', 'sdks'].includes(scopeRoot)
  );
}

function stripSidebarSectionIcons(nodes: DocsSidebarNode[]): DocsSidebarNode[] {
  return nodes.map((node) => {
    if (node.type === 'page') {
      return node;
    }

    const { icon: _icon, ...section } = node;

    return {
      ...section,
      children: stripSidebarSectionIcons(node.children),
    };
  });
}

function restoreRecipesSidebarSections(
  nodes: DocsSidebarNode[],
): DocsSidebarNode[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const [indexNode, ...rest] = nodes;
  const pageNodes = rest.filter(
    (node): node is DocsSidebarPageNode => node.type === 'page',
  );

  if (pageNodes.length === 0) {
    return nodes;
  }

  const quickstarts = pageNodes.filter((node) =>
    ['Python Quickstart', 'Golang Quickstart', 'NextJS Quickstart'].includes(
      node.title,
    ),
  );
  const integrationPatterns = pageNodes.filter((node) =>
    ['Custom LLM', 'Custom Modalities'].includes(node.title),
  );
  const useCases = pageNodes.filter((node) =>
    ['Wellness Coach', 'Thymia Biomarkers'].includes(node.title),
  );

  if (
    quickstarts.length + integrationPatterns.length + useCases.length !==
    pageNodes.length
  ) {
    return nodes;
  }

  return [
    indexNode,
    {
      children: quickstarts,
      collapsible: false,
      id: 'recipes-quickstarts',
      title: 'Quickstarts',
      type: 'section',
    },
    {
      children: integrationPatterns,
      collapsible: false,
      id: 'recipes-integration-patterns',
      title: 'Integration patterns',
      type: 'section',
    },
    {
      children: useCases,
      collapsible: false,
      id: 'recipes-use-cases',
      title: 'Use cases',
      type: 'section',
    },
  ];
}

function buildAiProductSidebar(
  nodes: DocsSidebarNode[],
  apiReferenceNodes: DocsSidebarNode[] = [],
): DocsSidebarNode[] {
  const aiOverview =
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai') ??
    findSidebarPageByExactUrlInNodes(nodes, '/zh-CN/ai');
  const conversationalAiQuickstart =
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai/get-started/quickstart') ??
    findSidebarPageByExactUrlInNodes(nodes, '/zh-CN/ai/get-started/quickstart');
  const conversationalAiReleaseNotes =
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai/release-notes') ??
    findSidebarPageByExactUrlInNodes(nodes, '/zh-CN/ai/release-notes') ??
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai/reference/release-notes') ??
    findSidebarPageByExactUrlInNodes(
      nodes,
      '/zh-CN/ai/reference/release-notes',
    );
  const buildSection = findTopLevelSidebarSection(nodes, ['Build', '构建']);
  const bestPracticesSection = findTopLevelSidebarSection(nodes, [
    'Best practices',
    '最佳实践',
  ]);
  const modelsSection = findTopLevelSidebarSection(nodes, ['Models', '模型']);
  const referenceSection = findTopLevelSidebarSection(nodes, [
    'Reference',
    '参考',
  ]);
  const deviceKitSection = findTopLevelSidebarSection(nodes, [
    'Convo AI Device Kit',
  ]);
  const _deviceKitTopLevelSection = findTopLevelSidebarSection(nodes, [
    'Convo AI Device Kit',
  ]);

  if (
    !aiOverview ||
    !conversationalAiQuickstart ||
    !buildSection ||
    !bestPracticesSection ||
    !modelsSection ||
    !referenceSection ||
    !deviceKitSection
  ) {
    const filteredNodes = filterSidebarNodes(nodes, (node) => {
      if (node.type !== 'page') {
        return true;
      }

      return !node.url.includes('/ai/choose-your-path/');
    });

    return addAiRestApiReferenceSidebarItem(filteredNodes);
  }

  const conversationalAiApiReferenceSection = findTopLevelSidebarSection(
    apiReferenceNodes,
    ['Conversational AI'],
  );
  const _conversationalAiRestApiSection = conversationalAiApiReferenceSection
    ? (findNestedSidebarSectionByExactUrl(
        conversationalAiApiReferenceSection,
        '/en/api-reference/conversational-ai/rest-api',
      ) ??
      findNestedSidebarSectionByExactUrl(
        conversationalAiApiReferenceSection,
        '/zh-CN/api-reference/conversational-ai/rest-api',
      ))
    : null;

  const isZhCn = aiOverview.url.startsWith('/zh-CN/');
  const aiLocalePrefix = isZhCn ? '/zh-CN' : '/en';
  const restApiUrl = `${aiLocalePrefix}/api-reference/api-ref/conversational-ai`;

  const restApiPage = {
    id: restApiUrl,
    linked: true,
    title: 'RESTful API',
    type: 'page',
    url: restApiUrl,
  } satisfies DocsSidebarPageNode;
  const serverSdkTypescriptUrl = isZhCn
    ? `${aiLocalePrefix}/api-reference/conversational-ai/server-sdk/typescript`
    : `${aiLocalePrefix}/api-reference/api-ref/server-sdk/typescript`;
  const serverSdkTypescriptPage = {
    id: serverSdkTypescriptUrl,
    linked: true,
    title: isZhCn ? 'Agora Agent SDK' : 'Agora Agent SDK',
    type: 'page',
    url: serverSdkTypescriptUrl,
  } satisfies DocsSidebarPageNode;

  const referenceLeadingChildren = referenceSection.children.filter(
    (child) =>
      child.type === 'page' &&
      (child.url === '/en/ai/reference/event-types' ||
        child.url === '/zh-CN/ai/reference/event-types'),
  );
  const referenceTrailingChildren = referenceSection.children.filter(
    (child) =>
      !(
        child.type === 'page' &&
        (child.url === '/en/ai/reference/event-types' ||
          child.url === '/zh-CN/ai/reference/event-types' ||
          child.url === '/en/ai/reference/restful-api' ||
          child.url === '/zh-CN/ai/reference/restful-api' ||
          child.url === '/en/ai/reference/server-sdk' ||
          child.url === '/en/ai/reference/client-toolkit' ||
          child.url === '/zh-CN/ai/reference/server-sdk' ||
          child.url === '/zh-CN/ai/reference/client-toolkit' ||
          child.url === '/en/ai/release-notes' ||
          child.url === '/zh-CN/ai/release-notes' ||
          child.url === '/en/ai/reference/release-notes' ||
          child.url === '/zh-CN/ai/reference/release-notes')
      ),
  );

  const mergedReferenceSection: DocsSidebarSectionNode = {
    ...stripSidebarSectionMeta(referenceSection),
    children: [
      restApiPage,
      serverSdkTypescriptPage,
      ...referenceLeadingChildren,
      ...stripSidebarSectionMetaFromNodes(referenceTrailingChildren),
    ],
  };

  const mergedBuildSection: DocsSidebarSectionNode = {
    ...stripSidebarSectionMeta(buildSection),
    children: stripSidebarSectionMetaFromNodes([
      ...buildSection.children,
      {
        ...stripSidebarSectionMeta(bestPracticesSection),
        children: stripSidebarSectionMetaFromNodes(
          bestPracticesSection.children,
        ),
        title:
          buildSection.title === '构建' ? '优化与加固' : 'Harden and optimize',
      },
    ]),
  };

  return [
    {
      ...aiOverview,
      title: isZhCn ? '概览' : aiOverview.title,
    },
    {
      children: stripSidebarSectionMetaFromNodes([
        ...(conversationalAiReleaseNotes ? [conversationalAiReleaseNotes] : []),
        {
          ...conversationalAiQuickstart,
          title: isZhCn ? 'Quickstart' : 'Quickstart',
        },
        mergedBuildSection,
        modelsSection,
        mergedReferenceSection,
      ]),
      icon: 'Bot',
      id: 'ai-product-software-clients',
      title: isZhCn ? 'Voice Agent in apps' : 'Voice agent in apps',
      type: 'section',
    },
    {
      ...stripSidebarSectionMeta(deviceKitSection),
      children: [
        ...stripSidebarSectionMetaFromNodes(
          flattenDeviceKitSidebarChildren(deviceKitSection.children),
        ),
      ],
      icon: 'Cpu',
      id: 'ai-product-dedicated-devices',
      title: isZhCn
        ? 'Voice Agent on dedicated devices'
        : 'Voice agent on dedicated devices',
      type: 'section',
    },
  ];
}

function addAiRestApiReferenceSidebarItem(
  nodes: DocsSidebarNode[],
): DocsSidebarNode[] {
  const locale = getSidebarLocale(nodes);

  if (!locale) {
    return nodes;
  }

  const restApiUrl = `/${locale}/api-reference/api-ref/conversational-ai`;
  const restApiPage = {
    id: restApiUrl,
    linked: true,
    title: 'RESTful API',
    type: 'page',
    url: restApiUrl,
  } satisfies DocsSidebarPageNode;
  const existingUrls = new Set([
    restApiUrl,
    `/${locale}/ai/reference/restful-api`,
    `/${locale}/api-reference/api-ref/conversational-ai/authentication`,
    `/${locale}/api-reference/conversational-ai/rest-api`,
    `/${locale}/api-reference/conversational-ai/rest-api/authentication`,
  ]);

  return nodes.map((node) => {
    if (
      node.type !== 'section' ||
      !isAiSoftwareClientsSectionTitle(node.title)
    ) {
      return node;
    }

    return {
      ...node,
      children: addAiRestApiReferenceToReferenceSection(
        node.children,
        restApiPage,
        existingUrls,
        locale,
      ),
    };
  });
}

function addAiRestApiReferenceToReferenceSection(
  nodes: DocsSidebarNode[],
  restApiPage: DocsSidebarPageNode,
  existingUrls: Set<string>,
  locale: AppLocale,
): DocsSidebarNode[] {
  return nodes.map((node) => {
    if (node.type !== 'section') {
      return node;
    }

    if (isProductReferenceSectionTitle(node.title, locale)) {
      return {
        ...node,
        children: [
          restApiPage,
          ...filterSidebarNodes(
            node.children,
            (child) => child.type !== 'page' || !existingUrls.has(child.url),
          ),
        ],
      };
    }

    return {
      ...node,
      children: addAiRestApiReferenceToReferenceSection(
        node.children,
        restApiPage,
        existingUrls,
        locale,
      ),
    };
  });
}

function isAiSoftwareClientsSectionTitle(title: string) {
  return (
    title === 'Voice Agent in apps' ||
    title === 'Voice agent in apps' ||
    title === '对话式 AI 引擎'
  );
}

function getSidebarLocale(nodes: DocsSidebarNode[]): AppLocale | null {
  for (const node of nodes) {
    const locale = getSidebarNodeLocale(node);
    if (locale) {
      return locale;
    }
  }

  return null;
}

function getSidebarNodeLocale(node: DocsSidebarNode): AppLocale | null {
  if (node.type === 'page') {
    if (node.url.startsWith('/zh-CN/')) {
      return 'zh-CN';
    }

    if (node.url.startsWith('/en/')) {
      return 'en';
    }

    return null;
  }

  for (const child of node.children) {
    const locale = getSidebarNodeLocale(child);
    if (locale) {
      return locale;
    }
  }

  return null;
}

function flattenDeviceKitSidebarChildren(
  children: DocsSidebarNode[],
): DocsSidebarNode[] {
  const flattened: DocsSidebarNode[] = [];
  let hasPushedReleaseNotes = false;
  const releaseNotes = findSidebarPageByExactUrlInNodes(
    children,
    '/en/ai/device-kit/reference/release-notes',
  );

  for (const child of children) {
    if (child.type === 'page') {
      if (
        child.url === '/en/ai/device-kit' ||
        child.url === '/zh-CN/ai/device-kit'
      ) {
        continue;
      }

      if (child.url === '/en/ai/device-kit/reference/release-notes') {
        hasPushedReleaseNotes = true;
      }
      flattened.push(child);
      continue;
    }

    if (child.title === 'Start here' || child.title === '从这里开始') {
      const quickstart = findSidebarPageByExactUrl(
        child,
        '/en/ai/device-kit/start-here/quickstart',
      );

      if (quickstart) {
        if (releaseNotes && !hasPushedReleaseNotes) {
          flattened.push(releaseNotes);
          hasPushedReleaseNotes = true;
        }
        flattened.push({
          ...quickstart,
          title: quickstart.url.startsWith('/zh-CN/')
            ? 'Quickstart'
            : 'Quickstart',
        });
      }
      continue;
    }

    if (
      child.title === 'Reference' ||
      child.title === '参考' ||
      child.title === 'Plan rollout'
    ) {
      flattened.push(
        stripSidebarSectionMetaFromNode({
          ...child,
          children: child.children.filter(
            (node) =>
              !(
                node.type === 'page' &&
                (node.url === '/en/ai/device-kit/reference/enable-services' ||
                  node.url ===
                    '/zh-CN/ai/device-kit/reference/enable-services' ||
                  node.url === '/en/ai/device-kit/reference/release-notes' ||
                  node.url === '/zh-CN/ai/device-kit/reference/release-notes')
              ),
          ),
        }),
      );
      continue;
    }

    flattened.push(stripSidebarSectionMetaFromNode(child));
  }

  return flattened;
}

function findSidebarPageByExactUrlInNodes(
  nodes: DocsSidebarNode[],
  url: string,
): DocsSidebarPageNode | null {
  for (const node of nodes) {
    const match = findSidebarPageByExactUrl(node, url);
    if (match) {
      return match;
    }
  }

  return null;
}

function findSidebarPageByExactUrl(
  node: DocsSidebarNode,
  url: string,
): DocsSidebarPageNode | null {
  if (node.type === 'page') {
    return node.url === url ? node : null;
  }

  for (const child of node.children) {
    const match = findSidebarPageByExactUrl(child, url);
    if (match) {
      return match;
    }
  }

  return null;
}

function findNestedSidebarSectionByExactUrl(
  node: DocsSidebarNode,
  url: string,
): DocsSidebarSectionNode | null {
  if (node.type === 'page') {
    return null;
  }

  if (node.url === url) {
    return node;
  }

  for (const child of node.children) {
    const match = findNestedSidebarSectionByExactUrl(child, url);
    if (match) {
      return match;
    }
  }

  return null;
}

function findTopLevelSidebarSection(
  nodes: DocsSidebarNode[],
  titles: string[],
): DocsSidebarSectionNode | null {
  for (const node of nodes) {
    if (node.type === 'section' && titles.includes(node.title)) {
      return node;
    }
  }

  return null;
}

function stripSidebarSectionMetaFromNodes(
  nodes: DocsSidebarNode[],
): DocsSidebarNode[] {
  return nodes.map((node) => stripSidebarSectionMetaFromNode(node));
}

function stripSidebarSectionMetaFromNode(
  node: DocsSidebarNode,
): DocsSidebarNode {
  if (node.type === 'page') {
    return node;
  }

  return {
    ...stripSidebarSectionMeta(node),
    children: stripSidebarSectionMetaFromNodes(node.children),
  };
}

function stripSidebarSectionMeta(
  node: DocsSidebarSectionNode,
): DocsSidebarSectionNode {
  const { icon: _icon, url: _url, ...rest } = node;

  return rest;
}

function getDocsPages({
  locale,
  pages,
}: {
  locale: AppLocale | null;
  pages: {
    description?: string;
    title: string;
    url: string;
  }[];
}) {
  if (!locale) {
    return pages;
  }

  const existingUrls = new Set(pages.map((page) => page.url));
  const endpointPages = getOpenApiLanes()
    .filter(
      (lane) =>
        isOpenApiTab(lane.tab) &&
        getOpenApiLaneLocales(lane).includes(locale as AppLocale),
    )
    .flatMap((lane) =>
      getOpenApiOperationIds(lane).map((operationId) => ({
        title: lane.operations[operationId].title[locale],
        url: getOpenApiEndpointUrl(lane, locale, operationId),
      })),
    )
    .filter((page) => !existingUrls.has(page.url));

  return [...pages, ...endpointPages];
}

function resolveDocsSidebarHeader({
  activePath,
  hidePlatformTabs,
  locale,
  navScope,
  pageTree,
  source,
  tab,
}: {
  activePath: string;
  hidePlatformTabs?: boolean;
  locale: AppLocale | string | null;
  navScope: DocsNavScopeResolution | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
  if (tab === 'ai') {
    return undefined;
  }

  if (!navScope) {
    return undefined;
  }

  const restApiProductBackLink = getZhCnRestApiProductBackLink(activePath);
  const baseHeader = restApiProductBackLink
    ? {
        ...navScope.header,
        backHref: restApiProductBackLink.backHref,
        backLabel: restApiProductBackLink.backLabel,
      }
    : navScope.header;

  if (hidePlatformTabs) {
    return {
      ...baseHeader,
      versionSwitcher: undefined,
    };
  }

  if (!shouldUseSharedPlatformSidebar(tab, activePath)) {
    return baseHeader;
  }

  const versionLinks = getNavScopeVersionLinks({
    activePath,
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    root: pageTree,
    tab,
  }).filter((link) => isSharedPlatformTabUrl(activePath, link.href));

  if (
    versionLinks.length === 0 ||
    !versionLinks.some((link) => link.href === activePath)
  ) {
    return {
      ...baseHeader,
      versionSwitcher: undefined,
    };
  }

  return {
    ...baseHeader,
    versionSwitcher: {
      currentId:
        versionLinks.find((item) => item.href === activePath)?.id ??
        baseHeader.versionSwitcher?.currentId ??
        versionLinks[0].id,
      presentation: 'tabs' as const,
      versions: versionLinks,
    },
  };
}

function getZhCnRestApiProductBackLink(activePath: string) {
  return ZH_CN_REST_API_PRODUCT_BACK_LINKS.find((entry) =>
    isSamePathOrDescendant(activePath, entry.prefix),
  );
}

function isSamePathOrDescendant(activePath: string, prefix: string) {
  return activePath === prefix || activePath.startsWith(`${prefix}/`);
}

function shouldUseSharedPlatformSidebar(
  tab: string,
  activePath: string | undefined,
  locale?: AppLocale | null,
  pageTree?: ReturnType<typeof docsSource.getPageTree>,
  source?: typeof docsSource,
) {
  if (tab !== 'realtime-media' || typeof activePath !== 'string') {
    return false;
  }

  if (!pageTree || !source) {
    return true;
  }

  const navScope = getDocsNavScope({
    activePath,
    locale: locale ?? null,
    pageTree,
    source,
    tab,
  });

  return Boolean(
    navScope?.scope.meta.navScope?.sharedSidebar &&
      navScope.scope.meta.navScope?.platformTabs &&
      navScope.scope.meta.navScope?.versions?.length,
  );
}

function getSharedRtcSidebarNodes({
  activePath,
  locale,
  pageTree,
  source,
  tab,
}: {
  activePath?: string;
  locale: AppLocale | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
  if (!activePath) {
    return getNavScopeSidebarNodes({
      getNodeMeta: (node) =>
        getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
      root: pageTree,
      tab,
    });
  }

  const navScope = getDocsNavScope({
    activePath,
    locale,
    pageTree,
    source,
    tab,
  });

  if (!navScope) {
    return getNavScopeSidebarNodes({
      getNodeMeta: (node) =>
        getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
      root: pageTree,
      tab,
    });
  }

  return getSharedNavScopeSidebarNodes({
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    navScope,
  });
}

function isSharedPlatformTabUrl(activePath: string, targetHref: string) {
  if (!activePath.includes('/realtime-media/')) {
    return true;
  }

  const activeSegments = activePath.split('/').filter(Boolean);
  const targetSegments = targetHref.split('/').filter(Boolean);

  const isActiveScopeIndex = activeSegments.length <= 4;
  const isTargetScopeIndex = targetSegments.length <= 4;

  if (isActiveScopeIndex || isTargetScopeIndex) {
    if (isActiveScopeIndex && isTargetScopeIndex) {
      return true;
    }

    return false;
  }

  if (activeSegments.length <= 4 || targetSegments.length <= 4) {
    return true;
  }

  return activeSegments[4] !== targetSegments[4]
    ? activeSegments.slice(5).join('/') === targetSegments.slice(5).join('/')
    : activeSegments.slice(4).join('/') === targetSegments.slice(4).join('/');
}

function getDocsNavScope({
  activePath,
  locale,
  pageTree,
  source,
  tab,
}: {
  activePath: string;
  locale: AppLocale | string | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
  return resolveDocsNavScope({
    activePath,
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    root: pageTree,
    tab,
  });
}

function getScopedSidebarNodes({
  locale,
  navScope,
  source,
}: {
  locale: AppLocale | null;
  navScope: DocsNavScopeResolution;
  source: typeof docsSource;
}) {
  return getScopedNavScopeSidebarNodes({
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    navScope,
  });
}

function getDocsMetaData(meta: ReturnType<typeof docsSource.getNodeMeta>) {
  return meta?.data;
}

async function addOpenApiEndpointSidebarItems(
  sidebar: DocsSidebarNode[],
  locale: AppLocale,
  tab: string,
): Promise<DocsSidebarNode[]> {
  return Promise.all(
    sidebar.map((node) =>
      appendEndpointPagesToOpenApiParent(node, locale, tab),
    ),
  );
}

async function appendEndpointPagesToOpenApiParent(
  node: DocsSidebarNode,
  locale: AppLocale,
  tab: string,
): Promise<DocsSidebarNode> {
  if (node.type !== 'section') {
    return decorateOpenApiEndpointSidebarPage(node, locale, tab);
  }

  const children = await Promise.all(
    node.children.map((child) =>
      appendEndpointPagesToOpenApiParent(child, locale, tab),
    ),
  );
  const lane = getOpenApiLanes().find(
    (item) =>
      item.tab === tab &&
      getOpenApiLaneLocales(item).includes(locale) &&
      // Only a section that genuinely REPRESENTS the lane gets its endpoint
      // pages appended. A linked-header section (rule 2 from docs-tree) carries
      // the lane's parent URL on node.url. We deliberately do NOT match a
      // section that merely *links* to the lane via a child page (e.g. a
      // product group whose "REST API" cross-link points at the lane landing),
      // otherwise that group would absorb the whole lane's endpoints inline.
      node.url === item.parentUrl[locale],
  );

  if (lane) {
    const existingUrls = new Set(
      children.flatMap((child) => (child.type === 'page' ? [child.url] : [])),
    );
    const endpointPages: DocsSidebarNode[] = (
      await Promise.all(
        getOpenApiOperationIds(lane).map(async (operationId) => ({
          id: getOpenApiEndpointUrl(lane, locale, operationId),
          method: (await getOpenApiOperation(lane, operationId, locale)).method,
          title: lane.operations[operationId].title[locale],
          type: 'page' as const,
          url: getOpenApiEndpointUrl(lane, locale, operationId),
        })),
      )
    ).filter((item) => !existingUrls.has(item.url));

    return {
      ...node,
      children: [...children, ...endpointPages],
    };
  }

  return {
    ...node,
    children,
  };
}

async function decorateOpenApiEndpointSidebarPage(
  node: DocsSidebarNode,
  locale: AppLocale,
  tab: string,
): Promise<DocsSidebarNode> {
  if (node.type !== 'page') {
    return node;
  }

  const slugSegments = node.url.split('/').filter(Boolean).slice(2);
  const route = resolveOpenApiEndpointRoute(locale, tab, slugSegments);

  if (!route) {
    return node;
  }

  return {
    ...node,
    id: route.url,
    method: (await getOpenApiOperation(route.lane, route.operationId, locale))
      .method,
    title: route.lane.operations[route.operationId].title[locale],
    url: route.url,
  };
}

function getOpenApiPrevNextLinks(
  lane: OpenApiLane,
  locale: AppLocale,
  operationId: string,
) {
  const operationIds = getOpenApiOperationIds(lane);
  const currentIndex = operationIds.indexOf(operationId);

  if (currentIndex < 0) {
    return {};
  }

  return {
    next: getOpenApiNavigationLink(
      lane,
      locale,
      operationIds[currentIndex + 1],
    ),
    previous: getOpenApiNavigationLink(
      lane,
      locale,
      operationIds[currentIndex - 1],
    ),
  };
}

function getOpenApiNavigationLink(
  lane: OpenApiLane,
  locale: AppLocale,
  operationId: string | undefined,
) {
  if (!operationId) {
    return undefined;
  }

  return {
    title: lane.operations[operationId].title[locale],
    url: getOpenApiEndpointUrl(lane, locale, operationId),
  };
}
