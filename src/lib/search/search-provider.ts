import type { DocsRegion } from '../site-region';

export type DocsSearchProvider = 'algolia' | 'orama';
export type DocsSearchScope = {
  field: 'product' | 'tab';
  value: string;
};

export function getDocsSearchProvider(
  region: DocsRegion,
  hasAlgoliaConfig: boolean,
): DocsSearchProvider {
  return region === 'global' && hasAlgoliaConfig ? 'algolia' : 'orama';
}

export function shouldSyncAlgoliaSearch(region: DocsRegion) {
  return region === 'global';
}
