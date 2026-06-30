export const ALGOLIA_INDEX_NAME = 'docs_portal_en';

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
