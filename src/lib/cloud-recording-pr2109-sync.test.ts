import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readContent(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

const apiRoot = 'content/docs/zh-CN/api-reference/cloud-recording/restful';
const api = readContent(`${apiRoot}/overview/billing-strategy/billing.mdx`);
const main = readContent(
  'content/docs/zh-CN/realtime-media/cloud-recording/reference/billing-strategy/billing.mdx',
);
const feeBullet =
  '- 录制机器人的订阅费用会自动减免，不会额外计入实时音视频费用。';

function readDurationInfo(content: string) {
  const duration =
    content.match(/### 录制时长\n([\s\S]*?)(?=### 录制单价)/)?.[1] ?? '';
  return duration.match(/^:::info\[信息\]\n([\s\S]*?)\n:::/m)?.[1] ?? '';
}

describe('Cloud Recording upstream PR #2109 parity', () => {
  it('puts the robot subscription-fee clarification first in the API duration callout', () => {
    const info = readDurationInfo(api);
    expect(info.split('\n')[0]).toBe(feeBullet);
    expect(api.split(feeBullet)).toHaveLength(2);
    expect(info).toContain(
      '- 如果频道内启动了一个录制进程，同时录制多路音频流和视频流，录制的时长用量不会叠加计算。',
    );
    expect(info).toContain(
      '- 如果频道内同时启动了多个录制进程，则需要将所有录制进程产生的录制时长用量相加。',
    );
  });

  it('preserves the clarification already present in the main product guide', () => {
    expect(readDurationInfo(main).split('\n')[0]).toBe(feeBullet);
    expect(main.split(feeBullet)).toHaveLength(2);
  });

  it('preserves the original recording-fee formula', () => {
    expect(api).toContain(
      '**录制费用 = 视频录制时长 × 视频录制单价 + 音频录制时长 × 音频录制单价**',
    );
  });

  it('preserves the original price-table values', () => {
    for (const row of [
      '| 音频 | 无 | 9 |',
      '| 高清视频 (HD) | 集合分辨率 ≤ 921,600 (1280 × 720) | 36 |',
      '| 全高清 (FHD) | 921,600 (1280 × 720) ＜ 集合分辨率 ≤ 2,073,600 (1920 × 1080) | 81 |',
      '| 2K | 2,073,600 (1920 × 1080) ＜ 集合分辨率 ≤ 3,686,400 (2560 × 1440) | 144 |',
      '| 2K+ | 3,686,400 (2560 × 1440) ＜ 集合分辨率 ≤ 8,847,360 (4096 × 2160) | 324 |',
      '| 超清 (HD+) | 集合分辨率 ＞ 921,600（1280 × 720） | 135 |',
    ]) {
      expect(api).toContain(row);
    }
  });

  it('preserves the original recording examples and total calculation', () => {
    const examples =
      api.match(/## 计费示例\n([\s\S]*?)(?=## 注意事项)/)?.[1] ?? '';
    for (const heading of ['录制一', '录制二', '录制三', '录制四']) {
      expect(examples).toContain(`#### ${heading}`);
    }
    expect(examples).toContain('4 × 640 × 360 = 921,600');
    expect(examples).toContain('**10.01**');
    expect(examples).toContain('**(2.7 + 2.124 + 2.268 + 2.916 = 10.008)**');
  });

  it('preserves the existing API billing navigation entry', () => {
    const meta = JSON.parse(readContent(`${apiRoot}/meta.json`));
    expect(meta.pages).toContain('overview/billing-strategy/billing');
    expect(
      meta.sidebarLabels[
        '/zh-CN/api-reference/cloud-recording/restful/overview/billing-strategy/billing'
      ],
    ).toBe('计费说明');
  });
});
