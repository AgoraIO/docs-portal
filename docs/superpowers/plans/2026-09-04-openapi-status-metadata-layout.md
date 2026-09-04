# OpenAPI Status Metadata Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve REST API schema readability by moving field status badges inline after the type, removing Optional and deprecated strikethrough, and rendering all schema metadata in a consistent ordered label/value stack.

**Architecture:** Keep OpenAPI parsing and the existing field tree unchanged. Add a focused schema metadata renderer that receives structured `{ label, value }` items; `OpenApiSchema` adapts Fumadocs info-tag elements into those items and controls ordering, while `OpenApiSchemaFieldRow` renders the field identity/status row and delegates metadata layout. Reuse the same metadata renderer for root schema details so Request Body and Response Body follow one visual contract.

**Tech Stack:** TypeScript, React, Fumadocs API docs schema generation, Tailwind utility classes, Vitest Testing Library, Biome, Bun.

---

## File Map

- Create: `src/components/openapi/OpenApiSchemaMetadata.tsx` — typed metadata item model and shared label/value renderer.
- Create: `src/components/openapi/OpenApiSchemaMetadata.test.tsx` — isolated renderer coverage before it is wired into the schema tree.
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx` — inline status badges, no Optional badge, no deprecated strikethrough, metadata renderer integration.
- Modify: `src/components/openapi/OpenApiSchema.tsx` — convert Fumadocs info tags into structured items, sort metadata, supply translated labels, render root metadata through the shared component.
- Modify: `src/components/openapi/OpenApiSchemaTree.tsx` — change the metadata callback type from arbitrary React nodes to structured metadata items.
- Modify: `src/styles/app.css` — stable metadata columns and inline status styling at the existing OpenAPI component boundary.
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx` — focused unit coverage for status placement, Optional removal, deprecated rendering, metadata rows and order.
- Modify: `src/components/openapi/OpenApiSchema.test.tsx` — adapter and root schema metadata coverage.
- Modify: `src/components/openapi/OpenApiSchemaTree.test.tsx` — update callback fixtures and preserve tree behavior assertions.
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx` — join-page integration assertions for the user-visible contract.
- Modify: `src/styles/app-css-regressions.test.ts` — CSS contract assertions for metadata alignment.

## Task 1: Define the Shared Metadata Renderer

**Files:**
- Create: `src/components/openapi/OpenApiSchemaMetadata.tsx`
- Create: `src/components/openapi/OpenApiSchemaMetadata.test.tsx`

- [ ] **Step 1: Add failing renderer assertions.**

In `OpenApiSchemaMetadata.test.tsx`, render `OpenApiSchemaMetadata` directly with `Format`, `Range`, and `Default` ReactNode values. Assert that the output exposes one `.openapi-schema-metadata` container with one `.openapi-schema-metadata-row` per item. Assert each row has `.openapi-schema-metadata-label` and `.openapi-schema-metadata-value`, and that values remain inside the value column instead of being rendered as a single chip.

Keep fixture values as React nodes so the test covers code and block values without depending on Fumadocs private CSS.

- [ ] **Step 2: Run the focused test and verify it fails.**

Run:

```bash
bunx vitest run src/components/openapi/OpenApiSchemaMetadata.test.tsx
```

Expected: FAIL because the metadata renderer and its selectors do not exist yet.

- [ ] **Step 3: Implement the shared typed renderer.**

Create the following public types and component shape:

```tsx
export type OpenApiSchemaMetadataItem = {
  label: string;
  value: ReactNode;
};

export function OpenApiSchemaMetadata({
  items,
}: {
  items: OpenApiSchemaMetadataItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="openapi-schema-metadata">
      {items.map(({ label, value }, index) => (
        <div className="openapi-schema-metadata-row" key={`${label}:${index}`}>
          <span className="openapi-schema-metadata-label">{label}</span>
          <span className="openapi-schema-metadata-value">{value}</span>
        </div>
      ))}
    </div>
  );
}
```

Keep the component presentational: it must not inspect schema objects, sort labels, or introduce interactive controls. Values are `ReactNode` so the existing Fumadocs codeblock renderer and allowed-value code tokens remain intact.

- [ ] **Step 4: Run the focused test and verify it passes.**

Run:

```bash
bunx vitest run src/components/openapi/OpenApiSchemaMetadata.test.tsx
```

Expected: the new metadata structure assertions pass.

- [ ] **Step 5: Commit the renderer.**

```bash
git add src/components/openapi/OpenApiSchemaMetadata.tsx src/components/openapi/OpenApiSchemaMetadata.test.tsx
git commit -m "feat: add OpenAPI schema metadata rows"
```

## Task 2: Normalize and Order Fumadocs Metadata

**Files:**
- Modify: `src/components/openapi/OpenApiSchema.tsx`
- Modify: `src/components/openapi/OpenApiSchemaTree.tsx`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Test: `src/components/openapi/OpenApiSchema.test.tsx`
- Test: `src/components/openapi/OpenApiSchemaTree.test.tsx`

- [ ] **Step 1: Add failing adapter and ordering tests.**

In `OpenApiSchema.test.tsx`, render a schema containing `default`, numeric minimum/maximum, `enum`, `format`, and `pattern`. Assert the schema metadata labels occur in this DOM order:

```text
Default, Range, Allowed values, Format, Pattern
```

Also render a multiline default value through `renderCodeblock` and assert its codeblock remains in the metadata value column. Assert a primitive root schema uses the same `.openapi-schema-metadata` structure.

Update tree fixtures in `OpenApiSchemaTree.test.tsx` to pass `OpenApiSchemaMetadataItem[]` from `renderRemainingInfoTags`, then add an assertion that the callback result is rendered as metadata rows.

- [ ] **Step 2: Run the focused schema tests and verify they fail.**

Run:

```bash
bunx vitest run src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx
```

Expected: FAIL because `OpenApiSchema` currently returns raw React nodes, does not add the allowed-values item to the same list, and root details still render the old flex chip container.

- [ ] **Step 3: Add the structured metadata adapter.**

Import `isValidElement` and `OpenApiSchemaMetadataItem`. Change the metadata callback types in `OpenApiSchema` and `OpenApiSchemaTree` from `ReactNode[]` to `OpenApiSchemaMetadataItem[]`.

Convert each Fumadocs `InlineTag` or `BlockTag` element by reading only its public rendered props:

```tsx
function getSchemaMetadataItem(node: ReactNode): OpenApiSchemaMetadataItem | null {
  if (!isValidElement<{ label?: unknown; children?: ReactNode }>(node)) {
    return null;
  }

  return typeof node.props.label === 'string'
    ? { label: node.props.label, value: node.props.children }
    : null;
}
```

Build the field metadata list as follows:

1. Convert `schema.infoTags` with `Children.toArray` and filter null adapter results.
2. Add the custom `allowedValues` item when `schema.allowedValues` is non-empty, using the existing translated `allowedValues` label and existing unquoted, duplicate-safe code token rendering.
3. Sort items by semantic priority: `Default` first, `Range` second, `Allowed values` third, then preserve the original relative order for all other tags.

Add translated `default` and `range` labels to the OpenAPI schema labels type and `getOpenApiSchemaLabels`. Compare translated labels, not hard-coded English strings, when assigning priority. Keep deprecated out of metadata because the field status badge is its sole representation.

Put the allowed-value token construction in the shared metadata module (or export its focused helper from there) so both field metadata and root metadata use the same unquoted formatting, duplicate-safe keys, and wrapping classes. Do not duplicate token markup in `OpenApiSchema.tsx` and `OpenApiSchemaFieldRow.tsx`.

- [ ] **Step 4: Render root metadata through the shared component.**

Change `renderOpenApiSchemaDetails` to accept the normalized root schema and labels, build the same ordered metadata item list, and render `<OpenApiSchemaMetadata items={items} />` after the description. Preserve the existing root description class and return `null` only when both description and metadata are empty.

- [ ] **Step 5: Run the focused schema tests and verify they pass.**

Run:

```bash
bunx vitest run src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx
```

Expected: PASS, including the metadata order, multiline value, root metadata, and tree callback assertions.

- [ ] **Step 6: Commit the metadata adapter.**

```bash
git add src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx
git commit -m "feat: normalize OpenAPI schema metadata"
```

## Task 3: Move Status Badges Inline and Remove Deprecated Decoration

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Test: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`
- Test: `src/components/openapi/FumadocsOpenApiContent.test.tsx`

- [ ] **Step 1: Replace old status assertions with failing user-facing assertions.**

Update the Required + Deprecated test to assert:

- the field name does not have `line-through`;
- Required and Deprecated are both descendants of `.openapi-schema-field-content`;
- the type element precedes Required, and Required precedes Deprecated in DOM order;
- neither badge has `ml-auto`.

Update the optional-field test to assert `queryByText('Optional')` is `null`. Keep the accessible copy-link assertion.

Update the join-page integration assertions so optional provider/channel fields do not contain Optional, while required and deprecated fields retain their badges.

- [ ] **Step 2: Run the focused component tests and verify they fail.**

Run:

```bash
bunx vitest run src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
```

Expected: FAIL against the current right-aligned badge, Optional badge, and deprecated strikethrough behavior.

- [ ] **Step 3: Implement the inline identity/status layout.**

Remove `labels.optional` from `OpenApiSchemaFieldRowLabels` and `getOpenApiSchemaLabels` once all call sites are updated. Remove the conditional `line-through decoration-2` class from the field name.

Render status badges immediately after `fieldIdentity` inside `.openapi-schema-field-content`:

```tsx
{node.required ? (
  <Badge className="openapi-schema-status ...required-colors" variant="outline">
    {labels.required}
  </Badge>
) : null}
{node.schema.deprecated ? (
  <Badge className="openapi-schema-status ...deprecated-colors" variant="outline">
    {labels.deprecated}
  </Badge>
) : null}
```

Keep the copy-link button as the only item in the right-side action container. Preserve the existing expandable gutter and field content wrapper for parent/leaf alignment. Use `flex-wrap`, `min-w-0`, and the existing gap utilities so statuses follow the type on wide screens and wrap below the identity on narrow screens without pushing content horizontally.

- [ ] **Step 4: Run the focused component tests and verify they pass.**

Run:

```bash
bunx vitest run src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
```

Expected: PASS with no Optional text, no name strikethrough, inline status order, and working copy-link behavior.

- [ ] **Step 5: Commit the status layout.**

```bash
git add src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
git commit -m "feat: align OpenAPI schema status badges inline"
```

## Task 4: Add Stable CSS and Regression Coverage

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Test: `src/styles/app-css-regressions.test.ts`
- Test: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

- [ ] **Step 1: Add failing CSS contract assertions.**

Extend `app-css-regressions.test.ts` with selectors for the new metadata layout and assert the stylesheet contains:

- `.openapi-schema-metadata` using a grid or equivalent two-column layout;
- `.openapi-schema-metadata-label` with a stable width/min-width;
- `.openapi-schema-metadata-value` with `min-width: 0` and wrapping behavior;
- `.openapi-schema-status` without a rule that pushes it to the right.

Add a component test with a long metadata value and assert it is inside `.openapi-schema-metadata-value` and carries the wrapping class/attribute used by the implementation.

- [ ] **Step 2: Run the focused CSS and component tests and verify they fail.**

Run:

```bash
bunx vitest run src/styles/app-css-regressions.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx
```

Expected: FAIL because the new selectors and CSS contract are not present.

- [ ] **Step 3: Implement the responsive metadata CSS.**

Add styles near the existing `.openapi-schema-field-details` rules:

```css
.openapi-schema-metadata {
  display: grid;
  grid-template-columns: minmax(7rem, max-content) minmax(0, 1fr);
  gap: 0.375rem 0.75rem;
  min-width: 0;
  margin-top: 0.5rem;
}

.openapi-schema-metadata-row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  min-width: 0;
  align-items: baseline;
}

.openapi-schema-metadata-label {
  color: var(--muted-foreground);
}

.openapi-schema-metadata-value {
  min-width: 0;
  overflow-wrap: anywhere;
}
```

Use the project’s existing CSS conventions and add a narrow-container media/container rule that changes the metadata stack to one column only when the two-column version cannot fit. Keep value code tokens inline-block and wrapping within the value column. Do not add shadows or large cards.

- [ ] **Step 4: Run focused tests and verify the CSS contract passes.**

Run:

```bash
bunx vitest run src/styles/app-css-regressions.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the CSS and regression coverage.**

```bash
git add src/styles/app.css src/styles/app-css-regressions.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx
git commit -m "feat: align OpenAPI schema metadata columns"
```

## Task 5: Full Verification and Browser Review

**Files:**
- No source changes expected; only update tests if a verified regression exposes a missing assertion from Tasks 1-4.

- [ ] **Step 1: Run the complete relevant OpenAPI test set.**

```bash
bunx vitest run src/components/openapi src/styles/app-css-regressions.test.ts
```

Expected: all OpenAPI component and CSS regression tests pass.

- [ ] **Step 2: Run type checking and lint.**

```bash
bun run types:check
bun run lint
```

Expected: both commands exit successfully with no TypeScript or Biome diagnostics.

- [ ] **Step 3: Start the local docs server in the isolated worktree.**

```bash
bun run dev -- --port 3011
```

If port `3011` is occupied, use another free port and use that URL for browser verification. Do not alter the user’s main worktree server.

- [ ] **Step 4: Verify the join endpoint at desktop width.**

Open `/en/api-reference/api-ref/conversational-ai/join` at approximately 1440px wide and confirm:

- Required/Deprecated appear after the type in the left identity flow;
- Optional is absent;
- deprecated names are not struck through;
- Default, Range, Allowed values and other metadata share one left label column;
- long values stay within the main content without horizontal overflow;
- parent/child names retain their existing tree alignment.

- [ ] **Step 5: Verify the join endpoint at mobile width.**

Use approximately 390px wide and confirm statuses and metadata wrap without overlap, the value column remains readable, and the examples rail/field content does not introduce horizontal page overflow.

- [ ] **Step 6: Inspect the final diff and commit any necessary test-only correction.**

```bash
git diff --check HEAD~4..HEAD
git status --short
```

Expected: no whitespace errors and no untracked or unintended files in the isolated worktree. If browser verification requires a small assertion correction, run the affected test again and commit only that correction with a scoped message.
