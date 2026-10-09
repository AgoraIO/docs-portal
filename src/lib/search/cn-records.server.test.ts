import { describe, expect, it, vi } from 'vitest';
import {
  exportPublishedCnRecords,
  extractPublishedCnSections,
} from './cn-records.server';

const url = '/zh-CN/api-reference/rtc/web/4.6.0/api';
const route = { url, canonicalPath: url, markdownPath: `${url}.md` };
const page = { url, title: 'RTC API', objectType: 'docs' as const };
describe('published CN index export', () => {
  it.each(['c++', 'objective-c', ''])(
    'keeps following headings after table-cell fences with language %s',
    (language) => {
      const markdown = `# RTC API\n\n    ## 版本 [#version]\n\n    | 新 | 旧 |\n    | --- | --- |\n    | \`\`\`${language}\n    newDependency();\n    \`\`\` | \`\`\`${language}\n    oldDependency();\n    \`\`\` |\n\n    ### 改进 [#improved]\n\n    优化连接。`;
      const records = extractPublishedCnSections(
        { ...route, platform: 'android' },
        page,
        markdown,
      );
      expect(records.map((record) => record.url)).toEqual([
        `${url}#version`,
        `${url}#improved`,
      ]);
      expect(records[0].content).toContain('newDependency();');
      expect(records[0].content).toContain('oldDependency();');
    },
  );
  it('merges records whose corrected anchors resolve to the same rendered chapter', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n## 同一章节 [#outdated]\n\n前半内容。\n\n## 同一章节 [#current]\n\n后半内容。',
      readRenderedHtml: async () =>
        '<article><h2 id="current">同一章节</h2></article>',
    });
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(`${url}::heading:current`);
    expect(records[0].content).toContain('前半内容。');
    expect(records[0].content).toContain('后半内容。');
  });
  it('splits renderer-annotated headings inside an indented platform block without splitting fenced examples', () => {
    const markdown =
      '# RTC API\n\n简介。\n\n    平台说明。\n\n    ## 技术原理 [#技术原理]\n\n    加密原理。\n\n    ```java\n    // ## 示例标题 [#not-a-section]\n    enableEncryption();\n    ```\n\n    ## 实现方法 [#实现方法]\n\n    调用 enableEncryption。';
    const records = extractPublishedCnSections(
      { ...route, platform: 'android' },
      page,
      markdown,
    );
    expect(records.map((record) => record.url)).toEqual([
      url,
      `${url}#技术原理`,
      `${url}#实现方法`,
    ]);
    expect(records[1].content).toContain('enableEncryption();');
    expect(records[1].platform).toEqual(['android']);
  });

  it('keeps an ordinary indented code example intact without platform renderer metadata', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n    ## 示例 [#sample]\n    code();',
    );
    expect(records.map((record) => record.url)).toEqual([url]);
  });
  it('preserves both table-cell code examples without swallowing later release-note headings', () => {
    const markdown =
      '# RTC API\n\n    ## 版本 [#version]\n\n    | 新 | 旧 |\n    | --- | --- |\n    | ```groovy\n    newDependency();\n    ``` | ```groovy\n    oldDependency();\n    ``` |\n\n    ### 改进 [#improved]\n\n    优化连接。';
    const records = extractPublishedCnSections(
      { ...route, platform: 'android' },
      page,
      markdown,
    );
    expect(records.map((record) => record.url)).toEqual([
      `${url}#version`,
      `${url}#improved`,
    ]);
    expect(records[0].content).toContain('newDependency();');
    expect(records[0].content).toContain('oldDependency();');
    expect(records[1].content).toContain('优化连接。');
  });
  it('uses the rendered heading ID when processed Markdown carries an outdated anchor', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n## Heartbeat Interval 与 Presence Timeout [#outdated]\n\n连接说明。',
      readRenderedHtml: async () =>
        '<article><h2 id="heartbeatinterval-and-presencetimeout">Heartbeat Interval 与 Presence Timeout</h2></article>',
    });
    expect(records[0].url).toBe(`${url}#heartbeatinterval-and-presencetimeout`);
  });
  it('preserves all explicit FAQ products and normalizes its platform labels', () => {
    const url = '/zh-CN/reference/faq/account/billing_basis';
    const [record] = extractPublishedCnSections(
      { url, canonicalPath: url, markdownPath: `${url}.md` },
      { url, title: '计时方式' },
      '# 计时方式\n\nFAQ 正文。',
    );
    expect(record).toMatchObject({
      products: ['local-server-recording', 'rtc', 'analytics'],
    });
    expect(record.platform).toBeUndefined();
  });

  it('tags cloud recording FAQ with RESTful instead of the reference folder', () => {
    const url = '/zh-CN/reference/faq/integration/return_404';
    const [record] = extractPublishedCnSections(
      { url, canonicalPath: url, markdownPath: `${url}.md` },
      { url, title: 'query 返回 404' },
      '# query 返回 404\n\nFAQ 正文。',
    );
    expect(record).toMatchObject({
      product: 'cloud-recording',
      products: ['cloud-recording'],
      platform: ['restful'],
    });
  });
  it('preserves IDs containing brackets and merges headings sharing a renderer anchor', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# API\n\n## 类型定义 [#config]\n\n### Config [#config]\n\n配置。\n\n## loadAudioSettings\\[1/2] [#loadaudiosettings[1/2]]\n\n加载音频。\n\n### [#empty-parameters]\n\n参数。',
    );
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      sectionTitle: 'Config',
      url: `${url}#config`,
    });
    expect(records[1]).toMatchObject({
      sectionTitle: 'loadAudioSettings[1/2]',
      url: `${url}#loadaudiosettings[1/2]`,
    });
    expect(records[1].content).toContain('参数。');
  });
  it('uses Fumadocs published heading IDs instead of slugging the anchor annotation', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n## 加入频道 [#joinChannel]\n\n调用 joinChannel。',
    );
    expect(records[0]).toMatchObject({
      url: `${url}#joinChannel`,
      sectionTitle: '加入频道',
      content: '加入频道\n调用 joinChannel。',
    });
  });
  it('keeps section anchors, duplicate heading slugs, code identifiers and platform/version metadata', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n> For AI agents: see index.\n\n<a id="renewToken"></a>\n\n## Token\n\n调用 `renewToken`。\n\n### 参数\n\n```ts\nfiller_words.enable = true\n```\n\n## Token\n\n续期。',
    );
    expect(records.map((record) => record.url)).toEqual([
      `${url}#renewToken`,
      `${url}#参数`,
      `${url}#token-1`,
    ]);
    expect(records[0]).toMatchObject({
      product: 'rtc',
      tab: 'api-reference',
      platform: ['web'],
      version: '4.6.0',
    });
    expect(records[1].content).toContain('filler_words.enable');
    expect(records[1].headingPath).toEqual(['RTC API', 'Token', '参数']);
  });
  it('includes published OpenAPI and platform variants while excluding pages outside site navigation', async () => {
    const canonical = '/zh-CN/api-reference/api-ref/conversational-ai/join';
    const readMarkdown = vi
      .fn()
      .mockResolvedValue(
        '# Join\n\n## 请求\n\n<table><tr><td>Token</td></tr></table>',
      );
    const records = await exportPublishedCnRecords({
      pages: [{ url: canonical, title: 'Join', objectType: 'openapi' }],
      routes: [
        {
          url: canonical,
          canonicalPath: canonical,
          markdownPath: `${canonical}.md`,
        },
        {
          url: `${canonical}/web`,
          canonicalPath: canonical,
          markdownPath: `${canonical}/web.md`,
          platform: 'web',
        },
        {
          url: '/zh-CN/hidden',
          canonicalPath: '/zh-CN/hidden',
          markdownPath: '/zh-CN/hidden.md',
        },
      ],
      readMarkdown,
    });
    expect(readMarkdown).toHaveBeenCalledTimes(2);
    expect(records[0]).toMatchObject({
      docType: 'openapi',
      product: 'conversational-ai',
      content: '请求\nToken',
      url: canonical,
      headingPath: ['Join'],
    });
    expect(records[1].platform).toEqual(['web']);
  });
  it('fails before publishing if a published artifact is missing or the export is empty', async () => {
    await expect(
      exportPublishedCnRecords({
        routes: [route],
        pages: [],
        readMarkdown: vi.fn(),
      }),
    ).rejects.toThrow('No published CN');
    await expect(
      exportPublishedCnRecords({
        routes: [route],
        pages: [page],
        readMarkdown: async () => {
          throw new Error('missing artifact');
        },
      }),
    ).rejects.toThrow('missing artifact');
  });
  it('indexes rendered platform variants instead of headings hidden in canonical tabs', async () => {
    const readMarkdown = vi
      .fn()
      .mockResolvedValue('# RTC API\n\n## Token [#token]\n\nWeb 内容。');
    const records = await exportPublishedCnRecords({
      pages: [page],
      routes: [
        route,
        {
          ...route,
          url: `${url}/web`,
          markdownPath: `${url}/web.md`,
          platform: 'web',
        },
      ],
      readMarkdown,
    });
    expect(readMarkdown).toHaveBeenCalledOnce();
    expect(records[0]).toMatchObject({
      url: `${url}/web#token`,
      platform: ['web'],
    });
  });

  it.each([
    [
      '/zh-CN/solutions/showroom/get-started/run-example',
      { product: 'showroom' },
    ],
    [
      '/zh-CN/api-reference/rtc/csharp-windows/rtc-api-overview',
      { product: 'rtc', platform: ['csharp'] },
    ],
    [
      '/zh-CN/api-reference/rtc/react-sdk/overview',
      { product: 'rtc', platform: ['web'] },
    ],
    [
      '/zh-CN/api-reference/rtc/csharp-windows/audio/audio-basic',
      { product: 'rtc', platform: ['csharp'] },
    ],
    [
      '/zh-CN/api-reference/rtc/react-sdk/hooks',
      { product: 'rtc', platform: ['web'] },
    ],
    [
      '/zh-CN/api-reference/rtc/cpp-all-platforms/audio/audio-basic',
      { product: 'rtc', platform: ['cpp'] },
    ],
    [
      '/zh-CN/api-reference/rtc/android/channel',
      { product: 'rtc', platform: ['android'], version: '4.6.2' },
    ],
  ])('derives metadata for %s', (url, expected) => {
    const records = extractPublishedCnSections(
      {
        url,
        canonicalPath: url,
        markdownPath: `${url}.md`,
        ...(url.endsWith('/channel') ? { version: '4.6.2' } : {}),
      },
      { url, title: 'Example', objectType: 'docs' },
      '# Example\n\n## Section\n\nContent.',
    );

    expect(records[0]).toMatchObject(expected);
  });
});
