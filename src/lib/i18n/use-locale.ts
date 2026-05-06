import { useEffect, useMemo } from 'react';
import { useParams, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { stripLocalePrefix, toLocalizedPath } from '@/lib/locale-routes';
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
  const params = useParams({ strict: false });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const routeLocale = normalizeLocale(
    typeof params.lang === 'string' ? params.lang : null,
  );

  const locale = useMemo(
    () => routeLocale ?? normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE,
    [i18n.language, i18n.resolvedLanguage, routeLocale],
  );

  useEffect(() => {
    const initialLocale = routeLocale ?? getInitialLocale();

    if (initialLocale !== i18n.language) {
      void i18n.changeLanguage(initialLocale);
    }
  }, [i18n, routeLocale]);

  return {
    locale,
    setLocale: async (nextLocale: AppLocale) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      }

      await i18n.changeLanguage(nextLocale);

       if (typeof window !== 'undefined') {
        const nextPath = toLocalizedPath(nextLocale, stripLocalePrefix(pathname));
        if (nextPath !== pathname) {
          window.history.replaceState(window.history.state, '', nextPath);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    },
  };
}
