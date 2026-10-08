import { isKnownPlatform } from '@/lib/platforms/registry';
import type { DocsSearchScope } from './search-provider';

export type SearchPageState = {
  q: string;
  product?: string;
  platform?: string;
  version?: string;
  type: 'all' | 'docs' | 'openapi';
  page: number;
};

export const SEARCH_PAGE_SIZE = 20;

export function parseSearchPageState(
  input: Record<string, unknown>,
): SearchPageState {
  const page = Number(input.page);
  return {
    q: typeof input.q === 'string' ? input.q.trim().slice(0, 500) : '',
    product: readIdentifier(input.product),
    platform:
      typeof input.platform === 'string' && isKnownPlatform(input.platform)
        ? input.platform
        : undefined,
    version:
      typeof input.version === 'string' && /^[\w.-]{1,80}$/.test(input.version)
        ? input.version
        : undefined,
    type:
      input.type === 'docs' || input.type === 'openapi' ? input.type : 'all',
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 500) : 1,
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
  return `/${locale}/search${params.size ? `?${params}` : ''}`;
}

export function searchScopeProduct(scope?: DocsSearchScope) {
  if (scope?.field === 'product') return scope.value;
  if (scope?.value === 'ai') return 'conversational-ai';
  return undefined;
}
