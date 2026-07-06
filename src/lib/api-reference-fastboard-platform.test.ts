import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

describe('fastboard per-platform path URLs', () => {
  for (const platform of ['android', 'ios'] as const) {
    it(
      `loads /en/api-reference/api-ref/uikit-sdk/${platform} without redirect and selects ${platform}`,
      async () => {
        const result = await loadDocsPagePayload('en', 'api-reference', [
          'api-ref',
          'uikit-sdk',
          platform,
        ]);

        expect(result).toBeTruthy();
        expect(result).not.toHaveProperty('redirectUrl');

        if (!result || 'redirectUrl' in result) {
          throw new Error(`expected ${platform} to resolve to a docs payload`);
        }

        expect(result).toMatchObject({
          activePath: '/en/api-reference/api-ref/uikit-sdk',
          body: {
            kind: 'mdx',
            platformTabs: {
              initialPlatform: platform,
            },
          },
          markdownUrl: `/en/api-reference/api-ref/uikit-sdk/${platform}.md`,
        });
      },
      15_000,
    );
  }
});
