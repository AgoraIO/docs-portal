import type { SearchIntent } from './search-intent';

export type GoldenSearchCase = {
  query: string;
  expectedIntent: SearchIntent;
  expectedKind: 'guide' | 'faq' | 'rest-api' | 'sdk-symbol' | 'empty';
  expectedTitle?: string;
  expectedCanonicalKey?: string;
  expectedUrl?: string;
  previewBlocking?: boolean;
};

export const GLOBAL_GOLDEN_SEARCH_CASES: readonly GoldenSearchCase[] = [
  {
    query: 'voice agent quickstart',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Voice agent quickstart',
    expectedUrl: '/en/ai/get-started/quickstart',
  },
  {
    query: 'build a voice agent',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Voice agent quickstart',
    expectedUrl: '/en/ai/get-started/quickstart',
  },
  {
    query: 'start and stop an agent',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Start and stop an agent',
    expectedUrl: '/en/ai/build/start-stop-agent',
  },
  {
    query: 'connect your own TTS service',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Connect your own TTS service',
    expectedUrl: '/en/ai/build/custom-model-integration/custom-tts',
  },
  {
    query: 'cloud recording start',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Cloud Recording',
    expectedUrl: '/en/realtime-media/cloud-recording',
  },
  {
    query: 'cloud recording REST API',
    expectedIntent: 'api-task',
    expectedKind: 'guide',
    expectedTitle: 'Cloud Recording Overview',
    expectedUrl: '/en/api-reference/api-ref/cloud-recording',
  },
  {
    query: 'record captions',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Record captions',
    expectedUrl:
      '/en/realtime-media/speech-to-text/build/process-transcription-data/record-captions',
  },
  {
    query: 'transcribe audio',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Speech-to-Text',
    expectedUrl: '/en/realtime-media/speech-to-text',
  },
  {
    query: 'join a channel',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Quickstart',
    expectedUrl: '/en/realtime-media/rtc/get-started-sdk',
  },
  {
    query: 'join multiple channels',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Join multiple channels',
    expectedUrl:
      '/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels',
  },
  {
    query: 'network quality',
    expectedIntent: 'unknown',
    expectedKind: 'guide',
    expectedTitle: 'In-call quality monitoring',
    expectedUrl:
      '/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring',
  },
  {
    query: 'in-call quality monitoring',
    expectedIntent: 'unknown',
    expectedKind: 'guide',
    expectedTitle: 'In-call quality monitoring',
    expectedUrl:
      '/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring',
  },
  {
    query: 'enable adaptive bitrate',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Enable adaptive bitrate',
    expectedUrl:
      '/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate',
  },
  {
    query: 'stream channels',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Stream channels',
    expectedUrl:
      '/en/realtime-media/rtm/build/work-with-channels/stream-channel',
  },
  {
    query: 'signaling quickstart',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Signaling Quickstart',
    expectedUrl: '/en/realtime-media/rtm/quickstart',
  },
  {
    query: 'send a message',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Send and receive messages',
    expectedUrl:
      '/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages',
  },
  {
    query: 'video call quickstart',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Quickstart',
    expectedUrl: '/en/realtime-media/rtc/get-started-sdk',
  },
  {
    query: 'screen sharing',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Screen sharing',
    expectedUrl:
      '/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing',
  },
  {
    query: 'mute remote audio',
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Manage media and devices',
    expectedUrl:
      '/en/realtime-media/rtc/build/control-audio-and-devices/volume-control-and-mute',
  },
  {
    query: 'token authentication',
    expectedIntent: 'support',
    expectedKind: 'guide',
    expectedTitle: 'Secure authentication with tokens',
    expectedUrl:
      '/en/realtime-media/im/build/secure-access-and-authentication/authentication',
  },
  {
    query: 'voice agent',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Voice agent quickstart',
    expectedUrl: '/en/ai/get-started/quickstart',
  },
  {
    query: 'voice activity detection',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Voice Activity Detection',
    expectedUrl:
      '/en/realtime-media/rtc/build/enhance-the-audio-experience/voice-activity-detection',
  },
  {
    query: 'conversational AI',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Conversational AI Overview',
    expectedUrl: '/en/api-reference/api-ref/conversational-ai',
  },
  {
    query: 'cloud recording',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Cloud Recording',
    expectedUrl: '/en/realtime-media/cloud-recording',
  },
  {
    query: 'real-time transcription',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Speech-to-Text',
    expectedUrl: '/en/realtime-media/speech-to-text',
  },
  {
    query: 'speech to text',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Speech-to-Text overview',
    expectedUrl: '/en/realtime-media/speech-to-text',
  },
  {
    query: 'video calling',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Voice & Video Calling',
    expectedUrl: '/en/api-reference/api-ref/rtc',
  },
  {
    query: 'interactive live streaming',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Interactive Live Streaming',
    expectedUrl:
      '/en/realtime-media/interactive-live-streaming/product-overview',
  },
  {
    query: 'broadcast streaming',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Broadcast Streaming',
    expectedUrl: '/en/realtime-media/broadcast-streaming/product-overview',
  },
  {
    query: 'flexible classroom',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Flexible classroom',
    expectedUrl: '/en/realtime-media/flexible-classroom/product-overview',
  },
  {
    query: 'IoT SDK',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'IoT SDK overview',
    expectedUrl: '/en/realtime-media/iot/product-overview',
  },
  {
    query: 'Agora CLI',
    expectedIntent: 'product',
    expectedKind: 'guide',
    expectedTitle: 'Agora CLI',
    expectedUrl: '/en/introduction/agora-cli',
  },
  {
    query: 'joinChannel',
    expectedIntent: 'api-symbol',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'joinChannel',
    expectedCanonicalKey: 'video-sdk|rtcengine|joinchannel|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78',
  },
  {
    query: 'joinChannel method',
    expectedIntent: 'unknown',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'JoinChannel',
    expectedCanonicalKey: 'video-sdk|rtcengine|joinchannel|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78',
    previewBlocking: true,
  },
  {
    query: 'setAudioProfile',
    expectedIntent: 'api-symbol',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'setAudioProfile',
    expectedCanonicalKey: 'video-sdk|rtcengine|setaudioprofile|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
  },
  {
    query: 'setAudioProfile method',
    expectedIntent: 'unknown',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'setAudioProfile',
    expectedCanonicalKey: 'video-sdk|rtcengine|setaudioprofile|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
    previewBlocking: true,
  },
  {
    query: 'NetworkQuality',
    expectedIntent: 'api-symbol',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'NetworkQuality',
    expectedCanonicalKey: 'video-sdk|networkquality|interface',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html',
  },
  {
    query: 'AudioVolumeInfo',
    expectedIntent: 'api-symbol',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'AudioVolumeInfo',
    expectedCanonicalKey: 'video-sdk|rtcapidatatype|audiovolumeinfo|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/flutter/5.x/API/rtc_api_data_type.html#ariaid-title89',
  },
  {
    query: 'RtcEngine',
    expectedIntent: 'api-symbol',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'AgoraRtcEngineKit',
    expectedCanonicalKey: 'video-sdk|rtcengine|type',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main',
  },
  {
    query: 'RtcEngine class',
    expectedIntent: 'unknown',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'AgoraRtcEngineKit',
    expectedCanonicalKey: 'video-sdk|rtcengine|type',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main',
    previewBlocking: true,
  },
  {
    query: 'acquire resource ID',
    expectedIntent: 'api-task',
    expectedKind: 'rest-api',
    expectedTitle: 'Acquire a resource ID',
    expectedUrl: '/en/api-reference/api-ref/cloud-recording/acquire',
  },
  {
    query: 'start cloud recording task',
    expectedIntent: 'api-task',
    expectedKind: 'rest-api',
    expectedTitle: 'Start a cloud recording task',
    expectedUrl: '/en/api-reference/api-ref/cloud-recording/start',
  },
  {
    query: 'query recording status',
    expectedIntent: 'api-task',
    expectedKind: 'rest-api',
    expectedTitle: 'Query status',
    expectedUrl: '/en/api-reference/api-ref/cloud-recording/query',
  },
  {
    query: 'renew token',
    expectedIntent: 'api-task',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'renewToken',
    expectedCanonicalKey: 'video-sdk|rtcengine|renewtoken|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128',
  },
  {
    query: 'renewToken api',
    expectedIntent: 'unknown',
    expectedKind: 'sdk-symbol',
    expectedTitle: 'renewToken',
    expectedCanonicalKey: 'video-sdk|rtcengine|renewtoken|member',
    expectedUrl:
      'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128',
    previewBlocking: true,
  },
  {
    query: 'send streaming message',
    expectedIntent: 'api-task',
    expectedKind: 'empty',
  },
  {
    query: 'error code 110',
    expectedIntent: 'support',
    expectedKind: 'guide',
    expectedTitle: 'Error codes',
    expectedUrl: '/en/realtime-media/rtc/reference/error-codes',
  },
  {
    query: 'black screen',
    expectedIntent: 'support',
    expectedKind: 'faq',
    expectedTitle: 'black screen',
    expectedUrl: '/en/api-reference/faq/quality/video_blank',
  },
  {
    query: 'Bluetooth iOS',
    expectedIntent: 'support',
    expectedKind: 'faq',
    expectedTitle: 'Bluetooth',
    expectedUrl: '/en/api-reference/faq/quality/ios_bluetooth',
  },
  {
    query: 'HTTP basic authentication',
    expectedIntent: 'support',
    expectedKind: 'guide',
    expectedTitle: 'RESTful authentication',
    expectedUrl: '/en/api-reference/api-ref/cloud-recording/authentication',
  },
  {
    query: 'billing policy',
    expectedIntent: 'support',
    expectedKind: 'guide',
    expectedTitle: 'Billing',
    expectedUrl: '/en/introduction/billing/billing-policies',
  },
  {
    query: 'firewall requirements',
    expectedIntent: 'support',
    expectedKind: 'guide',
    expectedTitle: 'Firewall requirements',
    expectedUrl: '/en/introduction/firewall',
  },
  {
    query: 'foo bar baz',
    expectedIntent: 'unknown',
    expectedKind: 'empty',
  },
  {
    query: 'xyznonexistent',
    expectedIntent: 'unknown',
    expectedKind: 'empty',
  },
] as const;
