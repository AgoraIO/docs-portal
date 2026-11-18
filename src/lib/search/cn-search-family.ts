import { toCnPublicSearchUrl } from './cn-search-urls.mjs';

export const cnSearchFamilies = ['docs', 'api', 'faq'] as const;
export type CnSearchFamily = (typeof cnSearchFamilies)[number];
export const cnSearchFamilyLabels: Record<CnSearchFamily, string> = {
  docs: '技术文档',
  api: 'API Reference',
  faq: 'FAQ',
};

export function getCnSearchFamily(group: {
  pageUrl: string;
  docType: 'docs' | 'openapi';
}): CnSearchFamily {
  const path = toCnPublicSearchUrl(group.pageUrl).split(/[?#]/, 1)[0];
  if (path === '/reference/faq' || path.startsWith('/reference/faq/'))
    return 'faq';
  if (group.docType === 'openapi' || path.startsWith('/api-reference/'))
    return 'api';
  return 'docs';
}
