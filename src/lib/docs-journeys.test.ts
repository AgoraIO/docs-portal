import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const contentRoot = path.join(process.cwd(), 'content', 'docs');

function readDoc(relativePath: string) {
  return readFileSync(path.join(contentRoot, relativePath), 'utf8');
}

function docExists(relativePath: string) {
  return existsSync(path.join(contentRoot, relativePath));
}

describe('docs journeys', () => {
  it('connects the Voice Agent home, quickstart, recipes, and reference path', () => {
    const intro = readDoc('en/introduction/index.mdx');
    expect(intro).toContain('/en/ai/choose-your-path/quickstart-coding');

    const quickstart = readDoc('en/ai/choose-your-path/quickstart-coding.mdx');
    expect(quickstart).toMatch(
      /(\.\.\/build\/start-stop-agent\.md|\/en\/ai\/build\/start-stop-agent)/,
    );
    expect(quickstart).toMatch(
      /(\.\.\/build\/presets\.md|\/en\/ai\/build\/presets)/,
    );
    expect(quickstart).toMatch(
      /(\.\.\/best-practices\/optimize-latency\.md|\/en\/ai\/best-practices\/optimize-latency)/,
    );
    expect(quickstart).toMatch(
      /(\.\.\/best-practices\/audio-setup\.md|\/en\/ai\/best-practices\/audio-setup)/,
    );
    expect(quickstart).toContain(
      '/en/api-reference/conversational-ai/rest-api',
    );
  });

  it('connects the Realtime RTC home, quickstart, and versioned API reference path', () => {
    const realtime = readDoc('en/realtime-media/index.md');
    expect(realtime).toContain('/en/realtime-media/rtc');

    const rtc = readDoc('en/realtime-media/rtc/index.md');
    expect(rtc).toContain(
      '/en/realtime-media/rtc/android/quick-start/build-from-scratch',
    );
    expect(rtc).toContain(
      '/en/realtime-media/rtc/android/reference/api-reference',
    );

    expect(
      docExists(
        'en/realtime-media/rtc/android/reference/api-reference/index.md',
      ),
    ).toBe(true);

    const rtcReference = readDoc(
      'en/realtime-media/rtc/android/reference/api-reference/index.md',
    );
    expect(rtcReference).toContain('/en/api-reference/rtc/android');

    expect(
      docExists(
        'en/realtime-media/rtc/android/quick-start/build-from-scratch.md',
      ),
    ).toBe(true);

    const androidMeta = JSON.parse(
      readDoc('en/api-reference/rtc/android/meta.json'),
    );
    expect(androidMeta.navScope.versions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'current', path: '(current)' }),
        expect.objectContaining({ id: '4.6.0', path: '4.6.0' }),
      ]),
    );
  });

  it('keeps the existing zh-CN RTC API reference journey entry', () => {
    expect(
      docExists('zh-CN/realtime-media/rtc/reference/api-reference/index.md'),
    ).toBe(true);

    const rtcReference = readDoc(
      'zh-CN/realtime-media/rtc/reference/api-reference/index.md',
    );
    expect(rtcReference).toContain('/zh-CN/api-reference/rtc/android');
  });
});
