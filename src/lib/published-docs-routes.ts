import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './platforms/registry';

export type PublishedDocsRoute = {
  canonicalPath: string;
  markdownPath: string;
  platform?: PlatformKey;
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
}: {
  canonicalPaths: Iterable<string>;
  platformPages: Iterable<PlatformPage>;
  versionByCanonicalPath?: ReadonlyMap<string, string | undefined>;
}) {
  const canonicalPathSet = new Set(canonicalPaths);
  const routes = new Map<string, PublishedDocsRoute>();

  for (const canonicalPath of canonicalPathSet) {
    routes.set(canonicalPath, {
      canonicalPath,
      markdownPath: `${canonicalPath}.md`,
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

  return {
    machineReadableRoutes: createPublishedDocsRoutes({
      canonicalPaths: canonicalPayloads.keys(),
      platformPages: publishedPlatformPages,
      versionByCanonicalPath,
    }),
    prerenderRoutes: createPublishedDocsRoutes({
      canonicalPaths,
      platformPages: publishedPlatformPages,
      versionByCanonicalPath,
    }),
  };
}
