import { isKnownPlatform, type PlatformKey } from './registry';

const PLATFORM_BLOCK_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>\n?(?<body>[\s\S]*?)\n?<_PlatformProcessedMarker close="true" ?\/>/g;
const PLATFORM_MARKER_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>/g;

export type ProcessedPlatformTabs = {
  canonicalPlatform: PlatformKey;
  platforms: PlatformKey[];
};

export function buildCanonicalPlatformTocText(processedText: string) {
  return processedText.replace(
    PLATFORM_BLOCK_PATTERN,
    (
      _match,
      _mode: string,
      canonical: string,
      platform: string,
      body: string,
    ) => (canonical === platform ? body : ''),
  );
}

export function extractStructuredPlatformTabs(
  processedText: string,
): ProcessedPlatformTabs | undefined {
  const platforms: PlatformKey[] = [];
  let canonicalPlatform: PlatformKey | undefined;

  for (const match of processedText.matchAll(PLATFORM_MARKER_PATTERN)) {
    const { canonical, mode, platform } = match.groups ?? {};

    if (
      mode !== 'structured' ||
      !canonical ||
      !platform ||
      !isKnownPlatform(canonical) ||
      !isKnownPlatform(platform)
    ) {
      continue;
    }

    if (!canonicalPlatform) {
      canonicalPlatform = canonical;
    }

    if (!platforms.includes(platform)) {
      platforms.push(platform);
    }
  }

  if (platforms.length <= 1) {
    return undefined;
  }

  return {
    canonicalPlatform:
      canonicalPlatform && platforms.includes(canonicalPlatform)
        ? canonicalPlatform
        : platforms[0],
    platforms,
  };
}
