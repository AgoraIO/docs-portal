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

export function resolveLegacySitemapRedirectPath(legacyPath: string) {
  const normalizedPath = normalizeLegacyPath(legacyPath);

  return (
    legacySitemapRedirectConfig.rules.find(
      (rule) => normalizeLegacyPath(rule.legacyPath) === normalizedPath,
    ) ?? null
  );
}

function normalizeLegacyPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}
