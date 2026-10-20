import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';

const contentRoot = 'content/docs/zh-CN';
const pages = readdirSync(contentRoot, { recursive: true })
  .filter((name) => /release(?:-notes[^/]*)?\.mdx$/.test(String(name)))
  .map((name) => join(contentRoot, String(name)));
const parser = unified().use(remarkParse).use(remarkMdx);

describe('Chinese release histories', () => {
  it.each(pages)(
    'folds every version, including histories inside language tabs: %s',
    (file) => {
      const markdown = readFileSync(file, 'utf8').replace(
        /^---\n[\s\S]*?\n---/,
        '',
      );
      const tree = parser.parse(markdown);
      const versionDepth = file.includes('/extensions/web/release.mdx') ? 3 : 2;
      const unfolded: string[] = [];

      visit(tree, 'heading', (heading) => {
        const title = heading.children
          .map((node) => ('value' in node ? node.value : ''))
          .join('');
        if (heading.depth === versionDepth && /^\s*v?\d+\.\d+/i.test(title))
          unfolded.push(title);
      });

      expect(unfolded).toEqual([]);
    },
  );
});
