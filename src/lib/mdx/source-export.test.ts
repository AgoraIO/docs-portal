import { compile } from '@mdx-js/mdx';
import { remarkDirectiveAdmonition } from 'fumadocs-core/mdx-plugins';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import remarkDirective from 'remark-directive';
import { expect, it } from 'vitest';

it('preserves authored admonitions in Markdown and compiles their reading UI', async () => {
  const result = String(
    await compile(
      [
        '::::warning[Outer]',
        '',
        'Keep this warning.',
        '',
        ':::info[Inner]',
        'Keep this detail.',
        ':::',
        '',
        '```text',
        '::: this is code',
        '```',
        '',
        '::::',
      ].join('\n'),
      {
        remarkPlugins: [remarkDirective, remarkDirectiveAdmonition, remarkLLMs],
      },
    ),
  );
  const markdown = JSON.parse(
    result.match(/export let _markdown = (".*");/)?.[1] ?? '""',
  );
  expect(markdown).toContain('::::warning[Outer]');
  expect(markdown).toContain(':::info[Inner]');
  expect(markdown).toContain('Keep this detail.');
  expect(markdown).toContain('::: this is code');
  expect(result).toContain('CalloutContainer');
  expect(result).toContain('CalloutTitle');
});
