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
});
