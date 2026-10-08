import { describe, expect, it, vi } from 'vitest';
import {
  exportPublishedCnRecords,
  extractPublishedCnSections,
} from './cn-records.server';

const url = '/zh-CN/api-reference/rtc/web/4.6.0/api';
const route = { url, canonicalPath: url, markdownPath: `${url}.md` };
const page = { url, title: 'RTC API', objectType: 'docs' as const };
describe('published CN index export', () => {
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
});
