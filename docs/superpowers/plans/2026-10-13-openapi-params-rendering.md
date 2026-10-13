# OpenAPI `params` Rendering Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make OpenAPI schema rows render `params` once and show supplier variants without the `[key: string] unknown` placeholder text.

**Architecture:** Keep the existing normalized schema tree and union path model. Adjust only `OpenApiSchemaFieldRow` field identity rendering: suppress an alias identical to the field name, and replace a variant-bearing synthetic map row's identity with its variant label. No YAML or schema semantics change.

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

### Task 2: Implement the minimal field identity rendering fix

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`

- [ ] **Step 1: Derive the display identity**

Use a local boolean for a variant-bearing synthetic map node (`name === '[key: string]'` and a non-empty `variant`). For that node, use `variant` as the displayed code label and do not render the map type or parenthesized variant. For all other nodes, keep the current name and variant behavior.

- [ ] **Step 2: Suppress duplicate aliases**

Render the `schema.aliasName` span only when it differs from the displayed field name and the node is not a synthetic variant map row.

- [ ] **Step 3: Run the focused tests**

Run: `bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

Expected: all tests in the file pass, including the two new regression tests.

### Task 3: Verify the OpenAPI rendering surface

**Files:**
- Test: `src/components/openapi/OpenApiSchema.test.tsx`
- Test: `src/lib/openapi/schema-view.test.ts`

- [ ] **Step 1: Run the OpenAPI component and tree suites**

Run: `bun run test src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/lib/openapi/schema-view.test.ts`

Expected: all tests pass.

- [ ] **Step 2: Run type checking and lint**

Run: `bun run types:check`

Expected: exit code 0 with no TypeScript errors.

Run: `bun run lint`

Expected: exit code 0 with no Biome errors.

- [ ] **Step 3: Review the final diff**

Run: `git diff --check && git status --short && git diff -- src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx`

Expected: only the intended tests and field-row rendering logic are modified after the plan/spec commits.
