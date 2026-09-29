import type { SearchClient } from 'fumadocs-core/search/client';

export type SearchResult = {
  id: string;
  title: string;
  content: string;
  url: string;
  headingPath: string[];
  type: 'page';
  path: string[];
  highlights?: Record<string, string>;
};

type MeilisearchHit = {
  id: string;
  sourceId?: string;
  url: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;
  headingPath: string[];
  platform?: string[];
  product?: string;
  _formatted?: Record<string, string>;
};

type MeilisearchResponse = {
  hits: MeilisearchHit[];
};

export type MeilisearchClientConfig = {
  host: string;
  indexUid: string;
  searchOnlyKey: string;
};

export function getMeilisearchSearchConfig(): MeilisearchClientConfig | null {
  const env = import.meta.env as Record<string, string | undefined>;
  const host = env.VITE_MEILI_HOST;
  const indexUid = env.VITE_MEILI_INDEX_UID;
  const searchOnlyKey = env.VITE_MEILI_SEARCH_API_KEY;

  if (!host || !indexUid || !searchOnlyKey) return null;
  return { host, indexUid, searchOnlyKey };
}

export function normalizeMeilisearchQuery(query: string): string {
  return query.trim().replace(/^#+/, '');
}

export function createMeilisearchClient({
  host,
  indexUid,
  searchOnlyKey,
}: MeilisearchClientConfig): SearchClient & {
  searchCnDocuments(
    query: string,
    options?: { filters?: string[] },
  ): Promise<SearchResult[]>;
} {
  if (!host || !indexUid || !searchOnlyKey) {
    throw new Error(
      'Meilisearch requires host, index UID, and search-only key',
    );
  }
  if (/master/i.test(searchOnlyKey)) {
    throw new Error('Meilisearch client requires a search-only key');
  }

  const searchCnDocuments = async (
    query: string,
    options: { filters?: string[] } = {},
  ): Promise<SearchResult[]> => {
    const normalizedQuery = normalizeMeilisearchQuery(query);
    if (!normalizedQuery) return [];

    const response = await fetch(
      `${host.replace(/\/$/, '')}/indexes/${encodeURIComponent(indexUid)}/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${searchOnlyKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: normalizedQuery,
          ...(options.filters?.length
            ? { filter: options.filters.join(' AND ') }
            : {}),
          attributesToHighlight: ['sectionTitle', 'content'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          attributesToCrop: ['content'],
          cropLength: 30,
          limit: 10,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`Meilisearch search failed (HTTP ${response.status})`);
    }

    const result = (await response.json()) as MeilisearchResponse;
    return result.hits.map(mapHit);
  };

  return {
    deps: [host, indexUid, searchOnlyKey],
    search: (query) => searchCnDocuments(query),
    searchCnDocuments,
  };
}

function mapHit(hit: MeilisearchHit): SearchResult & Record<string, unknown> {
  const formatted = hit._formatted ?? {};
  const title = formatted.sectionTitle ?? hit.sectionTitle;
  const content = formatted.content ?? hit.content;
  return {
    id: hit.id,
    title,
    content: title,
    url: hit.url,
    headingPath: hit.headingPath,
    highlights: formatted,
    section: title,
    snippet: content,
    path: hit.headingPath,
    platform: hit.platform,
    product: hit.product,
    type: 'page',
    objectType: 'docs',
  };
}
