import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const platformGuidance = [
  { platform: 'android', renew: 'renewToken', result: 'onRenewTokenResult' },
  {
    platform: 'cpp-all-platforms',
    renew: 'renewToken',
    result: 'onRenewTokenResult',
  },
  { platform: 'csharp-windows', renew: 'RenewToken', result: null },
  { platform: 'electron', renew: 'renewToken', result: 'onRenewTokenResult' },
  { platform: 'flutter', renew: 'renewToken', result: 'onRenewTokenResult' },
  { platform: 'harmonyos', renew: 'renewToken', result: null },
  {
    platform: 'react-native',
    renew: 'renewToken',
    result: 'onRenewTokenResult',
  },
  { platform: 'unity', renew: 'RenewToken', result: 'OnRenewTokenResult' },
  { platform: 'unreal-blueprint', renew: 'RenewToken', result: null },
  { platform: 'unreal-cpp', renew: 'renewToken', result: null },
  {
    platform: 'ios',
    renew: 'renewToken:',
    result: 'rtcEngine\\:renewTokenResult\\:code:',
  },
  {
    platform: 'macos',
    renew: 'renewToken:',
    result: 'rtcEngine\\:renewTokenResult\\:code:',
  },
];

const targets = platformGuidance.flatMap((guidance) => {
  const callbacks = ['ios', 'macos'].includes(guidance.platform)
    ? ['ontokenprivilegewillexpire']
    : ['onrequesttoken', 'ontokenprivilegewillexpire'];
  return callbacks.map((callback) => ({ ...guidance, callback }));
});

function readChannelPage(platform: string) {
  return readFileSync(
    resolve(
      process.cwd(),
      `content/docs/zh-CN/api-reference/rtc/${platform}/(current)/channel.mdx`,
    ),
    'utf8',
  );
}

function callbackDescription(content: string, callback: string) {
  const callbackId = `callback_irtcengineeventhandler_${callback}`;
  const marker = `<a id="${callbackId}__detailed_desc"></a>`;
  expect(
    content.split(marker),
    `${callback} unique detail anchor`,
  ).toHaveLength(2);
  const rest = content.slice(content.indexOf(marker) + marker.length);
  // Keep internal __desc1 / __renew anchors within the detailed description.
  const nextSection = rest.search(
    new RegExp(
      `<a id="${callbackId}__(?:timing|restriction|parameters|return_values)">|\n## `,
    ),
  );
  expect(nextSection, `${callback} next section`).toBeGreaterThan(0);
  return rest.slice(0, nextSection);
}

describe('RTC source PR 2056 token callback guidance', () => {
  it.each(targets)(
    'keeps direct renew and optional rejoin for $platform at $callback',
    ({ platform, callback, renew, result }) => {
      const content = readChannelPage(platform);
      const detail = callbackDescription(content, callback);
      const renewAnchor = 'api_irtcengine_renewtoken';

      expect(detail).toMatch(
        /(?:Token 服务器上|服务端)生成(?:一个)?新的 Token/,
      );
      expect(detail).toContain('根据场景更新 Token');
      const renewLine = detail
        .split('\n')
        .find((line) => line.includes(`[${renew}](`));
      expect(renewLine).toContain('传入新的 Token，无需先离开频道。');
      expect(renewLine).toContain(
        `[${renew}](/zh-CN/api-reference/rtc/${platform}/channel#${renewAnchor})`,
      );
      expect(content).toContain(`<a id="${renewAnchor}"></a>`);

      const rejoinLine = detail
        .split('\n')
        .find((line) =>
          line.includes('如果你的 App 需要离开并重新加入频道，也可以调用'),
        );
      expect(rejoinLine).toMatch(/[Ll]eaveChannel/);
      expect(rejoinLine).toMatch(/[Jj]oinChannel/);
      expect(rejoinLine).toContain('时传入新的 Token。');

      if (result) {
        const resultAnchor =
          'callback_irtcengineeventhandler_onrenewtokenresult';
        expect(renewLine).toContain(
          `[${result}](/zh-CN/api-reference/rtc/${platform}/channel#${resultAnchor})`,
        );
        expect(renewLine).toContain('回调报告更新结果。');
        expect(content).toContain(`<a id="${resultAnchor}"></a>`);
      } else if (
        ['csharp-windows', 'unreal-blueprint', 'unreal-cpp'].includes(platform)
      ) {
        expect(renewLine).not.toMatch(/[Oo]nRenewTokenResult/);
      }
    },
  );
});
