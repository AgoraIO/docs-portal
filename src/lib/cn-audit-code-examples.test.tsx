import { readFileSync } from 'node:fs';
import { compile, run } from '@mdx-js/mdx';
import { load } from 'cheerio';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { docs } from '../../source.config';

async function renderedCode(block: string) {
  const configure = docs.docs.mdxOptions;
  if (typeof configure !== 'function') throw new Error('Expected MDX config');
  const compiled = await compile(block, {
    ...(await configure('bundler')),
    outputFormat: 'function-body',
    development: false,
  });
  const { default: Content } = await run(String(compiled), runtime);
  return load(renderToStaticMarkup(<Content />))('pre').text();
}

it('renders both Web package.json examples as valid copyable JSON', async () => {
  const source = readFileSync(
    'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx',
    'utf8',
  )
    .split('<PlatformStructured platform="web">')[1]
    ?.split('</PlatformStructured>')[0];
  const blocks = [...(source ?? '').matchAll(/^```json\n[\s\S]*?^```/gm)];
  expect(blocks).toHaveLength(2);
  for (const [block] of blocks) {
    const code = await renderedCode(block);
    expect(() => JSON.parse(code)).not.toThrow();
    expect(JSON.parse(code).name).toBe('agora_web_quickstart');
  }
}, 30000);

it('renders the AI stop request as a continuous curl command', async () => {
  const source = readFileSync(
    'content/docs/zh-CN/ai/get-started/quick-start.mdx',
    'utf8',
  );
  const block = [...source.matchAll(/^```(?:shell|bash)\n[\s\S]*?^```/gm)].find(
    ([value]) => value.includes('/leave'),
  )?.[0];
  expect(block).toBeDefined();
  const code = await renderedCode(block ?? '');
  expect(code).not.toMatch(/highlight-(?:start|end)|\[!code/);
  expect(code).toMatch(/curl --request POST \\\n\s+--url /);
}, 30000);
