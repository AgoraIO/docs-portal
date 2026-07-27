import fs from 'node:fs';
import path from 'node:path';

const SITEMAP_PATH = 'src/lib/legacy-sitemap/sitemap.xml';
const INVENTORY_PATH = 'src/lib/legacy-sitemap/new-docs-inventory.json';
const REDIRECTS_PATH = 'src/lib/legacy-sitemap/redirects.json';
const REVIEW_REPORT_PATH = 'src/lib/legacy-sitemap/review-report.json';
const SNAPSHOT_DOWNLOADED_AT = '2026-06-29';

const MANUAL_LEGACY_URLS = [
  'https://docs.agora.io/en/cloud-recording/get-started/getstarted',
];

const PRODUCT_MAPPINGS = {
  'agora-analytics': {
    base: '/en/realtime-media/agora-analytics',
    fallback: '/en/realtime-media/agora-analytics/product-overview',
  },
  'agora-chat': {
    base: '/en/realtime-media/im',
    fallback: '/en/realtime-media/im',
  },
  'broadcast-streaming': {
    base: '/en/realtime-media/broadcast-streaming',
    fallback: '/en/realtime-media/broadcast-streaming',
  },
  'cloud-recording': {
    base: '/en/realtime-media/cloud-recording',
    fallback: '/en/realtime-media/cloud-recording',
  },
  'cloud-transcoding': {
    base: '/en/realtime-media/transcoding',
    fallback: '/en/realtime-media/transcoding',
  },
  'conversational-ai': {
    base: '/en/ai',
    fallback: '/en/ai',
  },
  'convo-ai-device-kit': {
    base: '/en/ai/device-kit',
    fallback: '/en/ai/device-kit/start-here/quickstart',
  },
  'extensions-marketplace': {
    base: '/en/realtime-media/marketplace',
    fallback: '/en/realtime-media/marketplace',
  },
  'flexible-classroom': {
    base: '/en/realtime-media/flexible-classroom',
    fallback: '/en/realtime-media/flexible-classroom/product-overview',
  },
  'interactive-live-streaming': {
    base: '/en/realtime-media/interactive-live-streaming',
    fallback: '/en/realtime-media/interactive-live-streaming/product-overview',
  },
  'interactive-whiteboard': {
    base: '/en/realtime-media/whiteboard',
    fallback: '/en/realtime-media/whiteboard',
  },
  iot: {
    base: '/en/realtime-media/iot',
    fallback: '/en/realtime-media/iot/product-overview',
  },
  'media-gateway': {
    base: '/en/realtime-media/rtmp-gateway',
    fallback: '/en/realtime-media/rtmp-gateway',
  },
  'media-pull': {
    base: '/en/realtime-media/media-pull',
    fallback: '/en/realtime-media/media-pull',
  },
  'media-push': {
    base: '/en/realtime-media/media-push',
    fallback: '/en/realtime-media/media-push',
  },
  'on-premise-recording': {
    base: '/en/realtime-media/on-premise-recording',
    fallback: '/en/realtime-media/on-premise-recording',
  },
  'open-ai-integration': {
    base: '/en/ai/reference',
    fallback: '/en/ai/reference/openai-realtime-integration',
  },
  'real-time-stt': {
    base: '/en/realtime-media/speech-to-text',
    fallback: '/en/realtime-media/speech-to-text',
  },
  'server-gateway': {
    base: '/en/realtime-media/rtc-server-sdk',
    fallback: '/en/realtime-media/rtc-server-sdk',
  },
  signaling: {
    base: '/en/realtime-media/rtm',
    fallback: '/en/realtime-media/rtm',
  },
  'ten-agent': {
    base: '/en/ai/ten-agent',
    fallback: '/en/ai/ten-agent/project-overview',
  },
  'ten-framework': {
    base: '/en/ai/ten-agent',
    fallback: '/en/ai/ten-agent/project-overview',
  },
  'video-calling': {
    base: '/en/realtime-media/video',
    fallback: '/en/realtime-media/video',
  },
  'voice-calling': {
    base: '/en/realtime-media/voice',
    fallback: '/en/realtime-media/voice',
  },
};

const RENAMED_LEAVES = new Map([
  ['product-overview', ['product-overview', 'overview']],
  ['quickstart', ['quickstart', 'get-started-sdk', 'quick-start']],
  ['get-started-sdk', ['get-started-sdk', 'quickstart', 'quick-start']],
  ['pricing', ['pricing', 'billing-policies']],
  ['authentication', ['authentication', 'restful-authentication']],
]);

const PRODUCT_SPECIFIC_TARGETS = {
  'agora-analytics': {
    'analyze/chat-sdk/data-insights':
      '/en/realtime-media/agora-analytics/build/explore-and-analyze-data/chat-data-insights',
    'analyze/chat-sdk/data-metrics':
      '/en/realtime-media/agora-analytics/build/explore-and-analyze-data/chat-data-metrics',
  },
  'agora-chat': {
    'agora-console/ip_whitelist':
      '/en/realtime-media/im/build/secure-access-and-authentication/ip-whitelist-rest-api',
    'develop/ip_allowlist':
      '/en/realtime-media/im/build/secure-access-and-authentication/ip-allowlist',
    'reference/http-status-codes':
      '/en/realtime-media/im/reference/error-codes',
    'reference/limitations':
      '/en/realtime-media/im/reference/supported-platforms',
    'restful-api/chat-group-management/create-delete-retrieve-groups':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-chat-groups',
    'restful-api/chat-group-management/manage-group-allowlist':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-members',
    'restful-api/chat-group-management/manage-group-announcement-files':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-attributes',
    'restful-api/chat-group-management/manage-group-blocklist':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-members',
    'restful-api/chat-group-management/manage-group-mutelist':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-members',
    'restful-api/chatroom-management/manage-chatroom-admins':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatroom-members',
    'restful-api/chatroom-management/manage-chatroom-allowlist':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatroom-members',
    'restful-api/chatroom-management/manage-chatroom-blocklist':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatroom-members',
    'restful-api/chatroom-management/manage-chatroom-mutelist':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatroom-members',
    'restful-api/contact-management':
      '/en/realtime-media/im/build/build-core-messaging/contacts',
    'restful-api/message-management':
      '/en/realtime-media/im/build/build-core-messaging/messages/manage-messages',
    'restful-api/offline-push/offline-push-configuration':
      '/en/realtime-media/im/build/notifications-and-event-handling/offline-push/configure-push-notifications',
    'restful-api/offline-push/offline-push-extension':
      '/en/realtime-media/im/build/notifications-and-event-handling/offline-push/set-display-content',
    'restful-api/push-notification-management':
      '/en/realtime-media/im/build/notifications-and-event-handling/offline-push/configure-push-notifications',
    'restful-api/restful-overview': '/en/api-reference/api-ref/im',
    'restful-api/global-mute':
      '/en/realtime-media/im/build/moderate-and-manage-client-behavior/moderation-mechanism',
    'restful-api/thread-management/create-delete-retrieve-threads':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/threading/thread-management',
    'restful-api/thread-management/manage-thread-members':
      '/en/realtime-media/im/build/build-groups-rooms-and-threads/threading/thread-management',
    'restful-api/user-attributes-management':
      '/en/realtime-media/im/build/build-core-messaging/user-attributes',
    'restful-api/user-system-registration':
      '/en/api-reference/api-ref/im/user-system-registration',
  },
  'convo-ai-device-kit': {
    'get-started/run-the-demo': '/en/ai/device-kit/build/run-the-r1-demo',
    'overview/architecture': '/en/ai/device-kit/build/architecture-overview',
    'overview/product-overview': '/en/ai/device-kit',
  },
  'extensions-marketplace': {
    'develop/integrate/ht_3d_avatar':
      '/en/realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar',
    'overview/product-overview': '/en/realtime-media/marketplace',
  },
  'cloud-recording': {
    'get-started/getstarted':
      '/en/realtime-media/cloud-recording/rest-quickstart',
    'rest-api/acquire': '/en/api-reference/api-ref/cloud-recording',
    'rest-api/ncs-ip':
      '/en/realtime-media/cloud-recording/build/handle-events/receive-notifications',
    'rest-api/overview': '/en/api-reference/api-ref/cloud-recording',
    'rest-api/query': '/en/api-reference/api-ref/cloud-recording',
    'rest-api/start': '/en/api-reference/api-ref/cloud-recording',
    'rest-api/status-codes':
      '/en/api-reference/api-ref/cloud-recording/status-codes',
    'rest-api/stop': '/en/api-reference/api-ref/cloud-recording',
    'rest-api/update': '/en/api-reference/api-ref/cloud-recording',
    'rest-api/update-layout':
      '/en/realtime-media/cloud-recording/build/customize-the-recording/layout',
  },
  'cloud-transcoding': {
    'get-started/quickstart': '/en/realtime-media/transcoding/rest-quickstart',
    'rest-api/acquire': '/en/api-reference/api-ref/cloud-transcoding',
    'rest-api/create': '/en/api-reference/api-ref/cloud-transcoding',
    'rest-api/destroy': '/en/api-reference/api-ref/cloud-transcoding',
    'rest-api/ncs-query-ip':
      '/en/realtime-media/transcoding/build/receive-ncs-events',
    'rest-api/query': '/en/api-reference/api-ref/cloud-transcoding',
    'rest-api/restful-authentication':
      '/en/api-reference/api-ref/cloud-transcoding/authentication',
    'rest-api/template-create':
      '/en/realtime-media/transcoding/reference/rest-api',
    'rest-api/template-query':
      '/en/realtime-media/transcoding/reference/rest-api',
    'rest-api/update': '/en/api-reference/api-ref/cloud-transcoding',
  },
  'conversational-ai': {
    'develop/presets': '/en/ai/build/custom-model-integration/managed-mode',
    'models/asr/amazon': '/en/ai/models/asr/openai',
    'best-practices/cloud-recording':
      '/en/ai/best-practices/record-agent-conversation',
    'models/asr/overview': '/en/ai/models/asr/deepgram',
    'models/avatar/overview': '/en/ai/models/avatar/generic',
    'models/llm/overview': '/en/ai/models/llm/openai',
    'models/mllm/overview': '/en/ai/models/mllm/openai',
    'models/tts/overview': '/en/ai/models/tts/openai',
    'reference/sdk/go':
      '/en/ai/build/custom-model-integration/build-server-client',
    'reference/sdk/python':
      '/en/ai/build/custom-model-integration/build-server-client',
    'reference/sdk/typescript':
      '/en/ai/build/custom-model-integration/build-server-client',
    'reference/toolkot/android':
      '/en/api-reference/api-ref/conversational-ai/client-toolkit/android',
    'reference/toolkot/ios':
      '/en/api-reference/api-ref/conversational-ai/client-toolkit/ios',
    'reference/toolkot/web':
      '/en/api-reference/api-ref/conversational-ai/client-toolkit/web',
    'rest-api/agent/history':
      '/en/ai/build/handle-runtime-events/retrieve-session-history',
    'rest-api/agent/interrupt':
      '/en/ai/build/shape-the-conversation/interrupt-agent',
    'rest-api/agent/join': '/en/ai/build/start-stop-agent',
    'rest-api/agent/leave': '/en/ai/build/start-stop-agent',
    'rest-api/agent/list':
      '/en/ai/build/handle-runtime-events/monitor-agent-runtime',
    'rest-api/agent/query':
      '/en/ai/build/handle-runtime-events/monitor-agent-runtime',
    'rest-api/agent/speak': '/en/api-reference/api-ref/conversational-ai',
    'rest-api/agent/think': '/en/api-reference/api-ref/conversational-ai',
    'rest-api/agent/turns':
      '/en/ai/build/handle-runtime-events/retrieve-session-history',
    'rest-api/agent/update': '/en/api-reference/api-ref/conversational-ai',
    'rest-api/reference': '/en/api-reference/api-ref/conversational-ai',
    'rest-api/restful-authentication':
      '/en/api-reference/api-ref/conversational-ai/authentication',
    'overview/pricing': '/en/ai/reference/pricing',
    'studio/overview': '/en/ai/studio',
  },
  'broadcast-streaming': {
    'channel-management-api/webhook/channel-event-type':
      '/en/realtime-media/broadcast-streaming/build/connect-across-channels/receive-notifications',
  },
  'flexible-classroom': {
    'client-api/classroom-sdk':
      '/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom',
    'client-api/edu-context-sdk':
      '/en/api-reference/api-ref/flexible-classroom/edu-context-sdk',
    'client-api/proctor-sdk':
      '/en/realtime-media/flexible-classroom/build/enable-teaching-features/proctor-exams-online',
    'client-api/ui-scene':
      '/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-ui-scene-sdk',
    'develop/integrate/integrate-flexible-classroom/integrate':
      '/en/realtime-media/flexible-classroom/build/integrate-the-sdks/integrate-flexible-classroom',
    'get-started/demo-quickstart':
      '/en/realtime-media/flexible-classroom/quickstart',
    'get-started/mcp': '/en/realtime-media/flexible-classroom/product-overview',
    'get-started/skills': '/en/realtime-media/flexible-classroom/product-overview',
    'reference/restful-authentication':
      '/en/realtime-media/flexible-classroom/reference/classroom-rest-api',
    'restful-api/classroom-api':
      '/en/realtime-media/flexible-classroom/reference/classroom-rest-api',
  },
  iot: {
    'get-started/mcp': '/en/realtime-media/iot/product-overview',
    'get-started/skills': '/en/realtime-media/iot/product-overview',
    'reference/communicate_with_rtc_sdk':
      '/en/realtime-media/iot/reference/communicate-with-rtc-sdk',
    'reference/restful-authentication':
      '/en/realtime-media/iot/build/set-up-authentication-and-security/authentication-workflow',
  },
  'media-gateway': {
    'advanced/abr':
      '/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate',
    'advanced/low-bitrate-hd':
      '/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/pvc-and-super-quality-configuration',
    'best-practices/best-practice':
      '/en/realtime-media/rtmp-gateway/quickstart',
    'overview/product-features':
      '/en/realtime-media/rtmp-gateway/reference/media-gateway-features',
    'overview/product-overview': '/en/realtime-media/rtmp-gateway',
    'reference/rest-api/endpoints/flow-configuration-template/create-reset-template':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/flow-configuration-template/delete-template':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/flow-configuration-template/set-global-template':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/flow-configuration-template/update-template':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/message-notification-service/query-ip-address':
      '/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications',
    'reference/rest-api/endpoints/streaming-information/force-disconnection':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/streaming-information/mute':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/streaming-information/query-streaming-information':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/streaming-information/query-streaming-list':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/streaming-key/create-streaming-key':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/streaming-key/delete-streaming-key':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/endpoints/streaming-key/query-streaming-key-information':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/limitations':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/overview':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/response-status-codes':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
    'reference/rest-api/webhooks/media-gateway-event-type':
      '/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications',
    'reference/restful-authentication':
      '/en/realtime-media/rtmp-gateway/reference/rest-api',
  },
  'interactive-live-streaming': {
    'channel-management-api/webhook/channel-event-type':
      '/en/realtime-media/interactive-live-streaming/build/connect-across-channels/receive-notifications',
    'get-started/mcp':
      '/en/realtime-media/interactive-live-streaming/product-overview',
    'get-started/skills':
      '/en/realtime-media/interactive-live-streaming/product-overview',
  },
  'media-pull': {
    'overview/product-overview': '/en/realtime-media/media-pull',
    'reference/restful-api': '/en/realtime-media/media-pull/reference/rest-api',
    'reference/restful-authentication':
      '/en/realtime-media/media-pull/reference/rest-api',
  },
  'media-push': {
    'develop/restful-api': '/en/realtime-media/media-push/reference/rest-api',
    'overview/product-overview': '/en/realtime-media/media-push',
    'reference/restful-authentication':
      '/en/realtime-media/media-push/reference/rest-api',
    'reference/restful-type-definition':
      '/en/realtime-media/media-push/build/receive-notifications',
  },
  'interactive-whiteboard': {
    'overview/account-settlement':
      '/en/realtime-media/whiteboard/reference/account-settlement',
    'overview/core-concepts': '/en/realtime-media/whiteboard',
    'overview/release-notes':
      '/en/realtime-media/whiteboard/reference/release-notes',
    'overview/release-notes-uikit':
      '/en/realtime-media/whiteboard/reference/release-notes-uikit',
    'overview/supported-platforms':
      '/en/realtime-media/whiteboard/reference/supported-platforms',
    'overview/whiteboard-fastboard':
      '/en/realtime-media/whiteboard/whiteboard-fastboard',
    'reference/uikit-sdk':
      '/en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-uikit',
    'reference/whiteboard-api/file-conversion-deprecated':
      '/en/api-reference/api-ref/whiteboard/file-conversion-deprecated',
  },
  'on-premise-recording': {
    'reference/api-reference':
      '/en/realtime-media/on-premise-recording/reference/sunset',
  },
  'open-ai-integration': {
    'get-started/manage-agora-account':
      '/en/ai/reference/openai-realtime-integration',
    'get-started/mcp': '/en/ai/get-started/mcp-integrate',
    'get-started/quickstart': '/en/ai/reference/openai-realtime-integration',
    'get-started/skills': '/en/ai/get-started/skills-integrate',
    'overview/core-concepts': '/en/ai/reference/openai-realtime-integration',
    'overview/product-overview': '/en/ai/reference/openai-realtime-integration',
    'reference/error-codes': '/en/ai/reference/openai-realtime-integration',
    'reference/firewall': '/en/ai/reference/openai-realtime-integration',
    'reference/glossary': '/en/ai/reference/openai-realtime-integration',
    'reference/security': '/en/ai/reference/openai-realtime-integration',
  },
  'real-time-stt': {
    'develop/api-callback-service':
      '/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service',
    'get-started/mcp': '/en/realtime-media/speech-to-text',
    'get-started/skills': '/en/realtime-media/speech-to-text',
    'rest-api/v5.x/acquire':
      '/en/api-reference/api-ref/speech-to-text/rest-api-v5/acquire',
    'rest-api/restful-authentication':
      '/en/realtime-media/speech-to-text/get-started/quickstart',
    'rest-api/v5.x/query':
      '/en/realtime-media/speech-to-text/get-started/quickstart',
    'rest-api/v5.x/start':
      '/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service',
    'rest-api/v5.x/stop':
      '/en/realtime-media/speech-to-text/get-started/quickstart',
    'rest-api/v5.x/update':
      '/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service',
    'rest-api/v6.x/query':
      '/en/realtime-media/speech-to-text/get-started/quickstart',
    'rest-api/v6.x/start':
      '/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service',
    'rest-api/v6.x/stop':
      '/en/realtime-media/speech-to-text/get-started/quickstart',
    'rest-api/v6.x/update':
      '/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service',
    'rest-api/v6.x/acquire':
      '/en/api-reference/api-ref/speech-to-text/rest-api-v6/acquire',
    'rest-api/v7.x/query':
      '/en/realtime-media/speech-to-text/get-started/quickstart',
    'rest-api/v7.x/join':
      '/en/realtime-media/speech-to-text/reference/rest-api',
    'rest-api/v7.x/leave':
      '/en/realtime-media/speech-to-text/reference/rest-api',
    'rest-api/v7.x/list':
      '/en/realtime-media/speech-to-text/reference/rest-api',
    'rest-api/v7.x/update':
      '/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service',
  },
  'server-gateway': {
    'get-started/integrate-sdk': '/en/realtime-media/rtc-server-sdk/quickstart',
    'get-started/mcp': '/en/realtime-media/rtc-server-sdk',
    'get-started/skills': '/en/realtime-media/rtc-server-sdk',
    'overview/product-overview': '/en/realtime-media/rtc-server-sdk',
    'reference/api': '/en/realtime-media/rtc-server-sdk/reference/downloads',
    'reference/download':
      '/en/realtime-media/rtc-server-sdk/reference/downloads',
  },
  signaling: {
    'get-started/mcp': '/en/realtime-media/rtm',
    'get-started/sdk-quickstart': '/en/realtime-media/rtm/quickstart',
    'get-started/skills': '/en/realtime-media/rtm',
    'reference/cloud-proxy-allowed-ips':
      '/en/realtime-media/rtm/reference/cloud-proxy-migration-guide',
    'rest-api/channel-events':
      '/en/realtime-media/rtm/build/connect-and-authenticate/connection/connection-state-transitions',
    'rest-api/channel-message':
      '/en/realtime-media/rtm/build/work-with-channels/message-channel',
    'rest-api/overview': '/en/api-reference/api-ref/signaling',
    'rest-api/peer-to-peer-message':
      '/en/realtime-media/rtm/build/connect-and-authenticate/connection/connection-management',
    'rest-api/restful-authentication':
      '/en/api-reference/api-ref/signaling/authentication',
    'rest-api/user-events':
      '/en/realtime-media/rtm/build/manage-presence-and-metadata/presence',
  },
  'ten-framework': {
    'architecture/addon-systems': '/en/ai/ten-agent/architecture/addon-system',
    'architecture/dependencies':
      '/en/ai/ten-agent/architecture/build-dependencies',
    'architecture/sub-graphs': '/en/ai/ten-agent/architecture/subgraphs',
    'develop/architecture': '/en/ai/ten-agent/architecture/graphs',
    'develop/binding': '/en/ai/ten-agent/framework-overview',
    'develop/build': '/en/ai/ten-agent/develop/build-ten-applications',
    'develop/debug': '/en/ai/ten-agent/develop/debug-ten-applications',
    'develop/profile': '/en/ai/ten-agent/develop/profile-performance',
    'develop/test': '/en/ai/ten-agent/develop/test-ten-extensions-and-apps',
    'develop/workflow': '/en/ai/ten-agent/develop/development-workflow',
    'get-started/ten-designer': '/en/ai/ten-agent/get-started/use-ten-designer',
    'get-started/ten-manager': '/en/ai/ten-agent/get-started/use-ten-manager',
    'get-started/preparation':
      '/en/ai/ten-agent/get-started/set-up-environment',
    'overview/core-cooncepts': '/en/ai/ten-agent/core-concepts',
    'overview/product-overview': '/en/ai/ten-agent/framework-overview',
    'reference/log': '/en/ai/ten-agent/reference/logging',
    'reference/required': '/en/ai/ten-agent/reference/required-fields',
    'reference/version_system': '/en/ai/ten-agent/reference/versioning',
  },
  'ten-agent': {
    'config/change-language': '/en/ai/ten-agent/project-overview',
    'config/modules': '/en/ai/ten-agent/project-overview',
    'config/properties': '/en/ai/ten-agent/architecture/metadata-system',
    'develop/create-extension': '/en/ai/ten-agent/develop/develop-with-go',
    'develop/deploy-agent-service': '/en/ai/ten-agent/project-overview',
    'develop/interrupt-handling':
      '/en/ai/ten-agent/architecture/message-system',
    'develop/llm-extension': '/en/ai/ten-agent/develop/develop-with-go',
    'develop/local-llm': '/en/ai/ten-agent/develop/develop-with-go',
    'get-started/codespace-quickstart':
      '/en/ai/ten-agent/get-started/set-up-environment',
    'get-started/demo': '/en/ai/ten-agent/project-overview',
    'get-started/docker-setup':
      '/en/ai/ten-agent/get-started/set-up-environment',
    'get-started/quickstart': '/en/ai/ten-agent/get-started/set-up-environment',
    'overview/architecture': '/en/ai/ten-agent/architecture/graphs',
    'overview/product-overview': '/en/ai/ten-agent/project-overview',
    'reference/troubleshooting':
      '/en/ai/ten-agent/develop/debug-ten-applications',
  },
  'voice-calling': {
    'reference/agora-console-rest-api':
      '/en/realtime-media/voice/reference/console-overview',
  },
};

const PRODUCT_PLATFORM_TARGETS = {
  'broadcast-streaming': {
    'overview/release-notes': {
      base: '/en/realtime-media/broadcast-streaming/reference/release-notes',
      platforms: {
        android: 'android',
        blueprint: 'blueprint',
        electron: 'electron',
        flutter: 'flutter',
        ios: 'ios',
        macos: 'macos',
        'react-js': 'javascript',
        'react-native': 'react-native',
        unity: 'unity',
        unreal: 'unreal',
        web: 'web',
        windows: 'windows',
      },
    },
  },
  signaling: {
    'reference/api': {
      base: '/en/api-reference/api-ref/signaling',
      platforms: {
        android: 'android',
        flutter: 'flutter',
        ios: 'ios',
        'linux-cpp': 'linux-cpp',
        macos: 'macos',
        'react-native': 'react-native',
        unity: 'unity',
        web: 'web',
        windows: 'windows-cpp',
      },
    },
  },
};

const SHARED_PRODUCT_TARGETS = {
  'channel-management-api/agora-console-rest-api': 'reference/console-overview',
  'channel-management-api/best-practices/ban-user-privileges':
    'build/secure-and-protect-channels/prevent-stream-bombing',
  'channel-management-api/best-practices/ensure-service-reliability':
    'reference/service-limits',
  'channel-management-api/endpoint/ban-user-privileges/create-rules':
    'reference/channel-management-api',
  'channel-management-api/endpoint/ban-user-privileges/delete-rules':
    'reference/channel-management-api',
  'channel-management-api/endpoint/ban-user-privileges/get-rule-list':
    'reference/channel-management-api',
  'channel-management-api/endpoint/ban-user-privileges/update-expiration-time':
    'reference/channel-management-api',
  'channel-management-api/endpoint/message-notification-service/query-ip-address':
    'reference/channel-management-api',
  'channel-management-api/endpoint/query-channel-information/query-channel-list':
    'reference/channel-management-api',
  'channel-management-api/endpoint/query-channel-information/query-host-list':
    'reference/channel-management-api',
  'channel-management-api/endpoint/query-channel-information/query-user-list':
    'reference/channel-management-api',
  'channel-management-api/endpoint/query-channel-information/query-user-status':
    'reference/channel-management-api',
  'channel-management-api/how-to-call-api': 'reference/channel-management-api',
  'channel-management-api/overview': 'reference/channel-management-api',
  'channel-management-api/response-status-code': 'reference/error-codes',
  'channel-management-api/webhook/channel-event-type':
    'build/optimize-and-operate/receive-notifications',
  'overview/product-overview': '',
  'overview/release-notes': 'reference/release-notes',
  'reference/api-sunset': 'reference/migration-guide',
  'enhance-call-quality/video-transmission-optimization':
    'build/manage-connection-and-quality/multipath-transmission',
};

const SHARED_TARGET_BY_PRODUCT = {
  'channel-management-api/restful-authentication': {
    'broadcast-streaming': 'build/authenticate-users/use-tokens',
    'interactive-live-streaming': 'build/authenticate-users/use-tokens',
    'video-calling': 'build/authenticate-users/authentication-workflow',
    'voice-calling': 'build/set-up-token-authentication/use-tokens',
  },
  'token-authentication/authentication-workflow': {
    'broadcast-streaming': 'build/authenticate-users/use-tokens',
    'interactive-live-streaming': 'build/authenticate-users/use-tokens',
    'video-calling': 'build/authenticate-users/authentication-workflow',
    'voice-calling': 'build/set-up-token-authentication/use-tokens',
  },
  'enhance-call-quality/configure-audio-encoding': {
    'broadcast-streaming':
      'build/control-audio-and-devices/configure-audio-encoding',
    'interactive-live-streaming':
      'build/control-audio-and-devices/configure-audio-encoding',
    'video-calling':
      'build/enhance-the-audio-experience/best-practices-sound-quality',
    'voice-calling': 'build/control-audio-and-devices/configure-audio-encoding',
  },
  'enhance-call-quality/configure-video-encoding': {
    'broadcast-streaming':
      'build/manage-video-and-streaming/configure-video-encoding',
    'interactive-live-streaming':
      'build/manage-video-and-streaming/configure-video-encoding',
    'video-calling': 'build/capture-and-render-video/custom-video',
  },
  'enhance-call-quality/in-call-quality-monitoring': {
    'broadcast-streaming':
      'build/optimize-quality-and-connection/in-call-quality-monitoring',
    'interactive-live-streaming':
      'build/optimize-quality-and-connection/in-call-quality-monitoring',
    'video-calling': 'build/manage-connection-and-quality/pre-call-tests',
    'voice-calling':
      'build/manage-connection-and-quality/in-call-quality-monitoring',
  },
};

const inventory = buildInventory();
writeJson(INVENTORY_PATH, {
  generatedAt: SNAPSHOT_DOWNLOADED_AT,
  routes: inventory,
});

const generated = buildRedirects(inventory);
writeJson(REDIRECTS_PATH, generated.redirects);
writeJson(REVIEW_REPORT_PATH, generated.reviewReport);

console.log(generated.reviewReport.summary);

function buildInventory() {
  const files = [];
  walk('content/docs/en', files);

  return files.sort().map((file) => {
    const text = fs.readFileSync(file, 'utf8');
    const routePath = routeFromFile(file);
    const title = titleFrom(text, file);
    const headings = headingsFrom(text);
    const body = stripFrontmatter(text)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const segments = routePath.split('/').filter(Boolean);
    const [, tab, productOrSection, section] = segments;

    return {
      routePath,
      title,
      headings,
      product: productOrSection || tab || '',
      section: section || '',
      sourceFilePath: file,
      slugSegments: segments.slice(1),
      leafSlug: segments.at(-1) || '',
      searchText:
        `${routePath} ${title} ${headings.join(' ')} ${body.slice(0, 2000)}`.toLowerCase(),
    };
  });
}

function platformStructuredRoutes(text) {
  return Array.from(
    new Set(
      Array.from(
        text.matchAll(/<PlatformStructured\s+platform=["']([^"']+)["']/g),
        (match) => normalizePlatform(match[1]),
      ),
    ),
  );
}

function normalizePlatform(platform) {
  return platform === 'react-js' ? 'javascript' : platform;
}

function buildRedirects(routes) {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const legacyUrls = Array.from(
    new Set([
      ...Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]),
      ...MANUAL_LEGACY_URLS,
    ]),
  );
  const routeSet = getRouteSet(routes);
  const summary = {
    totalLegacyUrls: legacyUrls.length,
    native: 0,
    exactPath: 0,
    exactSlug: 0,
    renamedPage: 0,
    semanticPageMatch: 0,
    productFallback: 0,
    unavailable: 0,
    broken: 0,
  };
  const rules = [];
  const reviewItems = [];

  for (const href of legacyUrls) {
    const info = legacyInfo(href);

    if (routeSet.has(info.legacyPath)) {
      summary.native += 1;
      continue;
    }

    const candidates = candidateRoutes(routes, info.product);
    const match =
      exactTarget(info, routeSet) ||
      curatedTarget(info, routeSet) ||
      leafTarget(info, candidates) ||
      fallback(info, candidates);
    const summaryKey = {
      'exact-path': 'exactPath',
      'exact-slug': 'exactSlug',
      'renamed-page': 'renamedPage',
      'semantic-page-match': 'semanticPageMatch',
      'product-fallback': 'productFallback',
      unavailable: 'unavailable',
    }[match.type];
    const confidence =
      match.confidence ||
      (match.type === 'product-fallback' || match.type === 'unavailable'
        ? 'low'
        : match.type === 'semantic-page-match'
          ? 'medium'
          : 'high');

    summary[summaryKey] += 1;
    rules.push({
      legacyUrl: info.href,
      legacyPath: info.legacyPath,
      ...(info.legacySearch ? { legacySearch: info.legacySearch } : {}),
      target: match.target,
      type: match.type,
      confidence,
      evidence: match.evidence,
      preserveSearch: match.preserveSearch ?? true,
    });

    if (
      match.type === 'product-fallback' ||
      match.type === 'unavailable' ||
      confidence !== 'high'
    ) {
      reviewItems.push({
        legacyUrl: info.href,
        appliedTarget: match.target,
        appliedRuleType: match.type,
        confidence,
        reviewPriority:
          match.type === 'product-fallback' || match.type === 'unavailable'
            ? 'high'
            : 'medium',
        reason: match.evidence[0],
        candidates: match.candidates || [],
      });
    }
  }

  return {
    redirects: {
      sourceSitemapUrl: 'https://docs.agora.io/sitemap.xml',
      snapshotPath: SITEMAP_PATH,
      snapshotDownloadedAt: SNAPSHOT_DOWNLOADED_AT,
      rules,
    },
    reviewReport: {
      summary,
      items: reviewItems,
    },
  };
}

function getRouteSet(routes) {
  const routeSet = new Set(routes.map((route) => route.routePath));

  for (const route of routes) {
    const text = fs.readFileSync(route.sourceFilePath, 'utf8');
    for (const platform of platformStructuredRoutes(text)) {
      routeSet.add(`${route.routePath}/${platform}`);
    }
  }

  return routeSet;
}

function exactTarget(info, routeSet) {
  const mapping = PRODUCT_MAPPINGS[info.product];
  if (!mapping) {
    return null;
  }

  const suffix = info.rest.join('/');
  const direct = `${mapping.base}/${suffix}`.replace(/\/$/, '');

  return routeSet.has(direct)
    ? {
        target: direct,
        type: 'exact-path',
        evidence: [
          `legacy path suffix ${suffix} exists under migrated product area ${mapping.base}`,
        ],
      }
    : null;
}

function leafTarget(info, candidates) {
  const exact = candidates.filter((route) => route.leafSlug === info.leaf);
  if (exact.length === 1) {
    return {
      target: exact[0].routePath,
      type: 'exact-slug',
      evidence: [
        `target leaf slug ${info.leaf} matches legacy leaf slug`,
        `legacy product ${info.product} maps to ${PRODUCT_MAPPINGS[info.product].base}`,
      ],
    };
  }

  if (exact.length > 1) {
    return bestByContext(info, exact, 'exact-slug');
  }

  const renamedLeaf = Array.from(RENAMED_LEAVES.entries())
    .filter(([, aliases]) => aliases.includes(info.leaf))
    .map(([canonical]) => canonical);
  const renamed = candidates.filter((route) =>
    renamedLeaf.includes(route.leafSlug),
  );

  if (renamed.length === 1) {
    return {
      target: renamed[0].routePath,
      type: 'renamed-page',
      evidence: [
        `legacy leaf slug ${info.leaf} maps to target leaf slug ${renamed[0].leafSlug}`,
        `legacy product ${info.product} maps to ${PRODUCT_MAPPINGS[info.product].base}`,
      ],
    };
  }

  if (renamed.length > 1) {
    return bestByContext(info, renamed, 'renamed-page');
  }

  const close = candidates
    .map((route) => ({
      route,
      score: overlapScore(
        [...info.rest, info.leaf].join(' '),
        `${route.routePath} ${route.title} ${route.headings.join(' ')}`,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  if (
    close[0]?.score >= 0.48 &&
    close[0].score - (close[1]?.score ?? 0) >= 0.12
  ) {
    return {
      target: close[0].route.routePath,
      type: 'semantic-page-match',
      evidence: [
        `legacy path words overlap target title/headings with score ${close[0].score.toFixed(2)}`,
        `target title: ${close[0].route.title}`,
      ],
    };
  }

  return null;
}

function curatedTarget(info, routeSet) {
  const platformTarget = platformTargetFor(info);
  const productTarget =
    PRODUCT_SPECIFIC_TARGETS[info.product]?.[info.rest.join('/')];
  const sharedTarget = sharedTargetFor(info);
  const target = platformTarget || productTarget || sharedTarget;

  if (!target || !routeSet.has(target)) {
    return null;
  }

  return {
    target,
    type: 'semantic-page-match',
    confidence: 'high',
    ...(platformTarget ? { preserveSearch: false } : {}),
    evidence: [
      `legacy path ${info.rest.join('/')} maps to inspected article ${target}`,
      platformTarget
        ? `product-platform mapping preserves ${info.product} platform ${info.searchParams.get('platform')}`
        : productTarget
          ? `product-specific mapping preserves ${info.product} semantics`
          : `shared RTC mapping preserves ${info.product} product area`,
      platformTarget
        ? `legacy platform ${info.searchParams.get('platform')} is represented in the target path`
        : platformEvidence(info),
    ],
  };
}

function platformTargetFor(info) {
  const platform = info.searchParams.get('platform');
  if (!platform) {
    return null;
  }

  const targetConfig =
    PRODUCT_PLATFORM_TARGETS[info.product]?.[info.rest.join('/')];
  const targetPlatform = targetConfig?.platforms[platform];

  return targetPlatform ? `${targetConfig.base}/${targetPlatform}` : null;
}

function sharedTargetFor(info) {
  const legacyPath = info.rest.join('/');
  const relativeTarget =
    SHARED_TARGET_BY_PRODUCT[legacyPath]?.[info.product] ||
    SHARED_PRODUCT_TARGETS[legacyPath];
  const mapping = PRODUCT_MAPPINGS[info.product];

  if (relativeTarget === undefined || !mapping) {
    return null;
  }

  return relativeTarget ? `${mapping.base}/${relativeTarget}` : mapping.base;
}

function fallback(info, candidates) {
  const mapping = PRODUCT_MAPPINGS[info.product];
  if (!mapping) {
    return {
      target: '/en/introduction',
      type: 'unavailable',
      evidence: [`no product mapping configured for ${info.product}`],
      candidates: [],
    };
  }

  return {
    target: mapping.fallback,
    type: 'product-fallback',
    evidence: [
      'no high-confidence article-level target found',
      `legacy product ${info.product} maps to fallback ${mapping.fallback}`,
      `inspected candidates: ${fallbackCandidateSummary(info, candidates)}`,
      platformEvidence(info),
    ],
    candidates: candidates
      .map((route) => candidateEvidence(info, route))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
  };
}

function fallbackCandidateSummary(info, candidates) {
  const best = candidates
    .map((route) => candidateEvidence(info, route))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (best.length === 0) {
    return 'no candidates exist in the mapped product area';
  }

  return best
    .map((candidate) => `${candidate.target} (${candidate.score.toFixed(2)})`)
    .join(', ');
}

function candidateEvidence(info, route) {
  const score = overlapScore(
    info.rest.join(' '),
    `${route.routePath} ${route.title} ${route.headings.join(' ')}`,
  );

  return {
    target: route.routePath,
    confidence: score >= 0.48 ? 'medium' : 'low',
    score,
    evidence: [
      `candidate score ${score.toFixed(2)}`,
      `target title: ${route.title}`,
    ],
  };
}

function platformEvidence(info) {
  const platform = info.searchParams.get('platform');

  return platform
    ? `legacy platform ${platform} is preserved in the redirect query string; selected target is product-level or platform-neutral content`
    : 'legacy URL has no platform query';
}

function candidateRoutes(routes, product) {
  const mapping = PRODUCT_MAPPINGS[product];

  return mapping
    ? routes.filter(
        (route) =>
          route.routePath === mapping.fallback ||
          route.routePath.startsWith(`${mapping.base}/`),
      )
    : [];
}

function legacyInfo(href) {
  const url = new URL(href);
  const [locale, product, ...rest] = url.pathname.split('/').filter(Boolean);

  return {
    href,
    legacyPath: url.pathname,
    legacySearch: url.search,
    searchParams: url.searchParams,
    locale,
    product,
    rest,
    leaf: rest.at(-1) || product,
  };
}

function routeFromFile(file) {
  const relative = file
    .replace(/^content\/docs\//, '')
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '');

  return `/${relative}`;
}

function walk(directory, files) {
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(md|mdx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
}

function titleFrom(text, file) {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatter) {
    const title = frontmatter[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (title) {
      return title[1].replace(/^['"]|['"]$/g, '').trim();
    }
  }

  return (
    text.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    path.basename(file).replace(/\.(md|mdx)$/, '')
  );
}

function headingsFrom(text) {
  return Array.from(text.matchAll(/^#{2,4}\s+(.+)$/gm), (match) =>
    match[1].replace(/[#`*_]/g, '').trim(),
  ).slice(0, 20);
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function words(value) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(
        (word) =>
          word.length > 1 &&
          !['en', 'api', 'sdk', 'rest', 'and', 'the', 'with', 'for'].includes(
            word,
          ),
      ),
  );
}

function overlapScore(a, b) {
  const aWords = words(a);
  const bWords = words(b);
  if (aWords.size === 0 || bWords.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const word of aWords) {
    if (bWords.has(word)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(aWords.size, bWords.size);
}

function bestByContext(info, routes, type) {
  const ranked = routes
    .map((route) => ({
      route,
      score: overlapScore(
        info.rest.join(' '),
        `${route.routePath} ${route.title} ${route.headings.join(' ')}`,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]
    ? {
        target: ranked[0].route.routePath,
        type,
        evidence: [
          `selected best contextual match among ${routes.length} same-slug candidates`,
          `target title: ${ranked[0].route.title}`,
        ],
      }
    : null;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
