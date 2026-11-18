import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTableOfContents } from 'fumadocs-core/content/toc';
import { describe, expect, it } from 'vitest';

const productRoot = 'content/docs/zh-CN/realtime-media/rtc';
const releaseNotes = 'reference/release-notes.mdx';
const reduceAppSize = 'build/optimize-and-operate/reduce-app-size.mdx';
const downloads = 'reference/downloads/android.mdx';
const downloadsHref =
  '/zh-CN/realtime-media/rtc/reference/downloads/android#通过-gradle-自动集成-sdk';
const downloadsLink = `[下载 SDK](${downloadsHref})`;
const prerequisite = `通过 Gradle 自动集成 Android SDK 前，请先确保已添加声网 Maven CDN 仓库。具体配置方式请参考${downloadsLink}。`;

function readContent(relativePath: string) {
  return readFileSync(
    resolve(process.cwd(), productRoot, relativePath),
    'utf8',
  );
}

function platformBlocks(content: string) {
  return [
    ...content.matchAll(
      /<PlatformStructured platform="([^"]+)">([\s\S]*?)<\/PlatformStructured>/g,
    ),
  ].map((match) => ({ platform: match[1], body: match[2] }));
}

function androidBody(relativePath: string) {
  const block = platformBlocks(readContent(relativePath)).find(
    ({ platform }) => platform === 'android',
  );
  expect(block, relativePath).toBeDefined();
  return block?.body ?? '';
}

describe('RTC upstream PR #2108 Maven CDN guidance', () => {
  it('keeps the dated caution outside the Android release accordions', () => {
    const android = androidBody(releaseNotes);
    const versionsStart = android.indexOf(
      '<Accordions type="multiple" openFirst>',
    );
    const globalNotice = android.slice(0, versionsStart).trim();

    expect(versionsStart).toBeGreaterThan(0);
    expect(android.slice(versionsStart)).toMatch(
      /^<Accordions type="multiple" openFirst>\s+<Accordion title="v\d+\.\d+\.\d+"/,
    );
    expect(globalNotice).toMatch(/^:::caution\[注意\]\n/);
    expect(globalNotice).toContain('自 2026 年 9 月 14 日开始');
    expect(globalNotice).toContain(
      '通过 Gradle 自动集成 Android SDK 时，需要额外配置声网 Maven CDN 仓库。',
    );
    expect(globalNotice).toContain(downloadsLink);
    expect(globalNotice).toMatch(/\n:::$/);
  });

  it('puts the CDN prerequisite first in the Android Gradle plugin-removal section', () => {
    const section = androidBody(reduceAppSize)
      .split('### Gradle 自动集成时删除插件\n\n')[1]
      ?.split('\n## ')[0];

    expect(section).toBeDefined();
    expect(section).toMatch(
      /^通过 Gradle 自动集成 Android SDK 前，请先确保已添加声网 Maven CDN 仓库。/,
    );
    expect(section).toContain(prerequisite);
    expect(section).toContain(
      `${prerequisite}\n\n通过 Gradle 自动集成 Android SDK 时，你可以修改`,
    );
  });

  it('keeps the already migrated visible Gradle terminology', () => {
    const android = androidBody(reduceAppSize);

    expect(android).toContain('### Gradle 自动集成时删除插件');
    expect(android).toMatch(
      /### implementation 字段\n\n通过 Gradle 自动集成 Android SDK 时/,
    );
    expect(android).not.toContain('通过 Maven Central 集成 Android SDK 时');
    expect(android).not.toContain('## 动态加载 .so 文件');
  });

  it.each([
    'get-started/quick-start.mdx',
    'build/audio/audio-quick-start.mdx',
    downloads,
  ])(
    'preserves both repository configurations and Maven Central in %s',
    (file) => {
      const content =
        file === downloads ? readContent(file) : androidBody(file);

      expect(content).toContain('通过 Gradle 自动集成');
      expect(content).toContain('请保留项目中已有的 Maven 仓库配置');
      expect(content).toContain('Android Gradle Plugin 版本低于 v7.1.0');
      expect(content).toContain('dependencyResolutionManagement {');
      expect(content).toContain('allprojects {');
      expect(content.match(/mavenCentral\(\)/g)?.length).toBeGreaterThanOrEqual(
        2,
      );
      expect(
        content.match(
          /maven \{ url = 'https:\/\/download\.shengwang\.cn\/maven\/' \}/g,
        ),
      ).toHaveLength(2);
    },
  );

  it('preserves the Full/Lite choice and the newer Android SDK dependencies', () => {
    const content = readContent(downloads);

    expect(content).toContain('请根据业务需要选择其中一种');
    expect(content).toContain('// 或集成 Lite SDK');
    for (const sdk of ['full-sdk', 'lite-sdk', 'voice-sdk']) {
      expect(content).toContain(`cn.shengwang.rtc:${sdk}:4.7.0`);
      expect(content).not.toContain(`cn.shengwang.rtc:${sdk}:4.6.4`);
    }
  });

  it('points both notices to a real Android download heading fragment', () => {
    const [route, fragment] = downloadsHref.split('#');
    const target = readFileSync(
      resolve(process.cwd(), `content/docs${route}.mdx`),
      'utf8',
    );

    expect(getTableOfContents(target).map((heading) => heading.url)).toContain(
      `#${fragment}`,
    );
  });

  it.each([releaseNotes, reduceAppSize])(
    'keeps the new Android guidance out of other platform bodies in %s',
    (file) => {
      const otherPlatforms = platformBlocks(readContent(file)).filter(
        ({ platform }) => platform !== 'android',
      );

      expect(otherPlatforms.length).toBeGreaterThan(0);
      for (const { platform, body } of otherPlatforms) {
        expect(body, platform).not.toContain('额外配置声网 Maven CDN 仓库');
        expect(body, platform).not.toContain(prerequisite);
      }
    },
  );
});
