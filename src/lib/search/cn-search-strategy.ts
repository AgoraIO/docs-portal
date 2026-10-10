import type { SearchSection } from './kb-record';
import { normalizeCnProduct } from './cn-products';

// 参考旧中文站的顺序，ID 使用本项目规范；未定义的产品/平台排在末尾。
const productOrder = [
  'rtc',
  'rtm',
  'flexible-classroom',
  'media-push',
  'media-pull',
  'cloud-recording',
  'local-server-recording',
  'fusion-cdn',
  'whiteboard',
  'analytics',
  'ppt-transcoding',
  'transcoding',
  'chatroom',
  'online-ktv',
  'showroom',
  'meta-world',
  'game-voice',
  'rtsa',
  'smart-doorbell',
  'smart-watch',
  'smart-camera',
  'teleoperation',
  'rtc-server-sdk',
  'online-art-teaching',
  'one-to-one-classroom',
  'small-classroom',
  'breakout-classroom',
  'digital-learning',
];
const platformOrder = [
  'android',
  'ios',
  'macos',
  'web',
  'windows',
  'unity',
  'flutter',
  'electron',
  'react-native',
  'harmonyos',
  'csharp',
  'cpp',
  'java',
  'react',
  'unreal',
  'blueprint',
  'iot',
  'c',
  'device-c',
  'restful',
];
const productAliases: Record<string, string> = {
  'agora-analytics': 'analytics',
  'usage-analytics': 'analytics',
  'ppt-conversion-service': 'ppt-transcoding',
  'art-class': 'online-art-teaching',
};
const platformAliases: Record<string, string> = {
  javascript: 'web',
  'unreal-cpp': 'unreal',
  'unreal-blueprint': 'blueprint',
};

export const cnSearchSynonyms: Record<string, string[]> = {
  发布消息: ['发送消息'],
  云录制: ['云端录制'],
  云端合流: ['云端转码'],
  云端合图: ['云端转码'],
  画中画: ['人像画中画', '合图'],
};
export const cnTechnicalWords = [
  '日志',
  '静音',
  '水印',
  '降噪',
  '镜像',
  '变声',
  '码率',
  '订阅',
  '合流',
  '权限',
  '直播',
  '屏幕共享',
  '大小流',
  '云信令',
];

function sequence(
  value: string | undefined,
  order: string[],
  aliases: Record<string, string>,
) {
  const index = value ? order.indexOf(aliases[value] ?? value) : -1;
  return index < 0 ? 1000 : index + 1;
}

export function splitApiName(value: string) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(
      /([\p{Script=Han}])([A-Za-z])|([A-Za-z])([\p{Script=Han}])/gu,
      '$1$3 $2$4',
    )
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 每次准备快照重新生成检索字段，避免依赖旧索引里手工补上的数据。 */
export function buildCnSearchDocument(record: SearchSection) {
  const api = record.url.startsWith('/zh-CN/api-reference/');
  const product = record.product
    ? normalizeCnProduct(record.product)
    : undefined;
  const products = [
    ...new Set(
      (record.products ?? (record.product ? [record.product] : [])).map(
        normalizeCnProduct,
      ),
    ),
  ];
  const pageEntry =
    !record.url.includes('#') && record.sectionTitle === record.pageTitle;
  const productEntry =
    /^\/zh-CN\/(?:realtime-media|solutions|api-reference\/api-ref)\/[^/]+$/.test(
      record.url,
    );
  const entryTitle = productEntry
    ? record.pageTitle.replace(/概览$/, '')
    : record.pageTitle;
  const entryAliases = Object.entries(cnSearchSynonyms)
    .filter(([, titles]) => titles.includes(entryTitle))
    .map(([alias]) => alias);
  return {
    ...record,
    product,
    products,
    ...(pageEntry ? { entryTitle: [...entryAliases, entryTitle] } : {}),
    // 相关性相同才优先产品说明入口，其次 API 入口，最后普通页/章节。
    entrySeq:
      productEntry && record.url.startsWith('/zh-CN/realtime-media/')
        ? 0
        : productEntry
          ? 1
          : pageEntry
            ? 2
            : 3,
    ...(api
      ? {
          nameSplit: splitApiName(record.sectionTitle),
          groupNameSplit: splitApiName(record.pageTitle),
        }
      : {}),
    productSeq: Math.min(
      1000,
      ...products.map((product) =>
        sequence(product, productOrder, productAliases),
      ),
    ),
    platformSeq: Math.min(
      1000,
      ...(record.platform ?? []).map((platform) =>
        sequence(platform, platformOrder, platformAliases),
      ),
    ),
    // 目前来源没有可靠的 API 类别字段，不能把 OpenAPI 或普通章节猜成方法/类/枚举。
    typeSeq: 1000,
  };
}
