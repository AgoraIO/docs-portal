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
};

const staticLegacyRedirectRules = staticRedirects as StaticLegacyRedirectRule[];
const manualStaticLegacyRedirectRules: StaticLegacyRedirectRule[] = [
  {
    p: '/en/cloud-recording/get-started/getstarted',
    t: '/en/realtime-media/cloud-recording/rest-quickstart',
  },
];

export function resolveStaticLegacySitemapRedirect(
  legacyPath: string,
  legacySearch?: string,
): StaticLegacyRedirectPayload | null {
  const normalizedPath = normalizeLegacyPath(legacyPath);
  const normalizedSearch = normalizeLegacySearch(legacySearch);
  const rules = [
    ...manualStaticLegacyRedirectRules,
    ...staticLegacyRedirectRules,
  ];
  const rule =
    rules.find(
      (item) =>
        normalizeLegacyPath(item.p) === normalizedPath &&
        normalizeLegacySearch(item.q) === normalizedSearch,
    ) ??
    rules.find(
      (item) => normalizeLegacyPath(item.p) === normalizedPath && !item.q,
    );

  return rule
    ? {
        preserveSearch: rule.s !== 0,
        redirectUrl: rule.t,
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
