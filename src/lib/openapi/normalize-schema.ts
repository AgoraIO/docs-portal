const SCHEMA_MAPS = new Set([
  '$defs',
  'definitions',
  'properties',
  'patternProperties',
  'dependentSchemas',
]);
const SCHEMA_LISTS = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems']);
const SCHEMA_VALUES = new Set([
  'additionalProperties',
  'unevaluatedProperties',
  'propertyNames',
  'items',
  'additionalItems',
  'contains',
  'unevaluatedItems',
  'not',
  'if',
  'then',
  'else',
  'contentSchema',
]);

export function hasOpenApiSchemaTypeExpression(
  schema: Record<string, unknown>,
) {
  return [
    'type',
    '$ref',
    'enum',
    'const',
    'allOf',
    'anyOf',
    'oneOf',
    'not',
  ].some((key) => schema[key] !== undefined);
}

/** Resolve schema references without interpreting property names or literal data as keywords. */
export function normalizeOpenApiSchema(
  root: unknown,
  {
    document,
    booleanSources = new WeakMap<object, boolean>(),
    normalizeAnnotations = true,
  }: {
    document?: unknown;
    booleanSources?: WeakMap<object, boolean>;
    normalizeAnnotations?: boolean;
  } = {},
): unknown {
  const schemas = new WeakMap<object, unknown>();
  const maps = new WeakMap<object, unknown>();
  const literals = new WeakMap<object, unknown>();
  const activeSchemas = new WeakSet<object>();

  function annotations(output: Record<string, unknown>) {
    if (normalizeAnnotations) {
      if (output.example !== undefined && output.examples === undefined)
        output.examples = [literal(output.example)];
      if (output.nullable === true && typeof output.type === 'string')
        output.type = [output.type, 'null'];
    }
    return output;
  }

  function literal(value: unknown): unknown {
    if (typeof value !== 'object' || value === null) return value;
    if (literals.has(value)) return literals.get(value);
    if (Array.isArray(value)) {
      const output: unknown[] = [];
      literals.set(value, output);
      output.push(...value.map(literal));
      return output;
    }
    const output: Record<string, unknown> = Object.create(null);
    literals.set(value, output);
    for (const [key, item] of Object.entries(value))
      output[key] = literal(item);
    return output;
  }

  function schemaMap(value: unknown, refs: Set<string>): unknown {
    if (!isRecord(value)) return literal(value);
    if (maps.has(value)) return maps.get(value);
    const output: Record<string, unknown> = Object.create(null);
    maps.set(value, output);
    for (const [name, schema] of Object.entries(value))
      output[name] = normalize(schema, refs);
    return output;
  }

  function keyword(key: string, value: unknown, refs: Set<string>): unknown {
    if (SCHEMA_MAPS.has(key)) return schemaMap(value, refs);
    if (SCHEMA_LISTS.has(key) && Array.isArray(value))
      return value.map((item) => normalize(item, refs));
    if (SCHEMA_VALUES.has(key)) {
      // Older JSON Schema drafts allow tuple items; names inside required/enum remain literal.
      return Array.isArray(value)
        ? value.map((item) => normalize(item, refs))
        : normalize(value, refs);
    }
    if (key === 'dependencies' && isRecord(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([name, item]) => [
          name,
          Array.isArray(item) ? literal(item) : normalize(item, refs),
        ]),
      );
    }
    return literal(value);
  }

  function normalize(value: unknown, refs: Set<string>): unknown {
    if (!isRecord(value)) return literal(value);
    if (schemas.has(value)) return schemas.get(value);
    if (typeof value.$ref === 'string' && !refs.has(value.$ref)) {
      const target = localTarget(value.$ref, document) ?? value['$ref-value'];
      if (
        target !== undefined &&
        !(isRecord(target) && activeSchemas.has(target))
      ) {
        const resolved = normalize(target, new Set(refs).add(value.$ref));
        const siblings = Object.entries(value).filter(
          ([key]) => key !== '$ref' && key !== '$ref-value',
        );
        if (typeof resolved === 'boolean' && siblings.length === 0) {
          schemas.set(value, resolved);
          return resolved;
        }
        const output: Record<string, unknown> = Object.assign(
          Object.create(null),
          isRecord(resolved) ? resolved : {},
        );
        schemas.set(value, output);
        for (const [key, item] of siblings)
          output[key] = keyword(key, item, refs);
        const sourceBoolean =
          typeof resolved === 'boolean'
            ? resolved
            : isRecord(resolved)
              ? booleanSources.get(resolved)
              : undefined;
        if (sourceBoolean === false) {
          output.not = true;
          booleanSources.set(output, false);
        } else if (
          sourceBoolean === true &&
          !hasOpenApiSchemaTypeExpression(output)
        ) {
          booleanSources.set(output, true);
        }
        return annotations(output);
      }
    }
    const output: Record<string, unknown> = Object.create(null);
    schemas.set(value, output);
    activeSchemas.add(value);
    for (const [key, item] of Object.entries(value))
      output[key] = keyword(key, item, refs);
    activeSchemas.delete(value);
    return annotations(output);
  }

  return normalize(root, new Set());
}

function localTarget(ref: string, document: unknown) {
  if (!ref.startsWith('#/')) return;
  return ref
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce<unknown>(
      (current, key) => (isRecord(current) ? current[key] : undefined),
      document,
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
