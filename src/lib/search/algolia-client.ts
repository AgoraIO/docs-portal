import { liteClient } from 'algoliasearch/lite';
import type { SearchClient } from 'fumadocs-core/search/client';
import {
  getApiIdentityMatch,
  getApiRetrievalQuery,
  parseApiQueryIdentity,
} from './api-query-identity';
import {
  admitApiHit,
  aggregateApiResults,
  normalizeApiHit,
} from './api-result-normalizer';
import { classifySearchIntent, getDocsRetrievalQuery } from './search-intent';
import {
  normalizeSearchPlatform,
  normalizeSearchText,
  stripSearchMarks,
} from './search-normalization';
import type { DocsSearchScope } from './search-provider';
import type { FederatedSearchResult, SearchRecordKind } from './search-result';
import {
  allSearchTermsMatch,
  getRequiredApiTaskTerms,
} from './search-term-matching';

export type AlgoliaSearchFilters = {
  platform?: string;
};

type AlgoliaDocsHit = Record<string, unknown> & {
  objectID: string;
};

export type AlgoliaSearchStatus = {
  docs: 'success' | 'error';
  api: 'not-requested' | 'success' | 'error';
};

export type AlgoliaDocsClient = SearchClient & {
  getLastStatus: () => AlgoliaSearchStatus;
};

export function createAlgoliaDocsClient({
  apiReferenceIndexName,
  appId,
  indexName,
  locale,
  platform,
  rankingV2 = false,
  scope,
  searchApiKey,
}: {
  apiReferenceIndexName?: string;
  appId: string;
  indexName: string;
  locale: string;
  platform?: string;
  rankingV2?: boolean;
  // Product/tab scope derived from the docs navigation.
  scope?: DocsSearchScope;
  searchApiKey: string;
}): AlgoliaDocsClient {
  const client = liteClient(appId, searchApiKey);
  let lastStatus: AlgoliaSearchStatus = {
    api: 'not-requested',
    docs: 'success',
  };
  let latestSearchSequence = 0;

  return {
    deps: [
      appId,
      indexName,
      apiReferenceIndexName,
      locale,
      platform,
      rankingV2,
      scope,
      searchApiKey,
    ],
    getLastStatus() {
      return lastStatus;
    },
    async search(query) {
      const searchSequence = latestSearchSequence + 1;
      latestSearchSequence = searchSequence;
      const updateLastStatus = (status: AlgoliaSearchStatus) => {
        if (searchSequence === latestSearchSequence) {
          lastStatus = status;
        }
      };
      if (query.trim().length === 0) {
        updateLastStatus({ api: 'not-requested', docs: 'success' });
        return [];
      }

      if (rankingV2) {
        const searchResult = await searchWithRankingV2({
          apiReferenceIndexName,
          client,
          indexName,
          locale,
          platform,
          query,
          scope,
          setStatus: updateLastStatus,
        });
        return searchResult;
      }

      try {
        const result = await client.searchForHits({
          requests: [
            {
              type: 'default',
              indexName,
              query,
              // One result per page: a page's best-matching section, never the
              // same page repeated for each matching heading.
              distinct: 1,
              minWordSizefor1Typo: 5,
              typoTolerance: 'min' as const,
              filters: buildFilters({ locale, platform, scope }),
              // Demote low-signal pages so real docs rank above them. Boosting
              // via optionalFilters keeps Algolia's textual relevance intact and
              // only nudges by category: normal docs (+2) and deprecated (+1)
              // outrank glossary (no boost), which otherwise floods every query.
              optionalFilters: [
                'category:default<score=2>',
                'category:deprecated<score=1>',
              ],
              hitsPerPage: 10,
              attributesToHighlight: ['title', 'section', 'content'],
              attributesToSnippet: ['content:25', 'section:20'],
              snippetEllipsisText: '…',
              attributesToRetrieve: [
                'objectID',
                'title',
                'description',
                'section',
                'content',
                'url',
                'section_id',
                'breadcrumbs',
                'locale',
                'product',
                'platform',
                'tab',
                'objectType',
                'category',
              ],
              highlightPostTag: '</mark>',
              highlightPreTag: '<mark>',
            },
            ...(apiReferenceIndexName && supportsApiReferenceScope(scope)
              ? [
                  {
                    type: 'default' as const,
                    indexName: apiReferenceIndexName,
                    query,
                    minWordSizefor1Typo: 5,
                    typoTolerance: 'min' as const,
                    filters: buildApiReferenceFilters({ platform, scope }),
                    hitsPerPage: 5,
                    attributesToHighlight: ['hierarchy.lvl1', 'content'],
                    attributesToSnippet: ['content:25'],
                    snippetEllipsisText: '…',
                    attributesToRetrieve: [
                      'objectID',
                      'url',
                      'content',
                      'product',
                      'platform',
                      'version',
                      'hierarchy',
                    ],
                    highlightPostTag: '</mark>',
                    highlightPreTag: '<mark>',
                  },
                ]
              : []),
          ],
        });

        updateLastStatus({
          api:
            apiReferenceIndexName && supportsApiReferenceScope(scope)
              ? 'success'
              : 'not-requested',
          docs: 'success',
        });

        const entries = [];
        const seenResultKeys = new Set<string>();

        const apiResult = result.results[1];
        if (apiResult) {
          for (const hit of apiResult.hits as AlgoliaDocsHit[]) {
            const url = getString(hit.url) ?? '';
            const plainTitle = getHierarchyValue(hit, 'lvl1') ?? url;
            const highlightedTitle =
              getNestedHighlight(hit, 'hierarchy', 'lvl1') ?? plainTitle;
            const container = getApiReferenceContainer(url, plainTitle);
            const title = container
              ? `${container} › ${highlightedTitle}`
              : highlightedTitle;
            const resultUrl = getApiReferenceResultUrl(
              url,
              plainTitle,
              container,
            );
            const identity = `${resultUrl}#${getString(hit.objectID) ?? title}`;

            if (seenResultKeys.has(identity)) {
              continue;
            }

            seenResultKeys.add(identity);
            entries.push({
              content: title,
              id: getString(hit.objectID) ?? identity,
              objectType: 'sdk-api',
              path: getApiReferencePath(hit),
              platform: toStringArray(hit.platform)?.map(
                normalizeSearchPlatform,
              ),
              product: getString(hit.product),
              snippet:
                getSnippet(hit, 'content') ??
                getHighlight(hit, 'content') ??
                getString(hit.content),
              title,
              type: 'page' as const,
              url: resultUrl,
              version: getString(hit.version),
            });
          }
        }

        for (const hit of result.results[0].hits as AlgoliaDocsHit[]) {
          const sectionId =
            typeof hit.section_id === 'string' ? hit.section_id : undefined;
          const url = typeof hit.url === 'string' ? hit.url : '';
          const section = getString(hit.section);
          const resultUrl = sectionId ? `${url}#${sectionId}` : url;

          if (seenResultKeys.has(resultUrl)) {
            continue;
          }

          seenResultKeys.add(resultUrl);

          entries.push({
            breadcrumbs: getStringArray(hit.breadcrumbs),
            content: getHighlight(hit, 'title') ?? getString(hit.title) ?? url,
            id: getString(hit.objectID) ?? `${url}#${sectionId ?? ''}`,
            objectType: getString(hit.objectType),
            path: getStringArray(hit.breadcrumbs) ?? [],
            platform: getStringArray(hit.platform),
            product: getString(hit.product),
            section: getHighlight(hit, 'section') ?? section,
            snippet:
              (isMatched(hit, 'content')
                ? getSnippet(hit, 'content')
                : undefined) ??
              (isMatched(hit, 'section')
                ? getSnippet(hit, 'section')
                : undefined) ??
              getString(hit.description) ??
              getSnippet(hit, 'content') ??
              getString(hit.content),
            tab: getString(hit.tab),
            title: getHighlight(hit, 'title') ?? getString(hit.title),
            type: 'page' as const,
            url: resultUrl,
          });
        }

        // API references are grouped before docs, while each index keeps the
        // ranking Algolia returned. No client-side sorting can disturb relevance
        // within either result family.
        return entries;
      } catch (error) {
        updateLastStatus({
          api:
            apiReferenceIndexName && supportsApiReferenceScope(scope)
              ? 'error'
              : 'not-requested',
          docs: 'error',
        });
        throw error;
      }
    },
  };
}

type FederatedUiSearchResult = FederatedSearchResult & {
  breadcrumbs?: string[];
  content: string;
  objectType?: string;
  section?: string;
  tab?: string;
  type: 'page';
};

type RankingV2SearchInput = {
  apiReferenceIndexName?: string;
  client: ReturnType<typeof liteClient>;
  indexName: string;
  locale: string;
  platform?: string;
  query: string;
  scope?: DocsSearchScope;
  setStatus: (status: AlgoliaSearchStatus) => void;
};

async function searchWithRankingV2({
  apiReferenceIndexName,
  client,
  indexName,
  locale,
  platform,
  query,
  scope,
  setStatus,
}: RankingV2SearchInput): Promise<FederatedUiSearchResult[]> {
  const intent = classifySearchIntent(query);
  const apiIdentity = parseApiQueryIdentity(query);
  const apiScopeSelected = isExplicitApiReferenceScope(scope);
  const canSearchApi = Boolean(
    apiReferenceIndexName && supportsApiReferenceScope(scope),
  );
  const retrievalQuery = intent.matchedPhrase ?? query;
  const apiRequested = canSearchApi ? apiReferenceIndexName : undefined;
  const docsRequest = buildDocsSearchRequest({
    indexName,
    locale,
    platform,
    query: getDocsRetrievalQuery(retrievalQuery),
    scope,
  });
  const apiRequest = apiRequested
    ? buildApiSearchRequest({
        apiReferenceIndexName: apiRequested,
        platform,
        query: getApiRetrievalQuery(retrievalQuery),
        scope,
      })
    : undefined;
  let searchResponse: unknown;
  let multiRequestRejected = false;
  try {
    searchResponse = await client.searchForHits({
      requests: [docsRequest, ...(apiRequest ? [apiRequest] : [])],
    });
  } catch (error) {
    if (!apiRequest) {
      setStatus({ api: 'not-requested', docs: 'error' });
      throw error;
    }

    multiRequestRejected = true;
    try {
      searchResponse = await client.searchForHits({ requests: [docsRequest] });
    } catch (docsError) {
      setStatus({ api: 'error', docs: 'error' });
      throw docsError;
    }
  }

  const docsResult = getResultAt(searchResponse, 0);
  const docsHits = getResultHits(docsResult);
  const docsSucceeded = docsHits !== undefined;
  let apiResult =
    apiRequest && !multiRequestRejected
      ? getResultAt(searchResponse, 1)
      : undefined;
  let apiHits = getResultHits(apiResult);
  if (
    docsSucceeded &&
    apiRequest &&
    !multiRequestRejected &&
    apiHits === undefined
  ) {
    try {
      const retryResponse = await client.searchForHits({
        requests: [apiRequest],
      });
      apiResult = getResultAt(retryResponse, 0);
      apiHits = getResultHits(apiResult);
    } catch {
      apiResult = undefined;
      apiHits = undefined;
    }
  }
  const apiSucceeded = apiHits !== undefined;
  if (!docsSucceeded) {
    setStatus({
      api: apiRequest ? (apiSucceeded ? 'success' : 'error') : 'not-requested',
      docs: 'error',
    });
    throw new Error(getString(docsResult?.error) ?? 'Docs search failed');
  }

  setStatus({
    api: !apiRequest
      ? 'not-requested'
      : multiRequestRejected
        ? 'error'
        : apiSucceeded
          ? 'success'
          : 'error',
    docs: 'success',
  });

  const docsCandidates = (docsHits ?? []).flatMap((hit) => {
    const candidate = mapDocsHitForFederatedSearch(hit, intent, apiSucceeded);
    return candidate ? [candidate] : [];
  });
  const normalizedApiEntries = (apiHits ?? []).flatMap((hit) => {
    const normalized = normalizeApiHit(hit, intent);
    const exactMatch = normalized
      ? getApiIdentityMatch(getApiIdentityFields(normalized), apiIdentity)
      : undefined;
    if (
      !normalized ||
      (!admitApiHit(normalized, intent, apiScopeSelected) &&
        !exactMatch?.titleExactMatch &&
        !exactMatch?.aliasesExactMatch)
    ) {
      return [];
    }
    return [{ hit, normalized }];
  });
  const apiHitByResultId = new Map(
    normalizedApiEntries.map(({ hit, normalized }) => [normalized.id, hit]),
  );
  const apiCandidates = aggregateApiResults(
    normalizedApiEntries.map(({ normalized }) => normalized),
    platform,
  ).map((result): FederatedUiSearchResult => {
    const allMajorTermsMatch = allTermsMatch(
      [result.displayTitle, result.symbol],
      intent.majorTerms,
    );
    const representativeHit = apiHitByResultId.get(result.id);
    const highlightedTitle = getApiHighlightedTitle(
      representativeHit,
      result.displayTitle,
      result.symbol,
    );
    const highlightedSnippet = isRecord(representativeHit)
      ? getSnippet(representativeHit, 'content')
      : undefined;
    const exactMatch = getApiIdentityMatch(
      getApiIdentityFields(result),
      apiIdentity,
    );
    return {
      ...exactMatch,
      allMajorTermsMatch,
      canonicalKey: result.canonicalKey,
      content: highlightedTitle,
      contentMatch: result.contentMatch,
      currentVersion: result.isCurrentVersion,
      id: result.id,
      intentMatch:
        result.symbolMatch || result.titleMatch || allMajorTermsMatch,
      objectType: 'sdk-api',
      path: result.path,
      platform: result.platforms,
      platformUrls: result.platformUrls,
      product: result.product,
      recordKind: 'sdk-symbol',
      sectionMatch: false,
      snippet: highlightedSnippet ?? result.snippet,
      title: highlightedTitle,
      titleMatch: result.titleMatch || result.symbolMatch,
      type: 'page',
      url: result.url,
      version: result.version,
    };
  });

  const apiFirst =
    apiScopeSelected ||
    apiCandidates.some(
      ({ aliasesExactMatch, titleExactMatch }) =>
        titleExactMatch || aliasesExactMatch,
    );
  const docsSection = docsCandidates.slice(0, 10);
  const apiSection = apiCandidates.slice(0, 10);
  return apiFirst
    ? [...apiSection, ...docsSection]
    : [...docsSection, ...apiSection];
}

function getApiIdentityFields(result: {
  displayTitle: string;
  namespace?: string;
  symbol: string;
}) {
  return [
    result.displayTitle,
    result.symbol,
    result.namespace ? `${result.namespace}.${result.symbol}` : undefined,
  ];
}

function getApiHighlightedTitle(
  hit: unknown,
  displayTitle: string,
  symbol: string,
) {
  if (!isRecord(hit)) return displayTitle;
  const highlighted =
    getNestedHighlight(hit, 'hierarchy', 'lvl2') ??
    getNestedHighlight(hit, 'hierarchy', 'lvl1') ??
    getHighlight(hit, 'title');
  if (!highlighted) return displayTitle;

  const plainHighlighted = stripSearchMarks(highlighted);
  if (
    normalizeSearchText(plainHighlighted) === normalizeSearchText(displayTitle)
  ) {
    return highlighted;
  }
  if (
    normalizeSearchText(plainHighlighted) === normalizeSearchText(symbol) &&
    displayTitle.includes(symbol)
  ) {
    return displayTitle.replace(symbol, highlighted);
  }
  return displayTitle;
}

function buildDocsSearchRequest({
  indexName,
  locale,
  platform,
  query,
  scope,
}: {
  indexName: string;
  locale: string;
  platform?: string;
  query: string;
  scope?: DocsSearchScope;
}) {
  return {
    type: 'default' as const,
    indexName,
    query,
    distinct: 1,
    minWordSizefor1Typo: 5,
    typoTolerance: 'min' as const,
    filters: buildFilters({ locale, platform, scope }),
    optionalFilters: [
      'category:default<score=2>',
      'category:deprecated<score=1>',
    ],
    hitsPerPage: 10,
    attributesToHighlight: ['title', 'section', 'content'],
    attributesToSnippet: ['content:25', 'section:20'],
    snippetEllipsisText: '…',
    attributesToRetrieve: [
      'objectID',
      'title',
      'description',
      'section',
      'content',
      'url',
      'section_id',
      'breadcrumbs',
      'locale',
      'product',
      'platform',
      'tab',
      'objectType',
      'category',
    ],
    highlightPostTag: '</mark>',
    highlightPreTag: '<mark>',
  };
}

function buildApiSearchRequest({
  apiReferenceIndexName,
  platform,
  query,
  scope,
}: {
  apiReferenceIndexName: string;
  platform?: string;
  query: string;
  scope?: DocsSearchScope;
}) {
  return {
    type: 'default' as const,
    indexName: apiReferenceIndexName,
    query,
    filters: buildApiReferenceFilters({ platform, scope }),
    typoTolerance: false as const,
    queryType: 'prefixAll' as const,
    removeWordsIfNoResults: 'none' as const,
    hitsPerPage: 20,
    attributesToHighlight: ['hierarchy.lvl1', 'hierarchy.lvl2', 'content'],
    attributesToSnippet: ['content:25'],
    snippetEllipsisText: '…',
    attributesToRetrieve: [
      'objectID',
      'url',
      'content',
      'product',
      'platform',
      'version',
      'hierarchy',
      'title',
      'symbol',
      'operation',
      'name',
      'memberName',
      'memberKind',
      'kind',
      'namespace',
      'className',
      'isCurrentVersion',
      'current',
    ],
    highlightPostTag: '</mark>',
    highlightPreTag: '<mark>',
  };
}

function getResultAt(value: unknown, index: number) {
  if (!isRecord(value) || !Array.isArray(value.results)) return undefined;
  const result = value.results[index];
  return isRecord(result) ? result : undefined;
}

function getResultHits(result: Record<string, unknown> | undefined) {
  return result && Array.isArray(result.hits) ? result.hits : undefined;
}

function mapDocsHitForFederatedSearch(
  rawHit: unknown,
  intent: ReturnType<typeof classifySearchIntent>,
  enforceApiTaskTitleGate: boolean,
): FederatedUiSearchResult | undefined {
  if (!isRecord(rawHit)) return undefined;
  const hit = rawHit as AlgoliaDocsHit;
  const url = getString(hit.url) ?? '';
  if (!url) return undefined;
  const sectionId = getString(hit.section_id);
  const resultUrl = sectionId ? `${url}#${sectionId}` : url;
  const plainTitle = getString(hit.title) ?? url;
  const title = getHighlight(hit, 'title') ?? plainTitle;
  const plainSection = getString(hit.section);
  const section = getHighlight(hit, 'section') ?? plainSection;
  const plainContent = getString(hit.content);
  const description = getString(hit.description);
  const breadcrumbs = getStringArray(hit.breadcrumbs) ?? [];
  const searchableFields = [
    plainTitle,
    plainSection,
    plainContent,
    description,
    ...breadcrumbs,
  ];
  const allMajorTermsMatch = allTermsMatch(searchableFields, intent.majorTerms);
  const titleMatch =
    isMatched(hit, 'title') || anyTermMatches([plainTitle], intent.majorTerms);
  const sectionMatch =
    isMatched(hit, 'section') ||
    anyTermMatches([plainSection], intent.majorTerms);
  const contentMatch =
    isMatched(hit, 'content') ||
    anyTermMatches([plainContent, description], intent.majorTerms);
  const recordKind = getDocsRecordKind(hit, url, breadcrumbs);
  const titleExactMatch =
    normalizeSearchText(plainTitle) === intent.normalizedQuery;
  const apiTaskFields = [
    plainTitle,
    plainSection,
    ...breadcrumbs,
    url.includes('/api-reference/api-ref/') ? 'REST API' : undefined,
  ];
  const apiTaskTerms = getRequiredApiTaskTerms(intent, { source: 'docs' });
  const allApiTaskTermsMatch = allTermsMatch(apiTaskFields, apiTaskTerms);
  const apiTaskTitleOrSectionSignal = anyTermMatches(
    [plainTitle, plainSection],
    apiTaskTerms,
  );

  if (
    enforceApiTaskTitleGate &&
    intent.intent === 'api-task' &&
    (!allApiTaskTermsMatch || !apiTaskTitleOrSectionSignal)
  ) {
    return undefined;
  }

  return {
    allMajorTermsMatch,
    breadcrumbs,
    category: getDocsCategory(hit.category),
    content: title,
    contentMatch,
    id: getString(hit.objectID) ?? `${url}#${sectionId ?? ''}`,
    intentMatch:
      allMajorTermsMatch || titleMatch || sectionMatch || contentMatch,
    objectType: getString(hit.objectType),
    path: breadcrumbs,
    platform: getStringArray(hit.platform),
    product: getString(hit.product),
    recordKind,
    section,
    sectionMatch,
    snippet:
      (isMatched(hit, 'content') ? getSnippet(hit, 'content') : undefined) ??
      (isMatched(hit, 'section') ? getSnippet(hit, 'section') : undefined) ??
      description ??
      getSnippet(hit, 'content') ??
      plainContent,
    tab: getString(hit.tab),
    title,
    titleExactMatch,
    titleMatch,
    type: 'page',
    url: resultUrl,
  };
}

function getDocsRecordKind(
  hit: Record<string, unknown>,
  url: string,
  breadcrumbs: string[],
): SearchRecordKind {
  if (getString(hit.objectType) === 'openapi') return 'rest-api';
  const context = [url, ...breadcrumbs].join(' ').toLowerCase();
  return /(?:^|[\s/-])(?:faq|support|troubleshoot(?:ing)?)(?:$|[\s/-])/u.test(
    context,
  )
    ? 'faq'
    : 'guide';
}

function getDocsCategory(value: unknown): FederatedSearchResult['category'] {
  return value === 'deprecated' || value === 'glossary' ? value : 'default';
}

function allTermsMatch(fields: Array<string | undefined>, terms: string[]) {
  return allSearchTermsMatch(fields, terms);
}

function anyTermMatches(fields: Array<string | undefined>, terms: string[]) {
  return terms.some((term) => allTermsMatch(fields, [term]));
}

function isExplicitApiReferenceScope(scope?: DocsSearchScope) {
  return scope?.field === 'tab' && scope.value === 'api-reference';
}

function buildFilters({
  locale,
  platform,
  scope,
}: {
  locale: string;
  platform?: string;
  scope?: DocsSearchScope;
}) {
  return [
    `locale:${locale}`,
    platform ? `platform:${platform}` : undefined,
    scope ? `${scope.field}:"${scope.value}"` : undefined,
  ]
    .filter(Boolean)
    .join(' AND ');
}

const API_REFERENCE_PRODUCTS_BY_DOCS_PRODUCT: Record<string, string[]> = {
  'flexible-classroom': ['flexible-classroom-sdk'],
  im: ['chat-sdk'],
  iot: ['iot-sdk'],
  'on-premise-recording': ['on-premise-recording-sdk'],
  rtc: ['video-sdk', 'voice-sdk'],
  'rtc-server-sdk': ['server-gateway-sdk'],
  rtm: ['signaling-sdk'],
  video: ['video-sdk'],
  voice: ['voice-sdk'],
  whiteboard: ['interactive-whiteboard-sdk'],
};

const API_REFERENCE_PLATFORMS_BY_PORTAL_PLATFORM: Record<string, string[]> = {
  javascript: ['reactjs'],
  unreal: ['unreal-engine'],
  windows: ['windows', 'windows-csharp', 'windows-cpp'],
};

function supportsApiReferenceScope(scope?: DocsSearchScope) {
  return (
    !scope ||
    (scope.field === 'tab' && scope.value === 'api-reference') ||
    (scope.field === 'product' &&
      API_REFERENCE_PRODUCTS_BY_DOCS_PRODUCT[scope.value] !== undefined)
  );
}

function buildApiReferenceFilters({
  platform,
  scope,
}: {
  platform?: string;
  scope?: DocsSearchScope;
}) {
  const apiProducts =
    scope?.field === 'product'
      ? API_REFERENCE_PRODUCTS_BY_DOCS_PRODUCT[scope.value]
      : undefined;
  const apiPlatforms = platform
    ? (API_REFERENCE_PLATFORMS_BY_PORTAL_PLATFORM[platform] ?? [platform])
    : undefined;

  return [
    apiPlatforms
      ? buildFacetFilter('platform', apiPlatforms, false)
      : undefined,
    apiProducts ? buildFacetFilter('product', apiProducts, true) : undefined,
  ]
    .filter(Boolean)
    .join(' AND ');
}

function buildFacetFilter(field: string, values: string[], quote: boolean) {
  const filters = values.map(
    (value) => `${field}:${quote ? `"${value}"` : value}`,
  );

  return filters.length === 1 ? filters[0] : `(${filters.join(' OR ')})`;
}

function getApiReferencePath(hit: Record<string, unknown>) {
  const value = getHierarchyValue(hit, 'lvl0');

  return value
    ? value
        .split('❯')
        .map((segment) => normalizeApiReferencePathSegment(segment.trim()))
        .filter(Boolean)
    : [];
}

function normalizeApiReferencePathSegment(segment: string) {
  return segment.replace(/\bApi\b/g, 'API').replace(/\bSdk\b/g, 'SDK');
}

const API_REFERENCE_PAGE_KIND_PATTERN =
  /^(Class|Enumeration|Interface|Namespace|Type)\s/i;

function getApiReferenceContainer(url: string, title: string) {
  if (API_REFERENCE_PAGE_KIND_PATTERN.test(title)) {
    return undefined;
  }

  try {
    const { pathname } = new URL(url);
    if (!pathname.includes('/interfaces/')) {
      return undefined;
    }

    const basename = pathname
      .split('/')
      .at(-1)
      ?.replace(/\.html$/, '');
    if (
      !basename ||
      title.length <= basename.length ||
      !title.toLowerCase().endsWith(basename.toLowerCase())
    ) {
      return undefined;
    }

    return title.slice(-basename.length);
  } catch {
    return undefined;
  }
}

function getApiReferenceResultUrl(
  url: string,
  title: string,
  container?: string,
) {
  if (!container) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hash) {
      parsedUrl.hash = title.toLowerCase();
    }
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function getHierarchyValue(hit: Record<string, unknown>, key: string) {
  return isRecord(hit.hierarchy) ? getString(hit.hierarchy[key]) : undefined;
}

function isMatched(hit: Record<string, unknown>, key: string) {
  const highlight = hit._highlightResult;

  if (!isRecord(highlight)) {
    return false;
  }

  const value = highlight[key];

  return (
    isRecord(value) &&
    typeof value.matchLevel === 'string' &&
    value.matchLevel !== 'none'
  );
}

function getHighlight(hit: Record<string, unknown>, key: string) {
  return getMarkedValue(hit._highlightResult, key);
}

function getNestedHighlight(
  hit: Record<string, unknown>,
  parentKey: string,
  key: string,
) {
  const highlight = hit._highlightResult;

  return isRecord(highlight) && isRecord(highlight[parentKey])
    ? getMarkedValue(highlight[parentKey], key)
    : undefined;
}

function getSnippet(hit: Record<string, unknown>, key: string) {
  return getMarkedValue(hit._snippetResult, key);
}

function getMarkedValue(source: unknown, key: string) {
  if (!isRecord(source)) {
    return undefined;
  }

  const value = source[key];

  if (!isRecord(value) || typeof value.value !== 'string') {
    return undefined;
  }

  return value.value;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : undefined;
}

function toStringArray(value: unknown) {
  return typeof value === 'string' ? [value] : getStringArray(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
