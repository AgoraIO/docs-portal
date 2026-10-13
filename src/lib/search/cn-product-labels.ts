import analytics from '../../../content/docs/zh-CN/api-reference/api-ref/agora-analytics/meta.json';
import ppt from '../../../content/docs/zh-CN/api-reference/api-ref/ppt-conversion-service/meta.json';
import voip from '../../../content/docs/zh-CN/api-reference/api-ref/voip-callkit/meta.json';
import art from '../../../content/docs/zh-CN/api-reference/online-art-teaching/meta.json';
import music from '../../../content/docs/zh-CN/api-reference/online-music-teaching/meta.json';
import introduction from '../../../content/docs/zh-CN/introduction/meta.json';
import usageAnalytics from '../../../content/docs/zh-CN/realtime-media/usage-analytics/meta.json';
import reference from '../../../content/docs/zh-CN/reference/meta.json';
import chatroom from '../../../content/docs/zh-CN/solutions/chatroom/meta.json';
import digitalLearning from '../../../content/docs/zh-CN/solutions/digital-learning/meta.json';
import privateRoom from '../../../content/docs/zh-CN/solutions/one-to-one-live/meta.json';
import type { ProductScope } from '../docs-tree';

// Some indexed products are absent from the navigation scopes. Reuse their
// maintained titles; labels must not change the IDs sent to the search service.
const productNames: Record<string, string> = {
  'conversational-ai': '对话式 AI 引擎',
  'device-kit': '对话式 AI 开发套件',
  rtc: '实时互动 RTC',
  rtm: '实时消息 RTM',
  rtsa: '媒体流加速 RTSA',
  'cloud-recording': '云端录制',
  'local-server-recording': '本地服务端录制',
  console: '控制台',
  whiteboard: '互动白板',
  transcoding: '云端转码',
  'agora-analytics': analytics.title,
  chatroom: chatroom.title,
  'digital-learning': digitalLearning.title,
  introduction: introduction.title,
  'ppt-conversion-service': ppt.title,
  'ppt-transcoding': ppt.title,
  'private-room': privateRoom.title,
  reference: reference.title,
  'micro-calling': voip.title,
  'voip-callkit': voip.title,
  analytics: usageAnalytics.title,
  'online-art-teaching': art.title,
  'online-music-teaching': music.title,
  overview: '产品概览',
};

const scopeLabels: Record<string, string> = {
  'agora-analytics': 'REST API',
  analytics: '产品概述',
  'usage-analytics': '指南',
  'ppt-conversion-service': 'REST API',
  'ppt-transcoding': '指南',
  'private-room': 'API 参考',
  'one-to-one-live': '指南',
  'voip-callkit': 'REST API',
  'voip-call': '指南',
  'online-art-teaching': 'API 参考',
  'art-class': '指南',
  'online-music-teaching': 'API 参考',
  'online-music-class': '指南',
};

export function getCnProductOptionLabel(
  product: string,
  products: string[],
  scopes: ProductScope[],
): string {
  const label = getCnProductLabel(product, scopes);
  const duplicated = products.some(
    (id) => id !== product && getCnProductLabel(id, scopes) === label,
  );
  return duplicated ? `${label}（${scopeLabels[product] ?? product}）` : label;
}

export function getCnProductLabel(
  product: string | undefined,
  productScopes: ProductScope[],
): string {
  if (!product) return '';
  return (
    productNames[product] ??
    productScopes.find(
      (scope) =>
        scope.scope.field === 'product' && scope.scope.value === product,
    )?.label ??
    product
  );
}
