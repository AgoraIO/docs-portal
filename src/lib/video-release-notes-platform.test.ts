import { describe, expect, it } from 'vitest';
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
