import { readFileSync } from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import { extractMdxAnchors } from '../../scripts/lib/api-center/local-fragment-index.mjs';
import {
  processPlatformMarkdown,
  selectPlatformMarkdown,
} from '../test/platform-markdown';
import { resolvePlatformContext } from './platforms/context';
import { extractStructuredPlatformKeys } from './platforms/processed-text';
import type { PlatformKey } from './platforms/registry';

const docsRoot = path.resolve('content/docs/zh-CN');
const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

function readDoc(relative: string) {
  return readFileSync(path.join(docsRoot, relative), 'utf8');
}

function processedDoc(relative: string) {
  return processPlatformMarkdown(readDoc(relative));
}

function platformDoc(relative: string, platform: PlatformKey) {
  return selectPlatformMarkdown(readDoc(relative), platform);
}

function codeBlocks(markdown: string) {
  const codes: string[] = [];
  visit(parser.parse(markdown), 'code', (node) => {
    codes.push(node.value);
  });
  return codes;
}

describe('Chinese documentation platform applicability', () => {
  it('resolves Unity symbols while retaining the legacy login sentence', () => {
    const body = platformDoc(
      'realtime-media/rtm/build/authentication-and-connection/login.mdx',
      'unity',
    );
    expect(body).toContain('OnConnectionStateChanged');
    expect(body).toContain('你可以通过 `LoginAsync` 的返回值或监听');
    expect(body).toContain(
      '/zh-CN/api-reference/rtm/unity/configuration#OnConnectionStateChanged',
    );
    expect(body).not.toContain('/api-ref/rtm2/');
    expect(body).toContain('`CONNECTING`');
    expect(body).toContain('`CONNECTED`');
    expect(body).not.toMatch(/(?<!`)``(?!`)/);
    expect(body).not.toContain('linkState');
  });

  it.each<[string, string | string[]]>([
    [
      'realtime-media/rtc/build/optimize-and-operate/optimization-mode.mdx',
      'web',
    ],
    ['realtime-media/rtc/get-started/quick-start-expo.mdx', 'react-native'],
    ['realtime-media/rtc/reference/billing.mdx', 'mini-program'],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/custom-event.mdx',
      'web',
    ],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/record-and-replay.mdx',
      'web',
    ],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/manage-room-phase.mdx',
      'web',
    ],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/manage-room-status.mdx',
      'web',
    ],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/manage-scene.mdx',
      'web',
    ],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/present-files-wb.mdx',
      'web',
    ],
    [
      'realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/use-tools-wb.mdx',
      ['web', 'harmonyos'],
    ],
  ])(
    'resolves the page badge for %s from its documented SDK scope',
    (file, platform) => {
      const raw = readDoc(file);
      const metadata = loadYaml(
        raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '',
      ) as {
        titlePlatforms: string[];
      };
      expect(
        resolvePlatformContext({
          explicitTitlePlatforms: metadata.titlePlatforms,
        }).titlePlatforms,
      ).toEqual(typeof platform === 'string' ? [platform] : platform);
    },
  );

  it('keeps Message Channel callbacks and examples in their SDK scope', () => {
    const file =
      'realtime-media/rtm/build/channels-and-topics/message-channel.mdx';
    const android = platformDoc(file, 'android');
    const ios = platformDoc(file, 'ios');
    const web = platformDoc(file, 'web');
    const unity = platformDoc(file, 'unity');
    expect(android).toContain('onMessageEvent');
    expect(android).toContain('mRtmClient.subscribe');
    expect(android).not.toContain('didReceiveMessageEvent');
    expect(ios).toContain('didReceiveMessageEvent');
    expect(ios).not.toContain('mRtmClient.subscribe');
    expect(web).toContain('rtmClient.subscribe');
    expect(web).not.toContain('SubscribeAsync');
    expect(unity).toContain('SubscribeAsync');
    expect(unity).not.toContain('mRtmClient.subscribe');
  });

  it('keeps the Web 2.3 subscription behavior out of the mini program', () => {
    const file =
      'realtime-media/rtm/build/channels-and-topics/message-channel.mdx';
    expect(platformDoc(file, 'web')).toContain(
      'RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED',
    );
    expect(platformDoc(file, 'mini-program')).not.toContain(
      'RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED',
    );
  });

  it('separates Presence configuration fields for iOS and Android', () => {
    const file =
      'realtime-media/rtm/build/state-and-attributes/temporary-user-state.mdx';
    const android = platformDoc(file, 'android');
    const ios = platformDoc(file, 'ios');
    expect(android).toContain('withPresence = true');
    expect(android).not.toContain(
      'features = AgoraRtmJoinChannelFeaturePresence',
    );
    expect(ios).toContain('features = AgoraRtmJoinChannelFeaturePresence');
    expect(ios).not.toContain('withPresence = true');
    expect(platformDoc(file, 'harmonyos')).toContain('withPresence = true');
  });

  it('points HarmonyOS Presence readers to the correct event definition', () => {
    const body = platformDoc(
      'realtime-media/rtm/build/state-and-attributes/presence-events.mdx',
      'harmonyos',
    );
    expect(body).toContain('/rtm/harmonyos/configuration#presenceevent');
    expect(body).not.toContain('/rtm/unity/');
    expect(body).not.toContain('除此之外，。');
  });

  it.each([
    'realtime-media/rtm/build/channels-and-topics/stream-channel.mdx',
    'realtime-media/rtm/build/channels-and-topics/topics/usage.mdx',
  ])(
    'does not expose unsupported Stream/Topic examples to mini programs in %s',
    (file) => {
      const mini = platformDoc(file, 'mini-program');
      expect(mini).toContain('小程序（不适用）');
      expect(codeBlocks(mini)).toHaveLength(0);
      expect(codeBlocks(platformDoc(file, 'web')).length).toBeGreaterThan(0);
    },
  );

  it('shows one SDK set of structured payload examples at a time', () => {
    const file =
      'realtime-media/rtm/build/message-design-and-history/constructed.mdx';
    for (const platform of ['web', 'mini-program', 'android'] as const) {
      expect(codeBlocks(platformDoc(file, platform))).toHaveLength(11);
    }
    expect(platformDoc(file, 'android')).toContain('mRtmClient.publish');
    expect(platformDoc(file, 'web')).not.toContain('mRtmClient.publish');
  });

  it('keeps each showroom guide variant linked to the matching native API', () => {
    const file = 'solutions/showroom/build/hq-video.mdx';
    const android = platformDoc(file, 'android');
    const ios = platformDoc(file, 'ios');
    expect(android).toContain('/rtc/android/video/video-basic');
    expect(android).not.toContain('/rtc/ios/');
    expect(ios).toContain('/rtc/ios/video/video-basic');
    expect(ios).toContain('/rtc/ios/network');
    expect(ios).not.toContain('/rtc/android/');
    expect(ios).toContain('v4.1.x');
  });

  it('links the Unreal API table to existing Unreal pages and fragments', () => {
    const body = platformDoc(
      'solutions/game-voice/reference/api.mdx',
      'unreal',
    );
    expect(body).not.toContain('/rtc/android/');
    const links = [
      ...body.matchAll(
        /\]\((\/zh-CN\/api-reference\/rtc\/unreal-cpp\/[^)]+)\)/g,
      ),
    ];
    expect(links).toHaveLength(8);
    for (const [, href] of links) {
      const url = new URL(href, 'https://docs.example');
      const file = url.pathname.replace(
        '/zh-CN/api-reference/rtc/unreal-cpp/',
        '',
      );
      const content = readDoc(
        `api-reference/rtc/unreal-cpp/(current)/${file}.mdx`,
      );
      expect(extractMdxAnchors(content).has(url.hash.slice(1))).toBe(true);
    }
  });

  it.each([
    [
      'solutions/showroom/reference/api.mdx',
      'android',
      '/rtc/android/',
      'ios',
      '/rtc/ios/',
    ],
    [
      'solutions/chatroom/sdk/reference/api.mdx',
      'android',
      '/rtc/android/',
      'ios',
      '/rtc/ios/',
    ],
    [
      'solutions/chatroom/sdk/reference/rtc-api.mdx',
      'android',
      '/rtc/android/',
      'ios',
      '/rtc/ios/',
    ],
    [
      'solutions/chatroom/sdk/reference/im-api.mdx',
      'android',
      '/im_java/',
      'ios',
      '/im_oc/',
    ],
    [
      'solutions/game-voice/reference/api.mdx',
      'unity',
      '/rtc/unity/',
      'unreal',
      '/rtc/unreal-cpp/',
    ],
  ] as const)(
    'shows only the selected SDK API set in %s',
    (file, first, firstHref, second, secondHref) => {
      const firstDoc = platformDoc(file, first);
      const secondDoc = platformDoc(file, second);
      expect(firstDoc).toContain(firstHref);
      expect(firstDoc).not.toContain(secondHref);
      expect(secondDoc).toContain(secondHref);
      expect(secondDoc).not.toContain(firstHref);
      expect(extractStructuredPlatformKeys(processedDoc(file))).toEqual([
        first,
        second,
      ]);
    },
  );

  it('keeps the C++ and Java recording migration APIs in separate panels', () => {
    const file =
      'realtime-media/local-server-recording/reference/migration-guide.mdx';
    const cpp = platformDoc(file, 'cpp');
    const java = platformDoc(file, 'java');
    expect(cpp).toContain('createAgoraRecordingEngine');
    expect(cpp).not.toContain('RecordingSDK');
    expect(java).toContain('RecordingSDK');
    expect(java).not.toContain('createAgoraRecordingEngine');
    expect(extractStructuredPlatformKeys(processedDoc(file))).toEqual([
      'cpp',
      'java',
    ]);
  });

  it('restores Electron variants while preserving the original example scope', () => {
    for (const file of [
      'realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx',
      'realtime-media/rtc/reference/after-migrate.mdx',
    ]) {
      expect(extractStructuredPlatformKeys(processedDoc(file))).toEqual([
        'android',
        'ios',
        'macos',
        'windows',
        'electron',
        'unity',
        'flutter',
        'react-native',
      ]);
      expect(platformDoc(file, 'electron')).not.toBe('');
    }
    expect(
      platformDoc('realtime-media/rtc/reference/after-migrate.mdx', 'electron'),
    ).toContain('API 名称均以 C++ 为例');
  });

  it('keeps the historical Java compatibility data visibly retired', () => {
    const doc = readDoc(
      'realtime-media/rtsa/reference/supported-platforms.mdx',
    );
    expect(doc).toContain('已下架的 Java SDK（历史兼容性）');
    expect(doc).toContain('RTSA Java SDK 已完成下架。历史下架时间点如下：');
    expect(doc).toContain('2025 年 4 月 30 日（不含）');
    expect(doc).toContain('/rtsa/reference/sunset');
  });
});
