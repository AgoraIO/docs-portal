import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

// The authoring contract supports container callouts. Ordinary prose such as
// 21:9 or mailto:support must not become empty inline/leaf directive elements.
export function remarkLiteralDirectives() {
  return (tree: Root, file: VFile) => {
    const source = file.toString();
    visit(tree, ['textDirective', 'leafDirective'], (node) => {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (start === undefined || end === undefined) return;
      const value = source.slice(start, end);
      if (node.type === 'textDirective') {
        Object.assign(node, { type: 'text', value });
        Reflect.deleteProperty(node, 'children');
      } else {
        Object.assign(node, {
          type: 'paragraph',
          children: [{ type: 'text', value }],
        });
      }
    });
  };
}
