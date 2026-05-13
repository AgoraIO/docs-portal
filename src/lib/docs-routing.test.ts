import { describe, expect, it } from 'vitest';
import {
  buildDocPath,
  getContentPathSegments,
  getSourceSlugs,
  parseSourceSlugs,
} from './docs-routing';

describe('docs routing helpers', () => {
  it('builds canonical locale-tab paths', () => {
    expect(buildDocPath('en', 'introduction')).toBe('/en/introduction');
    expect(buildDocPath('en', 'ai', 'quick-start')).toBe('/en/ai/quick-start');
  });

  it('builds source slugs without index suffixes', () => {
    expect(getSourceSlugs({ locale: 'en', tab: 'introduction' })).toEqual([
      'en',
      'introduction',
    ]);
    expect(
      getSourceSlugs({ locale: 'zh-CN', tab: 'ai', slug: 'quick-start' }),
    ).toEqual(['zh-CN', 'ai', 'quick-start']);
  });

  it('builds content path segments for slug pages', () => {
    expect(
      getContentPathSegments({ locale: 'en', tab: 'ai', slug: 'overview' }),
    ).toEqual(['en', 'ai', 'overview.md']);
  });

  it('builds content path segments for tab index pages', () => {
    expect(getContentPathSegments({ locale: 'en', tab: 'introduction' })).toEqual(
      ['en', 'introduction', 'index.md'],
    );
  });

  it('parses source slugs back into route parts', () => {
    expect(parseSourceSlugs(['en', 'introduction'])).toEqual({
      locale: 'en',
      tab: 'introduction',
      slug: 'index',
    });

    expect(parseSourceSlugs(['zh-CN', 'api-reference', 'start-agent'])).toEqual({
      locale: 'zh-CN',
      tab: 'api-reference',
      slug: 'start-agent',
    });
  });
});
