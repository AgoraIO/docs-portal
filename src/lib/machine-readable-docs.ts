import { type AppLocale, DEFAULT_LOCALE } from './i18n/i18n-config';

export const MACHINE_READABLE_LOCALE = DEFAULT_LOCALE;
export const PUBLIC_MARKDOWN_LOCALES = [
  DEFAULT_LOCALE,
  'zh-CN',
] as const satisfies readonly AppLocale[];

export function isMachineReadableLocale(
  locale: string | null | undefined,
): locale is AppLocale {
  return locale === MACHINE_READABLE_LOCALE;
}

export function isPublicMarkdownLocale(
  locale: string | null | undefined,
): locale is AppLocale {
  return PUBLIC_MARKDOWN_LOCALES.includes(locale as AppLocale);
}

export function isMachineReadableDocsPath(path: string) {
  const [locale] = path.split('/').filter(Boolean);

  return isMachineReadableLocale(locale);
}

export function filterMachineReadableDocsPages<
  T extends { path?: string; url?: string },
>(pages: T[]) {
  return pages.filter((page) =>
    isMachineReadableDocsPath(page.path ?? page.url ?? ''),
  );
}
