import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(
  resolve(
    'content/docs/zh-CN/api-reference/rtc/android/(current)/video/video-basic.mdx',
  ),
  'utf8',
);

function section(source: string, start: string, end: string) {
  expect(source.split(start), `unique start: ${start}`).toHaveLength(2);
  expect(source.split(end), `unique end: ${end}`).toHaveLength(2);
  const from = source.indexOf(start) + start.length;
  const to = source.indexOf(end);
  expect(to, 'ordered section boundaries').toBeGreaterThan(from);
  return source.slice(from, to);
}

const callback = () =>
  section(
    page,
    '<a id="callback_irtcengineeventhandler_onlocalvideoevent"></a>',
    '<a id="callback_irtcengineeventhandler_onlocalvideostatechanged"></a>',
  );

describe('RTC source PR #2085 Android local video event', () => {
  it('lists all six frozen-source events inside the callback event parameter', () => {
    const parameters = section(
      callback(),
      '<ParameterList>',
      '</ParameterList>',
    );
    const matches = [
      ...parameters.matchAll(
        /<Parameter name="event">([\s\S]*?)<\/Parameter>/g,
      ),
    ];
    expect(matches).toHaveLength(1);
    const events = [
      ['SCREEN_CAPTURE_WINDOW_HIDDEN', '屏幕共享窗口被隐藏。'],
      [
        'SCREEN_CAPTURE_WINDOW_RECOVER_FROM_HIDDEN',
        '屏幕共享窗口从隐藏中恢复。',
      ],
      ['SCREEN_CAPTURE_STOPPED_BY_USER', '用户停止了屏幕共享。'],
      ['SCREEN_CAPTURE_SYSTEM_INTERNAL_ERROR', '屏幕共享期间发生内部错误。'],
      ['CAMERA_FOCAL_LENGTH_APPLIED', '请求的广角或超广角摄像头已应用。'],
      [
        'CAMERA_FOCAL_LENGTH_FALLBACK_TO_DEFAULT',
        '请求的广角或超广角摄像头无法打开，SDK 退回到默认摄像头。',
      ],
    ];
    expect(matches[0][1].match(/^- .+$/gm)).toEqual(
      events.map(
        ([name, description], index) =>
          `- \`LOCAL_VIDEO_EVENT_TYPE_${name}\` (${index + 1}): ${description}`,
      ),
    );
  });

  it('retains the callback signature, source parameter, stable anchors and provenance', () => {
    const content = callback();
    expect(content).toContain(
      'public void onLocalVideoEvent(Constants.VideoSourceType source, int event)',
    );
    for (const suffix of ['prototype', 'detailed_desc', 'parameters']) {
      expect(content).toContain(
        `<a id="callback_irtcengineeventhandler_onlocalvideoevent__${suffix}"></a>`,
      );
    }
    for (const id of ['ariaid-title16', 'source-2', 'event']) {
      expect(content).toContain(`<a id="${id}"></a>`);
    }
    expect(content).toContain(
      '[VideoSourceType](/zh-CN/api-reference/rtc/android/enum-videosourcetype)',
    );
    expect(content).toContain(
      '[IRtcEngineEventHandler](/zh-CN/api-reference/rtc/android/rtc-interface-class#class_irtcengineeventhandler)',
    );
    expect(page).toContain(
      'sourceUrl: https://doc.shengwang.cn/api-ref/rtc/android/API/toc_video_basic',
    );
    expect(page).toContain(
      'sourcePath: html-docs/rtc/Android/API/toc_video_basic.html',
    );
  });
});
