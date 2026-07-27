import type { Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

export function remarkNormalizeLegacyHeadingAnchors() {
  return (tree: Root) => {
    processFlowContainer(tree);
  };
}

type FlowContainer = Root | MdxJsxFlowElement;
type FlowChild = FlowContainer['children'][number];

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
