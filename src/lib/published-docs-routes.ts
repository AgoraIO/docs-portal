import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './platforms/registry';

export type PublishedDocsRoute = {
  canonicalPath: string;
  markdownPath: string;
  platform?: PlatformKey;
  defaultPlatform?: PlatformKey;
  version?: string;
  url: string;
};

type PlatformPage = {
  platforms: Iterable<string>;
  url: string;
};

export function createPublishedDocsRoutes({
  canonicalPaths,
  platformPages,
  versionByCanonicalPath = new Map(),
  defaultPlatformByCanonicalPath = new Map(),
}: {
  canonicalPaths: Iterable<string>;
  platformPages: Iterable<PlatformPage>;
  versionByCanonicalPath?: ReadonlyMap<string, string | undefined>;
  defaultPlatformByCanonicalPath?: ReadonlyMap<string, PlatformKey>;
}) {
  const canonicalPathSet = new Set(canonicalPaths);
  const routes = new Map<string, PublishedDocsRoute>();

  for (const canonicalPath of canonicalPathSet) {
    routes.set(canonicalPath, {
      canonicalPath,
      markdownPath: `${canonicalPath}.md`,
      ...(defaultPlatformByCanonicalPath.has(canonicalPath)
        ? { defaultPlatform: defaultPlatformByCanonicalPath.get(canonicalPath) }
        : {}),
      ...(versionByCanonicalPath.get(canonicalPath)
        ? { version: versionByCanonicalPath.get(canonicalPath) }
        : {}),
      url: canonicalPath,
    });
  }

  for (const page of platformPages) {
    if (!canonicalPathSet.has(page.url)) {
      continue;
    }

    for (const value of page.platforms) {
      const platform = normalizePlatformKey(value);

      if (!isKnownPlatform(platform)) {
        continue;
      }

      const url = `${page.url}/${platform}`;
      routes.set(url, {
        canonicalPath: page.url,
        markdownPath: `${url}.md`,
        platform,
        ...(defaultPlatformByCanonicalPath.has(page.url)
          ? { defaultPlatform: defaultPlatformByCanonicalPath.get(page.url) }
          : {}),
        ...(versionByCanonicalPath.get(page.url)
          ? { version: versionByCanonicalPath.get(page.url) }
          : {}),
        url,
      });
    }
  }

  return Array.from(routes.values()).sort((a, b) => a.url.localeCompare(b.url));
}

export function createStaticDocsRouteSets({
  canonicalPaths,
  canonicalPayloads,
  platformPages,
  versionByCanonicalPath,
}: {
  canonicalPaths: Iterable<string>;
  canonicalPayloads: ReadonlyMap<string, unknown>;
  platformPages: Iterable<PlatformPage>;
  versionByCanonicalPath?: ReadonlyMap<string, string | undefined>;
}) {
  const publishedPlatformPages = Array.from(platformPages).filter((page) =>
    canonicalPayloads.has(page.url),
  );
  const defaultPlatformByCanonicalPath = new Map<string, PlatformKey>();
  for (const [url, payload] of canonicalPayloads) {
    if (!payload || typeof payload !== 'object' || !('body' in payload))
      continue;
    const body = payload.body;
    if (!body || typeof body !== 'object' || !('platformTabs' in body))
      continue;
    const tabs = body.platformTabs;
    if (!tabs || typeof tabs !== 'object' || !('defaultPlatform' in tabs))
      continue;
    const platform = tabs.defaultPlatform;
    if (typeof platform === 'string' && isKnownPlatform(platform))
      defaultPlatformByCanonicalPath.set(url, platform);
  }

  return {
    machineReadableRoutes: createPublishedDocsRoutes({
      canonicalPaths: canonicalPayloads.keys(),
      platformPages: publishedPlatformPages,
      versionByCanonicalPath,
      defaultPlatformByCanonicalPath,
    }),
    prerenderRoutes: createPublishedDocsRoutes({
      canonicalPaths,
      platformPages: publishedPlatformPages,
      versionByCanonicalPath,
      defaultPlatformByCanonicalPath,
    }),
  };
}
