import {
  normalizeThemeMode,
  resolveThemeMode,
  THEME_STORAGE_KEY,
} from './theme-preference';

describe('theme preference helpers', () => {
  it('normalizes unexpected values back to system', () => {
    expect(normalizeThemeMode('light')).toBe('light');
    expect(normalizeThemeMode('dark')).toBe('dark');
    expect(normalizeThemeMode('system')).toBe('system');
    expect(normalizeThemeMode('sepia')).toBe('system');
  });

  it('resolves system mode from the operating system preference', () => {
    expect(resolveThemeMode('system', true)).toBe('dark');
    expect(resolveThemeMode('system', false)).toBe('light');
  });

  it('keeps explicit user choices regardless of system preference', () => {
    expect(resolveThemeMode('light', true)).toBe('light');
    expect(resolveThemeMode('dark', false)).toBe('dark');
  });

  it('stores the selected theme under the docs app storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('docs-portal-theme');
  });
});
