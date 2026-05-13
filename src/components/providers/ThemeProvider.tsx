'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-preference';

export function ThemeProvider({
  children,
  ...props
}: Omit<ThemeProviderProps, 'storageKey'>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
