import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getRtcDownloadCardEntries } from '../components/docs-overview/rtc-download-card-entries';
import { zhCNRtcSdkDownloadPlatforms } from '../components/docs-overview/rtc-sdk-downloads-data.zh-cn';
import { SdksCatalog } from '../components/docs-overview/SdksCatalog';
import { zhCNSdkDownloadPlatforms } from '../components/docs-overview/sdk-downloads-data.zh-cn';

const rtcRoot = 'content/docs/zh-CN/realtime-media/rtc';
const beauty = 'build/video/advanced-beauty.mdx';
const beauty460 = 'build/video/advanced-beauty-460.mdx';
const reduce = 'build/optimize-and-operate/reduce-app-size.mdx';
const nativePlatforms = ['android', 'ios', 'macos', 'windows'] as const;

function readContent(file: string) {
  return readFileSync(resolve(process.cwd(), rtcRoot, file), 'utf8');
}

function extractPlatformBody(content: string, platform: string) {
  const blocks = [
    ...content.matchAll(
      /<PlatformStructured platform="([^"]+)">([\s\S]*?)<\/PlatformStructured>/g,
    ),
  ].filter((match) => match[1] === platform);
  expect(blocks.length, `${platform}: exactly one platform block`).toBe(1);
  return blocks[0][2];
}

function platformBody(file: string, platform: string) {
  return extractPlatformBody(readContent(file), platform);
}

function sectionBetween(
  content: string,
  startMarker: string,
  endMarker: string,
) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  expect(
    start,
    `Missing section start marker: ${startMarker}`,
  ).toBeGreaterThanOrEqual(0);
  expect(
    end,
    `Missing section end marker: ${endMarker}`,
  ).toBeGreaterThanOrEqual(0);
  expect(end, 'Section end marker must follow start marker').toBeGreaterThan(
    start,
  );
  return content.slice(start + startMarker.length, end);
}

function beforeMarker(content: string, endMarker: string) {
  const end = content.indexOf(endMarker);
  expect(
    end,
    `Missing section end marker: ${endMarker}`,
  ).toBeGreaterThanOrEqual(0);
  return content.slice(0, end);
}

function contains(content: string, marker: string) {
  expect(content.includes(marker), marker).toBe(true);
}

function tabBody(content: string, value: string) {
  const tab = content.match(
    new RegExp(`<TabsContent value="${value}">([\\s\\S]*?)</TabsContent>`),
  );
  expect(tab, value).toBeDefined();
  return tab?.[1] ?? '';
}

describe('RTC upstream PR #2098 complete content parity', () => {
  it('rejects missing or reversed markers in the real Android ProGuard body', () => {
    const body = platformBody('get-started/quick-start.mdx', 'android');
    const start = '3. 防止代码混淆。';
    const end = '## 集成 SDK';

    contains(sectionBetween(body, start, end), 'consumer-proguard-rules.pro');
    expect(() =>
      sectionBetween(body.replace(end, '## 集成标记已移除'), start, end),
    ).toThrow(/Missing section end marker/);
    expect(() =>
      sectionBetween(body.replace(start, '3. 起点已移除。'), start, end),
    ).toThrow(/Missing section start marker/);
    const reversed = body
      .replace(start, '__RULES_START__')
      .replace(end, start)
      .replace('__RULES_START__', end);
    expect(() => sectionBetween(reversed, start, end)).toThrow(
      /Section end marker must follow start marker/,
    );
  });

  it('rejects a missing real release boundary and ambiguous platform bodies', () => {
    const source = readContent('reference/release-notes.mdx');
    const body = extractPlatformBody(source, 'android');
    const version = '<Accordions type="multiple" openFirst>';

    contains(beforeMarker(body, version), 'cn.shengwang.rtc');
    expect(() =>
      beforeMarker(body.replace(version, '## 版本标记已移除'), version),
    ).toThrow(/Missing section end marker/);
    const wrapped = `<PlatformStructured platform="android">${body}</PlatformStructured>`;
    expect(() =>
      extractPlatformBody(`${source}\n${wrapped}`, 'android'),
    ).toThrow(/exactly one platform block/);
    expect(() =>
      extractPlatformBody(source.replace(wrapped, ''), 'android'),
    ).toThrow(/exactly one platform block/);
  });

  it.each(nativePlatforms)(
    'selects beauty 2.1 at all three %s boundaries',
    (platform) => {
      const body = platformBody(beauty, platform);
      const intro = body.split('## 功能介绍')[0];
      contains(intro, 'v4.7.0 或 v4.5.x 中 v4.5.2.9 及以上版本');
      contains(intro, '如果你的 SDK 版本为 v4.6.x');
      contains(intro, '如果你的 SDK 版本低于 v4.5.2.9');
      contains(
        body,
        '集成的 RTC SDK 版本为 v4.7.0，或 v4.5.x 中 v4.5.2.9 及以上版本',
      );
      contains(body, '仅 RTC SDK v4.7.0，或 v4.5.x 中 v4.5.2.9 及以上版本支持');
      expect(body.includes('大于等于 v4.5.2.9 且小于 v4.6.0')).toBe(false);
      contains(
        body,
        '使用高级美颜功能的客户可以使用该接口配置美颜人脸检测，用于检测人脸置信度。',
      );
      const method = '- `setVideoEffectStringParam`';
      contains(
        body,
        platform === 'android' || platform === 'ios'
          ? `${method}：用于配置美颜人脸检测，检测人脸置信度。`
          : `${method}\n`,
      );
    },
  );

  it.each(nativePlatforms)(
    'keeps beauty 2.0 limited to 4.6.x on %s',
    (platform) => {
      const body = platformBody(beauty460, platform);
      contains(body, 'RTC SDK v4.6.x 提供美颜 2.0 API');
      contains(
        body,
        '当前，高级美颜功能免费开放。后续如有计费调整，将提前通知',
      );
      contains(body, 'v4.7.0 或 v4.5.x 中 v4.5.2.9 及以上版本');
      contains(body, '如果你的 SDK 版本为 v4.6.x，请参考本文');
      contains(body, '如果你的 SDK 版本低于 v4.5.2.9');
      contains(body, '已集成 RTC SDK v4.6.x。');
      contains(body, '仅使用基础美颜和美型功能时，可以直接调用 API 实现');
      contains(body, '获取合适的 SDK 版本及配套素材包');
      expect(body.includes('限时免费')).toBe(false);
      expect(body.includes('已集成 RTC SDK v4.6.0 及以上版本')).toBe(false);
    },
  );

  it.each(['get-started/quick-start.mdx', 'build/audio/audio-quick-start.mdx'])(
    'expands Android ProGuard choices without changing CDN setup in %s',
    (file) => {
      const body = platformBody(file, 'android');
      const rules = sectionBetween(body, '3. 防止代码混淆。', '## 集成 SDK');
      for (const marker of [
        '未开启 R8/ProGuard 缩减和混淆，无需额外配置混淆规则',
        '快速配置',
        '精细化配置',
        'Native 层通过 JNI',
        '通过 AAR 集成时',
        '打包时会自动生效，无需手动拷贝',
        '通过 JAR 集成时',
        '手动拷贝到工程中',
        '-keep class io.agora.**{*;}',
        '-dontwarn io.agora.**',
        'minifyEnabled true',
        "getDefaultProguardFile('proguard-android-optimize.txt')",
        "'proguard-rules.pro'",
        "'consumer-proguard-rules.pro'",
      ])
        contains(rules, marker);
      expect(rules.includes('-keep class cn.shengwang')).toBe(false);
      expect(
        body.match(/https:\/\/download\.shengwang\.cn\/maven\//g),
      ).toHaveLength(2);
      expect(body.match(/mavenCentral\(\)/g)?.length).toBeGreaterThanOrEqual(2);
      contains(body, 'dependencyResolutionManagement {');
      contains(body, 'allprojects {');
    },
  );

  it.each([
    ['android', 'libagora_ffmpeg_extension.so', 'libaosl.so'],
    ['ios', 'AgoraffmpegExtension.xcframework', 'aosl.xcframework'],
  ])(
    'documents optional FFmpeg with the %s dependency and native fallback',
    (platform, plugin, dependency) => {
      const body = platformBody(reduce, platform);
      contains(
        body,
        `### 按需集成 FFmpeg 插件 [#按需集成-ffmpeg-插件-${platform}]`,
      );
      contains(body, `SDK 包中默认包含该插件`);
      contains(body, `并依赖 \`${dependency}\``);
      contains(body, `移除或不链接 \`${plugin}\``);
      contains(body, 'MediaPlayer 将使用系统原生播放能力');
      contains(body, '系统支持的容器格式和音频编解码器');
      contains(
        body,
        '如需播放系统原生能力之外的音频格式，请继续集成 FFmpeg 插件',
      );
      const audio = tabBody(body, `${platform}-audio-sdk`);
      contains(audio, plugin);
      contains(
        audio,
        `/reduce-app-size/${platform}#按需集成-ffmpeg-插件-${platform}`,
      );
      if (platform === 'android') {
        expect(audio.includes('libagora-ffmpeg.so')).toBe(false);
        contains(tabBody(body, 'android-video-sdk'), 'libagora-ffmpeg.so');
      }
    },
  );

  it('updates the shared iOS audio subspec tab under macOS without adding a macOS feature', () => {
    const body = platformBody(reduce, 'macos');
    const audio = tabBody(body, 'ios-audio-sdk');
    contains(audio, 'AgoraffmpegExtension.xcframework');
    contains(audio, '/reduce-app-size/ios#按需集成-ffmpeg-插件-ios');
    expect(body.includes('### 按需集成 FFmpeg 插件')).toBe(false);
    contains(tabBody(body, 'ios-video-sdk'), 'Agoraffmpeg.xcframework');
    contains(tabBody(body, 'mac-video-sdk'), 'Agoraffmpeg.xcframework');
  });

  it('places the Android Maven package migration before every release version', () => {
    const body = platformBody('reference/release-notes.mdx', 'android');
    const notice = beforeMarker(body, '<Accordions type="multiple" openFirst>');
    contains(notice, ':::caution[注意]');
    contains(notice, '额外配置声网 Maven CDN 仓库');
    expect(notice.match(/:::caution\[注意\]/g)).toHaveLength(2);
    expect(notice.indexOf('额外配置声网 Maven CDN 仓库')).toBeLessThan(
      notice.indexOf('通过 Gradle 自动集成并升级至 v4.6.0 及以上版本时'),
    );
    contains(notice, '通过 Gradle 自动集成并升级至 v4.6.0 及以上版本时');
    contains(
      notice,
      '除更新版本号外，还需将包名从 `io.agora.rtc` 修改为 `cn.shengwang.rtc`',
    );
  });

  it('narrows only Android basic formats and qualifies Lite WMA playback', () => {
    const content = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/zh-CN/reference/faq/product/audio_format.mdx',
      ),
      'utf8',
    );
    const basicAndroid =
      content
        .split('\n')
        .find((line) => line.startsWith('- 在 Android 上，支持 Ogg')) ?? '';
    for (const format of ['ASF', 'AVI', 'WMA'])
      expect(basicAndroid.includes(format), format).toBe(false);
    contains(content, 'AAC、AMR、FLAC、MP2、MP3、PCM、Vorbis、 WMAV2、OPUS');
    contains(
      content,
      '3GP、AAC、AMR、ASF、AVI、FLAC、M4A、M4V、MOV、MP3、MP4、TS、Ogg、WAV、WMA',
    );
    contains(
      content,
      'RTC Lite SDK 不支持播放 Android 系统原生媒体能力不支持的音频文件',
    );
    contains(
      content,
      '部分 Android 设备不支持 WMA 格式，因此在这些设备上调用声网 API 播放 WMA 文件时可能播放失败',
    );
    contains(content, '在 Windows 上，支持 MP4、TS、WMA、AAC');
    contains(content, '对于 iOS 平台，RTC Lite SDK 不支持播放无后缀的音频文件');
    contains(content, '**不支持**切换至第二音轨');
    contains(content, '部分 Android 设备（如小米）');
    expect(content.includes('AAC、ARM、FALC')).toBe(false);
    expect(content.includes('- 因为部分 Android 设备不支持 WMA')).toBe(false);
  });

  it.each(nativePlatforms)(
    'mirrors all 4.7.0 %s cards while retaining older downloads',
    (platform) => {
      const canonical = zhCNRtcSdkDownloadPlatforms.find(
        (entry) => entry.id === platform,
      );
      const shared = zhCNSdkDownloadPlatforms.find(
        (entry) => entry.id === platform,
      );
      expect(canonical).toBeDefined();
      expect(shared).toBeDefined();
      for (const sdk of canonical?.core ?? []) {
        const mirrored = shared?.core.find((entry) => entry.id === sdk.id);
        expect(mirrored?.versions.slice(0, sdk.versions.length)).toEqual(
          sdk.versions,
        );
        const historical = mirrored?.versions.slice(sdk.versions.length) ?? [];
        expect(historical.length).toBeGreaterThan(0);
        for (const version of historical) {
          expect(version.label).not.toMatch(/最新|Latest/);
          expect(version.latestVariant).not.toBe(true);
        }
        for (const version of getRtcDownloadCardEntries(
          platform,
          platform,
          sdk.id.startsWith('voice') ? 'voice' : 'video',
          mirrored ?? sdk,
        )) {
          expect(version.version.downloadLink).toContain('_v4.7.0_');
          expect(version.version.packageManager).toBeUndefined();
        }
      }
    },
  );

  it.each(nativePlatforms)(
    'renders the actual shared catalog consumer at 4.7.0 on %s',
    (platform) => {
      const html = renderToStaticMarkup(
        createElement(SdksCatalog, {
          locale: 'zh-CN',
          platform,
          product: 'video',
        }),
      );
      contains(html, '_v4.7.0_FULL.zip');
      contains(html, '2026 年 9 月 22 日');
      expect(html.includes('_v4.6.3_FULL.zip')).toBe(false);
      expect(html.includes('_v4.6.2_FULL.zip')).toBe(false);
    },
  );
});
