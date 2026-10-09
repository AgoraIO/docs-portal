import { findPath, flattenTree, type Root } from 'fumadocs-core/page-tree';
import { zhCnFaqCategories, zhCnFaqItems } from '../../components/faq/faq-data.zh-cn';

export type DocsSearchNavigation = Map<string, string[]>;

export function buildDocsSearchNavigation(
  pageTree: Root,
  locale?: string,
): DocsSearchNavigation {
  const navigation = new Map(
    flattenTree(pageTree.children).map((page) => {
      const treePath = findPath(
        pageTree.children,
        (node) => node.type === 'page' && node.url === page.url,
      );
      const rootIndex =
        treePath?.findIndex(
          (node) => node.type === 'folder' && node.root === true,
        ) ?? -1;
      const breadcrumbs =
        treePath
          ?.slice(rootIndex >= 0 ? rootIndex : 0, -1)
          .flatMap((node) =>
            typeof node.name === 'string' && node.name.length > 0
              ? [node.name]
              : [],
          ) ?? [];

      return [page.url, breadcrumbs];
    }),
  );
  // FAQ 详情通过中文组件链接公开，分类侧栏仅列入口页；两种公开导航都应收录。
  if (locale === 'zh-CN') {
    for (const item of zhCnFaqItems) {
      if (navigation.has(item.href)) continue;
      const category = zhCnFaqCategories.find(entry => entry.id === item.category);
      navigation.set(item.href, ['常见问题', ...(category ? [category.label] : [])]);
    }
  }
  return navigation;
}
