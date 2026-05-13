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

export function parseSourceSlugs(slugs: string[]) {
  const [locale, tab, ...rest] = slugs;
  return {
    locale,
    tab,
    slug: rest.at(-1) ?? 'index',
  };
}
