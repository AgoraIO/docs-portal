import { useTranslations } from '@fuma-translate/react';
import { useAnchorId } from '@fumadocs/api-docs/auto-anchor/client';
import {
  generateSchemaUI,
  type SchemaUIGeneratedData,
} from '@fumadocs/api-docs/components/schema';
import type { SchemaUIProps } from '@fumadocs/api-docs/components/schema/client';
import type { ParsedSchema } from '@fumadocs/api-docs/schema';
import { schemaToString } from '@fumadocs/api-docs/schema/to-string';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildOpenApiAnchorId } from '@/lib/openapi/anchors';
import {
  buildOpenApiSchemaView,
  flattenOpenApiSchemaView,
  type OpenApiSchemaData,
  type OpenApiSchemaPathItem,
  type OpenApiSchemaViewNode,
} from '@/lib/openapi/schema-view';
import {
  OpenApiSchemaFieldRow,
  type OpenApiSchemaFieldRowLabels,
} from './OpenApiSchemaFieldRow';
import {
  type OpenApiSchemaRevealTarget,
  OpenApiSchemaTree,
  type OpenApiSchemaTreeLabels,
  stableDomId,
} from './OpenApiSchemaTree';

type OpenApiSchemaClient = Omit<SchemaUIProps, 'generated'>;

export type OpenApiSchemaProps = {
  client: OpenApiSchemaClient;
  document?: unknown;
  legacyAnchorPrefix?: string;
  readOnly?: boolean;
  renderCodeblock: (options: { code: string; lang: string }) => ReactNode;
  renderExtraDescription?: (schema: unknown) => ReactNode;
  renderMarkdown: (markdown: string) => ReactNode;
  root: unknown;
  showExample?: boolean;
  writeOnly?: boolean;
};

type OpenApiSchemaFindTarget = {
  fieldPath: string;
  legacyAnchorId?: string;
  name: string;
  parentPath: OpenApiSchemaPathItem[];
};

type OpenApiLegacySchemaNavigation = {
  anchorPrefix: string;
  rootDisplay: 'inline' | 'property-trigger';
};

export function OpenApiSchema({
  client,
  document,
  legacyAnchorPrefix,
  readOnly,
  renderCodeblock,
  renderExtraDescription,
  renderMarkdown,
  root,
  showExample,
  writeOnly,
}: OpenApiSchemaProps) {
  const translations = useTranslations().translations;
  const rootId = useAnchorId([client.name]);
  const legacyNavigation = useMemo(
    () => getLegacySchemaNavigation(rootId, legacyAnchorPrefix),
    [legacyAnchorPrefix, rootId],
  );
  const [navigationKey, setNavigationKey] = useState(0);
  const normalizedRoot = useMemo(
    () => normalizeOpenApiSchema(root, new WeakMap(), document),
    [document, root],
  );
  const generated = useMemo(() => {
    const generated = generateSchemaUI({
      readOnly,
      renderCodeblock,
      renderMarkdown,
      root: removeOpenApiSchemaEnums(normalizedRoot) as ParsedSchema,
      showExample,
      translations,
      writeOnly,
    });

    appendOpenApiSchemaAllowedValues(
      generated,
      normalizedRoot,
      { readOnly, writeOnly },
      document,
    );
    return appendOpenApiSchemaExtraDescriptions(
      generated,
      normalizedRoot,
      renderExtraDescription,
      document,
      { readOnly, writeOnly },
    );
  }, [
    readOnly,
    renderCodeblock,
    renderExtraDescription,
    renderMarkdown,
    normalizedRoot,
    document,
    showExample,
    translations,
    writeOnly,
  ]);
  const findTargets = useMemo(
    () =>
      buildOpenApiSchemaFindTargets(generated, client.name, legacyNavigation),
    [client.name, generated, legacyNavigation],
  );
  const schemaView = useMemo(
    () => buildOpenApiSchemaView(generated, client.name),
    [client.name, generated],
  );
  const labels = useMemo(
    () => getOpenApiSchemaLabels(translations),
    [translations],
  );
  const renderRemainingInfoTags = useCallback(
    (node: OpenApiSchemaViewNode) => {
      const tags = getRemainingInfoTags(node);
      if (node.schema.deprecated) {
        tags.push(
          <span key="deprecated" className="font-mono text-xs text-warning">
            {getOpenApiSchemaLabel(translations, 'Deprecated', 'Deprecated')}
          </span>,
        );
      }
      return tags;
    },
    [translations],
  );
  const [revealTarget, setRevealTarget] = useState<
    OpenApiSchemaRevealTarget | undefined
  >();
  const revealTargetInLocation = useCallback(
    (target: OpenApiSchemaFindTarget) => {
      const url = new URL(window.location.href);
      url.hash = `#${rootId}`;
      url.searchParams.set('path', encodeOpenApiSchemaPath(target.parentPath));
      url.searchParams.set('s-highlight', target.name);
      window.history.replaceState(window.history.state, '', url);
      setNavigationKey((current) => current + 1);
      setRevealTarget({
        fieldName: target.name,
        parentPath: normalizeOpenApiSchemaRevealPath(
          target.parentPath,
          legacyNavigation,
        ),
      });
    },
    [legacyNavigation, rootId],
  );

  useEffect(() => {
    const revealLegacyHashTarget = () => {
      const hash = decodeOpenApiSchemaHash(window.location.hash);
      if (!hash) return;

      const target = findTargets.find(
        (candidate) => candidate.legacyAnchorId === hash,
      );
      if (target) revealTargetInLocation(target);

      if (!target && hash === rootId) {
        const path = decodeOpenApiSchemaPath(window.location.search, generated);
        if (path) {
          setRevealTarget({
            fieldName: path.fieldName,
            parentPath: normalizeOpenApiSchemaRevealPath(
              path.parentPath,
              legacyNavigation,
            ),
          });
        }
      }
    };

    revealLegacyHashTarget();
    window.addEventListener('hashchange', revealLegacyHashTarget);
    return () =>
      window.removeEventListener('hashchange', revealLegacyHashTarget);
  }, [
    findTargets,
    generated,
    legacyNavigation,
    revealTargetInLocation,
    rootId,
  ]);

  const rootSchema = generated.refs[generated.$root] as OpenApiSchemaData;
  const rootIsBodyTree =
    client.as === 'body' && rootSchema?.type !== 'primitive';
  const rootNode = createOpenApiSchemaRootNode(
    generated,
    client.name,
    client.required ?? false,
    rootId,
  );

  return (
    <>
      {rootIsBodyTree ? renderOpenApiSchemaDetails(rootSchema) : null}
      {rootIsBodyTree ? (
        <OpenApiSchemaTree
          client={client}
          key={navigationKey}
          labels={labels}
          nodes={schemaView}
          onCopyFieldLink={(node) => copyOpenApiSchemaFieldLink(rootId, node)}
          renderRemainingInfoTags={renderRemainingInfoTags}
          revealTarget={revealTarget}
          rootId={rootId}
        />
      ) : (
        <OpenApiSchemaParameterFields
          labels={labels}
          nodes={[
            rootNode,
            ...flattenOpenApiSchemaView(schemaView).map((node) => ({
              ...node,
              children: [],
            })),
          ]}
          onCopyFieldLink={(node) => copyOpenApiSchemaFieldLink(rootId, node)}
          renderRemainingInfoTags={renderRemainingInfoTags}
          revealTarget={revealTarget}
          rootId={rootId}
        />
      )}
    </>
  );
}

function renderOpenApiSchemaDetails(schema: OpenApiSchemaData) {
  const infoTags = getRemainingInfoTagsFromSchema(schema);
  if (!schema.description && infoTags.length === 0) return null;

  return (
    <div className="openapi-schema-description prose-no-margin text-fd-muted-foreground">
      {schema.description}
      {infoTags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">{infoTags}</div>
      ) : null}
    </div>
  );
}

function OpenApiSchemaParameterFields({
  labels,
  nodes,
  onCopyFieldLink,
  renderRemainingInfoTags,
  revealTarget,
  rootId,
}: {
  labels: OpenApiSchemaFieldRowLabels;
  nodes: OpenApiSchemaViewNode[];
  onCopyFieldLink: (node: OpenApiSchemaViewNode) => Promise<boolean>;
  renderRemainingInfoTags: (node: OpenApiSchemaViewNode) => ReactNode[];
  revealTarget?: OpenApiSchemaRevealTarget;
  rootId: string;
}) {
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string>();
  const [highlightedId, setHighlightedId] = useState<string>();
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (copyTimer.current !== undefined)
        window.clearTimeout(copyTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!revealTarget) return;
    const target = nodes.find(
      (node) =>
        node.name === revealTarget.fieldName &&
        areOpenApiSchemaPathsEqual(node.parentPath, revealTarget.parentPath),
    );
    if (target) setHighlightedId(target.id);
  }, [nodes, revealTarget]);

  useEffect(() => {
    if (!highlightedId) return;
    const row = Array.from(
      fieldsRef.current?.querySelectorAll<HTMLElement>(
        '.openapi-schema-field-row',
      ) ?? [],
    ).find((candidate) => candidate.id === stableDomId(rootId, highlightedId));
    if (!row) return;

    const originalTabIndex = row.getAttribute('tabindex');
    row.setAttribute('data-openapi-schema-highlighted', '');
    row.tabIndex = -1;
    row
      .querySelector('code')
      ?.classList.add('rounded-sm', 'bg-primary', 'text-primary-foreground');
    row.focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return () => {
      if (originalTabIndex === null) row.removeAttribute('tabindex');
      else row.setAttribute('tabindex', originalTabIndex);
      row.removeAttribute('data-openapi-schema-highlighted');
      row
        .querySelector('code')
        ?.classList.remove(
          'rounded-sm',
          'bg-primary',
          'text-primary-foreground',
        );
    };
  }, [highlightedId, rootId]);

  return (
    <div className="openapi-schema-parameter-fields" ref={fieldsRef}>
      {nodes.map((node) => (
        <OpenApiSchemaFieldRow
          copied={copiedId === node.id}
          domId={stableDomId(rootId, node.id)}
          expanded={false}
          labels={labels}
          key={node.id}
          node={node}
          onCopy={() => {
            void handleOpenApiSchemaCopy(
              node,
              onCopyFieldLink,
              setCopiedId,
              copyTimer,
            );
          }}
          onExpandedChange={() => {}}
          remainingInfoTags={renderRemainingInfoTags(node)}
        />
      ))}
    </div>
  );
}

function createOpenApiSchemaRootNode(
  generated: SchemaUIGeneratedData,
  name: string,
  required: boolean,
  rootId: string,
): OpenApiSchemaViewNode {
  return {
    $type: generated.$root,
    children: [],
    depth: 0,
    id: rootId,
    name,
    parentPath: [{ $ref: generated.$root, name }],
    path: name,
    required,
    schema: generated.refs[generated.$root] as OpenApiSchemaData,
  };
}

function getRemainingInfoTags(node: OpenApiSchemaViewNode) {
  return getRemainingInfoTagsFromSchema(node.schema);
}

function getRemainingInfoTagsFromSchema(schema: OpenApiSchemaData) {
  return schema.infoTags?.map((tag) => tag.node) ?? [];
}

function getOpenApiSchemaLabel(
  translations: Partial<Record<string, string>>,
  key: string,
  fallback: string,
) {
  return translations[`${key}(schema UI)`] ?? translations[key] ?? fallback;
}

function getOpenApiSchemaLabels(
  translations: Partial<Record<string, string>>,
): OpenApiSchemaTreeLabels {
  const translate = (key: string, fallback: string) =>
    getOpenApiSchemaLabel(translations, key, fallback);

  return {
    allowedValues: translate('Allowed values', 'Allowed values'),
    collapse: translate('Collapse', 'Collapse'),
    collapseAll: translate('Collapse all', 'Collapse all'),
    copiedLink: translate('Copied link to', 'Copied link to'),
    copyLink: translate('Copy link to', 'Copy link to'),
    expand: translate('Expand', 'Expand'),
    expandAll: translate('Expand all', 'Expand all'),
    filter: translate('Filter Properties', 'Filter Properties'),
    matchCount: translate('matches', 'matches'),
    noMatches: translate('No property matching', 'No properties matching'),
    optional: translate('Optional', 'Optional'),
    properties: translate('properties', 'properties'),
    required: translate('Required', 'Required'),
  };
}

async function copyOpenApiSchemaFieldLink(
  rootId: string,
  node: OpenApiSchemaViewNode,
): Promise<boolean> {
  const url = new URL(window.location.href);
  url.hash = `#${rootId}`;
  url.searchParams.set('path', encodeOpenApiSchemaPath(node.parentPath));
  url.searchParams.set('s-highlight', node.name);
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(url.href);
    return true;
  } catch {
    return false;
  }
}

async function handleOpenApiSchemaCopy(
  node: OpenApiSchemaViewNode,
  onCopyFieldLink: (node: OpenApiSchemaViewNode) => Promise<boolean>,
  setCopiedId: (id: string | undefined) => void,
  copyTimer: { current: number | undefined },
) {
  try {
    if ((await onCopyFieldLink(node)) !== true) return;
  } catch {
    return;
  }

  setCopiedId(node.id);
  if (copyTimer.current !== undefined) {
    window.clearTimeout(copyTimer.current);
  }
  copyTimer.current = window.setTimeout(() => {
    setCopiedId(undefined);
    copyTimer.current = undefined;
  }, 1000);
}

function areOpenApiSchemaPathsEqual(
  left: OpenApiSchemaPathItem[],
  right: OpenApiSchemaPathItem[],
) {
  return (
    left.length === right.length &&
    left.every((item, index) => {
      const other = right[index];
      return (
        item.$ref === other.$ref &&
        item.name === other.name &&
        JSON.stringify(item.tabValues ?? []) ===
          JSON.stringify(other.tabValues ?? [])
      );
    })
  );
}

function normalizeOpenApiSchemaRevealPath(
  path: OpenApiSchemaPathItem[],
  navigation?: OpenApiLegacySchemaNavigation,
) {
  if (
    navigation?.rootDisplay === 'property-trigger' &&
    path.length > 1 &&
    path[0].$ref === path[1].$ref &&
    path[0].name === path[1].name
  ) {
    return path.slice(1);
  }
  return path;
}

function decodeOpenApiSchemaPath(
  search: string,
  generated: SchemaUIGeneratedData,
) {
  const url = new URL(search, window.location.origin);
  const encodedPath = url.searchParams.get('path');
  const fieldName = url.searchParams.get('s-highlight');
  if (!encodedPath || !fieldName) return;

  const parentPath = encodedPath.split('|').map((encoded) => {
    const [name, $ref, ...tabValues] = encoded.split('\0');
    return { $ref, name, tabValues };
  });
  if (
    parentPath.some(
      (item) =>
        !item.name ||
        !item.$ref ||
        !generated.refs[item.$ref] ||
        item.tabValues.some((value) => !generated.refs[value]),
    )
  ) {
    return;
  }

  return { fieldName, parentPath };
}

function appendOpenApiSchemaAllowedValues(
  generated: SchemaUIGeneratedData,
  root: unknown,
  options: { readOnly?: boolean; writeOnly?: boolean },
  document?: unknown,
) {
  visit(generated.$root, root, new Set());

  function visit(ref: string, rawSchema: unknown, ancestors: Set<string>) {
    if (ancestors.has(ref)) return;
    const schema = generated.refs[ref] as OpenApiSchemaData | undefined;
    if (!schema) return;

    const resolvedRawSchema = resolveLocalOpenApiSchemaReference(
      rawSchema,
      document,
    );
    const rawRecord = isRecord(resolvedRawSchema)
      ? resolvedRawSchema
      : undefined;
    if (rawRecord && Array.isArray(rawRecord.enum)) {
      schema.allowedValues = rawRecord.enum;
    }

    const nextAncestors = new Set(ancestors).add(ref);
    if (schema.type === 'object') {
      for (const property of schema.props) {
        visit(
          property.$type,
          getRawOpenApiSchemaProperty(
            resolvedRawSchema,
            property.name,
            document,
          ),
          nextAncestors,
        );
      }
      return;
    }

    if (schema.type === 'array') {
      visit(schema.item.$type, rawRecord?.items, nextAncestors);
      return;
    }

    if (schema.type === 'or' || schema.type === 'and') {
      const rawBranches = getRawOpenApiSchemaBranches(
        resolvedRawSchema,
        document,
      );
      const associatedBranches = associateOpenApiSchemaBranches(
        generated,
        schema.items,
        rawBranches,
        schema.type === 'or',
        options,
      );
      schema.items.forEach((item, index) => {
        visit(item.$type, associatedBranches[index], nextAncestors);
      });
    }
  }
}

function getRawOpenApiSchemaBranches(value: unknown, document?: unknown) {
  const resolvedValue = resolveLocalOpenApiSchemaReference(value, document);
  if (!isRecord(resolvedValue)) return [];
  if (Array.isArray(resolvedValue.type)) {
    return resolvedValue.type.map((type) => ({ ...resolvedValue, type }));
  }
  if (
    Array.isArray(resolvedValue.oneOf) &&
    Array.isArray(resolvedValue.anyOf)
  ) {
    return [
      { ...resolvedValue, anyOf: undefined },
      { ...resolvedValue, oneOf: undefined },
    ];
  }
  if (Array.isArray(resolvedValue.oneOf)) return resolvedValue.oneOf;
  if (Array.isArray(resolvedValue.anyOf)) return resolvedValue.anyOf;
  return [];
}

function associateOpenApiSchemaBranches(
  generated: SchemaUIGeneratedData,
  items: { name: string; $type: string }[],
  rawBranches: unknown[],
  filterVisibility: boolean,
  options: { readOnly?: boolean; writeOnly?: boolean },
) {
  const remaining = rawBranches.filter(
    (branch) =>
      !filterVisibility ||
      isOpenApiSchemaBranchVisible(branch, options.readOnly, options.writeOnly),
  );

  return items.map((item) => {
    const generatedSchema = generated.refs[item.$type];
    const matchIndex = remaining.findIndex(
      (branch) =>
        getOpenApiSchemaBranchName(branch) === item.name &&
        (!generatedSchema ||
          getOpenApiSchemaBranchType(branch) === generatedSchema.type),
    );
    const fallbackIndex =
      matchIndex >= 0
        ? matchIndex
        : remaining.findIndex(
            (branch) => getOpenApiSchemaBranchName(branch) === item.name,
          );
    if (fallbackIndex < 0) return undefined;
    return remaining.splice(fallbackIndex, 1)[0];
  });
}

function getOpenApiSchemaBranchName(value: unknown) {
  if (!isRecord(value) && typeof value !== 'boolean') return '';
  try {
    return schemaToString(value as ParsedSchema, 1);
  } catch {
    return '';
  }
}

function getOpenApiSchemaBranchType(value: unknown) {
  if (typeof value === 'boolean') return 'primitive';
  if (!isRecord(value)) return;
  if (Array.isArray(value.type)) return 'or';
  if (value.oneOf && value.anyOf) return 'and';
  if (value.oneOf || value.anyOf) return 'or';
  if (value.type === 'object') return 'object';
  if (value.type === 'array') return 'array';
  return 'primitive';
}

function isOpenApiSchemaBranchVisible(
  value: unknown,
  readOnly = false,
  writeOnly = false,
) {
  if (!isRecord(value)) return true;
  if (value.writeOnly) return writeOnly;
  if (value.readOnly) return readOnly;
  return true;
}

function getRawOpenApiSchemaProperty(
  value: unknown,
  name: string,
  document?: unknown,
): unknown {
  const seen = new Set<object>();

  function find(candidate: unknown): unknown {
    const resolvedCandidate = resolveLocalOpenApiSchemaReference(
      candidate,
      document,
    );
    if (!isRecord(resolvedCandidate) || seen.has(resolvedCandidate)) return;
    seen.add(resolvedCandidate);

    const properties = isRecord(resolvedCandidate.properties)
      ? resolvedCandidate.properties
      : undefined;
    const matches: unknown[] = [];
    if (properties && Object.hasOwn(properties, name)) {
      matches.push(properties[name]);
    }
    const patternProperties = isRecord(resolvedCandidate.patternProperties)
      ? resolvedCandidate.patternProperties
      : undefined;
    if (patternProperties && Object.hasOwn(patternProperties, name)) {
      matches.push(patternProperties[name]);
    }
    if (name === '[key: string]' && resolvedCandidate.additionalProperties) {
      matches.push(resolvedCandidate.additionalProperties);
    }

    if (Array.isArray(resolvedCandidate.allOf)) {
      for (const item of resolvedCandidate.allOf) {
        const result = find(item);
        if (result !== undefined) matches.push(result);
      }
    }
    if (matches.length > 0) return mergeOpenApiSchemaPropertyMatches(matches);

    for (const key of ['oneOf', 'anyOf']) {
      if (!Array.isArray(resolvedCandidate[key])) continue;
      for (const item of resolvedCandidate[key]) {
        const result = find(item);
        if (result !== undefined) return result;
      }
    }

    if (resolvedCandidate.items && !Array.isArray(resolvedCandidate.items)) {
      return find(resolvedCandidate.items);
    }
  }

  return find(value);
}

function mergeOpenApiSchemaPropertyMatches(matches: unknown[]) {
  const schemas = matches.filter(isRecord);
  const enumSchemas = schemas.filter(isOpenApiSchemaWithEnum);
  if (schemas.length === 0 || enumSchemas.length === 0) return matches[0];

  const allowedValues = enumSchemas
    .slice(1)
    .reduce(
      (current, schema) =>
        current.filter((value) => schema.enum.includes(value)),
      [...enumSchemas[0].enum],
    );
  return { ...schemas[0], enum: allowedValues };
}

function isOpenApiSchemaWithEnum(
  schema: Record<string, unknown>,
): schema is Record<string, unknown> & { enum: unknown[] } {
  return Array.isArray(schema.enum);
}

function removeOpenApiSchemaEnums(
  value: unknown,
  seen: WeakMap<
    object,
    Partial<Record<OpenApiSchemaEnumContext, unknown>>
  > = new WeakMap(),
  context: OpenApiSchemaEnumContext = 'schema',
): unknown {
  const existing = isRecordOrArray(value)
    ? seen.get(value)?.[context]
    : undefined;
  if (existing !== undefined) return existing;

  if (Array.isArray(value)) {
    const output: unknown[] = [];
    setSeenOutput(value, output, seen, context);
    output.push(
      ...value.map((item) => removeOpenApiSchemaEnums(item, seen, context)),
    );
    return output;
  }
  if (!isRecord(value)) return value;

  const output: Record<string, unknown> = {};
  setSeenOutput(value, output, seen, context);
  for (const [key, item] of Object.entries(value)) {
    if (context === 'schema' && key === 'enum') continue;
    if (context === 'schema' && isOpenApiSchemaMapKeyword(key)) {
      output[key] = removeOpenApiSchemaPropertyMap(item, seen);
      continue;
    }
    output[key] = removeOpenApiSchemaEnums(
      item,
      seen,
      context === 'schema' && isOpenApiSchemaKeywordWithSchemas(key)
        ? 'schema'
        : 'data',
    );
  }
  return output;
}

type OpenApiSchemaEnumContext = 'data' | 'schema' | 'schema-map';

function removeOpenApiSchemaPropertyMap(
  value: unknown,
  seen: WeakMap<object, Partial<Record<OpenApiSchemaEnumContext, unknown>>>,
) {
  if (!isRecord(value)) return removeOpenApiSchemaEnums(value, seen, 'data');
  const existing = seen.get(value)?.['schema-map'];
  if (existing !== undefined) return existing;
  const output: Record<string, unknown> = {};
  setSeenOutput(value, output, seen, 'schema-map');
  for (const [key, item] of Object.entries(value)) {
    output[key] = removeOpenApiSchemaEnums(item, seen, 'schema');
  }
  return output;
}

function isRecordOrArray(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function setSeenOutput(
  value: object,
  output: unknown,
  seen: WeakMap<object, Partial<Record<OpenApiSchemaEnumContext, unknown>>>,
  context: OpenApiSchemaEnumContext,
) {
  seen.set(value, { ...seen.get(value), [context]: output });
}

function isOpenApiSchemaKeywordWithSchemas(key: string) {
  return new Set([
    '$defs',
    'additionalItems',
    'additionalProperties',
    'allOf',
    'contains',
    'dependentSchemas',
    'else',
    'if',
    'items',
    'not',
    'oneOf',
    'anyOf',
    'prefixItems',
    'propertyNames',
    'then',
  ]).has(key);
}

function isOpenApiSchemaMapKeyword(key: string) {
  return new Set([
    '$defs',
    'definitions',
    'dependentSchemas',
    'patternProperties',
    'properties',
  ]).has(key);
}

export function buildOpenApiSchemaFindTargets(
  generated: SchemaUIGeneratedData,
  rootName: string,
  legacyNavigation?: OpenApiLegacySchemaNavigation,
) {
  const targets: OpenApiSchemaFindTarget[] = [];
  const rootPath = [{ $ref: generated.$root, name: rootName }];
  const legacyAnchorPrefix = legacyNavigation?.anchorPrefix;
  const rootUsesPropertyTrigger =
    legacyNavigation?.rootDisplay === 'property-trigger';

  if (legacyAnchorPrefix && rootUsesPropertyTrigger) {
    targets.push({
      fieldPath: rootName,
      legacyAnchorId: buildOpenApiAnchorId(legacyAnchorPrefix, rootName),
      name: rootName,
      parentPath: rootPath,
    });
  }

  const schemaRootPath = rootUsesPropertyTrigger
    ? [...rootPath, { $ref: generated.$root, name: rootName }]
    : rootPath;
  visitSchema(generated.$root, schemaRootPath, [], new Set());
  return targets;

  function visitSchema(
    ref: string,
    parentPath: OpenApiSchemaPathItem[],
    fieldPath: string[],
    ancestors: Set<string>,
  ) {
    if (ancestors.has(ref)) return;
    const schema = generated.refs[ref];
    if (!schema) return;

    const nextAncestors = new Set(ancestors).add(ref);
    if (schema.type === 'object') {
      for (const property of schema.props) {
        const nextFieldPath = [...fieldPath, property.name];
        const targetFieldPath = nextFieldPath.join('.');
        if (fieldPath.length > 0 || legacyAnchorPrefix) {
          targets.push({
            fieldPath: targetFieldPath,
            legacyAnchorId: legacyAnchorPrefix
              ? buildOpenApiAnchorId(legacyAnchorPrefix, targetFieldPath)
              : undefined,
            name: property.name,
            parentPath,
          });
        }
        visitSchema(
          property.$type,
          [...parentPath, { $ref: property.$type, name: property.name }],
          nextFieldPath,
          nextAncestors,
        );
      }
      return;
    }

    if (schema.type === 'and' || schema.type === 'or') {
      for (const item of schema.items) {
        const current = parentPath.at(-1);
        if (!current) continue;
        const nextParentPath = [
          ...parentPath.slice(0, -1),
          {
            ...current,
            tabValues: [...(current.tabValues ?? []), item.$type],
          },
        ];
        visitSchema(item.$type, nextParentPath, fieldPath, nextAncestors);
      }
      return;
    }

    if (schema.type === 'array') {
      visitSchema(
        schema.item.$type,
        [
          ...parentPath.slice(0, -1),
          {
            $ref: schema.item.$type,
            name: `${parentPath.at(-1)?.name ?? '[index]'}[]`,
          },
        ],
        fieldPath,
        nextAncestors,
      );
    }
  }
}

function getLegacySchemaNavigation(rootId: string, explicitPrefix?: string) {
  if (explicitPrefix) {
    return { anchorPrefix: explicitPrefix, rootDisplay: 'inline' } as const;
  }

  const parameterMatch = rootId.match(
    /^parameters\.(path|query|header|cookie)\./,
  );
  if (parameterMatch) {
    return {
      anchorPrefix: `${parameterMatch[1]}-parameters`,
      rootDisplay: 'property-trigger',
    } as const;
  }

  if (rootId.startsWith('request-body.')) {
    return {
      anchorPrefix: 'request-body',
      rootDisplay: 'inline',
    } as const;
  }

  return undefined;
}

function encodeOpenApiSchemaPath(path: OpenApiSchemaPathItem[]) {
  return path
    .map((item) => [item.name, item.$ref, ...(item.tabValues ?? [])].join('\0'))
    .join('|');
}

function decodeOpenApiSchemaHash(hash: string) {
  if (!hash.startsWith('#')) return '';
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function appendOpenApiSchemaExtraDescriptions(
  generated: SchemaUIGeneratedData,
  root: unknown,
  renderExtraDescription?: (schema: unknown) => ReactNode,
  document?: unknown,
  options: { readOnly?: boolean; writeOnly?: boolean } = {},
) {
  if (!renderExtraDescription) return generated;

  visit(generated.$root, root, new Set());
  return generated;

  function visit(ref: string, rawSchema: unknown, ancestors: Set<string>) {
    if (ancestors.has(ref)) return;
    const schema = generated.refs[ref];
    if (!schema) return;

    const resolvedRawSchema = resolveLocalOpenApiSchemaReference(
      rawSchema,
      document,
    );
    const extra = renderExtraDescription?.(resolvedRawSchema);
    if (extra !== undefined && extra !== null) {
      schema.description = (
        <>
          {schema.description}
          {extra}
        </>
      );
    }

    if (!isRecord(resolvedRawSchema)) return;
    const nextAncestors = new Set(ancestors).add(ref);
    if (schema.type === 'object') {
      for (const property of schema.props) {
        visit(
          property.$type,
          getRawOpenApiSchemaProperty(
            resolvedRawSchema,
            property.name,
            document,
          ),
          nextAncestors,
        );
      }
      return;
    }

    if (schema.type === 'array') {
      visit(schema.item.$type, resolvedRawSchema.items, nextAncestors);
      return;
    }

    if (schema.type === 'or' || schema.type === 'and') {
      const associatedBranches = associateOpenApiSchemaBranches(
        generated,
        schema.items,
        getRawOpenApiSchemaBranches(resolvedRawSchema, document),
        schema.type === 'or',
        options,
      );
      schema.items.forEach((item, index) => {
        if (associatedBranches[index] !== undefined) {
          visit(item.$type, associatedBranches[index], nextAncestors);
        }
      });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOpenApiSchema(
  value: unknown,
  seen = new WeakMap<object, unknown>(),
  document?: unknown,
  resolvingRefs = new Set<string>(),
) {
  if (Array.isArray(value)) {
    const existing = seen.get(value);
    if (existing) return existing;
    const output: unknown[] = [];
    seen.set(value, output);
    output.push(
      ...value.map((item) =>
        normalizeOpenApiSchema(item, seen, document, resolvingRefs),
      ),
    );
    return output;
  }
  if (!isRecord(value)) return value;

  if (typeof value.$ref === 'string') {
    const target =
      getLocalOpenApiSchemaRefTarget(value.$ref, document) ??
      (value as { '$ref-value'?: unknown })['$ref-value'];
    if (target !== undefined && !resolvingRefs.has(value.$ref)) {
      const nextResolvingRefs = new Set(resolvingRefs).add(value.$ref);
      const resolved = normalizeOpenApiSchema(
        target,
        seen,
        document,
        nextResolvingRefs,
      );
      const output: Record<string, unknown> = isRecord(resolved)
        ? { ...resolved }
        : {};
      seen.set(value, output);
      for (const [key, item] of Object.entries(value)) {
        if (key === '$ref' || key === '$ref-value') continue;
        output[key] = normalizeOpenApiSchema(
          item,
          seen,
          document,
          resolvingRefs,
        );
      }
      return output;
    }
  }

  const existing = seen.get(value);
  if (existing) return existing;
  const output: Record<string, unknown> = {};
  seen.set(value, output);
  for (const [key, item] of Object.entries(value)) {
    output[key] = normalizeOpenApiSchema(item, seen, document, resolvingRefs);
  }
  if (value.example !== undefined && value.examples === undefined) {
    output.examples = [value.example];
  }
  if (value.nullable === true && typeof value.type === 'string') {
    output.type = [value.type, 'null'];
  }
  return output;
}

function resolveLocalOpenApiSchemaReference(
  value: unknown,
  document?: unknown,
) {
  if (!isRecord(value) || typeof value.$ref !== 'string') return value;
  const target = getLocalOpenApiSchemaRefTarget(value.$ref, document);
  if (!isRecord(target)) return value;
  return { ...target, ...value };
}

function getLocalOpenApiSchemaRefTarget(ref: string, document?: unknown) {
  if (!document || !ref.startsWith('#/')) return;
  return ref
    .slice(2)
    .split('/')
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce<unknown>((current, segment) => {
      return isRecord(current) ? current[segment] : undefined;
    }, document);
}
