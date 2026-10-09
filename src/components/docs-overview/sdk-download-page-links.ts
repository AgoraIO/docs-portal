const platformRouteAliases: Record<string, string> = {
  'react-js': 'react',
  'unreal-engine': 'unreal',
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
  'react-js',
]);
const signalingPlatforms = new Set([
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
    const platform = platformId === 'linux' ? 'linux-cpp' : platformId;
    return `/zh-CN/realtime-media/rtm/reference/downloads/${platform}`;
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
    return `/zh-CN/solutions/flexible-classroom/reference/downloads/${platformId}`;
  }

  if (productId === 'server-gateway') {
    if (platformId === 'linux-java') {
      return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/linux-java';
    }
    if (platformId === 'linux-cpp') {
      return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/linux-cpp';
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
      return '/zh-CN/realtime-media/local-server-recording/reference/downloads/linux-cpp';
    }
    if (platformId === 'linux-java') {
      return '/zh-CN/realtime-media/local-server-recording/reference/downloads/linux-java';
    }
    return '/zh-CN/realtime-media/local-server-recording/reference/downloads';
  }

  return null;
}
