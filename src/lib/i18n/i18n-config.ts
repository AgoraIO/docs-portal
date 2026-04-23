export const SUPPORTED_LOCALES = ['en', 'zh-CN'] as const;
export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'docs-portal-locale';

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(
  locale: string | null | undefined,
): AppLocale | null {
  if (!locale) {
    return null;
  }

  const normalizedLocale = locale.toLowerCase();

  if (normalizedLocale === 'en' || normalizedLocale.startsWith('en-')) {
    return 'en';
  }

  if (normalizedLocale === 'zh' || normalizedLocale.startsWith('zh-')) {
    return 'zh-CN';
  }

  return null;
}

export function detectLocale({
  storedLocale,
  browserLocales = [],
}: {
  storedLocale?: string | null;
  browserLocales?: readonly string[];
}): AppLocale {
  return (
    normalizeLocale(storedLocale) ??
    browserLocales.map((locale) => normalizeLocale(locale)).find(Boolean) ??
    DEFAULT_LOCALE
  );
}
