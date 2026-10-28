import {
  isExcludedCnProduct,
  normalizeCnProduct,
} from './cn-product-policy.mjs';

export {
  getCnProductAliases,
  getCnSearchPathProduct,
  isExcludedCnProduct,
  normalizeCnProduct,
} from './cn-product-policy.mjs';

export function normalizeCnProductList(products: string[]): string[] {
  return [
    ...new Set(
      products
        .map(normalizeCnProduct)
        .filter((product) => !isExcludedCnProduct(product)),
    ),
  ];
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
