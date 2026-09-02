import { useTranslations } from '@fuma-translate/react';
import { useAnchorId } from '@fumadocs/api-docs/auto-anchor/client';
import {
  generateSchemaUI,
  type SchemaUIGeneratedData,
} from '@fumadocs/api-docs/components/schema';
import {
  SchemaUI,
  type SchemaUIProps,
} from '@fumadocs/api-docs/components/schema/client';
import type { ParsedSchema } from '@fumadocs/api-docs/schema';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildOpenApiAnchorId } from '@/lib/openapi/anchors';

type OpenApiSchemaClient = Omit<SchemaUIProps, 'generated'>;

export type OpenApiSchemaProps = {
  client: OpenApiSchemaClient;
  legacyAnchorPrefix?: string;
  readOnly?: boolean;
  renderCodeblock: (options: { code: string; lang: string }) => ReactNode;
  renderExtraDescription?: (schema: unknown) => ReactNode;
  renderMarkdown: (markdown: string) => ReactNode;
  root: unknown;
  showExample?: boolean;
  writeOnly?: boolean;
};

type OpenApiSchemaPathItem = {
  $ref: string;
  name: string;
  tabValues?: string[];
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
  const normalizedRoot = useMemo(() => normalizeOpenApiSchema(root), [root]);
  const generated = useMemo(
    () =>
      appendOpenApiSchemaExtraDescriptions(
        generateSchemaUI({
          readOnly,
          renderCodeblock,
          renderMarkdown,
          root: normalizedRoot as ParsedSchema,
          showExample,
          translations,
          writeOnly,
        }),
        root,
        renderExtraDescription,
      ),
    [
      readOnly,
      renderCodeblock,
      renderExtraDescription,
      renderMarkdown,
      normalizedRoot,
      root,
      showExample,
      translations,
      writeOnly,
    ],
  );
  const findTargets = useMemo(
    () =>
      buildOpenApiSchemaFindTargets(generated, client.name, legacyNavigation),
    [client.name, generated, legacyNavigation],
  );
  const revealTarget = useCallback(
    (target: OpenApiSchemaFindTarget) => {
      const url = new URL(window.location.href);
      url.hash = `#${rootId}`;
      url.searchParams.set('path', encodeOpenApiSchemaPath(target.parentPath));
      url.searchParams.set('s-highlight', target.name);
      window.history.replaceState(window.history.state, '', url);
      setNavigationKey((current) => current + 1);
    },
    [rootId],
  );

  useEffect(() => {
    const revealLegacyHashTarget = () => {
      const hash = decodeOpenApiSchemaHash(window.location.hash);
      if (!hash) return;

      const target = findTargets.find(
        (candidate) => candidate.legacyAnchorId === hash,
      );
      if (target) revealTarget(target);
    };

    revealLegacyHashTarget();
    window.addEventListener('hashchange', revealLegacyHashTarget);
    return () =>
      window.removeEventListener('hashchange', revealLegacyHashTarget);
  }, [findTargets, revealTarget]);

  return (
    <>
      <SchemaUI {...client} generated={generated} key={navigationKey} />
      <div
        aria-hidden="true"
        className="openapi-schema-find-index"
        data-openapi-schema-find-index=""
      >
        {findTargets
          .filter((target) => target.parentPath.length > 1)
          .map((target) => (
            <OpenApiSchemaFindTarget
              key={`${target.fieldPath}:${encodeOpenApiSchemaPath(target.parentPath)}`}
              onBeforeMatch={() => revealTarget(target)}
              target={target}
            />
          ))}
      </div>
    </>
  );
}

function OpenApiSchemaFindTarget({
  onBeforeMatch,
  target,
}: {
  onBeforeMatch: () => void;
  target: OpenApiSchemaFindTarget;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.setAttribute('hidden', 'until-found');
    element.addEventListener('beforematch', onBeforeMatch);
    return () => element.removeEventListener('beforematch', onBeforeMatch);
  }, [onBeforeMatch]);

  return (
    <span data-openapi-schema-find-target={target.fieldPath} ref={ref}>
      {target.name}
    </span>
  );
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
) {
  if (!renderExtraDescription) return generated;

  visit(generated.$root, root, new Set());
  return generated;

  function visit(ref: string, rawSchema: unknown, ancestors: Set<string>) {
    if (ancestors.has(ref)) return;
    const schema = generated.refs[ref];
    if (!schema) return;

    const extra = renderExtraDescription?.(rawSchema);
    if (extra !== undefined && extra !== null) {
      schema.description = (
        <>
          {schema.description}
          {extra}
        </>
      );
    }

    if (!isRecord(rawSchema)) return;
    const nextAncestors = new Set(ancestors).add(ref);
    if (schema.type === 'object') {
      const properties = isRecord(rawSchema.properties)
        ? rawSchema.properties
        : {};
      for (const property of schema.props) {
        visit(property.$type, properties[property.name], nextAncestors);
      }
      return;
    }

    if (schema.type === 'array') {
      visit(schema.item.$type, rawSchema.items, nextAncestors);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOpenApiSchema(
  value: unknown,
  seen = new WeakMap<object, unknown>(),
) {
  if (Array.isArray(value)) {
    const existing = seen.get(value);
    if (existing) return existing;
    const output: unknown[] = [];
    seen.set(value, output);
    output.push(...value.map((item) => normalizeOpenApiSchema(item, seen)));
    return output;
  }
  if (!isRecord(value)) return value;

  const existing = seen.get(value);
  if (existing) return existing;
  const output: Record<string, unknown> = {};
  seen.set(value, output);
  for (const [key, item] of Object.entries(value)) {
    output[key] = normalizeOpenApiSchema(item, seen);
  }
  if (value.example !== undefined && value.examples === undefined) {
    output.examples = [value.example];
  }
  if (value.nullable === true && typeof value.type === 'string') {
    output.type = [value.type, 'null'];
  }
  return output;
}
