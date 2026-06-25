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

  it('keeps the zh-CN RTC API navigation aligned with the english structure', () => {
    const realtimeRtcMeta = JSON.parse(
      readDoc('zh-CN/realtime-media/rtc/meta.json'),
    );
    expect(realtimeRtcMeta.pages).toEqual(['android', 'macOS']);

    const androidReferenceMeta = JSON.parse(
      readDoc('zh-CN/realtime-media/rtc/android/reference/meta.json'),
    );
    const englishAndroidReferenceMeta = JSON.parse(
      readDoc('en/realtime-media/rtc/android/reference/meta.json'),
    );
    expect(androidReferenceMeta.pages).toEqual(
      englishAndroidReferenceMeta.pages,
    );

    const androidApiMeta = JSON.parse(
      readDoc('zh-CN/api-reference/rtc/android/meta.json'),
    );
    expect(androidApiMeta.navScope.versions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'current', path: '(current)' }),
        expect.objectContaining({ id: '4.6.0', path: '4.6.0' }),
      ]),
    );
  });

  it('defines build subfolder metadata for english voice agent docs', () => {
    const shapeMeta = JSON.parse(
      readDoc('en/ai/build/shape-the-conversation/meta.json'),
    );
    expect(shapeMeta).toEqual({
      title: 'Shape the conversation',
      pages: [
        'interrupt-agent',
        'short-term-memory',
        'custom-information',
        'filler-words',
      ],
    });

    const customModelMeta = JSON.parse(
      readDoc('en/ai/build/custom-model-integration/meta.json'),
    );
    expect(customModelMeta).toEqual({
      title: 'Custom model integration',
      pages: [
        'custom-llm',
        'audio-output',
        'build-server-client',
        'presets',
      ],
    });

    const runtimeMeta = JSON.parse(
      readDoc('en/ai/build/handle-runtime-events/meta.json'),
    );
    expect(runtimeMeta).toEqual({
      title: 'Handle runtime events',
      pages: [
        'get-runtime-events',
        'monitor-agent-runtime',
        'debug-agent-failures',
        'retrieve-session-history',
        'event-notifications',
        'webhooks',
      ],
    });
  });
});
