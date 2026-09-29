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

export type HighlightSegment = {
  text: string;
  highlighted: boolean;
};

export type SearchHit = {
  id: string;
  sourceId: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;
  snippet: string;
  url: string;
  headingPath: string[];
  locale: string;
  product?: string;
  platform?: string[];
  version?: string;
  docType: 'docs' | 'openapi';
  audience: string[];
  status: 'published' | 'deprecated' | 'internal';
  hidden: boolean;
  highlights: {
    sectionTitle: HighlightSegment[];
    content: HighlightSegment[];
  };
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
  locale: string;
  version?: string;
  docType: 'docs' | 'openapi';
  audience: string[];
  status: 'published' | 'deprecated' | 'internal';
  hidden: boolean;
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
          filter: [
            'locale = "zh-CN"',
            'hidden = false',
            'status = "published"',
            ...(options.filters ?? []),
          ].join(' AND '),
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
    return result.hits
      .filter(
        (hit) =>
          hit.locale === 'zh-CN' &&
          hit.status === 'published' &&
          hit.hidden === false,
      )
      .map(mapHit);
  };

  return {
    deps: [host, indexUid, searchOnlyKey],
    search: (query) => searchCnDocuments(query),
    searchCnDocuments,
  };
}

function mapHit(hit: MeilisearchHit): SearchResult & Record<string, unknown> {
  const normalized = normalizeMeilisearchHit(hit);
  const title = segmentsToMarkup(normalized.highlights.sectionTitle);
  const content = segmentsToMarkup(normalized.highlights.content);
  return {
    id: hit.id,
    title,
    content: title,
    url: hit.url,
    headingPath: hit.headingPath,
    highlights: {
      sectionTitle: title,
      content,
    },
    section: title,
    snippet: content,
    path: hit.headingPath,
    platform: hit.platform,
    product: hit.product,
    type: 'page',
    objectType: 'docs',
  };
}

export function normalizeMeilisearchHit(hit: MeilisearchHit): SearchHit {
  return {
    id: hit.id,
    sourceId: hit.sourceId ?? hit.id,
    pageTitle: hit.pageTitle,
    sectionTitle: hit.sectionTitle,
    content: hit.content,
    snippet: hit.content,
    url: hit.url,
    headingPath: hit.headingPath,
    locale: hit.locale,
    product: hit.product,
    platform: hit.platform,
    version: hit.version,
    docType: hit.docType,
    audience: hit.audience,
    status: hit.status,
    hidden: hit.hidden,
    highlights: {
      sectionTitle: parseHighlightSegments(
        hit._formatted?.sectionTitle ?? hit.sectionTitle,
      ),
      content: parseHighlightSegments(hit._formatted?.content ?? hit.content),
    },
  };
}

function parseHighlightSegments(value: string): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  const pattern = /<(?:mark|em)>(.*?)<\/(?:mark|em)>/g;
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const start = match.index;
    if (start > cursor) {
      segments.push({ text: value.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: match[1], highlighted: true });
    cursor = start + match[0].length;
  }
  if (cursor < value.length) {
    segments.push({ text: value.slice(cursor), highlighted: false });
  }
  return segments.length ? segments : [{ text: value, highlighted: false }];
}

function segmentsToMarkup(segments: HighlightSegment[]): string {
  return segments
    .map((segment) =>
      segment.highlighted ? `<mark>${segment.text}</mark>` : segment.text,
    )
    .join('');
}
