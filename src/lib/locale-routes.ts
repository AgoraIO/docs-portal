import type { AppLocale } from '@/lib/i18n/i18n-config';

export function toLocalizedPath(locale: AppLocale, path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized === '/' ? '' : normalized}`;
}

export function stripLocalePrefix(path: string) {
  const segments = path.split('/').filter(Boolean);
  const [first, ...rest] = segments;

  if (first === 'en' || first === 'zh-CN') {
    return `/${rest.join('/')}`;
  }

  return path;
}
