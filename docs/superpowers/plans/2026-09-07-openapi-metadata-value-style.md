# OpenAPI Metadata Value Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `Allowed values`, `Default`, and `Range` render directly below the parameter name and above its description with bold labels and one consistent value-container style.

**Architecture:** Keep schema parsing, metadata extraction/sorting, field status badges, and schema-tree structure unchanged. Update `OpenApiSchemaMetadata` to own label colons and the shared value container, update Allowed values to use one comma-separated container, and move metadata before the description in `OpenApiSchemaFieldRow`. Use inline flow with `min-width: 0` and `overflow-wrap: anywhere` so values remain adjacent when they fit and wrap safely on mobile.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vitest, Testing Library, Biome, Vite, agent-browser.

---

## File map

- Modify `src/components/openapi/OpenApiSchemaMetadata.tsx` — label colons, shared value wrapper, one-container Allowed values.
- Modify `src/components/openapi/OpenApiSchemaFieldRow.tsx` — metadata before description.
- Modify `src/styles/app.css:1140-1165` — replace fixed metadata grid with inline rows and value-container styling.
- Modify `src/components/openapi/OpenApiSchemaMetadata.test.tsx` — markup, adjacency, grouping, and value-content tests.
- Modify `src/components/openapi/OpenApiSchemaFieldRow.test.tsx` — metadata-before-description test and status/copy regression.
- Modify `src/components/openapi/OpenApiSchema.test.tsx` — metadata order/content and value-container regression.
- Inspect `src/components/openapi/OpenApiSchemaTree.test.tsx`; existing tests cover continuous logical guide lines and `hidden="until-found"`, so leave it unchanged unless a selector must be updated.

## Task 1: Write the failing metadata and ordering tests

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaMetadata.test.tsx`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`
- Modify: `src/components/openapi/OpenApiSchema.test.tsx`

- [ ] **Step 1: Test label colons and shared value containers.**

Extend the existing metadata test. After rendering `Format`, `Range`, and `Default`, assert:

```ts
expect(
  Array.from(
    metadata?.querySelectorAll('.openapi-schema-metadata-label') ?? [],
  ).map((element) => element.textContent),
).toEqual(['Format:', 'Range:', 'Default:']);

const values = Array.from(
  metadata?.querySelectorAll('.openapi-schema-metadata-value') ?? [],
);
expect(values).toHaveLength(3);
for (const value of values) {
  expect(value.firstElementChild).toHaveClass('openapi-schema-value-container');
}
```

Add an Allowed values test using `['GLOBAL', 'NORTH_AMERICA', 'EUROPE']`. Assert one `.openapi-schema-value-container`, text `GLOBAL, NORTH_AMERICA, EUROPE`, and no independently bordered child chips.

- [ ] **Step 2: Test metadata order in a field row.**

Render a field with both a description and a `Default` info tag. Assert:

```ts
const details = screen
  .getByText('The user identifier.')
  .closest('.openapi-schema-field-details');
expect(details?.firstElementChild).toHaveClass('openapi-schema-metadata');
expect(details?.lastElementChild).toHaveClass(
  'openapi-schema-field-description',
);
expect(details?.querySelector('.openapi-schema-metadata-label')).toHaveTextContent(
  'Default:',
);
```

- [ ] **Step 3: Update schema-level metadata expectations.**

Keep the existing sort order `Default → Range → Allowed values → Match → Format`, update expected labels to include colons, and assert Default, Range, and Allowed values each use the shared value-container contract. Preserve complex default content and enum value-order assertions.

- [ ] **Step 4: Run the focused tests and confirm red.**

```bash
node node_modules/vitest/vitest.mjs run \
  src/components/openapi/OpenApiSchemaMetadata.test.tsx \
  src/components/openapi/OpenApiSchemaFieldRow.test.tsx \
  src/components/openapi/OpenApiSchema.test.tsx
```

Expected: FAIL because labels have no colons, Allowed values has separate chips, metadata follows description, and the shared class is absent.

- [ ] **Step 5: Review and commit the red tests.**

Spec review: verify coverage of metadata order, exact label/value adjacency, one Allowed values container, preserved sort/content, and no status/tree requirements being removed.

Code-quality review:

```bash
./node_modules/.bin/biome check \
  src/components/openapi/OpenApiSchemaMetadata.test.tsx \
  src/components/openapi/OpenApiSchemaFieldRow.test.tsx \
  src/components/openapi/OpenApiSchema.test.tsx
```

Commit:

```bash
git add \
  src/components/openapi/OpenApiSchemaMetadata.test.tsx \
  src/components/openapi/OpenApiSchemaFieldRow.test.tsx \
  src/components/openapi/OpenApiSchema.test.tsx
git commit -m "test: define OpenAPI metadata value style"
```

## Task 2: Implement metadata presentation and ordering

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaMetadata.tsx`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Modify: `src/styles/app.css:1140-1165`

- [ ] **Step 1: Render labels and values without an inter-column gap.**

In `OpenApiSchemaMetadata.tsx`, preserve item keys and render:

```tsx
<div className="openapi-schema-metadata-row" key={key ?? label}>
  <span className="openapi-schema-metadata-label">{label}:</span>
  <div className="openapi-schema-metadata-value">
    <div className="openapi-schema-value-container">{value}</div>
  </div>
</div>
```

Use inline elements so the value starts immediately after its own colon. Do not add a margin or CSS gap between label and value.

- [ ] **Step 2: Make Allowed values use the metadata container.**

Change `OpenApiSchemaAllowedValues` so it returns only an unbordered `.openapi-schema-allowed-values` content span; the surrounding `OpenApiSchemaMetadata` value wrapper is the single `openapi-schema-value-container`. Render each serialized value as an unbordered child with a comma separator before every item after the first. Preserve `data-openapi-allowed-value-key`, stable keys, serialization, and order. The final metadata DOM must contain one visual border/background for the complete Allowed values list, never nested borders.

- [ ] **Step 3: Move metadata before description.**

In `OpenApiSchemaFieldRow.tsx`, inside the existing `.openapi-schema-field-details` wrapper, render `OpenApiSchemaMetadata` before the description div. Keep the field identity row, status badges, copy button, expandable gutter, child wrapper, conditional details wrapper, and description classes unchanged.

- [ ] **Step 4: Replace the fixed metadata grid with inline CSS.**

Replace the current metadata rules with:

```css
.openapi-schema-metadata {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.openapi-schema-metadata-row {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  flex-wrap: wrap;
  align-items: center;
}

.openapi-schema-metadata-label {
  color: var(--foreground);
  font-weight: 700;
}

.openapi-schema-metadata-value {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.openapi-schema-value-container {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 0.375rem;
  background: var(--bg-sunken);
  color: var(--accent-brand);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
```

Do not add a gap between label and value. Keep the metadata block's vertical gap between rows only.

- [ ] **Step 5: Run green tests and review.**

```bash
node node_modules/vitest/vitest.mjs run src/components/openapi/OpenApiSchemaMetadata.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx
./node_modules/.bin/biome check src/components/openapi/OpenApiSchemaMetadata.tsx src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaMetadata.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/styles/app.css
```

Expected: focused tests and Biome pass. Spec review must confirm name/type → metadata → description, bold labels with colons, immediate adjacency, one Allowed values container, and unchanged schema semantics. Code-quality review must reject nested borders, fixed metadata columns, and unrelated tree changes.

- [ ] **Step 6: Commit the implementation.**

```bash
git add src/components/openapi/OpenApiSchemaMetadata.tsx src/components/openapi/OpenApiSchemaFieldRow.tsx src/styles/app.css
git commit -m "feat: unify OpenAPI metadata values"
```

## Task 3: Protect responsive and existing schema behavior

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaMetadata.test.tsx`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`
- Modify: `src/components/openapi/OpenApiSchema.test.tsx`
- Do not modify `src/components/openapi/OpenApiSchemaTree.tsx`; its existing tests cover guide lines and hidden descendants.

- [ ] **Step 1: Add long-value wrapping coverage.**

Render a long enum/default/range value and assert its closest value container stays inside `.openapi-schema-metadata-value` and has `min-w-0`, `max-w-full`, and `[overflow-wrap:anywhere]` or an equivalent stable class contract.

- [ ] **Step 2: Run the focused OpenAPI suite and review.**

```bash
node node_modules/vitest/vitest.mjs run src/components/openapi/OpenApiSchemaMetadata.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
./node_modules/.bin/biome check src/components/openapi src/styles/app.css
```

Expected: PASS with Required/Optional/Deprecated badges, deprecated strike-through, continuous logical guide lines, `hidden="until-found"`, section headings, and no parameter filters intact. Spec review must cover value style, order, wrapping, and non-goals. Code-quality review must use stable semantic hooks and avoid duplicating tree fixtures.

- [ ] **Step 3: Commit regression coverage.**

```bash
git add src/components/openapi/OpenApiSchemaMetadata.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx
git commit -m "test: protect OpenAPI metadata layout"
```

## Task 4: Run full verification and browser preview validation

**Files:**
- No source changes expected after Task 3. If validation finds a defect, add a failing test in the owning task and repeat its review checkpoint.

- [ ] **Step 1: Run repository checks.**

```bash
node node_modules/vitest/vitest.mjs run
./node_modules/.bin/fumadocs-mdx
./node_modules/.bin/tsc --noEmit --pretty false
./node_modules/.bin/biome check biome.json package.json source.config.ts tsconfig.json vite.config.ts src
git diff --check
```

Record targeted OpenAPI results separately from unrelated repository baseline failures.

- [ ] **Step 2: Start the isolated preview.**

```bash
./node_modules/.bin/vite --host 127.0.0.1 --port 3012
```

URL: `http://127.0.0.1:3012/en/api-reference/api-ref/conversational-ai/join`

- [ ] **Step 3: Validate desktop presentation.**

At 1440px, verify metadata is immediately below name/type and above description; labels are bold with colons; values begin directly after their own colon; all values share border/background/blue monospace styling; Allowed values is one comma-separated container; sort order is unchanged; status badges and tree guides are unchanged. Capture a screenshot.

- [ ] **Step 4: Validate 390px behavior.**

Verify values remain inline when they fit, wrap within the available value area when needed, and satisfy:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Verify metadata remains above description and schema controls/guides remain usable. Capture a screenshot.

- [ ] **Step 5: Perform final review and report.**

Review every item in `docs/superpowers/specs/2026-09-04-openapi-metadata-value-style-design.md`, run `git status --short --untracked-files=all`, and confirm no `.superpowers/brainstorm` files or generated artifacts are committed. Report modified files, exact command results, browser observations, screenshots, and preview URL.
