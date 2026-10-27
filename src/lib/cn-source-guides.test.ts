import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

async function guide(path: string) {
  const payload = await loadDocsPagePayload(
    'zh-CN',
    'realtime-media',
    path.split('/'),
  );
  if (!payload || 'redirectUrl' in payload) {
    throw new Error(`Expected a source-faithful guide at ${path}`);
  }
  return payload;
}

describe('Chinese guides retain the legacy article boundaries', {
  timeout: 30000,
}, () => {
  it.each([
    ['whiteboard-sdk', '生成 Token'],
    ['fastboard-sdk', '生成和使用 Token'],
  ])(
    'keeps the original %s SDK title and chapter order',
    async (sdk, title) => {
      const page = await guide(
        `whiteboard/${sdk}/build/setup-and-access/generate-token`,
      );
      expect(page.title).toBe(title);
      expect(
        page.toc.filter((item) => item.depth === 2).map((item) => item.title),
      ).toEqual(['生成 Token', '使用 Token', '相关信息']);
      expect(page.toc.map((item) => item.url)).toEqual(
        expect.arrayContaining([
          '#在-app-服务端生成-token',
          '#相关信息',
          '#token-相关错误',
        ]),
      );
    },
  );

  it.each(['whiteboard-sdk', 'fastboard-sdk'])(
    'keeps the original %s RESTful article independent',
    async (sdk) => {
      const page = await guide(
        `whiteboard/${sdk}/build/setup-and-access/generate-token-restful`,
      );
      expect(page.title).toBe('调用服务端 API 生成 Token');
      expect(
        page.toc.filter((item) => item.depth === 2).map((item) => item.title),
      ).toEqual(['功能介绍', '前提条件', '实现方法', '相关信息']);
      expect(page.toc.map((item) => item.url)).toEqual(
        expect.arrayContaining(['#相关信息', '#token-相关错误']),
      );
    },
  );

  it.each([
    [
      'android',
      ['登录声网控制台', '创建声网项目', '获取 App ID', '获取临时 Token'],
    ],
    [
      'web',
      [
        '登录声网控制台',
        '创建声网项目',
        '获取 App ID',
        '获取 App 证书',
        '获取临时 Token',
      ],
    ],
    [
      'mini-program',
      ['登录声网控制台', '创建声网项目', '获取 App ID', '获取临时 Token'],
    ],
  ])(
    'keeps the legacy RTC %s preparation steps',
    async (platform, headings) => {
      const page = await guide(
        `rtc/build/setup-and-access/enable-service/${platform}`,
      );
      expect(
        page.toc.filter((item) => item.depth === 2).map((item) => item.title),
      ).toEqual(headings);
    },
  );

  it('keeps RESTful credentials out of the RTC SDK setup article', async () => {
    const page = await guide(
      'rtc/build/setup-and-access/enable-service-restful',
    );
    expect(page.title).toBe('开通服务');
    expect(
      page.toc.filter((item) => item.depth === 2).map((item) => item.title),
    ).toEqual([
      '登录声网控制台',
      '创建声网项目',
      '获取 App ID',
      '获取客户 ID 和客户密钥',
    ]);
    expect(page.toc.map((item) => item.url)).toEqual(
      expect.arrayContaining([
        '#登录声网控制台',
        '#创建声网项目',
        '#获取-app-id',
      ]),
    );
  });
});
