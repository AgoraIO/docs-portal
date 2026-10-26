import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import { selectPlatformMarkdown } from '../test/platform-markdown';
import { docsMetaSchema } from './docs-meta-schema';
import { resolveDocsNavScope } from './docs-nav-scope';
import type { PlatformKey } from './platforms/registry';

const root = resolve(process.cwd(), 'content/docs/zh-CN');
const rtm = 'realtime-media/rtm/';
const api = 'api-reference/rtm/';
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const fields = [
  'currentState',
  'previousState',
  'serviceType',
  'operation',
  'reason',
  'affectedChannels',
  'timestamp',
  'isResumed',
];

function between(text: string, start: string, end: string) {
  expect(text.split(start), `unique start: ${start}`).toHaveLength(2);
  const offset = text.indexOf(start) + start.length;
  const finish = text.indexOf(end, offset);
  expect(finish, `end after start: ${end}`).toBeGreaterThan(offset);
  return text.slice(offset, finish);
}

function platform(text: string, name: PlatformKey) {
  return selectPlatformMarkdown(text, name);
}

function linkListeners(text: string, count: number) {
  const listeners = [
    ...text.matchAll(
      /(?:addEvent[Ll]istener|\.on)\(["']linkState["'],\s*(?:function\s*\(event\)|event\s*=>)\s*\{([\s\S]*?)\}\);/g,
    ),
  ];
  expect(listeners).toHaveLength(count);
  for (const listener of listeners)
    for (const field of fields) expect(listener[1]).toContain(`event.${field}`);
  expect(text).not.toMatch(/(?:addEvent[Ll]istener|\.on)\(["']status["']/);
}

describe('RTM source PR #2067: scoped Web 2.3.0 migration', () => {
  it('offers current Web and the exact 2.2.4 archive without moving API pages', () => {
    const meta = docsMetaSchema.parse(JSON.parse(read(`${api}web/meta.json`)));
    expect(meta.navScope?.defaultVersion).toBe('current');
    // Additional historical choices come from the complete archive inventory.
    expect(meta.navScope?.versions?.slice(0, 2)).toEqual([
      { id: 'current', label: 'v2.3.0', path: '.' },
      {
        id: '2.2.4',
        label: 'v2.2.4',
        path: '2.2.4',
        href: 'https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/javascript/toc-configuration/configuration',
      },
    ]);
    expect(meta.pages).toEqual([
      'configuration',
      'token',
      'channel',
      'topic',
      'message',
      'presence',
      'storage',
      'lock',
      'enumv',
    ]);
    if (!meta.pages) throw new Error('Web API pages are required.');
    const tree: Root = {
      name: 'Docs',
      children: [
        {
          type: 'folder',
          name: 'API Reference',
          index: {
            type: 'page',
            name: 'API Reference',
            url: '/zh-CN/api-reference',
          },
          children: [
            {
              $id: 'rtm-web',
              type: 'folder',
              name: 'Web',
              children: meta.pages.map((name) => ({
                type: 'page',
                name,
                url: `/zh-CN/api-reference/rtm/web/${name}`,
              })),
            },
          ],
        },
      ],
    };
    for (const name of meta.pages) {
      const nav = resolveDocsNavScope({
        root: tree,
        activePath: `/zh-CN/api-reference/rtm/web/${name}`,
        tab: 'api-reference',
        getNodeMeta: (node) => (node.$id === 'rtm-web' ? meta : undefined),
      });
      expect(nav?.activeVersion?.id).toBe('current');
      expect(nav?.header.versionSwitcher?.versions.slice(0, 2)).toEqual([
        {
          id: 'current',
          label: 'v2.3.0',
          href: '/zh-CN/api-reference/rtm/web/configuration',
        },
        {
          id: '2.2.4',
          label: 'v2.2.4',
          href: 'https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/javascript/toc-configuration/configuration',
        },
      ]);
    }
  });

  const configuration = () => [
    read(`${api}web/configuration.mdx`),
    platform(read(`${api}toc-configuration/configuration.mdx`), 'javascript'),
  ];

  it.each([0, 1])(
    'updates configuration consumer %i, including Slot and interval contract',
    (index) => {
      const text = configuration()[index];
      const proxy = between(
        text,
        '<Slot for="configuration-javascript-html-0-6-4">',
        '</Slot>',
      );
      expect(proxy).toContain('不再自动回退到 Cloud Proxy');
      expect(proxy).toMatch(/初始化.*显式.*`true`/);
      const events = between(text, '## 事件监听', '## login');
      expect(events).toContain('7 种事件通知类型');
      expect(events).not.toMatch(
        /id="status"|addEventListener\("status"|removeEventListener\("status"/,
      );
      linkListeners(events, 1);
      expect(events).toContain('interval?.totalOccupancy');
      expect(events).toContain('`IntervalDetail | null`');
      expect(events).toMatch(/仅当.*`INTERVAL`.*有值/);
      const detail = between(
        events,
        '`IntervalDetail` 数据类型包含以下属性：',
        '### 删除监听',
      );
      for (const field of [
        'join',
        'leave',
        'timeout',
        'userStateList',
        'totalOccupancy',
      ])
        expect(detail).toMatch(new RegExp(`\\|\\s*\`${field}\`\\s*\\|`));
      expect(detail).toContain('最多同步 512 名用户明细');
      expect(detail).toContain('短暂延迟');
      expect(events).toContain(
        'rtm.removeEventListener("linkState", linkStateHandler)',
      );
    },
  );

  it.each([0, 1])(
    'updates subscription semantics in channel consumer %i',
    (index) => {
      const text =
        index === 0
          ? read(`${api}web/channel.mdx`)
          : platform(read(`${api}toc-channel/channel.mdx`), 'javascript');
      const subscribe = between(text, '## subscribe\n', '## unsubscribe\n');
      for (const state of ['CONNECTING', 'DISCONNECTED', 'SUSPENDED'])
        expect(subscribe).toContain(`\`${state}\``);
      expect(subscribe).toContain('缓存订阅请求');
      expect(subscribe).toContain('Presence 加入可能仍在异步执行');
      const unsubscribe = between(text, '## unsubscribe\n', '## join\n');
      expect(unsubscribe).toContain('RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED');
      expect(unsubscribe).toContain('-11040');
      expect(unsubscribe).toContain('随后 SDK 完成取消订阅');
      expect(unsubscribe).toContain('迟到消息不会再透传');
    },
  );

  it('removes old connection enums while preserving legacy fragments', () => {
    const text = read(`${api}web/enumv.mdx`);
    for (const id of [
      'connectionreason',
      'connectionstate',
      'linkstate',
      'linkstatechangereason',
    ])
      expect(text.split(`<a id="${id}"></a>`)).toHaveLength(2);
    expect(text).not.toMatch(
      /（已废弃）SDK 连接|`RECONNECTING`|`REJECTED_BY_SERVER`/,
    );
  });

  it('deletes only the obsolete third FAQ workaround', () => {
    const text = read('reference/faq/integration/rtm2_integration_issue.mdx');
    expect([...text.matchAll(/^## /gm)]).toHaveLength(2);
    expect(text).not.toMatch(
      /waitPresenceReady|wait-presence-|立即调用 Presence 相关方法会报错/,
    );
  });

  it('updates all four expanded JavaScript SDK installation consumers', () => {
    const texts = [
      ...configuration(),
      platform(read(`${rtm}get-started/quick-start.mdx`), 'web'),
      read(`${rtm}build/rtm-initialization/application-setup.mdx`),
    ];
    for (const text of texts) {
      expect(text).toContain(
        'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.3.0.zip',
      );
      expect(text).toContain('如 2.3.0');
      expect(text).not.toContain('Agora_RTM_JavaScript_SDK_for_Web_v2.2.4.zip');
    }
  });

  it('replaces both Web quick-start examples and the operation summary', () => {
    const text = platform(read(`${rtm}get-started/quick-start.mdx`), 'web');
    linkListeners(text, 2);
    expect(text).toContain(
      '添加 `message`、`presence` 和 `linkState` 事件监听函数',
    );
  });

  it('uses the complete link event in the JavaScript listener example', () => {
    const text = platform(
      read(`${rtm}build/messaging/add-event-listener.mdx`),
      'web',
    );
    const code = text.match(/```javascript[^\n]*\n([\s\S]*?)\n```/)?.[1];
    expect(code).toBeDefined();
    linkListeners(code as string, 1);
  });

  it('updates both Web token examples without touching the mini-program branch', () => {
    linkListeners(
      platform(
        read(
          `${rtm}build/authentication-and-connection/user-authentication.mdx`,
        ),
        'web',
      ),
      2,
    );
  });

  it('limits the three new message-channel semantics to Web', () => {
    const text = platform(
      read(`${rtm}build/channels-and-topics/message-channel.mdx`),
      'web',
    );
    expect(text).toContain('`CONNECTING`、`DISCONNECTED` 或 `SUSPENDED`');
    expect(text).toContain('Presence 加入可能仍在异步执行');
    expect(text).toContain('RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED');
    expect(text).toContain('迟到消息不会再透传');
  });

  it('documents automatic post-login Web Presence queries with failure conditions', () => {
    const text = platform(
      read(`${rtm}build/state-and-attributes/presence-basic.mdx`),
      'web',
    );
    for (const api of ['whoNow', 'whereNow', 'getState'])
      expect(text).toContain(`\`${api}\``);
    expect(text).toContain(
      '无需增加固定延迟、临时订阅频道或等待 Presence 事件',
    );
    expect(text).toContain('登出、释放实例、连接中断');
    expect(text).toContain('请求会返回失败');
  });

  it('adds Web large-channel optimization on top of Announce/Interval, not instead of it', () => {
    const source = read(`${rtm}build/state-and-attributes/presence-events.mdx`);
    const text = platform(source, 'web');
    expect(text).toMatch(/8(?: 至 |,)128/);
    for (const phrase of [
      'Announce',
      'Interval',
      '现有事件通知模式基础上增加',
      '默认阈值为 512',
      '最多包含 512 名成员',
      '自动恢复',
      'interval.totalOccupancy',
      '短暂延迟',
    ])
      expect(text).toContain(phrase);
  });

  it('documents remote Web state readiness without copying the native extra 512 clause', () => {
    const text = platform(
      read(`${rtm}build/state-and-attributes/temporary-user-state.mdx`),
      'web',
    );
    expect(text).toContain('自动执行远端用户 `getState` 查询');
    expect(text).toContain('正常的异步失败结果');
    expect(text).not.toContain('512');
  });

  it('updates the real Cloud Proxy content and preserves the setup link', () => {
    const text = between(
      read(
        `${rtm}build/network-and-private-deployment/network-configuration.mdx`,
      ),
      '## Cloud Proxy 设置',
      '## Proxy 设置',
    );
    expect(text).toContain('不再自动回退到 Cloud Proxy');
    expect(text).toContain('显式将 `cloudProxy` 设置为 `true`');
    expect(text).toContain('向终端用户提供开关');
    expect(
      read(`${rtm}build/rtm-initialization/application-setup.mdx`),
    ).toContain('network-configuration#cloud-proxy-设置');
  });

  it('adds both new errors in the Web error table rather than another platform', () => {
    const text = platform(read(`${rtm}build/troubleshooting.mdx`), 'web');
    expect(text).toMatch(
      /\|\s*`-10027`\s*\|\s*`RTM_ERROR_DUPLICATE_USER_ID`\s*\|/,
    );
    expect(text).toContain('请复用已有实例，或释放旧实例后再创建新实例');
    expect(text).toMatch(
      /\|\s*`-11040`\s*\|\s*`RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED`\s*\|/,
    );
    expect(text).toContain('随后完成取消订阅');
  });

  it('adds the JavaScript sunset row without changing the existing release date', () => {
    const text = read(`${rtm}reference/sunset-policy.mdx`);
    const js = between(
      text,
      '以下是 RTM JavaScript SDK 已发布版本的退休日期表：',
      '以下是 RTM',
    );
    expect(js).toContain('| v2.3.0');
    expect(js).toContain('2026 年 8 月 10 日');
    expect(js).toContain('2029 年 8 月 11 日，或 v2.5.x');
    expect(
      platform(read(`${rtm}reference/release-notes.mdx`), 'web'),
    ).toContain('2026 年 8 月 18 日');
  });
});
