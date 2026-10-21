import { readFileSync } from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import { extractMdxAnchors } from '../../scripts/lib/api-center/local-fragment-index.mjs';
import { resolvePlatformContext } from './platforms/context';
import {
  buildPlatformMarkdownText,
  extractStructuredPlatformKeys,
} from './platforms/processed-text';
import type { PlatformKey } from './platforms/registry';
import { remarkPlatformContent } from './platforms/remark-platform-content';

const docsRoot = path.resolve('content/docs/zh-CN');
const processor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkPlatformContent)
  .use(remarkStringify);
const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
const cache = new Map<string, string>();

function readDoc(relative: string) {
  return readFileSync(path.join(docsRoot, relative), 'utf8');
}

function processedDoc(relative: string) {
  if (!cache.has(relative)) {
    const body = readDoc(relative).replace(/^---\n[\s\S]*?\n---\n/, '');
    cache.set(relative, String(processor.processSync(body)));
  }
  return cache.get(relative) as string;
}

function platformDoc(relative: string, platform: PlatformKey) {
  return buildPlatformMarkdownText(processedDoc(relative), platform);
}

function codeBlocks(markdown: string) {
  const codes: string[] = [];
  visit(parser.parse(markdown), 'code', (node) => {
    codes.push(node.value);
  });
  return codes;
}

describe('Chinese documentation platform applicability', () => {
  it.each([
    [
      'realtime-media/rtc/build/optimize-and-operate/optimization-mode.mdx',
      'web',
    ],
    ['realtime-media/rtc/get-started/quick-start-expo.mdx', 'react-native'],
    ['realtime-media/rtc/reference/billing.mdx', 'mini-program'],
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
      ).toEqual([platform]);
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
    expect(platformDoc(file, 'mini-program')).toContain(
      'shengwang-rtm-miniapp',
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
      expect(mini).toContain('不支持 Stream Channel 和 Topic');
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
    const body = readDoc('solutions/game-voice/reference/api.mdx').split(
      '### Unreal C++',
    )[1];
    expect(body).toBeDefined();
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

  it('restores Electron variants while preserving the original example scope', () => {
    for (const file of [
      'realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx',
      'realtime-media/rtc/reference/after-migrate.mdx',
    ]) {
      expect(extractStructuredPlatformKeys(processedDoc(file))).toContain(
        'electron',
      );
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
    expect(doc).toContain('不属于当前可集成的 SDK 平台范围');
    expect(doc).toContain('/rtsa/reference/sunset');
  });
});
