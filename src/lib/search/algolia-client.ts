import { liteClient } from 'algoliasearch/lite';
import type { SearchClient } from 'fumadocs-core/search/client';
import {
  admitApiHit,
  aggregateApiResults,
  normalizeApiHit,
} from './api-result-normalizer';
import {
  classifySearchIntent,
  getApiRetrievalQuery,
  getDocsRetrievalQuery,
} from './search-intent';
import type { DocsSearchScope } from './search-provider';
import {
  type RankedSearchResult,
  rankSearchResults,
  type SearchRecordKind,
} from './search-ranking';

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
                normalizeApiReferencePlatform,
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

type RankedUiSearchResult = RankedSearchResult & {
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
}: RankingV2SearchInput): Promise<RankedUiSearchResult[]> {
  const intent = classifySearchIntent(query);
  const apiScopeSelected = isExplicitApiReferenceScope(scope);
  const canSearchApi = Boolean(
    apiReferenceIndexName && supportsApiReferenceScope(scope),
  );
  const shouldSearchApiImmediately =
    canSearchApi &&
    (intent.intent === 'api-symbol' ||
      intent.intent === 'api-task' ||
      apiScopeSelected);
  const docsPromise = client.searchForHits({
    requests: [
      buildDocsSearchRequest({
        indexName,
        locale,
        platform,
        query: getDocsRetrievalQuery(query),
        scope,
      }),
    ],
  });
  const apiPromise =
    shouldSearchApiImmediately && apiReferenceIndexName
      ? client.searchForHits({
          requests: [
            buildApiSearchRequest({
              apiReferenceIndexName,
              platform,
              query: getApiRetrievalQuery(query),
              scope,
            }),
          ],
        })
      : undefined;
  const [docsResult, initialApiResult] = await Promise.allSettled([
    docsPromise,
    ...(apiPromise ? [apiPromise] : []),
  ]);

  if (docsResult.status === 'rejected') {
    setStatus({
      api: initialApiResult
        ? initialApiResult.status === 'fulfilled'
          ? 'success'
          : 'error'
        : 'not-requested',
      docs: 'error',
    });
    throw docsResult.reason;
  }

  const docsHits = getFirstResultHits(docsResult.value);
  let apiResult = initialApiResult;
  let apiRequestedAsFallback = false;
  if (
    !apiResult &&
    canSearchApi &&
    apiReferenceIndexName &&
    docsHits.length === 0 &&
    hasExplicitApiSignal(query)
  ) {
    apiRequestedAsFallback = true;
    [apiResult] = await Promise.allSettled([
      client.searchForHits({
        requests: [
          buildApiSearchRequest({
            apiReferenceIndexName,
            platform,
            query: getApiRetrievalQuery(query),
            scope,
          }),
        ],
      }),
    ]);
  }

  setStatus({
    api: apiResult
      ? apiResult.status === 'fulfilled'
        ? 'success'
        : 'error'
      : 'not-requested',
    docs: 'success',
  });

  const docsCandidates = docsHits.flatMap((hit) => {
    const candidate = mapDocsHitForRanking(
      hit,
      intent,
      apiResult?.status === 'fulfilled',
    );
    return candidate ? [candidate] : [];
  });
  const apiHits =
    apiResult?.status === 'fulfilled'
      ? getFirstResultHits(apiResult.value)
      : [];
  const normalizedApiEntries = apiHits.flatMap((hit) => {
    const normalized = normalizeApiHit(hit, intent);
    if (
      !normalized ||
      (!admitApiHit(normalized, intent, apiScopeSelected) &&
        !isStrictApiSignalFallbackMatch(
          normalized,
          intent.terms,
          apiRequestedAsFallback,
        ))
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
  ).map((result): RankedUiSearchResult => {
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
    const compactSymbol = compactSearchText(result.symbol);
    return {
      aliasesExactMatch:
        compactSymbol.length > 0 &&
        compactSymbol === compactSearchText(intent.originalQuery),
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
      product: result.product,
      recordKind: 'sdk-symbol',
      sectionMatch: false,
      snippet: highlightedSnippet ?? result.snippet,
      title: highlightedTitle,
      titleExactMatch: normalizedText(result.symbol) === intent.normalizedQuery,
      titleMatch: result.titleMatch || result.symbolMatch,
      type: 'page',
      url: result.url,
      version: result.version,
    };
  });

  return rankSearchResults(
    [...docsCandidates, ...apiCandidates],
    intent,
    10,
  ) as RankedUiSearchResult[];
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

  const plainHighlighted = stripMarks(highlighted);
  if (normalizedText(plainHighlighted) === normalizedText(displayTitle)) {
    return highlighted;
  }
  if (
    normalizedText(plainHighlighted) === normalizedText(symbol) &&
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

function getFirstResultHits(value: unknown): unknown[] {
  if (!isRecord(value) || !Array.isArray(value.results)) return [];
  const firstResult = value.results[0];
  return isRecord(firstResult) && Array.isArray(firstResult.hits)
    ? firstResult.hits
    : [];
}

function mapDocsHitForRanking(
  rawHit: unknown,
  intent: ReturnType<typeof classifySearchIntent>,
  enforceApiTaskTitleGate: boolean,
): RankedUiSearchResult | undefined {
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
  const titleExactMatch = normalizedText(plainTitle) === intent.normalizedQuery;

  if (
    enforceApiTaskTitleGate &&
    intent.intent === 'api-task' &&
    !titleExactMatch &&
    !titleMatch &&
    !sectionMatch
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

function getDocsCategory(value: unknown): RankedSearchResult['category'] {
  return value === 'deprecated' || value === 'glossary' ? value : 'default';
}

function normalizedText(value: string) {
  return stripMarks(value)
    .normalize('NFKC')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLowerCase();
}

function compactSearchText(value: string) {
  return (
    normalizedText(value)
      .match(/[\p{L}\p{M}\p{N}]+/gu)
      ?.join('') ?? ''
  );
}

function normalizedTerms(value: string) {
  return (
    normalizedText(value)
      .replace(/([a-z\d])([A-Z])/gu, '$1 $2')
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

function allTermsMatch(fields: Array<string | undefined>, terms: string[]) {
  if (terms.length === 0) return false;
  const fieldTerms = new Set(
    fields.flatMap((field) => (field ? normalizedTerms(field) : [])),
  );
  const compactFields = fields
    .filter((field): field is string => Boolean(field))
    .map((field) => normalizedTerms(field).join(''));
  return terms.every((term) => {
    const normalizedTerm = normalizedTerms(term).join('');
    return (
      fieldTerms.has(normalizedTerm) ||
      compactFields.some((field) => field.includes(normalizedTerm))
    );
  });
}

function anyTermMatches(fields: Array<string | undefined>, terms: string[]) {
  return terms.some((term) => allTermsMatch(fields, [term]));
}

function stripMarks(value: string) {
  return value.replace(/<\/?mark(?:\s[^>]*)?>/giu, '');
}

function isExplicitApiReferenceScope(scope?: DocsSearchScope) {
  return scope?.field === 'tab' && scope.value === 'api-reference';
}

function hasExplicitApiSignal(query: string) {
  return /(?:^|[^\p{L}\p{M}\p{N}])(?:api|method|class|enum|parameter|property|function|interface)(?:$|[^\p{L}\p{M}\p{N}])/iu.test(
    query,
  );
}

const GENERIC_API_SIGNAL_TERMS = new Set([
  'api',
  'method',
  'class',
  'enum',
  'parameter',
  'property',
  'function',
  'interface',
]);

function isStrictApiSignalFallbackMatch(
  result: { displayTitle: string; path: string[]; symbol: string },
  terms: string[],
  requestedAsFallback: boolean,
) {
  if (!requestedAsFallback) return false;
  const identifyingTerms = terms.filter(
    (term) => !GENERIC_API_SIGNAL_TERMS.has(term),
  );
  return allTermsMatch(
    [result.displayTitle, result.symbol, ...result.path],
    identifyingTerms,
  );
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

function normalizeApiReferencePlatform(platform: string) {
  if (platform === 'reactjs') {
    return 'javascript';
  }

  if (platform === 'unreal-engine') {
    return 'unreal';
  }

  return platform.startsWith('windows-') ? 'windows' : platform;
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
