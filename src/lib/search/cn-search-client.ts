import type { SearchClient } from 'fumadocs-core/search/client';
import { searchCnDocsPage } from './cn-search-page';
import {
  mapSearchHit,
  normalizeMeilisearchQuery,
  type SearchResult,
} from './meilisearch-client';
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
      return preferCurrentApiVersions(
        result.groups.flatMap((group) => group.sections.map(mapSearchHit)),
        q,
      ).slice(0, 10);
    },
  };
}

// Only swap equivalent API results into each other's existing relevance slots.
// A content-only match or a different product/platform keeps its engine rank.
function preferCurrentApiVersions(results: SearchResult[], query: string) {
  const normalize = (value: string) =>
    value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const needle = normalize(query);
  if (!needle) return results;
  const groups = new Map<
    string,
    { indexes: number[]; entries: SearchResult[] }
  >();
  results.forEach((result, index) => {
    if (
      !result.versionStatus ||
      !/^\/(?:zh-CN\/)?api-reference\//.test(result.url)
    )
      return;
    const title = result.headingPath.at(-1);
    if (!title || !normalize(title).startsWith(needle)) return;
    const key = JSON.stringify([
      result.product,
      [...(result.platform ?? [])].sort(),
      result.headingPath,
    ]);
    const group = groups.get(key) ?? { indexes: [], entries: [] };
    group.indexes.push(index);
    group.entries.push(result);
    groups.set(key, group);
  });
  const ordered = [...results];
  for (const { indexes, entries } of groups.values()) {
    entries.sort(
      (left, right) =>
        Number(left.versionStatus === 'historical') -
        Number(right.versionStatus === 'historical'),
    );
    indexes.forEach((index, offset) => {
      ordered[index] = entries[offset];
    });
  }
  return ordered;
}
