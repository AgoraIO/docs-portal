import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

describe('Chinese Token examples through the production MDX registry', () => {
  it.each([
    'realtime-media/rtc/build/setup-and-access/token-authentication.mdx',
    'realtime-media/local-server-recording/build/recording-preparation/generate-token.mdx',
  ])(
    'uses one code frame and caption for every language in %s',
    async (file) => {
      const source = readFileSync(resolve('content/docs/zh-CN', file), 'utf8');
      const sample = source.match(
        /<CodeBlockTabs\b[\s\S]*?<\/CodeBlockTabs>/,
      )?.[0];
      if (!sample) throw new Error('Expected migrated Token example');
      const { container } = await renderDocsMdx(sample, 'zh-CN');
      expect(container.querySelectorAll('[role="tab"]')).toHaveLength(7);
      expect(container.querySelectorAll('figcaption')).toHaveLength(0);
      expect(container.querySelectorAll('.docs-code-tab-actions')).toHaveLength(
        7,
      );
      expect(container.querySelectorAll('#sample-code')).toHaveLength(1);
      const code = [...sample.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)].map(
        (match) => match[1].replace(/\n$/, ''),
      );
      expect(
        [...container.querySelectorAll('pre')].map((node) => node.textContent),
      ).toEqual(code);
    },
  );
});
