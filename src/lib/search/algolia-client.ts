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
  appId,
  indexName,
  locale,
  platform,
  scope,
  searchApiKey,
}: {
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
    deps: [appId, indexName, locale, platform, scope, searchApiKey],
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
        ],
      });

      const entries = [];
      const seenUrls = new Set<string>();

      for (const hit of result.results[0].hits as AlgoliaDocsHit[]) {
        const sectionId =
          typeof hit.section_id === 'string' ? hit.section_id : undefined;
        const url = typeof hit.url === 'string' ? hit.url : '';
        const section = getString(hit.section);
        const resultUrl = sectionId ? `${url}#${sectionId}` : url;

        if (seenUrls.has(resultUrl)) {
          continue;
        }

        seenUrls.add(resultUrl);

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

      // Ranking is left entirely to Algolia (textual relevance + the category
      // optionalFilters above); the client no longer re-sorts, so it can't
      // fight the server ranking (e.g. re-promoting a glossary heading match).
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
