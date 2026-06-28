import { readFileSync } from 'node:fs';

import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { extractStructuredPlatformTabs } from '@/lib/platforms/processed-text';
import { remarkPlatformContent } from '@/lib/platforms/remark-platform-content';

describe('voice ai-noise-suppression platforms', () => {
  it('includes the migrated voice platforms from legacy docs', async () => {
    const file =
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/voice/build/enhance-the-audio-experience/ai-noise-suppression.mdx';
    const content = readFileSync(file, 'utf8');

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
        'javascript',
      ],
    });
  });
});
