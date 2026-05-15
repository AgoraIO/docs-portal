import { describe, expect, it } from 'vitest';
import { buildDocPath, getSourceSlugs } from '@/lib/docs-routing';

describe('canonical docs route model', () => {
  it('builds root redirect target', () => {
    expect(buildDocPath('en', 'introduction')).toBe('/en/introduction');
  });

  it('builds explicit page routes', () => {
    expect(buildDocPath('en', 'ai', 'quick-start')).toBe('/en/ai/quick-start');
  });

  it('maps route parts to source slugs', () => {
    expect(
      getSourceSlugs({
        locale: 'zh-CN',
        tab: 'api-reference',
        slug: 'start-agent',
      }),
    ).toEqual(['api-reference', 'start-agent']);
  });
});
