export type RealtimeMediaApiReferenceLinks = {
  productSlug: string;
  restUrl?: string;
  sdkUrl?: string;
};

const GENERIC_SDK_API_REFERENCE_URL = '/en/api-reference/api-ref';

function sdkCatalogUrl(product: string, sdk?: string) {
  return `${GENERIC_SDK_API_REFERENCE_URL}?product=${product}${sdk ? `&sdk=${sdk}` : ''}`;
}

export const realtimeMediaApiReferenceLinks = [
  {
    productSlug: 'rtc',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: sdkCatalogUrl('realtime-communication'),
  },
  {
    productSlug: 'voice',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: sdkCatalogUrl('realtime-communication', 'voice'),
  },
  {
    productSlug: 'video',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: sdkCatalogUrl('realtime-communication'),
  },
  {
    productSlug: 'broadcast-streaming',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: sdkCatalogUrl('realtime-communication'),
  },
  {
    productSlug: 'interactive-live-streaming',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: sdkCatalogUrl('realtime-communication'),
  },
  {
    productSlug: 'rtm',
    restUrl: '/en/api-reference/api-ref/signaling',
    sdkUrl: sdkCatalogUrl('signaling'),
  },
  {
    productSlug: 'im',
    restUrl: '/en/api-reference/api-ref/im',
    sdkUrl: sdkCatalogUrl('chat'),
  },
  {
    productSlug: 'whiteboard',
    restUrl: '/en/api-reference/api-ref/whiteboard',
    sdkUrl: sdkCatalogUrl('interactive-whiteboard'),
  },
  {
    productSlug: 'flexible-classroom',
    restUrl: '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    sdkUrl: sdkCatalogUrl('flexible-classroom'),
  },
  {
    productSlug: 'iot',
    restUrl: '/en/api-reference/api-ref/iot-channel-management-rest-api',
    sdkUrl: sdkCatalogUrl('iot-sdk'),
  },
  {
    productSlug: 'cloud-recording',
    restUrl: '/en/api-reference/api-ref/cloud-recording',
  },
  {
    productSlug: 'transcoding',
    restUrl: '/en/api-reference/api-ref/cloud-transcoding',
  },
  {
    productSlug: 'speech-to-text',
    restUrl: '/en/api-reference/api-ref/speech-to-text',
  },
  {
    productSlug: 'media-pull',
    restUrl: '/en/api-reference/api-ref/media-pull',
  },
  {
    productSlug: 'media-push',
    restUrl: '/en/api-reference/api-ref/media-push',
  },
  {
    productSlug: 'rtmp-gateway',
    restUrl: '/en/api-reference/api-ref/rtmp-gateway',
  },
  {
    productSlug: 'agora-analytics',
    restUrl: '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
  },
  {
    productSlug: 'marketplace',
    restUrl: '/en/api-reference/api-ref/extensions-marketplace/provisioning',
  },
  {
    productSlug: 'on-premise-recording',
    sdkUrl: sdkCatalogUrl('on-premise-recording'),
  },
  {
    productSlug: 'rtc-server-sdk',
    sdkUrl: sdkCatalogUrl('server-gateway'),
  },
] as const satisfies readonly RealtimeMediaApiReferenceLinks[];

export function getRealtimeMediaApiReferenceLinks(
  activePath?: string,
): RealtimeMediaApiReferenceLinks | null {
  if (!activePath?.startsWith('/en/realtime-media/')) {
    return null;
  }

  const productSlug = activePath.split('/').filter(Boolean)[2];
  const links =
    realtimeMediaApiReferenceLinks.find(
      (entry) => entry.productSlug === productSlug,
    ) ?? null;

  if (
    links?.productSlug === 'rtc' &&
    /^\/en\/realtime-media\/rtc\/voice-quickstart(?:[?#]|$)/.test(activePath)
  ) {
    return {
      ...links,
      sdkUrl: sdkCatalogUrl('realtime-communication', 'voice'),
    };
  }

  return links;
}
