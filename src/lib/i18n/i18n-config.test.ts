import {
  DEFAULT_LOCALE,
  detectLocale,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from './i18n-config';
import { resources } from './resources';

describe('i18n locale selection', () => {
  it('keeps only supported locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'zh-CN']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('normalizes browser variants into supported locales', () => {
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('en-GB')).toBe('en');
    expect(normalizeLocale('zh')).toBe('zh-CN');
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh-CN');
    expect(normalizeLocale('fr-FR')).toBeNull();
  });

  it('prefers a persisted locale choice before browser settings', () => {
    expect(
      detectLocale({
        storedLocale: 'zh-CN',
        browserLocales: ['en-US'],
      }),
    ).toBe('zh-CN');
  });

  it('falls back to browser language and then english', () => {
    expect(
      detectLocale({
        browserLocales: ['zh-Hans-CN'],
      }),
    ).toBe('zh-CN');

    expect(
      detectLocale({
        browserLocales: ['fr-FR'],
      }),
    ).toBe('en');
  });

  it('localizes the SDK API partial-outage warning', () => {
    expect(resources.en.common.docs.searchApiUnavailable).toBe(
      'SDK API results are temporarily unavailable.',
    );
    expect(resources['zh-CN'].common.docs.searchApiUnavailable).toBe(
      'SDK API 结果暂时不可用。',
    );
  });
});
