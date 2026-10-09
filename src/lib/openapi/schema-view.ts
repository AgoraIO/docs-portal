import type {
  SchemaData,
  SchemaUIGeneratedData,
} from '@fumadocs/api-docs/components/schema';

export type OpenApiSchemaPathItem = {
  $ref: string;
  name: string;
  tabValues?: string[];
};

export type OpenApiSchemaData = SchemaData & {
  allowedValues?: unknown[];
};

export type OpenApiSchemaViewNode = {
  $type: string;
  children: OpenApiSchemaViewNode[];
  depth: number;
  id: string;
  name: string;
  parentPath: OpenApiSchemaPathItem[];
  path: string;
  required: boolean;
  rootContainer?: boolean;
  schema: OpenApiSchemaData;
  variant?: string;
};

export type OpenApiSchemaViewOptions = {
  includeRootContainer?: boolean;
  rootRequired?: boolean;
};

export function buildOpenApiSchemaView(
  generated: SchemaUIGeneratedData,
  rootName: string,
  options: OpenApiSchemaViewOptions = {},
): OpenApiSchemaViewNode[] {
  const rootPath = [{ $ref: generated.$root, name: rootName }];
  const root = generated.refs[generated.$root];
  if (options.includeRootContainer && root?.type !== 'object') {
    return [
      {
        $type: generated.$root,
        children: childrenFor(
          root,
          rootPath,
          [],
          1,
          new Set(),
          generated.$root,
        ),
        depth: 0,
        id: encodeOpenApiSchemaNodeId(rootPath),
        name: rootName,
        parentPath: rootPath,
        path: rootName,
        required: options.rootRequired ?? false,
        rootContainer: true,
        schema: root as OpenApiSchemaData,
      },
    ];
  }

  return childrenFor(root, rootPath, [], 0, new Set(), generated.$root);

  function childrenFor(
    schema: SchemaData | undefined,
    parentPath: OpenApiSchemaPathItem[],
    fieldPath: string[],
    depth: number,
    ancestors: Set<string>,
    schemaRef?: string,
  ): OpenApiSchemaViewNode[] {
    if (!schema) return [];

    const activeRef = schemaRef ?? parentPath.at(-1)?.$ref;
    if (activeRef && ancestors.has(activeRef)) return [];

    const nextAncestors = new Set(ancestors);
    if (activeRef) nextAncestors.add(activeRef);

    if (schema.type === 'object') {
      return schema.props.flatMap((property) => {
        const childSchema = generated.refs[property.$type];
        if (
          !childSchema ||
          isSyntheticAnyProperty(property.name, childSchema)
        ) {
          return [];
        }

        const nextFieldPath = [...fieldPath, property.name];
        const nextParentPath = [
          ...parentPath,
          { $ref: property.$type, name: property.name },
        ];
        const children = childrenFor(
          childSchema,
          nextParentPath,
          nextFieldPath,
          depth + 1,
          nextAncestors,
          property.$type,
        );

        return [
          {
            $type: property.$type,
            children,
            depth,
            id: encodeOpenApiSchemaNodeId(nextParentPath),
            name: property.name,
            parentPath,
            path: nextFieldPath.join('.'),
            required: property.required,
            schema: childSchema,
          },
        ];
      });
    }

    if (schema.type === 'array') {
      const nextParentPath = getOpenApiSchemaArrayParentPath(
        parentPath,
        schema.item.$type,
      );
      if (!nextParentPath) return [];

      return childrenFor(
        generated.refs[schema.item.$type],
        nextParentPath,
        fieldPath,
        depth,
        nextAncestors,
        schema.item.$type,
      );
    }

    if (schema.type === 'and' || schema.type === 'or') {
      return schema.items.flatMap((item) => {
        const current = parentPath.at(-1);
        if (!current) return [];

        const nextParentPath = [
          ...parentPath.slice(0, -1),
          {
            ...current,
            tabValues: [...(current.tabValues ?? []), item.$type],
          },
        ];

        return childrenFor(
          generated.refs[item.$type],
          nextParentPath,
          fieldPath,
          depth,
          nextAncestors,
          item.$type,
        ).map((node) => ({ ...node, variant: item.name }));
      });
    }

    return [];
  }
}

export function encodeOpenApiSchemaNodeId(path: OpenApiSchemaPathItem[]) {
  return encodeURIComponent(JSON.stringify(path));
}

export function getOpenApiSchemaArrayParentPath(
  parentPath: OpenApiSchemaPathItem[],
  itemRef: string,
) {
  const current = parentPath.at(-1);
  if (!current) return;
  return [
    ...parentPath.slice(0, -1),
    { ...current, $ref: itemRef, name: `${current.name}[]` },
  ];
}

export function flattenOpenApiSchemaView(
  nodes: OpenApiSchemaViewNode[],
): OpenApiSchemaViewNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenOpenApiSchemaView(node.children),
  ]);
}

export function getInitialOpenApiSchemaExpandedIds(
  nodes: OpenApiSchemaViewNode[],
) {
  return new Set(
    nodes
      .filter(
        (node) => node.depth === 0 && node.required && node.children.length > 0,
      )
      .map((node) => node.id),
  );
}

export function getAllOpenApiSchemaExpandableIds(
  nodes: OpenApiSchemaViewNode[],
) {
  return new Set(
    flattenOpenApiSchemaView(nodes)
      .filter((node) => node.children.length > 0)
      .map((node) => node.id),
  );
}

export type OpenApiSchemaFilterResult = {
  directMatchIds: Set<string>;
  expandedIds: Set<string>;
  matchCount: number;
  visibleIds: Set<string>;
};

export function filterOpenApiSchemaView(
  nodes: OpenApiSchemaViewNode[],
  rawQuery: string,
): OpenApiSchemaFilterResult {
  const query = rawQuery.trim().toLowerCase();
  const directMatchIds = new Set<string>();
  const expandedIds = new Set<string>();
  const visibleIds = new Set<string>();

  if (!query) {
    return { directMatchIds, expandedIds, matchCount: 0, visibleIds };
  }

  function visit(node: OpenApiSchemaViewNode): boolean {
    const direct =
      node.name.toLowerCase().includes(query) ||
      node.path.toLowerCase().includes(query);
    const childMatches = node.children.map(visit);
    const descendant = childMatches.some(Boolean);

    if (direct) directMatchIds.add(node.id);
    if (direct || descendant) visibleIds.add(node.id);
    if (descendant) expandedIds.add(node.id);
    return direct || descendant;
  }

  nodes.forEach(visit);

  return {
    directMatchIds,
    expandedIds,
    matchCount: directMatchIds.size,
    visibleIds,
  };
}

function isSyntheticAnyProperty(name: string, schema: OpenApiSchemaData) {
  return (
    name === '[key: string]' &&
    (schema.aliasName === 'any' || schema.typeName === 'any')
  );
}
