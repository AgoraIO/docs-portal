import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsMetaSchema } from './docs-meta-schema';

const read = (file: string) => readFileSync(resolve(file), 'utf8');
const report = JSON.parse(
  read('docs/agents/reports/2026-10-20-hotfix-pr2094-fix.json'),
) as {
  string_methods: Record<string, { signature: string }>;
  expectations: Record<string, string>;
  inventory: Array<{
    source_path: string;
    target_path: string | null;
    target_old_ids: string[];
    member_delta?: { added: string[]; removed: string[]; changed: string[] };
  }>;
};
const platforms = ['android', 'cpp-all-platforms', 'ios', 'macos'];
const file = (platform: string, page: string) =>
  `content/docs/zh-CN/api-reference/rtc/${platform}/(current)/${page}.mdx`;
const normalize = (value: string) =>
  value.replace(/^ \* /gm, '- ').replace(/\s+/g, ' ').trim();

function section(text: string, start: string, end: string) {
  const starts = text.split(start);
  if (starts.length !== 2) throw new Error(`起点必须存在且唯一：${start}`);
  const endAt = starts[1].indexOf(end);
  if (endAt < 0) throw new Error(`终点缺失或顺序错误：${end}`);
  return starts[1].slice(0, endAt);
}

function members(text: string) {
  const names = [...text.matchAll(/<Parameter name="([^"]+)">/g)].map(
    (match) => match[1],
  );
  expect(new Set(names).size).toBe(names.length);
  return new Map(
    names.map((name) => [
      name,
      normalize(section(text, `<Parameter name="${name}">`, '</Parameter>')),
    ]),
  );
}

describe('RTC PR #2094 frozen source delta', () => {
  it('rejects missing, duplicate, and reversed member boundaries', () => {
    expect(() => section('end start', 'start', 'end')).toThrow();
    expect(() => section('start start end', 'start', 'end')).toThrow();
    expect(() => section('end', 'start', 'end')).toThrow();
  });

  for (const [target, expected] of Object.entries(report.expectations)) {
    it(`matches each frozen source member: ${target}`, () => {
      const actual = members(read(target));
      for (const [name, value] of members(expected)) {
        expect(actual.get(name), name).toBe(value);
      }
    });
  }

  it.each(['ios', 'macos'])(
    '%s preserves removed error hashes outside current enum',
    (platform) => {
      const text = read(file(platform, 'enum-errorcodetype'));
      const current = section(text, '<ParameterList>', '</ParameterList>');
      for (const name of ['Refused', 'NoPermission', 'Abort']) {
        expect(current).not.toContain(`name="AgoraErrorCode${name}"`);
        expect(text).toContain(
          `<a id="agoraerrorcode${name.toLowerCase()}"></a>`,
        );
      }
      const delta = report.inventory.find((item) =>
        item.source_path.includes(
          `/${platform === 'ios' ? 'iOS' : 'macOS'}/API/enum_errorcodetype`,
        ),
      )?.member_delta;
      expect(delta?.added).toHaveLength(27);
      expect(delta?.removed).toHaveLength(3);
      expect(delta?.changed).toHaveLength(37);
    },
  );

  it.each(platforms)(
    '%s publishes the complete String method and related links',
    (platform) => {
      const page = read(
        file(platform, 'video/video-prenpro/video-enhance-option'),
      );
      const method = section(
        page,
        '<a id="api_ivideoeffectobject_setvideoeffectstringparam"></a>',
        '<a id="api_ivideoeffectobject_setvideoeffectstringparam__return_values"></a>',
      );
      expect(method).toContain('setVideoEffectStringParam');
      expect(normalize(method)).toContain(
        normalize(report.string_methods[platform].signature),
      );
      expect(method).toContain('v4.6.0');
      expect(members(method).size).toBe(3);
      expect(
        page.slice(
          page.indexOf(
            'api_ivideoeffectobject_setvideoeffectstringparam__return_values',
          ),
        ),
      ).toContain('0');
      expect(page).not.toContain(
        'rtc-interface-class#class_ivideoeffectobject',
      );
      expect(read(file(platform, 'class-ivideoeffectobject'))).not.toContain(
        'unresolved-related-link',
      );
      for (const name of [
        'class-ivideoeffectobject',
        'rtc-api-overview',
        'rtc-interface-class',
      ]) {
        expect(read(file(platform, name))).toContain(
          '#api_ivideoeffectobject_setvideoeffectstringparam',
        );
      }
      expect(read(file(platform, 'rtc-api-data-type'))).toContain(
        `/rtc/${platform}/class-ivideoeffectobject`,
      );
      expect(read(file(platform, 'enum-videoeffectnodeid'))).toContain(
        platform === 'ios' || platform === 'macos'
          ? 'AgoraVideoEffectNodeSticker'
          : 'STICKER',
      );
    },
  );

  it('removes preview metadata fields without dropping old hashes', () => {
    const text = read(file('cpp-all-platforms', 'class-externalvideoframe'));
    expect(text).not.toContain('uint8_t* metadataBuffer');
    expect(text).not.toContain('name="metadataBuffer"');
    expect(text).not.toContain('name="metadataSize"');
    expect(text).toContain('<a id="metadatabuffer"></a>');
    expect(text).toContain('<a id="metadatasize"></a>');
  });

  it('keeps every preexisting stable class hash', () => {
    for (const item of report.inventory.filter((item) =>
      item.target_path?.endsWith('/rtc-interface-class.mdx'),
    )) {
      const text = read(item.target_path as string);
      for (const id of item.target_old_ids)
        expect(text).toContain(`<a id="${id}"></a>`);
    }
  });

  it('keeps connection-state recovery removal and independent validation list scoped', () => {
    const text = read(file('android', 'network'));
    const parameters = section(
      text,
      '<a id="callback_irtcengineeventhandler_onconnectionstatechanged__parameters"></a>',
      '\n### 所属接口类',
    );
    const state = section(
      parameters,
      '<Parameter name="state">',
      '</Parameter>',
    );
    expect(state).toContain(
      '`CONNECTION_STATE_FAILED` (5)：SDK 连接声网边缘服务器失败。',
    );
    expect(state).not.toContain('leaveChannel');
    expect(parameters).toContain('\n请确保：\n\n- 项目启用 App Certificate');
    expect(parameters).not.toContain('  - 请确保：');
  });

  it.each(['cpp-all-platforms', 'ios', 'macos'])(
    '%s keeps eight CDN rows with the exact source enum names',
    (platform) => {
      const text = read(file(platform, 'rtc-api-sunset'));
      const deprecated = section(text, '## 已废弃 API', '## 已删除 API');
      const rows = deprecated
        .split('\n')
        .filter((line) => line.startsWith('|'));
      const cdnRows = rows.slice(2, 10);
      expect(cdnRows).toHaveLength(8);
      expect(cdnRows.join('\n')).toContain(
        platform === 'cpp-all-platforms'
          ? 'DIRECT_CDN_STREAMING_STATE'
          : 'AgoraDirectCdnStreamingState',
      );
      expect(cdnRows.join('\n')).toContain(
        platform === 'cpp-all-platforms'
          ? 'DIRECT_CDN_STREAMING_REASON'
          : 'AgoraDirectCdnStreamingReason',
      );
      if (platform !== 'cpp-all-platforms') {
        expect(cdnRows[2]).toContain(
          'startDirectCdnStreaming\\:publishUrl\\:mediaOptions:',
        );
        const audio = deprecated
          .split('\n')
          .find((line) => line.includes('[audioQualityBlock:]'));
        expect(audio).toContain('每个远端用户发送音频流的统计信息');
      }
    },
  );

  it('updates the Android current title and only verified historical archive versions', () => {
    expect(
      read('content/docs/zh-CN/api-reference/rtc/android/(current)/meta.json'),
    ).toContain('v4.7.0');
    for (const platform of ['macos', 'cpp-all-platforms']) {
      const text = read(
        `content/docs/zh-CN/api-reference/rtc/${platform}/meta.json`,
      );
      expect(text).toContain('v4.6.2');
      expect(text).toContain(
        'https://doc-archive.shengwang.cn/archive/0.0.492/',
      );
      expect(text).not.toContain('0.0.519');
      expect(docsMetaSchema.safeParse(JSON.parse(text)).success).toBe(true);
    }
  });
});
