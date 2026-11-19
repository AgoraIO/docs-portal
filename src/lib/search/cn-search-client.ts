import type { SearchClient } from 'fumadocs-core/search/client';
import { getCnSearchFamily } from './cn-search-family';
import { searchCnDocsPage } from './cn-search-page';
import {
  getCnSearchResponseFamilyOrder,
  getCnSearchResultEntries,
} from './cn-search-presentation';
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
      const families = getCnSearchResponseFamilyOrder(
        result.groups,
        q,
        platform,
      );
      return families.flatMap((family) =>
        getCnSearchResultEntries(
          result.groups.filter((group) => getCnSearchFamily(group) === family),
          q,
          platform,
        )
          .slice(0, 3)
          .map(({ hit }) => ({
            ...mapSearchHit(hit),
            family,
            familyOrder: families,
            familyTotalHits: result.familyTotalHits?.[family],
          })),
      );
    },
  };
}
