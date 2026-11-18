import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { remarkHeading } from 'fumadocs-core/mdx-plugins';
import type { Folder, Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import { type DocsMeta, docsMetaSchema } from './docs-meta-schema';
import { resolveDocsNavScope } from './docs-nav-scope';

const read = (file: string) => readFileSync(resolve(file), 'utf8');
const report = JSON.parse(
  read('docs/agents/reports/2026-10-20-hotfix-pr2094-fix.json'),
) as {
  string_methods: Record<
    string,
    { signature: string; parameters: Array<[string, string]> }
  >;
  expectations: Record<string, string>;
  inventory: Array<{
    source_path: string;
    target_path: string | null;
    target_old_ids: string[];
    member_delta?: { added: string[]; removed: string[]; changed: string[] };
  }>;
};
const stringReturns = JSON.parse(
  read('src/lib/fixtures/rtc-pr2094-string-method-contracts.json'),
) as { methods: Record<string, { return: string }> };
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

function expectMemberContract(
  actual: Map<string, string>,
  expected: Map<string, string>,
) {
  expect([...actual.keys()].sort()).toEqual([...expected.keys()].sort());
  for (const [name, value] of expected) {
    expect(actual.get(name), name).toBe(value);
  }
}

const stringReturnAnchor =
  '<a id="api_ivideoeffectobject_setvideoeffectstringparam__return_values"></a>';
const stringParametersAnchor =
  '<a id="api_ivideoeffectobject_setvideoeffectstringparam__parameters"></a>';

function expectStringValueContract(page: string, platform: string) {
  const parameters = section(page, stringParametersAnchor, stringReturnAnchor);
  const expected = new Map(
    report.string_methods[platform].parameters
      .filter(([name]) => name !== '自从')
      .map(([name, description]) => [name, normalize(description)]),
  );
  expect(expected.size).toBe(3);
  expectMemberContract(members(parameters), expected);
  const returns = section(page, stringReturnAnchor, '\n### 所属接口类');
  expect(returns.match(/^### 返回值$/gm)).toHaveLength(1);
  const description = returns
    .trim()
    .replace(/^### 返回值\n/, '')
    .replace(/^-\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1');
  expect(normalize(description)).toBe(
    normalize(stringReturns.methods[platform].return),
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
      expectMemberContract(actual, members(expected));
    });
  }

  it.each(['ios', 'macos'])(
    '%s omits historical definitions removed from the current source',
    (platform) => {
      const text = read(file(platform, 'enum-errorcodetype'));
      expect(text).not.toContain('旧定义引用');
      for (const name of ['Refused', 'NoPermission', 'Abort']) {
        expect(text).not.toContain(`AgoraErrorCode${name}`);
        expect(text).not.toContain(
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

  it.each(['ios', 'macos'])(
    '%s uses the current source face-shape description',
    (platform) => {
      const text = read(file(platform, 'enum-faceshapearea'));
      expect(text.match(/^description: (.+)$/m)?.[1]).toBe(
        '选择需要调整的特定面部区域。',
      );
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
      expectStringValueContract(page, platform);
      expect(page).not.toContain(
        'rtc-interface-class#class_ivideoeffectobject',
      );
      expect(read(file(platform, 'class-ivideoeffectobject'))).not.toContain(
        'unresolved-related-link',
      );
      for (const name of ['class-ivideoeffectobject', 'rtc-api-overview']) {
        expect(read(file(platform, name))).toContain(
          '#api_ivideoeffectobject_setvideoeffectstringparam',
        );
      }
      const index = read(file(platform, 'rtc-interface-class'));
      expect(index).not.toMatch(
        /IVideoEffectObject|AgoraVideoEffectObject|ivideoeffectobject/,
      );
      for (const source of [
        file(platform, 'rtc-api-overview'),
        'content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx',
      ]) {
        expect(read(source)).not.toContain(
          `/${platform}/rtc-interface-class#class_ivideoeffectobject`,
        );
        if (
          source.endsWith('/release-notes.mdx') ||
          platform === 'android' ||
          platform === 'cpp-all-platforms'
        ) {
          expect(read(source)).toContain(
            `/${platform}/class-ivideoeffectobject`,
          );
        }
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

  it.each(platforms)(
    '%s rejects swapped String parameter descriptions',
    (platform) => {
      const page = read(
        file(platform, 'video/video-prenpro/video-enhance-option'),
      );
      const parameters = section(
        page,
        stringParametersAnchor,
        stringReturnAnchor,
      );
      const option = section(
        parameters,
        '<Parameter name="option">',
        '</Parameter>',
      );
      const key = section(parameters, '<Parameter name="key">', '</Parameter>');
      const swapped = parameters
        .replace(
          `<Parameter name="option">${option}</Parameter>`,
          `<Parameter name="option">${key}</Parameter>`,
        )
        .replace(
          `<Parameter name="key">${key}</Parameter>`,
          `<Parameter name="key">${option}</Parameter>`,
        );
      expect(swapped).not.toBe(parameters);
      expect(() =>
        expectStringValueContract(page.replace(parameters, swapped), platform),
      ).toThrow();
    },
  );

  it.each(platforms)(
    '%s rejects a missing String failure return',
    (platform) => {
      const page = read(
        file(platform, 'video/video-prenpro/video-enhance-option'),
      );
      const returns = section(page, stringReturnAnchor, '\n### 所属接口类');
      const missingFailure = returns.includes('小于 0：失败。')
        ? returns.replace('小于 0：失败。', '')
        : returns.replace(/^.*失败。.*\n?/m, '');
      expect(missingFailure).not.toBe(returns);
      expect(missingFailure).toContain('0');
      expect(() =>
        expectStringValueContract(
          page.replace(returns, missingFailure),
          platform,
        ),
      ).toThrow();
    },
  );

  for (const [target, expected] of Object.entries(report.expectations)) {
    it(`rejects a fabricated member in the complete contract: ${target}`, () => {
      const mutant = expected.replace(
        '</ParameterList>',
        '<Parameter name="FabricatedMember">not in frozen source</Parameter>\n</ParameterList>',
      );
      expect(mutant).not.toBe(expected);
      expect(() =>
        expectMemberContract(members(mutant), members(expected)),
      ).toThrow();
    });
  }

  it('removes preview metadata fields without dropping old hashes', () => {
    const text = read(file('cpp-all-platforms', 'class-externalvideoframe'));
    expect(text).not.toContain('uint8_t* metadataBuffer');
    expect(text).not.toContain('name="metadataBuffer"');
    expect(text).not.toContain('name="metadataSize"');
    expect(text).toContain('<a id="metadatabuffer"></a>');
    expect(text).toContain('<a id="metadatasize"></a>');
  });

  it.each(
    Object.entries({
      android: [
        ['IVideoEncodedFrameObserver', '#相关参考-26'],
        ['IVideoFrameObserver', '#相关参考-27'],
        ['Player', '#相关参考-28'],
        ['PlayerConfig', '#相关参考-29'],
        ['PlayerGetStatsCallback', '#相关参考-30'],
        ['PlayerObserver', '#相关参考-31'],
        ['Rte', '#相关参考-32'],
        ['PlayerInfo', '#相关参考-33'],
      ],
      'cpp-all-platforms': [
        ['IVideoEncodedFrameObserver', '#相关参考-29'],
        ['IVideoFrameObserver', '#相关参考-30'],
        ['MusicChartCollection', '#相关参考-31'],
        ['Player', '#相关参考-32'],
        ['PlayerConfig', '#相关参考-33'],
        ['PlayerObserver', '#相关参考-34'],
        ['Rte', '#相关参考-35'],
        ['PlayerInfo', '#相关参考-36'],
      ],
      ios: [
        ['AgoraEncodedVideoFrameDelegate', '#相关参考-24'],
        ['AgoraVideoFrameDelegate', '#相关参考-25'],
        ['AgoraRtePlayer', '#相关参考-26'],
        ['AgoraRtePlayerConfig', '#相关参考-27'],
        ['AgoraRtePlayerObserver', '#相关参考-28'],
        ['AgoraRte', '#相关参考-29'],
      ],
      macos: [
        ['AgoraEncodedVideoFrameDelegate', '#相关参考-21'],
        ['AgoraVideoFrameDelegate', '#相关参考-22'],
        ['AgoraRtePlayer', '#相关参考-23'],
        ['AgoraRtePlayerConfig', '#相关参考-24'],
        ['AgoraRtePlayerObserver', '#相关参考-25'],
        ['AgoraRte', '#相关参考-26'],
      ],
    }),
  )(
    '%s keeps related-reference hashes attached to their original classes',
    async (platform, headings) => {
      const source = read(file(platform, 'rtc-interface-class'));
      const compiled = await compile(source.replace(/^---[\s\S]*?---\s*/, ''), {
        remarkPlugins: [remarkHeading],
      });
      const toc = compiled.data.toc as Array<{
        title: string;
        url: string;
        depth: number;
      }>;
      for (const [name, url] of headings) {
        const heading = toc.findIndex((entry) => entry.title === name);
        expect(heading).toBeGreaterThanOrEqual(0);
        expect(toc[heading + 1]).toMatchObject({
          title: '相关参考',
          url,
          depth: 3,
        });
      }
    },
  );

  it('keeps preexisting class hashes except the retired video effect sections', () => {
    for (const item of report.inventory.filter((item) =>
      item.target_path?.endsWith('/rtc-interface-class.mdx'),
    )) {
      const text = read(item.target_path as string);
      const platform = platforms.find(
        (platform) =>
          item.target_path === file(platform, 'rtc-interface-class'),
      );
      const retiredTitleIds: Record<string, string> = {
        android: 'ariaid-title28',
        'cpp-all-platforms': 'ariaid-title32',
        ios: 'ariaid-title27',
        macos: 'ariaid-title24',
      };
      const retiredIds = platform
        ? [
            'class_ivideoeffectobject',
            'class_ivideoeffectobject__detailed_desc',
            retiredTitleIds[platform],
          ]
        : [];
      for (const id of item.target_old_ids) {
        if (retiredIds.includes(id)) {
          expect(text).not.toContain(`<a id="${id}"></a>`);
        } else {
          expect(text).toContain(`<a id="${id}"></a>`);
        }
      }
    }
  });

  it('keeps connection-state recovery per join API and Token validation scoped to its reason', () => {
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
      '`CONNECTION_STATE_FAILED` (5)：SDK 无法连接声网边缘服务器或加入频道，并停止重连。',
    );
    expect(state).toContain(
      '用户被服务端踢出、Token 失效或鉴权失败时，回调报告的 `reason` 可能不同，但进入该状态后的恢复流程一致：',
    );
    const recoverySteps = state.match(/^ {2}- .* 场景：.*$/gm) ?? [];
    expect(recoverySteps).toHaveLength(2);
    expect(recoverySteps[0]).toContain(
      '`joinChannel` 场景：先调用 `leaveChannel`，等待 ',
    );
    expect(recoverySteps[0]).toContain(
      '回调报告 `CONNECTION_STATE_DISCONNECTED` (1)，再使用有效的新 Token 调用 `joinChannel`。',
    );
    expect(recoverySteps[0]).toContain(
      '如果未先离开频道，`joinChannel` 会返回 -17（`ERR_JOIN_CHANNEL_REJECTED`）。',
    );
    expect(recoverySteps[1]).toContain(
      '[joinChannelEx](/zh-CN/api-reference/rtc/android/channel#api_irtcengineex_joinchannelex) 场景：针对对应的 [RtcConnection](/zh-CN/api-reference/rtc/android/class-rtcconnection) 调用 `leaveChannelEx`，等待该连接的 ',
    );
    expect(recoverySteps[1]).toContain(
      '回调报告 `CONNECTION_STATE_DISCONNECTED` (1)，再使用有效的新 Token 调用 [joinChannelEx](/zh-CN/api-reference/rtc/android/channel#api_irtcengineex_joinchannelex)。',
    );
    expect(recoverySteps[1]).toContain(
      '如需只清理该连接，请使用 `leaveChannelEx`；调用 `leaveChannel` 会离开当前加入的所有频道。',
    );
    for (const step of recoverySteps) {
      expect(step).toContain(
        '[onConnectionStateChanged](/zh-CN/api-reference/rtc/android/network#callback_irtcengineeventhandler_onconnectionstatechanged)',
      );
    }
    const reason = section(
      parameters,
      '<Parameter name="reason">',
      '</Parameter>',
    );
    const invalidToken = section(
      reason,
      '- `CONNECTION_CHANGED_INVALID_TOKEN` (8)：',
      '\n- `CONNECTION_CHANGED_TOKEN_EXPIRED` (9)：',
    );
    expect(invalidToken).toContain(
      [
        '  - 请确保：',
        '',
        '    - 项目启用 App Certificate 时，加入频道必须传入 Token。',
        '    - 生成 Token 时指定的用户 ID 与加入频道时使用的用户 ID 一致。',
        '    - 使用的 Token 与生成的 Token 一致。',
      ].join('\n'),
    );
    expect(state).not.toContain('请确保：');
    expect(reason).not.toContain('\n请确保：');
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

  it('keeps the Android current version in the switcher and the upstream macOS/C++ archive snapshot', () => {
    expect(
      JSON.parse(
        read('content/docs/zh-CN/api-reference/rtc/android/meta.json'),
      ).navScope.versions.find(
        (version: { id: string }) => version.id === 'current',
      ),
    ).toMatchObject({ label: 'v4.7.0', path: '(current)' });
    for (const platform of ['macos', 'cpp-all-platforms']) {
      const text = read(
        `content/docs/zh-CN/api-reference/rtc/${platform}/meta.json`,
      );
      expect(text).toContain('v4.6.2');
      expect(
        JSON.parse(text).navScope.versions.find(
          (version: { id: string }) => version.id === '4.6.2',
        ),
      ).toMatchObject({
        href: `https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/${platform === 'macos' ? 'macos' : 'windows'}/API/rtc_api_overview`,
      });
      expect(docsMetaSchema.safeParse(JSON.parse(text)).success).toBe(true);
    }
  });

  it.each(['android', 'ios'])(
    '%s preserves the browser-verified 4.6.4 archive through the real resolver',
    (platform) => {
      const directory = `content/docs/zh-CN/api-reference/rtc/${platform}`;
      const raw = JSON.parse(read(`${directory}/meta.json`));
      const meta = docsMetaSchema.parse(raw);
      const archive = {
        id: '4.6.4',
        label: 'v4.6.4',
        path: '4.6.4',
        href: `https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/${platform}/API/rtc_api_overview`,
      };
      const versions = meta.navScope?.versions ?? [];
      expect(versions[1]).toEqual(archive);
      expect(raw.navScope.versions[1]).toEqual(archive);
      expect(new Set(versions.map((version) => version.id)).size).toBe(
        versions.length,
      );
      expect(existsSync(resolve(directory, '4.6.4'))).toBe(false);

      // The complete historical inventory now owns version options. Keep
      // the PR's original current metadata and content structure protected.
      const separatelyOwnedArchive = raw.navScope.versions.find(
        (version: { id: string }) => version.id === '4.6.2',
      );
      if (separatelyOwnedArchive) {
        expect(separatelyOwnedArchive).toEqual({
          id: '4.6.2',
          label: 'v4.6.2',
          path: '4.6.2',
          href: `https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/${platform}/API/rtc_api_overview`,
        });
        expect(raw.navScope.versions[2]).toEqual(separatelyOwnedArchive);
      }
      const localVersions =
        platform === 'android'
          ? [{ id: '4.6.0', label: 'v4.6.0', path: '4.6.0' }]
          : [];
      const withoutApprovedArchives = {
        ...raw,
        navScope: {
          ...raw.navScope,
          versions: raw.navScope.versions.filter(
            (version: { id: string }) => version.id === 'current',
          ),
        },
      };
      // Non-history metadata frozen at 7c6c60ead44406e69906c5c3808cd489784aa89e.
      expect(withoutApprovedArchives).toEqual({
        title: platform === 'android' ? 'Android API 参考' : 'iOS API 参考',
        navScope: {
          defaultVersion: 'current',
          versions: [{ id: 'current', label: 'v4.7.0', path: '(current)' }],
        },
        pages: platform === 'android' ? ['(current)', '4.6.0'] : ['(current)'],
      });

      const activePath = `/zh-CN/api-reference/rtc/${platform}/rtc-api-overview`;
      const currentFolder: Folder = {
        name: '(current)',
        type: 'folder',
        children: [{ name: 'API 概览', type: 'page', url: activePath }],
      };
      const platformFolder: Folder = {
        name: platform,
        type: 'folder',
        children: [
          currentFolder,
          ...localVersions.map(
            (version): Folder => ({
              name: version.path,
              type: 'folder',
              children: [
                {
                  name: 'API 概览',
                  type: 'page',
                  url: `/zh-CN/api-reference/rtc/${platform}/${version.path}/overview`,
                },
              ],
            }),
          ),
        ],
      };
      const root: Root = {
        name: '文档',
        children: [
          {
            name: '参考',
            type: 'folder',
            root: true,
            index: { name: '参考', type: 'page', url: '/zh-CN/api-reference' },
            children: [platformFolder],
          },
        ],
      };
      const scope = resolveDocsNavScope({
        activePath,
        getNodeMeta: (node): DocsMeta | undefined =>
          node === platformFolder ? meta : undefined,
        root,
        tab: 'api-reference',
      });
      expect(scope?.activeVersion?.id).toBe('current');
      expect(scope?.sidebarRoot).toBe(currentFolder);
      expect(scope?.header.versionSwitcher?.currentId).toBe('current');
      expect(scope?.header.versionSwitcher?.versions).toContainEqual({
        href: archive.href,
        id: archive.id,
        label: archive.label,
      });
      if (platform === 'android') {
        expect(scope?.header.versionSwitcher?.versions).toContainEqual({
          href: 'https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/android/API/rtc_api_overview',
          id: '4.6.0',
          label: 'v4.6.0',
        });
      }
    },
  );
});
