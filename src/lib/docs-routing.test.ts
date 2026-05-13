import { describe, expect, it } from 'vitest';
import {
  buildDocPath,
  getContentPathSegments,
  getSourceSlugsFromContentPath,
  getSourceSlugs,
  parseSourceSlugs,
  replaceDocLocale,
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

  it('parses content paths back into source slugs', () => {
    expect(getSourceSlugsFromContentPath('en/introduction/index.md')).toEqual([
      'en',
      'introduction',
    ]);

    expect(getSourceSlugsFromContentPath('en/ai/quick-start.md')).toEqual([
      'en',
      'ai',
      'quick-start',
    ]);
  });

  it('replaces the locale in canonical doc paths', () => {
    expect(replaceDocLocale('/en/ai/quick-start', 'zh-CN')).toBe(
      '/zh-CN/ai/quick-start',
    );
    expect(replaceDocLocale('/zh-CN/introduction', 'en')).toBe(
      '/en/introduction',
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
