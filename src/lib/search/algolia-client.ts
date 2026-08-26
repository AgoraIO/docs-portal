import { liteClient } from 'algoliasearch/lite';
import type { SearchClient } from 'fumadocs-core/search/client';
import type { DocsSearchScope } from './search-provider';

export type AlgoliaSearchFilters = {
  platform?: string;
};

type AlgoliaDocsHit = Record<string, unknown> & {
  objectID: string;
};

export function createAlgoliaDocsClient({
  apiReferenceIndexName,
  appId,
  indexName,
  locale,
  platform,
  scope,
  searchApiKey,
}: {
  apiReferenceIndexName?: string;
  appId: string;
  indexName: string;
  locale: string;
  platform?: string;
  // Product/tab scope derived from the docs navigation.
  scope?: DocsSearchScope;
  searchApiKey: string;
}): SearchClient {
  const client = liteClient(appId, searchApiKey);

  return {
    deps: [
      appId,
      indexName,
      apiReferenceIndexName,
      locale,
      platform,
      scope,
      searchApiKey,
    ],
    async search(query) {
      if (query.trim().length === 0) {
        return [];
      }

      const result = await client.searchForHits({
        requests: [
          {
            type: 'default',
            indexName,
            query,
            // One result per page: a page's best-matching section, never the
            // same page repeated for each matching heading.
            distinct: 1,
            // Algolia's default typo tolerance treats short queries (4
            // letters) as a 1-typo prefix match, so e.g. "okta" matches
            // "obta[ins]" in unrelated pages. Requiring 5+ letters before
            // typo tolerance kicks in keeps exact short-query matches (like
            // the real "Okta" mentions) without the noise. 'min' layers on
            // top: when an exact match exists, drop typo-tolerant matches
            // entirely instead of mixing them in.
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
                  // See the typo-tolerance comment on the docs index request
                  // above: without this, short queries fuzzy-match unrelated
                  // method docs via common words like "Obtains".
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
    },
  };
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
