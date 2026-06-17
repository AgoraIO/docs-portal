const PLATFORM_BLOCK_PATTERN =
  /<_PlatformProcessedMarker groupMode="(?<mode>inline|structured)" canonicalPlatform="(?<canonical>[a-z-]+)" platform="(?<platform>[a-z-]+)" ?\/>\n?(?<body>[\s\S]*?)\n?<_PlatformProcessedMarker close="true" ?\/>/g;

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
