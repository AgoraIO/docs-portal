import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RtcSdkDownloads } from '@/components/docs-overview/RtcSdkDownloads';
import { zhCNSdkDownloadPlatforms } from '@/components/docs-overview/sdk-downloads-data.zh-cn';
import legacy from '@/test/fixtures/rtc-download-resources.json';

const read = (platform: string) =>
  readFileSync(
    `content/docs/zh-CN/realtime-media/rtc/reference/downloads/${platform}.mdx`,
    'utf8',
  );
const compact = (text: string) => text.replace(/\s+/g, '');
const sdkPlatforms: Record<string, string> = {
  react: 'react-js',
  'unreal-cpp': 'unreal-engine',
  'unreal-blueprint': 'unreal-engine',
};

// The original fixture remains frozen. Only the two mobile current releases
// advance to 4.7.1; their 4.7.0 destinations and metadata remain in the catalog.
const release471Md5: Record<string, Record<string, string>> = {
  android: {
    FULL: 'c3b3cbfae32ca1fe12d464e2577843b3',
    LITE: 'f5a7e98abe8b10d3b013c8ead1dec286',
    VOICE: 'ad3318830f59fe7343a0e4675d9e5853',
  },
  ios: {
    FULL: 'e5e4c3f036426e251c2b3ed4feaaea1c',
    LITE: '9506b191ee9592a75bc8645577aa68ac',
    VOICE: 'afcb69331a575f86eb212494b13ca985',
  },
};

describe('RTC resource cards preserve legacy content and approved release updates', () => {
  it.each(Object.entries(legacy.platforms))(
    '%s preserves SDK card wording and destinations',
    (platform, expected) => {
      for (const product of ['video', 'voice'] as const) {
        for (const variant of ['standard', 'uniontech'] as const) {
          const cards = expected.sdk.filter(
            (card) => card.product === product && card.variant === variant,
          );
          if (!cards.length) continue;
          render(
            <RtcSdkDownloads
              platform={sdkPlatforms[platform] ?? platform}
              product={product}
              {...(platform === 'electron' ? { variant } : {})}
            />,
          );
          const actual = screen.getAllByRole('article');
          expect(actual).toHaveLength(cards.length);
          actual.forEach((article, index) => {
            const original = cards[index];
            let card = original;
            if (platform in release471Md5) {
              const historical = zhCNSdkDownloadPlatforms
                .find((entry) => entry.id === platform)
                ?.core.flatMap((sdk) => sdk.versions)
                .find((version) => version.downloadLink === original.href);
              expect(historical).toBeDefined();
              if (!historical?.md5) throw new Error('Missing historical MD5');
              expect(original.body).toContain(historical?.md5);
              expect(original.footer).toContain(historical?.releaseDate);
              const variant = original.href.match(
                /_(FULL|LITE|VOICE)\.zip$/,
              )?.[1];
              expect(variant).toBeDefined();
              if (!variant) throw new Error('Unknown Native SDK variant');
              card = {
                ...original,
                body: original.body
                  .replace('v4.7.0', 'v4.7.1')
                  .replace(historical.md5, release471Md5[platform][variant])
                  .replace(
                    /((?:armeabi-v7a|arm64-v8a|x86_64|x86)：)[\d.]+/g,
                    '$1待补充',
                  )
                  .replace(/[\d.]+ MB/g, '待补充'),
                footer: '发布日期：2026 年 11 月 18 日',
                href: original.href.replace('_v4.7.0_', '_v4.7.1_'),
              };
            }
            expect(compact(article.textContent ?? '')).toBe(
              compact(card.title + card.body + card.footer),
            );
            expect(article.querySelector('a')).toHaveAttribute(
              'href',
              card.href,
            );
          });
          cleanup();
        }
      }
    },
  );

  it.each(Object.entries(legacy.platforms))(
    '%s preserves repository names, host icons and links',
    (platform, expected) => {
      const page = read(platform);
      const cards = [
        ...page.matchAll(
          /<Card title=\{<RepositoryCardTitle provider="(gitee|github)">([^<]+)<\/RepositoryCardTitle>\} href="([^"]+)" \/>/g,
        ),
      ].map((match) => ({
        provider: match[1],
        title: match[2],
        href: match[3],
      }));
      expect(cards).toEqual(expected.repositories);
    },
  );

  it.each(Object.entries(legacy.platforms))(
    '%s preserves Demo artwork and descriptions',
    (platform, expected) => {
      const page = read(platform);
      expect((page.match(/<DownloadResourceCards/g) ?? []).length).toBe(
        expected.demos.length,
      );
      for (const demo of expected.demos) {
        for (const value of Object.values(demo)) expect(page).toContain(value);
      }
      if (platform === 'react')
        expect(page).toContain("label: 'CodeSandbox 体验'");
    },
  );

  it('keeps Electron SDK and repository alternatives in two synchronized tab sets', () => {
    const page = read('electron');
    expect(
      page.match(
        /<Tabs defaultValue="electron" groupId="rtc-electron-edition" persist>/g,
      ),
    ).toHaveLength(2);
    const panels = [
      ...page.matchAll(
        /<TabsContent value="(electron|tongxin)">([\s\S]*?)<\/TabsContent>/g,
      ),
    ];
    expect(panels.map((panel) => panel[1])).toEqual([
      'electron',
      'tongxin',
      'electron',
      'tongxin',
    ]);
    expect(panels[0][2]).toContain('variant="standard"');
    expect(panels[1][2]).toContain('variant="uniontech"');
    expect(panels[1][2]).not.toContain('SDK 名称');
    expect(panels[2][2]).not.toContain('v4.5.40-rc.2/example');
    expect(panels[3][2].match(/v4.5.40-rc.2\/example/g)).toHaveLength(2);
  });
});
