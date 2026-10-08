import type { SearchHit } from './meilisearch-client';
import type { SearchPageState } from './search-page-state';

export type SearchFacets = Record<string, Record<string, number>>;
export type SearchPageGroup = {
  pageUrl: string;
  title: string;
  product?: string;
  platform: string[];
  version?: string;
  docType: SearchHit['docType'];
  sections: SearchHit[];
};
export type CnSearchPageResponse = {
  groups: SearchPageGroup[];
  totalHits: number;
  totalPages: number;
  page: number;
  facets: SearchFacets;
};

export type CnSearchRequest = SearchPageState & { tab?: string };

export async function searchCnDocsPage(
  state: CnSearchRequest,
  signal?: AbortSignal,
): Promise<CnSearchPageResponse> {
  const params = new URLSearchParams({
    q: state.q,
    page: String(state.page),
    type: state.type,
  });
  for (const field of ['product', 'platform', 'version', 'tab'] as const) {
    if (state[field]) params.set(field, state[field]);
  }
  const response = await fetch(`/api/search?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok)
    throw new Error(`Search unavailable (HTTP ${response.status})`);
  const result = (await response.json()) as CnSearchPageResponse;
  if (
    !Array.isArray(result.groups) ||
    !Number.isSafeInteger(result.totalHits) ||
    !Number.isSafeInteger(result.totalPages) ||
    !Number.isSafeInteger(result.page) ||
    !result.facets
  ) {
    throw new Error('Invalid search response');
  }
  return result;
}

// The current demo index contains Markdown source. Keep highlight tags while
// removing authoring syntax from the cropped, text-only search preview.
export function cleanSearchSnippet(value: string): string {
  return value
    .replace(/```[\w+-]*\s*/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*(?:\)|$)/g, '$1')
    .replace(/<\/?[a-z][^<>]*>/gi, (tag) =>
      /^<\/?(?:mark|em)>$/i.test(tag) ? tag : '',
    )
    .replace(/(?:\*\*|__|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isPublicCnSearchUrl(value: string) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/zh-CN/') ||
    Array.from(value).some(
      (character) => character.charCodeAt(0) <= 32 || character === '\\',
    )
  )
    return false;
  const url = new URL(value, 'https://docs.local');
  return (
    url.origin === 'https://docs.local' && url.pathname.startsWith('/zh-CN/')
  );
}

export function groupSearchSections(hits: SearchHit[]): SearchPageGroup[] {
  const groups = new Map<string, SearchPageGroup>();
  for (const hit of hits) {
    const pageUrl = hit.url.split('#')[0];
    const existing = groups.get(pageUrl);
    if (existing) {
      if (!existing.sections.some((section) => section.url === hit.url))
        existing.sections.push(hit);
      existing.platform = [
        ...new Set([...existing.platform, ...(hit.platform ?? [])]),
      ];
    } else {
      groups.set(pageUrl, {
        pageUrl,
        title: hit.pageTitle,
        product: hit.product,
        platform: hit.platform ?? [],
        version: hit.version,
        docType: hit.docType,
        sections: [hit],
      });
    }
  }
  return [...groups.values()];
}
