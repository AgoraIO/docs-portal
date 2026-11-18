import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve('content/docs/zh-CN/api-reference/rtc');
const events = [
  ['ScreenCaptureWindowHidden', '屏幕采集窗口被隐藏。'],
  ['ScreenCaptureWindowRecoverFromHidden', '屏幕采集窗口从隐藏状态恢复。'],
  ['ScreenCaptureStoppedByUser', '屏幕采集被用户停止。'],
  ['ScreenCaptureSystemInternalError', '屏幕采集过程中发生系统内部错误。'],
  ['CameraFocalLengthApplied', '请求的广角或超广角摄像头已应用。'],
  [
    'CameraFocalLengthFallbackToDefault',
    '请求的广角或超广角摄像头无法打开，SDK 回退到默认摄像头。',
  ],
] as const;

function section(source: string, start: string, end: string) {
  expect(source.split(start), `unique start: ${start}`).toHaveLength(2);
  expect(source.split(end), `unique end: ${end}`).toHaveLength(2);
  const from = source.indexOf(start) + start.length;
  const to = source.indexOf(end);
  expect(to, `ordered boundaries: ${start}`).toBeGreaterThan(from);
  return source.slice(from, to);
}

function parameter(source: string, name: string) {
  const matches = [
    ...source.matchAll(
      new RegExp(`<Parameter name="${name}">([\\s\\S]*?)</Parameter>`, 'g'),
    ),
  ];
  expect(matches, `unique Parameter: ${name}`).toHaveLength(1);
  return matches[0][1];
}

describe('RTC PR #2084 current framework API content', () => {
  it.each([
    ['flutter', 'localVideoEventType', '6.6.2'],
    ['react-native', 'LocalVideoEventType', '4.6.1'],
  ])(
    'preserves all six scoped %s enum definitions',
    (platform, prefix, since) => {
      const source = readFileSync(
        resolve(root, platform, '(current)/enum-localvideoeventtype.mdx'),
        'utf8',
      );
      expect(source).toContain(`自 v${since} 版本新增。`);
      const values = section(source, '<ParameterList>', '</ParameterList>');
      expect(values.match(/<Parameter name=/g)).toHaveLength(6);
      events.forEach(([suffix, description], index) => {
        const name = `${prefix}${suffix}`;
        const value = parameter(values, name);
        expect(value.trim()).toBe(
          `（${index + 1}）：${description.slice(0, -1)}，仅适用于 Android 平台。`,
        );
        expect(values).toContain(`<a id="${name.toLowerCase()}"></a>`);
      });
    },
  );

  it.each([
    ['flutter', 'localVideoEventType', '6.6.2'],
    ['react-native', 'LocalVideoEventType', '4.6.1'],
  ])(
    'lists all six events inside the %s callback event parameter',
    (platform, prefix, since) => {
      const source = readFileSync(
        resolve(root, platform, '(current)/video/video-basic.mdx'),
        'utf8',
      );
      const callback = section(
        source,
        '<a id="callback_irtcengineeventhandler_onlocalvideoevent"></a>',
        '<a id="callback_irtcengineeventhandler_onlocalvideostatechanged"></a>',
      );
      expect(callback).toContain(`自 v${since} 版本新增。`);
      for (const suffix of ['prototype', 'detailed_desc', 'parameters']) {
        expect(callback).toContain(
          `<a id="callback_irtcengineeventhandler_onlocalvideoevent__${suffix}"></a>`,
        );
      }
      const parameters = section(
        callback,
        '<ParameterList>',
        '</ParameterList>',
      );
      expect(parameters).toContain('<a id="source-1"></a>');
      const event = parameter(parameters, 'event');
      expect(parameters).toContain('<a id="event"></a>');
      expect(event).toContain(
        `[LocalVideoEventType](/zh-CN/api-reference/rtc/${platform}/enum-localvideoeventtype)`,
      );
      expect(event.match(/^- /gm) ?? []).toHaveLength(6);
      expect(event.match(/^- .+$/gm) ?? []).toEqual(
        events.map(
          ([suffix, description]) => `- \`${prefix}${suffix}\`：${description}`,
        ),
      );
    },
  );
});
