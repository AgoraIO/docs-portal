import type { Html, List, ListItem, Root, Table, TableCell } from 'mdast';
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

const SLOT_COMPONENT_NAME = 'Slot';

type SlotDefinition = {
  children: FlowChild[];
  consumed: boolean;
};

type SlotPlaceholder = {
  cell: TableCell;
  syntax: 'html' | 'mdx';
  name: string;
};

type FlowChild =
  | Root['children'][number]
  | MdxJsxFlowElement['children'][number]
  | ListItem['children'][number];

type FlowContainer = {
  children: FlowChild[];
};

type ParsedHtmlSlot = {
  kind: 'closing' | 'opening' | 'selfClosing';
  name: string | null;
  target: string | null;
};

class UnsupportedRawSlotDefinitionError extends Error {}

export function remarkTableSlots() {
  return (tree: Root) => {
    validateSlotUsage(tree);
    processFlowContainer(tree);
  };
}

function validateSlotUsage(tree: Root) {
  visit(tree, (node, _index, parent) => {
    if (!isMdxJsxSlotNode(node)) {
      return;
    }

    const name = getSlotAttribute(node, 'name');
    const target = getSlotAttribute(node, 'for');

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

    if (name && !isInlineSlotPlaceholderNode(node)) {
      throw new Error(
        '<Slot name="..."> is only supported as an inline table cell placeholder.',
      );
    }

    if (name && !isTableCell(parent)) {
      throw new Error('<Slot name="..."> must be used inside a table cell.');
    }

    if (target && !isFlowSlotDefinitionStartNode(node)) {
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

    const rawHtmlOnly = placeholders.every(
      (placeholder) => placeholder.syntax === 'html',
    );
    let collectedDefinitions: ReturnType<typeof collectAdjacentDefinitions>;

    try {
      collectedDefinitions = collectAdjacentDefinitions(
        container.children,
        index + 1,
      );
    } catch (error) {
      if (rawHtmlOnly && error instanceof UnsupportedRawSlotDefinitionError) {
        nextChildren.push(node);
        continue;
      }

      throw error;
    }

    const { definitions, endIndex } = collectedDefinitions;

    if (
      rawHtmlOnly &&
      !hasDefinitionsForEveryPlaceholder(placeholders, definitions)
    ) {
      nextChildren.push(node);
      continue;
    }

    applySlotDefinitions(placeholders, definitions);
    ensureNoUnusedDefinitions(definitions);

    nextChildren.push(node);
    index = endIndex - 1;
  }

  const orphanDefinition = nextChildren.find(isMdxJsxSlotDefinitionStart);

  if (orphanDefinition) {
    throw new Error(
      `Slot definition "${getRequiredSlotAttribute(
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
        name: getRequiredSlotAttribute(slotNodes[0], 'name'),
        syntax: isMdxJsxSlotNode(slotNodes[0]) ? 'mdx' : 'html',
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
    const definition = readSlotDefinition(children, index);

    if (!definition) {
      break;
    }

    const { children: definitionChildren, endIndex, name } = definition;

    if (definitions.has(name)) {
      throw new Error(
        `Duplicate slot definition "${name}" after the same table.`,
      );
    }

    definitions.set(name, {
      children: definitionChildren,
      consumed: false,
    });
    index = endIndex;
  }

  return {
    definitions,
    endIndex: index,
  };
}

function readSlotDefinition(
  children: FlowContainer['children'],
  index: number,
) {
  const node = children[index];

  if (!isSlotDefinitionStart(node)) {
    return null;
  }

  const name = getRequiredSlotAttribute(node, 'for');

  if (isMdxJsxSlotNode(node)) {
    return {
      children: node.children,
      endIndex: index + 1,
      name,
    };
  }

  const definitionChildren: FlowChild[] = [];
  let cursor = index + 1;

  while (cursor < children.length && !isSlotHtmlClosingNode(children[cursor])) {
    if (isUnsafeSlotHtmlClosingNode(children[cursor])) {
      throw new UnsupportedRawSlotDefinitionError(
        `Slot definition "${name}" has unsupported raw Markdown after its closing </Slot> tag.`,
      );
    }

    if (isSlotDefinitionStart(children[cursor])) {
      throw new Error(
        `Slot definition "${name}" is missing a closing </Slot> tag.`,
      );
    }

    definitionChildren.push(children[cursor]);
    cursor += 1;
  }

  if (cursor >= children.length) {
    throw new Error(
      `Slot definition "${name}" is missing a closing </Slot> tag.`,
    );
  }

  return {
    children: definitionChildren,
    endIndex: cursor + 1,
    name,
  };
}

function hasDefinitionsForEveryPlaceholder(
  placeholders: SlotPlaceholder[],
  definitions: Map<string, SlotDefinition>,
) {
  return placeholders.every((placeholder) => definitions.has(placeholder.name));
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

    placeholder.cell.children = cloneChildren(definition.children);
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

function cloneChildren(children: FlowChild[]) {
  return children.map((child) =>
    structuredClone(child),
  ) as TableCell['children'];
}

function isSlotPlaceholder(
  node: TableCell['children'][number],
): node is Html | MdxJsxTextElement {
  return (
    isInlineSlotPlaceholderNode(node) && getSlotAttribute(node, 'name') !== null
  );
}

function isSlotDefinitionStart(
  node: FlowChild,
): node is Html | MdxJsxFlowElement {
  return (
    isFlowSlotDefinitionStartNode(node) &&
    getSlotAttribute(node, 'for') !== null
  );
}

function isMdxJsxSlotDefinitionStart(
  node: FlowChild,
): node is MdxJsxFlowElement {
  return (
    isMdxJsxSlotNode(node) &&
    node.type === 'mdxJsxFlowElement' &&
    getSlotAttribute(node, 'for') !== null
  );
}

function isFlowSlotDefinitionStartNode(
  node: unknown,
): node is Html | MdxJsxFlowElement {
  return (
    (isMdxJsxSlotNode(node) && node.type === 'mdxJsxFlowElement') ||
    isSlotHtmlOpeningNode(node)
  );
}

function isMdxJsxSlotNode(
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

function isSlotHtmlOpeningNode(node: unknown): node is Html {
  const parsed = parseSlotHtml(node);

  return parsed?.kind === 'opening';
}

function isSlotHtmlClosingNode(node: unknown): node is Html {
  const parsed = parseSlotHtml(node);

  return parsed?.kind === 'closing';
}

function isUnsafeSlotHtmlClosingNode(node: unknown): node is Html {
  if (!isHtml(node)) {
    return false;
  }

  const value = node.value.trim();

  return value.startsWith('</Slot>') && !/^<\/Slot\s*>$/.test(value);
}

function isInlineSlotPlaceholderNode(
  node: unknown,
): node is Html | MdxJsxTextElement {
  if (isMdxJsxSlotNode(node)) {
    return node.type === 'mdxJsxTextElement';
  }

  const parsed = parseSlotHtml(node);

  return parsed?.kind === 'selfClosing';
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

function getRequiredSlotAttribute(
  node: Html | MdxJsxFlowElement | MdxJsxTextElement,
  name: string,
) {
  const value = getSlotAttribute(node, name);

  if (value === null) {
    throw new Error(`Slot requires a string "${name}" attribute.`);
  }

  return value;
}

function getSlotAttribute(
  node: Html | MdxJsxFlowElement | MdxJsxTextElement,
  name: string,
) {
  if (isMdxJsxSlotNode(node)) {
    return getStringAttribute(node.attributes, name);
  }

  const parsed = parseSlotHtml(node);

  if (!parsed) {
    return null;
  }

  return name === 'name' ? parsed.name : parsed.target;
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

function parseSlotHtml(node: unknown): ParsedHtmlSlot | null {
  if (!isHtml(node)) {
    return null;
  }

  const value = node.value.trim();

  if (/^<\/Slot\s*>$/.test(value)) {
    return {
      kind: 'closing',
      name: null,
      target: null,
    };
  }

  const match = /^<Slot\b([\s\S]*?)(\/?)>$/.exec(value);

  if (!match) {
    return null;
  }

  const attributes = match[1];

  return {
    kind: match[2] === '/' ? 'selfClosing' : 'opening',
    name: getHtmlStringAttribute(attributes, 'name'),
    target: getHtmlStringAttribute(attributes, 'for'),
  };
}

function isHtml(node: unknown): node is Html {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'html' &&
    'value' in node &&
    typeof node.value === 'string'
  );
}

function getHtmlStringAttribute(attributes: string, name: string) {
  const match = new RegExp(
    String.raw`(?:^|\s)${name}\s*=\s*(["'])(.*?)\1`,
  ).exec(attributes);

  return match?.[2] ?? null;
}
