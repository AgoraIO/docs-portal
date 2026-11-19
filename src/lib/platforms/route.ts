import { getSourceSlugs } from '@/lib/docs-routing';
import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './registry';

export function buildPlatformPathname(pathname: string, platform: PlatformKey) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length < 2) {
    return pathname;
  }

  const currentPlatform = segments.at(-1);
  if (currentPlatform && isKnownPlatform(currentPlatform)) {
    segments.pop();
  }

  return `/${[...segments, platform].join('/')}`;
}

type SourceLike<TPage> = {
  getPage: (slugs: string[], locale?: string) => TPage | undefined;
};

type ResolvePlatformRouteInput<TPage> = {
  extractPlatformTabs: (
    processedText: string,
  ) => { platforms: PlatformKey[] } | undefined;
  locale: string;
  readProcessedText: (page: TPage) => Promise<string>;
  slugSegments: string[];
  source: SourceLike<TPage>;
  tab: string;
};

export async function resolvePlatformRoutePage<TPage>({
  extractPlatformTabs,
  locale,
  readProcessedText,
  slugSegments,
  source,
  tab,
}: ResolvePlatformRouteInput<TPage>) {
  const platformCandidate = slugSegments.at(-1);

  if (!platformCandidate || !isKnownPlatform(platformCandidate)) {
    return null;
  }

  const platform = normalizePlatformKey(platformCandidate) as PlatformKey;

  const canonicalSlugSegments = slugSegments.slice(0, -1);
  const canonicalSlug = canonicalSlugSegments.at(-1) ?? 'index';
  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug: canonicalSlug,
      slugSegments: canonicalSlugSegments,
      tab,
    }),
    locale,
  );

  if (!page) {
    return null;
  }

  const processedText = await readProcessedText(page);
  const platformTabs = extractPlatformTabs(processedText);

  if (!platformTabs?.platforms.includes(platform)) {
    return null;
  }

  return {
    page,
    platform,
    processedText,
    slugSegments: canonicalSlugSegments,
  };
}
