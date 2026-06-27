# Hide TOC Rail on Catalog Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `hideToc` frontmatter flag that, on the four api-reference catalog pages, hides the right TOC rail and lets content fill the reclaimed space (~960px) while keeping the docs page footprint.

**Architecture:** `hideToc` is read server-side into the page payload, then consumed by two independently-rendered components: `DocsShell` (rail + grid, via the layout route) and `DocsContent` (article width + mobile TOC, via the nested page routes). When set, several conditions that today read `isOpenApiLayout` become `isOpenApiLayout || hideToc`; the shell max-width stays openapi-only, which keeps `hideToc` pages at the docs footprint instead of sprawling to 1600px.

**Tech Stack:** React, TanStack Router (file routes + Outlet), Tailwind, fumadocs-mdx (zod schema), Vitest + Testing Library, TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-27-catalog-pages-hide-toc-design.md`

---

## File Structure

- `source.config.ts` — add `hideToc` to the frontmatter schema.
- `src/lib/docs-page.server.ts` — surface `hideToc` in the payload (the `DocsPagePayload` type is inferred from the return, so adding the field is enough).
- `src/components/docs-shell/DocsShell.tsx` — `hideToc` prop → hide rail, fill grid.
- `src/components/docs-shell/DocsContent.tsx` — `hideToc` prop → article `max-w-none`, suppress mobile TOC.
- `src/routes/$locale/$tab/route.tsx` — pass `hideToc` to `DocsShell`.
- `src/routes/$locale/$tab/index.tsx` and `.../$.tsx` — pass `hideToc` to `DocsContent`.
- Four catalog MDX files — set `hideToc: true`.
- Tests: `docs-page.server.test.ts`, `DocsShell.test.tsx`, `DocsContent.test.tsx`.

Each task ends compiling and green. The feature only goes live in Task 5 (content); Tasks 1-4 add the plumbing with `hideToc` defaulting off, so behavior is unchanged until the flag is set.

---

### Task 1: Surface `hideToc` in schema and payload

**Files:**
- Modify: `source.config.ts`
- Modify: `src/lib/docs-page.server.ts`
- Test: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Extend the recipes payload test**

In `src/lib/docs-page.server.test.ts`, find the recipes payload test (it calls `loadDocsPagePayload('en', 'api-reference', ['recipes'])` and asserts `expect(payload.layoutMode).toBe('docs')`). Add `hideToc: true,` to the mocked `data` object so it reads:

```tsx
      data: {
        ...page.data,
        info: {
          fullPath: '/virtual/content/docs/en/api-reference/recipes/index.md',
          path: 'en/api-reference/recipes/index.md',
        },
        hideToc: true,
        title: 'Recipes',
      },
```

and, immediately after the `expect(payload.layoutMode).toBe('docs');` line, add:

```tsx
    expect(payload.hideToc).toBe(true);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/lib/docs-page.server.test.ts -t "recipes"` (or run the whole file)
Expected: FAIL — `payload.hideToc` is `undefined`, not `true`.

- [ ] **Step 3: Add the schema field and payload field**

In `source.config.ts`, add `hideToc` to `rawDocSchema` (after `hidePlatformTabs`):

```ts
  hidePlatformTabs: z.boolean().optional(),
  hideToc: z.boolean().optional(),
```

In `src/lib/docs-page.server.ts`, in the payload object returned by `loadDocsPagePayload` (the `return { … }` near line 370, which already includes `layoutMode,`), add the `hideToc` field next to `layoutMode`:

```ts
    layoutMode,
    hideToc: page.data.hideToc ?? false,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test src/lib/docs-page.server.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add source.config.ts src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts
git commit -m "feat: surface hideToc frontmatter flag in docs page payload"
```

---

### Task 2: DocsShell hides the rail and fills the grid when `hideToc`

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Test: `src/components/docs-shell/DocsShell.test.tsx`

- [ ] **Step 1: Write the failing test**

In `src/components/docs-shell/DocsShell.test.tsx`, add this test inside the `describe('DocsShell', () => { … })` block (near the other layout tests, e.g. after the openapi-layout test):

```tsx
  it('hides the toc rail and fills the grid when hideToc is set, keeping the docs footprint', async () => {
    renderDocsShell({ layoutMode: 'docs', hideToc: true });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');

    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    expect(docsBodyShell).toHaveClass('xl:grid-cols-[256px_minmax(0,1fr)]');
    expect(docsBodyShell).not.toHaveClass(
      'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]',
    );
    // Footprint stays docs-width, NOT the openapi 1600px wide shell.
    expect(docsBodyShell).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).not.toHaveClass('max-w-[min(100%,1600px)]');
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx -t "hides the toc rail"`
Expected: FAIL — `DocsShell` does not yet accept `hideToc`; the rail still renders and the grid is the 3-column docs grid.

- [ ] **Step 3: Add the `hideToc` prop and use it for rail + grid**

In `src/components/docs-shell/DocsShell.tsx`:

Add `hideToc = false,` to the destructured props (after `layoutMode = 'docs',`):

```tsx
  layoutMode = 'docs',
  hideToc = false,
}: {
```

Add the prop type (after `layoutMode?: DocsLayoutMode;`):

```tsx
  layoutMode?: DocsLayoutMode;
  hideToc?: boolean;
```

Rename the grid constant so it reads correctly for both consumers. Change (near line 61):

```tsx
const DOCS_OPENAPI_DESKTOP_GRID_CLASS_NAME =
  'xl:grid-cols-[256px_minmax(0,1fr)]';
```

to:

```tsx
const DOCS_FILL_DESKTOP_GRID_CLASS_NAME =
  'xl:grid-cols-[256px_minmax(0,1fr)]';
```

Replace the layout-flag block (currently):

```tsx
  const isOpenApiLayout = layoutMode === 'openapi';
  const shellWidthClassName = isOpenApiLayout
    ? DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME
    : DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  const desktopGridClassName = isOpenApiLayout
    ? DOCS_OPENAPI_DESKTOP_GRID_CLASS_NAME
    : DOCS_DESKTOP_GRID_CLASS_NAME;
```

with:

```tsx
  const isOpenApiLayout = layoutMode === 'openapi';
  // Both openapi and hideToc drop the toc rail and let content fill the grid;
  // only openapi widens the overall shell.
  const contentFillsWidth = isOpenApiLayout || hideToc;
  const shellWidthClassName = isOpenApiLayout
    ? DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME
    : DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  const desktopGridClassName = contentFillsWidth
    ? DOCS_FILL_DESKTOP_GRID_CLASS_NAME
    : DOCS_DESKTOP_GRID_CLASS_NAME;
```

Replace the TOC rail block (currently):

```tsx
          {isOpenApiLayout ? null : (
            <DocsTocRail locale={currentLocale} toc={toc} />
          )}
```

with:

```tsx
          {contentFillsWidth ? null : (
            <DocsTocRail locale={currentLocale} toc={toc} />
          )}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx`
Expected: PASS — the new test passes and the existing docs/openapi layout tests still pass (the openapi test checks the class string `xl:grid-cols-[256px_minmax(0,1fr)]`, which the renamed constant still produces).

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx
git commit -m "feat: hide toc rail and fill grid in DocsShell when hideToc is set"
```

---

### Task 3: DocsContent widens the article and drops the mobile TOC when `hideToc`

**Files:**
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Test: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Write the failing test**

In `src/components/docs-shell/DocsContent.test.tsx`, add this test inside the `describe` block (near the openapi-layout content test):

```tsx
  it('drops the article max-width and mobile TOC when hideToc is set in docs layout', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        hideToc
        layoutMode="docs"
        slug="recipes"
        title="Recipes"
        toc={[{ depth: 2, title: 'Browse all recipes', url: '#browse' }]}
      />,
    );

    const article = await screen.findByRole('article');

    expect(article).toHaveClass('max-w-none');
    expect(article).not.toHaveClass('max-w-[var(--content-max)]');
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/components/docs-shell/DocsContent.test.tsx -t "hideToc"`
Expected: FAIL — `DocsContent` does not accept `hideToc`; the article keeps `max-w-[var(--content-max)]` and the mobile TOC renders.

- [ ] **Step 3: Add the `hideToc` prop and use it for width + mobile TOC**

In `src/components/docs-shell/DocsContent.tsx`:

Add `hideToc = false,` to the destructured props (after `layoutMode = 'docs',`):

```tsx
  layoutMode = 'docs',
  hideToc = false,
  sidebarHeader,
```

Add the prop type (after `layoutMode?: DocsLayoutMode;`):

```tsx
  layoutMode?: DocsLayoutMode;
  hideToc?: boolean;
```

Replace the layout flag line (currently `const isOpenApiLayout = effectiveLayoutMode === 'openapi';`) with:

```tsx
  const isOpenApiLayout = effectiveLayoutMode === 'openapi';
  // openapi and hideToc both let the article fill the width and hide the toc.
  const contentFillsWidth = isOpenApiLayout || hideToc;
```

Change the article max-width line (currently):

```tsx
        isOpenApiLayout ? 'max-w-none' : 'max-w-[var(--content-max)]',
```

to:

```tsx
        contentFillsWidth ? 'max-w-none' : 'max-w-[var(--content-max)]',
```

Change the mobile TOC guard (currently `{isOpenApiLayout ? null : (`) to:

```tsx
      {contentFillsWidth ? null : (
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test src/components/docs-shell/DocsContent.test.tsx`
Expected: PASS — the new test passes and the existing tests (openapi + default docs) still pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx
git commit -m "feat: widen article and drop mobile toc in DocsContent when hideToc is set"
```

---

### Task 4: Wire `hideToc` through the three routes

**Files:**
- Modify: `src/routes/$locale/$tab/route.tsx`
- Modify: `src/routes/$locale/$tab/index.tsx`
- Modify: `src/routes/$locale/$tab/$.tsx`

No new unit test — these files are thin payload→prop wiring with no logic; `tsc` plus the existing component tests cover correctness, and Task 6 verifies end-to-end.

- [ ] **Step 1: Pass `hideToc` to DocsShell**

In `src/routes/$locale/$tab/route.tsx`, add `hideToc,` to the destructure from `payload` (after `layoutMode,`):

```tsx
    layoutMode,
    hideToc,
```

and add the prop on `<DocsShell …>` (after `layoutMode={layoutMode}`):

```tsx
      layoutMode={layoutMode}
      hideToc={hideToc}
```

- [ ] **Step 2: Pass `hideToc` to DocsContent in the index route**

In `src/routes/$locale/$tab/index.tsx`, add `hideToc,` to the `Route.useLoaderData()` destructure (after `layoutMode,`):

```tsx
    layoutMode,
    hideToc,
```

and add the prop on `<DocsContent …>` (after `layoutMode={layoutMode}`):

```tsx
      layoutMode={layoutMode}
      hideToc={hideToc}
```

- [ ] **Step 3: Pass `hideToc` to DocsContent in the catch-all route**

In `src/routes/$locale/$tab/$.tsx`, make the exact same two edits as Step 2 (add `hideToc,` to the `Route.useLoaderData()` destructure after `layoutMode,`, and add `hideToc={hideToc}` after `layoutMode={layoutMode}` on `<DocsContent>`).

- [ ] **Step 4: Type-check**

Run: `bunx tsc --noEmit -p tsconfig.json`
Expected: exit 0. (`hideToc` is `boolean | undefined` from the payload; both `DocsShell` and `DocsContent` accept `hideToc?: boolean`, so it type-checks.)

- [ ] **Step 5: Commit**

```bash
git add src/routes/$locale/$tab/route.tsx src/routes/$locale/$tab/index.tsx src/routes/$locale/$tab/$.tsx
git commit -m "feat: wire hideToc from payload to DocsShell and DocsContent"
```

---

### Task 5: Enable `hideToc` on the four catalog pages

**Files:**
- Modify: `content/docs/en/api-reference/recipes.mdx`
- Modify: `content/docs/en/api-reference/sdks.mdx`
- Modify: `content/docs/en/api-reference/faq/index.mdx`
- Modify: `content/docs/en/api-reference/api-ref/index.mdx`

- [ ] **Step 1: Add `hideToc: true` to each frontmatter**

Add a `hideToc: true` line to each file's frontmatter block. Final frontmatter:

`recipes.mdx`:
```mdx
---
title: Recipes
description: Agora Recipes is a growing catalog of runnable examples, integration patterns, and end-to-end references across Agora products.
hideToc: true
---
```

`sdks.mdx`:
```mdx
---
title: Download SDKs
description: Download Agora SDKs by product, platform, and version.
hideToc: true
---
```

`faq/index.mdx`:
```mdx
---
title: FAQ
hideToc: true
---
```

`api-ref/index.mdx`:
```mdx
---
title: API reference
description: API references across Agora products and platforms — migrated SDK references and links to the hosted SDK API documentation.
hideToc: true
---
```

- [ ] **Step 2: Confirm the four files set the flag**

Run: `grep -rn "^hideToc:" content/docs/en/api-reference`
Expected: exactly four lines, one per file (`recipes.mdx`, `sdks.mdx`, `faq/index.mdx`, `api-ref/index.mdx`).

- [ ] **Step 3: Commit**

```bash
git add content/docs/en/api-reference/recipes.mdx content/docs/en/api-reference/sdks.mdx content/docs/en/api-reference/faq/index.mdx content/docs/en/api-reference/api-ref/index.mdx
git commit -m "feat: hide toc rail on the four api-reference catalog pages"
```

---

### Task 6: Manual verification

happy-dom does not do real layout; confirm the result by eye once.

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: the site serves locally (note the printed URL/port).

- [ ] **Step 2: Check the four catalog pages**

Visit `/en/api-reference/recipes`, `/en/api-reference/sdks`, `/en/api-reference/faq`, `/en/api-reference/api-ref`. Confirm: no right-hand TOC rail, the catalog content fills the area where the rail was (wider than before, ~960px), and the page is no wider overall than it was (no sprawl).

Expected: rail gone, content fills, footprint unchanged.

- [ ] **Step 3: Confirm a normal docs page is unchanged**

Visit any normal guide page (e.g. `/en/introduction/...`). Confirm it still shows its right-hand TOC rail and 720px content.

Expected: normal docs pages unchanged.

- [ ] **Step 4: Stop the dev server**

Stop the `bun run dev` process.

---

## Self-Review

**Spec coverage:**
- Frontmatter flag `hideToc` (schema) → Task 1 Step 3. ✓
- Payload surfacing → Task 1 Step 3. ✓
- Hide rail + fill grid (DocsShell) → Task 2. ✓
- Keep docs shell width (no sprawl) → Task 2 (shell width stays openapi-only) + test asserts docs max-width, not 1600px. ✓
- Article `max-w-none` + suppress mobile TOC (DocsContent) → Task 3. ✓
- Three-route threading; DocsShell does not forward to DocsContent → Task 4 (route.tsx → DocsShell; index.tsx + $.tsx → DocsContent). ✓
- Drop desktop feedback widget → automatic: feedback lives only in `DocsTocRail`, which is no longer rendered (no extra work). ✓
- Set `hideToc: true` on the four files → Task 5. ✓
- Tests: server payload (Task 1), DocsShell rail/grid/footprint (Task 2), DocsContent article/mobile-toc (Task 3). ✓
- Manual check → Task 6. ✓

**Placeholder scan:** No TBD/TODO; all code and commands concrete.

**Type consistency:** `hideToc` is `boolean | undefined` in the payload and `hideToc?: boolean` (default `false`) on both components — assignable. The shared local flag is named `contentFillsWidth` in both `DocsShell` and `DocsContent`. The renamed constant `DOCS_FILL_DESKTOP_GRID_CLASS_NAME` is used only in `DocsShell.tsx`; tests assert on the produced class string, not the constant name, so the rename is safe.
