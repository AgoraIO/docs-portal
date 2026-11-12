import type { SearchClient } from 'fumadocs-core/search/client';
import { getCnSearchFamily } from './cn-search-family';
import { getCnSearchFamilyOrder } from './cn-search-intent';
import { searchCnDocsPage } from './cn-search-page';
import { mapSearchHit, normalizeMeilisearchQuery } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';
import type { DocsSearchScope } from './search-provider';

export function createCnDocsSearchClient({
  platform,
  scope,
  requestHeaders,
}: {
  platform?: string;
  scope?: DocsSearchScope;
  requestHeaders?: () => Record<string, string>;
}): SearchClient {
  return {
    deps: ['cn-search-api', platform, scope?.field, scope?.value],
    async search(query) {
      const q = normalizeMeilisearchQuery(query);
      if (!q) return [];
      const result = await searchCnDocsPage(
        {
          ...parseSearchPageState({
            q,
            platform,
            product: scope?.field === 'product' ? scope.value : undefined,
          }),
          tab: scope?.field === 'tab' ? scope.value : undefined,
        },
        undefined,
        requestHeaders?.(),
      );
      const families = getCnSearchFamilyOrder(
        q,
        result.groups.flatMap((group) =>
          group.sections.map((section) => ({
            family: getCnSearchFamily(group),
            title: section.sectionTitle,
            languageEntryTerms: section.languageEntryTerms,
            languageEntryRank: section.languageEntryRank,
          })),
        ),
        platform,
      );
      return families.flatMap((family) =>
        result.groups
          .filter((group) => getCnSearchFamily(group) === family)
          .flatMap((group) => group.sections)
          .slice(0, 3)
          .map((hit) => ({
            ...mapSearchHit(hit),
            family,
            familyTotalHits: result.familyTotalHits?.[family],
          })),
      );
    },
  };
}
