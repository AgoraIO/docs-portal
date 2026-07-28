export type ReferenceCenterContext = 'api' | 'faq' | 'recipes' | 'sdks';

export type ReferenceCenterEntryId = 'api' | 'faq' | 'recipes' | 'sdks';

export const REFERENCE_CENTER_ENTRIES: readonly {
  href: string;
  id: ReferenceCenterEntryId;
  label: string;
}[] = [
  {
    href: '/zh-CN/api-reference/api',
    id: 'api',
    label: 'API 参考',
  },
  {
    href: '/zh-CN/reference/sdks',
    id: 'sdks',
    label: 'SDK 下载',
  },
  {
    href: '/zh-CN/reference/recipes',
    id: 'recipes',
    label: 'Recipe',
  },
  {
    href: '/zh-CN/reference/faq',
    id: 'faq',
    label: '常见问题',
  },
];

export function getReferenceCenterContext(
  activePath: string,
  locale: string,
): ReferenceCenterContext | null {
  if (locale !== 'zh-CN') {
    return null;
  }

  const normalizedPath = activePath.replace(/\/+$/, '');

  if (normalizedPath === '/zh-CN/api-reference/api') {
    return 'api';
  }
  if (normalizedPath === '/zh-CN/reference/sdks') {
    return 'sdks';
  }
  if (
    normalizedPath === '/zh-CN/reference/recipes' ||
    normalizedPath.startsWith('/zh-CN/reference/recipes/')
  ) {
    return 'recipes';
  }
  if (
    normalizedPath === '/zh-CN/reference/faq' ||
    normalizedPath.startsWith('/zh-CN/reference/faq/')
  ) {
    return 'faq';
  }

  return null;
}
