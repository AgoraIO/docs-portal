import { describe, expect, it } from 'vitest';
import { buildCanonicalPlatformTocText } from './processed-text';

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
});
