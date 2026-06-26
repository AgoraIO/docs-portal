import { getSourceSlugs } from '@/lib/docs-routing';
import { isKnownPlatform, type PlatformKey } from './registry';

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

  if (!platformTabs?.platforms.includes(platformCandidate)) {
    return null;
  }

  return {
    page,
    platform: platformCandidate,
    processedText,
    slugSegments: canonicalSlugSegments,
  };
}
