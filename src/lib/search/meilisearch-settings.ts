import { cnSearchSynonyms, cnTechnicalWords } from './cn-search-strategy';

export function buildMeilisearchSettings() {
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

/** 在基础设置上应用生产中文章节索引的排序策略。 */
export function buildPublishedCnSearchSettings() {
  const base = buildMeilisearchSettings();
  return {
    ...base,
    searchableAttributes: [
      'entryTitle',
      'sectionTitle',
      'nameSplit',
      'groupNameSplit',
      'aliases',
      'pageTitle',
      'content',
    ],
    sortableAttributes: ['entrySeq', 'productSeq', 'platformSeq', 'typeSeq'],
    synonyms: cnSearchSynonyms,
    typoTolerance: { disableOnWords: cnTechnicalWords },
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
    filterableAttributes: base.filterableAttributes.flatMap((field) =>
      field === 'product' ? [field, 'products'] : [field],
    ),
    displayedAttributes: base.displayedAttributes.flatMap((field) =>
      field === 'product' ? [field, 'products'] : [field],
    ),
  };
}
