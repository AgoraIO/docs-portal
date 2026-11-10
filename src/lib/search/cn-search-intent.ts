import { platformRegistry } from '../platforms/registry';
import { getCnSearchProductGroups } from './cn-product-labels';
import { type CnSearchFamily, cnSearchFamilies } from './cn-search-family';
import {
  getCnSearchNavigationLanguage,
  normalizeCnSearchLanguageTerms,
} from './cn-search-terms';

// Language names such as Swift/C++ do not identify one documentation runtime.
const runtimePlatforms = new Set([
  'web',
  'javascript',
  'android',
  'ios',
  'macos',
  'windows',
  'harmonyos',
  'electron',
  'unity',
  'flutter',
  'react-native',
]);
const platformPhrases = Object.entries(platformRegistry)
  .filter(([id]) => runtimePlatforms.has(id))
  .flatMap(([id, entry]) =>
    [...new Set([id, entry.label.en, entry.label['zh-CN']])].map((phrase) => {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return {
        platform: id === 'javascript' ? 'web' : id,
        pattern: new RegExp(`(^|\\s)${escaped}(?=$|\\s)`, 'gi'),
        questionPattern: new RegExp(
          `(^|\\s|如何|怎么|怎样)在\\s*${escaped}\\s*(?:平台|端)?上(?=$|\\s|[\\u3400-\\u9fff])`,
          'gi',
        ),
      };
    }),
  )
  .sort((a, b) => b.pattern.source.length - a.pattern.source.length);

// Resolve bare domain terms only. Explicit qualifiers retain their meaning
// (e.g. "bps 混淆" or "云录制常见问题"). The UI keeps the original input.
const bareTopicQueries = new Map([
  ['混淆', '代码混淆'],
  ['云录制', '云端录制'],
]);
function normalizeTopicQuery(query: string): string {
  // Remove question grammar, never arbitrary query words. Quoted searches keep
  // their literal meaning; negation, versions and unknown qualifiers survive.
  if (/["`]/.test(query)) return query;
  const start = /^(?:请问[，,\s]*)?(?:如何|怎么样|怎么|怎样|为什么|为何)/;
  const end =
    /(?:应该|该)?(?:怎么办|怎么解决|如何解决|怎么处理|如何处理|怎么排查|如何排查|是什么原因|是怎么回事)[？?。!！]*$/;
  const question = start.test(query.trim()) || end.test(query.trim());
  let core = query.trim();
  if (question) {
    core = core
      .replace(start, '')
      .replace(end, '')
      .replace(/^才能/, '')
      .replace(/[？?。!！]+$/, '')
      .trim();
    if (
      /^(?:请问[，,\s]*)?(?:如何|怎么样|怎么|怎样)/.test(query.trim()) &&
      /^(?:处理(?!器)|解决(?!方案)|排查)/.test(core)
    )
      core = core
        .replace(/^(?:处理|解决|排查)/, '')
        .replace(/(?:的)?问题$/, '')
        .trim();
    if (!core) return query;
  }
  const compact = core.replace(/\s+/g, '');
  if (
    /^(?:(?:加入频道|加入房间|入会|通话)(?:之后|后|时|中))?(?:听不到(?:对方)?声音|听不见(?:对方)?声音|没有声音|没声音|无声)$/.test(
      compact,
    )
  )
    return '无声';
  if (question) {
    if (/^(?:视频|画面)?(?:会)?(?:出现|发生)?黑屏$/.test(compact))
      return '黑屏';
    if (/^(?:视频|画面)(?:会)?(?:出现|发生)?卡顿$/.test(compact))
      return '视频卡顿';
    if (/^(?:音频|声音)(?:会)?(?:出现|发生)?卡顿$/.test(compact))
      return '音频卡顿';
    if (/^(?:有|出现|产生)?回声$/.test(compact)) return '回声 排查';
  }
  // These are domain expressions, not a list of favored documents or URLs.
  if (/^(?:开启|启用|使用)虚拟背景$/.test(compact)) return '虚拟背景';
  if (/^(?:开启|启用|使用)?共享屏幕$/.test(compact)) return '屏幕共享';
  if (compact === '切换摄像头') return '"切换摄像头"';
  if (/^(?:开启|启用|开始|开通|关闭|停止)云录制(?:服务)?$/.test(compact))
    return compact.replace('云录制', '云端录制');
  // A trailing “怎么办” alone is not enough evidence to reinterpret an
  // unrecognized description. Retain it rather than creating incidental hits.
  if (question && !start.test(query.trim())) return query;
  return bareTopicQueries.get(core) ?? (core === '令牌' ? 'Token' : core);
}

function normalizeConfigurationTask(query: string, product?: string) {
  // Resolution/frame rate/bitrate are video encoder settings in RTC. Recording
  // and screen-share qualifiers must not be rewritten into the RTC task.
  return (!product || product === 'rtc') &&
    /^(?:设置|配置|调整)视频(?:分辨率|帧率|码率)$/.test(query)
    ? '设置视频编码属性'
    : query;
}

// Only consume a product prefix when the remainder is a known task. A query
// comparing products, or an explicit conflicting filter, retains every word.
export function resolveCnSearchTask(query: string, selectedProduct?: string) {
  const productNames = getCnSearchProductGroups()
    .flatMap(({ options }) =>
      options.flatMap(({ value, label }) => [
        { product: value, name: label },
        ...(['rtc', 'rtm'].includes(value)
          ? [{ product: value, name: value }]
          : []),
        ...(value === 'conversational-ai'
          ? [{ product: value, name: '对话式 AI' }]
          : []),
      ]),
    )
    .sort((a, b) => b.name.length - a.name.length);
  const quickStart = /^(?:快速开始|快速入门|接入教程)$/;
  const action = /^(?:登录|登录服务|发送消息|发布消息|收发消息)$/;
  const standalone = query.trim();
  if (quickStart.test(standalone))
    return { query: '快速开始', product: selectedProduct, quickStart: true };
  for (const { product, name } of productNames) {
    const prefix = standalone.toLowerCase().startsWith(name.toLowerCase());
    const suffix = standalone.toLowerCase().endsWith(name.toLowerCase());
    if (!prefix && !suffix) continue;
    if (selectedProduct && selectedProduct !== product) continue;
    const remainder = prefix
      ? standalone.slice(name.length).trim()
      : standalone.slice(0, -name.length).trim();
    const rest = normalizeTopicQuery(remainder);
    if (quickStart.test(rest))
      return { query: '快速开始', product, quickStart: true };
    if (action.test(rest))
      return {
        query: /登录/.test(rest) ? '登录' : '发送消息',
        product,
        quickStart: false,
      };
    if (prefix && rest !== remainder && !/对比|区别|相比/.test(rest))
      return {
        query: normalizeConfigurationTask(rest, product),
        product,
        quickStart: false,
      };
  }
  return {
    query: normalizeConfigurationTask(query, selectedProduct),
    product: selectedProduct,
    quickStart: false,
  };
}

export function resolveCnSearchQuery(query: string, platform?: string) {
  const original = normalizeCnSearchLanguageTerms(query);
  query = normalizeTopicQuery(original);
  let remaining = query;
  const platforms = new Set<string>();
  for (const phrase of platformPhrases) {
    for (const pattern of [
      ...(!/["`]/.test(query) &&
      (query !== original || /(?:如何|怎么|怎样)在/.test(query))
        ? [phrase.questionPattern]
        : []),
      phrase.pattern,
    ]) {
      pattern.lastIndex = 0;
      if (!pattern.test(remaining)) continue;
      platforms.add(phrase.platform);
      remaining = remaining.replace(pattern, '$1');
    }
  }
  if (platforms.size !== 1) return { query, platform };
  const inferred = [...platforms][0];
  if (platform && platform !== inferred) return { query, platform };
  remaining = remaining.replace(/\s+/g, ' ').trim();
  // A platform name on its own is still a search term, not a request for its entire catalog.
  return remaining
    ? { query: normalizeTopicQuery(remaining), platform: platform ?? inferred }
    : { query, platform };
}

export function getCnSearchFamilyOrder(
  query: string,
  matches: ReadonlyArray<{
    family: CnSearchFamily;
    title: string;
    languageEntryTerms?: string[];
    languageEntryRank?: number;
  }>,
  platform?: string,
): readonly CnSearchFamily[] {
  if (
    /^(?:无声|听不到(?:对方)?声音|黑屏|视频卡顿|音频卡顿|ERR_INVALID_TOKEN|Token\s*错误)$/i.test(
      resolveCnSearchQuery(query, platform).query,
    ) &&
    matches.some(({ family }) => family === 'faq')
  )
    return ['faq', 'docs', 'api'];
  const language = getCnSearchNavigationLanguage(query);
  if (language) {
    const rank = (family: CnSearchFamily) =>
      Math.min(
        1000,
        ...matches
          .filter(
            (match) =>
              match.family === family &&
              match.languageEntryTerms?.includes(language),
          )
          .map((match) => match.languageEntryRank ?? 1000),
      );
    return [...cnSearchFamilies].sort((a, b) => rank(a) - rank(b));
  }
  // Preserve guide-first discovery for ordinary words; prioritize a matching code identifier.
  const identifier = resolveCnSearchQuery(query, platform)
    .query.trim()
    .replace(/\(\)$/, '');
  if (
    /^(?:(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d]+|[A-Za-z\d]+(?:_[A-Za-z\d]+)+)$/.test(
      identifier,
    ) &&
    matches.some(
      ({ family, title }) =>
        family === 'api' &&
        title
          .replace(/<\/?(?:mark|em)>/gi, '')
          .replace(/\s*\[\d+\/\d+\]$/, '')
          .replace(/\(\)$/, '')
          .trim()
          .toLowerCase() === identifier.toLowerCase(),
    )
  )
    return ['api', 'docs', 'faq'];
  return cnSearchFamilies;
}

export function getCnGuideIdentifier(query: string) {
  const identifier = query.trim().replace(/\(\)$/, '');
  return /^(?:(?=.*[a-z][A-Z])[A-Za-z\d]+|[A-Za-z\d]+(?:_[A-Za-z\d]+)+)$/.test(
    identifier,
  )
    ? identifier
    : undefined;
}
