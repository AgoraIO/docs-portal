import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@/lib/i18n/i18n';
import { AnalyticsProvider } from './AnalyticsProvider';
import { I18nBootstrap } from './i18n-bootstrap';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AnalyticsProvider>
        <ThemeProvider>
          <I18nBootstrap />
          {children}
        </ThemeProvider>
      </AnalyticsProvider>
    </I18nextProvider>
  );
}
