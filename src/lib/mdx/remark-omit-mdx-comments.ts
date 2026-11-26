import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

// Hide comments from exported Markdown. Keep their AST nodes as boundaries
// between adjacent platform groups; MDX itself renders empty expressions away.
export function remarkOmitMdxComments({ chineseFilesOnly = false } = {}) {
  return (tree: Root, file: VFile) => {
    if (
      chineseFilesOnly &&
      !file.path?.replaceAll('\\', '/').includes('/zh-CN/')
    )
      return;
    visit(tree, (node) => {
      if (
        (node.type === 'mdxFlowExpression' ||
          node.type === 'mdxTextExpression') &&
        node.data?.estree?.body.length === 0
      ) {
        replaceSource(file, node, '');
      }
    });
  };
}
