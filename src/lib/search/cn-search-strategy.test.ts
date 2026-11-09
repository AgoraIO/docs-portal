import { describe, expect, it } from 'vitest';
import { buildCnSearchDocument } from './cn-search-strategy';
import type { SearchSection } from './kb-record';

const section: SearchSection = {
  id: 'dual-stream',
  url: '/realtime-media/rtc/build/video/multi-user-video#enable',
  pageTitle: '多人视频场景',
  sectionTitle: '发流端开启双流模式',
  content: '调用 enableDualStream 开启双流模式。',
  headingPath: ['多人视频场景', '实现步骤', '发流端开启双流模式'],
  locale: 'zh-CN',
  product: 'rtc',
  docType: 'docs',
  audience: ['developer'],
  status: 'published',
  hidden: false,
};
describe('CN guide heading relevance', () => {
  it.each([
    'SDK 的代码被混淆时需保留这些类。',
    '启用字段混淆时，保留 autoShape 属性。',
    'R8/ProGuard 缩减和混淆的配置方法。',
    'SDK 代码经过 uglify-js 混淆后的语义变化。',
  ])(
    'indexes code obfuscation context without rewriting prose: %s',
    (content) => {
      expect(
        buildCnSearchDocument({ ...section, aliases: ['existing'], content }),
      ).toMatchObject({ aliases: ['existing', '代码混淆'], content });
    },
  );

  it.each([
    'bps 不要和 kbps 及 Bps 混淆。',
    '以下代码生成 Chat Token，不要和 RTC Token 混淆。',
    '避免混淆 Mute 状态和发布状态。',
  ])('does not label ordinary confusion as code obfuscation: %s', (content) => {
    expect(
      buildCnSearchDocument({ ...section, content }).aliases,
    ).toBeUndefined();
  });

  it('does not promote upgrade instructions as a first-time SDK entry', () => {
    expect(
      buildCnSearchDocument({
        ...section,
        url: '/realtime-media/rtm/reference/migration-guide/cpp#integration',
        pageTitle: '迁移指南',
        sectionTitle: '集成 SDK',
        platform: ['cpp'],
      }).languageEntryTerms,
    ).toEqual([]);
  });
  it('distinguishes SDK entry headings from incidental language examples', () => {
    const download = buildCnSearchDocument({
      ...section,
      url: '/realtime-media/rtc/reference/downloads/windows#nuget',
      pageTitle: '下载',
      sectionTitle: '通过 NuGet 集成 SDK (C#)',
      platform: ['windows'],
    });
    expect(download).toMatchObject({
      languageEntryTerms: ['csharp'],
      languageEntryRank: 0,
    });
    const example = buildCnSearchDocument({
      ...section,
      pageTitle: '实现 HTTP 基本认证',
      sectionTitle: '使用示例代码生成',
      content: '以下示例使用 C# 和 C++ 生成 Authorization。',
    });
    expect(example.languageEntryTerms).toEqual([]);
  });
  it('recognizes language SDK API overviews from their maintained platform', () => {
    expect(
      buildCnSearchDocument({
        ...section,
        url: '/api-reference/rtc/csharp-windows/rtc-api-overview',
        pageTitle: 'API 概览',
        sectionTitle: 'API 概览',
        platform: ['csharp'],
      }),
    ).toMatchObject({ languageEntryTerms: ['csharp'], languageEntryRank: 2 });
  });
  it('does not turn a multi-platform product overview into a language SDK entry from body mentions', () => {
    expect(
      buildCnSearchDocument({
        ...section,
        url: '/realtime-media/rtm',
        pageTitle: '实时消息 RTM 概览',
        sectionTitle: '实时消息 RTM 概览',
        content: '支持 Web、C++ 和 Swift。',
      }).languageEntryTerms,
    ).toEqual([]);
  });
  it('indexes distinct language terms while leaving visible titles and content intact', () => {
    const sharp = buildCnSearchDocument({
      ...section,
      sectionTitle: '集成 C# SDK',
      content: '使用 C# 开发。',
    });
    const cpp = buildCnSearchDocument({
      ...section,
      sectionTitle: '集成 C++ SDK',
      content: '使用 C++ 开发。',
    });
    const plain = buildCnSearchDocument({
      ...section,
      sectionTitle: 'C 端计费',
      content: 'C 端用户计费。',
    });
    expect(sharp).toMatchObject({
      languageTerms: ['csharp'],
      sectionTitle: '集成 C# SDK',
      content: '使用 C# 开发。',
    });
    expect(cpp).toMatchObject({ languageTerms: ['cplusplus'] });
    expect(plain.languageTerms).toEqual([]);
  });
  it('makes a language-specific API catalog discoverable through its maintained platform', () => {
    expect(
      buildCnSearchDocument({
        ...section,
        platform: ['csharp'],
        content: 'API 列表。',
      }).languageTerms,
    ).toEqual(['csharp']);
  });
  it('supplies a direct guide heading as a ranking field without promoting incidental prose', () => {
    const document = buildCnSearchDocument(section);
    expect(document).toMatchObject({ guideHeading: '发流端开启双流模式' });
    expect(document).not.toHaveProperty('guideContent');
  });
  it.each([
    [
      '/realtime-media/rtc/reference/release-notes#dual',
      ['发版说明', '双流模式'],
    ],
    [
      '/realtime-media/rtc/build/video/multi-user-video#example',
      ['多人视频场景', '示例代码'],
    ],
    [
      '/api-reference/rtc/web/interfaces/iagorartcclient#enabledualstream',
      ['API', 'enableDualStream'],
    ],
  ])(
    'does not promote reference/example headings from %s as a guide explanation',
    (url, headingPath) => {
      expect(
        buildCnSearchDocument({
          ...section,
          url,
          sectionTitle: headingPath.at(-1) ?? '',
          headingPath,
        }),
      ).not.toHaveProperty('guideHeading');
    },
  );
});
