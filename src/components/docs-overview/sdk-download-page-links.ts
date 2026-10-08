const platformRouteAliases: Record<string, string> = {
  'react-js': 'react',
  'unreal-engine': 'unreal',
};

const rtcProducts = new Set(['video', 'voice']);
const whiteboardProducts = new Set(['whiteboard', 'fastboard']);

export function getZhCNSdkDownloadPageHref(
  productId: string,
  platformId: string,
): string | null {
  if (rtcProducts.has(productId)) {
    const platform = platformRouteAliases[platformId] ?? platformId;
    return `/zh-CN/realtime-media/rtc/reference/downloads/${platform}`;
  }

  if (productId === 'signaling') {
    const platform = platformId === 'linux' ? 'linux-cpp' : platformId;
    return `/zh-CN/realtime-media/rtm/reference/downloads/${platform}`;
  }

  if (whiteboardProducts.has(productId)) {
    const productPath =
      productId === 'fastboard' ? 'fastboard-sdk' : 'whiteboard-sdk';
    return `/zh-CN/realtime-media/whiteboard/${productPath}/reference/downloads/${platformId}`;
  }

  if (productId === 'flexible-classroom') {
    return `/zh-CN/solutions/flexible-classroom/reference/downloads/${platformId}`;
  }

  if (productId === 'server-gateway') {
    return '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads';
  }

  if (productId === 'on-premise-recording') {
    return '/zh-CN/realtime-media/local-server-recording/reference/downloads';
  }

  return null;
}
