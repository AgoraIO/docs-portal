import { readFileSync } from 'node:fs';
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
    ['android', '1.6.2-fastboard-android'],
    ['ios', '1.4.2-fastboard-ios'],
    ['web', '1.0.0-interactive-whiteboard-web'],
  ])(
    'keeps the source Fastboard %s release explicitly selected',
    (platform, id) => {
      const page = readDoc(
        `realtime-media/whiteboard/fastboard-sdk/reference/downloads/${platform}.mdx`,
      );
      expect(page).toContain(`versionIds={['${id}']}`);
      if (platform === 'android')
        expect(page).toContain('fastboard-android:1.6.2');
    },
  );

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
