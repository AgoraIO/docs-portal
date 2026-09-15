export type SearchRecordKind = 'guide' | 'faq' | 'rest-api' | 'sdk-symbol';

export type FederatedSearchResult = {
  id: string;
  url: string;
  title: string;
  recordKind: SearchRecordKind;
  canonicalKey?: string;
  path: string[];
  platform?: string[];
  platformUrls?: Record<string, string>;
  product?: string;
  version?: string;
  snippet?: string;
  titleExactMatch?: boolean;
  aliasesExactMatch?: boolean;
  titleMatch: boolean;
  sectionMatch: boolean;
  contentMatch: boolean;
  allMajorTermsMatch: boolean;
  intentMatch: boolean;
  currentVersion?: boolean;
  category?: 'default' | 'deprecated' | 'glossary';
};
