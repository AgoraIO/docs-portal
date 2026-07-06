import legacySitemapRedirects from './redirects.json';

export type LegacySitemapRuleType =
  | 'exact-path'
  | 'exact-slug'
  | 'renamed-page'
  | 'semantic-page-match'
  | 'product-fallback'
  | 'unavailable';

export type LegacySitemapRedirectRule = {
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
  legacyPath: string;
  legacySearch?: string;
  legacyUrl: string;
  preserveSearch: boolean;
  target: string;
  type: LegacySitemapRuleType;
};

export const legacySitemapRedirectConfig = legacySitemapRedirects as {
  rules: LegacySitemapRedirectRule[];
  snapshotDownloadedAt: string;
  snapshotPath: string;
  sourceSitemapUrl: string;
};

export function resolveLegacySitemapRedirectPath(
  legacyPath: string,
  legacySearch?: string,
) {
  const normalizedPath = normalizeLegacyPath(legacyPath);
  const normalizedSearch = normalizeLegacySearch(legacySearch);

  return (
    legacySitemapRedirectConfig.rules.find(
      (rule) =>
        normalizeLegacyPath(rule.legacyPath) === normalizedPath &&
        normalizeLegacySearch(rule.legacySearch) === normalizedSearch,
    ) ??
    legacySitemapRedirectConfig.rules.find(
      (rule) =>
        normalizeLegacyPath(rule.legacyPath) === normalizedPath &&
        !rule.legacySearch,
    ) ??
    null
  );
}

function normalizeLegacyPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function normalizeLegacySearch(search: string | undefined) {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search : `?${search}`;
}
