import { isRetiredCnDocsPath } from '../retired-cn-docs.mjs';
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

const rulesByPath = new Map<string, StaticLegacyRedirectRule[]>();
for (const rule of staticRedirects as StaticLegacyRedirectRule[]) {
  const path = normalizeLegacyPath(rule.p);
  const rules = rulesByPath.get(path);
  if (rules) rules.push(rule);
  else rulesByPath.set(path, [rule]);
}

export const ZH_CN_SMALL_BUILD_FLAT_IA_STATIC_REDIRECT_SOURCES = new Set(
  Object.keys(ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS)
    .filter((path) => !isRetiredCnDocsPath(`/zh-CN/${path}`))
    .map((path) => `/zh-CN/${path}`),
);

export function resolveStaticLegacySitemapRedirect(
  legacyPath: string,
  legacySearch?: string,
): StaticLegacyRedirectPayload | null {
  const normalizedPath = normalizeLegacyPath(legacyPath);
  const normalizedSearch = normalizeLegacySearch(legacySearch);
  const candidates = rulesByPath.get(normalizedPath);
  const rule =
    candidates?.find(
      (item) => normalizeLegacySearch(item.q) === normalizedSearch,
    ) ?? candidates?.find((item) => !item.q);

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
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    return decodeURI(normalizedPath);
  } catch {
    return normalizedPath;
  }
}

function normalizeLegacySearch(search: string | undefined) {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search : `?${search}`;
}
