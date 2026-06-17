import { useMemo } from 'react';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
} from './i18n-config';
import { useTranslation } from './react';

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
