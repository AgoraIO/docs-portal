import type { Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const parser = unified().use(remarkParse).use(remarkMdx);

export function addAccordionHeadingsToTocText(markdown: string) {
  if (!markdown.includes('<Accordion')) {
    return markdown;
  }

  const insertions: { offset: number; heading: string }[] = [];
  let tree: ReturnType<typeof parser.parse>;

  try {
    tree = parser.parse(markdown);
  } catch {
    return markdown;
  }

  visit(tree, 'mdxJsxFlowElement', (node) => {
    if (node.position?.start.offset === undefined) {
      return;
    }

    const version = getAccordionVersion(node);
    if (!version) {
      return;
    }

    insertions.push({
      offset: node.position.start.offset,
      heading: `\n\n${'#'.repeat(version.depth)} ${version.title} [#${version.id}]\n\n`,
    });
  });

  for (const { offset, heading } of insertions.reverse()) {
    markdown = markdown.slice(0, offset) + heading + markdown.slice(offset);
  }

  return markdown;
}

export function remarkAccordionHeadings() {
  return (tree: Root) => {
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (index === undefined || !parent) {
        return;
      }

      const version = getAccordionVersion(node);
      if (!version) {
        return;
      }

      parent.children.splice(index, 0, {
        type: 'heading',
        depth: version.depth,
        children: [{ type: 'text', value: version.title }],
        data: { hProperties: { id: version.id } },
      });
      return index + 2;
    });
  };
}

function getAccordionVersion(node: MdxJsxFlowElement) {
  if (node.name !== 'Accordion') {
    return undefined;
  }

  const headingLevel = getHeadingLevel(node);
  const id = getStaticAttribute(node, 'id');
  const title = getStaticAttribute(node, 'title');

  if (!headingLevel || !id || !title) {
    return undefined;
  }

  return {
    depth: Math.min(headingLevel + 1, 4) as 3 | 4,
    id,
    title,
  };
}

function getHeadingLevel(node: MdxJsxFlowElement) {
  const attribute = node.attributes.find(
    (candidate) =>
      candidate.type === 'mdxJsxAttribute' && candidate.name === 'headingLevel',
  );
  const value = attribute?.value;
  const text = typeof value === 'string' ? value : value?.value;
  const number = Number(text);

  return Number.isInteger(number) && number >= 2 && number <= 4
    ? number
    : undefined;
}

function getStaticAttribute(node: MdxJsxFlowElement, name: string) {
  const attribute = node.attributes.find(
    (candidate) =>
      candidate.type === 'mdxJsxAttribute' && candidate.name === name,
  );

  return typeof attribute?.value === 'string' ? attribute.value : undefined;
}
