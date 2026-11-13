import { getApiReferenceProductSectionId } from './api-reference-navigation';

const CATALOG = '/zh-CN/api-reference/api';
export const API_CATALOG_RETURN_PARAM = 'apiReturn';
const FILTERS = ['product', 'platform', 'apiType'] as const;

export function normalizeApiCatalogReturn(href: unknown): string | undefined {
  if (
    typeof href !== 'string' ||
    href.length > 1600 ||
    !href.startsWith('/') ||
    href.startsWith('//')
  )
    return;
  const url = new URL(href, 'https://docs.invalid');
  if (![CATALOG, '/api-reference/api'].includes(url.pathname)) return;
  for (const [key, value] of url.searchParams) {
    if (
      !FILTERS.includes(key as (typeof FILTERS)[number]) ||
      !/^[a-z0-9-]{1,80}$/i.test(value)
    )
      return;
    if (
      key === 'apiType' &&
      !['all', 'client', 'server', 'restful'].includes(value)
    )
      return;
  }
  if (url.hash && !/^#api-reference-product-[a-z0-9-]+$/i.test(url.hash))
    return;
  return `${CATALOG}${url.search}${url.hash}`;
}

export function readApiCatalogReturn(search: string) {
  return normalizeApiCatalogReturn(
    new URLSearchParams(search).get(API_CATALOG_RETURN_PARAM),
  );
}

export function createApiCatalogReturn(source: URL, productId: string) {
  const url = new URL(CATALOG, source);
  for (const key of FILTERS) {
    const value = source.searchParams.get(key);
    if (value && value !== 'all') url.searchParams.set(key, value);
  }
  url.hash = getApiReferenceProductSectionId(productId);
  return normalizeApiCatalogReturn(`${url.pathname}${url.search}${url.hash}`);
}

export function withApiCatalogReturn(href: string, returnHref: string) {
  const context = normalizeApiCatalogReturn(returnHref);
  if (!context || !/^\/(?:zh-CN\/)?api-reference\//.test(href)) return href;
  const url = new URL(href, 'https://docs.invalid');
  url.searchParams.set(API_CATALOG_RETURN_PARAM, context);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getApiCatalogScope(path: string) {
  const segments = path
    .replace(/^\/zh-CN(?=\/)/, '')
    .split('/')
    .filter(Boolean);
  if (segments[0] !== 'api-reference' || segments.length < 3) return;
  return `/${segments.slice(0, 3).join('/')}`;
}
