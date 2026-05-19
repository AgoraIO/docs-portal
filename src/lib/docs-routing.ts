import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from './i18n/i18n-config';

export type DocsRoute = {
  locale: string;
  slug?: string;
  slugSegments?: string[];
  tab: string;
};

function normalizeSlugSegments(
  route: Pick<DocsRoute, 'slug' | 'slugSegments'>,
) {
  if (Array.isArray(route.slugSegments) && route.slugSegments.length > 0) {
    const segments = route.slugSegments.filter(Boolean);
    if (segments.length === 1 && segments[0] === 'index') {
      return [];
    }

    return segments;
  }

  if (!route.slug || route.slug === 'index') {
    return [];
  }

  return [route.slug];
}

export function buildDocPath(
  locale: string,
  tab: string,
  slug?: string | string[],
) {
  const slugSegments = Array.isArray(slug)
    ? slug.filter(Boolean)
    : !slug || slug === 'index'
      ? []
      : [slug];

  if (slugSegments.length === 0) {
    return `/${locale}/${tab}`;
  }

  return `/${locale}/${tab}/${slugSegments.join('/')}`;
}

export function isSupportedDocLocale(locale: string) {
  return normalizeLocale(locale) === locale;
}

export function getSourceSlugs(route: DocsRoute) {
  const slugs = [route.tab];
  const slugSegments = normalizeSlugSegments(route);

  if (slugSegments.length > 0) {
    slugs.push(...slugSegments);
  }

  return slugs;
}

export function getContentPathSegments(route: DocsRoute) {
  const sourceSlugs = getSourceSlugs(route);
  const leaf = sourceSlugs.at(-1);
  const slugSegments = normalizeSlugSegments(route);

  if (slugSegments.length > 0) {
    return [route.locale, ...sourceSlugs.slice(0, -1), `${leaf}.md`];
  }

  return [route.locale, ...sourceSlugs, 'index.md'];
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

  if (
    segments.length === 2 &&
    segments[1] === 'introduction' &&
    nextLocale === DEFAULT_LOCALE
  ) {
    return `/${segments.join('/')}`;
  }

  return `/${segments.join('/')}`;
}

export function getSourceSlugsFromContentPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  const [locale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (!locale || !tab || !fileName) {
    return [];
  }

  if (fileName === 'index.md' || fileName === 'index.mdx') {
    return [tab, ...rest.slice(0, -1)];
  }

  if (fileName.endsWith('.md') || fileName.endsWith('.mdx')) {
    return [tab, ...rest.slice(0, -1), fileName.replace(/\.mdx?$/, '')];
  }

  return [];
}

export function parseSourceSlugs(slugs: string[]) {
  const [tab, ...rest] = slugs;
  return {
    locale: '',
    tab,
    slug: rest.at(-1) ?? 'index',
    slugSegments: rest,
  };
}
