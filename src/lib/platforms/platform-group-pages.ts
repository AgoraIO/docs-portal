import type { Node, Root } from 'fumadocs-core/page-tree';
import {
  getCanonicalPlatform,
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './registry';

export type PlatformGroupPageData = {
  defaultPlatform?: unknown;
  description?: string;
  layout?: unknown;
  platforms?: unknown;
  title?: string;
};

export type PlatformGroupSourcePage = {
  data: PlatformGroupPageData;
  path: string;
  slugs: string[];
  url: string;
};

export type PlatformGroupPanel = {
  contentPath: string;
  platform: PlatformKey;
};

export type PlatformGroupDefinition = {
  canonicalPlatform: PlatformKey;
  panels: PlatformGroupPanel[];
  platforms: PlatformKey[];
};

export function isPlatformGroupIndexPage(page: PlatformGroupSourcePage) {
  return page.data.layout === 'platform-group';
}

export function getPlatformGroupPlatforms(
  page: PlatformGroupSourcePage,
): PlatformKey[] {
  if (!isPlatformGroupIndexPage(page) || !Array.isArray(page.data.platforms)) {
    return [];
  }

  const platforms: PlatformKey[] = [];
  const seen = new Set<PlatformKey>();

  for (const rawPlatform of page.data.platforms) {
    if (typeof rawPlatform !== 'string') {
      continue;
    }

    const platform = normalizePlatformKey(rawPlatform);
    if (!isKnownPlatform(platform) || seen.has(platform)) {
      continue;
    }

    platforms.push(platform);
    seen.add(platform);
  }

  return platforms;
}

export function resolvePlatformGroupDefinition(
  page: PlatformGroupSourcePage,
  pages: readonly PlatformGroupSourcePage[],
): PlatformGroupDefinition | null {
  const platforms = getPlatformGroupPlatforms(page);

  if (platforms.length === 0) {
    return null;
  }

  const pagePathSet = new Set(pages.map((item) => item.path));
  const panels = platforms.flatMap((platform) => {
    const contentPath = getPlatformPanelContentPath(
      page.path,
      platform,
      pagePathSet,
    );

    return contentPath ? [{ contentPath, platform }] : [];
  });

  if (panels.length === 0) {
    return null;
  }

  const panelPlatforms = panels.map((panel) => panel.platform);
  const defaultPlatform =
    typeof page.data.defaultPlatform === 'string'
      ? normalizePlatformKey(page.data.defaultPlatform)
      : undefined;
  const canonicalPlatform =
    defaultPlatform &&
    isKnownPlatform(defaultPlatform) &&
    panelPlatforms.includes(defaultPlatform)
      ? defaultPlatform
      : (getCanonicalPlatform(panelPlatforms).platform as PlatformKey);

  return {
    canonicalPlatform,
    panels,
    platforms: panelPlatforms,
  };
}

export function isPlatformGroupPanelPage(
  page: PlatformGroupSourcePage,
  pages: readonly PlatformGroupSourcePage[],
) {
  return resolvePlatformGroupParentPage(page, pages) !== null;
}

export function resolvePlatformGroupParentPage(
  page: PlatformGroupSourcePage,
  pages: readonly PlatformGroupSourcePage[],
) {
  const parentPaths = getPlatformGroupParentIndexPathCandidates(page.path);

  if (parentPaths.length === 0) {
    return null;
  }

  const parent = pages.find(
    (item) => parentPaths.includes(item.path) && isPlatformGroupIndexPage(item),
  );

  if (!parent) {
    return null;
  }

  const definition = resolvePlatformGroupDefinition(parent, pages);

  if (!definition?.panels.some((panel) => panel.contentPath === page.path)) {
    return null;
  }

  return parent;
}

export function getCanonicalSourcePages<T extends PlatformGroupSourcePage>(
  pages: readonly T[],
): T[] {
  return pages.filter((page) => !isPlatformGroupPanelPage(page, pages));
}

export function getPlatformGroupPanelUrls(
  pages: readonly PlatformGroupSourcePage[],
) {
  const urls = new Set<string>();

  for (const page of pages) {
    if (isPlatformGroupPanelPage(page, pages)) {
      urls.add(page.url);
    }
  }

  return urls;
}

export function filterPlatformGroupPanelNodes<T extends Root>(
  root: T,
  panelUrls: ReadonlySet<string>,
): T {
  const nextRoot = {
    ...root,
    children: root.children.flatMap((node) =>
      filterPlatformGroupPanelNode(node, panelUrls),
    ),
  };

  if (root.fallback) {
    return {
      ...nextRoot,
      fallback: filterPlatformGroupPanelNodes(root.fallback, panelUrls),
    };
  }

  return nextRoot;
}

function filterPlatformGroupPanelNode(
  node: Node,
  panelUrls: ReadonlySet<string>,
): Node[] {
  if (node.type === 'page') {
    return panelUrls.has(node.url) ? [] : [node];
  }

  if (node.type === 'separator') {
    return [node];
  }

  const index =
    node.index && panelUrls.has(node.index.url) ? undefined : node.index;
  const children = node.children.flatMap((child) =>
    filterPlatformGroupPanelNode(child, panelUrls),
  );

  if (!index && children.length === 0) {
    return [];
  }

  return [
    {
      ...node,
      children,
      index,
    },
  ];
}

function getPlatformPanelContentPath(
  indexPath: string,
  platform: PlatformKey,
  pagePathSet: ReadonlySet<string>,
) {
  for (const candidate of getPlatformPanelContentPathCandidates(
    indexPath,
    platform,
  )) {
    if (pagePathSet.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getPlatformPanelContentPathCandidates(
  indexPath: string,
  platform: PlatformKey,
) {
  const match = indexPath.match(/^(.*\/)?index\.(mdx?)$/);

  if (!match) {
    return [];
  }

  const directory = match[1] ?? '';
  const preferredExtension = match[2] ?? 'mdx';
  const fallbackExtension = preferredExtension === 'mdx' ? 'md' : 'mdx';

  return [
    `${directory}${platform}.${preferredExtension}`,
    `${directory}${platform}.${fallbackExtension}`,
  ];
}

function getPlatformGroupParentIndexPathCandidates(path: string) {
  const match = path.match(/^(.*\/)?([^/.]+)\.(mdx?)$/);

  if (!match) {
    return [];
  }

  const directory = match[1] ?? '';
  const platform = normalizePlatformKey(match[2] ?? '');
  const extension = match[3] ?? 'mdx';

  if (!isKnownPlatform(platform)) {
    return [];
  }

  const fallbackExtension = extension === 'mdx' ? 'md' : 'mdx';

  return [
    `${directory}index.${extension}`,
    `${directory}index.${fallbackExtension}`,
  ];
}
