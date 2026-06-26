import type { List, ListItem, Root, Table, TableCell } from 'mdast';
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

const SLOT_COMPONENT_NAME = 'Slot';

type SlotDefinition = {
  consumed: boolean;
  node: MdxJsxFlowElement;
};

type SlotPlaceholder = {
  cell: TableCell;
  name: string;
};

type FlowChild =
  | Root['children'][number]
  | MdxJsxFlowElement['children'][number]
  | ListItem['children'][number];

type FlowContainer = {
  children: FlowChild[];
};

export function remarkTableSlots() {
  return (tree: Root) => {
    validateSlotUsage(tree);
    processFlowContainer(tree);
  };
}

function validateSlotUsage(tree: Root) {
  visit(tree, (node, _index, parent) => {
    if (!isSlotNode(node)) {
      return;
    }

    const name = getStringAttribute(node.attributes, 'name');
    const target = getStringAttribute(node.attributes, 'for');

    if (name && target) {
      throw new Error(
        'Slot usage is ambiguous: use either <Slot name="..." /> in a table cell or <Slot for="...">...</Slot> after the table, not both.',
      );
    }

    if (!name && !target) {
      throw new Error(
        'Slot requires either a string "name" attribute for a table placeholder or a string "for" attribute for a slot definition.',
      );
    }

    if (name && node.type !== 'mdxJsxTextElement') {
      throw new Error(
        '<Slot name="..."> is only supported as an inline table cell placeholder.',
      );
    }

    if (name && !isTableCell(parent)) {
      throw new Error('<Slot name="..."> must be used inside a table cell.');
    }

    if (target && node.type !== 'mdxJsxFlowElement') {
      throw new Error(
        '<Slot for="..."> must be a block definition placed immediately after a table.',
      );
    }

    if (target && !isFlowContainer(parent)) {
      throw new Error(
        '<Slot for="..."> must be placed as a flow sibling immediately after its table.',
      );
    }
  });
}

function processFlowContainer(container: FlowContainer) {
  const nextChildren: typeof container.children = [];

  for (let index = 0; index < container.children.length; index += 1) {
    const node = container.children[index];

    if (isList(node)) {
      for (const listItem of node.children) {
        processFlowContainer(listItem);
      }
    } else if (isFlowContainer(node)) {
      processFlowContainer(node);
    }

    if (node.type !== 'table') {
      nextChildren.push(node);
      continue;
    }

    const placeholders = collectTablePlaceholders(node);

    if (placeholders.length === 0) {
      nextChildren.push(node);
      continue;
    }

    const { definitions, endIndex } = collectAdjacentDefinitions(
      container.children,
      index + 1,
    );

    applySlotDefinitions(placeholders, definitions);
    ensureNoUnusedDefinitions(definitions);

    nextChildren.push(node);
    index = endIndex - 1;
  }

  const orphanDefinition = nextChildren.find(isSlotDefinition);

  if (orphanDefinition) {
    throw new Error(
      `Slot definition "${getRequiredStringAttribute(
        orphanDefinition,
        'for',
      )}" must appear immediately after the table that references it.`,
    );
  }

  container.children = nextChildren;
}

function collectTablePlaceholders(table: Table) {
  const placeholders: SlotPlaceholder[] = [];

  for (const row of table.children) {
    for (const cell of row.children) {
      const slotNodes = cell.children.filter(isSlotPlaceholder);

      if (slotNodes.length === 0) {
        continue;
      }

      if (slotNodes.length > 1 || cell.children.length > slotNodes.length) {
        throw new Error(
          'A table slot placeholder cell must contain only one <Slot name="..." /> element.',
        );
      }

      placeholders.push({
        cell,
        name: getRequiredStringAttribute(slotNodes[0], 'name'),
      });
    }
  }

  return placeholders;
}

function collectAdjacentDefinitions(
  children: FlowContainer['children'],
  startIndex: number,
) {
  const definitions = new Map<string, SlotDefinition>();
  let index = startIndex;

  while (index < children.length) {
    const node = children[index];

    if (!isSlotDefinition(node)) {
      break;
    }

    const name = getRequiredStringAttribute(node, 'for');

    if (definitions.has(name)) {
      throw new Error(
        `Duplicate slot definition "${name}" after the same table.`,
      );
    }

    definitions.set(name, {
      consumed: false,
      node,
    });
    index += 1;
  }

  return {
    definitions,
    endIndex: index,
  };
}

function applySlotDefinitions(
  placeholders: SlotPlaceholder[],
  definitions: Map<string, SlotDefinition>,
) {
  for (const placeholder of placeholders) {
    const definition = definitions.get(placeholder.name);

    if (!definition) {
      throw new Error(
        `Missing slot definition "${placeholder.name}" for table placeholder.`,
      );
    }

    placeholder.cell.children = cloneChildren(definition.node.children);
    definition.consumed = true;
  }
}

function ensureNoUnusedDefinitions(definitions: Map<string, SlotDefinition>) {
  for (const [name, definition] of definitions) {
    if (!definition.consumed) {
      throw new Error(
        `Unused slot definition "${name}" after table. Remove it or add a matching <Slot name="${name}" /> placeholder.`,
      );
    }
  }
}

function cloneChildren(children: MdxJsxFlowElement['children']) {
  return children.map((child) =>
    structuredClone(child),
  ) as TableCell['children'];
}

function isSlotPlaceholder(
  node: TableCell['children'][number],
): node is MdxJsxTextElement {
  return (
    node.type === 'mdxJsxTextElement' &&
    node.name === SLOT_COMPONENT_NAME &&
    getStringAttribute(node.attributes, 'name') !== null
  );
}

function isSlotDefinition(node: FlowChild): node is MdxJsxFlowElement {
  return (
    node.type === 'mdxJsxFlowElement' &&
    node.name === SLOT_COMPONENT_NAME &&
    getStringAttribute(node.attributes, 'for') !== null
  );
}

function isSlotNode(
  node: unknown,
): node is MdxJsxFlowElement | MdxJsxTextElement {
  if (typeof node !== 'object' || node === null) {
    return false;
  }

  if (!('type' in node) || !('name' in node)) {
    return false;
  }

  return (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    node.name === SLOT_COMPONENT_NAME
  );
}

function isTableCell(node: unknown): node is TableCell {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'tableCell'
  );
}

function isList(node: unknown): node is List {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'list'
  );
}

function isFlowContainer(node: unknown): node is FlowContainer {
  return (
    typeof node === 'object' &&
    node !== null &&
    'children' in node &&
    Array.isArray(node.children) &&
    ('type' in node
      ? ['root', 'mdxJsxFlowElement', 'listItem'].includes(String(node.type))
      : true)
  );
}

function getRequiredStringAttribute(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  name: string,
) {
  const value = getStringAttribute(node.attributes, name);

  if (value === null) {
    throw new Error(`Slot requires a string "${name}" attribute.`);
  }

  return value;
}

function getStringAttribute(
  attributes: Array<MdxJsxAttribute | unknown>,
  name: string,
) {
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
