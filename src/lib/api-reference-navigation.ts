export const API_REFERENCE_CATALOG_SELECTOR = '[data-api-reference-catalog]';
export const API_REFERENCE_PRODUCT_ID_ATTRIBUTE =
  'data-api-reference-product-id';
export const API_REFERENCE_PRODUCT_SECTION_SELECTOR =
  '[data-api-reference-product-id]';

export type ApiReferenceCapabilityGroup = {
  id: 'core' | 'extensions' | 'solutions';
  label: string;
  productIds: readonly string[];
};

export const API_REFERENCE_CAPABILITY_GROUPS: readonly ApiReferenceCapabilityGroup[] =
  [
    {
      id: 'core',
      label: '实时互动基础能力',
      productIds: [
        'conversational-ai',
        'rtc',
        'rtm',
        'im',
        'fusion-cdn',
        'rtsa',
      ],
    },
    {
      id: 'extensions',
      label: '实时互动扩展能力',
      productIds: [
        'whiteboard',
        'voip-callkit',
        'analytics',
        'speech-to-text',
        'cloud-recording',
        'local-server-recording',
        'media-push',
        'media-pull',
        'cloud-transcoding',
        'rtmp-gateway',
        'rtc-server-sdk',
        'ppt-conversion-service',
        'console',
      ],
    },
    {
      id: 'solutions',
      label: '场景化解决方案',
      productIds: [
        'meeting',
        'online-ktv',
        'private-room',
        'online-art-teaching',
        'online-music-teaching',
        'teleoperation',
        'flexible-classroom',
      ],
    },
  ];

export function getApiReferenceProductSectionId(productId: string) {
  return `api-reference-product-${productId}`;
}
