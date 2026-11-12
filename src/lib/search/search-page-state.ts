import { normalizeCnProduct } from './cn-products';
import type { CnSearchFamily } from './cn-search-family';
import {
  isCnSearchPlatform,
  normalizeCnSearchPlatform,
} from './cn-search-platforms';
import type { DocsSearchScope } from './search-provider';

export type SearchPageState = {
  q: string;
  product?: string;
  platform?: string;
  version?: string;
  type: 'all' | CnSearchFamily;
  page: number;
  loaded?: number;
};

export const SEARCH_PAGE_SIZE = 20;
// Bound initial restoration work. Direct page links retain their old meaning;
// an expanded range is at most twenty pages, then the UI starts a new range.
export const SEARCH_MAX_LOADED_PAGES = 20;

export function parseSearchPageState(
  input: Record<string, unknown>,
): SearchPageState {
  const page = Number(input.page);
  const firstPage =
    Number.isSafeInteger(page) && page > 0 ? Math.min(page, 500) : 1;
  const loaded = Number(input.loaded);
  const product = readIdentifier(input.product);
  return {
    q: typeof input.q === 'string' ? input.q.trim().slice(0, 500) : '',
    product:
      product &&
      !['introduction', 'reference', 'api-reference', 'overview'].includes(
        product,
      )
        ? normalizeCnProduct(product)
        : undefined,
    platform:
      typeof input.platform === 'string' && isCnSearchPlatform(input.platform)
        ? normalizeCnSearchPlatform(input.platform)
        : undefined,
    // Retain the field for old callers/links, but current-site search always
    // uses the publication policy rather than a user-selected SDK version.
    version: undefined,
    type:
      input.type === 'docs' || input.type === 'faq'
        ? input.type
        : input.type === 'api' || input.type === 'openapi'
          ? 'api'
          : 'all',
    page: firstPage,
    ...(Number.isSafeInteger(loaded) && loaded > firstPage
      ? {
          loaded: Math.min(
            loaded,
            firstPage + SEARCH_MAX_LOADED_PAGES - 1,
            500,
          ),
        }
      : {}),
  };
}

function readIdentifier(value: unknown) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value)
    ? value
    : undefined;
}

export function buildSearchPageHref(
  locale: string,
  input: Partial<SearchPageState>,
) {
  const state = parseSearchPageState(input);
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.product) params.set('product', state.product);
  if (state.platform) params.set('platform', state.platform);
  if (state.version) params.set('version', state.version);
  if (state.type !== 'all') params.set('type', state.type);
  if (state.page > 1) params.set('page', String(state.page));
  if (state.loaded) params.set('loaded', String(state.loaded));
  return `/${locale}/search${params.size ? `?${params}` : ''}`;
}

export function searchScopeProduct(scope?: DocsSearchScope) {
  if (scope?.field === 'product') return scope.value;
  if (scope?.value === 'ai') return 'conversational-ai';
  return undefined;
}
