import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import SearchDialog from '@/components/search';
import { docsI18n } from '@/lib/i18n/fumadocs';
import { i18n } from '@/lib/i18n/i18n';
import { useLocale } from '@/lib/i18n/use-locale';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-preference';
import { I18nBootstrap } from './i18n-bootstrap';

function AppProvidersInner({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale();

  return (
    <RootProvider
      i18n={{
        ...docsI18n.provider(locale),
        onLocaleChange: (nextLocale) =>
          void setLocale(nextLocale as 'en' | 'zh-CN'),
      }}
      search={{ SearchDialog }}
      theme={{
        attribute: 'class',
        defaultTheme: 'system',
        disableTransitionOnChange: true,
        enableSystem: true,
        storageKey: THEME_STORAGE_KEY,
      }}
    >
      <I18nBootstrap />
      {children}
    </RootProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AppProvidersInner>{children}</AppProvidersInner>
    </I18nextProvider>
  );
}
