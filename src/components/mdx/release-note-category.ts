// Reuse the category artwork from the legacy VersionTitle headings.
const categories: Record<string, string> = {
  新增特性: 'feature',
  新增功能: 'feature',
  新特性: 'feature',
  功能特性: 'feature',
  'beta 版本能力': 'feature',
  核心功能: 'feature',
  'new features': 'feature',
  升级必看: 'compatibility',
  升级建议: 'compatibility',
  集成必看: 'compatibility',
  兼容性变更: 'compatibility',
  系统兼容性: 'compatibility',
  能力边界: 'compatibility',
  配置优化与参数下线通知: 'compatibility',
  'compatibility changes': 'compatibility',
  改进: 'improve',
  优化: 'improve',
  功能优化: 'improve',
  improvements: 'improve',
  问题修复: 'bugfix',
  'bug fixes': 'bugfix',
  'fixed issues': 'bugfix',
  'issues fixed': 'bugfix',
  已知问题和局限性: 'fix',
  已知问题和兼容性: 'fix',
  'known issues and limitations': 'fix',
  'known issues': 'fix',
  'api 变更': 'api',
  'api changes': 'api',
  'sdk 下载': 'api',
};

export function getReleaseNoteCategoryIcon(
  contentPath: string | undefined,
  label: string,
) {
  if (
    !contentPath ||
    !/(?:^|\/)(?:release(?:-notes[^/]*)?|changelog)\.mdx?$/.test(contentPath)
  ) {
    return undefined;
  }
  const key = label.trim().toLowerCase();
  const category = Object.hasOwn(categories, key) ? categories[key] : undefined;
  return category ? `/img/release-notes/version-${category}.png` : undefined;
}
