import { type OpenApiJsonValue, toOpenApiJsonValue } from './json';

const MAX_SCHEMA_DEPTH = 12;

export type OpenApiSchemaTreeNode = {
  children: OpenApiSchemaTreeNode[];
  defaultValue?: OpenApiJsonValue;
  deprecated?: boolean;
  description?: string;
  enumValues?: OpenApiJsonValue[];
  example?: OpenApiJsonValue;
  format?: string;
  maximum?: number;
  minimum?: number;
  name: string;
  nullable?: boolean;
  path: string;
  readOnly?: boolean;
  required: boolean;
  type: string;
  writeOnly?: boolean;
};

export type OpenApiSchemaRow = Omit<OpenApiSchemaTreeNode, 'children'> & {
  depth: number;
};

export function buildOpenApiSchemaTree(
  schema: unknown,
): OpenApiSchemaTreeNode[] {
  return buildSchemaChildren(schema, {
    depth: 0,
    pathPrefix: '',
    requiredNames: new Set(),
    seen: new WeakSet(),
  });
}

export function buildOpenApiSchemaRows(
  schema: unknown,
  options: { usage?: 'request' | 'response' } = {},
): OpenApiSchemaRow[] {
  return buildOpenApiSchemaTree(schema)
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

type BuildContext = {
  depth: number;
  pathPrefix: string;
  requiredNames: Set<string>;
  seen: WeakSet<object>;
};

function buildSchemaChildren(
  schema: unknown,
  context: BuildContext,
): OpenApiSchemaTreeNode[] {
  if (!isRecord(schema) || context.depth > MAX_SCHEMA_DEPTH) {
    return [];
  }

  if (context.seen.has(schema)) {
    return [];
  }

  context.seen.add(schema);

  const merged = mergeComposedSchemas(schema);
  const properties = isRecord(merged.properties) ? merged.properties : {};
  const requiredNames = new Set(arrayOfStrings(merged.required));
  const nodes = Object.entries(properties).map(([name, childSchema]) =>
    buildSchemaNode(name, childSchema, {
      depth: context.depth + 1,
      pathPrefix: context.pathPrefix,
      requiredNames,
      seen: context.seen,
    }),
  );

  if (isRecord(merged.items)) {
    nodes.push(
      buildSchemaNode('items', merged.items, {
        depth: context.depth + 1,
        pathPrefix: context.pathPrefix,
        requiredNames: new Set(),
        seen: context.seen,
      }),
    );
  }

  return nodes;
}

function buildSchemaNode(
  name: string,
  schema: unknown,
  context: BuildContext,
): OpenApiSchemaTreeNode {
  const value = isRecord(schema) ? mergeComposedSchemas(schema) : {};
  const path = context.pathPrefix ? `${context.pathPrefix}.${name}` : name;
  const required = context.requiredNames.has(name);

  return {
    children: buildSchemaChildren(value, {
      depth: context.depth,
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
    ...(Array.isArray(value.enum)
      ? { enumValues: value.enum.map(toOpenApiJsonValue) }
      : {}),
    ...(value.example !== undefined
      ? { example: toOpenApiJsonValue(value.example) }
      : {}),
    ...(typeof value.format === 'string' ? { format: value.format } : {}),
    ...(typeof value.maximum === 'number' ? { maximum: value.maximum } : {}),
    ...(typeof value.minimum === 'number' ? { minimum: value.minimum } : {}),
    name,
    ...(isNullable(value) ? { nullable: true } : {}),
    path,
    ...(value.readOnly === true ? { readOnly: true } : {}),
    required,
    type: getSchemaType(value),
    ...(value.writeOnly === true ? { writeOnly: true } : {}),
  };
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

function mergeComposedSchemas(schema: Record<string, unknown>) {
  const merged = { ...schema };

  for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
    const items = schema[key];
    if (!Array.isArray(items)) {
      continue;
    }

    for (const item of items) {
      if (!isRecord(item)) {
        continue;
      }

      const child = mergeComposedSchemas(item);
      Object.assign(merged, child, {
        properties: {
          ...(isRecord(merged.properties) ? merged.properties : {}),
          ...(isRecord(child.properties) ? child.properties : {}),
        },
        required: [
          ...arrayOfStrings(merged.required),
          ...arrayOfStrings(child.required),
        ],
      });
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
