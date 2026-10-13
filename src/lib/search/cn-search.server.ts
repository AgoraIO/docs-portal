import {
  getCnProductAliases,
  isExcludedCnProduct,
  normalizeCnProduct,
  normalizeCnProductFacets,
  normalizeCnProductList,
} from './cn-products';
import {
  type CnSearchPageResponse,
  cleanSearchSnippet,
  groupSearchSections,
  isPublicCnSearchUrl,
  type SearchFacets,
} from './cn-search-page';
import {
  type MeilisearchClientConfig,
  normalizeMeilisearchHit,
  normalizeMeilisearchQuery,
  type SearchHit,
} from './meilisearch-client';
import { SEARCH_PAGE_SIZE, type SearchPageState } from './search-page-state';

export type CnSearchQuery = SearchPageState & { tab?: string };

type EngineResponse = {
  hits: Parameters<typeof normalizeMeilisearchHit>[0][];
  totalHits: number;
  totalPages: number;
  page: number;
  facetDistribution?: SearchFacets;
};

export async function queryCnSearch(
  config: MeilisearchClientConfig,
  state: CnSearchQuery,
  signal?: AbortSignal,
): Promise<CnSearchPageResponse> {
  const filter = ['locale = "zh-CN"', 'hidden = false', 'status = "published"'];
  for (const field of ['product', 'platform', 'version', 'tab'] as const) {
    if (state[field]) {
      const value = JSON.stringify(state[field]);
      filter.push(
        field === 'product'
          ? buildProductFilter(state[field])
          : `${field} = ${value}`,
      );
    }
  }
  if (state.type !== 'all')
    filter.push(`docType = ${JSON.stringify(state.type)}`);
  const response = await fetch(
    `${config.host.replace(/\/$/, '')}/indexes/${encodeURIComponent(config.indexUid)}/search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.searchOnlyKey}`,
        'Content-Type': 'application/json',
      },
      signal,
      body: JSON.stringify({
        q: normalizeMeilisearchQuery(state.q),
        filter: filter.join(' AND '),
        page: state.page,
        hitsPerPage: SEARCH_PAGE_SIZE,
        facets: ['products', 'platform', 'version', 'docType'],
        attributesToHighlight: ['sectionTitle', 'content'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        attributesToCrop: ['content'],
        cropLength: 65,
      }),
    },
  );
  if (!response.ok)
    throw new Error(`Search unavailable (HTTP ${response.status})`);
  const result = (await response.json()) as EngineResponse;
  if (
    !Array.isArray(result.hits) ||
    !Number.isSafeInteger(result.totalHits) ||
    !Number.isSafeInteger(result.totalPages) ||
    !Number.isSafeInteger(result.page)
  ) {
    throw new Error('Invalid search response');
  }
  const publicHits = result.hits
    .filter(
      (hit) =>
        hit.locale === 'zh-CN' &&
        hit.hidden === false &&
        hit.status === 'published' &&
        isPublicCnSearchUrl(hit.url),
    )
    .map((hit) =>
      normalizeMeilisearchHit({
        ...hit,
        _formatted: {
          ...hit._formatted,
          content: cleanSearchSnippet(hit._formatted?.content ?? hit.content),
        },
      }),
    );
  const normalizedHits = publicHits.flatMap((hit) => {
    const products = normalizeCnProductList(
      hit.products ?? (hit.product ? [hit.product] : []),
    );
    if (products.length === 0) return [];
    const product =
      hit.product && !isExcludedCnProduct(hit.product)
        ? normalizeCnProduct(hit.product)
        : products[0];
    return [{ ...hit, product, products } satisfies SearchHit];
  });
  const facets = result.facetDistribution
    ? Object.fromEntries(
        Object.entries(result.facetDistribution).map(([key, values]) => [
          key === 'products' ? 'product' : key,
          key === 'products' || key === 'product'
            ? normalizeCnProductFacets(values)
            : values,
        ]),
      )
    : {};
  return {
    groups: groupSearchSections(normalizedHits, {
      platformFiltered: Boolean(state.platform),
      selectedPlatform: state.platform,
    }),
    totalHits: result.totalHits,
    totalPages: Math.min(result.totalPages, 500),
    page: result.page,
    facets,
  };
}

function buildProductFilter(product: string) {
  const clauses = getCnProductAliases(product).flatMap((value) => [
    `product = ${JSON.stringify(value)}`,
    `products = ${JSON.stringify(value)}`,
  ]);
  return `(${clauses.join(' OR ')})`;
}
