import { existsSync, readFileSync } from 'node:fs';

import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { extractStructuredPlatformTabs } from '@/lib/platforms/processed-text';
import { remarkPlatformContent } from '@/lib/platforms/remark-platform-content';

const files = [
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/join-and-manage-channels/compile-run-sample-project.mdx',
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/reference/supported-platforms.mdx',
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/manage-connection-and-quality/pre-call-tests.mdx',
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
];

describe('next video complex pages', () => {
  for (const file of files) {
    it(`${file.split('/').at(-1)} exists and keeps PlatformStructured`, () => {
      expect(existsSync(file)).toBe(true);

      const content = readFileSync(file, 'utf8');

      expect(content).toContain('<PlatformStructured');
      expect(content).not.toContain('platform="react-js"');
      expect(content).not.toContain('<Tabs defaultValue="tab1">\n<Tabs defaultValue="tab1">');
      expect(content).not.toContain('</Tabs></Tabs>');
      expect(content).not.toContain('<TabItem');
      expect(content).not.toContain('</TabItem>');
    });
  }

  for (const file of files) {
    it(`${file.split('/').at(-1)} compiles with platform grouping`, async () => {
      const content = readFileSync(file, 'utf8');

      await expect(
        compile(content, {
          jsx: true,
          remarkPlugins: [remarkPlatformContent],
        }),
      ).resolves.toBeDefined();
    });
  }

  it('compile-run-sample-project avoids CodeBlockTabs inside list items', () => {
    const file =
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/join-and-manage-channels/compile-run-sample-project.mdx';
    const content = readFileSync(file, 'utf8');

    expect(content).not.toContain(
      '- The following, depending on your target platform:\n    <CodeBlockTabs',
    );
  });

  it('authentication-workflow excludes linux-c and keeps macos implementation content', async () => {
    const file =
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/authenticate-users/authentication-workflow.mdx';
    const content = readFileSync(file, 'utf8');

    expect(content).toContain('<PlatformStructured platform="macos">');
    expect(content).not.toContain(
      '<PlatformStructured platform="macos">\n\n</PlatformStructured>',
    );

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
        'electron',
        'flutter',
        'ios',
        'macos',
        'javascript',
        'react-native',
        'unity',
        'unreal',
        'blueprint',
        'web',
        'windows',
      ],
    });
  });
});
