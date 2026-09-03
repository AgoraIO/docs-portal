export const API_REFERENCE_CATALOG_SELECTOR = '[data-api-reference-catalog]';
export const API_REFERENCE_PRODUCT_ID_ATTRIBUTE =
  'data-api-reference-product-id';
export const API_REFERENCE_PRODUCT_SECTION_SELECTOR =
  '[data-api-reference-product-id]';

export type ApiReferenceCapabilityGroup = {
  id:
    | 'conversational-ai'
    | 'realtime-core'
    | 'media-processing'
    | 'meeting-collaboration'
    | 'monitoring-analytics'
    | 'extensions-ecosystem'
    | 'social-entertainment'
    | 'education'
    | 'smart-hardware'
    | 'platform-management';
  label: string;
  productIds: readonly string[];
};

export const API_REFERENCE_CAPABILITY_GROUPS: readonly ApiReferenceCapabilityGroup[] =
  [
    {
      id: 'conversational-ai',
      label: '对话式 AI 引擎',
      productIds: ['conversational-ai'],
    },
    {
      id: 'realtime-core',
      label: '实时互动基础能力',
      productIds: ['rtc', 'rtm', 'im', 'rtsa'],
    },
    {
      id: 'media-processing',
      label: '实时媒体处理',
      productIds: [
        'speech-to-text',
        'cloud-recording',
        'local-server-recording',
        'cloud-transcoding',
        'media-push',
        'media-pull',
        'rtmp-gateway',
        'fusion-cdn',
      ],
    },
    {
      id: 'meeting-collaboration',
      label: '会议协作',
      productIds: ['meeting'],
    },
    {
      id: 'monitoring-analytics',
      label: '监控与分析',
      productIds: ['analytics'],
    },
    {
      id: 'extensions-ecosystem',
      label: '扩展能力与生态',
      productIds: ['rtc-server-sdk', 'whiteboard'],
    },
    {
      id: 'social-entertainment',
      label: '社交娱乐',
      productIds: ['online-ktv', 'private-room'],
    },
    {
      id: 'education',
      label: '教育',
      productIds: [
        'flexible-classroom',
        'online-art-teaching',
        'online-music-teaching',
        'ppt-conversion-service',
      ],
    },
    {
      id: 'smart-hardware',
      label: '智能硬件',
      productIds: ['voip-callkit', 'teleoperation'],
    },
    {
      id: 'platform-management',
      label: '平台管理',
      productIds: ['console'],
    },
  ];

export function getApiReferenceProductSectionId(productId: string) {
  return `api-reference-product-${productId}`;
}
