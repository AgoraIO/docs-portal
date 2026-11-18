import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RtcSdkDownloads } from '@/components/docs-overview/RtcSdkDownloads';
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

describe('RTC resource cards match the frozen legacy source', () => {
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
            const card = cards[index];
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
