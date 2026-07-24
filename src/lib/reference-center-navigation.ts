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
    href: '/zh-CN/api-reference/sdks',
    id: 'sdks',
    label: 'SDK 下载',
  },
  {
    href: '/zh-CN/api-reference/recipes',
    id: 'recipes',
    label: '示例配方',
  },
  {
    href: '/zh-CN/api-reference/faq',
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
  if (normalizedPath === '/zh-CN/api-reference/sdks') {
    return 'sdks';
  }
  if (
    normalizedPath === '/zh-CN/api-reference/recipes' ||
    normalizedPath.startsWith('/zh-CN/api-reference/recipes/')
  ) {
    return 'recipes';
  }
  if (
    normalizedPath === '/zh-CN/api-reference/faq' ||
    normalizedPath.startsWith('/zh-CN/api-reference/faq/')
  ) {
    return 'faq';
  }

  return null;
}
