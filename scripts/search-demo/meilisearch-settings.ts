export function buildMeilisearchSettings(): {
  searchableAttributes: string[];
  filterableAttributes: string[];
  displayedAttributes: string[];
} {
  return {
    searchableAttributes: ['sectionTitle', 'aliases', 'pageTitle', 'content'],
    filterableAttributes: [
      'locale',
      'product',
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
