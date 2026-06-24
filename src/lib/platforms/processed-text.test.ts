import { describe, expect, it } from 'vitest';
import {
  buildCanonicalPlatformTocText,
  extractStructuredPlatformTabs,
} from './processed-text';

describe('canonical platform toc text', () => {
  it('keeps shared content and only canonical structured-platform headings', () => {
    const processedText = `
# Page title

Shared intro

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
## Install Android SDK
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
## Install Web SDK
Web body
<_PlatformProcessedMarker close="true" />

## Shared follow-up
`;

    const filtered = buildCanonicalPlatformTocText(processedText);

    expect(filtered).toContain('## Install Web SDK');
    expect(filtered).not.toContain('## Install Android SDK');
    expect(filtered).toContain('## Shared follow-up');
  });

  it('extracts page-level structured platform tab metadata', () => {
    const processedText = `
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="inline" canonicalPlatform="web" platform="ios" />
iOS inline body
<_PlatformProcessedMarker close="true" />
`;

    expect(extractStructuredPlatformTabs(processedText)).toEqual({
      canonicalPlatform: 'web',
      platforms: ['android', 'web'],
    });
  });

  it('does not expose header platform tabs for a single structured platform', () => {
    const processedText = `
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web body
<_PlatformProcessedMarker close="true" />
`;

    expect(extractStructuredPlatformTabs(processedText)).toBeUndefined();
  });
});
