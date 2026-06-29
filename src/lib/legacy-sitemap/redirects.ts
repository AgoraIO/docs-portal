import legacySitemapRedirects from './redirects.json';

export type LegacySitemapRuleType =
  | 'exact-page'
  | 'semantic-page-match'
  | 'product-fallback';

export type LegacySitemapRedirectRule = {
  id: string;
  match: {
    legacyPath?: string;
    legacyPrefix?: string;
  };
  preserveSearch: boolean;
  reason: string;
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
    legacySitemapRedirectConfig.rules.find((rule) => {
      if (rule.match.legacyPath) {
        return normalizeLegacyPath(rule.match.legacyPath) === normalizedPath;
      }

      if (rule.match.legacyPrefix) {
        return normalizedPath.startsWith(
          normalizeLegacyPrefix(rule.match.legacyPrefix),
        );
      }

      return false;
    }) ?? null
  );
}

function normalizeLegacyPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function normalizeLegacyPrefix(prefix: string) {
  const normalized = normalizeLegacyPath(prefix);

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}
