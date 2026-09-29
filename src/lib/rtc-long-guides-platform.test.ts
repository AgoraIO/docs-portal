import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import { loadDocsPagePayload } from './docs-page.server';
import { rtcLongGuideAnchorPlatforms } from './rtc-long-guides-anchors';
import {
  RTC_LONG_GUIDE_PLATFORMS,
  resolveRtcLongGuideLegacyTarget,
} from './rtc-long-guides-compat';

const rtcRoot = '/en/realtime-media/rtc/';
const sourceRoot = 'content/docs/en/realtime-media/rtc/';
const expectedHeadings: Record<string, number> = {
  'get-started-sdk': 295,
  'voice-quickstart': 268,
  'build/optimize-and-operate/app-size-optimization': 52,
};

describe('RTC long guide platform split', () => {
  it('resolves all platform pages and machine-readable routes', async () => {
    for (const [route, platforms] of Object.entries(RTC_LONG_GUIDE_PLATFORMS)) {
      const slug = route.slice(rtcRoot.length);
      const segments = ['rtc', ...slug.split('/')];
      const index = await loadDocsPagePayload('en', 'realtime-media', segments);
      expect(index).toMatchObject({
        activePath: route,
        body: { kind: 'platform-group', platforms, canonicalPlatform: 'web' },
        markdownUrl: `${route}.md`,
      });
      const indexMarkdown = await getPublicDocsMarkdownResponse({
        locale: 'en',
        tab: 'realtime-media',
        slugSegments: [...segments.slice(0, -1), `${segments.at(-1)}.md`],
      });
      expect(indexMarkdown?.status).toBe(200);

      for (const platform of platforms) {
        const result = await loadDocsPagePayload('en', 'realtime-media', [
          ...segments,
          platform,
        ]);
        expect(result).toMatchObject({
          activePath: route,
          body: {
            kind: 'platform-group',
            platformTabs: { initialPlatform: platform },
          },
          markdownUrl: `${route}/${platform}.md`,
        });
        const response = await getPublicDocsMarkdownResponse({
          locale: 'en',
          tab: 'realtime-media',
          slugSegments: [...segments, `${platform}.md`],
        });
        expect(response?.status).toBe(200);
        expect((await response?.text())?.length).toBeGreaterThan(100);
      }
    }
  }, 120_000);

  it('preserves historical headings, platform content, and local hashes', () => {
    for (const [slug, total] of Object.entries(expectedHeadings)) {
      const platforms = RTC_LONG_GUIDE_PLATFORMS[`${rtcRoot}${slug}`];
      let headingCount = 0;
      for (const platform of platforms) {
        const source = readFileSync(
          `${sourceRoot}${slug}/${platform}.mdx`,
          'utf8',
        );
        headingCount += [
          ...source.matchAll(/^ {0,3}#{2,5} .+ \[#([^\]]+)\]$/gm),
        ].length;
        const ids = new Set(
          [...source.matchAll(/\[#([^\]]+)\]|\bid="([^"]+)"/g)].map(
            (match) => match[1] ?? match[2],
          ),
        );
        for (const match of source.matchAll(/\]\(#([^)]+)\)/g)) {
          expect(ids.has(match[1]), `${slug}/${platform} #${match[1]}`).toBe(
            true,
          );
        }
      }
      expect(headingCount, slug).toBe(total);
      for (const [id, platform] of Object.entries(
        rtcLongGuideAnchorPlatforms[slug],
      )) {
        if (!platform) continue;
        expect(
          readFileSync(`${sourceRoot}${slug}/${platform}.mdx`, 'utf8'),
        ).toContain(id);
      }
    }
  });

  it('maps legacy aliases and unique hashes without inventing unsupported pages', () => {
    const resolve = (slug: string, search: string, hash: string) =>
      resolveRtcLongGuideLegacyTarget(
        { pathname: `${rtcRoot}${slug}`, search, hash },
        rtcLongGuideAnchorPlatforms,
      );
    expect(
      resolve(
        'get-started-sdk',
        '?platform=Electron&source=legacy',
        '#set-up-your-project-5',
      ),
    ).toMatchObject({
      platform: 'electron',
      url: `${rtcRoot}get-started-sdk/electron?source=legacy#set-up-your-project-5`,
    });
    expect(
      resolve(
        'get-started-sdk',
        '?platform=React%20Native',
        '#set-up-your-project-6',
      )?.url,
    ).toBe(`${rtcRoot}get-started-sdk/react-native#set-up-your-project-6`);
    expect(resolve('voice-quickstart', '?platform=python', '')?.platform).toBe(
      'python',
    );
    expect(resolve('get-started-sdk', '?platform=python', '')).toBeNull();
    expect(resolve('toString', '?platform=android', '')).toBeNull();
    expect(
      resolve('get-started-sdk', '', '#set-up-your-project-5')?.platform,
    ).toBe('electron');
    expect(
      resolve(
        'build/optimize-and-operate/app-size-optimization',
        '',
        '#use-tree-shaking',
      )?.platform,
    ).toBe('web');
    expect(resolve('voice-quickstart', '', '#unknown')).toBeNull();
  });
});
