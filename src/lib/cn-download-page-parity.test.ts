import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readDoc = (path: string) =>
  readFileSync(`content/docs/zh-CN/${path}`, 'utf8');

describe('Chinese download page release constraints', () => {
  it.each([
    ['android', '4.4.1'],
    ['ios', '4.4.0'],
  ])(
    'keeps KTV %s integration and both downloads on %s',
    (platform, version) => {
      const page = readDoc(
        `solutions/online-ktv/online-ktv-sdk/reference/downloads/${platform}.mdx`,
      );
      const calls = [
        ...page.matchAll(/<ProductSdkDownloads\b[\s\S]*?\/>/g),
      ].map((match) => match[0]);
      expect(calls).toHaveLength(2);
      for (const product of ['video', 'voice']) {
        const call = calls.find((value) =>
          value.includes(`product="${product}"`),
        );
        expect(call).toContain(`platform="${platform}"`);
        expect(call).toContain(
          `versionIds={['${version}-${product}-sdk-${platform}${product === 'video' ? '-full' : ''}']}`,
        );
      }
      const integration = page.slice(0, page.indexOf('## 下载 SDK'));
      expect(integration).toContain(
        platform === 'android' ? `:${version}'` : `'${version}'`,
      );
    },
  );

  it.each([
    ['android', '1.7.2-fastboard-android'],
    ['ios', '1.4.2-fastboard-ios'],
    ['web', '1.1.0-interactive-whiteboard-web'],
  ])(
    'keeps Fastboard %s downloads aligned with the latest release notes',
    (platform, id) => {
      const page = readDoc(
        `realtime-media/whiteboard/fastboard-sdk/reference/downloads/${platform}.mdx`,
      );
      expect(page).toContain(`versionIds={['${id}']}`);
      const notes = readDoc(
        'realtime-media/whiteboard/fastboard-sdk/reference/release-notes-fb.mdx',
      );
      const platformNotes = notes.split(
        `<PlatformStructured platform="${platform}">`,
      )[1];
      const latest = platformNotes.match(/^## ([\d.]+) 版/m)?.[1];
      expect(id.split('-')[0]).toBe(latest);
      if (platform === 'android')
        expect(page).toContain(`fastboard-android:${latest}`);
    },
  );

  it.each(['android', 'ios'])(
    'references available RTC %s Demo images',
    (platform) => {
      const page = readDoc(
        `realtime-media/rtc/reference/downloads/${platform}.mdx`,
      );
      const images = [...page.matchAll(/(?:coverSrc|qrSrc):\s*'([^']+)'/g)].map(
        (match) => match[1],
      );
      expect(images).toHaveLength(2);
      for (const src of images) {
        if (src.startsWith('/')) {
          expect(
            existsSync(resolve('public', src.slice(1))),
            `Missing public asset: ${src}`,
          ).toBe(true);
        } else {
          expect(new URL(src).protocol).toBe('https:');
        }
      }
    },
  );

  it('uses the Shengwang Maven repository for RTC Android 4.7.0 integration', () => {
    const page = readDoc('realtime-media/rtc/reference/downloads/android.mdx');
    expect(page).toContain(
      "maven { url = 'https://download.shengwang.cn/maven/' }",
    );
    for (const artifact of ['full-sdk', 'lite-sdk', 'voice-sdk']) {
      expect(page).toContain(`cn.shengwang.rtc:${artifact}:4.7.0`);
    }
  });

  it('offers RTSA C cards and directs retired Java users to the sunset notice', () => {
    const page = readDoc('realtime-media/rtsa/reference/downloads.mdx');
    expect(page).toContain(
      '<ProductSdkDownloads product="rtsa" platform="c" />',
    );
    expect(page).toContain('/zh-CN/realtime-media/rtsa/reference/sunset');
    expect(page).toContain('不再提供 SDK 下载');
    expect(page).not.toMatch(/JRmRdRc|\| 平台 \|/);
  });
});
