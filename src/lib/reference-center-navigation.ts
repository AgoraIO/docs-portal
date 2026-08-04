export type DocsSidebarMode = 'api' | 'reference';

export function getDocsSidebarMode(
  activePath: string,
  locale: string,
): DocsSidebarMode | null {
  if (locale !== 'zh-CN') {
    return null;
  }

  const normalizedPath = activePath.replace(/\/+$/, '');

  if (normalizedPath === '/zh-CN/api-reference/api') {
    return 'api';
  }
  if (
    normalizedPath === '/zh-CN/reference/sdks' ||
    normalizedPath === '/zh-CN/reference/demo' ||
    normalizedPath.startsWith('/zh-CN/reference/demo/') ||
    normalizedPath === '/zh-CN/reference/faq' ||
    normalizedPath.startsWith('/zh-CN/reference/faq/')
  ) {
    return 'reference';
  }

  return null;
}
