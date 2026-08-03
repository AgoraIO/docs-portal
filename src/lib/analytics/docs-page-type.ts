export const DOCS_PAGE_TYPES = [
  'navigation-landing',
  'task-guide',
  'concept-explanation',
  'sdk-api-reference',
  'faq-troubleshooting',
  'release-download',
] as const;

export type DocsPageType = (typeof DOCS_PAGE_TYPES)[number];
