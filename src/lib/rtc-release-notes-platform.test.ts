import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import { loadDocsPagePayload } from './docs-page.server';
import { rtcReleaseNotesAnchorPlatform } from './rtc-release-notes-anchors';
import {
  RTC_RELEASE_NOTES_PATH,
  resolveRtcReleaseNotesLegacyTarget,
} from './rtc-release-notes-compat';

const platforms = [
  'android',
  'ios',
  'macos',
  'web',
  'windows',
  'electron',
  'flutter',
  'react-native',
  'javascript',
  'unity',
  'unreal',
  'blueprint',
] as const;
const sourcePath = 'content/docs/en/realtime-media/rtc/reference/release-notes';

describe('RTC release notes platform split', () => {
  it('resolves every platform page and its Markdown export', async () => {
    const index = await loadDocsPagePayload('en', 'realtime-media', [
      'rtc',
      'reference',
      'release-notes',
    ]);
    expect(index).toMatchObject({
      activePath: RTC_RELEASE_NOTES_PATH,
      body: { kind: 'platform-group' },
      markdownUrl: `${RTC_RELEASE_NOTES_PATH}.md`,
    });
    const indexMarkdown = await getPublicDocsMarkdownResponse({
      locale: 'en',
      tab: 'realtime-media',
      slugSegments: ['rtc', 'reference', 'release-notes.md'],
    });
    expect(indexMarkdown?.status).toBe(200);
    expect(await indexMarkdown?.text()).toContain('Notifications');

    for (const platform of platforms) {
      const payload = await loadDocsPagePayload('en', 'realtime-media', [
        'rtc',
        'reference',
        'release-notes',
        platform,
      ]);
      expect(payload).toMatchObject({
        activePath: RTC_RELEASE_NOTES_PATH,
        body: {
          kind: 'platform-group',
          platformTabs: { initialPlatform: platform },
        },
        markdownUrl: `${RTC_RELEASE_NOTES_PATH}/${platform}.md`,
      });
      const response = await getPublicDocsMarkdownResponse({
        locale: 'en',
        tab: 'realtime-media',
        slugSegments: ['rtc', 'reference', 'release-notes', `${platform}.md`],
      });
      expect(response?.status).toBe(200);
      expect(await response?.text()).toContain('RTC SDK');
    }
  }, 90_000);

  it('retains every historical anchor destination and local link', () => {
    const pages = Object.fromEntries(
      platforms.map((platform) => [
        platform,
        readFileSync(`${sourcePath}/${platform}.mdx`, 'utf8'),
      ]),
    );
    let headingCount = 0;
    for (const [platform, page] of Object.entries(pages)) {
      headingCount += [...page.matchAll(/^ {0,3}#{2,5} .+ \[#([^\]]+)\]$/gm)]
        .length;
      const ids = new Set(
        [...page.matchAll(/\[#([^\]]+)\]|\bid="([^"]+)"/g)].map(
          (match) => match[1] ?? match[2],
        ),
      );
      expect(ids.size, `${platform} has duplicate anchor IDs`).toBe(
        [...page.matchAll(/\[#([^\]]+)\]|\bid="([^"]+)"/g)].length,
      );
      for (const match of page.matchAll(/\]\(#([^)]+)\)/g)) {
        expect(ids.has(match[1]), `${platform} #${match[1]}`).toBe(true);
      }
    }
    for (const [id, platform] of Object.entries(
      rtcReleaseNotesAnchorPlatform,
    )) {
      expect(pages[platform]).toContain(id);
    }
    const index = readFileSync(`${sourcePath}/index.mdx`, 'utf8');
    headingCount += [...index.matchAll(/^#{2,5} .+ \[#([^\]]+)\]$/gm)].length;
    expect(headingCount).toBe(763);
    expect(pages.windows).toContain(
      '#### Compatibility changes [#compatibility-changes-49]',
    );
    expect(pages.windows).toContain('#### New features [#new-features-83]');
    expect(index).toContain('## Notifications');
  });

  it('preserves old query and hash links without redirecting shared notifications', () => {
    const resolve = (search: string, hash: string) =>
      resolveRtcReleaseNotesLegacyTarget(
        { pathname: RTC_RELEASE_NOTES_PATH, search, hash },
        rtcReleaseNotesAnchorPlatform,
      );
    expect(resolve('?platform=windows-cpp&version=4', '#v462-4')).toMatchObject(
      {
        platform: 'windows',
        url: `${RTC_RELEASE_NOTES_PATH}/windows?version=4#v462-4`,
      },
    );
    expect(resolve('?platform=react-js', '')?.url).toBe(
      `${RTC_RELEASE_NOTES_PATH}/javascript`,
    );
    expect(resolve('', '#ios-sdk-known-issues')?.url).toBe(
      `${RTC_RELEASE_NOTES_PATH}/ios#ios-sdk-known-issues`,
    );
    expect(resolve('', '#web-sdk-v4-24-8')?.url).toBe(
      `${RTC_RELEASE_NOTES_PATH}/web#web-sdk-v4-24-8`,
    );
    expect(resolve('', '#notifications')).toBeNull();
    expect(resolve('?platform=ios', '#notifications')).toBeNull();
    expect(resolve('', '#unknown')).toBeNull();
  });
});
