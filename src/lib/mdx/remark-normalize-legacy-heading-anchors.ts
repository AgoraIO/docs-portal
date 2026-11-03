import { slug } from 'github-slugger';
import type { Nodes, Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

export function remarkNormalizeLegacyHeadingAnchors() {
  return (tree: Root) => {
    processFlowContainer(tree);
    visitNodes(tree, (node) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === '_PlatformPanel') {
        normalizePlatformHeadingLinks(node);
      }
    });
  };
}

type FlowContainer = Root | MdxJsxFlowElement;
type FlowChild = FlowContainer['children'][number];

// Fumadocs assigns globally unique heading IDs before this plugin runs. A
// local reference copied from a single-platform page must use its own panel's
// suffixed ID, while explicit anchors and links outside that panel stay intact.
function normalizePlatformHeadingLinks(panel: MdxJsxFlowElement) {
  const ids = new Set<string>();
  const headings = new Map<string, Set<string>>();
  visitNodes(panel, (node) => {
    if (node.type === 'heading') {
      const id = node.data?.hProperties?.id;
      if (typeof id !== 'string') return;
      ids.add(id);
      const key = slug(headingText(node));
      const matches = headings.get(key) ?? new Set<string>();
      matches.add(id);
      headings.set(key, matches);
    } else if (
      node.type === 'mdxJsxFlowElement' ||
      node.type === 'mdxJsxTextElement'
    ) {
      for (const attribute of node.attributes) {
        if (
          attribute.type === 'mdxJsxAttribute' &&
          attribute.name === 'id' &&
          typeof attribute.value === 'string'
        ) {
          ids.add(attribute.value);
        }
      }
    }
  });
  visitNodes(panel, (node) => {
    if (node.type !== 'link' || !node.url.startsWith('#')) return;
    let key: string;
    try {
      key = decodeURIComponent(node.url.slice(1));
    } catch {
      return;
    }
    if (ids.has(key)) return;
    const matches = headings.get(key);
    if (matches?.size === 1) node.url = `#${[...matches][0]}`;
  });
}

function headingText(node: Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  return 'children' in node
    ? node.children.map((child) => headingText(child as Nodes)).join('')
    : '';
}

function visitNodes(node: Nodes, visitor: (node: Nodes) => void) {
  visitor(node);
  if ('children' in node) {
    for (const child of node.children) visitNodes(child as Nodes, visitor);
  }
}

function processFlowContainer(container: FlowContainer) {
  for (let index = 0; index < container.children.length; index += 1) {
    const node = container.children[index];

    if (node.type === 'mdxJsxFlowElement') {
      processFlowContainer(node);
    }

    const anchorIds = getAnchorRun(container.children, index);

    if (anchorIds.length === 0) {
      continue;
    }

    const headings = container.children.slice(
      index + anchorIds.length,
      index + anchorIds.length * 2,
    );
    const hasUnambiguousHeadingRun =
      headings.length === anchorIds.length &&
      headings.every(
        (heading, headingIndex) =>
          heading.type === 'heading' &&
          canAdoptAnchorId(heading, anchorIds[headingIndex]),
      );

    if (!hasUnambiguousHeadingRun) {
      index += anchorIds.length - 1;
      continue;
    }

    headings.forEach((heading, headingIndex) => {
      if (heading.type !== 'heading') {
        return;
      }

      heading.data = {
        ...heading.data,
        hProperties: {
          ...heading.data?.hProperties,
          id: anchorIds[headingIndex],
        },
      };
    });
    container.children.splice(index, anchorIds.length);
    index -= 1;
  }
}

function canAdoptAnchorId(
  heading: Extract<FlowChild, { type: 'heading' }>,
  anchorId: string,
) {
  const existingId = heading.data?.hProperties?.id;
  const explicitId = getExplicitHeadingId(heading);

  return (
    (!existingId || existingId === anchorId) &&
    (!explicitId || explicitId === anchorId)
  );
}

function getExplicitHeadingId(
  heading: Extract<FlowChild, { type: 'heading' }>,
) {
  const lastChild = heading.children.at(-1);

  if (lastChild?.type !== 'text') {
    return undefined;
  }

  return /\s*\[#([\s\S]+?)]\s*$/.exec(lastChild.value)?.[1];
}

function getAnchorRun(children: FlowChild[], startIndex: number) {
  const ids: string[] = [];

  for (let index = startIndex; index < children.length; index += 1) {
    const id = getEmptyAnchorId(children[index]);

    if (!id) {
      break;
    }

    ids.push(id);
  }

  return ids;
}

function getEmptyAnchorId(node: FlowChild): string | undefined {
  if (!isEmptyAnchor(node)) {
    return undefined;
  }

  if (node.attributes.length !== 1) {
    return undefined;
  }

  const [idAttribute] = node.attributes;

  if (idAttribute.type !== 'mdxJsxAttribute' || idAttribute.name !== 'id') {
    return undefined;
  }

  return typeof idAttribute?.value === 'string' ? idAttribute.value : undefined;
}

function isEmptyAnchor(node: FlowChild): node is MdxJsxFlowElement {
  return (
    node.type === 'mdxJsxFlowElement' &&
    node.name === 'a' &&
    node.children.length === 0
  );
}
