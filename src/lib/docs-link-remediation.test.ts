import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getOpenApiPrerenderPaths } from './openapi/lanes';
import { isKnownPlatform } from './platforms/registry';
import { getContentDocsPrerenderPaths } from './prerender-content-routes';
import { getPagePlatformKeys, source } from './source.server';

const publishedRoutes = new Set([
  ...getContentDocsPrerenderPaths(),
  ...getOpenApiPrerenderPaths(),
]);

const linkCases = [
  {
    href: '/zh-CN/realtime-media/rtc/build/video/content-inspect/android',
    expectedTitle: '本地截图上传',
    source:
      'content/docs/zh-CN/api-reference/cloud-recording/restful/overview/billing-strategy/snapshot-billing.mdx',
    target: '/zh-CN/realtime-media/rtc/build/video/content-inspect/android',
  },
  {
    href: '/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size/android#%E5%88%A0%E9%99%A4%E4%B8%8D%E9%9C%80%E8%A6%81%E7%9A%84%E6%8F%92%E4%BB%B6',
    expectedHeading: '删除不需要的插件',
    expectedTitle: '减小 App 体积',
    source:
      'content/docs/zh-CN/api-reference/conversational-ai/rest-api/best-practice/audio-settings.mdx',
    target:
      '/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size/android',
  },
  {
    href: '/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size/ios#%E5%88%A0%E9%99%A4%E4%B8%8D%E9%9C%80%E8%A6%81%E7%9A%84%E6%8F%92%E4%BB%B6',
    expectedHeading: '删除不需要的插件',
    expectedTitle: '减小 App 体积',
    source:
      'content/docs/zh-CN/api-reference/conversational-ai/rest-api/best-practice/audio-settings.mdx',
    target:
      '/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size/ios',
  },
  {
    href: '/zh-CN/api-reference/local-server-recording/java/agoramediartcrecorder.java#initialize%5B1%2F2%5D',
    expectedHeading: 'initialize[1/2]',
    expectedTitle: 'AgoraMediaRtcRecorder 类',
    source:
      'content/docs/zh-CN/api-reference/local-server-recording/java/api-overview.mdx',
    target:
      '/zh-CN/api-reference/local-server-recording/java/agoramediartcrecorder.java',
  },
  {
    href: '/zh-CN/api-reference/local-server-recording/java/agoramediartcrecorder.java#initialize%5B2%2F2%5D',
    expectedHeading: 'initialize[2/2]',
    expectedTitle: 'AgoraMediaRtcRecorder 类',
    source:
      'content/docs/zh-CN/api-reference/local-server-recording/java/api-overview.mdx',
    target:
      '/zh-CN/api-reference/local-server-recording/java/agoramediartcrecorder.java',
  },
  {
    href: '/zh-CN/api-reference/online-music-teaching/ios/api/fish-eye#agorafishcorrectionparams',
    expectedHeading: 'AgoraFishCorrectionParams',
    expectedTitle: '在线音乐教学 API',
    source:
      'content/docs/zh-CN/api-reference/online-music-teaching/ios/api/fish-eye/index.mdx',
    target: '/zh-CN/api-reference/online-music-teaching/ios/api/fish-eye',
  },
  {
    href: '/zh-CN/api-reference/online-music-teaching/ios/api/fish-eye#videoviewsetupmode',
    expectedHeading: 'VideoViewSetupMode',
    expectedTitle: '在线音乐教学 API',
    source:
      'content/docs/zh-CN/api-reference/online-music-teaching/ios/api/fish-eye/index.mdx',
    target: '/zh-CN/api-reference/online-music-teaching/ios/api/fish-eye',
  },
  {
    href: '/zh-CN/api-reference/online-music-teaching/macos/api/fish-eye#agorafishcorrectionparams',
    expectedHeading: 'AgoraFishCorrectionParams',
    expectedTitle: '在线音乐教学 API',
    source:
      'content/docs/zh-CN/api-reference/online-music-teaching/macos/api/fish-eye/index.mdx',
    target: '/zh-CN/api-reference/online-music-teaching/macos/api/fish-eye',
  },
  {
    href: '/zh-CN/api-reference/online-music-teaching/macos/api/fish-eye#videoviewsetupmode',
    expectedHeading: 'VideoViewSetupMode',
    expectedTitle: '在线音乐教学 API',
    source:
      'content/docs/zh-CN/api-reference/online-music-teaching/macos/api/fish-eye/index.mdx',
    target: '/zh-CN/api-reference/online-music-teaching/macos/api/fish-eye',
  },
  {
    href: '/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication',
    expectedTitle: '使用 Token 鉴权',
    source:
      'content/docs/zh-CN/api-reference/online-ktv/ios/auikaraoke/api/auikaraoke-api.mdx',
    target:
      '/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication',
  },
  {
    href: '/zh-CN/realtime-media/rtc/build/security-and-auth/wildcard-token/android',
    expectedTitle: '使用通配 Token',
    source:
      'content/docs/zh-CN/api-reference/private-room/android/custom-signaling/api/call-api/index.mdx',
    target:
      '/zh-CN/realtime-media/rtc/build/security-and-auth/wildcard-token/android',
  },
  {
    href: '/zh-CN/realtime-media/rtc/build/security-and-auth/wildcard-token/ios',
    expectedTitle: '使用通配 Token',
    source:
      'content/docs/zh-CN/api-reference/private-room/ios/custom-signaling/api/call-api/index.mdx',
    target:
      '/zh-CN/realtime-media/rtc/build/security-and-auth/wildcard-token/ios',
  },
  {
    href: '/zh-CN/realtime-media/rtm/build/troubleshooting/android#%E9%94%99%E8%AF%AF%E7%A0%81%E5%AF%B9%E7%85%A7%E8%A1%A8',
    expectedHeading: '错误码对照表',
    expectedTitle: '错误排查',
    source:
      'content/docs/zh-CN/api-reference/private-room/android/custom-signaling/api/call-api/index.mdx',
    target: '/zh-CN/realtime-media/rtm/build/troubleshooting/android',
  },
  {
    href: '/zh-CN/realtime-media/rtm/build/troubleshooting/ios#%E9%94%99%E8%AF%AF%E7%A0%81%E5%AF%B9%E7%85%A7%E8%A1%A8',
    expectedHeading: '错误码对照表',
    expectedTitle: '错误排查',
    source:
      'content/docs/zh-CN/api-reference/private-room/ios/custom-signaling/api/call-api/index.mdx',
    target: '/zh-CN/realtime-media/rtm/build/troubleshooting/ios',
  },
  {
    href: '/zh-CN/realtime-media/rtc/reference/browser-compatibility',
    expectedTitle: '浏览器兼容性和已知问题',
    source:
      'content/docs/zh-CN/api-reference/rtc/restful/overview/product-overview.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/browser-compatibility',
  },
  {
    href: '/zh-CN/realtime-media/rtc/get-started/quick-start?platform=web',
    expectedTitle: '实现音视频互动',
    source:
      'content/docs/zh-CN/realtime-media/rtc/build/extensions/web/image-enhancement.mdx',
    target: '/zh-CN/realtime-media/rtc/get-started/quick-start',
  },
  {
    href: '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/cloud-proxy',
    expectedTitle: '应对防火墙限制',
    source:
      'content/docs/zh-CN/realtime-media/local-server-recording/build/legacy/integrate-sdk.mdx',
    target:
      '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/cloud-proxy',
  },
  {
    href: '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/generate-token',
    expectedTitle: '使用 Token 鉴权',
    source:
      'content/docs/zh-CN/realtime-media/local-server-recording/build/legacy/record-by-api.mdx',
    target:
      '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/generate-token',
  },
  {
    href: '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/enable-service',
    expectedTitle: '开通本地服务端录制服务',
    source:
      'content/docs/zh-CN/realtime-media/local-server-recording/build/legacy/record-by-cmd.mdx',
    target:
      '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/enable-service',
  },
];

const releaseNoteLinkCases = [
  {
    expectedHeading: 'v4.20.0',
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/web#v4.20.0',
    platform: 'web',
    source: 'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
  },
  {
    expectedHeading: 'v4.22.0',
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/web#v4.22.0',
    platform: 'web',
    source: 'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
  },
  {
    expectedHeading: 'v4.24.0',
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/web#v4.24.0',
    platform: 'web',
    source: 'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
  },
  {
    expectedHeading: 'v4.24.2',
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/web#v4.24.2',
    platform: 'web',
    source: 'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
  },
  {
    expectedHeading: 'v4.23.2',
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
    platform: 'web',
    source: 'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
  },
  {
    expectedHeading: 'v4.21.0',
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
    platform: 'web',
    source: 'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/web',
  },
  {
    href: '/zh-CN/realtime-media/rtc/reference/release-notes/android',
    platform: 'android',
    source: 'content/docs/zh-CN/ai/aigc/get-started/run-example.mdx',
    target: '/zh-CN/realtime-media/rtc/reference/release-notes/android',
  },
];

const legacyAnchorLinkCases = [
  {
    expectedTitle: '本地截图上传',
    href: '/zh-CN/realtime-media/rtc/build/video/content-inspect/android',
    source:
      'content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/snapshot.mdx',
    target: '/zh-CN/realtime-media/rtc/build/video/content-inspect/android',
  },
  {
    expectedHeading: 'VIDEO_VIEW_SETUP_MODE',
    expectedTitle: '在线音乐教学 API',
    href: '/zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye#video_view_setup_mode',
    source:
      'content/docs/zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye/index.mdx',
    target:
      '/zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye',
  },
  {
    expectedHeading: 'RTM_CHANNEL_TYPE',
    expectedTitle: '枚举类',
    href: '/zh-CN/api-reference/rtm/unity/enumv#rtm_channel_type',
    source: 'content/docs/zh-CN/api-reference/rtm/unity/presence.mdx',
    target: '/zh-CN/api-reference/rtm/unity/enumv',
  },
  ...[
    ['start_listening', 'start_listening'],
    ['flush_listening', 'flush_listening'],
    ['stop_listening', 'stop_listening'],
    ['log_lv', 'log_lv'],
    ['ist_result', 'ist_result'],
    ['its_result', 'its_result'],
  ].flatMap(([fragment, heading]) =>
    ['', 'android', 'ios', 'web', 'windows'].map((platform) => ({
      expectedHeading: heading,
      expectedTitle: '讯飞转写及翻译键值说明',
      href: `#${fragment}`,
      source:
        'content/docs/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx',
      target: `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api${platform ? `/${platform}` : ''}`,
    })),
  ),
  {
    expectedHeading: 'registerAudioFrameObserver() [2/2]',
    expectedTitle: 'io.agora.rtc.AgoraLocalUser类 参考',
    href: '/zh-CN/api-reference/rtc-server-sdk/java/classio-1-1agora-1-1rtc-1-1-agora-local-user#registeraudioframeobserver-22',
    source:
      'content/docs/zh-CN/realtime-media/rtc-server-sdk/reference/release-notes.mdx',
    target:
      '/zh-CN/api-reference/rtc-server-sdk/java/classio-1-1agora-1-1rtc-1-1-agora-local-user',
  },
  ...[
    [
      'audio_data_type_e',
      'audio_data_type_e',
      'content/docs/zh-CN/realtime-media/rtsa/index.mdx',
    ],
    [
      'video_data_type_e',
      'video_data_type_e',
      'content/docs/zh-CN/realtime-media/rtsa/index.mdx',
    ],
    [
      'agora_rtc_get_rdt_status_info',
      'agora_rtc_get_rdt_status_info()',
      'content/docs/zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx',
    ],
    [
      'agora_rtc_join_channel',
      'agora_rtc_join_channel()',
      'content/docs/zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx',
    ],
    [
      'agora_rtc_send_rdt_msg',
      'agora_rtc_send_rdt_msg()',
      'content/docs/zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx',
    ],
    [
      'agora_rtc_create_connection',
      'agora_rtc_create_connection()',
      'content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx',
    ],
    [
      'agora_rtc_destroy_connection',
      'agora_rtc_destroy_connection()',
      'content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx',
    ],
    [
      'agora_rtc_leave_channel',
      'agora_rtc_leave_channel()',
      'content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx',
    ],
    [
      'agora_rtc_send_audio_data',
      'agora_rtc_send_audio_data()',
      'content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx',
    ],
    [
      'agora_rtc_send_video_data',
      'agora_rtc_send_video_data()',
      'content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx',
    ],
    [
      'audio_codec_type_e',
      'audio_codec_type_e',
      'content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/audio-codec.mdx',
    ],
    [
      'agora_err_code_e',
      'agora_err_code_e',
      'content/docs/zh-CN/realtime-media/rtsa/reference/release-notes.mdx',
    ],
    [
      'area_code_e',
      'area_code_e',
      'content/docs/zh-CN/realtime-media/rtsa/reference/release-notes.mdx',
    ],
  ].map(([fragment, heading, source]) => ({
    expectedHeading: heading,
    expectedTitle: 'agora_rtc_api.h 文件参考',
    href: `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h#${fragment}`,
    source,
    target: '/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h',
  })),
  ...[
    ['on_rdt_state', 'on_rdt_state'],
    ['on_rdt_msg', 'on_rdt_msg'],
  ].map(([fragment, heading]) => ({
    expectedHeading: heading,
    expectedTitle: 'agora_rtc_event_handler_t结构体 参考',
    href: `/zh-CN/api-reference/rtsa/c/structagora-rtc-event-handler-t#${fragment}`,
    source:
      'content/docs/zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx',
    target: '/zh-CN/api-reference/rtsa/c/structagora-rtc-event-handler-t',
  })),
  {
    expectedTitle: '加入频道开始实时转录翻译',
    href: '/zh-CN/api-reference/api-ref/speech-to-text/join#request.body.maxIdleTime',
    source:
      'content/docs/zh-CN/realtime-media/speech-to-text/reference/release-notes.mdx',
    target: '/zh-CN/api-reference/api-ref/speech-to-text/join',
  },
  ...[
    [
      '//api/name/createReplayerWithConfig:callbacks:completionHandler:',
      'createReplayerWithConfig:callbacks:completionHandler:',
      'WhiteSDK Class Reference',
    ],
    ['//api/name/play', '– play', 'WhitePlayer Class Reference'],
    ['//api/name/pause', '– pause', 'WhitePlayer Class Reference'],
    [
      '//api/name/seekToScheduleTime:',
      '– seekToScheduleTime:',
      'WhitePlayer Class Reference',
    ],
    [
      '//api/name/setObserverMode:',
      '– setObserverMode:',
      'WhitePlayer Class Reference',
    ],
  ].map(([fragment, heading, title]) => ({
    expectedHeading: heading,
    expectedTitle: title,
    href: `/zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/classes/${title.startsWith('WhiteSDK') ? 'white-sdk' : 'white-player'}#${fragment}`,
    source:
      'content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/record-and-replay.mdx',
    target: `/zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/classes/${title.startsWith('WhiteSDK') ? 'white-sdk' : 'white-player'}`,
  })),
  ...[
    ['globalstate', 'GlobalState'],
    ['scenestate', 'SceneState'],
  ].map(([fragment, heading]) => ({
    expectedHeading: heading,
    expectedTitle: 'Agora Interactive Whiteboard Web SDK API Reference',
    href: `/zh-CN/api-reference/whiteboard/whiteboard-sdk/web/globals#${fragment}`,
    source:
      'content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/manage-room-status.mdx',
    target: '/zh-CN/api-reference/whiteboard/whiteboard-sdk/web/globals',
  })),
  {
    expectedHeading: '98 API_ERROR',
    expectedTitle: '事件类型',
    href: '/zh-CN/solutions/voip-call/voip-events#98-api_error',
    source: 'content/docs/zh-CN/solutions/voip-call/build/license.mdx',
    target: '/zh-CN/solutions/voip-call/voip-events',
  },
];

describe('reported Chinese link destinations', () => {
  it.each(linkCases)(
    '$source points to the intended page at $target',
    async ({
      expectedHeading,
      expectedTitle,
      href,
      source: sourcePath,
      target,
    }) => {
      expect(readFileSync(sourcePath, 'utf8').includes(href)).toBe(true);
      const page = await resolvePublishedTarget(target);
      expect(page, target).toBeDefined();
      if (!page) {
        throw new Error(`No published target page found for ${target}`);
      }
      expect(page.data.title).toBe(expectedTitle);

      if (expectedHeading) {
        expect(await getProcessedText(page)).toContain(expectedHeading);
      }
    },
    15_000,
  );

  it.each(releaseNoteLinkCases)(
    '$source points to the visible $platform release-note target at $target',
    async ({ expectedHeading, href, platform, source: sourcePath, target }) => {
      expect(readFileSync(sourcePath, 'utf8').includes(href)).toBe(true);
      const page = await resolvePublishedTarget(target);
      expect(page, target).toBeDefined();
      if (!page) {
        throw new Error(`No published target page found for ${target}`);
      }

      expect(page.data.title).toBe('发版说明');
      expect(await getPagePlatformKeys(page)).toContain(platform);
      if (expectedHeading) {
        expect(await getProcessedText(page)).toContain(expectedHeading);
      }
    },
    15_000,
  );

  it.each(legacyAnchorLinkCases)(
    '$source links to the intended heading on $target',
    async ({
      expectedHeading,
      expectedTitle,
      href,
      source: sourcePath,
      target,
    }) => {
      expect(readFileSync(sourcePath, 'utf8').includes(href)).toBe(true);
      const page = await resolvePublishedTarget(target);
      expect(page, target).toBeDefined();
      if (!page) {
        throw new Error(`No published target page found for ${target}`);
      }

      expect(page.data.title).toBe(expectedTitle);
      if (expectedHeading) {
        expect(await getProcessedText(page)).toContain(expectedHeading);
      }
    },
  );

  it.each(['v4.20.0', 'v4.22.0', 'v4.24.0', 'v4.24.2'])(
    'keeps the pending RTC release-note anchor %s at its matching version heading',
    (version) => {
      const sourcePath =
        'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx';
      const content = readFileSync(sourcePath, 'utf8');

      expect(content).toContain(`<a id="${version}"></a>`);
      expect(content).toContain(`## ${version}`);
    },
  );

  it('publishes the RTC release-notes page behind the pending base link', () => {
    expect(
      publishedRoutes.has('/zh-CN/realtime-media/rtc/reference/release-notes'),
    ).toBe(true);
  });
});

async function resolvePublishedTarget(target: string) {
  const path = new URL(target, 'https://docs.example').pathname;
  const segments = path.split('/').filter(Boolean);
  const locale = segments[0];

  if (!locale) {
    return undefined;
  }

  if (publishedRoutes.has(path)) {
    return source.getPage(segments.slice(1), locale);
  }

  const platform = segments.at(-1);
  if (!locale || !platform || !isKnownPlatform(platform)) {
    return undefined;
  }

  const page = source.getPage(segments.slice(1, -1), locale);

  return page && (await getPagePlatformKeys(page)).includes(platform)
    ? page
    : undefined;
}

async function getProcessedText(
  page: NonNullable<Awaited<ReturnType<typeof source.getPage>>>,
) {
  if (!('getText' in page.data) || typeof page.data.getText !== 'function') {
    return '';
  }

  return (await page.data.getText('processed'))
    .replaceAll('\\_', '_')
    .replaceAll('\\[', '[')
    .replaceAll('\\]', ']')
    .replaceAll('\\(', '(')
    .replaceAll('\\)', ')');
}
