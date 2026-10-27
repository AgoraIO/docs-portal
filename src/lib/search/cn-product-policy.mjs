import { retiredCnProductIds } from '../retired-cn-docs.mjs';
import { toCnContentSearchUrl } from './cn-search-urls.mjs';

// Shared by browser filters, the index exporter and the Node coverage auditor.
const aliases = new Map([
  ['cloud-transcoding', 'transcoding'],
  ['signaling', 'rtm'],
  ['ppt-conversion-service', 'ppt-transcoding'],
  ['micro-calling', 'voip-call'],
  ['voip-callkit', 'voip-call'],
  ['agora-analytics', 'analytics'],
  ['usage-analytics', 'analytics'],
  ['online-art-teaching', 'art-class'],
  ['online-music-teaching', 'online-music-class'],
  ['private-room', 'one-to-one-live'],
]);

const excludedProducts = new Set([
  'danmaku',
  'iot',
  'iot-apaas',
  ...retiredCnProductIds,
]);

/** @param {string} product */
export function normalizeCnProduct(product) {
  return aliases.get(product) ?? product;
}

/** @param {string} product */
export function getCnProductAliases(product) {
  const canonical = normalizeCnProduct(product);
  return [
    canonical,
    ...[...aliases]
      .filter(([, value]) => value === canonical)
      .map(([alias]) => alias),
  ];
}

/** @param {string} product */
export function isExcludedCnProduct(product) {
  return excludedProducts.has(normalizeCnProduct(product));
}

/** Product ownership of a content/public route, before API-card overrides.
 * @param {string} value
 */
export function getCnSearchPathProduct(value) {
  const [, tab, firstProduct, secondProduct] = toCnContentSearchUrl(value)
    .split(/[?#]/, 1)[0]
    .split('/')
    .filter(Boolean);
  const product =
    tab === 'solutions'
      ? firstProduct
      : tab === 'api-reference' && firstProduct === 'api-ref'
        ? secondProduct
        : tab === 'ai'
          ? firstProduct === 'device-kit'
            ? 'device-kit'
            : 'conversational-ai'
          : ['realtime-media', 'api-reference'].includes(tab)
            ? firstProduct
            : tab;
  return normalizeCnProduct(product ?? '');
}
