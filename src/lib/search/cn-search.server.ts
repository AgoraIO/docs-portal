import {
  getCnProductAliases,
  isExcludedCnProduct,
  normalizeCnProduct,
  normalizeCnProductFacets,
  normalizeCnProductList,
} from './cn-products';
import {
  type CnSearchFamily,
  cnSearchFamilies,
  getCnSearchFamily,
} from './cn-search-family';
import {
  getCnGuideIdentifier,
  getCnSearchFamilyOrder,
  resolveCnSearchQuery,
  resolveCnSearchTask,
} from './cn-search-intent';
import {
  type CnSearchPageResponse,
  cleanSearchSnippet,
  groupSearchSections,
  isPublicCnSearchUrl,
  type SearchFacets,
} from './cn-search-page';
import { cnExactProductAcronyms } from './cn-search-strategy';
import {
  getCnSearchLanguageTerms,
  getCnSearchNavigationLanguage,
} from './cn-search-terms';
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
  const intent = resolveCnSearchQuery(
    normalizeMeilisearchQuery(state.q),
    state.platform,
  );
  const platform = intent.platform;
  const task = resolveCnSearchTask(intent.query, state.product);
  const languageQuery = getCnSearchLanguageTerms(state.q).length > 0;
  const navigationLanguage = getCnSearchNavigationLanguage(state.q);
  const filter = ['locale = "zh-CN"', 'hidden = false', 'status = "published"'];
  // The index deduplicates equivalent sections before pagination. Every platform
  // must remain searchable here, including content absent on the default one.
  for (const field of ['product', 'platform', 'tab'] as const) {
    const selected =
      field === 'platform'
        ? platform
        : field === 'product'
          ? task.product
          : state[field];
    if (selected) {
      const value = JSON.stringify(selected);
      if (field === 'product') filter.push(buildProductFilter(selected));
      else if (field === 'platform') {
        const exact = ['restful', 'restful-api'].includes(selected)
          ? 'platform = "restful" OR platform = "restful-api"'
          : `platform = ${value}`;
        // A language-qualified SDK search needs explicit applicability. Other
        // searches retain shared setup/billing guides until their metadata is audited.
        filter.push(
          languageQuery
            ? navigationLanguage &&
              ((selected === 'csharp' && navigationLanguage === 'csharp') ||
                (selected === 'cpp' && navigationLanguage === 'cplusplus'))
              ? `(${exact} OR languageEntryTerms = ${JSON.stringify(navigationLanguage)})`
              : `(${exact})`
            : `(${exact} OR platform NOT EXISTS OR platform IS EMPTY)`,
        );
      } else filter.push(`${field} = ${value}`);
    }
  }
  const query = task.query;
  const codeObfuscation = query === '代码混淆';
  // The derived alias identifies the technical meaning. Search the original
  // word within those sections so snippets also locate 代码被混淆 / 字段混淆.
  if (codeObfuscation) filter.push('aliases = "代码混淆"');
  const identifier = getCnGuideIdentifier(query);
  const acronym = cnExactProductAcronyms.includes(query.toLowerCase());
  const overview = state.type === 'all' && query.length > 0;
  const familyFilter = (family: CnSearchFamily) => `searchFamily = "${family}"`;
  const makeQuery = (family?: CnSearchFamily) => ({
    ...(task.quickStart && family === 'docs'
      ? { distinct: 'canonicalUrl' }
      : {}),
    q: codeObfuscation
      ? '混淆'
      : acronym
        ? `"${query}"`
        : family === 'docs' && identifier
          ? `"${identifier}"`
          : query,
    matchingStrategy: 'all',
    filter: [
      ...filter,
      ...(family ? [familyFilter(family)] : []),
      ...(task.quickStart && family === 'docs'
        ? ['taskKinds = "quick-start"']
        : []),
    ].join(' AND '),
    page: state.page,
    hitsPerPage: overview ? 5 : SEARCH_PAGE_SIZE,
    facets: ['products', 'platform', 'version', 'docType'],
    attributesToHighlight: ['sectionTitle', 'content', 'summary'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['content', 'summary'],
    cropLength: 65,
    ...(navigationLanguage ? { sort: ['languageEntryRank:asc'] } : {}),
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
              queries: cnSearchFamilies.map((family) => ({
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
    (overview && responses.length !== cnSearchFamilies.length) ||
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
  // A complete symbol (audioScenario) is more specific than a longer helper
  // name (AudioScenarioAPI). Keep prefix discovery if no guide has that symbol.
  const docsIndex = overview
    ? cnSearchFamilies.indexOf('docs')
    : state.type === 'docs'
      ? 0
      : -1;
  if (
    identifier &&
    !acronym &&
    docsIndex >= 0 &&
    responses[docsIndex].totalHits === 0
  ) {
    const fallback = await fetch(
      `${host}/indexes/${encodeURIComponent(config.indexUid)}/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.searchOnlyKey}`,
          'Content-Type': 'application/json',
        },
        signal,
        body: JSON.stringify({ ...makeQuery('docs'), q: query }),
      },
    );
    if (!fallback.ok)
      throw new Error(`Search unavailable (HTTP ${fallback.status})`);
    const item: EngineResponse = await fallback.json();
    if (
      !Array.isArray(item?.hits) ||
      !Number.isSafeInteger(item.totalHits) ||
      !Number.isSafeInteger(item.totalPages) ||
      !Number.isSafeInteger(item.page)
    )
      throw new Error('Invalid search response');
    responses[docsIndex] = item;
  }
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
          content: cleanSearchSnippet(
            hit.summary?.trim()
              ? (hit._formatted?.summary ?? hit.summary)
              : (hit._formatted?.content ?? hit.content),
          ),
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
  const familyOrder = getCnSearchFamilyOrder(
    query,
    normalizedHits.map((hit) => ({
      family: getCnSearchFamily({ pageUrl: hit.url, docType: hit.docType }),
      title: hit.sectionTitle,
      languageEntryTerms: hit.languageEntryTerms,
      languageEntryRank: hit.languageEntryRank,
    })),
  );
  const groups = groupSearchSections(normalizedHits, {
    platformFiltered: Boolean(platform) || Boolean(navigationLanguage),
    selectedPlatform: platform,
  });
  if (overview)
    groups.sort(
      (a, b) =>
        familyOrder.indexOf(getCnSearchFamily(a)) -
        familyOrder.indexOf(getCnSearchFamily(b)),
    );
  return {
    groups,
    totalHits: result.totalHits,
    totalPages: Math.min(result.totalPages, 500),
    page: result.page,
    facets,
    ...(overview
      ? {
          familyTotalHits: {
            docs: responses[0].totalHits,
            api: responses[1].totalHits,
            faq: responses[2].totalHits,
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
