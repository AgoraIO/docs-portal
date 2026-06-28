# Remove `full-page` Layout Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the four api-reference catalog pages render at normal docs width (720px) and delete the now-unused `full-page` layout mode, leaving exactly two modes: `docs` and `openapi`.

**Architecture:** Layout width is driven by `layoutMode`, resolved server-side. Today three modes exist (`docs | full-page | openapi`); `full-page` is "wide" and is triggered only by `full: true` frontmatter, used by exactly four catalog pages. After this change the only "wide" mode is `openapi`, so every "is wide" check collapses to `layoutMode === 'openapi'` and the `isWideDocsLayout` helper is deleted. OpenAPI rendering is untouched.

**Tech Stack:** React, TanStack Router, Radix Tabs, Tailwind, fumadocs-mdx (zod frontmatter schema), Vitest + Testing Library (happy-dom), TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-27-remove-full-page-layout-design.md`

---

## File Structure

**Content (remove `full: true`):**
- `content/docs/en/api-reference/recipes.mdx`
- `content/docs/en/api-reference/sdks.mdx`
- `content/docs/en/api-reference/faq/index.mdx`
- `content/docs/en/api-reference/api-ref/index.mdx`

**Source:**
- `source.config.ts` — drop the `full` frontmatter schema field.
- `src/lib/docs-layout.ts` — narrow `DocsLayoutMode`, delete `isWideDocsLayout`.
- `src/lib/docs-page.server.ts` — inline the layout-mode resolution, delete `resolveDocsLayoutMode`.
- `src/components/docs-shell/DocsShell.tsx` — collapse wide checks to openapi; remove the wide grid const and the TOC placeholder.
- `src/components/docs-shell/DocsContent.tsx` — key off `effectiveLayoutMode === 'openapi'`.
- `src/components/docs-shell/DocsMainColumn.tsx` — key off `layoutMode === 'openapi'`.

**Tests:**
- `src/components/docs-shell/DocsContent.test.tsx` — repoint two full-page tests to openapi.
- `src/components/docs-shell/DocsShell.test.tsx` — delete the full-page test.
- `src/lib/docs-page.server.test.ts` — recipes payload resolves to `docs`.
- `src/lib/openapi/lanes.test.ts` — guard that catalog routes never match a lane.

**Two tasks:** Task 1 removes `full: true` from content (the user-visible fix; suite stays green with the mode still present). Task 2 removes the `full-page` mode and schema field and updates tests. Each task ends compiling and green.

---

### Task 1: Remove `full: true` from the four catalog pages

This alone fixes the rendered width: with no `full` frontmatter, each page resolves to `docs`. The `full-page` mode code still exists (removed in Task 2), so the whole test suite stays green.

**Files:**
- Modify: `content/docs/en/api-reference/recipes.mdx`
- Modify: `content/docs/en/api-reference/sdks.mdx`
- Modify: `content/docs/en/api-reference/faq/index.mdx`
- Modify: `content/docs/en/api-reference/api-ref/index.mdx`

- [ ] **Step 1: Delete the `full: true` line from each file's frontmatter**

In each of the four files, the frontmatter block contains a line `full: true`. Delete only that line, leaving `title`, `description`, etc. intact.

`recipes.mdx` frontmatter becomes:
```mdx
---
title: Recipes
description: Agora Recipes is a growing catalog of runnable examples, integration patterns, and end-to-end references across Agora products.
---
```

`sdks.mdx` frontmatter becomes:
```mdx
---
title: Download SDKs
description: Download Agora SDKs by product, platform, and version.
---
```

`faq/index.mdx` frontmatter becomes:
```mdx
---
title: FAQ
---
```

`api-ref/index.mdx` frontmatter becomes:
```mdx
---
title: API reference
description: API references across Agora products and platforms — migrated SDK references and links to the hosted SDK API documentation.
---
```

- [ ] **Step 2: Confirm no other content sets `full`**

Run: `grep -rnE "^full:" content`
Expected: no output (all four removed; nothing else uses it).

- [ ] **Step 3: Run the docs-page server tests to confirm the suite is still green**

Run: `bun run test src/lib/docs-page.server.test.ts`
Expected: PASS. The recipes payload test still asserts `'full-page'` — it injects `full: true` via a mock, not the content file, so it is unaffected by this task.

- [ ] **Step 4: Commit**

```bash
git add content/docs/en/api-reference/recipes.mdx content/docs/en/api-reference/sdks.mdx content/docs/en/api-reference/faq/index.mdx content/docs/en/api-reference/api-ref/index.mdx
git commit -m "fix: render api-reference catalog pages at normal docs width"
```

---

### Task 2: Delete the `full-page` layout mode

Type-coupled refactor: removing `'full-page'` from the union and deleting `isWideDocsLayout` must land together with their consumers and tests. Vitest uses esbuild and does not type-check, so `tsc --noEmit` is the gate that catches stragglers.

**Files:**
- Modify: `source.config.ts:21`
- Modify: `src/lib/docs-layout.ts`
- Modify: `src/lib/docs-page.server.ts:306-309,949-958`
- Modify: `src/components/docs-shell/DocsShell.tsx:36,56-64,170-179,408-416`
- Modify: `src/components/docs-shell/DocsContent.tsx:14,74,105,253`
- Modify: `src/components/docs-shell/DocsMainColumn.tsx:7,99`
- Test: `src/components/docs-shell/DocsContent.test.tsx:235,1035`
- Test: `src/components/docs-shell/DocsShell.test.tsx:584-605`
- Test: `src/lib/docs-page.server.test.ts` (recipes payload, ~line 3360-3397)
- Test: `src/lib/openapi/lanes.test.ts`

- [ ] **Step 1: Update the tests to the two-mode world**

In `src/components/docs-shell/DocsContent.test.tsx`, change the test at line 235. Replace:
```tsx
  it('renders full-page MDX content without the article max-width or mobile TOC', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        layoutMode="full-page"
        slug="recipes"
        title="Recipes"
        toc={[{ depth: 2, title: 'Browse all recipes', url: '#browse' }]}
      />,
    );
```
with:
```tsx
  it('renders openapi-layout content without the article max-width or mobile TOC', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        layoutMode="openapi"
        slug="recipes"
        title="Recipes"
        toc={[{ depth: 2, title: 'Browse all recipes', url: '#browse' }]}
      />,
    );
```

In the same file, change the test at line 1035. Replace:
```tsx
  it('widens footer content in full-page layout', async () => {
    renderWithRouter(
      <DocsMainColumn layoutMode="full-page">
        <article>Body</article>
      </DocsMainColumn>,
    );
```
with:
```tsx
  it('widens footer content in openapi layout', async () => {
    renderWithRouter(
      <DocsMainColumn layoutMode="openapi">
        <article>Body</article>
      </DocsMainColumn>,
    );
```

In `src/components/docs-shell/DocsShell.test.tsx`, delete the entire test spanning lines 584-605 (`it('keeps the full-page layout on the stable docs shell without the generic toc rail', …)` through its closing `});`). Leave the preceding openapi test (ending at line 582) untouched — its `expect(screen.queryByTestId('docs-toc-rail-placeholder')).not.toBeInTheDocument()` stays valid.

In `src/lib/docs-page.server.test.ts`, in the recipes payload test (~line 3360), remove the now-inert `full: true,` line from the mocked `data` object:
```tsx
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/recipes/index.md',
          path: 'en/api-reference/recipes/index.md',
        },
        title: 'Recipes',
      },
```
and change the assertion (~line 3397):
```tsx
    expect(payload.layoutMode).toBe('docs');
```

- [ ] **Step 2: Add the lane-route guard test**

In `src/lib/openapi/lanes.test.ts`, add `resolveOpenApiLaneRoute` to the import from `./lanes`:
```tsx
import {
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
  getOpenApiPrerenderPaths,
  resolveOpenApiEndpointRoute,
  resolveOpenApiLaneRoute,
} from './lanes';
```
and add this test inside the `describe('openapi lanes', () => { … })` block:
```tsx
  it('does not match the api-reference catalog routes to any lane', () => {
    for (const slug of [['recipes'], ['sdks'], ['faq'], ['api-ref']]) {
      expect(resolveOpenApiLaneRoute('en', 'api-reference', slug)).toBeNull();
    }
  });
```
This locks in that the catalog routes take the `docs` path, not the wide `openapi` path.

- [ ] **Step 3: Run the updated tests to see the expected pre-code state**

Run: `bun run test src/lib/openapi/lanes.test.ts src/lib/docs-page.server.test.ts src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx`
Expected: PASS. The lane guard is true today; the recipes mock no longer injects `full`, so it already resolves to `docs`; openapi layout already renders wide; and the openapi DocsShell test still holds (the placeholder is absent for openapi regardless). The remaining work is the type-level removal, which only `tsc` enforces (Step 9) — vitest does not type-check.

- [ ] **Step 4: Narrow the layout-mode type and delete the helper**

In `src/lib/docs-layout.ts`, replace the entire file contents:
```ts
export type DocsLayoutMode = 'docs' | 'openapi';
```

- [ ] **Step 5: Inline the layout-mode resolution in the server**

In `src/lib/docs-page.server.ts`, delete the `resolveDocsLayoutMode` function (lines 949-958):
```ts
function resolveDocsLayoutMode(
  page: PageWithSource,
  isOpenApiPage: boolean,
): DocsLayoutMode {
  if (isOpenApiPage) {
    return 'openapi';
  }

  return 'full' in page.data && page.data.full ? 'full-page' : 'docs';
}
```
and replace the call site (lines 306-309):
```ts
  const layoutMode = resolveDocsLayoutMode(
    page,
    isOpenApiPage || openApiLaneRoute !== null,
  );
```
with:
```ts
  const layoutMode: DocsLayoutMode =
    isOpenApiPage || openApiLaneRoute !== null ? 'openapi' : 'docs';
```
The `import type { DocsLayoutMode } from './docs-layout';` at line 4 stays (used in the annotation).

- [ ] **Step 6: Collapse wide checks in DocsShell**

In `src/components/docs-shell/DocsShell.tsx`:

Change the import at line 36 from:
```tsx
import { type DocsLayoutMode, isWideDocsLayout } from '@/lib/docs-layout';
```
to:
```tsx
import type { DocsLayoutMode } from '@/lib/docs-layout';
```

Delete the unused wide-grid constant (lines 61-62):
```tsx
const DOCS_WIDE_DESKTOP_GRID_CLASS_NAME =
  'xl:grid-cols-[256px_minmax(0,1fr)_220px]';
```

Replace the layout flags (lines 170-179):
```tsx
  const isWideLayout = isWideDocsLayout(layoutMode);
  const shellWidthClassName = isWideLayout
    ? DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME
    : DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  const desktopGridClassName =
    layoutMode === 'openapi'
      ? DOCS_OPENAPI_DESKTOP_GRID_CLASS_NAME
      : isWideLayout
        ? DOCS_WIDE_DESKTOP_GRID_CLASS_NAME
        : DOCS_DESKTOP_GRID_CLASS_NAME;
```
with:
```tsx
  const isOpenApiLayout = layoutMode === 'openapi';
  const shellWidthClassName = isOpenApiLayout
    ? DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME
    : DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  const desktopGridClassName = isOpenApiLayout
    ? DOCS_OPENAPI_DESKTOP_GRID_CLASS_NAME
    : DOCS_DESKTOP_GRID_CLASS_NAME;
```

Replace the TOC rail block (lines 408-416):
```tsx
          {layoutMode === 'openapi' ? null : isWideLayout ? (
            <div
              aria-hidden="true"
              className="hidden h-full min-h-0 w-[220px] shrink-0 xl:block"
              data-testid="docs-toc-rail-placeholder"
            />
          ) : (
            <DocsTocRail locale={currentLocale} toc={toc} />
          )}
```
with:
```tsx
          {isOpenApiLayout ? null : (
            <DocsTocRail locale={currentLocale} toc={toc} />
          )}
```

- [ ] **Step 7: Collapse wide checks in DocsContent**

In `src/components/docs-shell/DocsContent.tsx`:

Change the import at line 14 from:
```tsx
import { type DocsLayoutMode, isWideDocsLayout } from '@/lib/docs-layout';
```
to:
```tsx
import type { DocsLayoutMode } from '@/lib/docs-layout';
```

Replace line 74:
```tsx
  const isWideLayout = isWideDocsLayout(effectiveLayoutMode);
```
with:
```tsx
  const isOpenApiLayout = effectiveLayoutMode === 'openapi';
```

Update the two usages. At line 105:
```tsx
        isWideLayout ? 'max-w-none' : 'max-w-[var(--content-max)]',
```
becomes:
```tsx
        isOpenApiLayout ? 'max-w-none' : 'max-w-[var(--content-max)]',
```
At line 253:
```tsx
      {isWideLayout ? null : (
```
becomes:
```tsx
      {isOpenApiLayout ? null : (
```

- [ ] **Step 8: Collapse the wide check in DocsMainColumn and drop the schema field**

In `src/components/docs-shell/DocsMainColumn.tsx`, change the import at line 7 from:
```tsx
import { type DocsLayoutMode, isWideDocsLayout } from '@/lib/docs-layout';
```
to:
```tsx
import type { DocsLayoutMode } from '@/lib/docs-layout';
```
and replace line 99:
```tsx
        isWideDocsLayout(layoutMode)
```
with:
```tsx
        layoutMode === 'openapi'
```

In `source.config.ts`, delete line 21:
```ts
  full: z.boolean().optional(),
```

- [ ] **Step 9: Type-check the whole project**

Run: `bunx tsc --noEmit -p tsconfig.json`
Expected: exit 0, no errors. (Baseline is clean, so any error here is newly introduced — e.g. a stray `layoutMode="full-page"` or leftover `isWideDocsLayout` reference.)

- [ ] **Step 10: Run all affected test files**

Run: `bun run test src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/docs-page.server.test.ts src/lib/openapi/lanes.test.ts`
Expected: PASS. (DocsMainColumn behavior is covered inside `DocsContent.test.tsx`; there is no separate test file for it.)

- [ ] **Step 11: Lint/format the changed files**

Run: `bunx biome check --write source.config.ts src/lib/docs-layout.ts src/lib/docs-page.server.ts src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsMainColumn.tsx src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/docs-page.server.test.ts src/lib/openapi/lanes.test.ts`
Then re-run: `bunx biome check source.config.ts src/lib/docs-layout.ts src/lib/docs-page.server.ts src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsMainColumn.tsx`
Expected: "No fixes applied" / no errors.

- [ ] **Step 12: Commit**

```bash
git add source.config.ts src/lib/docs-layout.ts src/lib/docs-page.server.ts src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsMainColumn.tsx src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/docs-page.server.test.ts src/lib/openapi/lanes.test.ts
git commit -m "refactor: remove full-page layout mode, leaving docs and openapi"
```

---

### Task 3: Manual verification

jsdom/happy-dom does not do real layout, so confirm the width by eye once.

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: the site serves locally (note the printed URL).

- [ ] **Step 2: Check the four catalog pages**

Visit `/en/api-reference/recipes`, `/en/api-reference/sdks`, `/en/api-reference/faq`, `/en/api-reference/api-ref`. Confirm the content band matches a normal docs page (~720px), not the previous full-width sprawl, and that there is no empty right-hand gutter beyond the normal TOC rail.

Expected: catalog content sits in the normal docs column width.

- [ ] **Step 3: Confirm openapi is unchanged**

Visit one real REST endpoint page, e.g. `/en/api-reference/api-ref/conversational-ai/` (open any operation under it). Confirm it still renders in the wide two-column layout (no TOC rail), exactly as before.

Expected: openapi endpoint pages are visually unchanged.

- [ ] **Step 4: Stop the dev server**

Stop the `bun run dev` process.

---

## Self-Review

**Spec coverage:**
- Content: remove `full: true` from 4 files → Task 1. ✓
- Schema: remove `full` from `source.config.ts` → Task 2 Step 8. ✓
- `DocsLayoutMode` → `'docs' | 'openapi'`, delete `isWideDocsLayout` → Task 2 Step 4. ✓
- Inline `resolveDocsLayoutMode` → Task 2 Step 5. ✓
- DocsShell (remove wide grid const + placeholder, openapi checks) → Task 2 Step 6. ✓
- DocsContent (`effectiveLayoutMode === 'openapi'`) → Task 2 Step 7. ✓
- DocsMainColumn (`layoutMode === 'openapi'`) → Task 2 Step 8. ✓
- Tests: DocsContent ×2 → openapi (Step 1); delete DocsShell full-page test, keep openapi line 573 (Step 1); recipes payload → `docs` (Step 1); lane guard for all four routes (Step 2). ✓
- No inert frontmatter-grep test added. ✓ (Behavioral guards used instead.)
- Manual check (catalogs 720px + openapi unchanged) → Task 3. ✓

**Placeholder scan:** No TBD/TODO; every code and command step is concrete.

**Type consistency:** `DocsLayoutMode` stays imported where annotated (server line 4; components as type-only). `isOpenApiLayout` is the consistent local flag name in DocsShell and DocsContent; DocsMainColumn inlines `layoutMode === 'openapi'`. No reference to the deleted `isWideDocsLayout` or `DOCS_WIDE_DESKTOP_GRID_CLASS_NAME` remains. `DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME` and `DOCS_OPENAPI_DESKTOP_GRID_CLASS_NAME` are retained (used by openapi).
