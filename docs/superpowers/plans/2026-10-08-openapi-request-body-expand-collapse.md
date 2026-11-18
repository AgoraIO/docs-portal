# OpenAPI Request Body Expand/Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localized, accessible “全部展开 / 全部折叠” control above each OpenAPI request Body Schema tree.

**Architecture:** Keep expansion state inside `OpenApiSchemaTree`, alongside the existing `expandedIds` set. Derive expandable node IDs recursively, use them for the bulk toggle and dynamic button label, and preserve per-node, URL reveal, native find, and schema reset behavior. Pass the two labels through the existing schema label object so English and Chinese use the current translation system.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Fumadocs OpenAPI components, lucide-react, Biome.

---

### Task 1: Add the bulk-control state model and request-body toolbar

**Files:** `src/components/openapi/OpenApiSchemaTree.tsx`, `src/components/openapi/OpenApiSchema.tsx`, and `src/components/openapi/OpenApiSchemaTree.test.tsx`.

- [ ] **Step 1: Add a failing tree test for the control and bulk actions.** Extend the existing fixtures with a body tree containing one required expandable node, one optional expandable node, and leaf descendants. Render it with `expandAll: 'Expand all'` and `collapseAll: 'Collapse all'`. Assert that the toolbar initially says `Expand all`; clicking it sets every expandable node's `aria-expanded` to `true` and changes the button to `Collapse all`; clicking again sets every expandable node to `false` and returns the label to `Expand all`. Add a leaf-only case that asserts no bulk button is rendered.

- [ ] **Step 2: Run the focused test and verify it fails for the missing control.** Run `bun run test -- src/components/openapi/OpenApiSchemaTree.test.tsx`. The new assertions should fail because the labels and toolbar do not exist yet.

- [ ] **Step 3: Add localized bulk-control labels.** Extend `OpenApiSchemaTreeLabels` with `expandAll` and `collapseAll`. Add matching values in `getOpenApiSchemaLabels` using the existing translation object and key pattern. Keep visible text out of the tree component.

- [ ] **Step 4: Implement recursive expandable-node collection.** Add this pure helper next to `getInitialExpandedIds`:

```ts
function getExpandableNodeIds(nodes: OpenApiSchemaViewNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.children.length > 0 ? [node.id] : []),
    ...getExpandableNodeIds(node.children),
  ]);
}
```

Memoize the IDs from `nodes`. Compute `allExpanded` only when the list is non-empty and every ID exists in `expandedIds`. Add a callback that either adds all IDs to a new `Set` or removes them all.

- [ ] **Step 5: Render the toolbar only when fields are expandable.** Inside the existing tree root, render a right-aligned toolbar before `data-openapi-schema-fields`. Use an accessible `button type="button"`, the dynamic localized label, and the project’s existing button/icon conventions. Keep it inside `OpenApiSchemaTree` so it scopes to one request Body Schema instance. Do not render it when the expandable ID list is empty.

- [ ] **Step 6: Run focused tests and type checks.** Run `bun run test -- src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx` and `bun run types:check`. The focused tests should pass and TypeScript should report no new errors.

- [ ] **Step 7: Commit implementation and focused tests.** Run `git add src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaTree.test.tsx && git commit -m "feat: add request body schema bulk toggle"`.

### Task 2: Verify integration, accessibility, and formatting

**Files:** Review `src/components/openapi/OpenApiSchemaTree.tsx` and `src/components/openapi/OpenApiSchemaTree.test.tsx`; modify `src/components/openapi/FumadocsOpenApiContent.test.tsx` only if a stable integration assertion is needed.

- [ ] **Step 1: Verify request Body scope.** Use existing `FumadocsOpenApiContent` request-body fixtures to assert the bulk button appears in a request Body Schema while response status controls remain independently rendered. If the tree tests establish this scope without a stable integration fixture, leave the integration file unchanged.

- [ ] **Step 2: Run the OpenAPI component tests.** Run `bun run test -- src/components/openapi`. Confirm URL reveal, native find, manual row toggle, response accordion, and schema identity reset tests still pass. Record unrelated repository baseline failures separately.

- [ ] **Step 3: Run lint and diff checks.** Run `bun run lint` and `git diff --check`. Fix only issues introduced by this feature.

- [ ] **Step 4: Run final focused verification.** Run `bun run test -- src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx`, `bun run types:check`, and `bun run lint`. Report exact failures if any pre-existing tests remain broken.

- [ ] **Step 5: Review the final diff.** Run `git status --short`, `git diff --stat`, and `git diff -- src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaTree.test.tsx`. Verify the button sits above the field list, is limited to each request Body Schema tree, has localized accessible text, and does not alter response or parameter controls.
