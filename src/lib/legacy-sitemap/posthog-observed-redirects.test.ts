import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveLegacySitemapRedirectPath } from './redirects';

type VercelRedirect = {
  source: string;
  destination: string;
  statusCode: number;
};

const reviewedRedirects = [
  [
    '/en/AgoraPlatform/term_token',
    '/en/realtime-media/rtc/build/authenticate-users/integrate-token-generation',
  ],
  [
    '/en/video-calling/reference/channel-management-api',
    '/en/realtime-media/rtc/reference/channel-management-api',
  ],
  [
    '/en/live-streaming-premium-4.x/test_switch_device_web_ng',
    '/en/realtime-media/rtc/build/control-audio-and-devices/set-audio-route',
  ],
  [
    '/en/faq/injecting_stream_disconnection_web',
    '/en/api-reference/faq/integration/live_streaming_disconnection_web',
  ],
  [
    '/en/Interactive Broadcast/API Reference/java/classio_1_1agora_1_1rtc_1_1_rtc_engine.html',
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#class_irtcengine',
  ],
  [
    '/en/live-streaming-premium-4.x/volume_web_ng',
    '/en/realtime-media/rtc/build/control-audio-and-devices/volume-control-and-mute',
  ],
  [
    '/en/whiteboard/API Reference/whiteboard_web/globals.html',
    'https://api-ref.agora.io/en/interactive-whiteboard-sdk/web/2.x/globals.html',
  ],
  [
    '/en/cloud-recording/reference/rest-api',
    '/en/realtime-media/cloud-recording/reference/restful-api',
  ],
  [
    '/en/realtime-media/im/build/limitations',
    '/en/api-reference/api-ref/im/limitations',
  ],
  ['/en/reference/pricing', '/en/introduction/billing'],
  [
    '/en/video-calling/introduction/release-notes',
    '/en/realtime-media/rtc/reference/release-notes',
  ],
  [
    '/en/3.x/voice-calling/basic-features/adjust-volume',
    '/en/realtime-media/rtc/build/control-audio-and-devices/volume-control-and-mute',
  ],
  [
    '/en/agora-chat/enable_agora_chat',
    '/en/realtime-media/im/get-started/enable',
  ],
  [
    '/en/agora-class/agora_class_prep',
    '/en/realtime-media/flexible-classroom/product-overview',
  ],
  ['/en/faq/audio_low', '/en/api-reference/faq/quality/audio_low'],
  [
    '/en/faq/local_network_privacy',
    '/en/api-reference/faq/integration/local_network_privacy',
  ],
  [
    '/en/Real-time-Messaging/rtm_token',
    '/en/realtime-media/rtm/build/connect-and-authenticate/authentication-workflow',
  ],
  [
    '/en/Real-time-Messaging/token_server_rtm',
    '/en/realtime-media/rtm/build/connect-and-authenticate/authentication-workflow',
  ],
  [
    '/en/Video/API Reference/java/classio_1_1agora_1_1rtc_1_1_i_rtc_engine_event_handler_1_1_rtc_stats.html',
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_rtcstats.html',
  ],
  ['/en/Video/start_call_web', '/en/realtime-media/rtc/get-started-sdk'],
  [
    '/en/Video/token_server',
    '/en/realtime-media/rtc/build/authenticate-users/deploy-token-server',
  ],
  [
    '/en/Voice/billing_rtc',
    '/en/realtime-media/rtc/reference/billing-policies',
  ],
  ['/en/Voice/downloads_more_voice', '/en/api-reference/sdks'],
  ['/en/video-calling/reference/api-reference', '/en/api-reference/api-ref'],
  [
    '/en/voice-calling/reference/release-notes',
    '/en/realtime-media/rtc/reference/release-notes',
  ],
  [
    '/en/3.x/interactive-live-streaming/advanced-features/raw-video-data',
    '/en/realtime-media/rtc/build/capture-and-render-video/raw-video-processing',
  ],
  ['/en/Agora Platform/sign_in_and_sign_up', '/en/introduction/account'],
  [
    '/en/agora-analytics/reference/call-inspector-glossary',
    '/en/realtime-media/agora-analytics/reference/call-search-terms',
  ],
  [
    '/en/agora-analytics/reference/pricing',
    '/en/realtime-media/agora-analytics/reference/pricing',
  ],
  [
    '/en/ai/build/harden-and-optimize/optimize-latency',
    '/en/ai/best-practices/optimize-latency',
  ],
  ['/en/ai/models/llm/cerebras', '/en/ai'],
  ['/en/All/faq', '/en/api-reference/faq'],
  [
    '/en/assets/images/certificate-enable-c777d4a1ba9d00608ae8d5b17a5ef0db.png',
    '/en/introduction/security-privacy',
  ],
  [
    '/en/cloud-recording/product_cloud_recording ',
    '/en/realtime-media/cloud-recording',
  ],
  ['/en/conversational-ai/develop/avatar', '/en/ai/models/avatar/generic'],
  [
    '/en/faq/empty_deviceId',
    '/en/api-reference/faq/integration/empty_deviceId',
  ],
  [
    '/en/help/general-product-inquiry/capacity',
    '/en/api-reference/faq/product/capacity',
  ],
  [
    '/en/help/quality-issues/audio_low',
    '/en/api-reference/faq/quality/audio_low',
  ],
  [
    '/en/Interactive Broadcast/start_live_mac',
    '/en/realtime-media/rtc/get-started-sdk',
  ],
  [
    '/en/on-premise-recording/reference/service-sunset-plans',
    '/en/realtime-media/on-premise-recording/reference/sunset',
  ],
  [
    '/en/Real-time-Messaging/API Reference/RTM_java/v0.9.2/interfaceio_1_1agora_1_1rtm_1_1_rtm_client_listener.html',
    '/en/realtime-media/rtm/build/send-and-receive-messages/add-event-listener',
  ],
  [
    '/en/Real-time-Messaging/API Reference/RTM_java/v1.0.0/interfaceio_1_1agora_1_1rtm_1_1_rtm_status_code_1_1_get_members_error.html',
    '/en/realtime-media/rtm/reference/error-codes',
  ],
  [
    '/en/Real-time-Messaging/billing_rtm',
    '/en/realtime-media/rtm/reference/billing-policies',
  ],
  ['/en/Real-time-Messaging/product_rtm', '/en/realtime-media/rtm'],
  [
    '/en/realtime-media/agora-analytics/build/monitor-and-get-alerts/alert-notification',
    '/en/realtime-media/agora-analytics/build/monitor-and-get-alerts/alarm',
  ],
  [
    '/en/realtime-media/cloud-recording/reference/rest-api/rest',
    '/en/realtime-media/cloud-recording/reference/restful-api',
  ],
  [
    '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/',
    '/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview',
  ],
  [
    '/en/realtime-media/rtc/reference/firewall-requirements',
    '/en/introduction/firewall',
  ],
  [
    '/en/realtime-media/rtc/voice-quickstart fluitter',
    '/en/realtime-media/rtc/voice-quickstart',
  ],
  [
    '/en/realtime-media/rtm/build/get-started/authentication-workflow',
    '/en/realtime-media/rtm/build/connect-and-authenticate/authentication-workflow',
  ],
  [
    '/en/realtime-media/rtm/develop/authentication',
    '/en/realtime-media/rtm/build/connect-and-authenticate/authentication-workflow',
  ],
  [
    '/en/realtime-media/transcoding/reference/status-codes.md',
    '/en/realtime-media/transcoding/reference/status-codes',
  ],
  [
    '/en/video-call-4.x-beta/custom_video_renderer_apple_ng',
    '/en/realtime-media/rtc/build/capture-and-render-video/custom-video',
  ],
  ['/en/video-calling/', '/en/realtime-media/rtc'],
  [
    '/en/video-calling/API Reference/java_ng/API/class_irtcengine.html',
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#class_irtcengine',
  ],
  [
    '/en/video-calling/develop/authentication',
    '/en/realtime-media/rtc/build/authenticate-users/authentication-workflow',
  ],
  [
    '/en/video-calling/enhance-call-quality/last-mile-network-quality',
    '/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests',
  ],
  [
    '/en/video-calling/reference/channel-management-rest-api',
    '/en/realtime-media/rtc/reference/channel-management-api',
  ],
  ['/en/video-calling/restful-api/endpoints', '/en/api-reference/api-ref/rtc'],
  [
    '/en/Video/API Reference/flutter/agora_rtc_engine/StreamPublishState/toString.html',
    'https://api-ref.agora.io/en/video-sdk/flutter/6.x/API/rtc_api_overview.html',
  ],
  [
    '/en/Video/API Reference/java/classio_1_1agora_1_1rtc_1_1_i_rtc_engine_event_handler_1_1_remote_video_stats.html',
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_remotevideostats.html',
  ],
  [
    '/en/Video/channel_encryption_android',
    '/en/realtime-media/rtc/build/secure-and-protect-channels/media-stream-encryption',
  ],
  [
    '/en/voice-calling/reference/sunset-plan',
    '/en/api-reference/api-ref/voice/api-sunset',
  ],
  [
    '/en/Voice/raw_data_audio_windows',
    '/en/realtime-media/rtc/build/customize-audio-processing/stream-raw-audio',
  ],
  [
    '/en/Voice/start_call_audio_flutter',
    '/en/realtime-media/rtc/voice-quickstart',
  ],
  [
    '/en/help/general-product-inquiry/rtm_concurrency',
    '/en/api-reference/faq/product/rtm_concurrency',
  ],
] as const;

describe('PostHog-discovered English 404 redirects', () => {
  const posthogRedirects = JSON.parse(
    readFileSync(
      'src/lib/legacy-sitemap/posthog-observed-redirects.json',
      'utf8',
    ),
  ) as Array<{ legacyPath: string; target: string; confidence: string }>;
  const legacySourceConfig = JSON.parse(
    readFileSync('src/lib/legacy-sitemap/redirects.json', 'utf8'),
  ) as { rules: Array<{ legacyPath: string; target: string }> };
  const staticRedirects = JSON.parse(
    readFileSync('src/lib/legacy-sitemap/static-redirects.json', 'utf8'),
  ) as Array<{ p: string; t: string }>;
  const generatedVercelConfig = JSON.parse(
    readFileSync('vercel.json', 'utf8'),
  ) as { redirects: VercelRedirect[] };
  const bulkRedirects = JSON.parse(
    readFileSync('vercel-legacy-redirects.json', 'utf8'),
  ) as VercelRedirect[];
  const docsInventory = JSON.parse(
    readFileSync('src/lib/legacy-sitemap/new-docs-inventory.json', 'utf8'),
  ) as { routes: Array<{ routePath: string }> };

  it('keeps all approved mappings in the source, static, and Vercel redirects', () => {
    expect(reviewedRedirects).toHaveLength(66);

    for (const [source, destination] of reviewedRedirects) {
      expect(posthogRedirects).toContainEqual(
        expect.objectContaining({ legacyPath: source, target: destination }),
      );
      expect(staticRedirects).toContainEqual(
        expect.objectContaining({ p: source, t: destination }),
      );
      expect([
        ...generatedVercelConfig.redirects,
        ...bulkRedirects,
      ]).toContainEqual(
        expect.objectContaining({
          source: encodeURI(source),
          destination,
          statusCode: 301,
        }),
      );
    }
  });

  it('does not redirect paths verified as HTTP 200', () => {
    const excludedPaths = [
      '/en/introduction',
      '/en/realtime-media/im/build/build-core-messaging/reaction',
    ];

    for (const path of excludedPaths) {
      expect(posthogRedirects).not.toContainEqual(
        expect.objectContaining({ legacyPath: path }),
      );
    }
  });

  it('resolves observed paths through the application fallback registry', () => {
    for (const [source, destination] of reviewedRedirects) {
      expect(resolveLegacySitemapRedirectPath(source), source).toMatchObject({
        target: destination,
        preserveSearch: true,
      });
    }
  });

  it('points every internal destination to a current English documentation route', () => {
    const routePaths = new Set(
      docsInventory.routes.map((route) => route.routePath),
    );
    const currentDocFiles = (route: string) => {
      const base = `content/docs${route}`;
      return [
        `${base}.mdx`,
        `${base}.md`,
        `${base}/index.mdx`,
        `${base}/index.md`,
      ].some((file) => existsSync(file));
    };

    for (const [, destination] of reviewedRedirects) {
      if (destination.startsWith('/en/')) {
        expect(
          routePaths.has(destination) || currentDocFiles(destination),
          destination,
        ).toBe(true);
      }
    }
  });

  it('updates the existing platform-specific Video token-server mapping', () => {
    expect(legacySourceConfig.rules).toContainEqual(
      expect.objectContaining({
        legacyPath: '/en/Video/token_server',
        legacySearch: '?platform=Web',
        target:
          '/en/realtime-media/rtc/build/authenticate-users/deploy-token-server',
      }),
    );
  });

  it('keeps the certificate asset mapping marked as low confidence', () => {
    expect(posthogRedirects).toContainEqual(
      expect.objectContaining({
        legacyPath:
          '/en/assets/images/certificate-enable-c777d4a1ba9d00608ae8d5b17a5ef0db.png',
        confidence: 'low',
      }),
    );
  });
});
