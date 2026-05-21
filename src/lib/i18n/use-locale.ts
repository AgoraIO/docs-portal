import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  detectLocale,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
} from './i18n-config';

function getStoredLocale() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(LOCALE_STORAGE_KEY);
}

export function getInitialLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  return detectLocale({
    storedLocale: getStoredLocale(),
    browserLocales: window.navigator.languages,
  });
}

export function useLocale() {
  const { i18n } = useTranslation('common');

  const locale = useMemo(
    () =>
      normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE,
    [i18n.language, i18n.resolvedLanguage],
  );

  return {
    locale,
    setLocale: async (nextLocale: AppLocale) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      }

      await i18n.changeLanguage(nextLocale);
    },
  };
}
