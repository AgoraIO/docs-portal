import { DEFAULT_LOCALE, type AppLocale, normalizeLocale } from './i18n/i18n-config';

export type DocsRoute = {
  locale: string;
  slug?: string;
  tab: string;
};

export function buildDocPath(locale: string, tab: string, slug?: string) {
  if (!slug || slug === 'index') {
    return `/${locale}/${tab}`;
  }

  return `/${locale}/${tab}/${slug}`;
}

export function getSourceSlugs(route: DocsRoute) {
  const slugs = [route.locale, route.tab];

  if (route.slug && route.slug !== 'index') {
    slugs.push(route.slug);
  }

  return slugs;
}

export function getContentPathSegments(route: DocsRoute) {
  const sourceSlugs = getSourceSlugs(route);
  const leaf = sourceSlugs.at(-1);

  if (route.slug && route.slug !== 'index') {
    return [...sourceSlugs.slice(0, -1), `${leaf}.md`];
  }

  return [...sourceSlugs, 'index.md'];
}

export function getContentPath(route: DocsRoute) {
  return getContentPathSegments(route).join('/');
}

export function replaceDocLocale(path: string, nextLocale: AppLocale) {
  const segments = path.split('/').filter(Boolean);
  const currentLocale = normalizeLocale(segments[0]);

  if (!currentLocale) {
    return buildDocPath(nextLocale, 'introduction');
  }

  segments[0] = nextLocale;

  if (segments.length === 2 && segments[1] === 'introduction' && nextLocale === DEFAULT_LOCALE) {
    return `/${segments.join('/')}`;
  }

  return `/${segments.join('/')}`;
}

export function getSourceSlugsFromContentPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  const [locale, tab, fileName] = segments;

  if (!locale || !tab || !fileName) {
    return [];
  }

  if (fileName === 'index.md') {
    return [locale, tab];
  }

  if (fileName.endsWith('.md')) {
    return [locale, tab, fileName.slice(0, -3)];
  }

  return [];
}

export function parseSourceSlugs(slugs: string[]) {
  const [locale, tab, ...rest] = slugs;
  return {
    locale,
    tab,
    slug: rest.at(-1) ?? 'index',
  };
}
