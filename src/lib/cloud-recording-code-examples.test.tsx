import { readFileSync } from 'node:fs';
import { compile, run } from '@mdx-js/mdx';
import { load } from 'cheerio';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { docs } from '../../source.config';

it('renders cloud recording requests and responses without leaking highlight directives', async () => {
  const source = readFileSync(
    'content/docs/zh-CN/realtime-media/cloud-recording/get-started/quick-start/restful-api.mdx',
    'utf8',
  );
  const configure = docs.docs.mdxOptions;
  if (typeof configure !== 'function') throw new Error('Expected MDX config');
  const options = await configure('bundler');
  const blocks = [
    ...source.matchAll(/^```(?:shell|bash|json)\n[\s\S]*?^```/gm),
  ].filter(([block]) => block.includes('curl ') || block.startsWith('```json'));
  expect(blocks).toHaveLength(6);
  for (const [block] of blocks) {
    const compiled = await compile(block, {
      ...options,
      outputFormat: 'function-body',
      development: false,
    });
    const { default: Content } = await run(String(compiled), runtime);
    const $ = load(renderToStaticMarkup(<Content />));
    const code = $('pre').text();
    expect(code).not.toMatch(/highlight-(?:start|end)|\[!code/);
    expect($('.highlighted').length).toBeGreaterThan(0);
    if (block.startsWith('```json')) {
      expect(() => JSON.parse(code)).not.toThrow();
    } else {
      expect(code.trimStart()).toMatch(/^curl /);
      expect(code).toContain("--header 'Authorization: <http_basic_auth>'");
    }
  }
}, 30000);
