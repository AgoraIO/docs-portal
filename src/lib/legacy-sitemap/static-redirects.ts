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
        ...(isZhCnSmallBuildFlatIaRedirect(rule) ? { statusCode: 301 } : {}),
      }
    : null;
}

const ZH_CN_SMALL_BUILD_PRODUCT_PATHS = new Set([
  'realtime-media/meeting',
  'realtime-media/media-pull',
  'realtime-media/rtmp-gateway',
  'realtime-media/transcoding',
  'realtime-media/rtc-server-sdk',
  'realtime-media/fusion-cdn',
  'solutions/art-class',
  'solutions/chatroom/sdk',
  'solutions/chatroom/uikit',
  'solutions/game-voice',
  'solutions/meta-world',
  'solutions/smart-camera',
  'solutions/teleoperation',
  'solutions/voip-call',
]);

function isZhCnSmallBuildFlatIaRedirect(rule: StaticLegacyRedirectRule) {
  const match = rule.p.match(/^\/zh-CN\/(.+)\/build\/[^/]+\/([^/]+)$/);

  if (!match) {
    return false;
  }

  const [, productPath, page] = match;
  return (
    ZH_CN_SMALL_BUILD_PRODUCT_PATHS.has(productPath) &&
    rule.t === `/zh-CN/${productPath}/build/${page}`
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
