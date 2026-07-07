export function resolveMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'zh-CN' || tab !== 'introduction') {
    return null;
  }

  const [root, ...rest] = slugSegments;
  const movedRootTargets: Record<string, string> = {
    'ppt-transcoding': '/zh-CN/solutions/ppt-transcoding',
    'usage-analytics': '/zh-CN/realtime-media/usage-analytics',
  };
  const targetRoot = root ? movedRootTargets[root] : undefined;

  if (!targetRoot) {
    return null;
  }

  const suffixSegments = rest.at(-1) === 'index' ? rest.slice(0, -1) : rest;
  const suffix =
    suffixSegments.length > 0 ? `/${suffixSegments.join('/')}` : '';

  return `${targetRoot}${suffix}`;
}
