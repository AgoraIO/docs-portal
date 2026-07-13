import {
  DOCS_LOCALES,
  type DocsLocale,
  getDefaultDocsLocale,
} from '../site-region';

export const SUPPORTED_LOCALES = DOCS_LOCALES;
export const DEFAULT_LOCALE = getDefaultDocsLocale();
export const LOCALE_STORAGE_KEY = 'docs-portal-locale';

export type AppLocale = DocsLocale;

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
