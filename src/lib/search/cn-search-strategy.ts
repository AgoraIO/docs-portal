import {
  isExcludedCnProduct,
  normalizeCnProduct,
  normalizeCnProductList,
} from './cn-products';
import { getCnSearchFamily } from './cn-search-family';
import { getCnSearchLanguageTerms } from './cn-search-terms';
import { toCnPublicSearchUrl } from './cn-search-urls.mjs';
import type { SearchSection } from './kb-record';

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
  simulcast: ['双流模式'],
  发布消息: ['发送消息'],
  云录制: ['云端录制'],
  云端合流: ['云端转码'],
  云端合图: ['云端转码'],
  画中画: ['人像画中画', '合图'],
  大小流: ['大流', '小流', '双流模式'],
  双流: ['双流模式', '大流', '小流'],
  产品概述: ['概览'],
  产品概览: ['概览'],
  开启: ['开始', '开通', '启用'],
};
export const cnTechnicalWords = [
  'simulcast',
  '混淆',
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
  '大流',
  '小流',
  '双流',
  '双流模式',
  '云信令',
  '开启',
  '开始',
  '开通',
];

// RTM is a product query whose prefix also names the unrelated RTMP protocol.
// Other acronyms keep prefix discovery (e.g. RTC can find RtcConnection).
export const cnExactProductAcronyms = ['rtm'];

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
  const publicUrl = toCnPublicSearchUrl(record.url);
  const api = publicUrl.startsWith('/api-reference/');
  const sourceProducts = record.products?.length
    ? record.products
    : record.product
      ? [record.product]
      : [];
  const products = normalizeCnProductList(sourceProducts);
  const normalizedProduct = record.product
    ? normalizeCnProduct(record.product)
    : undefined;
  const product =
    normalizedProduct && !isExcludedCnProduct(normalizedProduct)
      ? normalizedProduct
      : products[0];
  const pageEntry =
    !record.url.includes('#') && record.sectionTitle === record.pageTitle;
  // Use maintained tutorial routes, not a list of favored result URLs. Setup,
  // release notes and demo downloads are not complete first-use tutorials.
  const quickStart =
    /\/get-started\//.test(publicUrl) &&
    /^(?:实现|使用|开始|集成|加入|构建|快速|跑通)/.test(record.pageTitle);
  const productEntry =
    /^\/(?:realtime-media|solutions|api-reference\/api-ref)\/[^/]+$/.test(
      publicUrl,
    );
  const entryTitle = productEntry
    ? record.pageTitle.replace(/概览$/, '')
    : record.pageTitle;
  const entryAliases = Object.entries(cnSearchSynonyms)
    .filter(([, titles]) => titles.includes(entryTitle))
    .map(([alias]) => alias);
  // Keep displayed release labels while also accepting numeric versions:
  // Meilisearch tokenizes a leading "v" together with the major number.
  const versionAliases = record.headingPath
    .map((heading) => heading.replace(/\bv(?=\d+\.\d)/gi, ''))
    .filter((heading, index) => heading !== record.headingPath[index]);
  // Code obfuscation can be described without the contiguous phrase 代码混淆.
  // Require local technical evidence, rather than a page URL or an incidental
  // mention of code elsewhere in a chapter about confusing tokens/units.
  const obfuscationContext = `${record.sectionTitle}\n${record.content}`;
  const codeObfuscation =
    /(?:代码|字段|属性名|类名|变量名|方法名|标识符)(?:被|的)?混淆/.test(
      obfuscationContext,
    ) ||
    /\b(?:R8|ProGuard|uglify(?:-js)?)\b[^\n。]{0,80}混淆|混淆[^\n。]{0,80}\b(?:R8|ProGuard|uglify(?:-js)?)\b/i.test(
      obfuscationContext,
    );
  const aliases = [
    ...(record.aliases ?? []),
    ...versionAliases,
    ...(codeObfuscation ? ['代码混淆'] : []),
    ...(quickStart && pageEntry ? ['快速开始', '快速入门', '接入教程'] : []),
    ...(record.sectionTitle.includes('收发消息') ? ['发送消息'] : []),
  ];
  const guideHeading =
    getCnSearchFamily({ pageUrl: publicUrl, docType: record.docType }) ===
      'docs' &&
    !/\/release-notes(?:\/|#|$)/.test(publicUrl) &&
    !record.headingPath
      .slice(1)
      .some((title) => /示例|参考|注意事项|前提条件|准备开发环境/.test(title));
  const family = getCnSearchFamily({
    pageUrl: publicUrl,
    docType: record.docType,
  });
  const languageEntryRank =
    family === 'faq' ||
    /\/release-notes(?:\/|#|$)/.test(publicUrl) ||
    /迁移|升级|下架/.test(record.pageTitle)
      ? 1000
      : /(?:下载|集成)\s*(?:SDK|开发包)|(?:SDK|开发包).*下载|NuGet.*SDK/i.test(
            record.sectionTitle,
          )
        ? 0
        : /快速开始|集成\s*(?:指引|指南)|跑通.*示例/.test(
              record.sectionTitle,
            ) ||
            (pageEntry && /\/get-started\//.test(publicUrl))
          ? 1
          : pageEntry &&
              /概览|概述|API\s*列表|(?:API|SDK).*\bReference\b|(?:API|SDK).*参考/i.test(
                record.sectionTitle,
              )
            ? 2
            : 1000;
  // SDK applicability comes from the maintained title/platform, never a code
  // sample in the body or a product's list of supported languages.
  const languageEntryTerms =
    languageEntryRank < 1000
      ? getCnSearchLanguageTerms(record.sectionTitle, record.platform)
      : [];
  return {
    ...record,
    taskKinds: quickStart && pageEntry ? ['quick-start'] : [],
    ...(aliases.length ? { aliases: [...new Set(aliases)] } : {}),
    languageEntryTerms,
    languageEntryRank: languageEntryTerms.length ? languageEntryRank : 1000,
    languageTerms: getCnSearchLanguageTerms(
      `${record.pageTitle}\n${record.sectionTitle}\n${record.content}`,
      record.platform,
    ),
    searchFamily: getCnSearchFamily({
      pageUrl: record.url,
      docType: record.docType,
    }),
    product,
    products,
    ...(guideHeading ? { guideHeading: record.sectionTitle } : {}),
    ...(pageEntry
      ? {
          entryTitle: [
            ...entryAliases,
            ...(quickStart ? ['快速开始'] : []),
            entryTitle,
          ],
        }
      : {}),
    // Match maintained product names before similarly named event/reference pages.
    // Separate complete acronyms so RTM and the RTMP prefix share equal word positions.
    ...(pageEntry && productEntry
      ? {
          productTitle: entryTitle.trim(),
          productCode: entryTitle.match(/\b[A-Z][A-Z\d]+\b/g) ?? [],
        }
      : {}),
    // 相关性相同才优先产品说明入口，其次 API 入口，最后普通页/章节。
    entrySeq:
      productEntry && publicUrl.startsWith('/realtime-media/')
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
