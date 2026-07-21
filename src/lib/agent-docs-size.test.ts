import { describe, expect, it } from 'vitest';
import { getPlatformLLMText, source } from './source';

describe('agent markdown page size', () => {
  it.each([
    {
      platform: 'windows' as const,
      url: '/en/realtime-media/broadcast-streaming/build/connect-across-channels/receive-notifications',
    },
    {
      platform: 'web' as const,
      url: '/en/realtime-media/broadcast-streaming/reference/release-notes',
    },
  ])('keeps $url/$platform.md below 100K characters', async (example) => {
    const page = source
      .getPages('en')
      .find((candidate) => candidate.url === example.url);

    expect(page).toBeDefined();
    if (!page) {
      throw new Error(`Missing page: ${example.url}`);
    }

    const markdown = await getPlatformLLMText(page, example.platform);

    expect(markdown).not.toBeNull();
    if (markdown === null) {
      throw new Error(
        `Missing ${example.platform} Markdown for ${example.url}`,
      );
    }
    expect(markdown.length).toBeLessThan(100_000);
  }, 30_000);
});
