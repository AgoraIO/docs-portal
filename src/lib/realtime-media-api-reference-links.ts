export type RealtimeMediaApiReferenceLinks = {
  productSlug: string;
  restUrl?: string;
  sdkUrl?: string;
};

const GENERIC_SDK_API_REFERENCE_URL = '/en/api-reference/api-ref';

export const realtimeMediaApiReferenceLinks = [
  {
    productSlug: 'rtc',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'voice',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'video',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'broadcast-streaming',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'interactive-live-streaming',
    restUrl: '/en/api-reference/api-ref/rtc',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'rtm',
    restUrl: '/en/api-reference/api-ref/signaling',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'im',
    restUrl: '/en/api-reference/api-ref/im',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'whiteboard',
    restUrl: '/en/api-reference/api-ref/whiteboard',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'flexible-classroom',
    restUrl: '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
  {
    productSlug: 'iot',
    restUrl: '/en/api-reference/api-ref/iot-channel-management-rest-api',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
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
    sdkUrl: '/en/api-reference/api-ref/on-premise-recording',
  },
  {
    productSlug: 'rtc-server-sdk',
    sdkUrl: GENERIC_SDK_API_REFERENCE_URL,
  },
] as const satisfies readonly RealtimeMediaApiReferenceLinks[];

export function getRealtimeMediaApiReferenceLinks(
  activePath?: string,
): RealtimeMediaApiReferenceLinks | null {
  if (!activePath?.startsWith('/en/realtime-media/')) {
    return null;
  }

  const productSlug = activePath.split('/').filter(Boolean)[2];

  return (
    realtimeMediaApiReferenceLinks.find(
      (links) => links.productSlug === productSlug,
    ) ?? null
  );
}
