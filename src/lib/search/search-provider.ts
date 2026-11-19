import type { DocsRegion } from '../site-region';

export type DocsSearchProvider = 'algolia' | 'meilisearch' | 'orama';
export type DocsSearchScope = {
  field: 'product' | 'tab';
  value: string;
};

export function getDocsSearchProvider(
  region: DocsRegion,
  hasAlgoliaConfig: boolean,
): DocsSearchProvider {
  if (region === 'cn') return 'meilisearch';
  return hasAlgoliaConfig ? 'algolia' : 'orama';
}

export function shouldSyncAlgoliaSearch(region: DocsRegion) {
  return region === 'global';
}
