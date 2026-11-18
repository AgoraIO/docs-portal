import { getTableOfContents } from 'fumadocs-core/content/toc';
import { describe, expect, it } from 'vitest';
import {
  buildCanonicalPlatformLLMText,
  buildCanonicalPlatformTocText,
  buildPlatformLLMText,
  buildPlatformMarkdownText,
  buildPlatformTocText,
  extractStructuredPlatformKeys,
  extractStructuredPlatformTabs,
} from './processed-text';

describe('canonical platform toc text', () => {
  it('keeps globally deduplicated heading IDs in a noncanonical platform TOC', async () => {
    const processedText = [
      '<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="android" platform="android" />',
      '## 新增特性 [#新增特性]',
      '<_PlatformProcessedMarker close="true" />',
      '<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="android" platform="ios" />',
      '## 新增特性 [#新增特性-1]',
      '<_PlatformProcessedMarker close="true" />',
    ].join('\n\n');
    const toc = await getTableOfContents(
      buildPlatformTocText(processedText, 'ios'),
    );
    expect(toc).toEqual([{ title: '新增特性', depth: 2, url: '#新增特性-1' }]);
  });

  it('extracts a single structured platform key', () => {
    const processedText = `
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web body
<_PlatformProcessedMarker close="true" />
`;

    expect(extractStructuredPlatformKeys(processedText)).toEqual(['web']);
    expect(extractStructuredPlatformTabs(processedText)).toBeUndefined();
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
});
