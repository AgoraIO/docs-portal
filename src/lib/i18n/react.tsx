'use client';

import { useRouter, useRouterState } from '@tanstack/react-router';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  detectLocale,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
} from './i18n-config';
import { resources } from './resources';

type TranslationTree = typeof resources.en.common;

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
  syncLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [storedLocale, setStoredLocale] = useState<AppLocale>(() =>
    getInitialLocale(),
  );
  const locale = storedLocale;

  useEffect(() => {
    syncDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: async (nextLocale) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        }

        setStoredLocale(nextLocale);
      },
      syncLocale: (nextLocale) => {
        setStoredLocale((currentLocale) =>
          currentLocale === nextLocale ? currentLocale : nextLocale,
        );
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleState() {
  const value = useContext(LocaleContext);

  if (!value) {
    throw new Error('useLocaleState must be used within LocaleProvider');
  }

  return value;
}

export function useTranslation(namespace: 'common' = 'common') {
  const { locale, setLocale } = useLocaleState();
  const t = useMemo(
    () => createTranslator(locale, namespace),
    [locale, namespace],
  );

  const i18n = useMemo(
    () => ({
      changeLanguage: setLocale,
      getFixedT: (fixedLocale: AppLocale | string, fixedNamespace: 'common') =>
        createTranslator(
          normalizeLocale(fixedLocale) ?? DEFAULT_LOCALE,
          fixedNamespace,
        ),
      language: locale,
      resolvedLanguage: locale,
    }),
    [locale, setLocale],
  );

  return {
    i18n,
    t,
  };
}

function createTranslator(locale: AppLocale, namespace: 'common') {
  const messages = resources[locale][namespace] as TranslationTree;

  return (key: string) => {
    const value = getNestedTranslation(messages, key);

    if (typeof value !== 'string') {
      throw new Error(
        `Missing translation for key "${key}" in locale "${locale}"`,
      );
    }

    return value;
  };
}

function getNestedTranslation(messages: TranslationTree, key: string) {
  let value: unknown = messages;

  for (const segment of key.split('.')) {
    if (!value || typeof value !== 'object' || !(segment in value)) {
      return null;
    }

    value = value[segment as keyof typeof value];
  }

  return value;
}

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

function syncDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale;
}

export function RouterLocaleSync() {
  const router = useRouter({ warn: false });

  if (!router) {
    return null;
  }

  return <RouterLocaleSyncInner />;
}

function RouterLocaleSyncInner() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const routeLocale = normalizeLocale(pathname.split('/').filter(Boolean)[0]);
  const { syncLocale } = useLocaleState();

  useEffect(() => {
    if (!routeLocale) {
      return;
    }

    syncLocale(routeLocale);
  }, [routeLocale, syncLocale]);

  return null;
}
