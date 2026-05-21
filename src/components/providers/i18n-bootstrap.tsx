import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, normalizeLocale } from '@/lib/i18n/i18n-config';
import { getInitialLocale } from '@/lib/i18n/use-locale';

export function I18nBootstrap() {
  const { i18n } = useTranslation('common');
  let pathname = '';

  try {
    pathname = useRouterState({
      select: (state) => state.location.pathname,
    });
  } catch {
    pathname = '';
  }
  const activeLocale =
    normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  useEffect(() => {
    const routeLocale = normalizeLocale(pathname.split('/').filter(Boolean)[0]);
    const locale = routeLocale ?? getInitialLocale();

    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale).then(() => {
        syncDocumentLocale(locale);
      });
      return;
    }

    syncDocumentLocale(locale);
  }, [i18n, pathname]);

  useEffect(() => {
    syncDocumentLocale(activeLocale);
  }, [activeLocale]);

  return null;
}

function syncDocumentLocale(locale: string) {
  document.documentElement.lang = locale;
}
