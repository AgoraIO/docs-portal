import { describe, expect, it } from 'vitest';
import {
  buildDocPath,
  getContentPathSegments,
  getSourceSlugs,
  getSourceSlugsFromContentPath,
  isSupportedDocLocale,
  parseSourceSlugs,
  replaceDocLocale,
} from './docs-routing';

describe('docs routing helpers', () => {
  it('builds canonical locale-tab paths', () => {
    expect(buildDocPath('en', 'introduction')).toBe('/en/introduction');
    expect(buildDocPath('en', 'ai', ['apps', 'get-started', 'quickstart'])).toBe(
      '/en/ai/apps/get-started/quickstart',
    );
    expect(buildDocPath('en', 'realtime-media', ['rtc', 'quick-start'])).toBe(
      '/en/realtime-media/rtc/quick-start',
    );
  });

  it('builds source slugs without index suffixes', () => {
    expect(getSourceSlugs({ locale: 'en', tab: 'introduction' })).toEqual([
      'introduction',
    ]);
    expect(
      getSourceSlugs({
        locale: 'zh-CN',
        tab: 'ai',
        slugSegments: ['apps', 'get-started', 'quickstart'],
      }),
    ).toEqual(['ai', 'apps', 'get-started', 'quickstart']);
    expect(
      getSourceSlugs({
        locale: 'en',
        tab: 'realtime-media',
        slugSegments: ['rtc', 'quick-start'],
      }),
    ).toEqual(['realtime-media', 'rtc', 'quick-start']);
  });

  it('builds content path segments for slug pages', () => {
    expect(
      getContentPathSegments({
        locale: 'en',
        tab: 'ai',
        slugSegments: ['overview', 'pricing'],
      }),
    ).toEqual(['en', 'ai', 'overview', 'pricing.md']);
    expect(
      getContentPathSegments({
        locale: 'en',
        tab: 'realtime-media',
        slugSegments: ['rtc', 'quick-start'],
      }),
    ).toEqual(['en', 'realtime-media', 'rtc', 'quick-start.md']);
  });

  it('builds content path segments for tab index pages', () => {
    expect(
      getContentPathSegments({ locale: 'en', tab: 'introduction' }),
    ).toEqual(['en', 'introduction', 'index.md']);
  });

  it('parses content paths back into source slugs', () => {
    expect(getSourceSlugsFromContentPath('en/introduction/index.md')).toEqual([
      'introduction',
    ]);

    expect(
      getSourceSlugsFromContentPath('en/ai/apps/get-started/quickstart.md'),
    ).toEqual(['ai', 'apps', 'get-started', 'quickstart']);

    expect(
      getSourceSlugsFromContentPath('en/realtime-media/rtc/quick-start.md'),
    ).toEqual(['realtime-media', 'rtc', 'quick-start']);

    expect(
      getSourceSlugsFromContentPath('en/realtime-media/rtc/index.md'),
    ).toEqual(['realtime-media', 'rtc']);
  });

  it('replaces the locale in canonical doc paths', () => {
    expect(replaceDocLocale('/en/ai/apps/get-started/quickstart', 'zh-CN')).toBe(
      '/zh-CN/ai/apps/get-started/quickstart',
    );
    expect(replaceDocLocale('/zh-CN/introduction', 'en')).toBe(
      '/en/introduction',
    );
  });

  it('accepts only supported locale prefixes for docs routes', () => {
    expect(isSupportedDocLocale('en')).toBe(true);
    expect(isSupportedDocLocale('zh-CN')).toBe(true);
    expect(isSupportedDocLocale('docs')).toBe(false);
    expect(isSupportedDocLocale('zh')).toBe(false);
  });

  it('parses source slugs back into route parts', () => {
    expect(parseSourceSlugs(['introduction'])).toEqual({
      locale: '',
      tab: 'introduction',
      slug: 'index',
      slugSegments: [],
    });

    expect(parseSourceSlugs(['api-reference', 'start-agent'])).toEqual({
      locale: '',
      tab: 'api-reference',
      slug: 'start-agent',
      slugSegments: ['start-agent'],
    });

    expect(parseSourceSlugs(['realtime-media', 'rtc', 'quick-start'])).toEqual({
      locale: '',
      tab: 'realtime-media',
      slug: 'quick-start',
      slugSegments: ['rtc', 'quick-start'],
    });
  });
});
