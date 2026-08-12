import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@/lib/i18n/i18n';
// import { AnalyticsProvider } from './AnalyticsProvider';
import { I18nBootstrap } from './i18n-bootstrap';
// import { SecuritiConsentProvider } from './SecuritiConsentProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      {/*
        Securiti.ai consent provider is temporarily disabled while testing
        CookieYes as the CMP.

        <SecuritiConsentProvider>
      */}
      {/*
        Direct PostHog initialization is temporarily disabled while Securiti.ai
        manages tags.

        <AnalyticsProvider>
          <ThemeProvider>
            <I18nBootstrap />
            {children}
          </ThemeProvider>
        </AnalyticsProvider>
      */}
      <ThemeProvider>
        <I18nBootstrap />
        {children}
      </ThemeProvider>
      {/*
        </SecuritiConsentProvider>
      */}
    </I18nextProvider>
  );
}
