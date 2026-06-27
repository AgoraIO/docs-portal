import type { Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';
import {
  createPlatformGroup,
  type PlatformGroupMode,
  type PlatformLeaf,
} from './mdx-groups';
import { normalizePlatformKey } from './registry';

const PLATFORM_COMPONENT_NAMES = new Map<string, PlatformGroupMode>([
  ['PlatformInline', 'inline'],
  ['PlatformStructured', 'structured'],
]);

type PlatformContentNode = MdxJsxFlowElement;

export function remarkPlatformContent() {
  return (tree: Root) => {
    visit(tree, (node, _index, parent) => {
      if (
        node.type === 'mdxJsxFlowElement' &&
        typeof node.name === 'string' &&
        PLATFORM_COMPONENT_NAMES.has(node.name) &&
        parent?.type !== 'root'
      ) {
        throw new Error(
          `${node.name} is only supported at the top-level page flow in v1.`,
        );
      }
    });

    groupPlatformBlocks(tree);
  };
}

// Groups consecutive Platform* blocks among a root's direct children into a
// single `_PlatformTabsGroup`. fumadocs `remarkInclude` runs before this plugin
// and splices an `<include>`d file in as a nested `{ type: 'root', children }`
// node; platform blocks are top-level within that included file, so we recurse
// into embedded roots first, otherwise their blocks survive untransformed and
// the runtime stub component crashes the whole page.
function groupPlatformBlocks(root: Root): void {
  for (const child of root.children) {
    // `remarkInclude` splices included files in as nested `root` nodes, which
    // are not part of mdast's `RootContent` union — hence the cast.
    if ((child as { type: string }).type === 'root') {
      groupPlatformBlocks(child as unknown as Root);
    }
  }

  const nextChildren: Root['children'] = [];

  for (let index = 0; index < root.children.length; ) {
    const node = root.children[index];
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

    while (lookahead < root.children.length) {
      const candidate = root.children[lookahead];
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
        createAttribute('showTabs', group.showTabs ? 'true' : 'false'),
      ],
      children: run.map(({ leaf, node }) => ({
        type: 'mdxJsxFlowElement',
        name: '_PlatformPanel',
        attributes: [createAttribute('platform', leaf.platform)],
        children: [
          {
            type: 'mdxJsxFlowElement',
            name: '_PlatformProcessedMarker',
            attributes: [
              createAttribute('groupMode', group.mode),
              createAttribute('canonicalPlatform', group.canonicalPlatform),
              createAttribute('platform', leaf.platform),
            ],
            children: [],
          },
          ...node.children,
          {
            type: 'mdxJsxFlowElement',
            name: '_PlatformProcessedMarker',
            attributes: [createAttribute('close', 'true')],
            children: [],
          },
        ],
      })),
    });

    index = lookahead;
  }

  root.children = nextChildren;
}

function createAttribute(name: string, value: string): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name,
    value,
  };
}

function toPlatformLeaf(
  node: Root['children'][number],
): PlatformLeaf<PlatformContentNode> | null {
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
    platform: normalizePlatformKey(platform),
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
