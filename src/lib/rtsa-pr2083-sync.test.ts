import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(process.cwd(), 'content/docs/zh-CN');
const api = 'api-reference/rtsa/c/(current)/';
const guides = 'realtime-media/rtsa/';
const evidence = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      'docs/agents/reports/2026-10-20-hotfix-pr2083-evidence.json',
    ),
    'utf8',
  ),
) as {
  counts: Record<string, number>;
  sources: { path: string; hunks: string[]; hunkResults: string[] }[];
  memberHashes: {
    source: string;
    name: string;
    old: string | null;
    current: string;
  }[];
  renamedMethodHashes: { name: string; old: string; current: string }[];
  indexContracts: {
    source: string;
    target: string;
    entries: { symbol: string; hrefs: string[] }[];
  }[];
  parameterContracts: {
    source: string;
    target: string;
    name: string;
    parameters: string[];
  }[];
  protectedTargets: { path: string; sha256: string }[];
  sourceInlineLinkDeltas: {
    source: string;
    target: string;
    before: string;
    after: string;
  }[];
};

function read(path: string) {
  const absolute = resolve(root, path);
  expect(existsSync(absolute), path).toBe(true);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

// Fail loudly on renamed, absent, or duplicated section boundaries.
function section(body: string, start: string, end: string) {
  expect(body.split(start), start).toHaveLength(2);
  expect(body.split(end), end).toHaveLength(2);
  const a = body.indexOf(start);
  const b = body.indexOf(end);
  expect(b, `${start} precedes ${end}`).toBeGreaterThan(a);
  return body.slice(a, b);
}

function member(body: string, heading: string) {
  const start = `### ${heading}\n`;
  expect(body.split(start), heading).toHaveLength(2);
  const a = body.indexOf(start);
  const b = body.indexOf('\n### ', a + start.length);
  return body.slice(a, b < 0 ? undefined : b);
}

describe('RTSA #2083 frozen source delta', () => {
  it('uses Connection IDs in both leave examples and valid C bitrate boundaries', () => {
    const multi = read(`${guides}build/media-transmission/multi-channel.mdx`);
    for (const id of [1, 2, 3]) {
      expect(
        multi.match(new RegExp(`agora_rtc_leave_channel\\(conn${id}\\)`, 'g')),
      ).toHaveLength(2);
    }
    expect(multi).not.toContain('agora_rtc_leave_channel(cname');
    const bitrate = read(
      `${guides}build/media-transmission/bitrate-adaption.mdx`,
    );
    expect(bitrate).toContain('agora_rtc_set_bwe_param(CONNECTION_ID_ALL,');
    expect(bitrate).toContain(
      '__on_target_bitrate_changed(connection_id_t conn_id, uint32_t target_bps)',
    );
    expect(bitrate).toContain('curResolutionLevel = L2;');
    expect(bitrate).toContain(
      'highBitrateL2 < curTargetBitrate && curTargetBitrate <= highBitrateL3',
    );
    expect(bitrate).not.toMatch(/lowBitrateL\d\s*<\s*curTargetBitrate\s*</);
    expect(bitrate).not.toContain('curTargetBitRate');
  });

  it('keeps the binary RTM tutorial gated on successful asynchronous login', () => {
    const body = read(
      `${guides}build/media-and-signaling-transmission/implement-transmission.mdx`,
    );
    const rtm = section(body, '### 3. 传输信令', '### 4. 销毁 SDK 实例');
    for (const text of [
      'agora_rtm_login(',
      'agora_rtm_logout(',
      'on_rtm_send_data_result',
      'rtm_message_type_e msg_type, const char *custom_type',
      'RTM_EVENT_TYPE_LOGIN && err_code == ERR_RTM_OK',
      ':::caution',
      'if (!g_rtm_login_success_flag)',
      'const unsigned char buffer[] = {0x01, 0x02, 0x03};',
      'size_t msg_len = sizeof(buffer);',
      'uint32_t message_id = ++g_message_id;',
      'RTM_MESSAGE_TYPE_BINARY, NULL',
      'successfully\\n", message_id)',
      '%.*s',
      '%zu',
    ]) {
      expect(rtm, text).toContain(text);
    }
    expect(rtm).not.toMatch(/agora_rtc_(?:login_rtm|logout_rtm|send_rtm_data)/);
    expect(body).toContain('conn_id, uid, elapsed_ms);');
  });

  for (const product of ['smart-camera', 'smart-doorbell']) {
    it(`updates the ${product} shared consumer without changing its string payload`, () => {
      const body = read(`solutions/${product}/reference/advanced-feature.mdx`);
      const rtm = section(
        body,
        '### 2. 设备端和客户端登录 RTM 系统',
        '## 开发注意事项',
      );
      for (const text of [
        'agora_rtm_login(',
        'agora_rtm_send_data(',
        'rtm_message_type_e msg_type, const char *custom_type',
        'RTM_EVENT_TYPE_LOGIN && err_code == ERR_RTM_OK',
        'rtm_msg_state_e state',
        ':::caution',
        'if (!p_app->b_rtm_login_success_flag)',
        'static uint32_t message_id = 0;',
        'const char buffer[] = "device control";',
        'sizeof(buffer) - 1',
        '++message_id',
        'RTM_MESSAGE_TYPE_STRING, NULL',
        '%.*s',
        '%zu',
      ]) {
        expect(rtm, text).toContain(text);
      }
      expect(rtm).not.toMatch(/agora_rtc_(?:login_rtm|send_rtm_data)/);
    });
  }

  it('retains all three benchmark tables, measurement scope, and expanded C portability', () => {
    const overview = read(`${guides}index.mdx`);
    expect(overview).not.toContain('400 KB');
    expect(overview).not.toContain('2 MB');
    for (const text of [
      'v1.10.1',
      '单核',
      '不等同于集成 SDK 后的包体积增量',
      '47866.99',
      '84980.64',
      '3138.40',
      '48955.91',
      '86503.97',
      '2012.00',
      '37.95',
      '3871 KB',
      '1097 KB',
      '1590 KB',
    ]) {
      expect(overview, text).toContain(text);
    }
    const platforms = read(`${guides}reference/supported-platforms.mdx`);
    for (const text of [
      'C99',
      'https://github.com/AgoraIO-Community/aosl',
      '裸机 MCU',
      'mips-linux-gnu',
      'riscv32-linux-gnu',
      'riscv32-linux-musl',
      'riscv64-linux-gnu',
      'riscv64-linux-musl',
      'FreeRTOS',
      'ThreadX',
      'RT-Thread',
      'NuttX',
    ]) {
      expect(platforms, text).toContain(text);
    }
  });

  it('publishes the six RTM methods, five error values, and distinct custom_type limits', () => {
    const body = read(`${api}agora-rtc-api-8h.mdx`);
    const send = member(body, 'agora_rtm_send_data()');
    expect(send).toContain('最长 32 字节');
    expect(send).toContain('3 秒 180 次');
    expect(send).toContain('RTM_MESSAGE_TYPE_STRING');
    const publish = member(body, 'agora_rtm_publish()');
    expect(publish).toContain('最长 31 字节');
    expect(publish).toContain('31 KB');
    expect(publish).toContain('on_rtm_publish_result');
    for (const name of [
      'login',
      'logout',
      'subscribe',
      'unsubscribe',
      'publish',
      'send_data',
    ]) {
      expect(body).toContain(`### agora_rtm_${name}()`);
    }
    for (const code of [1007, 1008, 1009, 1010, 1011])
      expect(body).toContain(`${code}:`);
    expect(member(body, 'rtm_message_type_e')).toContain(
      'RTM_MESSAGE_TYPE_BINARY',
    );
    expect(member(body, 'rtm_message_type_e')).toContain(
      'RTM_MESSAGE_TYPE_STRING',
    );
  });

  it('binds every current/compatible member fragment to its real member heading', () => {
    const files: Record<string, string> = {
      'structagora__rtc__event__handler__t.html':
        'structagora-rtc-event-handler-t',
      'structagora__rtm__handler__t.html': 'structagora-rtm-handler-t',
      'structlog__config__t.html': 'structlog-config-t',
    };
    for (const hash of evidence.memberHashes) {
      const body = read(
        `${api}${files[hash.source.split('/').at(-1) ?? '']}.mdx`,
      );
      const heading = `### ${hash.name}\n`;
      expect(body.split(heading), hash.name).toHaveLength(2);
      for (const id of [hash.current, hash.old].filter(
        (id): id is string => !!id,
      )) {
        const anchor = `<a id="${id}"></a>`;
        expect(body.split(anchor), id).toHaveLength(2);
        const tail = body.slice(body.indexOf(anchor) + anchor.length);
        expect(
          tail.match(/^\s*(?:<a id="[^"]+"><\/a>\s*)*(### [^\n]+)/)?.[1],
        ).toBe(`### ${hash.name}`);
      }
    }
  });

  it('keeps RTM current indices and the complete member index linked to actual new contracts', () => {
    expect(read(`${api}classes.mdx`)).toContain('/structvideo-sei-t)');
    const overview = read(`${api}overview.mdx`);
    for (const name of [
      'agora_rtm_login',
      'agora_rtm_send_data',
      'agora_rtm_publish',
      'on_rtm_subscribe_result',
      'on_rtm_subscribe_data',
      'on_rtm_publish_result',
    ])
      expect(overview).toContain(name);
    for (const file of [
      'globals',
      'globals-a',
      'globals-c',
      'globals-e',
      'globals-l',
      'globals-r',
      'globals-s',
      'globals-u',
      'globals-v',
      'globals-w',
    ]) {
      const body = read(`${api}${file}.mdx`);
      expect(body).toContain('/globals-a#index_a)');
      expect(body).toContain('/globals#index__5F)');
      expect(body).not.toContain('globals__.html');
    }
    const functions = read(`${api}functions.mdx`);
    for (const name of [
      'on_rtm_subscribe_result',
      'on_rtm_subscribe_data',
      'on_rtm_publish_result',
      'sei_data',
      'video_sei_t',
    ])
      expect(functions).toContain(name);
  });

  it('covers every frozen source index entry and callback/method parameter, not just audit samples', () => {
    expect(evidence.counts).toEqual({
      all: 84,
      guide: 13,
      versionMeta: 1,
      shared: 1,
      internal: 6,
      html: 40,
      runtimeAsset: 23,
    });
    expect(evidence.sources).toHaveLength(84);
    for (const source of evidence.sources) {
      expect(source.hunkResults, source.path).toHaveLength(source.hunks.length);
      expect(source.hunkResults, source.path).not.toContain('pending');
    }
    for (const contract of evidence.indexContracts) {
      const body = readFileSync(
        resolve(process.cwd(), contract.target),
        'utf8',
      );
      for (const entry of contract.entries) {
        expect(body, `${contract.source}: ${entry.symbol}`).toContain(
          `- ${entry.symbol}:`,
        );
        for (const href of entry.hrefs)
          expect(body, `${contract.source}: ${href}`).toContain(`](${href})`);
      }
    }
    for (const contract of evidence.parameterContracts) {
      const body = readFileSync(
        resolve(process.cwd(), contract.target),
        'utf8',
      );
      const heading = contract.name.startsWith('agora_')
        ? `${contract.name}()`
        : contract.name;
      const selected = member(body, heading);
      const names = [...selected.matchAll(/<Parameter name="([^"]+)"/g)].map(
        (match) => match[1],
      );
      expect(names, `${contract.source}: ${contract.name}`).toEqual(
        contract.parameters,
      );
    }
  });

  it('keeps renamed method fragment aliases next to the corresponding current method', () => {
    const body = read(`${api}agora-rtc-api-8h.mdx`);
    for (const pair of evidence.renamedMethodHashes) {
      for (const id of [pair.old, pair.current]) {
        const anchor = `<a id="${id}"></a>`;
        expect(body.split(anchor), id).toHaveLength(2);
        expect(
          body
            .slice(body.indexOf(anchor) + anchor.length)
            .match(/^\s*(?:<a id="[^"]+"><\/a>\s*)*(### [^\n]+)/)?.[1],
        ).toBe(`### ${pair.name}()`);
      }
    }
    expect(read(`${guides}reference/release-notes.mdx`)).not.toContain(
      '/agora-rtc-api-8h#agora_err_code_e)',
    );
  });

  it('protects later safe downloads and both already-complete SEI pages byte for byte', () => {
    for (const file of evidence.protectedTargets) {
      const body = readFileSync(resolve(process.cwd(), file.path), 'utf8');
      // The aPaaS cleanup moved the mislabeled RTSA Linux package into an
      // explicit history section, and platform query links now use published
      // paths; keep the original migration evidence intact.
      const expectedHash =
        file.path ===
        'content/docs/zh-CN/realtime-media/rtsa/reference/downloads.mdx'
          ? 'bb2a2ddede13ee1b59f2b51b8145e5bfef578ea3303027369cdf2cdedaa0f8b3'
          : file.sha256;
      expect(createHash('sha256').update(body).digest('hex'), file.path).toBe(
        expectedHash,
      );
    }
  });

  it('preserves every changed source xref and removes malformed JavaScript mail links without guessing an address', () => {
    for (const delta of evidence.sourceInlineLinkDeltas) {
      const body = readFileSync(resolve(process.cwd(), delta.target), 'utf8');
      expect(
        body.includes(delta.after),
        `${delta.source}: ${delta.after}`,
      ).toBe(true);
      expect(
        body.includes(delta.before),
        `${delta.source}: ${delta.before}`,
      ).toBe(false);
    }
    const crypto = read(`${api}structcrypto-option-t.mdx`);
    expect(crypto).toContain(
      '[AES_128_GCM2](/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h#a1e4f35ba0de825f5576535acfbaeb44ea23d6a46e00004410b9d00b41aba70e0d)',
    );
    expect(crypto).toContain(
      '[AES_256_GCM2](/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h#a1e4f35ba0de825f5576535acfbaeb44ea13555f5e3977644e0fb20ee80e9b841a)',
    );
    expect(read(`${api}structrtc-channel-options-t.mdx`)).toContain(
      '[enable_audio_jitter_buffer](/zh-CN/api-reference/rtsa/c/structrtc-channel-options-t#a8f34d0553bdc017b0c89eeab3d1702e0)',
    );
    const service = read(`${api}structrtc-service-option-t.mdx`);
    expect(service).toContain(
      '联系 sales.nosp@m.@she.nosp@m.ngwan.nosp@m.g.cn',
    );
    expect(service).not.toContain('[sales.nosp@m.');
    expect(service).not.toMatch(/mai'|javascript:|mailto:/);
  });

  it('provides a limited conditional cloud proxy declaration and the approved archive entry', () => {
    const body = read(`${api}cloud-proxy-reference.mdx`);
    expect(body).toContain('<h2 id="l00960">cloud_proxy_type_e</h2>');
    expect(body).toContain('<h2 id="l01930">agora_rtc_set_cloud_proxy</h2>');
    expect(body.match(/#ifdef CONFIG_RTC_PROXY/g)).toHaveLength(2);
    expect(body.match(/#endif/g)).toHaveLength(2);
    for (const text of [
      'CLOUD_PROXY_NONE = 0',
      'CLOUD_PROXY_UDP = 1',
      'CLOUD_PROXY_TCP = 3',
      'CLOUD_PROXY_TLS = 4',
      'CLOUD_PROXY_AUTO = 100',
      'extern __agora_api__ int agora_rtc_set_cloud_proxy(cloud_proxy_type_e type);',
      '实际集成 SDK',
    ])
      expect(body).toContain(text);
    expect(
      read(`${guides}build/network-and-region-access/cloud-proxy.mdx`),
    ).toContain('/cloud-proxy-reference#l01930)');
    const meta = JSON.parse(read('api-reference/rtsa/c/meta.json'));
    expect(meta.navScope.versions).toContainEqual({
      id: '1.9.7',
      label: 'v1.9.7',
      path: '1.9.7',
      href: 'https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtsa/c/overview',
    });
    expect(meta.pages).not.toContain('1.9.7');
  });
});
