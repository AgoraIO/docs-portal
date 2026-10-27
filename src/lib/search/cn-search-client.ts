import type { SearchClient } from 'fumadocs-core/search/client';
import { isCnApiSearchGroup, searchCnDocsPage } from './cn-search-page';
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
      return (['docs', 'api'] as const).flatMap((family) =>
        result.groups
          .filter((group) => isCnApiSearchGroup(group) === (family === 'api'))
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
