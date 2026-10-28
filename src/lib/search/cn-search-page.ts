import { normalizeCnProductFacets } from './cn-products';
import { type CnSearchFamily, getCnSearchFamily } from './cn-search-family';
import { isPublicCnSearchUrl } from './cn-search-urls.mjs';
import type { SearchHit } from './meilisearch-client';
import type { SearchPageState } from './search-page-state';

export { isPublicCnSearchUrl } from './cn-search-urls.mjs';

export type SearchFacets = Record<string, Record<string, number>>;
export type SearchPageGroup = {
  groupKey?: string;
  pageUrl: string;
  title: string;
  product?: string;
  platform: string[];
  availablePlatforms?: string[];
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
  familyTotalHits?: Partial<Record<CnSearchFamily, number>>;
};

export type CnSearchRequest = SearchPageState & { tab?: string };

export async function searchCnDocsPage(
  state: CnSearchRequest,
  signal?: AbortSignal,
  measurementHeaders?: Record<string, string>,
): Promise<CnSearchPageResponse> {
  const params = new URLSearchParams({
    q: state.q,
    page: String(state.page),
    type: state.type,
  });
  for (const field of ['product', 'platform', 'tab'] as const) {
    if (state[field]) params.set(field, state[field]);
  }
  const response = await fetch(`/api/search?${params}`, {
    signal,
    headers: { Accept: 'application/json', ...measurementHeaders },
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
  return {
    ...result,
    groups: result.groups
      .filter((group) => isPublicCnSearchUrl(group.pageUrl))
      .map((group) => ({
        ...group,
        sections: group.sections.filter(
          (section) =>
            isPublicCnSearchUrl(section.url) &&
            (!section.canonicalUrl ||
              isPublicCnSearchUrl(section.canonicalUrl)),
        ),
      }))
      .filter((group) => group.sections.length > 0),
    facets: {
      ...result.facets,
      product: normalizeCnProductFacets(result.facets.product ?? {}),
    },
  };
}

export function isCnApiSearchGroup(
  group: Pick<SearchPageGroup, 'pageUrl' | 'docType'>,
) {
  return getCnSearchFamily(group) === 'api';
}

// A stable, publication-wide catalog: keyword matches and a previously selected
// platform must not remove the user's next product/platform from the controls.
export async function loadCnSearchCatalog(signal?: AbortSignal) {
  const result = await searchCnDocsPage(
    { q: '', type: 'all', page: 1 },
    signal,
  );
  return result.facets;
}

// The current demo index contains Markdown source. Keep highlight tags while
// removing authoring syntax from the cropped, text-only search preview.
export function cleanSearchSnippet(value: string): string {
  return value
    .replace(/\bOpenAPI:\s*\/openapi\/\S*/gi, '')
    .replace(/\|?\s*:?-{3,}:?\s*(?=\||$)/gm, ' ')
    .replace(/(^|\s)\|(?=\s|$)/gm, '$1')
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

export function mergeSearchPageGroups(
  pages: SearchPageGroup[][],
): SearchPageGroup[] {
  const groups = new Map<string, SearchPageGroup>();
  for (const page of pages)
    for (const group of page) {
      const key = getSearchPageGroupKey(group);
      const previous = groups.get(key);
      if (!previous)
        groups.set(key, {
          ...group,
          sections: [...group.sections],
          platform: [...group.platform],
          availablePlatforms: group.availablePlatforms
            ? [...group.availablePlatforms]
            : undefined,
        });
      else {
        for (const section of group.sections)
          if (
            !previous.sections.some(
              (item) =>
                getSearchSectionHref(previous.pageUrl, item.url) ===
                getSearchSectionHref(previous.pageUrl, section.url),
            )
          )
            previous.sections.push(section);
        previous.platform = [
          ...new Set([...previous.platform, ...group.platform]),
        ];
        previous.availablePlatforms = [
          ...new Set([
            ...(previous.availablePlatforms ?? []),
            ...(group.availablePlatforms ?? []),
          ]),
        ];
      }
    }
  return [...groups.values()];
}

export function groupSearchSections(
  hits: SearchHit[],
  {
    platformFiltered = false,
    selectedPlatform,
  }: { platformFiltered?: boolean; selectedPlatform?: string } = {},
): SearchPageGroup[] {
  const groups = new Map<string, SearchPageGroup>();
  for (const hit of hits) {
    const pageUrl = (
      platformFiltered ? hit.url : (hit.canonicalUrl ?? hit.url)
    ).split('#')[0];
    const groupKey = getSearchPageGroupKey({
      pageUrl,
      product: hit.product,
      docType: hit.docType,
      version: hit.version,
    });
    const platforms = platformFiltered
      ? selectedPlatform
        ? [selectedPlatform]
        : (hit.platform ?? [])
      : (hit.availablePlatforms ?? hit.platform ?? []);
    const existing = groups.get(groupKey);
    if (existing) {
      if (
        !existing.sections.some(
          (section) =>
            getSearchSectionHref(pageUrl, section.url) ===
            getSearchSectionHref(pageUrl, hit.url),
        )
      )
        existing.sections.push(hit);
      existing.platform = [...new Set([...existing.platform, ...platforms])];
      existing.availablePlatforms = [
        ...new Set([...(existing.availablePlatforms ?? []), ...platforms]),
      ];
    } else {
      groups.set(groupKey, {
        groupKey,
        pageUrl,
        title: hit.pageTitle,
        product: hit.product,
        platform: platforms,
        availablePlatforms: platforms,
        version: hit.version,
        docType: hit.docType,
        sections: [hit],
      });
    }
  }
  return [...groups.values()];
}

export function getSearchPageGroupKey(
  group: Pick<
    SearchPageGroup,
    'groupKey' | 'pageUrl' | 'product' | 'docType' | 'version'
  >,
): string {
  return (
    group.groupKey ??
    [
      group.pageUrl,
      group.product ?? '',
      group.docType,
      group.version ?? '',
    ].join('\u0000')
  );
}

export function getSearchSectionHref(
  pageUrl: string,
  sectionUrl: string,
): string {
  const hash = sectionUrl.indexOf('#');
  return hash >= 0 ? `${pageUrl}${sectionUrl.slice(hash)}` : pageUrl;
}
