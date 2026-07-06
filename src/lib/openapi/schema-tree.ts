import { type OpenApiJsonValue, toOpenApiJsonValue } from './json';

const MAX_SCHEMA_DEPTH = 12;

export type OpenApiSchemaTreeNode = {
  children: OpenApiSchemaTreeNode[];
  defaultValue?: OpenApiJsonValue;
  deprecated?: boolean;
  description?: string;
  docsCallouts?: OpenApiSchemaCallout[];
  enumValues?: OpenApiJsonValue[];
  example?: OpenApiJsonValue;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  format?: string;
  maximum?: number;
  minimum?: number;
  name: string;
  nullable?: boolean;
  pattern?: string;
  path: string;
  readOnly?: boolean;
  required: boolean;
  type: string;
  writeOnly?: boolean;
};

export type OpenApiSchemaRow = Omit<OpenApiSchemaTreeNode, 'children'> & {
  depth: number;
};

export type OpenApiSchemaCallout = {
  markdown: string;
  position?: string;
  title?: string;
  type?: string;
};

export function buildOpenApiSchemaTree(
  schema: unknown,
  options: { document?: unknown; omitArrayItemWrapperRows?: boolean } = {},
): OpenApiSchemaTreeNode[] {
  return buildSchemaChildren(schema, {
    depth: 0,
    document: options.document,
    omitArrayItemWrapperRows: options.omitArrayItemWrapperRows === true,
    pathPrefix: '',
    requiredNames: new Set(),
    seen: new WeakSet(),
  });
}

export function buildOpenApiSchemaRows(
  schema: unknown,
  options: {
    document?: unknown;
    omitArrayItemWrapperRows?: boolean;
    usage?: 'request' | 'response';
  } = {},
): OpenApiSchemaRow[] {
  return buildOpenApiSchemaTree(schema, {
    document: options.document,
    omitArrayItemWrapperRows: options.omitArrayItemWrapperRows,
  })
    .flatMap((node) => flattenSchemaTreeNode(node, 0))
    .filter((row) => {
      if (options.usage === 'request') {
        return row.readOnly !== true;
      }

      if (options.usage === 'response') {
        return row.writeOnly !== true;
      }

      return true;
    });
}

export type OpenApiSchemaRowLayout = {
  hasChildren: boolean[];
  parentIndex: number[];
};

export function getOpenApiSchemaRowLayout(
  rows: Pick<OpenApiSchemaRow, 'depth'>[],
): OpenApiSchemaRowLayout {
  const hasChildren = rows.map(
    (row, index) =>
      index + 1 < rows.length && rows[index + 1].depth === row.depth + 1,
  );
  const parentIndex = rows.map((row, index) => {
    for (let candidate = index - 1; candidate >= 0; candidate -= 1) {
      if (rows[candidate].depth === row.depth - 1) {
        return candidate;
      }

      if (rows[candidate].depth < row.depth - 1) {
        return -1;
      }
    }

    return -1;
  });

  return { hasChildren, parentIndex };
}

type BuildContext = {
  depth: number;
  document?: unknown;
  omitArrayItemWrapperRows: boolean;
  pathPrefix: string;
  requiredNames: Set<string>;
  seen: WeakSet<object>;
};

function buildSchemaChildren(
  schema: unknown,
  context: BuildContext,
): OpenApiSchemaTreeNode[] {
  const resolvedSchema = resolveLocalReference(context.document, schema);

  if (!isRecord(resolvedSchema) || context.depth > MAX_SCHEMA_DEPTH) {
    return [];
  }

  if (context.seen.has(resolvedSchema)) {
    return [];
  }

  context.seen.add(resolvedSchema);

  const merged = mergeComposedSchemas(resolvedSchema, context.document);
  const properties = isRecord(merged.properties) ? merged.properties : {};
  const requiredNames = new Set(arrayOfStrings(merged.required));
  const nodes = Object.entries(properties).map(([name, childSchema]) =>
    buildSchemaNode(name, childSchema, {
      depth: context.depth + 1,
      document: context.document,
      omitArrayItemWrapperRows: context.omitArrayItemWrapperRows,
      pathPrefix: context.pathPrefix,
      requiredNames,
      seen: context.seen,
    }),
  );

  if (isRecord(merged.items)) {
    const itemNode = buildSchemaNode('items', merged.items, {
      depth: context.depth + 1,
      document: context.document,
      omitArrayItemWrapperRows: context.omitArrayItemWrapperRows,
      pathPrefix: context.pathPrefix,
      requiredNames: new Set(),
      seen: context.seen,
    });

    if (hasSchemaNodeDetails(itemNode)) {
      nodes.push(itemNode);
    } else if (context.omitArrayItemWrapperRows) {
      nodes.push(...itemNode.children);
    } else {
      nodes.push(itemNode);
    }
  }

  return nodes;
}

function buildSchemaNode(
  name: string,
  schema: unknown,
  context: BuildContext,
): OpenApiSchemaTreeNode {
  const resolvedSchema = resolveLocalReference(context.document, schema);
  const value = isRecord(resolvedSchema)
    ? mergeComposedSchemas(resolvedSchema, context.document)
    : {};
  const path = context.pathPrefix ? `${context.pathPrefix}.${name}` : name;
  const required = context.requiredNames.has(name);

  return {
    children: buildSchemaChildren(value, {
      depth: context.depth,
      document: context.document,
      omitArrayItemWrapperRows: context.omitArrayItemWrapperRows,
      pathPrefix: path,
      requiredNames: new Set(arrayOfStrings(value.required)),
      seen: context.seen,
    }),
    ...(value.default !== undefined
      ? { defaultValue: toOpenApiJsonValue(value.default) }
      : {}),
    ...(typeof value.deprecated === 'boolean'
      ? { deprecated: value.deprecated }
      : {}),
    ...(typeof value.description === 'string'
      ? { description: value.description }
      : {}),
    ...(getDocsCallouts(value).length > 0
      ? { docsCallouts: getDocsCallouts(value) }
      : {}),
    ...(Array.isArray(value.enum)
      ? { enumValues: value.enum.map(toOpenApiJsonValue) }
      : {}),
    ...(value.example !== undefined
      ? { example: toOpenApiJsonValue(value.example) }
      : {}),
    ...(typeof value.exclusiveMaximum === 'number'
      ? { exclusiveMaximum: value.exclusiveMaximum }
      : {}),
    ...(typeof value.exclusiveMinimum === 'number'
      ? { exclusiveMinimum: value.exclusiveMinimum }
      : {}),
    ...(typeof value.format === 'string' ? { format: value.format } : {}),
    ...(typeof value.maximum === 'number' ? { maximum: value.maximum } : {}),
    ...(typeof value.minimum === 'number' ? { minimum: value.minimum } : {}),
    name,
    ...(isNullable(value) ? { nullable: true } : {}),
    ...(typeof value.pattern === 'string' ? { pattern: value.pattern } : {}),
    path,
    ...(value.readOnly === true ? { readOnly: true } : {}),
    required,
    type: getSchemaType(value),
    ...(value.writeOnly === true ? { writeOnly: true } : {}),
  };
}

function hasSchemaNodeDetails(node: OpenApiSchemaTreeNode) {
  return (
    node.deprecated === true ||
    node.description !== undefined ||
    node.docsCallouts !== undefined ||
    node.enumValues !== undefined ||
    node.format !== undefined ||
    node.nullable === true ||
    node.pattern !== undefined ||
    node.readOnly === true ||
    node.writeOnly === true ||
    'defaultValue' in node ||
    'example' in node ||
    'exclusiveMaximum' in node ||
    'exclusiveMinimum' in node ||
    'maximum' in node ||
    'minimum' in node
  );
}

function getDocsCallouts(schema: Record<string, unknown>) {
  const callouts = schema['x-docs-callouts'];

  if (!Array.isArray(callouts)) {
    return [];
  }

  return callouts
    .filter(
      (callout): callout is Record<string, unknown> =>
        isRecord(callout) && typeof callout.markdown === 'string',
    )
    .map((callout) => ({
      markdown: callout.markdown as string,
      ...(typeof callout.position === 'string'
        ? { position: callout.position }
        : {}),
      ...(typeof callout.title === 'string' ? { title: callout.title } : {}),
      ...(typeof callout.type === 'string' ? { type: callout.type } : {}),
    }));
}

function flattenSchemaTreeNode(
  node: OpenApiSchemaTreeNode,
  depth: number,
): OpenApiSchemaRow[] {
  const { children, ...row } = node;

  return [
    {
      ...row,
      depth,
    },
    ...children.flatMap((child) => flattenSchemaTreeNode(child, depth + 1)),
  ];
}

function mergeComposedSchemas(
  schema: Record<string, unknown>,
  document?: unknown,
) {
  const originalSchema = isRecord(schema) ? schema : {};
  const resolvedSchema = resolveLocalReference(document, schema);
  const merged = isRecord(resolvedSchema)
    ? { ...resolvedSchema, ...originalSchema }
    : { ...originalSchema };
  delete merged.$ref;
  delete merged.allOf;
  delete merged.oneOf;
  delete merged.anyOf;

  for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
    const items = isRecord(resolvedSchema) ? resolvedSchema[key] : schema[key];
    if (!Array.isArray(items)) {
      continue;
    }

    for (const item of items) {
      if (!isRecord(item)) {
        continue;
      }

      const child = mergeComposedSchemas(item, document);
      for (const [childKey, childValue] of Object.entries(child)) {
        if (
          childKey === 'properties' ||
          childKey === 'required' ||
          childKey in merged
        ) {
          continue;
        }
        merged[childKey] = childValue;
      }
      merged.properties = {
        ...(isRecord(child.properties) ? child.properties : {}),
        ...(isRecord(merged.properties) ? merged.properties : {}),
      };
      merged.required = [
        ...arrayOfStrings(child.required),
        ...arrayOfStrings(merged.required),
      ];
    }
  }

  return merged;
}

function getSchemaType(schema: Record<string, unknown>) {
  if (typeof schema.type === 'string') {
    return schema.type;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.join(' | ');
  }

  if (Array.isArray(schema.enum)) {
    return 'enum';
  }

  if (isRecord(schema.properties)) {
    return 'object';
  }

  if (isRecord(schema.items)) {
    return 'array';
  }

  if (Array.isArray(schema.oneOf)) {
    return 'oneOf';
  }

  if (Array.isArray(schema.anyOf)) {
    return 'anyOf';
  }

  if (Array.isArray(schema.allOf)) {
    return 'allOf';
  }

  return 'unknown';
}

function isNullable(schema: Record<string, unknown>) {
  return (
    schema.nullable === true ||
    (Array.isArray(schema.type) && schema.type.includes('null'))
  );
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function resolveLocalReference(
  document: unknown,
  value: unknown,
  seenRefs = new Set<string>(),
): unknown {
  if (!isReferenceObject(value)) {
    return value;
  }

  const ref = value.$ref;

  if (!ref.startsWith('#/') || seenRefs.has(ref)) {
    return value;
  }

  seenRefs.add(ref);

  const resolved = ref
    .slice(2)
    .split('/')
    .reduce(
      (current: unknown, segment: string) =>
        isRecord(current)
          ? current[segment.replaceAll('~1', '/').replaceAll('~0', '~')]
          : undefined,
      document,
    );

  const { $ref: _ref, ...siblings } = value;
  const resolvedValue = resolveLocalReference(document, resolved, seenRefs);

  return isRecord(resolvedValue)
    ? {
        ...resolvedValue,
        ...siblings,
      }
    : resolvedValue;
}

function isReferenceObject(
  value: unknown,
): value is Record<string, unknown> & { $ref: string } {
  return isRecord(value) && typeof value.$ref === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
