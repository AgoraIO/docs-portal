export const DEFAULT_ALGOLIA_INDEX_NAME = 'docs_portal_en';

// The index name is overridable via env so a local build can point at a
// scratch index (e.g. docs_portal_scratch) for verifying index/ranking
// changes without touching production. Falls back to the prod index.
export const ALGOLIA_INDEX_NAME =
  import.meta.env.VITE_ALGOLIA_INDEX_NAME || DEFAULT_ALGOLIA_INDEX_NAME;

export function getAlgoliaSearchConfig() {
  const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
  const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;

  if (!appId || !searchApiKey) {
    return null;
  }

  return {
    appId,
    indexName: ALGOLIA_INDEX_NAME,
    searchApiKey,
  };
}
