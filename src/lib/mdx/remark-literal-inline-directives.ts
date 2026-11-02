import type { Root, Text } from 'mdast';
import { SKIP, visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

// Documentation supports block admonitions, but no inline directive components.
// Restore their original spelling so ordinary times and API placeholders do not
// become unknown elements (a block <div> inside an inline paragraph).
export function remarkLiteralInlineDirectives() {
  return (tree: Root, file: VFile) => {
    const source = file.toString();
    visit(tree, 'textDirective', (node, index, parent) => {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (parent === undefined || index === undefined) return;
      if (start === undefined || end === undefined) {
        file.fail('Inline directives require source positions.', node);
      }
      const literal: Text = {
        type: 'text',
        value: source.slice(start, end),
        position: node.position,
      };
      parent.children[index] = literal;
      return SKIP;
    });
  };
}
