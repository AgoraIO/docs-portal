import { DOCS_REGION, type DocsRegion } from '../site-region';
import { getDocsSearchProvider } from './search-provider';

export const DEFAULT_ALGOLIA_INDEX_NAME = 'docs_portal_en';
export const DEFAULT_ALGOLIA_API_REFERENCE_INDEX_NAME = 'agora_APIRefSearch';

// The index name is overridable via env so a local build can point at a
// scratch index (e.g. docs_portal_scratch) for verifying index/ranking
// changes without touching production. Falls back to the prod index.
export const ALGOLIA_INDEX_NAME =
  import.meta.env.VITE_ALGOLIA_INDEX_NAME || DEFAULT_ALGOLIA_INDEX_NAME;
export const ALGOLIA_API_REFERENCE_INDEX_NAME =
  import.meta.env.VITE_ALGOLIA_API_REFERENCE_INDEX_NAME ||
  DEFAULT_ALGOLIA_API_REFERENCE_INDEX_NAME;
export const SEARCH_RANKING_V2_ENABLED =
  import.meta.env.VITE_SEARCH_RANKING_V2 === 'true';

export function getAlgoliaSearchConfig(region: DocsRegion = DOCS_REGION) {
  const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
  const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
  const hasAlgoliaConfig = Boolean(appId && searchApiKey);

  if (
    getDocsSearchProvider(region, hasAlgoliaConfig) !== 'algolia' ||
    !appId ||
    !searchApiKey
  ) {
    return null;
  }

  return {
    apiReferenceIndexName: ALGOLIA_API_REFERENCE_INDEX_NAME,
    appId,
    indexName: ALGOLIA_INDEX_NAME,
    rankingV2: SEARCH_RANKING_V2_ENABLED,
    searchApiKey,
  };
}
