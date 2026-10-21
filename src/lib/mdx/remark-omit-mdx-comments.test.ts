import { compile } from '@mdx-js/mdx';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import { expect, it } from 'vitest';
import { remarkOmitMdxComments } from './remark-omit-mdx-comments';

it('omits hidden MDX content from public Markdown while preserving code examples and expressions', async () => {
  const compiled = String(
    await compile(
      [
        '## Active',
        '',
        '{/* <Card href="/retired-product">Retired product</Card> */}',
        '',
        'Before {/* retired-inline */} after.',
        '',
        '{/* explanation */ "Visible expression"}',
        '',
        '```jsx',
        '{/* keep this code example */}',
        '```',
      ].join('\n'),
      { remarkPlugins: [remarkOmitMdxComments, remarkLLMs] },
    ),
  );
  const match = compiled.match(/export let _markdown = (".*");/);
  expect(match).not.toBeNull();
  const markdown = JSON.parse(match?.[1] ?? '""') as string;
  expect(markdown).toContain('## Active');
  expect(markdown).not.toContain('retired-product');
  expect(markdown).not.toContain('retired-inline');
  expect(markdown).toContain('Visible expression');
  expect(markdown).toContain('{/* keep this code example */}');
});
