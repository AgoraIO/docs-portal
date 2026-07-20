import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './platforms/registry';

export type PublishedDocsRoute = {
  canonicalPath: string;
  markdownPath: string;
  platform?: PlatformKey;
  url: string;
};

type PlatformPage = {
  platforms: Iterable<string>;
  url: string;
};

export function createPublishedDocsRoutes({
  canonicalPaths,
  platformPages,
}: {
  canonicalPaths: Iterable<string>;
  platformPages: Iterable<PlatformPage>;
}) {
  const canonicalPathSet = new Set(canonicalPaths);
  const routes = new Map<string, PublishedDocsRoute>();

  for (const canonicalPath of canonicalPathSet) {
    routes.set(canonicalPath, {
      canonicalPath,
      markdownPath: `${canonicalPath}.md`,
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
        url,
      });
    }
  }

  return Array.from(routes.values()).sort((a, b) => a.url.localeCompare(b.url));
}
