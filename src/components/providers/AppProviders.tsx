import type { ReactNode } from 'react';
import { LocaleProvider, RouterLocaleSync } from '@/lib/i18n/react';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <RouterLocaleSync />
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
}
