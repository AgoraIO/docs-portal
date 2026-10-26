import type { ProductScope } from '../docs-tree';
import { isExcludedCnProduct, normalizeCnProduct } from './cn-products';

// Preserve the legacy site's product/solution catalog while using this site's
// canonical IDs. Guides and API references belong to the same product option.
const productGroups = [
  {
    label: '产品',
    options: [
      { value: 'conversational-ai', label: '对话式 AI 引擎' },
      { value: 'rtc', label: '实时互动' },
      { value: 'rtm', label: '实时消息' },
      { value: 'fusion-cdn', label: '融合 CDN' },
      { value: 'rtsa', label: '媒体流加速' },
      { value: 'flexible-classroom', label: '灵动课堂' },
      { value: 'local-server-recording', label: '本地服务端录制' },
      { value: 'rtc-server-sdk', label: 'RTC 服务端 SDK' },
      { value: 'media-push', label: '旁路推流' },
      { value: 'media-pull', label: '输入在线媒体流' },
      { value: 'whiteboard', label: '互动白板' },
      { value: 'analytics', label: '水晶球' },
      { value: 'speech-to-text', label: '实时转录翻译' },
      { value: 'status-page', label: '健康看板' },
      { value: 'ppt-transcoding', label: 'PPT 转码服务' },
      { value: 'console', label: '控制台' },
      { value: 'cloud-recording', label: '云端录制' },
      { value: 'meeting', label: '灵动会议' },
      { value: 'transcoding', label: '云端转码' },
      { value: 'marketplace', label: '云市场' },
      { value: 'sdk-extensions', label: 'SDK 拓展插件' },
      { value: 'voip-call', label: '微呼叫' },
    ],
  },
  {
    label: '解决方案',
    options: [
      { value: 'chatroom', label: '声动语聊' },
      { value: 'showroom', label: '秀场直播' },
      { value: 'one-to-one-live', label: '1v1 私密房' },
      { value: 'game-voice', label: '游戏语音' },
      { value: 'smart-doorbell', label: '智能门铃' },
      { value: 'smart-watch', label: '智能手表' },
      { value: 'online-ktv', label: '在线 K 歌房' },
      { value: 'smart-camera', label: '智能摄像头' },
      { value: 'teleoperation', label: '平行操控' },
      { value: 'device-kit', label: '对话式 AI 开发套件' },
      { value: 'art-class', label: '在线美术教学' },
      { value: 'online-music-class', label: '在线音乐教学' },
      { value: 'one-to-one-classroom', label: '一对一互动教学' },
      { value: 'small-classroom', label: '一对 N 小班课' },
      { value: 'breakout-classroom', label: '超级小班课' },
      { value: 'digital-learning', label: '教育信息化' },
    ],
  },
];
const productLabels = new Map(
  productGroups.flatMap((group) =>
    group.options.map(({ value, label }) => [value, label] as const),
  ),
);

export function getCnSearchProductGroups() {
  return productGroups.map((group) => ({
    ...group,
    options: group.options.filter(({ value }) => !isExcludedCnProduct(value)),
  }));
}

export function resolveCnSearchProduct(
  value: string | null | undefined,
  scopes: ProductScope[] = [],
) {
  if (!value) return undefined;
  const scope = scopes.find((scope) => scope.id === value)?.scope;
  if (scope && scope.field !== 'product') return undefined;
  const product = normalizeCnProduct(
    scope?.value ?? value.replace(/^product:/, ''),
  );
  return productLabels.has(product) && !isExcludedCnProduct(product)
    ? product
    : undefined;
}

export function getCnProductOptionLabel(
  product: string,
  _products: string[],
  scopes: ProductScope[],
) {
  return getCnProductLabel(product, scopes);
}

export function getCnProductLabel(
  product: string | undefined,
  scopes: ProductScope[],
) {
  if (!product) return '';
  const canonical = normalizeCnProduct(product);
  const otherLabels: Record<string, string> = {
    introduction: '介绍',
    reference: '参考文档',
    overview: '产品概览',
  };
  return (
    productLabels.get(canonical) ??
    otherLabels[canonical] ??
    scopes.find(
      ({ scope }) =>
        scope.field === 'product' &&
        normalizeCnProduct(scope.value) === canonical,
    )?.label ??
    product
  );
}
