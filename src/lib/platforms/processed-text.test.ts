import { describe, expect, it } from 'vitest';
import {
  buildCanonicalPlatformLLMText,
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

  it('dedents selected platform content into valid top-level markdown', () => {
    const processedText = `<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="windows" />
    ## Configure Windows [#configure-windows]

    Run the command:

    \`\`\`powershell
    Write-Output "ready"
    \`\`\`
<_PlatformProcessedMarker close="true" />`;

    expect(buildPlatformMarkdownText(processedText, 'windows')).toBe(
      `## Configure Windows

Run the command:

\`\`\`powershell
Write-Output "ready"
\`\`\``,
    );
  });

  it('removes generated heading anchor suffixes from agent markdown', () => {
    const markdown = buildCanonicalPlatformLLMText({
      pageTitle: 'Release notes',
      pageUrl: '/en/release-notes',
      processedText: '## Version 1.0 [#version-10]\n\nDetails.',
    });

    expect(markdown).toContain('## Version 1.0\n');
    expect(markdown).not.toContain('[#version-10]');
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

  it('builds canonical markdown from the page default structured platform', () => {
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
</_PlatformTabsGroup>`;

    const markdown = buildCanonicalPlatformLLMText({
      pageTitle: 'Quickstart',
      pageUrl: '/en/rtc/quickstart',
      processedText,
    });

    expect(markdown).toContain('# Quickstart (/en/rtc/quickstart)');
    expect(markdown).toContain('Shared intro');
    expect(markdown).toContain('Android body');
    expect(markdown).not.toContain('Web body');
    expect(markdown).not.toContain('_PlatformProcessedMarker');
    expect(markdown).toContain('## Platform-specific versions');
    expect(markdown).toContain('- [Android](/en/rtc/quickstart/android.md)');
    expect(markdown).toContain('- [Web](/en/rtc/quickstart/web.md)');
  });

  it('keeps each unwrapped platform group canonical fallback', () => {
    const processedText = `<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
Android setup
<_PlatformProcessedMarker close="true" />
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web setup
<_PlatformProcessedMarker close="true" />

Shared content

<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="ios" />
iOS follow-up
<_PlatformProcessedMarker close="true" />
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web follow-up
<_PlatformProcessedMarker close="true" />`;

    const markdown = buildCanonicalPlatformLLMText({
      pageTitle: 'Unwrapped groups',
      pageUrl: '/en/unwrapped-groups',
      processedText,
    });

    expect(markdown).not.toContain('Android setup');
    expect(markdown).toContain('Web setup');
    expect(markdown).not.toContain('iOS follow-up');
    expect(markdown).toContain('Web follow-up');
    expect(markdown).toContain('Shared content');
  });

  it('falls back to each group canonical platform when the page default is absent', () => {
    const processedText = `<_PlatformTabsGroup groupMode="structured" canonicalPlatform="web" platforms="[&#x22;android&#x22;,&#x22;web&#x22;]" showTabs="true">
<_PlatformPanel platform="android">
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
Android setup
<_PlatformProcessedMarker close="true" />
</_PlatformPanel>
<_PlatformPanel platform="web">
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web setup
<_PlatformProcessedMarker close="true" />
</_PlatformPanel>
</_PlatformTabsGroup>

Shared content

<_PlatformTabsGroup groupMode="structured" canonicalPlatform="web" platforms="[&#x22;ios&#x22;,&#x22;web&#x22;]" showTabs="true">
<_PlatformPanel platform="ios">
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="ios" />
iOS follow-up
<_PlatformProcessedMarker close="true" />
</_PlatformPanel>
<_PlatformPanel platform="web">
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web follow-up
<_PlatformProcessedMarker close="true" />
</_PlatformPanel>
</_PlatformTabsGroup>`;

    const markdown = buildCanonicalPlatformLLMText({
      pageTitle: 'Multiple groups',
      pageUrl: '/en/multiple-groups',
      processedText,
    });

    expect(markdown).toContain('Android setup');
    expect(markdown).not.toContain('Web setup');
    expect(markdown).not.toContain('iOS follow-up');
    expect(markdown).toContain('Web follow-up');
    expect(markdown).toContain('Shared content');
  });
});
