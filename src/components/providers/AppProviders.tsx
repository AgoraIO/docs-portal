import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { cnGa4Enabled } from '@/lib/analytics/cn-ga4';
import { i18n } from '@/lib/i18n/i18n';
import { AnalyticsProvider } from './AnalyticsProvider';
import { CnGa4PageViews } from './CnGa4PageViews';
import { I18nBootstrap } from './i18n-bootstrap';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AnalyticsProvider>
        <ThemeProvider>
          <I18nBootstrap />
          {cnGa4Enabled && <CnGa4PageViews />}
          {children}
        </ThemeProvider>
      </AnalyticsProvider>
    </I18nextProvider>
  );
}
