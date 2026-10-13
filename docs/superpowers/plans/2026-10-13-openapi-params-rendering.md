# OpenAPI `params` Rendering Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make OpenAPI schema rows render `params` once, show supplier variants without the `[key: string] unknown` placeholder text, and expose each supplier schema's full description behind the same collapse interaction as other nested fields.

**Architecture:** Keep the existing normalized schema tree and union path model. For `oneOf` object branches whose only visible content is an arbitrary-key map, create a branch container node with `detailsCollapsible: true`; the existing tree controls keep it collapsed until clicked, then render the branch schema description and descendants. Adjust `OpenApiSchemaFieldRow` identity rendering to suppress duplicate aliases and replace legacy synthetic map identities with their variant labels. No YAML or schema semantics change.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Biome.

---

### Task 1: Add regression tests for schema row identity

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

- [ ] **Step 1: Add a failing test for duplicate field/type labels**

Render a node whose `name` and `schema.aliasName` are both `params`, then assert the row contains exactly one `params` text node and no separate type span.

- [ ] **Step 2: Add a failing test for supplier variant placeholders**

Render a node with `name: '[key: string]'`, `variant: 'Minimax'`, and both schema names set to `unknown`; assert `Minimax` is visible while `[key: string]` and `unknown` are absent.

- [ ] **Step 3: Run the focused test file**

Run: `bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

Expected: the two new tests fail because the current component renders duplicate aliases and the raw placeholder identity.

### Task 2: Add a failing test for collapsed supplier descriptions

**Files:**
- Modify: `src/lib/openapi/schema-view.test.ts`
- Modify: `src/components/openapi/OpenApiSchema.test.tsx`

- [ ] **Step 1: Add a schema-view test for a branch container**

Use a generated union fixture whose branch has `description: 'Minimax description.'` and only a synthetic `map-any` property. Assert that the view contains a `Minimax` node with `detailsCollapsible: true`, no `[key: string]` child, and the branch description.

- [ ] **Step 2: Add a component test for the interaction**

Render an `OpenApiSchema` root with a required `params` property whose `oneOf` branch has title `Minimax`, a Markdown description containing a code block, and `additionalProperties: {}`. Assert the Minimax row starts collapsed, then click its expand button and assert the description and code content become visible.

### Task 3: Implement collapsible supplier branch nodes

**Files:**
- Modify: `src/lib/openapi/schema-view.ts`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Modify: `src/components/openapi/OpenApiSchemaTree.tsx`

- [ ] **Step 1: Add `detailsCollapsible` to view nodes and branch containers**

When traversing a union branch with no visible descendants, create a node named after the branch title, keep its branch `description`, and mark it `detailsCollapsible: true`.

- [ ] **Step 2: Include collapsible details in tree expansion state**

Treat `detailsCollapsible` nodes as expandable, but do not render an empty descendants wrapper. Keep them collapsed by default unless they are required/root containers.

- [ ] **Step 3: Hide collapsible details until expanded**

Pass the expanded state to `OpenApiSchemaFieldRow`, render its details only when expanded, and expose the same expand/collapse button and accessible labels as other nested fields.

### Task 4: Implement the field identity rendering fix

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`

- [ ] **Step 1: Derive the display identity**

Use a local boolean for a variant-bearing synthetic map node (`name === '[key: string]'` and a non-empty `variant`). For that node, use `variant` as the displayed code label and do not render the map type or parenthesized variant. For all other nodes, keep the current name and variant behavior.

- [ ] **Step 2: Suppress duplicate aliases**

Render the `schema.aliasName` span only when it differs from the displayed field name and the node is not a synthetic variant map row.

- [ ] **Step 3: Run the focused tests**

Run: `bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

Expected: all tests in the file pass, including the two new regression tests.

### Task 5: Verify the OpenAPI rendering surface

**Files:**
- Test: `src/components/openapi/OpenApiSchema.test.tsx`
- Test: `src/lib/openapi/schema-view.test.ts`

- [ ] **Step 1: Run the OpenAPI component and tree suites**

Run: `bun run test src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/lib/openapi/schema-view.test.ts`

Expected: all tests pass.

- [ ] **Step 2: Run type checking and lint**

Run: `bun run types:check`

Expected: exit code 0 with no TypeScript errors.

Run: `bunx biome check src/lib/openapi/schema-view.ts src/lib/openapi/schema-view.test.ts src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchema.test.tsx`

Expected: exit code 0 with no Biome errors in the changed files. The repository-wide lint command may still report unrelated baseline diagnostics.

- [ ] **Step 3: Review the final diff**

Run: `git diff --check && git status --short && git diff -- src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

Expected: only the intended schema view, tree rendering, field-row rendering, tests, and updated design/plan docs are modified after the earlier commits.
