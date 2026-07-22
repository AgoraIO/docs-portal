import {
  getPlatformLabel,
  isKnownPlatform,
  type PlatformKey,
} from './registry';

const PLATFORM_BLOCK_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>\n?(?<body>[\s\S]*?)\n?<_PlatformProcessedMarker close="true" ?\/>/g;
const PLATFORM_MARKER_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>/g;
const PLATFORM_TABS_GROUP_PATTERN =
  /<_PlatformTabsGroup\b[^>]*>(?<body>[\s\S]*?)<\/_PlatformTabsGroup>/g;

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
  return stripGeneratedHeadingAnchors(
    filterPlatformBlocks(
      processedText,
      (_mode, _canonical, blockPlatform) => blockPlatform === platform,
    ),
  );
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

export function buildCanonicalPlatformLLMText({
  pageTitle,
  pageUrl,
  processedText,
}: {
  pageTitle?: string;
  pageUrl: string;
  processedText: string;
}) {
  const platformTabs = extractStructuredPlatformTabs(processedText);
  const markdown = buildCanonicalPlatformMarkdownText(
    processedText,
    platformTabs?.defaultPlatform,
  );
  const platformVariants = platformTabs
    ? buildPlatformVariantsMarkdown(pageUrl, platformTabs.platforms)
    : '';

  return `# ${pageTitle ?? pageUrl} (${pageUrl})

${[stripGeneratedHeadingAnchors(markdown), platformVariants]
  .filter(Boolean)
  .join('\n\n')}`;
}

function buildCanonicalPlatformMarkdownText(
  processedText: string,
  defaultPlatform?: PlatformKey,
) {
  const groupsResolved = processedText.replace(
    PLATFORM_TABS_GROUP_PATTERN,
    (_match, body: string) => {
      const groupPlatforms: PlatformKey[] = [];
      let canonicalPlatform: PlatformKey | undefined;
      for (const marker of body.matchAll(PLATFORM_MARKER_PATTERN)) {
        const { canonical, platform } = marker.groups ?? {};
        if (!canonical || !platform || !isKnownPlatform(platform)) {
          continue;
        }

        if (!canonicalPlatform && isKnownPlatform(canonical)) {
          canonicalPlatform = canonical;
        }
        if (!groupPlatforms.includes(platform)) {
          groupPlatforms.push(platform);
        }
      }

      const selectedPlatform =
        defaultPlatform && groupPlatforms.includes(defaultPlatform)
          ? defaultPlatform
          : canonicalPlatform && groupPlatforms.includes(canonicalPlatform)
            ? canonicalPlatform
            : groupPlatforms[0];

      return selectedPlatform
        ? filterPlatformBlocks(
            body,
            (_mode, _canonical, platform) => platform === selectedPlatform,
          )
        : body;
    },
  );

  return filterPlatformBlocks(
    groupsResolved,
    (_mode, canonical, platform) => canonical === platform,
  );
}

function buildPlatformVariantsMarkdown(
  pageUrl: string,
  platforms: PlatformKey[],
) {
  return [
    '## Platform-specific versions',
    ...platforms.map(
      (platform) =>
        `- [${getPlatformLabel(platform, 'en')}](${pageUrl}/${platform}.md)`,
    ),
  ].join('\n');
}

function filterPlatformBlocks(
  processedText: string,
  include: (mode: string, canonical: string, platform: string) => boolean,
) {
  return processedText
    .replace(
      PLATFORM_BLOCK_PATTERN,
      (
        _match,
        mode: string,
        canonical: string,
        platform: string,
        body: string,
      ) =>
        include(mode, canonical, platform) ? dedentMarkdownBlock(body) : '',
    )
    .replace(/<\/?_PlatformTabsGroup\b[^>]*>\n?/g, '')
    .replace(/<\/?_PlatformPanel\b[^>]*>\n?/g, '');
}

function dedentMarkdownBlock(markdown: string) {
  const lines = markdown.split('\n');
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const commonIndent = indents.length > 0 ? Math.min(...indents) : 0;

  if (commonIndent === 0) {
    return markdown;
  }

  return lines
    .map((line) => (line.trim().length > 0 ? line.slice(commonIndent) : line))
    .join('\n');
}

function stripGeneratedHeadingAnchors(markdown: string) {
  return markdown.replace(/ \[#[^\]\n]+\](?=\n|$)/g, '');
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
