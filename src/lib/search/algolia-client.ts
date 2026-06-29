import { liteClient } from 'algoliasearch/lite';
import type { SearchClient } from 'fumadocs-core/search/client';
import type { AlgoliaDocsRecord } from './algolia-records.server';

export function createAlgoliaDocsClient({
  appId,
  indexName,
  locale,
  searchApiKey,
}: {
  appId: string;
  indexName: string;
  locale: string;
  searchApiKey: string;
}): SearchClient {
  const client = liteClient(appId, searchApiKey);

  return {
    deps: [appId, indexName, locale, searchApiKey],
    async search(query) {
      if (!query.trim()) {
        return [];
      }

      const response = await client.searchForHits<AlgoliaDocsRecord>({
        requests: [
          {
            indexName,
            query,
            distinct: 1,
            filters: `locale:${quoteFilterValue(locale)}`,
            hitsPerPage: 12,
          },
        ],
      });

      return response.results[0].hits.map((hit) => ({
        breadcrumbs: hit.breadcrumbs,
        content: hit.section ? `${hit.title} - ${hit.section}` : hit.title,
        id: hit.objectID,
        type: 'page',
        url: hit.url,
      }));
    },
  };
}

function quoteFilterValue(value: string) {
  return JSON.stringify(value);
}
