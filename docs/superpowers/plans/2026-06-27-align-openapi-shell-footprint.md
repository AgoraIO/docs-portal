# Align OpenAPI Shell Footprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make api-reference (openapi) pages use the same outer shell max-width as docs/catalog pages, so the sidebar, top nav, and content area align across all page types.

**Architecture:** The docs shell currently picks a wider max-width (`max-w-[min(100%,1600px)]`) for openapi layout and the docs width (~1308px) otherwise. This change makes the shell max-width the docs value for all layout modes. The openapi internal layout (the `256px | 1fr` fill grid, no TOC rail) is unchanged — only the outer box shrinks.

**Tech Stack:** React, Tailwind, Vitest + Testing Library, TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-27-align-openapi-shell-footprint-design.md`

---

## File Structure

- `src/components/docs-shell/DocsShell.tsx` — remove the wide-shell constant; make `shellWidthClassName` the docs width unconditionally.
- `src/components/docs-shell/DocsShell.test.tsx` — the openapi-layout test flips its three shell-width assertions from the 1600px class to the docs max-width class.

One small task plus a manual verification task.

---

### Task 1: Unify the shell max-width across layout modes

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Test: `src/components/docs-shell/DocsShell.test.tsx`

- [ ] **Step 1: Update the openapi-layout test's shell-width assertions**

In `src/components/docs-shell/DocsShell.test.tsx`, inside the test titled `'keeps the openapi layout on the stable docs shell without the generic toc rail'`, replace these three assertions:

```tsx
    expect(mainHeaderRow).toHaveClass('max-w-[min(100%,1600px)]');
    expect(docsTabsStrip.firstElementChild).toHaveClass(
      'max-w-[min(100%,1600px)]',
    );
    expect(docsBodyShell).toHaveClass('max-w-[min(100%,1600px)]');
```

with assertions for the docs footprint:

```tsx
    expect(mainHeaderRow).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsTabsStrip.firstElementChild).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
```

Leave the rest of that test unchanged — it still asserts the openapi `xl:grid-cols-[256px_minmax(0,1fr)]` grid, the absent TOC rail, and the `max-w-none` footers (none of which this change touches).

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx -t "keeps the openapi layout"`
Expected: FAIL — the shell still emits `max-w-[min(100%,1600px)]` for openapi layout, so the new docs-width assertions don't match.

- [ ] **Step 3: Make the shell width the docs value for all modes**

In `src/components/docs-shell/DocsShell.tsx`:

Delete the wide-shell constant (currently line 58):

```tsx
const DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME = 'max-w-[min(100%,1600px)]';
```

Replace the layout-flag block (currently):

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

with:

```tsx
  const isOpenApiLayout = layoutMode === 'openapi';
  // openapi and hideToc drop the toc rail and let content fill the grid; every
  // layout shares the same outer shell footprint so the sidebar/nav/content
  // align across page types.
  const contentFillsWidth = isOpenApiLayout || hideToc;
  const shellWidthClassName = DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  const desktopGridClassName = contentFillsWidth
    ? DOCS_FILL_DESKTOP_GRID_CLASS_NAME
    : DOCS_DESKTOP_GRID_CLASS_NAME;
```

`isOpenApiLayout` is still used by `contentFillsWidth` (grid + rail), so it is not unused.

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx`
Expected: PASS — the openapi test now matches the docs width, and the existing docs/hideToc tests (which assert the docs width and "not 1600px") still pass.

- [ ] **Step 5: Type-check**

Run: `bunx tsc --noEmit -p tsconfig.json`
Expected: exit 0. (No remaining reference to the deleted `DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME`.)

- [ ] **Step 6: Lint the changed files**

Run: `bunx biome check src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx`
Expected: no errors. (If biome reports fixes, run the same command with `--write`, then re-run `bun run test src/components/docs-shell/DocsShell.test.tsx` to confirm still green.)

- [ ] **Step 7: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx
git commit -m "fix: align openapi shell footprint with docs pages"
```

---

### Task 2: Manual verification

happy-dom does not do real layout; confirm the result by eye once.

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: the site serves locally (note the printed URL/port).

- [ ] **Step 2: Confirm the footprint aligns across page types**

Open, in turn: a normal docs guide (e.g. `/en/introduction/...`), a catalog page (`/en/api-reference/recipes`), an api-ref MDX overview (`/en/api-reference/api-ref/rtc`), and a generated operation page (`/en/api-reference/api-ref/rtc/query-channel-list`). Confirm the left sidebar edge, the top nav, and the overall content block do not shift position between them — same centered outer footprint throughout.

Expected: no horizontal shift of the sidebar/nav/content area between page types.

- [ ] **Step 3: Confirm the OpenAPI operation UI stays two-column**

On the operation page (`…/rtc/query-channel-list`), confirm the OpenAPI UI still renders its code-sample panel **side by side** with the operation details (the `@4xl`/896px two-column layout), not stacked vertically, at the new narrower (~970px) content width.

Expected: the operation UI remains two-column. If it has collapsed to stacked, stop and report — the content column has dropped below the 896px container-query threshold and the design needs revisiting.

- [ ] **Step 4: Stop the dev server**

Stop the `bun run dev` process.

---

## Self-Review

**Spec coverage:**
- Delete `DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME` → Task 1 Step 3. ✓
- `shellWidthClassName` becomes the docs width for all modes → Task 1 Step 3. ✓
- openapi internal layout (grid, rail) unchanged → Task 1 Step 3 leaves `contentFillsWidth`/`desktopGridClassName` and the rail logic intact; the test still asserts the openapi grid + absent rail. ✓
- Header/tabs/body/footer all align → they all consume `shellWidthClassName`, now unified; the test asserts the new width on header row, tabs strip child, and body shell. ✓
- Test: flip the three openapi shell-width assertions → Task 1 Step 1. ✓
- Manual check incl. the `@4xl` two-column confirmation → Task 2 Steps 2-3. ✓
- No reclassification of openapi vs docs pages → nothing in the plan touches layout-mode resolution. ✓

**Placeholder scan:** No TBD/TODO; all code and commands concrete.

**Type consistency:** The deleted constant has no other reference (verified). `shellWidthClassName` keeps its name and its four usage sites (header, tabs, body, footer) are untouched. The docs-width class string `max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]` matches `DOCS_SHELL_MAX_WIDTH_CLASS_NAME` exactly, both in code and the test assertions.
