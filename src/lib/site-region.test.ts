import { describe, expect, it } from 'vitest';
import {
  getDefaultDocsLocale,
  getDocsHomePath,
  getPublishedDocsLocales,
  isPublishedDocsLocale,
  isPublishedDocsPath,
  resolveDocsRegion,
} from './site-region';

describe('docs deployment region', () => {
  it('defaults missing configuration to the global region', () => {
    expect(resolveDocsRegion(undefined)).toBe('global');
    expect(resolveDocsRegion('')).toBe('global');
  });

  it('rejects unknown region values instead of publishing the wrong site', () => {
    expect(() => resolveDocsRegion('us')).toThrow(
      'Unsupported VITE_DOCS_REGION "us"',
    );
  });

  it('publishes non-Chinese locales in global and only Chinese in cn', () => {
    expect(getPublishedDocsLocales('global')).toEqual(['en']);
    expect(getPublishedDocsLocales('cn')).toEqual(['zh-CN']);
    expect(isPublishedDocsLocale('en', 'global')).toBe(true);
    expect(isPublishedDocsLocale('zh-CN', 'global')).toBe(false);
    expect(isPublishedDocsLocale('en', 'cn')).toBe(false);
    expect(isPublishedDocsLocale('zh-CN', 'cn')).toBe(true);
  });

  it('derives the default locale and root docs path from the region', () => {
    expect(getDefaultDocsLocale('global')).toBe('en');
    expect(getDefaultDocsLocale('cn')).toBe('zh-CN');
    expect(getDocsHomePath('global')).toBe('/en/introduction');
    expect(getDocsHomePath('cn')).toBe('/zh-CN/introduction');
  });

  it('filters generated routes by the locale published in each region', () => {
    expect(isPublishedDocsPath('/en/ai/get-started', 'global')).toBe(true);
    expect(isPublishedDocsPath('/zh-CN/ai/get-started', 'global')).toBe(false);
    expect(isPublishedDocsPath('/en/ai/get-started', 'cn')).toBe(false);
    expect(isPublishedDocsPath('/zh-CN/ai/get-started', 'cn')).toBe(true);
    expect(isPublishedDocsPath('/favicon.ico', 'global')).toBe(false);
  });
});
