import analytics from '../../../content/docs/zh-CN/api-reference/api-ref/agora-analytics/meta.json';
import danmaku from '../../../content/docs/zh-CN/api-reference/api-ref/danmaku/meta.json';
import ppt from '../../../content/docs/zh-CN/api-reference/api-ref/ppt-conversion-service/meta.json';
import voip from '../../../content/docs/zh-CN/api-reference/api-ref/voip-callkit/meta.json';
import introduction from '../../../content/docs/zh-CN/introduction/meta.json';
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
  danmaku: danmaku.title,
  'digital-learning': digitalLearning.title,
  introduction: introduction.title,
  'ppt-conversion-service': ppt.title,
  'private-room': privateRoom.title,
  reference: reference.title,
  'voip-callkit': voip.title,
};

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
