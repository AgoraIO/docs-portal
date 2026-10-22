import { readFileSync } from 'node:fs';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import fixtures from './fixtures/cn-image-parity.json';

// Reviewed legacy sizes, intentionally limited to 44 inline icons and the
// 19 explicitly sized screenshots in RTC run-demo. No global asset defaults.
const parser = unified().use(remarkParse).use(remarkMdx);
const trees = new Map(
  [...new Set(fixtures.map((fixture) => fixture.file))].map((file) => [
    file,
    parser.parse(readFileSync(`content/docs/zh-CN/${file}`, 'utf8')),
  ]),
);

describe('reviewed Chinese image sizing', () => {
  it.each(fixtures)('$file preserves $component for $src', (fixture) => {
    const matches: Record<string, string>[] = [];
    let markdownCopies = 0;
    const tree = trees.get(fixture.file);
    if (!tree) throw new Error(`Missing parsed document: ${fixture.file}`);

    visit(tree, (node) => {
      if (node.type === 'image' && node.url === fixture.src) markdownCopies++;
      if (
        node.type !== 'mdxJsxTextElement' &&
        node.type !== 'mdxJsxFlowElement'
      )
        return;
      if (node.name !== fixture.component) return;
      const attributes: Record<string, string> = {};
      for (const attribute of node.attributes) {
        if (attribute.type !== 'mdxJsxAttribute') continue;
        const value = attribute.value;
        if (typeof value === 'string') attributes[attribute.name] = value;
        else if (value) attributes[attribute.name] = value.value;
      }
      if (attributes.src === fixture.src) matches.push(attributes);
    });

    expect(markdownCopies, 'image must not fall back to unsized Markdown').toBe(
      0,
    );
    expect(matches).toHaveLength(fixture.count);
    for (const attributes of matches) {
      expect(
        attributes.alt?.trim(),
        'image needs meaningful alt text',
      ).toBeTruthy();
      for (const dimension of [
        'width',
        'height',
        'displayWidth',
        'displayHeight',
      ] as const) {
        if (dimension in fixture) {
          expect(attributes[dimension]).toBe(String(fixture[dimension]));
        } else {
          expect(attributes[dimension]).toBeUndefined();
        }
      }
    }
  });
});
