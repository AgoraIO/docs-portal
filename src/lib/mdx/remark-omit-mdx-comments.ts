import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

// MDX comments belong to the source, including when generating public Markdown.
// Code blocks and expressions that contain executable content remain intact.
export function remarkOmitMdxComments() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (
        (node.type === 'mdxFlowExpression' ||
          node.type === 'mdxTextExpression') &&
        node.data?.estree?.body.length === 0 &&
        parent &&
        index !== undefined
      ) {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };
}
