import { isKnownPlatform, type PlatformKey } from './registry';

const PLATFORM_BLOCK_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>\n?(?<body>[\s\S]*?)\n?<_PlatformProcessedMarker close="true" ?\/>/g;
const PLATFORM_MARKER_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>/g;

export type ProcessedPlatformTabs = {
  canonicalPlatform: PlatformKey;
  defaultPlatform: PlatformKey;
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

export function buildPlatformMarkdownText(
  processedText: string,
  platform: PlatformKey,
) {
  return processedText
    .replace(
      PLATFORM_BLOCK_PATTERN,
      (
        _match,
        _mode: string,
        _canonical: string,
        blockPlatform: string,
        body: string,
      ) => (blockPlatform === platform ? body : ''),
    )
    .replace(/<\/?_PlatformTabsGroup\b[^>]*>\n?/g, '')
    .replace(/<\/?_PlatformPanel\b[^>]*>\n?/g, '');
}

export function buildPlatformLLMText({
  pageTitle,
  pageUrl,
  platform,
  processedText,
}: {
  pageTitle?: string;
  pageUrl: string;
  platform: PlatformKey;
  processedText: string;
}) {
  return `# ${pageTitle ?? pageUrl} (${pageUrl}/${platform})

${buildPlatformMarkdownText(processedText, platform)}`;
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
    defaultPlatform: getDefaultStructuredPlatform(platforms),
    platforms,
  };
}

function getDefaultStructuredPlatform(platforms: PlatformKey[]) {
  if (platforms.includes('android')) {
    return 'android';
  }

  const fallback = platforms[0];

  if (!fallback) {
    throw new Error('Cannot resolve default platform from an empty group.');
  }

  return fallback;
}
