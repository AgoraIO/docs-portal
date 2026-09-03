const PRODUCT_TABS = new Set(['ai', 'realtime-media', 'solutions']);

export type ProductSidebarContext = {
  locale: string;
  pathname: string;
  slugSegments: string[];
  tab: string;
};

export function parseProductSidebarContext(
  search: string | undefined,
  expectedLocale: string,
): ProductSidebarContext | null {
  const rawPathname = new URLSearchParams(search ?? '').get('from');

  if (!rawPathname?.startsWith('/')) {
    return null;
  }

  const pathname = rawPathname.replace(/\/+$/, '') || '/';
  const segments = pathname.split('/').filter(Boolean);
  const [locale, tab, ...slugSegments] = segments;

  if (
    locale !== expectedLocale ||
    !PRODUCT_TABS.has(tab ?? '') ||
    (tab !== 'ai' && slugSegments.length === 0) ||
    slugSegments.some((segment) => segment === '.' || segment === '..')
  ) {
    return null;
  }

  return {
    locale,
    pathname,
    slugSegments,
    tab,
  };
}
