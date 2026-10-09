import { ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS } from '../zh-cn-product-ia-redirects';
import staticRedirects from './static-redirects.json';

type StaticLegacyRedirectRule = {
  p: string;
  q?: string;
  s?: 0;
  t: string;
};

export type StaticLegacyRedirectPayload = {
  preserveSearch: boolean;
  redirectUrl: string;
  statusCode?: 301;
};

const staticLegacyRedirectRules = staticRedirects as StaticLegacyRedirectRule[];
export const ZH_CN_SMALL_BUILD_FLAT_IA_STATIC_REDIRECT_SOURCES = new Set(
  Object.keys(ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS).map(
    (path) => `/zh-CN/${path}`,
  ),
);

export function resolveStaticLegacySitemapRedirect(
  legacyPath: string,
  legacySearch?: string,
): StaticLegacyRedirectPayload | null {
  const normalizedPath = normalizeLegacyPath(legacyPath);
  const normalizedSearch = normalizeLegacySearch(legacySearch);
  const rule =
    staticLegacyRedirectRules.find(
      (item) =>
        normalizeLegacyPath(item.p) === normalizedPath &&
        normalizeLegacySearch(item.q) === normalizedSearch,
    ) ??
    staticLegacyRedirectRules.find(
      (item) => normalizeLegacyPath(item.p) === normalizedPath && !item.q,
    );

  return rule
    ? {
        preserveSearch: rule.s !== 0,
        redirectUrl: rule.t,
        ...(ZH_CN_SMALL_BUILD_FLAT_IA_STATIC_REDIRECT_SOURCES.has(rule.p)
          ? { statusCode: 301 }
          : {}),
      }
    : null;
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
