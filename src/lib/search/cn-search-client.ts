import type { SearchClient } from 'fumadocs-core/search/client';
import { searchCnDocsPage } from './cn-search-page';
import { mapSearchHit, normalizeMeilisearchQuery } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';
import type { DocsSearchScope } from './search-provider';

export function createCnDocsSearchClient({
  platform,
  scope,
}: {
  platform?: string;
  scope?: DocsSearchScope;
}): SearchClient {
  return {
    deps: ['cn-search-api', platform, scope?.field, scope?.value],
    async search(query) {
      const q = normalizeMeilisearchQuery(query);
      if (!q) return [];
      const result = await searchCnDocsPage({
        ...parseSearchPageState({
          q,
          platform,
          product: scope?.field === 'product' ? scope.value : undefined,
        }),
        tab: scope?.field === 'tab' ? scope.value : undefined,
      });
      return result.groups
        .flatMap((group) => group.sections.map(mapSearchHit))
        .slice(0, 10);
    },
  };
}
