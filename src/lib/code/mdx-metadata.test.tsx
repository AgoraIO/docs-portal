import { compile, run } from '@mdx-js/mdx';
import { load } from 'cheerio';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { DocsCodeBlock } from '@/components/code/DocsCodeBlock';
import { docs } from '../../../source.config';

async function renderCode(markdown: string) {
  if (typeof docs.docs.mdxOptions !== 'function')
    throw new Error('Expected MDX configuration');
  const options = await docs.docs.mdxOptions('bundler');
  const compiled = await compile(markdown, {
    ...options,
    outputFormat: 'function-body',
    development: false,
  });
  const { default: Content } = await run(String(compiled), runtime);
  return load(
    renderToStaticMarkup(<Content components={{ pre: DocsCodeBlock }} />),
  );
}

it('keeps curl option colors consistent across marked continuations without recoloring payload strings', async () => {
  const source = String.raw`# [!code highlight:1]
curl --location --request POST 'https://api.sd-rtn.com' \
--header 'Content-Type: application/json' \
# [!code highlight:1]
--header 'Authorization: Basic token' \
--data '{"message":"literal --header"}'`;
  const $ = await renderCode(['```bash', source, '```'].join('\n'));
  expect($('.line')).toHaveLength(4);
  expect(
    $('.line.highlighted')
      .map((_, e) => $(e).index())
      .get(),
  ).toEqual([0, 2]);
  const options = $('pre span[style]').filter((_, e) =>
    /^--[a-z-]+$/.test($(e).text()),
  );
  expect(options).toHaveLength(5);
  expect(new Set(options.map((_, e) => $(e).attr('style')).get()).size).toBe(1);
  expect(options.first().attr('style')).toContain('var(--code-token-number)');
  expect($('pre').text()).not.toContain('[!code');
  expect($('pre').text()).toContain('"message":"literal --header"');
  expect(
    $('pre span[style]')
      .filter((_, e) => $(e).text().includes('literal --header'))
      .attr('style'),
  ).toContain('var(--code-token-string)');
}, 30000);

it('does not expose an annotation-only code block', async () => {
  const $ = await renderCode('```bash\n# [!code highlight]\n```');
  expect($('pre').text()).toBe('');
}, 30000);

it('preserves diff and emphasis on the cleaned line numbers', async () => {
  const $ = await renderCode(
    '```ts\n// highlight-start\nconst old = 1; // [!code --]\n// highlight-end\nconst next = 2; // [!code ++]\n```',
  );
  expect($('pre').text()).toBe('const old = 1;\nconst next = 2;');
  expect($('.line.diff.remove.highlighted')).toHaveLength(1);
  expect($('.line.diff.add')).toHaveLength(1);
}, 30000);

it('supports explicit response metadata and disabled line numbers through the real MDX pipeline', async () => {
  if (typeof docs.docs.mdxOptions !== 'function')
    throw new Error('Expected MDX configuration');
  const options = await docs.docs.mdxOptions('bundler');
  const compiled = await compile(
    '```json title="响应" noLineNumbers\n{\n  "uid": "123"\n}\n```',
    { ...options, outputFormat: 'function-body', development: false },
  );
  const { default: Content } = await run(String(compiled), runtime);
  const $ = load(
    renderToStaticMarkup(<Content components={{ pre: DocsCodeBlock }} />),
  );
  expect($('figure').attr('data-language')).toBe('json');
  expect($('figure').attr('data-line-numbers')).toBeUndefined();
  expect($('.docs-code-shell').attr('data-variant')).toBe('output');
  expect($('pre').text()).toBe('{\n  "uid": "123"\n}');
}, 30000);
