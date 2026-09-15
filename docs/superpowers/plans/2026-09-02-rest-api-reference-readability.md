# REST API Reference Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make deeply nested REST API schemas searchable and progressively collapsible while clarifying field metadata, endpoint methods, enum values, and the desktop examples rail.

**Architecture:** Continue using Fumadocs `generateSchemaUI` for normalized type data, rendered Markdown, and official path compatibility. Add a local schema-view model and controlled React tree for recursive filtering and disclosure; keep operation-level method and rail presentation in `FumadocsOpenApiContent.tsx` and `app.css`.

**Tech Stack:** TypeScript, React 19, TanStack Start, Fumadocs OpenAPI, local shadcn/ui `Badge`/`Button`/`Input`, Tailwind CSS v4, Vitest, Testing Library, Biome.

---

## File map

- Create `src/lib/openapi/schema-view.ts`: convert generated Fumadocs refs into stable display nodes and derive initial expansion, all-expandable paths, and recursive filter results.
- Create `src/lib/openapi/schema-view.test.ts`: pure tests for traversal, recursion guards, synthetic map-row suppression, initial disclosure, and search context.
- Create `src/components/openapi/OpenApiSchemaFieldRow.tsx`: render one field's disclosure control, bold name, adjacent type, right-aligned badge/link, description, allowed values, and remaining generated metadata.
- Create `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`: field-row semantics and visual-contract tests.
- Create `src/components/openapi/OpenApiSchemaTree.tsx`: own expansion/search state, toolbar, hidden-until-found behavior, hash reveal, and tree composition.
- Create `src/components/openapi/OpenApiSchemaTree.test.tsx`: interaction and accessibility tests.
- Modify `src/components/openapi/OpenApiSchema.tsx`: enrich generated refs with raw enum metadata, preserve legacy navigation, and render the local controlled tree instead of patched inline `SchemaUI`.
- Modify `src/components/openapi/OpenApiSchema.test.tsx`: replace all-expanded/root-only-filter assertions with the approved disclosure, recursive-filter, native-find, and hash behavior.
- Modify `src/components/openapi/FumadocsOpenApiContent.tsx`: add localized labels and method-specific endpoint badge styling.
- Modify `src/components/openapi/FumadocsOpenApiContent.test.tsx`: update integration expectations for badges, enum tokens, method variants, and collapsed schemas.
- Modify `src/styles/app.css`: set the examples rail to 400px and add narrowly scoped schema/method presentation hooks.
- Modify `src/styles/app-css-regressions.test.ts`: lock the 400px rail and responsive/wrapping contracts.

## Task 1: Build the schema view and recursive filter model

**Files:**

- Create: `src/lib/openapi/schema-view.ts`
- Create: `src/lib/openapi/schema-view.test.ts`

- [ ] **Step 1: Write failing traversal and suppression tests**

Create a generated fixture containing a required root object, an optional root
object, nested objects, an array of objects, a union, a recursive ref, and a
synthetic `[key: string]` property. Assert the stable paths and initial state:

```ts
import { describe, expect, it } from 'vitest';
import type { SchemaUIGeneratedData } from '@fumadocs/api-docs/components/schema';
import {
  buildOpenApiSchemaView,
  getAllOpenApiSchemaExpandableIds,
  getInitialOpenApiSchemaExpandedIds,
} from './schema-view';

describe('openapi schema view', () => {
  it('opens only required root expandable fields and hides synthetic map rows', () => {
    const view = buildOpenApiSchemaView(generatedFixture, 'body');

    expect(view.map((node) => node.path)).toContain('properties.channel');
    expect(view.map((node) => node.path)).not.toContain(
      'properties.[key: string]',
    );
    const properties = view.find((node) => node.path === 'properties');
    expect(properties).toBeDefined();
    expect(getInitialOpenApiSchemaExpandedIds(view)).toEqual(
      new Set([properties?.id]),
    );
    expect(getAllOpenApiSchemaExpandableIds(view).size).toBeGreaterThan(1);
  });

  it('stops traversal when a generated ref repeats in its ancestor chain', () => {
    const view = buildOpenApiSchemaView(recursiveGeneratedFixture, 'body');
    expect(view.filter((node) => node.path.endsWith('.self'))).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
bun run test src/lib/openapi/schema-view.test.ts
```

Expected: FAIL because `./schema-view` does not exist.

- [ ] **Step 3: Implement generated-ref traversal**

Create the public model and traversal API. Property rows are the visible nodes;
array and union schemas contribute descendants without synthetic wrapper rows.
Include the selected union ref in the node id so variant paths cannot collide.

```ts
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
  schema: OpenApiSchemaData;
  variant?: string;
};

export function buildOpenApiSchemaView(
  generated: SchemaUIGeneratedData,
  rootName: string,
): OpenApiSchemaViewNode[] {
  const rootPath = [{ $ref: generated.$root, name: rootName }];
  const root = generated.refs[generated.$root];
  return childrenFor(root, rootPath, [], 0, new Set());

  function childrenFor(
    schema: SchemaData | undefined,
    parentPath: OpenApiSchemaPathItem[],
    fieldPath: string[],
    depth: number,
    ancestors: Set<string>,
  ): OpenApiSchemaViewNode[] {
    if (!schema) return [];
    const activeRef = parentPath.at(-1)?.$ref;
    if (activeRef && ancestors.has(activeRef)) return [];
    const nextAncestors = new Set(ancestors);
    if (activeRef) nextAncestors.add(activeRef);

    if (schema.type === 'object') {
      return schema.props.flatMap((property) => {
        const childSchema = generated.refs[property.$type];
        if (
          property.name === '[key: string]' &&
          childSchema?.aliasName === 'any'
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
        );
        return [{
          $type: property.$type,
          children,
          depth,
          id: encodeOpenApiSchemaNodeId(nextParentPath),
          name: property.name,
          parentPath,
          path: nextFieldPath.join('.'),
          required: property.required,
          schema: childSchema as OpenApiSchemaData,
        }];
      });
    }

    if (schema.type === 'array') {
      const current = parentPath.at(-1);
      if (!current) return [];
      return childrenFor(
        generated.refs[schema.item.$type],
        [
          ...parentPath.slice(0, -1),
          { $ref: schema.item.$type, name: `${current.name}[]` },
        ],
        fieldPath,
        depth,
        nextAncestors,
      );
    }

    if (schema.type === 'and' || schema.type === 'or') {
      return schema.items.flatMap((item) => {
        const current = parentPath.at(-1);
        if (!current) return [];
        return childrenFor(
          generated.refs[item.$type],
          [
            ...parentPath.slice(0, -1),
            {
              ...current,
              tabValues: [...(current.tabValues ?? []), item.$type],
            },
          ],
          fieldPath,
          depth,
          nextAncestors,
        ).map((node) => ({ ...node, variant: item.name }));
      });
    }

    return [];
  }
}

export function encodeOpenApiSchemaNodeId(path: OpenApiSchemaPathItem[]) {
  return path
    .map((item) => [item.name, item.$ref, ...(item.tabValues ?? [])].join('\0'))
    .join('|');
}

export function flattenOpenApiSchemaView(nodes: OpenApiSchemaViewNode[]) {
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
      .filter((node) => node.required && node.children.length > 0)
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
```

- [ ] **Step 4: Write failing recursive filter tests**

Add assertions that `channel` and `properties.channel` both match, ancestors
remain visible, direct matches alone contribute to the count, and unrelated
branches remain hidden:

```ts
it('matches nested names and dotted paths while retaining ancestors', () => {
  const view = buildOpenApiSchemaView(generatedFixture, 'body');

  for (const query of ['channel', 'properties.channel']) {
    const result = filterOpenApiSchemaView(view, query);
    const channel = flattenOpenApiSchemaView(view).find(
      (node) => node.path === 'properties.channel',
    );
    const properties = view.find((node) => node.path === 'properties');

    expect(result.matchCount).toBe(1);
    expect(result.directMatchIds).toContain(channel?.id);
    expect(result.visibleIds).toContain(properties?.id);
    expect(result.expandedIds).toContain(properties?.id);
    expect(
      [...result.visibleIds].some((id) => id.includes('advanced')),
    ).toBe(false);
  }
});
```

- [ ] **Step 5: Run the filter test and verify RED**

Run the same test file. Expected: FAIL because
`filterOpenApiSchemaView` is not exported.

- [ ] **Step 6: Implement recursive filtering**

```ts
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
    const descendant = node.children.map(visit).some(Boolean);
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
```

- [ ] **Step 7: Run tests and commit**

Run:

```bash
bun run test src/lib/openapi/schema-view.test.ts
git add src/lib/openapi/schema-view.ts src/lib/openapi/schema-view.test.ts
git commit -m "feat: model searchable OpenAPI schema views"
```

Expected: schema-view tests PASS; commit contains only the model and tests.

## Task 2: Render explicit field metadata and allowed-value tokens

**Files:**

- Create: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Create: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

- [ ] **Step 1: Write failing field-row tests**

Cover a required expandable field and an optional enum field. Require adjacent
name/type hooks, right-aligned badges, no `*`/`?`, no list, and unquoted tokens:

```tsx
it('separates field identity from description with explicit requiredness', () => {
  render(<RequiredObjectFieldFixture />);
  const row = screen.getByTestId('schema-field-properties');

  expect(within(row).getByText('properties')).toHaveClass(
    'openapi-schema-field-name',
    'font-semibold',
  );
  expect(within(row).getByText('object')).toHaveClass(
    'openapi-schema-field-type',
  );
  expect(within(row).getByText('Required')).toHaveClass('ml-auto');
  expect(within(row).queryByText('*')).not.toBeInTheDocument();
  expect(within(row).queryByText('?')).not.toBeInTheDocument();
});

it('renders allowed values as wrapping code tokens without a callout list', () => {
  render(<EnumFieldFixture values={['GLOBAL', 'NORTH_AMERICA', 'EUROPE']} />);
  const values = screen.getByTestId('openapi-allowed-values');

  expect(within(values).getByText('Allowed values')).toBeVisible();
  expect(within(values).getByText('GLOBAL').tagName).toBe('CODE');
  expect(within(values).queryByRole('list')).not.toBeInTheDocument();
  expect(within(values).queryByText('"GLOBAL"')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx
```

Expected: FAIL because the field-row component does not exist.

- [ ] **Step 3: Implement the local field row**

Use the installed local `Badge` and `Button` primitives. Keep the link action
after the right-aligned badge and render remaining Fumadocs info tags unchanged.

```tsx
import { useTranslations } from '@fuma-translate/react';
import { Check, ChevronRight, Link } from 'lucide-react';
import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { OpenApiSchemaViewNode } from '@/lib/openapi/schema-view';

export function OpenApiSchemaFieldRow({
  allowedValuesLabel,
  copied,
  expanded,
  node,
  onCopy,
  onExpandedChange,
}: {
  allowedValuesLabel: string;
  copied: boolean;
  expanded: boolean;
  node: OpenApiSchemaViewNode;
  onCopy: () => void;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const t = useTranslations({ note: 'schema UI' });
  const expandable = node.children.length > 0;

  return (
    <div
      className="openapi-schema-field-row border-fd-border border-t py-3"
      data-testid={`schema-field-${node.name}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {expandable ? (
          <Button
            aria-expanded={expanded}
            aria-label={`${t(expanded ? 'Collapse field' : 'Expand field')} ${node.path}`}
            onClick={() => onExpandedChange(!expanded)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <ChevronRight
              className={cn('transition-transform', expanded && 'rotate-90')}
              data-icon="inline-start"
            />
          </Button>
        ) : (
          <span aria-hidden="true" className="size-6" />
        )}
        <code className="openapi-schema-field-name font-semibold text-fd-foreground">
          {node.name}
        </code>
        <code className="openapi-schema-field-type text-fd-muted-foreground">
          {node.schema.aliasName}
        </code>
        <Badge
          className="ml-auto normal-case tracking-normal"
          variant={node.required ? 'default' : 'outline'}
        >
          {t(node.required ? 'Required' : 'Optional')}
        </Badge>
        <Button
          aria-label={`${t(copied ? 'Copied link to' : 'Copy link to')} ${node.path}`}
          onClick={onCopy}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          {copied ? <Check data-icon="inline-start" /> : <Link data-icon="inline-start" />}
        </Button>
      </div>
      <div className="openapi-schema-field-description prose-no-margin mt-2 text-fd-muted-foreground">
        {node.schema.description}
      </div>
      <OpenApiAllowedValues
        label={allowedValuesLabel}
        values={node.schema.allowedValues}
      />
      <OpenApiRemainingInfoTags schema={node.schema} />
    </div>
  );
}

function OpenApiAllowedValues({
  label,
  values,
}: {
  label: string;
  values?: unknown[];
}) {
  if (!values?.length) return null;
  return (
    <div className="mt-3" data-testid="openapi-allowed-values">
      <p className="mb-2 font-medium text-fd-muted-foreground text-xs">
        {label}
      </p>
      <div className="openapi-schema-allowed-values flex flex-wrap gap-1.5">
        {values.map((value) => (
          <code
            className="rounded-md border border-fd-border bg-fd-muted/60 px-2 py-1 text-xs"
            key={JSON.stringify(value)}
          >
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </code>
        ))}
      </div>
    </div>
  );
}

function OpenApiRemainingInfoTags({
  schema,
}: {
  schema: OpenApiSchemaViewNode['schema'];
}) {
  if (!schema.infoTags?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {schema.infoTags.map((tag, index) => (
        <Fragment key={index}>{tag.node}</Fragment>
      ))}
    </div>
  );
}
```

Task 4 removes the generated enum block while enriching `allowedValues`, so
`OpenApiRemainingInfoTags` preserves only default/range/example metadata and
does not inspect private React element structure.

- [ ] **Step 4: Run tests and commit**

```bash
bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx
git add src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx
git commit -m "feat: clarify OpenAPI schema field rows"
```

Expected: field-row tests PASS.

## Task 3: Add controlled disclosure, recursive search, and native find

**Files:**

- Create: `src/components/openapi/OpenApiSchemaTree.tsx`
- Create: `src/components/openapi/OpenApiSchemaTree.test.tsx`

- [ ] **Step 1: Write failing disclosure tests**

Assert initial required-only expansion, independent toolbar buttons, nested
toggle behavior, expand-all, collapse-all, and recursive guards:

```tsx
it('opens only required root objects by default', () => {
  render(<SchemaTreeFixture />);

  expect(screen.getByText('channel')).toBeVisible();
  expect(screen.getByText('advanced_features')).toBeVisible();
  expect(screen.getByText('enable_tools')).not.toBeVisible();
  expect(screen.getByRole('button', { name: 'Collapse properties' }))
    .toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Expand advanced_features' }))
    .toHaveAttribute('aria-expanded', 'false');
});

it('expands and collapses the complete non-recursive tree', () => {
  render(<SchemaTreeFixture />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
  expect(screen.getByText('enable_tools')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
  expect(screen.getByText('channel')).not.toBeVisible();
  expect(screen.getByText('properties')).toBeVisible();
});
```

- [ ] **Step 2: Run disclosure tests and verify RED**

Run:

```bash
bun run test src/components/openapi/OpenApiSchemaTree.test.tsx
```

Expected: FAIL because `OpenApiSchemaTree` does not exist.

- [ ] **Step 3: Implement expansion state and recursive rendering**

Use one state set for user expansion. Search expansion is derived and never
mutates this set, which automatically restores the pre-search state on clear.
Expose this exact component contract so Task 4 can integrate without reaching
into internal state:

```tsx
export type OpenApiSchemaRevealTarget = {
  fieldName: string;
  parentPath: OpenApiSchemaPathItem[];
};

export type OpenApiSchemaTreeProps = {
  client: { as?: 'body' | 'property'; name: string; required?: boolean };
  nodes: OpenApiSchemaViewNode[];
  revealTarget?: OpenApiSchemaRevealTarget;
  rootId: string;
};
```

```tsx
const [expandedIds, setExpandedIds] = useState(() =>
  getInitialOpenApiSchemaExpandedIds(nodes),
);
const filterResult = useMemo(
  () => filterOpenApiSchemaView(nodes, query),
  [nodes, query],
);
const searching = query.trim().length > 0;
const effectiveExpandedIds = searching
  ? new Set([...expandedIds, ...filterResult.expandedIds])
  : expandedIds;

function setExpanded(id: string, expanded: boolean) {
  setExpandedIds((current) => {
    const next = new Set(current);
    if (expanded) next.add(id);
    else next.delete(id);
    return next;
  });
}
```

Render the root filter and both toolbar buttons with the local `Input` and
`Button` components. Recursively render only matching branches during search;
outside search, keep collapsed descendants mounted in an until-found wrapper:

```tsx
function UntilFound({
  children,
  hidden,
  onBeforeMatch,
}: {
  children: ReactNode;
  hidden: boolean;
  onBeforeMatch: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !hidden) return;
    element.setAttribute('hidden', 'until-found');
    element.addEventListener('beforematch', onBeforeMatch);
    return () => element.removeEventListener('beforematch', onBeforeMatch);
  }, [hidden, onBeforeMatch]);
  return <div ref={ref}>{children}</div>;
}
```

- [ ] **Step 4: Write failing recursive search tests**

```tsx
it.each([
  ['channel', 'properties.channel'],
  ['properties.channel', 'properties.channel'],
  ['remote_rtc_uids', 'properties.remote_rtc_uids'],
])('reveals nested field %s with path and count', (query, path) => {
    render(<SchemaTreeFixture />);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: query },
    });

    expect(screen.getByText(/1 match/)).toBeVisible();
    expect(screen.getByText(path)).toBeVisible();
  });

it('restores disclosure state after Escape clears search', () => {
  render(<SchemaTreeFixture />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand advanced_features' }));
  const search = screen.getByRole('searchbox');
  fireEvent.change(search, { target: { value: 'channel' } });
  fireEvent.keyDown(search, { key: 'Escape' });

  expect(search).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Collapse advanced_features' }))
    .toHaveAttribute('aria-expanded', 'true');
});
```

- [ ] **Step 5: Implement search UI and keyboard behavior**

The direct-match path is secondary text on the matching row only. Put the
localized count in `aria-live="polite"`; Enter focuses and scrolls the first
matching row, while Escape clears the query.

```tsx
<div className="flex items-center gap-3" data-openapi-schema-filter="">
  <Input
    aria-label={filterLabel}
    onChange={(event) => setQuery(event.target.value)}
    onKeyDown={handleSearchKeyDown}
    placeholder={filterLabel}
    type="search"
    value={query}
  />
  <span aria-live="polite" className="shrink-0 text-fd-muted-foreground text-xs">
    {searching ? formatMatchCount(filterResult.matchCount) : null}
  </span>
</div>
```

- [ ] **Step 6: Write and satisfy native-find tests**

Dispatch `beforematch` on a collapsed grandchild and assert that only its
ancestor ids are added to expansion state. Confirm the unrelated optional root
remains collapsed.

- [ ] **Step 7: Run tests and commit**

```bash
bun run test src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/lib/openapi/schema-view.test.ts
git add src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchemaTree.test.tsx
git commit -m "feat: add searchable OpenAPI schema disclosure"
```

Expected: all three focused files PASS.

## Task 4: Integrate the controlled tree with generated schema metadata and anchors

**Files:**

- Modify: `src/components/openapi/OpenApiSchema.tsx`
- Modify: `src/components/openapi/OpenApiSchema.test.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.tsx`

- [ ] **Step 1: Replace outdated integration expectations with failing approved behavior**

Update tests that currently require every nested field to be visible. Assert:

- `config` is initially expanded because it is required at the root.
- `transport` is visible but its `codec` descendant is hidden.
- `advanced` is collapsed because it is optional.
- searching `codec` reveals it and shows `config.transport.codec`.
- clearing search restores the initial state.
- official and legacy hash paths reveal collapsed targets.
- query/header/path parameter roots still render without a popup.

Run:

```bash
bun run test src/components/openapi/OpenApiSchema.test.tsx
```

Expected: FAIL against the existing always-expanded official renderer.

- [ ] **Step 2: Attach structured enum metadata while generating refs**

Replace `appendOpenApiSchemaExtraDescriptions` with
`appendOpenApiSchemaMetadata`. Keep the existing description append and attach
raw enum values to the generated schema ref during the same synchronized
object/array traversal:

```tsx
function appendOpenApiSchemaMetadata(
  generated: SchemaUIGeneratedData,
  root: unknown,
  generatedEnumLabel: ReactNode,
  renderExtraDescription?: (schema: unknown) => ReactNode,
) {
  visit(generated.$root, root, new Set());
  return generated;

  function visit(ref: string, rawSchema: unknown, ancestors: Set<string>) {
    if (ancestors.has(ref)) return;
    const schema = generated.refs[ref] as OpenApiSchemaData | undefined;
    if (!schema) return;
    const record = isRecord(rawSchema) ? rawSchema : undefined;

    const extra = renderExtraDescription?.(rawSchema);
    if (extra !== undefined && extra !== null) {
      schema.description = <>{schema.description}{extra}</>;
    }
    if (Array.isArray(record?.enum)) {
      schema.allowedValues = record.enum;
      schema.infoTags = schema.infoTags?.filter(
        (tag) => !isGeneratedEnumInfoTag(tag.node, generatedEnumLabel),
      );
    }

    const nextAncestors = new Set(ancestors).add(ref);
    if (schema.type === 'object') {
      const properties = isRecord(record?.properties) ? record.properties : {};
      for (const property of schema.props) {
        visit(property.$type, properties[property.name], nextAncestors);
      }
    } else if (schema.type === 'array') {
      visit(schema.item.$type, record?.items, nextAncestors);
    }
  }
}

function isGeneratedEnumInfoTag(node: ReactNode, label: ReactNode) {
  if (!isValidElement<{ label?: ReactNode }>(node)) return false;
  return node.props.label === label;
}
```

Pass `translations['Value in(schema UI)'] ?? 'Value in'` as
`generatedEnumLabel`. Add a unit assertion proving the narrow guard does not
filter default/range/example metadata.

- [ ] **Step 3: Render `OpenApiSchemaTree` and preserve official path reveal**

Remove the direct `SchemaUI` render. Build view nodes from `generated`, decode
the current `path`/`s-highlight` pair, and pass a reveal request to the tree.
Keep `buildOpenApiSchemaFindTargets` and legacy-hash conversion unchanged.

```tsx
const nodes = useMemo(
  () => buildOpenApiSchemaView(generated, client.name),
  [client.name, generated],
);
const [pendingReveal, setPendingReveal] =
  useState<OpenApiSchemaRevealTarget>();

return (
  <OpenApiSchemaTree
    client={client}
    nodes={nodes}
    revealTarget={pendingReveal}
    rootId={rootId}
  />
);
```

Export and reuse one `encodeOpenApiSchemaPath`/`decodeOpenApiSchemaPath`
implementation so copy links, initial official URLs, and legacy hash conversion
cannot diverge. Extend the existing client-only location effect and
`revealTarget` callback to call `setPendingReveal`; do not read `window` during
server rendering.

- [ ] **Step 4: Add localization strings**

Extend `ZH_CN_FUMADOCS_SCHEMA_TRANSLATIONS` with exact keys used by the local
tree:

```ts
'Allowed values(schema UI)': '可选值',
'Collapse all(schema UI)': '全部折叠',
'Collapse field(schema UI)': '折叠字段',
'Expand all(schema UI)': '全部展开',
'Expand field(schema UI)': '展开字段',
'match(schema UI)': '个匹配项',
'matches(schema UI)': '个匹配项',
'Optional(schema UI)': '可选',
'Required(schema UI)': '必填',
```

- [ ] **Step 5: Run integration tests and commit**

```bash
bun run test src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/lib/openapi/schema-view.test.ts
git add src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.tsx
git commit -m "feat: integrate controlled OpenAPI schemas"
```

Expected: focused schema tests PASS, including existing ref/union/hash tests.

## Task 5: Add semantic method badges and widen the examples rail

**Files:**

- Modify: `src/components/openapi/FumadocsOpenApiContent.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/styles/app.css`
- Modify: `src/styles/app-css-regressions.test.ts`

- [ ] **Step 1: Write failing endpoint method variant tests**

Render GET, POST, PATCH, DELETE, and unknown methods. Assert the uppercase text,
normalized `data-method`, and URL-copy behavior:

```tsx
expect(screen.getByTestId('openapi-method')).toHaveTextContent('POST');
expect(screen.getByTestId('openapi-method')).toHaveAttribute(
  'data-method',
  'post',
);
expect(screen.getByTestId('openapi-endpoint-url')).toHaveTextContent(
  'https://api.agora.io/v2/projects/{appid}/join',
);
```

- [ ] **Step 2: Run the endpoint tests and verify RED**

Run the specific endpoint test by name:

```bash
bun run test src/components/openapi/FumadocsOpenApiContent.test.tsx -t "styles the endpoint method by HTTP semantics"
```

Expected: FAIL because the method badge lacks the new test hooks and variants.

- [ ] **Step 3: Implement method normalization and variants**

Use the local `Badge` primitive and an exhaustive fallback:

```tsx
const OPENAPI_METHOD_BADGE_CLASSES: Record<string, string> = {
  delete: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300',
  get: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  patch: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  post: 'border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-300',
  put: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

function OpenApiMethodBadge({ method }: { method: string }) {
  const normalized = method.toLowerCase();
  return (
    <Badge
      className={cn(
        'shrink-0 normal-case tracking-normal',
        OPENAPI_METHOD_BADGE_CLASSES[normalized] ??
          'border-fd-border bg-fd-muted text-fd-muted-foreground',
      )}
      data-method={normalized}
      data-testid="openapi-method"
      variant="outline"
    >
      {normalized.toUpperCase()}
    </Badge>
  );
}
```

Mark the URL container with `data-testid="openapi-endpoint-url"`; preserve its
independent overflow and copy behavior so the method never scrolls away.

- [ ] **Step 4: Write failing CSS regression tests**

Require the exact wide-column contract and wrapping allowed-value hook:

```ts
expect(css).toContain(
  'grid-template-columns: minmax(0, 1fr) 400px;',
);
expect(css).toMatch(
  /\.openapi-schema-allowed-values[^}]*flex-wrap/s,
);
```

Run:

```bash
bun run test src/styles/app-css-regressions.test.ts
```

Expected: FAIL while the rail still uses `clamp(320px, 32cqi, 400px)` and the
new schema hooks are absent.

- [ ] **Step 5: Implement scoped styles**

Change only the OpenAPI container rule:

```css
@container (min-width: 56rem) {
  .openapi-operation-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
    align-items: start;
  }
}

.openapi-schema-field-name {
  font-weight: 600;
}

.openapi-schema-allowed-values {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
```

Do not alter the existing single-column default, sticky height, or rail
overflow behavior.

- [ ] **Step 6: Run focused tests and commit**

```bash
bun run test src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app-css-regressions.test.ts
git add src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app.css src/styles/app-css-regressions.test.ts
git commit -m "feat: clarify OpenAPI operation layout"
```

Expected: operation integration and CSS regression tests PASS.

## Task 6: Update end-to-end component expectations

**Files:**

- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/components/openapi/OpenApiSchema.test.tsx`

- [ ] **Step 1: Add a realistic join-schema regression**

Extend the existing Conversational AI fixture with `remote_rtc_uids`, an enum
area, optional advanced features, and `additionalProperties: true`. Assert all
acceptance criteria in one integration flow:

```tsx
const filter = screen.getByRole('searchbox', {
  name: 'Filter Properties',
});
fireEvent.change(filter, { target: { value: 'remote_rtc_uids' } });
expect(screen.getByText('properties.remote_rtc_uids')).toBeVisible();
expect(screen.getByText('1 match')).toBeVisible();
expect(screen.queryByText('[key: string]')).not.toBeInTheDocument();
expect(screen.getAllByText('Required').length).toBeGreaterThan(0);
expect(screen.getAllByText('Optional').length).toBeGreaterThan(0);
expect(screen.getByText('Allowed values')).toBeVisible();
```

- [ ] **Step 2: Run the integration test and verify RED if any acceptance behavior is missing**

```bash
bun run test src/components/openapi/FumadocsOpenApiContent.test.tsx -t "renders a readable nested join schema"
```

Expected: FAIL for any unintegrated behavior; do not weaken assertions.

- [ ] **Step 3: Make only the minimal integration corrections**

Wire missing labels, props, or data hooks. Do not add new schema features or
change OpenAPI documents.

- [ ] **Step 4: Run all affected tests and commit**

```bash
bun run test src/lib/openapi/schema-view.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/OpenApiResponses.test.tsx src/styles/app-css-regressions.test.ts
git add src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiSchema.test.tsx
git commit -m "test: cover readable OpenAPI references"
```

Expected: every affected OpenAPI and CSS test passes.

## Task 7: Type, lint, visual, and baseline verification

**Files:**

- Modify only if verification exposes an in-scope defect.

- [ ] **Step 1: Run type checking**

```bash
bun run types:check
```

Expected: exit 0.

- [ ] **Step 2: Run Biome on changed implementation files**

```bash
bunx biome check \
  src/lib/openapi/schema-view.ts \
  src/lib/openapi/schema-view.test.ts \
  src/components/openapi/OpenApiSchemaFieldRow.tsx \
  src/components/openapi/OpenApiSchemaFieldRow.test.tsx \
  src/components/openapi/OpenApiSchemaTree.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/components/openapi/OpenApiSchema.tsx \
  src/components/openapi/OpenApiSchema.test.tsx \
  src/components/openapi/FumadocsOpenApiContent.tsx \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/styles/app-css-regressions.test.ts
```

Expected: exit 0 with no diagnostics.

- [ ] **Step 3: Start the preview and perform browser verification**

```bash
bun run dev
```

Use the deployed-equivalent Conversational AI join route. At 1440px and 390px,
in light and dark modes, verify:

- POST remains beside the endpoint URL and uses the POST variant.
- The examples rail is 400px only in the two-column layout.
- Only root required expandable fields start open.
- `channel` and `remote_rtc_uids` search successfully with full paths/counts.
- Expand all, collapse all, Escape, Enter, native find, and field permalinks
  reveal the intended fields.
- `Allowed values` wraps code tokens without a card, list, or horizontal page
  overflow.
- `[key: string] any` is absent.

- [ ] **Step 4: Run affected tests again after visual fixes**

Run the Task 6 affected-test command. Expected: all PASS.

- [ ] **Step 5: Compare the repository-wide baseline**

```bash
bun run test
```

Expected baseline: 41 pre-existing failures outside the changed OpenAPI/CSS
files and no new failures. Save the failing test names for the handoff rather
than claiming the repository is fully green.

- [ ] **Step 6: Review the final diff and commit verification-only fixes**

```bash
git diff --check
git status --short
git diff --stat 8d2fe4bc9790c56536a08b760dc66b89541f7ac4...HEAD
```

If verification required in-scope fixes, commit them:

```bash
git add src/lib/openapi src/components/openapi src/styles/app.css src/styles/app-css-regressions.test.ts
git commit -m "fix: polish OpenAPI readability interactions"
```

Expected: no whitespace errors; no unrelated files changed.
