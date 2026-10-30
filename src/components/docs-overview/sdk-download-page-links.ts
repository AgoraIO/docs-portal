import { isRetiredCnDocsPath } from '@/lib/retired-cn-docs.mjs';

const platformRouteAliases: Record<string, string> = {
  'react-js': 'react',
  'unreal-engine': 'unreal-cpp',
  'unreal-cpp': 'unreal-cpp',
  'unreal-blueprint': 'unreal-blueprint',
};

const rtcProducts = new Set(['video', 'voice']);
const whiteboardProducts = new Set(['whiteboard', 'fastboard']);
const rtcPlatforms = new Set([
  'android',
  'ios',
  'web',
  'macos',
  'windows',
  'harmonyos',
  'mini-program',
  'electron',
  'flutter',
  'react-native',
  'unity',
  'unreal-engine',
  'unreal-cpp',
  'unreal-blueprint',
  'react-js',
]);
const signalingPlatforms = new Set([
  'cpp',
  'swift',
  'mini-program',
  'android',
  'ios',
  'web',
  'windows',
  'harmonyos',
  'flutter',
  'unity',
  'linux',
]);
const whiteboardPlatforms = new Set(['android', 'ios', 'web']);
const flexibleClassroomPlatforms = new Set([
  'android',
  'ios',
  'web',
  'electron',
]);

export function getZhCNSdkDownloadPageHref(
  productId: string,
  platformId: string,
): string | null {
  if (rtcProducts.has(productId)) {
    if (!rtcPlatforms.has(platformId)) return null;
    const platform = platformRouteAliases[platformId] ?? platformId;
    return `/zh-CN/realtime-media/rtc/reference/downloads/${platform}`;
  }

  if (productId === 'signaling') {
    if (!signalingPlatforms.has(platformId)) return null;
    const platform =
      (
        {
          web: 'javascript',
          android: 'java',
          ios: 'objective-c',
          windows: 'cpp',
          linux: 'cpp',
          'mini-program': 'mini-program-beta',
        } as Record<string, string>
      )[platformId] ?? platformId;
    return `/zh-CN/realtime-media/rtm/reference/downloads/${platform}`;
  }

  if (productId === 'rtsa') {
    return platformId === 'c'
      ? '/zh-CN/realtime-media/rtsa/reference/downloads'
      : null;
  }

  if (productId === 'chat') {
    return 'https://im.shengwang.cn/';
  }

  if (whiteboardProducts.has(productId)) {
    if (!whiteboardPlatforms.has(platformId)) return null;
    const productPath =
      productId === 'fastboard' ? 'fastboard-sdk' : 'whiteboard-sdk';
    return `/zh-CN/realtime-media/whiteboard/${productPath}/reference/downloads/${platformId}`;
  }

  if (productId === 'flexible-classroom') {
    if (!flexibleClassroomPlatforms.has(platformId)) return null;
    const href = `/zh-CN/solutions/flexible-classroom/reference/downloads/${platformId}`;
    return isRetiredCnDocsPath(href) ? null : href;
  }

  if (productId === 'server-gateway') {
    if (platformId === 'linux-java') {
      return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/java';
    }
    if (platformId === 'linux-cpp') {
      return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/cpp';
    }
    if (platformId === 'python') {
      return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/python';
    }
    if (platformId === 'go') {
      return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/go';
    }
    return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads';
  }

  if (productId === 'on-premise-recording') {
    if (platformId === 'linux-cpp') {
      return '/zh-CN/realtime-media/local-server-recording/reference/downloads/server-cpp';
    }
    if (platformId === 'linux-java') {
      return '/zh-CN/realtime-media/local-server-recording/reference/downloads/server-java';
    }
    return '/zh-CN/realtime-media/local-server-recording/reference/downloads';
  }

  return null;
}
