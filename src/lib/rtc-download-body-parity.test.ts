import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readBody = (platform: string) =>
  readFileSync(
    `content/docs/zh-CN/realtime-media/rtc/reference/downloads/${platform}.mdx`,
    'utf8',
  ).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

// Legacy resources.*.mdx at shengwang-doc-source master 8c4c9a4e5.
const platforms = [
  ['android', 'SDK、Demo 和示例项目'],
  ['ios', 'SDK、Demo 和示例项目'],
  ['macos', 'SDK 和示例项目'],
  ['web', 'SDK、Demo 和示例项目'],
  ['windows', 'SDK 和示例项目'],
  ['harmonyos', 'SDK 和示例项目'],
  ['mini-program', 'SDK、Demo 和示例项目'],
  ['electron', null],
  ['unity', 'SDK 和示例项目'],
  ['flutter', 'SDK 和示例项目'],
  ['react-native', null],
  ['unreal-cpp', 'SDK 和示例项目'],
  ['unreal-blueprint', 'SDK 和示例项目'],
  ['react', 'SDK、Demo 和示例项目'],
] as const;

describe('RTC download platform body parity', () => {
  it.each(platforms)(
    'shows only the legacy introduction and download notice for %s',
    (platform, intro) => {
      // The platform-group shell renders the shared body before each panel.
      const body = `${readBody('index')}\n${readBody(platform)}`;
      const introductions = body.match(/^本文提供获取 .+的方式。$/gm) ?? [];
      expect(introductions).toEqual(
        intro ? [`本文提供获取 ${intro}的方式。`] : [],
      );
      expect(
        body.match(/Windows C\+\+ SDK 使用 MSVC 编译工具链。/g) ?? [],
      ).toHaveLength(platform === 'windows' ? 1 : 0);
      expect(body.match(/SDK 默认使用 libc\+\+ \(LLVM\)/g) ?? []).toHaveLength(
        ['windows', 'harmonyos'].includes(platform) ? 0 : 1,
      );
      expect(body.match(/SDK 提供的库是 FAT Image/g) ?? []).toHaveLength(
        ['windows', 'harmonyos'].includes(platform) ? 0 : 1,
      );

      const downloadSection = body
        .split(/^## 下载 SDK.*$/m)[1]
        ?.split(/^## /m)[0];
      expect(downloadSection).toContain(':::info[信息]');
      expect(downloadSection).toContain('各版本 SDK 的发版详情请参考');
      expect(downloadSection).toContain(
        '如何使用 SDK 实现各种音视频互动功能请参考',
      );
      expect(body.match(/各版本 SDK 的发版详情请参考/g)).toHaveLength(1);
      expect(body.split('## 获取示例项目\n')[1]).toContain(
        '本节提供 API 示例项目，你可以下载或查看源码。',
      );
    },
  );

  it.each(['android', 'ios'])(
    'keeps the package-size qualification with the %s downloads',
    (platform) => {
      const body = readBody(platform);
      const downloadSection = body
        .split('## 下载 SDK\n')[1]
        .split('## 获取 Demo')[0];
      expect(downloadSection).toContain(
        '集成 SDK 后增加的实际包体积数据会根据集成的动态库的不同而有所差异，本页提供的数据仅供参考。',
      );
    },
  );

  it('keeps the mini-program npm version restriction before the install example', () => {
    const integration = readBody('mini-program').split('## 下载 SDK')[0];
    expect(integration).toContain('在项目的 `package.json` 文件中');
    const restriction = integration.indexOf('仅适用于 v2.6.0 及以上版本');
    expect(restriction).toBeGreaterThan(-1);
    expect(restriction).toBeLessThan(integration.indexOf('```json'));
  });

  it.each(['unreal-cpp', 'unreal-blueprint'])(
    'keeps the C++ recommendation in the %s download section',
    (platform) => {
      const body = readBody(platform);
      const warning = body.indexOf(':::caution[注意]');
      expect(warning).toBeGreaterThan(body.indexOf('## 下载 SDK'));
      expect(body.slice(warning)).toContain(
        '当前推荐使用稳定性更优的 C++ 版本',
      );
      expect(warning).toBeLessThan(body.indexOf('<RtcSdkDownloads'));
    },
  );

  it('explains the Full, Lite, and optional-library choices in Apple integration examples', () => {
    const ios = readBody('ios');
    expect(ios).toContain('# 集成 Full SDK');
    expect(ios).toContain('# 选择性集成 Full SDK 中的基础库和指定动态库');
    expect(ios).toContain('# 集成 Lite SDK');
    expect(ios).toContain('# 选择性集成音频 SDK 中的基础库和指定动态库');
    const spm = ios.split('## 通过 SPM 集成 SDK')[1].split('## 下载 SDK')[0];
    expect(spm).toContain('// 集成 Full SDK');
    expect(spm).toContain('// 集成 Lite SDK');
    expect(readBody('macos')).toContain(
      '# 选择性集成 SDK 中的基础库和指定动态库',
    );
  });
});
