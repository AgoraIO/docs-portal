import { describe, expect, it } from 'vitest';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import {
  loadDocsPagePayload,
  resolveLegacySitemapRedirect,
} from './docs-page.server';

describe('Video release notes platform routes', () => {
  it('resolves a platform URL to the split page with that panel selected', async () => {
    expect(
      resolveLegacySitemapRedirect('en', 'realtime-media', [
        'video',
        'reference',
        'release-notes',
        'ios',
      ]),
    ).toBeNull();

    const result = await loadDocsPagePayload('en', 'realtime-media', [
      'video',
      'reference',
      'release-notes',
      'ios',
    ]);

    expect(result).toBeTruthy();
    expect(result).not.toHaveProperty('redirectUrl');

    if (!result || 'redirectUrl' in result) {
      throw new Error('expected the iOS release notes payload');
    }

    expect(result).toMatchObject({
      activePath: '/en/realtime-media/video/reference/release-notes',
      body: {
        kind: 'platform-group',
        platformTabs: {
          initialPlatform: 'ios',
        },
      },
      markdownUrl: '/en/realtime-media/video/reference/release-notes/ios.md',
    });
  }, 15_000);

  it('preserves published version anchors for platform deep links', async () => {
    for (const [platform, anchor] of [
      ['ios', '#v462-1'],
      ['macos', '#v462-2'],
      ['windows', '#v462-4'],
      ['web', '#v4248'],
    ]) {
      const result = await loadDocsPagePayload('en', 'realtime-media', [
        'video',
        'reference',
        'release-notes',
        platform,
      ]);
      if (!result || 'redirectUrl' in result)
        throw new Error('missing platform page');
      const response = await getPublicDocsMarkdownResponse({
        locale: 'en',
        tab: 'realtime-media',
        slugSegments: ['video', 'reference', 'release-notes', `${platform}.md`],
      });
      expect(response?.status).toBe(200);
      expect(await response?.text()).toContain(`[${anchor}]`);
    }
  }, 30_000);

  it('resolves every migrated platform to its own machine-readable route', async () => {
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

    for (const platform of platforms) {
      const result = await loadDocsPagePayload('en', 'realtime-media', [
        'video',
        'reference',
        'release-notes',
        platform,
      ]);

      expect(result).toBeTruthy();
      expect(result).not.toHaveProperty('redirectUrl');
      if (!result || 'redirectUrl' in result) {
        throw new Error(`expected the ${platform} release notes payload`);
      }

      expect(result.body).toMatchObject({
        kind: 'platform-group',
        platformTabs: { initialPlatform: platform },
      });
      expect(result.markdownUrl).toBe(
        `/en/realtime-media/video/reference/release-notes/${platform}.md`,
      );
    }
  }, 30_000);
});
