import { retiredCnProductIds } from '../retired-cn-docs.mjs';

// 搜索产品 ID 跟随中文导航；API/FAQ 的历史名称在此统一，文档 URL 保持原样。
const aliases = new Map<string, string>([
  ['cloud-transcoding', 'transcoding'],
  ['signaling', 'rtm'],
  ['ppt-conversion-service', 'ppt-transcoding'],
  ['micro-calling', 'voip-callkit'],
]);

const excludedProducts = new Set([
  'danmaku',
  'iot',
  'iot-apaas',
  ...retiredCnProductIds,
]);

const aliasesByCanonical = new Map<string, string[]>();
for (const [alias, canonical] of aliases) {
  const values = aliasesByCanonical.get(canonical) ?? [];
  values.push(alias);
  aliasesByCanonical.set(canonical, values);
}

export function normalizeCnProduct(product: string): string {
  return aliases.get(product) ?? product;
}

export function getCnProductAliases(product: string): string[] {
  const canonical = normalizeCnProduct(product);
  return [canonical, ...(aliasesByCanonical.get(canonical) ?? [])];
}

export function normalizeCnProductList(products: string[]): string[] {
  return [
    ...new Set(
      products
        .map(normalizeCnProduct)
        .filter((product) => !isExcludedCnProduct(product)),
    ),
  ];
}

export function isExcludedCnProduct(product: string): boolean {
  return excludedProducts.has(normalizeCnProduct(product));
}

export function normalizeCnProductFacets(values: Record<string, number>) {
  const normalized: Record<string, number> = {};
  for (const [product, count] of Object.entries(values)) {
    const canonical = normalizeCnProduct(product);
    if (isExcludedCnProduct(canonical)) continue;
    normalized[canonical] = (normalized[canonical] ?? 0) + count;
  }
  return normalized;
}
