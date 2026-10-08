export function buildMeilisearchSettings(): {
  searchableAttributes: string[];
  filterableAttributes: string[];
  displayedAttributes: string[];
  pagination: { maxTotalHits: number };
} {
  return {
    pagination: { maxTotalHits: 10000 },
    searchableAttributes: ['sectionTitle', 'aliases', 'pageTitle', 'content'],
    filterableAttributes: [
      'locale',
      'product',
      'tab',
      'platform',
      'version',
      'docType',
      'audience',
      'status',
      'hidden',
    ],
    displayedAttributes: [
      'id',
      'sourceId',
      'url',
      'pageTitle',
      'sectionTitle',
      'content',
      'headingPath',
      'locale',
      'product',
      'tab',
      'platform',
      'version',
      'docType',
      'audience',
      'status',
      'hidden',
      'aliases',
    ],
  };
}
