import { describe, expect, it } from 'vitest';
import { buildDocPath, getSourceSlugs } from '@/lib/docs-routing';

describe('canonical docs route model', () => {
  it('builds root redirect target', () => {
    expect(buildDocPath('en', 'introduction')).toBe('/en/introduction');
  });

  it('builds explicit page routes', () => {
    expect(buildDocPath('en', 'ai', ['get-started', 'quickstart'])).toBe(
      '/en/ai/get-started/quickstart',
    );
    expect(buildDocPath('en', 'realtime-media', ['rtc', 'quick-start'])).toBe(
      '/en/realtime-media/rtc/quick-start',
    );
  });

  it('maps route parts to source slugs', () => {
    expect(
      getSourceSlugs({
        locale: 'zh-CN',
        tab: 'api-reference',
        slug: 'start-agent',
      }),
    ).toEqual(['api-reference', 'start-agent']);

    expect(
      getSourceSlugs({
        locale: 'en',
        tab: 'realtime-media',
        slugSegments: ['rtc', 'quick-start'],
      }),
    ).toEqual(['realtime-media', 'rtc', 'quick-start']);
  });
});
