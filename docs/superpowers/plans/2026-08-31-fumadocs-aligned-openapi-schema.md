# Fumadocs-aligned OpenAPI schema implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace PR #1034's parallel field renderer with the official Fumadocs Schema UI while retaining Agora's examples rail, response organization, localization, extensions, and visual tokens.

**Architecture:** Treat `createOpenAPIPage` and its render-context `SchemaUI` as the schema-rendering seam. Request bodies and parameters consume official slots; the retained response accordion receives `ctx.SchemaUI` as a module dependency. Local code owns operation composition, not schema interaction.

**Tech Stack:** TypeScript, React 19, TanStack Start, Fumadocs OpenAPI 11.2.2, Fuma Translate, Vitest, Testing Library, Tailwind CSS v4.

---

### Task 1: Establish the official Schema UI behavior contract

**Files:**
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/components/docs-shell/DocsContent.test.tsx`
- Create: `src/components/openapi/OpenApiSchema.test.tsx`

- [ ] **Step 1: Replace the custom-tree expectations with official user behavior**

Add assertions that request and parameter objects expose the `Filter Properties` input, filtering hides non-matching fields, clearing restores them, requiredness uses `*`/`?`, and clicking an object type opens the nested-object filter.

- [ ] **Step 2: Add the response integration expectation**

Render multiple response statuses and assert that the expanded response exposes the official property filter while the response accordion behavior remains unchanged.

- [ ] **Step 3: Add the locale propagation expectation**

Assert that `DocsContent` passes `zh-CN` into `FumadocsOpenApiContent`, and that schema UI labels use the Chinese translation map.

- [ ] **Step 4: Add the browser-find bridge contract**

Assert that a nested field name is present in a neutral `hidden="until-found"` search node, `beforematch` writes the official `path` and `s-highlight` URL state, and the official nested surface opens while unrelated objects remain closed.

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```bash
bun run test -- src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/docs-shell/DocsContent.test.tsx
```

Expected: failures for missing official filter/type navigation and missing locale propagation.

### Task 2: Reconnect the official schema-rendering seam

**Files:**
- Create: `src/components/openapi/OpenApiSchema.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.tsx`
- Modify: `src/components/openapi/OpenApiResponses.tsx`
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Modify: `package.json`
- Modify: `bun.lock`

- [ ] **Step 1: Add the official Schema UI package as a direct dependency**

Add `@fumadocs/api-docs` at the exact version used by `fumadocs-openapi` so the adapter consumes supported official exports without relying on an undeclared transitive dependency.

- [ ] **Step 2: Replace the custom-tree override with the official adapter**

Use official `generateSchemaUI` and `SchemaUI` for every field row, filter, nested type control, metadata tag, and link. Add only the neutral browser-find bridge described in the design.

- [ ] **Step 3: Render official parameter slots**

Replace `OpenApiParameters` with `slots.parameters` in the operation composition, keeping Agora documentation sections in their current order.

- [ ] **Step 4: Inject `ctx.SchemaUI` into the response presentation**

Pass the render-context module through `OpenApiOperationLayoutWithSource` and `OpenApiEnglishResponses`. Render each selected response schema with:

```tsx
<SchemaUI
  client={{ as: 'body', name: 'response' }}
  readOnly
  root={schema}
/>
```

Use the existing normalized response model only for status, media, headers, and empty-schema states.

- [ ] **Step 5: Add Fuma Translate localization**

Wrap the OpenAPI page in `TranslationProvider` with stable Chinese keys such as `Filter Properties(schema UI)` and `Deprecated(schema UI)`. Pass `currentLocale` from `DocsContent`.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the Task 1 command. Expected: all selected tests pass.

### Task 3: Remove the rejected custom renderer

**Files:**
- Delete: `src/components/openapi/OpenApiSchemaTree.tsx`
- Delete: `src/components/openapi/OpenApiSchemaTree.test.tsx`
- Delete: `src/components/openapi/OpenApiFieldRow.tsx`
- Delete: `src/components/openapi/OpenApiFieldRow.test.tsx`
- Create: `src/components/openapi/OpenApiResponseHeaderRow.tsx`
- Create: `src/components/openapi/OpenApiResponseHeaderRow.test.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.tsx`
- Modify: `src/styles/app.css`
- Modify: `src/styles/app-css-regressions.test.ts`

- [ ] **Step 1: Remove dead adapters, label helpers, and imports**

Delete `OpenApiSchemaTreeAdapter`, custom schema disclosure labels, custom initial expansion, and per-row renderer wiring.

- [ ] **Step 2: Narrow response-header presentation**

Replace `OpenApiFieldRow` with `OpenApiResponseHeaderRow`. Its interface accepts only the response-header name, type, deprecated state, anchor, and rendered details; it has no disclosure or requiredness props.

- [ ] **Step 3: Replace CSS regression expectations**

Delete tests for custom nesting guides, row cards, badge stacking, and `hidden="until-found"`. Add assertions that the OpenAPI layer does not override official property-row density and that Agora semantic focus, border, and dark-mode tokens remain applied.

- [ ] **Step 4: Run component and CSS tests**

Run:

```bash
bun run test -- src/components/openapi src/styles/app-css-regressions.test.ts
```

Expected: all selected tests pass with no references to deleted custom modules.

### Task 4: Verify rendered behavior and regressions

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/styles/app-css-regressions.test.ts`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/components/openapi/OpenApiSchema.test.tsx`

- [ ] **Step 1: Run repository verification**

```bash
bun run test
bun run types:check
bun run lint
bun run build
```

Expected: every command exits 0.

- [ ] **Step 2: Verify desktop, tablet, and mobile routes**

On the Conversational AI `join` route, inspect 1440 px, 1280 px, 1200 px, and 480 px in light and dark mode. Check property filtering, nested navigation, response statuses, sticky rail behavior, bounded code scrolling, focus visibility, and document-level horizontal overflow.

- [ ] **Step 3: Record quantitative mobile evidence**

Measure `document.documentElement.scrollHeight` and `scrollWidth <= clientWidth` at 480 px. Expected: page height is materially below PR #1034's approximately 10,149 px and no horizontal overflow exists.

- [ ] **Step 4: Review the diff for scope and generated files**

Confirm only OpenAPI presentation, tests, design/plan documents, and necessary locale propagation changed. Do not include unrelated untracked workspace files.
