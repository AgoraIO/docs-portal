import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

describe('fastboard per-platform path URLs', () => {
  for (const platform of ['android', 'ios', 'web'] as const) {
    it(`resolves /api-ref/uikit-sdk/${platform} to the page with ${platform} active`, async () => {
      const result = await loadDocsPagePayload('en', 'api-reference', [
        'api-ref',
        'uikit-sdk',
        platform,
      ]);
      expect(result).toBeTruthy();
      expect((result as { redirectUrl?: string }).redirectUrl).toBeUndefined();
      const serialized = JSON.stringify(result);
      expect(serialized).toContain('uikit-sdk');
      expect(serialized).toContain(platform);
    });
  }
});
