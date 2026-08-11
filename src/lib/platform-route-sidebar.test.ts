import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

describe('platform route sidebar selection', () => {
  for (const legacyProduct of [
    'broadcast-streaming',
    'interactive-live-streaming',
    'video',
    'voice',
  ]) {
    it(`redirects a direct ${legacyProduct} URL to the unified RTC page`, async () => {
      const payload = await loadDocsPagePayload('en', 'realtime-media', [
        legacyProduct,
        'build',
        'enhance-the-audio-experience',
        'ai-noise-suppression',
        'react-native',
      ]);

      expect(payload).toEqual({
        redirectUrl:
          '/en/realtime-media/rtc/build/enhance-the-audio-experience/ai-noise-suppression/react-native',
      });
    }, 15_000);
  }
});
