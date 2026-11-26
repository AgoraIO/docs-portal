import type { DocsSidebarHeader } from './docs-nav-scope';

const PRODUCT_TABS = new Set(['ai', 'realtime-media', 'solutions']);

export type ProductSidebarContext = {
  locale: string;
  pathname: string;
  sidebarScope?: string;
  slugSegments: string[];
  tab: string;
};

export function parseProductSidebarContext(
  search: string | undefined,
  expectedLocale: string,
): ProductSidebarContext | null {
  const rawPathname = new URLSearchParams(search ?? '').get('from');
  const sidebarScope = new URLSearchParams(search ?? '').get('fromScope');

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

  const productSlugCount = tab === 'ai' ? Math.min(slugSegments.length, 1) : 1;
  const productSlugSegments = slugSegments.slice(0, productSlugCount);
  const productPathname = `/${[locale, tab, ...productSlugSegments].join('/')}`;
  const derivedSidebarScope =
    sidebarScope ??
    (slugSegments.length > productSlugCount
      ? `/${[
          locale,
          tab,
          ...productSlugSegments,
          slugSegments[productSlugCount],
        ].join('/')}`
      : undefined);

  return {
    locale,
    pathname: productPathname,
    ...(derivedSidebarScope ? { sidebarScope: derivedSidebarScope } : {}),
    slugSegments: productSlugSegments,
    tab,
  };
}

export function getProductTitleVersionSwitcher(
  activePath: string,
  context: ProductSidebarContext,
  switcher: DocsSidebarHeader['versionSwitcher'],
): DocsSidebarHeader['versionSwitcher'] {
  if (
    !switcher ||
    context.pathname !== '/zh-CN/ai' ||
    !/^\/zh-CN\/api-reference\/conversational-ai\/(android|ios|web)\//.test(
      activePath,
    )
  )
    return undefined;

  return {
    ...switcher,
    search: {
      from: context.pathname,
      ...(context.sidebarScope ? { fromScope: context.sidebarScope } : {}),
    },
  };
}
