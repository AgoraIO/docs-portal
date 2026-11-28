import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

type SyntaxNode = {
  type: string;
  value?: string;
  children?: SyntaxNode[];
  data?: { [key: string]: unknown };
  position?: { start: { line: number } };
};

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMdx)
  .use(remarkDirective);

function markdownFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(root, entry.name);
    return entry.isDirectory()
      ? markdownFiles(file)
      : file.endsWith('.mdx')
        ? [file]
        : [];
  });
}

describe('published Web SDK TypeDoc metadata boundaries', () => {
  it.each(['web', 'react-sdk/web-sdk'])(
    'keeps version/deprecation notices separate from member prose in %s',
    (lane) => {
      const files = markdownFiles(
        path.resolve('content/docs/zh-CN/api-reference/rtc', lane),
      );
      const failures: string[] = [];
      let checked = 0;
      for (const file of files) {
        const body = readFileSync(file, 'utf8').replace(
          /^---\r?\n[\s\S]*?\r?\n---\r?\n/,
          '',
        );
        const tree = parser.parse(body);
        function visit(node: SyntaxNode) {
          if (node.type === 'containerDirective') {
            const children = node.children ?? [];
            const label = children.find((child) => child.data?.directiveLabel);
            const title = label?.children?.[0]?.value;
            if (title && ['自从', 'since', 'deprecated'].includes(title)) {
              checked++;
              const content = children.filter(
                (child) => !child.data?.directiveLabel,
              );
              if (content.length !== 1 || content[0].type !== 'paragraph') {
                failures.push(`${file}:${node.position?.start.line} ${title}`);
              }
            }
          }
          for (const child of node.children ?? []) visit(child);
        }
        visit(tree as unknown as SyntaxNode);
      }
      expect(checked).toBeGreaterThan(0);
      expect(failures).toEqual([]);
    },
  );
});
