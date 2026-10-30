import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const apiRoot = 'content/docs/zh-CN/api-reference/cloud-recording/restful';
const productRoot = 'content/docs/zh-CN/realtime-media/cloud-recording';
const copies = [
  {
    title: '实现单流录制',
    api: 'user-guides/individual-mode/set-individual',
    product: 'build/recording-modes/individual-mode/set-individual',
    legacy: 'build/recording-modes/individual-mode/legacy-set-individual',
    normalizedSignals: 5,
    normalizedFragments: 7,
  },
  {
    title: '录制文件介绍',
    api: 'user-guides/manage-file/introduce-recorded-files',
    product: 'build/manage-recorded-files/introduce-recorded-files',
    legacy: 'build/manage-recorded-files/legacy-introduce-recorded-files',
    normalizedSignals: 3,
    normalizedFragments: 3,
  },
];

function readContent(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function readDoc(path: string) {
  const source = readContent(path);
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
  expect(frontmatter, path).not.toBeNull();
  return {
    metadata: yaml.load(frontmatter?.[1] ?? '') as {
      title: string;
      _migration: {
        type: string;
        status: string;
        sourceUrl: string;
        sourcePath: string;
        generator: string;
        warnings: unknown[];
      };
    },
    body: source.slice(frontmatter?.[0].length ?? 0).trim(),
  };
}

function apiDoc(index: number) {
  return readDoc(`${productRoot}/${copies[index].product}.mdx`);
}

function section(body: string, heading: string, endHeading: string) {
  const start = body.indexOf(heading);
  expect(start, heading).toBeGreaterThanOrEqual(0);
  const end = body.indexOf(endHeading, start + heading.length);
  expect(end, endHeading).toBeGreaterThan(start);
  return body.slice(start, end);
}

describe('Cloud Recording PR 2091 canonical guide fidelity', () => {
  it.each(copies)(
    'keeps a single canonical source for $api',
    ({ api, product, title }) => {
      expect(existsSync(`${apiRoot}/${api}.mdx`)).toBe(false);
      expect(readDoc(`${productRoot}/${product}.mdx`).metadata.title).toBe(
        title,
      );
    },
  );

  it.each(copies)(
    'keeps the new-mode notice and old-guide link for $api',
    ({ product, legacy }) => {
      const { body } = readDoc(`${productRoot}/${product}.mdx`);
      expect(body).toContain('本文内容适用于新单流录制。');
      expect(body).toContain(`/zh-CN/realtime-media/cloud-recording/${legacy}`);
      expect(
        existsSync(resolve(process.cwd(), `${productRoot}/${legacy}.mdx`)),
      ).toBe(true);
    },
  );

  it('uses raw start/stop and removes streamMode from the API individual guide', () => {
    const body = apiDoc(0).body;
    expect(body).toContain('/mode/raw/start');
    expect(body).toContain('/mode/raw/stop');
    expect(body).not.toContain('streamMode');
    const configuration = section(
      body,
      '#### 请求示例',
      '### 单流直接生成 MP4',
    );
    expect(configuration).toContain('`["hls", "mp3"]`');
    expect(configuration).toContain('`["hls", "mp4"]`');
    expect(configuration).toMatch(/`\["mp3"\]`\s*\|\s*不支持/);
    expect(configuration).toMatch(/`\["mp4"\]`\s*\|\s*不支持/);
  });

  it('keeps source-specific Native/Web MP4 constraints and stranded handling', () => {
    const body = apiDoc(0).body;
    const mp4 = section(body, '### 单流直接生成 MP4', '### 停止录制');
    for (const marker of [
      'H.264、H.265 或 AV1',
      'VP8 或 VP9',
      '源流分辨率保持不变',
      'orientationMode',
      'DEGRADATION_PREFERENCE',
      'setOptimizationMode',
      '`detail`',
      '合流录制',
    ]) {
      expect(mp4).toContain(marker);
    }
    const stop = section(body, '### 停止录制', '## 开发注意事项');
    expect(stop).toContain('`stranded`');
  });

  it('uses codec-specific raw file names and updated examples', () => {
    const body = apiDoc(1).body;
    const names = section(body, '### 单流录制模式', '### 合流录制模式');
    for (const marker of [
      '`mode/raw`',
      '__uid_e_<utc>_<codec>.ts',
      '__uid_e_<index>_<codec>.mp4',
      '<stream index>_<segment index>_<codec>.webm',
      '_av1_init.m4s',
      '__uid_e_<index>_mp3.mp3',
      'cloud_recording_file_infos',
    ]) {
      expect(names).toContain(marker);
    }
    expect(body).toContain('__uid_e_20190920125142485_h264.ts');
    expect(body).toContain('__uid_e_20190920125142289_aac.ts');
  });

  it('scopes segmentation rules to individual and other recording modes', () => {
    const body = apiDoc(1).body;
    const segmentation = section(
      body,
      '## 录制文件切片规则',
      '## 估算录制文件大小',
    );
    for (const marker of [
      '每种编码器会对应一个独立的索引文件',
      '视频旋转角度发生变化',
      '超过约 3 小时',
      '超过约 2 GB',
      '30～120 分钟',
      '默认值为 30 分钟',
      '`sliceDuration`',
      '`maxVideoDuration`',
    ]) {
      expect(segmentation).toContain(marker);
    }
  });

  it('keeps the source-hidden non-transcoding page out of API navigation', () => {
    const navigation = readContent(`${apiRoot}/meta.json`);
    expect(navigation).not.toContain('set-individual-without-transcoding');
    expect(navigation).not.toContain('...');
  });
});
