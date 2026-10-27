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
  // Filter before pagination so other platform copies cannot consume result slots.
  if (!state.platform) filter.push('isDefaultPlatform = true');
  for (const field of ['product', 'platform', 'tab'] as const) {
    if (state[field]) {
      const value = JSON.stringify(state[field]);
      filter.push(
        field === 'product'
          ? buildProductFilter(state[field])
          : field === 'platform' &&
              ['restful', 'restful-api'].includes(state[field])
            ? '(platform = "restful" OR platform = "restful-api")'
            : `${field} = ${value}`,
      );
    }
  }
  const query = normalizeMeilisearchQuery(state.q);
  const overview = state.type === 'all' && query.length > 0;
  const familyFilter = (family: 'docs' | 'api') =>
    family === 'docs'
      ? 'tab != "api-reference" AND docType = "docs"'
      : '(tab = "api-reference" OR docType = "openapi")';
  const makeQuery = (family?: 'docs' | 'api') => ({
    q: query,
    filter: [...filter, ...(family ? [familyFilter(family)] : [])].join(
      ' AND ',
    ),
    page: state.page,
    hitsPerPage: overview ? 5 : SEARCH_PAGE_SIZE,
    facets: ['products', 'platform', 'version', 'docType'],
    attributesToHighlight: ['sectionTitle', 'content'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['content'],
    cropLength: 65,
  });
  const host = config.host.replace(/\/$/, '');
  const response = await fetch(
    overview
      ? `${host}/multi-search`
      : `${host}/indexes/${encodeURIComponent(config.indexUid)}/search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.searchOnlyKey}`,
        'Content-Type': 'application/json',
      },
      signal,
      body: JSON.stringify(
        overview
          ? {
              queries: (['docs', 'api'] as const).map((family) => ({
                indexUid: config.indexUid,
                ...makeQuery(family),
              })),
            }
          : makeQuery(state.type === 'all' ? undefined : state.type),
      ),
    },
  );
  if (!response.ok)
    throw new Error(`Search unavailable (HTTP ${response.status})`);
  const payload = await response.json();
  const responses: EngineResponse[] = overview ? payload.results : [payload];
  if (
    !Array.isArray(responses) ||
    (overview && responses.length !== 2) ||
    responses.some(
      (item) =>
        !item ||
        !Array.isArray(item.hits) ||
        !Number.isSafeInteger(item.totalHits) ||
        !Number.isSafeInteger(item.totalPages) ||
        !Number.isSafeInteger(item.page),
    )
  )
    throw new Error('Invalid search response');
  const facetDistribution: SearchFacets = {};
  for (const item of responses) {
    for (const [field, values] of Object.entries(
      item.facetDistribution ?? {},
    )) {
      const merged = facetDistribution[field] ?? {};
      facetDistribution[field] = merged;
      for (const [value, count] of Object.entries(values))
        merged[value] = (merged[value] ?? 0) + count;
    }
  }
  const result: EngineResponse = {
    hits: responses.flatMap((item) => item.hits),
    totalHits: responses.reduce((sum, item) => sum + item.totalHits, 0),
    totalPages: Math.max(...responses.map((item) => item.totalPages)),
    page: state.page,
    facetDistribution,
  };
  const publicHits = result.hits
    .filter(
      (hit) =>
        hit.locale === 'zh-CN' &&
        hit.hidden === false &&
        hit.status === 'published' &&
        isPublicCnSearchUrl(hit.url) &&
        (hit.canonicalUrl === undefined ||
          isPublicCnSearchUrl(hit.canonicalUrl)),
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
    ...(overview
      ? {
          familyTotalHits: {
            docs: responses[0].totalHits,
            api: responses[1].totalHits,
          },
        }
      : {}),
  };
}

function buildProductFilter(product: string) {
  const clauses = getCnProductAliases(product).flatMap((value) => [
    `product = ${JSON.stringify(value)}`,
    `products = ${JSON.stringify(value)}`,
  ]);
  return `(${clauses.join(' OR ')})`;
}
