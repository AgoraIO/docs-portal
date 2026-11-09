import { cnSearchSynonyms, cnTechnicalWords } from './cn-search-strategy';

export function buildMeilisearchSettings() {
  return {
    pagination: { maxTotalHits: 10000 },
    distinctAttribute: 'distinctKey',
    searchableAttributes: ['sectionTitle', 'aliases', 'pageTitle', 'content'],
    filterableAttributes: [
      'locale',
      'product',
      'tab',
      'platform',
      'isDefaultPlatform',
      'version',
      'docType',
      'searchFamily',
      'audience',
      'status',
      'hidden',
    ],
    displayedAttributes: [
      'id',
      'sourceId',
      'canonicalUrl',
      'url',
      'pageTitle',
      'sectionTitle',
      'content',
      'summary',
      'headingPath',
      'locale',
      'product',
      'tab',
      'platform',
      'availablePlatforms',
      'defaultPlatform',
      'isDefaultPlatform',
      'version',
      'docType',
      'searchFamily',
      'audience',
      'status',
      'hidden',
      'aliases',
    ],
  };
}

/** 在基础设置上应用生产中文章节索引的排序策略。 */
export function buildPublishedCnSearchSettings() {
  const base = buildMeilisearchSettings();
  return {
    ...base,
    searchableAttributes: [
      'languageEntryTerms',
      'productCode',
      'productTitle',
      'entryTitle',
      'guideHeading',
      'sectionTitle',
      'nameSplit',
      'groupNameSplit',
      'aliases',
      'languageTerms',
      'pageTitle',
      'headingPath',
      'content',
    ],
    sortableAttributes: [
      'languageEntryRank',
      'entrySeq',
      'productSeq',
      'platformSeq',
      'typeSeq',
    ],
    synonyms: cnSearchSynonyms,
    dictionary: cnTechnicalWords,
    typoTolerance: {
      disableOnWords: [...cnTechnicalWords, 'csharp', 'cplusplus'],
    },
    rankingRules: [
      'words',
      'typo',
      'attribute',
      'proximity',
      'sort',
      'exactness',
      'entrySeq:asc',
      'productSeq:asc',
      'platformSeq:asc',
    ],
    filterableAttributes: [
      'languageEntryTerms',
      'aliases',
      ...base.filterableAttributes.flatMap((field) =>
        field === 'product' ? [field, 'products'] : [field],
      ),
    ],
    displayedAttributes: [
      'languageEntryTerms',
      'languageEntryRank',
      ...base.displayedAttributes.flatMap((field) =>
        field === 'product' ? [field, 'products'] : [field],
      ),
    ],
  };
}
