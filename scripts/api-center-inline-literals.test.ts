import { readFileSync } from 'node:fs';
import { evaluate } from '@mdx-js/mdx';
import * as cheerio from 'cheerio';
import {
  remarkDirectiveAdmonition,
  remarkGfm,
} from 'fumadocs-core/mdx-plugins';
import { createElement, type ReactNode } from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { directiveCalloutTypes } from '../src/lib/mdx/directive-callouts';
import { remarkTableSlots } from '../src/lib/mdx/remark-table-slots';

async function renderPage(file: string) {
  const source = readFileSync(
    `content/docs/zh-CN/api-reference/${file}`,
    'utf8',
  );
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
  const { default: Content } = await evaluate(body, {
    ...runtime,
    remarkPlugins: [
      remarkGfm,
      remarkDirective,
      [
        remarkDirectiveAdmonition,
        { types: directiveCalloutTypes, useImport: false },
      ],
      remarkTableSlots,
    ],
  });
  // Layout components do not change the text that the MDX pipeline produces.
  const wrapper = ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children);
  const names = [
    'CalloutContainer',
    'CalloutTitle',
    'CalloutDescription',
    ...[...body.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map((match) => match[1]),
  ];
  const components = Object.fromEntries(names.map((name) => [name, wrapper]));
  return cheerio.load(
    renderToStaticMarkup(createElement(Content, { components })),
  );
}

describe('Chinese API literal text rendering', () => {
  it('keeps the China page-recording SD limit in the second quota table', async () => {
    const $ = await renderPage('cloud-recording/restful/quota.mdx');
    const table = $('h2')
      .filter((_, node) => $(node).text() === '转码分辨率和路数限制')
      .nextAll('table')
      .first();
    const row = table
      .find('tr')
      .filter((_, node) => $(node).find('td').first().text() === '页面录制');
    expect(row.find('td').eq(1).text().replace(/\s/g, '')).toContain('SD:100');
  });

  it.each(['ios', 'macos'])(
    'keeps the complete %s Token callback link text',
    async (platform) => {
      const $ = await renderPage(`rtc/${platform}/(current)/channel.mdx`);
      const links = $(
        'a[href*="callback_irtcengineeventhandler_onrenewtokenresult"]',
      );
      expect(links.length).toBeGreaterThan(0);
      links.each((_, node) =>
        expect($(node).text()).toContain('rtcEngine:renewTokenResult:code'),
      );
    },
  );

  it.each([
    'rtc/csharp-windows/(current)/class-screenvideoparameters.mdx',
    'rtc/harmonyos/(current)/class-screencaptureparameters.mdx',
  ])('keeps the aspect ratio in %s', async (file) => {
    const $ = await renderPage(file);
    const example = $('li').filter(
      (_, node) =>
        $(node).text().includes('2000') &&
        $(node).text().includes('dimensions'),
    );
    expect(example.length).toBe(1);
    expect(example.text()).toContain('4:3');
  });

  it('keeps the numeric value in the Android 4.6.0 JSON example', async () => {
    const $ = await renderPage('rtc/android/4.6.0/playback/drm.mdx');
    const example = $('li').filter((_, node) =>
      $(node).text().trim().startsWith('sceneType：'),
    );
    expect(example.text()).toContain('{"sceneType":1}');
  });

  it('keeps the complete private-room iOS initializer link text', async () => {
    const $ = await renderPage(
      'private-room/ios/custom-signaling/api/rtc-api.mdx',
    );
    expect($('a[href*="api_irtcengine_initialize"]').text()).toBe(
      'sharedEngineWithConfig:delegate',
    );
  });

  it('keeps all three copies of each IoT device status description', async () => {
    const $ = await renderPage('iot-apaas/client-api/full.mdx');
    for (const [value, description] of [
      [2, '设备下线'],
      [3, '设备绑定'],
      [4, '设备解绑'],
    ] as const) {
      const expected = `${value}: ${description}。`;
      expect(
        $('li').filter((_, node) => $(node).text().trim() === expected).length,
      ).toBe(3);
    }
  });
});
