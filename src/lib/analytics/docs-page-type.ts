export const DOCS_PAGE_TYPES = [
  'navigation-landing',
  'task-guide',
  'concept-explanation',
  'sdk-api-reference',
  'faq-troubleshooting',
  'release-download',
] as const;

export type DocsPageType = (typeof DOCS_PAGE_TYPES)[number];

export function inferDocsPageType(pathname: string): DocsPageType {
  const normalized = pathname.toLowerCase();
  const parts = normalized.split('/').filter(Boolean);
  const leaf = parts.at(-1) ?? '';

  if (/(release|changelog|download|sunset|deprecat)/.test(normalized)) {
    return 'release-download';
  }

  if (/(faq|troubleshoot|error|issue|failure|debug)/.test(normalized)) {
    return 'faq-troubleshooting';
  }

  if (
    normalized.includes('/api-reference/') ||
    /(^|\/)(sdk-reference|api-reference)(\/|$)/.test(normalized)
  ) {
    return 'sdk-api-reference';
  }

  if (
    /(quick[-_]?start|get-started|setup|enable|integrat|implement|build|migrat|call-api|run-)/.test(
      normalized,
    )
  ) {
    return 'task-guide';
  }

  if (parts.length <= 2 || leaf === 'index') {
    return 'navigation-landing';
  }

  return 'concept-explanation';
}
