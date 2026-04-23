export const THEME_STORAGE_KEY = 'docs-portal-theme';

export const THEME_MODES = ['light', 'dark', 'system'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

export function normalizeThemeMode(
  value: string | null | undefined,
): ThemeMode {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }

  return 'system';
}

export function resolveThemeMode(
  themeMode: ThemeMode,
  systemPrefersDark: boolean,
): ResolvedThemeMode {
  if (themeMode === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }

  return themeMode;
}
