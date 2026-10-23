import { readFileSync } from 'node:fs';
import { compile, run } from '@mdx-js/mdx';
import { load } from 'cheerio';
import type { ReactNode } from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { docs } from '../../source.config';

const source = readFileSync(
  'content/docs/zh-CN/realtime-media/rtm/build/messaging/send-message.mdx',
  'utf8',
).split('## 消息负载包体积限制')[0];

it('groups every RTM string/binary pair and leaves callbacks outside its tabs', async () => {
  const configure = docs.docs.mdxOptions;
  if (typeof configure !== 'function') throw new Error('Expected MDX config');
  const options = await configure('bundler');
  let paired = 0;
  let single = 0;
  let unsupported = 0;
  for (const panel of source.matchAll(
    /<PlatformStructured platform="([^"]+)">([\s\S]*?)<\/PlatformStructured>/g,
  )) {
    const blocks = [...panel[2].matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)];
    if (blocks.length === 0) {
      unsupported++;
      continue;
    }
    const first = blocks[0];
    const last = blocks.at(-1);
    if (!first || !last) throw new Error('Missing example block');
    const examples = panel[2].slice(first.index, last.index + last[0].length);
    const compiled = await compile(examples, {
      ...options,
      outputFormat: 'function-body',
      development: false,
    });
    const { default: Content } = await run(String(compiled), runtime);
    const $ = load(
      renderToStaticMarkup(
        <Content
          components={{
            CodeBlockTabs: ({ children }: { children: ReactNode }) => (
              <div data-example-tabs>{children}</div>
            ),
            CodeBlockTabsList: ({ children }: { children: ReactNode }) => (
              <div>{children}</div>
            ),
            CodeBlockTabsTrigger: ({ children }: { children: ReactNode }) => (
              <button type="button">{children}</button>
            ),
            CodeBlockTab: ({ children }: { children: ReactNode }) => (
              <section>{children}</section>
            ),
          }}
        />,
      ),
    );
    if (blocks.length === 1) {
      single++;
      expect($('[data-example-tabs]')).toHaveLength(0);
      expect($('pre')).toHaveLength(1);
      continue;
    }
    paired++;
    expect($('[data-example-tabs]'), panel[1]).toHaveLength(1);
    expect(
      $('[data-example-tabs] button')
        .map((_, e) => $(e).text())
        .get(),
    ).toEqual(['字符串消息', '二进制消息']);
    expect($('[data-example-tabs] pre')).toHaveLength(2);
    expect($('pre')).toHaveLength(blocks.length);
    if (blocks.length === 3) {
      expect($('[data-example-tabs]').text()).not.toContain(
        'class RtmEventHandler',
      );
      expect($('pre').last().text()).toContain('class RtmEventHandler');
    }
  }
  expect({ paired, single, unsupported }).toEqual({
    paired: 23,
    single: 2,
    unsupported: 1,
  });
}, 30000);
