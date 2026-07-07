import { describe, expect, it } from 'vitest';
import {
  buildCanonicalPlatformTocText,
  buildPlatformLLMText,
  buildPlatformMarkdownText,
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
      defaultPlatform: 'android',
      platforms: ['android', 'web'],
    });
  });

  it('defaults structured platform tabs to Android when Android is present', () => {
    const processedText = `
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="windows" />
Windows body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web body
<_PlatformProcessedMarker close="true" />
`;

    expect(extractStructuredPlatformTabs(processedText)).toEqual({
      canonicalPlatform: 'web',
      defaultPlatform: 'android',
      platforms: ['windows', 'android', 'web'],
    });
  });

  it('keeps device C as a structured platform tab', () => {
    const processedText = `
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="android" platform="android" />
Android body
<_PlatformProcessedMarker close="true" />

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="android" platform="device-c" />
Device body
<_PlatformProcessedMarker close="true" />
`;

    expect(extractStructuredPlatformTabs(processedText)).toEqual({
      canonicalPlatform: 'android',
      defaultPlatform: 'android',
      platforms: ['android', 'device-c'],
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

  it('keeps shared content and the selected platform block for markdown output', () => {
    const processedText = `Shared intro

<_PlatformTabsGroup groupMode="structured" canonicalPlatform="web" platforms="[&#x22;android&#x22;,&#x22;web&#x22;]" showTabs="true">
<_PlatformPanel platform="android">
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
Android body
<_PlatformProcessedMarker close="true" />
</_PlatformPanel>

<_PlatformPanel platform="web">
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web body
<_PlatformProcessedMarker close="true" />
</_PlatformPanel>
</_PlatformTabsGroup>

Shared outro`;

    const filtered = buildPlatformMarkdownText(processedText, 'android');

    expect(filtered).toContain('Shared intro');
    expect(filtered).toContain('Android body');
    expect(filtered).not.toContain('Web body');
    expect(filtered).not.toContain('_PlatformTabsGroup');
    expect(filtered).not.toContain('_PlatformPanel');
    expect(filtered).toContain('Shared outro');
  });

  it('builds a platform-specific markdown document header', () => {
    expect(
      buildPlatformLLMText({
        pageTitle: 'Quickstart',
        pageUrl: '/en/rtc/quickstart',
        platform: 'ios',
        processedText: 'iOS body',
      }),
    ).toBe(`# Quickstart (/en/rtc/quickstart/ios)

iOS body`);
  });
});
