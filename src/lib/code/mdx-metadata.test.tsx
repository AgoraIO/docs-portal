import { compile, run } from '@mdx-js/mdx';
import { load } from 'cheerio';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { DocsCodeBlock } from '@/components/code/DocsCodeBlock';
import { docs } from '../../../source.config';

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
