# Remove the `full-page` layout mode; render api-reference catalog pages as normal docs

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan

## Problem

Four api-reference catalog pages render with an incorrect (over-wide) content
width:

- `/en/api-reference/recipes`
- `/en/api-reference/sdks`
- `/en/api-reference/faq`
- `/en/api-reference/api-ref`

Each sets `full: true` in frontmatter, which resolves to the `full-page` layout
mode. `full-page` here is one of three layout modes (`docs | full-page | openapi`) —
not to be confused with `CONTEXT.md`'s "full-page" migration-fidelity term,
which is about how completely a migrated page reproduces its source and is
unrelated to and unaffected by this change. The layout mode
is treated as a "wide" layout: the shell expands to `min(100%, 1600px)`, the
content column becomes `minmax(0, 1fr)`, the content wrapper drops its max-width
(`max-w-none`), and the table-of-contents rail is replaced by an empty 220px
placeholder. The result is sprawling content (~1100px) with a dead right gutter.

These four pages are the **only** consumers of `full-page` in the entire content
tree (no zh-CN equivalents). The desired behavior is that they render at the
normal docs content width (capped at `--content-max`, 720px), exactly like every
other docs page.

## Decision

Remove the `full-page` layout mode entirely and move the four catalog pages to
the `docs` layout. With `full-page` gone, the codebase keeps exactly two layout
modes:

- `docs` — normal width, content capped at `--content-max` (720px), real TOC rail.
- `openapi` — wide, two-column (`256px | 1fr`), no TOC rail, wide shell.

The catalog pages join `docs`. Because every "wide" decision other than openapi
existed solely to serve `full-page`, each remaining wide check collapses to an
explicit `layoutMode === 'openapi'` test, and the `isWideDocsLayout` helper is
deleted.

### Width is accepted as 720px for the catalogs

The catalog components are built for width — `FaqCatalog` has a 2-pane (`lg`) and
3-pane (`2xl`) layout; the SDK/recipe catalogs are card grids. Inside the
720px-capped `docs` content wrapper they render narrower: FAQ never reaches its
3-pane layout and card grids show fewer columns. This is the intended outcome
("cap everything at 720px, match normal docs").

`sdks` and `faq` have no markdown headings, so their TOC rail will be empty —
identical to any other heading-less docs page. Accepted as consistent.

The mobile table of contents is also re-enabled (`DocsContent.tsx:253` suppresses
it only in wide layouts): on mobile, `recipes` and `api-ref` show a single-item
TOC for their `## Browse all recipes` heading, while `sdks`/`faq` render nothing.
Accepted as normal-docs-consistent.

## Why openapi is unaffected

A page resolves to `openapi` only when `isOpenApiPage` (`page.type === 'openapi'`)
or `resolveOpenApiLaneRoute(...)` returns a lane. That matcher requires the slug
to start with `api-ref/<product>` (e.g. `['api-ref', 'conversational-ai']`). The
catalog slugs are `['recipes']`, `['sdks']`, `['faq']`, `['api-ref']` — none
match (the bare `api-ref` index is shorter than the 2-segment lane prefix), so
they get `openApiLaneRoute = null`. That is exactly why they are `full-page`
today, not `openapi`. The real openapi endpoint pages (the REST reference
operations under `api-reference/api-ref/<product>/…`, driven by the lanes in
`src/lib/openapi/lanes.ts`) keep their `openapi` layout untouched.

## Changes

### Content (4 files)
Delete the `full: true` frontmatter line from:
- `content/docs/en/api-reference/recipes.mdx`
- `content/docs/en/api-reference/sdks.mdx`
- `content/docs/en/api-reference/faq/index.mdx`
- `content/docs/en/api-reference/api-ref/index.mdx`

### Schema
- `source.config.ts:21`: remove `full: z.boolean().optional()`. Nothing sets
  `full` after the content edits above.

### Layout core
- `src/lib/docs-layout.ts`:
  - `DocsLayoutMode` becomes `'docs' | 'openapi'`.
  - Delete `isWideDocsLayout` (every caller collapses to `=== 'openapi'`).
- `src/lib/docs-page.server.ts`:
  - Delete the `resolveDocsLayoutMode` helper (~line 949) entirely. Its `page`
    argument becomes unused once the `full` branch is gone, leaving only
    `isOpenApiPage ? 'openapi' : 'docs'`. Inline that expression at the call
    site (line 306-309): `const layoutMode = isOpenApiPage || openApiLaneRoute !== null ? 'openapi' : 'docs'`.
    The `openApiLaneRoute !== null` wiring is unchanged.

### Components
Replace `isWideLayout` / `isWideDocsLayout(...)` with explicit
`layoutMode === 'openapi'` checks. OpenAPI behavior is preserved exactly.

- `src/components/docs-shell/DocsShell.tsx`:
  - Remove the now-dead `DOCS_WIDE_DESKTOP_GRID_CLASS_NAME` constant.
  - Remove the empty `docs-toc-rail-placeholder` `<div>` branch.
  - `desktopGridClassName`: `layoutMode === 'openapi' ? DOCS_OPENAPI_DESKTOP_GRID_CLASS_NAME : DOCS_DESKTOP_GRID_CLASS_NAME`.
  - TOC rail: `layoutMode === 'openapi' ? null : <DocsTocRail … />`.
  - `shellWidthClassName`: `layoutMode === 'openapi' ? DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME : DOCS_SHELL_MAX_WIDTH_CLASS_NAME` (name kept; openapi still uses the wide shell).
  - Remove the `isWideDocsLayout` import.
- `src/components/docs-shell/DocsContent.tsx`:
  - Lines 105 and 253: key off `effectiveLayoutMode === 'openapi'`.
  - Remove the `isWideDocsLayout` import.
- `src/components/docs-shell/DocsMainColumn.tsx`:
  - Line 99: key off `layoutMode === 'openapi'`.
  - Remove the `isWideDocsLayout` import.

## Testing

Update existing tests to the two-mode world, then add a regression guard.

- `src/components/docs-shell/DocsContent.test.tsx`:
  - The two `layoutMode="full-page"` tests (`renders full-page MDX content …`
    ~line 235, `widens footer content in full-page layout` ~line 1035) re-point
    to `layoutMode="openapi"` — the remaining wide mode with the same
    `max-w-none` behavior. Rename the test titles to reference openapi.
- `src/components/docs-shell/DocsShell.test.tsx`:
  - Delete the entire `keeps the full-page layout …` test (lines 584-605); it
    asserts the placeholder is present (line 599), which no longer exists.
  - Leave the adjacent openapi test (lines 558-582) untouched — its
    `expect(queryByTestId('docs-toc-rail-placeholder')).not.toBeInTheDocument()`
    at line 573 stays true and meaningful after the placeholder div is removed.
  - Catalog pages now render the real TOC rail (docs mode); this is covered by
    existing docs-layout tests, not by the deleted full-page test.
- `src/lib/docs-page.server.test.ts`:
  - The assertion `expect(payload.layoutMode).toBe('full-page')` for
    `loadDocsPagePayload('en', 'api-reference', ['recipes'])` (~line 3397)
    becomes `toBe('docs')`.
  - Extend this behavioral guard to the other three catalog routes — assert
    `layoutMode === 'docs'` for `loadDocsPagePayload('en', 'api-reference', ['sdks'])`,
    `['faq']`, and `['api-ref']` — so all four are locked to docs layout. Reuse
    the existing test's payload setup/fixtures.
  - Do **not** add a frontmatter-grep test for `full: true`. Once `full` is
    removed from the schema and the resolver, that key is inert (zod strips it),
    so such a test would guard against an impossible regression and give false
    confidence. The behavioral `layoutMode === 'docs'` assertions are the guard.

Manual check (once): load the four URLs and confirm the content band matches a
normal docs page (720px), and spot-check one real openapi endpoint page
(e.g. `/en/api-reference/api-ref/conversational-ai/…`) to confirm its wide
two-column layout is unchanged.

## Out of scope

- Renaming `DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME` (still accurate — openapi is
  the wide mode).
- Any change to the catalog components themselves or to openapi rendering.
- zh-CN content (no `full: true` pages exist there).
