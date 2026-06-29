import { readFileSync } from 'node:fs';

import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { extractStructuredPlatformTabs } from '@/lib/platforms/processed-text';
import { remarkPlatformContent } from '@/lib/platforms/remark-platform-content';

describe('voice stream-raw-audio platforms', () => {
  it('includes web in the structured platform tabs', async () => {
    const file =
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/voice/build/customize-audio-processing/stream-raw-audio.mdx';
    const content = readFileSync(file, 'utf8');

    expect(content).toContain('<PlatformStructured platform="web">');
    expect(content).toContain('Web Audio API');
    expect(content).toContain('/images/video-sdk/process-raw-audio-web.svg');

    const compiled = String(
      await compile(content, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    );

    expect(extractStructuredPlatformTabs(compiled)).toEqual({
      canonicalPlatform: 'web',
      platforms: [
        'android',
        'ios',
        'macos',
        'web',
        'windows',
        'electron',
        'flutter',
        'react-native',
        'unity',
      ],
    });
  });
});
