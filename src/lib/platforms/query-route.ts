import { normalizePlatformKey, platformRegistry } from './registry';

export type PlatformQueryIndex = {
  targets: Record<string, Record<string, string>>;
  platforms: Record<string, string>;
};

type PlatformRoute = {
  canonicalPath?: string;
  url?: string;
  platform?: string;
};

function routeKey(pathname: string) {
  let path: string;
  try {
    path = decodeURI(pathname).replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
  return /^\/(?:introduction|realtime-media|solutions|api-reference|reference|ai)(?:\/|$)/.test(
    path,
  )
    ? `/zh-CN${path}`
    : path;
}

function normalizeQueryPlatform(value: string) {
  const platform = normalizePlatformKey(value.trim().toLowerCase());
  return Object.hasOwn(platformRegistry, platform) ? platform : undefined;
}

/** Only published, unambiguous variants are eligible for compatibility URLs. */
export function createPlatformQueryIndex(
  routes: Iterable<PlatformRoute>,
): PlatformQueryIndex {
  const targets: PlatformQueryIndex['targets'] = Object.create(null);
  const platforms: PlatformQueryIndex['platforms'] = Object.create(null);
  const ambiguous = new Set<string>();
  for (const route of routes) {
    if (!route.platform || !route.canonicalPath || !route.url) continue;
    const platform = normalizeQueryPlatform(route.platform);
    if (!platform) continue;
    const canonical = routeKey(route.canonicalPath);
    const target = routeKey(route.url);
    if (!canonical || !target) continue;
    platforms[target] = platform;
    const key = `${canonical}\0${platform}`;
    targets[canonical] ??= Object.create(null);
    const variants = targets[canonical];
    if (ambiguous.has(key)) continue;
    if (variants[platform] && variants[platform] !== target) {
      delete variants[platform];
      ambiguous.add(key);
    } else {
      variants[platform] = target;
    }
  }
  return { targets, platforms };
}

export function getPlatformForUrl(url: URL, index: PlatformQueryIndex) {
  const path = routeKey(url.pathname);
  if (Object.hasOwn(index.platforms, path)) return index.platforms[path];
  const platform = normalizeQueryPlatform(
    url.searchParams.get('platform') ?? '',
  );
  if (!platform || !Object.hasOwn(index.targets, path)) return undefined;
  return Object.hasOwn(index.targets[path], platform) ? platform : undefined;
}

/** Resolve query selection without changing the caller's URL or unrelated state. */
export function resolvePlatformQueryUrl(
  url: URL,
  index: PlatformQueryIndex,
): URL | null {
  if (!url.searchParams.has('platform')) return null;
  const platform = getPlatformForUrl(url, index);
  if (!platform) return null;
  const path = routeKey(url.pathname);
  const target = Object.hasOwn(index.platforms, path)
    ? path
    : index.targets[path][platform];
  const next = new URL(url.href);
  next.pathname = url.pathname.startsWith('/zh-CN/')
    ? target
    : target.replace(/^\/zh-CN(?=\/)/, '');
  next.searchParams.delete('platform');
  return next;
}

/** Run before router creation so static hydration cannot reuse a default variant. */
export function normalizeInitialPlatformLocation(index: PlatformQueryIndex) {
  if (typeof window === 'undefined') return;
  const next = resolvePlatformQueryUrl(new URL(window.location.href), index);
  if (next) {
    window.history.replaceState(
      window.history.state,
      '',
      `${next.pathname}${next.search}${next.hash}`,
    );
  }
}
