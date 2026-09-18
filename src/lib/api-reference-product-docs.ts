import { resolveZhCnApiReferenceEntry } from './api-reference-breadcrumb';
import { isSamePathOrDescendant } from './docs-routing';

const ZH_CN_API_REFERENCE_PRODUCT_DOCS = {
  'conversational-ai': '/zh-CN/ai',
  rtc: '/zh-CN/realtime-media/rtc',
  rtm: '/zh-CN/realtime-media/rtm',
  'fusion-cdn': '/zh-CN/realtime-media/fusion-cdn',
  rtsa: '/zh-CN/realtime-media/rtsa',
  whiteboard: '/zh-CN/realtime-media/whiteboard',
  'voip-callkit': '/zh-CN/solutions/voip-call',
  analytics: '/zh-CN/realtime-media/usage-analytics',
  'speech-to-text': '/zh-CN/realtime-media/speech-to-text',
  'cloud-recording': '/zh-CN/realtime-media/cloud-recording',
  'local-server-recording': '/zh-CN/realtime-media/local-server-recording',
  'media-push': '/zh-CN/realtime-media/media-push',
  'media-pull': '/zh-CN/realtime-media/media-pull',
  'cloud-transcoding': '/zh-CN/realtime-media/transcoding',
  'rtmp-gateway': '/zh-CN/realtime-media/rtmp-gateway',
  'rtc-server-sdk': '/zh-CN/realtime-media/rtc-server-sdk',
  'ppt-conversion-service': '/zh-CN/solutions/ppt-transcoding',
  console: '/zh-CN/introduction/quickstart',
  meeting: '/zh-CN/realtime-media/meeting',
  'online-ktv': '/zh-CN/solutions/online-ktv',
  'private-room': '/zh-CN/solutions/one-to-one-live',
  'online-art-teaching': '/zh-CN/solutions/art-class',
  'online-music-teaching': '/zh-CN/solutions/online-music-class',
  teleoperation: '/zh-CN/solutions/teleoperation',
  'flexible-classroom': '/zh-CN/solutions/flexible-classroom',
} as const satisfies Record<string, string>;

export function resolveZhCnApiReferenceProductDocsHref(
  activePath: string,
): string | undefined {
  const entry = resolveZhCnApiReferenceEntry(activePath);

  if (!entry || !isSamePathOrDescendant(activePath, entry.href)) {
    return undefined;
  }

  return ZH_CN_API_REFERENCE_PRODUCT_DOCS[
    entry.productId as keyof typeof ZH_CN_API_REFERENCE_PRODUCT_DOCS
  ];
}
