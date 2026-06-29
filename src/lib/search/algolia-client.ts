import { liteClient } from 'algoliasearch/lite';
import type { SearchClient } from 'fumadocs-core/search/client';

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
  searchApiKey,
}: {
  appId: string;
  indexName: string;
  locale: string;
  platform?: string;
  searchApiKey: string;
}): SearchClient {
  const client = liteClient(appId, searchApiKey);

  return {
    deps: [appId, indexName, locale, platform, searchApiKey],
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
            distinct: 5,
            filters: buildFilters({ locale, platform }),
            hitsPerPage: 10,
            attributesToHighlight: ['title', 'section', 'content'],
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
          platform: getStringArray(hit.platform),
          product: getString(hit.product),
          section: getHighlight(hit, 'section') ?? section,
          snippet:
            getHighlight(hit, 'content') ??
            getHighlight(hit, 'section') ??
            getString(hit.description) ??
            getString(hit.content),
          tab: getString(hit.tab),
          title: getHighlight(hit, 'title') ?? getString(hit.title),
          type: 'page' as const,
          url: resultUrl,
        });
      }

      return entries;
    },
  };
}

function buildFilters({
  locale,
  platform,
}: {
  locale: string;
  platform?: string;
}) {
  return [`locale:${locale}`, platform ? `platform:${platform}` : undefined]
    .filter(Boolean)
    .join(' AND ');
}

function getHighlight(hit: Record<string, unknown>, key: string) {
  const highlight = hit._highlightResult;

  if (!isRecord(highlight)) {
    return undefined;
  }

  const value = highlight[key];

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
