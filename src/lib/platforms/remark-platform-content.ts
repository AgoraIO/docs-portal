import type { Root } from 'mdast';
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx';
import {
  createPlatformGroup,
  type PlatformGroupMode,
  type PlatformLeaf,
} from './mdx-groups';

const PLATFORM_COMPONENT_NAMES = new Map<string, PlatformGroupMode>([
  ['PlatformInline', 'inline'],
  ['PlatformStructured', 'structured'],
]);

type PlatformContentNode = MdxJsxFlowElement;

export function remarkPlatformContent() {
  return (tree: Root) => {
    const nextChildren: Root['children'] = [];

    for (let index = 0; index < tree.children.length; ) {
      const node = tree.children[index];
      const firstLeaf = toPlatformLeaf(node);

      if (!firstLeaf) {
        nextChildren.push(node);
        index += 1;
        continue;
      }

      const run: Array<{
        leaf: PlatformLeaf<PlatformContentNode>;
        node: PlatformContentNode;
      }> = [{ leaf: firstLeaf, node: firstLeaf.value }];

      let lookahead = index + 1;

      while (lookahead < tree.children.length) {
        const candidate = tree.children[lookahead];
        const leaf = toPlatformLeaf(candidate);

        if (!leaf) {
          break;
        }

        run.push({ leaf, node: leaf.value });
        lookahead += 1;
      }

      const group = createPlatformGroup(run.map((entry) => entry.leaf));

      nextChildren.push({
        type: 'mdxJsxFlowElement',
        name: '_PlatformTabsGroup',
        attributes: [
          createAttribute('groupMode', group.mode),
          createAttribute('canonicalPlatform', group.canonicalPlatform),
          createAttribute('platforms', JSON.stringify(group.platforms)),
        ],
        children: run.map(({ leaf, node }) => ({
          type: 'mdxJsxFlowElement',
          name: '_PlatformPanel',
          attributes: [createAttribute('platform', leaf.platform)],
          children: node.children,
        })),
      });

      index = lookahead;
    }

    tree.children = nextChildren;
  };
}

function createAttribute(name: string, value: string): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name,
    value,
  };
}

function toPlatformLeaf(node: Root['children'][number]): PlatformLeaf<PlatformContentNode> | null {
  if (node.type !== 'mdxJsxFlowElement') {
    return null;
  }

  if (typeof node.name !== 'string') {
    return null;
  }

  const mode = PLATFORM_COMPONENT_NAMES.get(node.name);

  if (!mode) {
    return null;
  }

  const platform = getStringAttribute(node.attributes, 'platform');

  if (platform === null) {
    throw new Error(`${node.name} requires a string platform attribute.`);
  }

  return {
    kind: 'platform',
    mode,
    platform,
    value: node,
  };
}

function getStringAttribute(
  attributes: MdxJsxFlowElement['attributes'],
  name: string,
): string | null {
  for (const attribute of attributes) {
    if (
      typeof attribute === 'object' &&
      attribute !== null &&
      'type' in attribute &&
      attribute.type === 'mdxJsxAttribute' &&
      'name' in attribute &&
      attribute.name === name &&
      'value' in attribute &&
      typeof attribute.value === 'string'
    ) {
      return attribute.value;
    }
  }

  return null;
}
