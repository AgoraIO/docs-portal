import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductSdkDownloads } from '../components/docs-overview/ProductSdkDownloads';
import { getSdkDownloadProductCatalogId } from '../components/docs-overview/sdk-download-navigation';
import { zhCNSdkDownloadPlatforms } from '../components/docs-overview/sdk-downloads-data.zh-cn';
import { deriveInstallCommand } from '../components/docs-overview/sdk-install-command';
import { isKnownPlatform } from './platforms/registry';

const docsRoot = 'content/docs/zh-CN/realtime-media/rtm';
const quickStartHref =
  '/zh-CN/realtime-media/rtm/get-started/quick-start?platform=mini-program';
const npmHref = 'https://www.npmjs.com/package/shengwang-rtm-miniapp';

function readDoc(path: string) {
  return readFileSync(
    resolve(process.cwd(), `${docsRoot}/${path}.mdx`),
    'utf8',
  );
}

function platformBodies(content: string, platform: string) {
  return [
    ...content.matchAll(
      /<PlatformStructured platform="([^"]+)">([\s\S]*?)<\/PlatformStructured>/g,
    ),
  ]
    .filter((match) => match[1] === platform)
    .map((match) => match[2]);
}

function platformBody(content: string, platform: string) {
  const bodies = platformBodies(content, platform);
  expect(bodies).toHaveLength(1);
  return bodies[0] ?? '';
}

const sendMessage = readDoc('build/messaging/send-message');
const userMessages =
  sendMessage
    .split('## User Channel 中发送消息')[1]
    ?.split('## 在流频道中发送消息')[0] ?? '';
const payload = sendMessage.split('## 消息负载包体积限制')[1] ?? '';

describe('RTM upstream PR #2069 parity', () => {
  it('links the Mini Program homepage card to a real supported quickstart platform', () => {
    const homepage = readDoc('index');
    const card = [...homepage.matchAll(/<a\b[\s\S]*?<\/a>/g)].find((match) =>
      match[0].includes(`href="${quickStartHref}"`),
    );
    expect(card?.[0] ?? '').toContain('小程序（Beta）');
    expect(homepage).toContain(`[快速开始](${quickStartHref})`);
    expect(isKnownPlatform('mini-program')).toBe(true);
    expect(
      existsSync(
        resolve(process.cwd(), `${docsRoot}/get-started/quick-start.mdx`),
      ),
    ).toBe(true);
    expect(
      platformBody(readDoc('get-started/quick-start'), 'mini-program'),
    ).toContain('npm install shengwang-rtm-miniapp');
  });

  it('shows the source package, version and release date in the homepage SDK card', () => {
    const entries =
      readDoc('index').split('**更多入口**')[1]?.split('</Cards>')[0] ?? '';
    const card =
      [...entries.matchAll(/<Card\b[\s\S]*?\/>/g)]
        .map((match) => match[0])
        .find((value) => value.includes('title="小程序 SDK（Beta）"')) ?? '';
    expect(card).toContain('title="小程序 SDK（Beta）"');
    expect(card).toContain(`href="${npmHref}"`);
    expect(card).toContain(
      'description="包名：shengwang-rtm-miniapp；最新版本：2.3.0-beta.0；发布日期：2026 年 7 月 16 日。"',
    );
    expect(entries.indexOf('title="下载 SDK"')).toBeLessThan(
      entries.indexOf(card),
    );
  });

  it('adds only source-backed RTM npm metadata to the existing Mini Program catalog', () => {
    const platform = zhCNSdkDownloadPlatforms.find(
      (item) => item.id === 'mini-program',
    );
    const product = platform?.core.find(
      (item) => getSdkDownloadProductCatalogId(item) === 'signaling',
    );
    expect(product?.versions ?? []).toHaveLength(1);
    const version = product?.versions[0];
    expect(version).toMatchObject({
      label: '版本 2.3.0-beta.0（最新）',
      packageName: 'shengwang-rtm-miniapp',
      packageManager: npmHref,
      releaseDate: '2026 年 7 月 16 日',
    });
    expect(version?.downloadLink).toBeUndefined();
    expect(version?.md5).toBeUndefined();
    expect(version?.packageSize).toBeUndefined();
    expect(version && deriveInstallCommand(version)).toEqual({
      tool: 'npm',
      command: 'npm i shengwang-rtm-miniapp',
    });
  });

  it('renders the npm release through the real ProductSdkDownloads consumer', () => {
    const markup = renderToStaticMarkup(
      createElement(ProductSdkDownloads, {
        platform: 'mini-program',
        product: 'signaling',
      }),
    );
    expect(markup).toContain(npmHref);
    expect(markup).toContain('shengwang-rtm-miniapp');
    expect(markup).toContain('2.3.0-beta.0');
    expect(markup).toContain('2026 年 7 月 16 日');
    expect(markup).not.toContain('MD5');
    expect(markup).not.toContain('.zip');
  });

  it.each(['web', 'mini-program'])(
    'publishes both %s USER examples to a user ID',
    (platform) => {
      const body = platformBody(userMessages, platform);
      expect(body.match(/const userId = "Tony";/g) ?? []).toHaveLength(2);
      expect(
        body.match(/rtm\.publish\(userId, payload, options\)/g) ?? [],
      ).toHaveLength(2);
      expect(body).not.toContain('const channelName = "chat_room"');
      expect(body).toContain('channelType: "USER"');
    },
  );

  it('isolates the Mini Program 32 KB payload limit and publish status', () => {
    const body = platformBody(payload, 'mini-program');
    expect(body).toContain('Message 类型频道');
    expect(body).toContain('限制为 32 KB');
    expect(body).toContain('errorCode = -11010;');
    expect(body).toContain('operation = "publish";');
    expect(body).not.toContain('Stream');
    expect(body).not.toContain('1 KB');
    expect(body).not.toContain('PublishTopicMessageOperation');
  });

  it.each([
    ['unity', 'Operation = "PublishTopicMessageOperation";'],
    ['web', 'operation = "PublishTopicMessageOperation";'],
    ['android', 'operation = "publishTopicMessage";'],
    [
      'swift',
      'errorInfo.errorCode = rrorCode = .channelMessageLengthExceedLimitation',
    ],
    ['ios', 'AgoraRtmErrorChannelMessageLengthExceedLimitation;'],
    ['flutter', 'reason = "rtmErrorChannelMessageLengthExceedLimitation";'],
    [
      'harmonyos',
      "import { RtmError, RtmErrorCode } from '@shengwang/rtm-full';",
    ],
  ])(
    'preserves the existing %s payload example and limits',
    (platform, example) => {
      const body = platformBody(payload, platform);
      expect(body).toContain('32 KB');
      expect(body).toContain('1 KB');
      expect(body).toContain(example);
    },
  );

  it('does not invent a C++ payload example', () => {
    const body = platformBody(payload, 'cpp');
    expect(body).toContain('32 KB');
    expect(body).toContain('1 KB');
    expect(body).toContain(
      '消息负载包体积包含消息负载自身加上 `customType` 字段大小。',
    );
    expect(body).not.toContain(
      '当消息负载包体积超出限制时，你会收到以下返回值：',
    );
    expect(body).not.toContain('```');
  });

  it.each(['web', 'mini-program'])(
    'restores the %s baseline Presence modes with platform-scoped limits',
    (platform) => {
      const source = readDoc('build/state-and-attributes/presence-events');
      expect(
        source.match(
          new RegExp(`<PlatformStructured platform="${platform}">`, 'g'),
        ),
      ).toHaveLength(1);
      const body = platformBody(source, platform);
      expect(body).toContain('实时通知模式（Announce）');
      expect(body).toContain('定时通知模式（Interval）');
      expect(body).toMatch(/(?:\[8,128\]|8 至 128)/);
      if (platform === 'mini-program') {
        expect(body).not.toContain('512');
        expect(body).not.toContain('从 v2.3.0');
      }
    },
  );

  it('uses the source RTMConfig type in the Mini Program connection guide', () => {
    const body = platformBody(
      readDoc('build/authentication-and-connection/link-basic'),
      'mini-program',
    );
    expect(body.match(/`RTMConfig`/g) ?? []).toHaveLength(2);
    expect(body).not.toContain('`RtmConfig`');
  });

  it.each([
    ['-11006', 'RTM_ERROR_CHANNEL_IN_ERROR_STATE'],
    ['-15003', 'RTM_ERROR_HISTORY_OPERATION_TIMEOUT'],
  ])(
    'preserves the source Mini Program error symbol for %s',
    (code, symbol) => {
      const body = platformBody(
        readDoc('build/troubleshooting'),
        'mini-program',
      );
      expect(body.includes(`| \`${code}\` | \`${symbol}\` |`)).toBe(true);
      expect([...body.matchAll(/^\| `-?\d+` \|/gm)]).toHaveLength(77);
    },
  );

  it.each([
    ['get-started/quick-start', '本 SDK 专为微信小程序运行环境构建'],
    [
      'reference/capabilities-and-compatibility/feature-list',
      '微信小程序 SDK 与 Web SDK API 范围不同',
    ],
    ['reference/release-notes', '该版本为 beta 版本'],
  ])('preserves the source caution in %s', (path, opening) => {
    const body = platformBody(readDoc(path), 'mini-program');
    expect(body.includes(`:::caution[注意]\n${opening}`)).toBe(true);
  });

  it('states the full Mini Program limits scope and retains the existing local note', () => {
    const limits = readDoc('reference/usage-limits-and-errors/api-limits');
    const introduction = limits.split('## 快速导航')[0];
    expect(introduction).toContain('Message Channel 和 User Channel');
    expect(introduction).toContain('Stream Channel 和 Topic');
    expect(introduction).toContain('均不适用');
    expect(limits).toContain(
      '小程序不支持 Stream Channel，因此不适用上表中的 Stream Channel 在线用户数和 Topic 数限制；其他 Message Channel 和锁限制适用。',
    );
  });

  it('keeps the existing RTC Mini Program download untouched', () => {
    const version = zhCNSdkDownloadPlatforms
      .find((item) => item.id === 'mini-program')
      ?.core.find((item) => item.id === 'video-sdk-mini-program')?.versions[0];
    expect(version).toEqual({
      id: '2.6.5-video-sdk-mini-program',
      label: '版本 2.6.5（最新）',
      downloadLink:
        'https://download.agora.io/sdk/release/Agora_Miniapp_SDK_for_WeChat_v2.6.5.zip',
      releaseDate: '2024 年 8 月 21 日',
    });
  });

  it('retains the 13-domain whitelist and source-backed package setup', () => {
    const body = platformBody(
      readDoc('get-started/quick-start'),
      'mini-program',
    );
    const whitelist = body.split('## 附录：微信小程序域名白名单')[1] ?? '';
    const domains = [...whitelist.matchAll(/(?:https|wss):\/\/[^;\s]+/g)].map(
      (match) => match[0],
    );
    expect(domains).toHaveLength(13);
    expect(
      domains.filter((domain) => domain.startsWith('https:')),
    ).toHaveLength(12);
    expect(domains).toContain('wss://miniapp.agoraio.cn');
    expect(body).toContain('npm install agora-rtm-miniapp');
    expect(body).toContain(
      'node ./node_modules/shengwang-rtm-miniapp/scripts/load-wasm.js',
    );
    expect(body).toContain(
      'node ./node_modules/agora-rtm-miniapp/scripts/load-wasm.js',
    );
  });

  it('retains Mini Program capabilities, tested devices and release metadata', () => {
    const features = platformBody(
      readDoc('reference/capabilities-and-compatibility/feature-list'),
      'mini-program',
    );
    expect(features).toContain(
      '向 Message Channel 或 User Channel 发布字符串或二进制消息',
    );
    for (const unsupported of [
      'RTM.createStreamChannel',
      'RTMStreamChannel',
      'Topic 相关 API',
      'RTMConfig.cloudProxy',
      'RTMConfig.privateConfig',
      '私有化部署',
      '私有化配置',
    ]) {
      expect(features).toContain(unsupported);
    }
    const support = platformBody(
      readDoc('reference/capabilities-and-compatibility/platform-support'),
      'mini-program',
    );
    for (const environment of [
      '2.13.0',
      '2.15.0',
      '2.18.1',
      'mi 10',
      'iOS 15.5.3',
      'MacBook Pro 13-inch',
      'Windows 11',
      '华为 mate 70 pro',
    ]) {
      expect(support).toContain(environment);
    }
    const release = platformBody(
      readDoc('reference/release-notes'),
      'mini-program',
    );
    expect(release).toContain(
      '<Accordion title="2.3.0-beta.0 版" id="230-beta0-版" headingLevel={2} value="230-beta0-版">',
    );
    expect(release).toContain('`2026-07-16`');
    expect(release).toContain(npmHref);
  });
});
