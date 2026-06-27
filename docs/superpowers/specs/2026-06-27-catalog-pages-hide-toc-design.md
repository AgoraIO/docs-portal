# Hide the TOC rail and fill its space on the four api-reference catalog pages

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan
**Builds on:** `fix/remove-full-page-layout` (the four catalog pages now render in `docs` layout at 720px).

## Problem

The four api-reference catalog pages —

- `/en/api-reference/recipes`
- `/en/api-reference/sdks`
- `/en/api-reference/faq`
- `/en/api-reference/api-ref`

— now render in the normal `docs` layout, which includes the right-hand table-of-contents rail (a fixed 220px `<aside>`). These are catalog/index pages with little or no heading structure, so the rail is useless (empty for `sdks`/`faq`, a single item for `recipes`/`api-ref`) and wastes space. The card grids inside the catalogs (e.g. `RecipesCatalog`'s `xl:grid-cols-3`) are also cramped because the content column is capped at 720px.

## Goal

On these four pages: remove the right TOC rail and let the content grow rightward to **fill the freed space** (~960px), while keeping the page's **overall footprint unchanged** — no sprawl to the wide 1600px `openapi` width. Content is no longer capped at 720px on these pages; it fills the area the rail occupied.

## Decision

Add a per-page frontmatter flag, `hideToc: true`, following the existing
`hidePlatformTabs` precedent. It is explicit, self-documenting, and reusable for
future catalog/landing pages. It adjusts presentation **within** the `docs`
layout; it does not reintroduce a layout mode (the `docs | openapi` split from
the prior change stands).

Rejected alternatives:
- **Auto-detect "no headings"** — covers `sdks`/`faq` but not `recipes`/`api-ref`
  (each has a `## Browse all recipes` heading), so it would not cover all four.
- **Sniff the catalog component** — couples layout chrome to specific component
  usage; brittle.

## Behavior

When `hideToc` is true (and the page is `docs` layout — it is a no-op for
`openapi`):

- The TOC rail (`DocsTocRail`) is not rendered.
- The desktop grid drops the 220px column: `xl:grid-cols-[256px_minmax(0,1fr)]`
  (the same grid the `openapi` layout uses).
- The shell keeps the **docs** max-width
  (`max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]`, ~1308px) — the page
  footprint is unchanged. This is the key difference from `openapi`, which uses
  the 1600px wide shell.
- The content article drops its 720px cap (`max-w-none`), so content fills the
  content column (~960px) and the catalog card grids get room.
- The mobile inline table of contents is suppressed (it would be empty or
  pointless on these pages).
- The desktop page-feedback widget is dropped on these pages. It currently lives
  only inside the TOC rail; with the rail gone, desktop simply has no feedback
  widget here. Mobile feedback (rendered in the mobile content flow) is
  unaffected.

### How the conditions compose

Several existing checks that today read `isOpenApiLayout` become
`isOpenApiLayout || hideToc`:

- `DocsShell` TOC rail: `isOpenApiLayout || hideToc ? null : <DocsTocRail … />`.
- `DocsShell` desktop grid: `isOpenApiLayout || hideToc ? <256px|1fr grid> : <docs grid>`.
- `DocsContent` article max-width (`DocsContent.tsx:105`):
  `isOpenApiLayout || hideToc ? 'max-w-none' : 'max-w-[var(--content-max)]'`.
- `DocsContent` mobile TOC (`DocsContent.tsx:253`):
  `isOpenApiLayout || hideToc ? null : <mobile TOC>`.

Shell max-width stays **openapi-only** (`isOpenApiLayout ? wide : docs`), which
is what keeps `hideToc` pages at the docs footprint rather than sprawling.

## Data flow

1. `source.config.ts` — add `hideToc: z.boolean().optional()` to `rawDocSchema`.
2. `src/lib/docs-page.server.ts` — read `page.data.hideToc` and add it to the
   payload object (alongside `layoutMode`). Default to `false`/`undefined` when
   absent.
3. `src/routes/$locale/$tab/route.tsx` — destructure `hideToc` from the payload
   and pass it to `<DocsShell hideToc={hideToc} … />`.
4. `src/components/docs-shell/DocsShell.tsx` — accept the `hideToc` prop; use it
   for the rail and grid; thread it to `DocsContent`.
5. `src/components/docs-shell/DocsContent.tsx` — accept `hideToc`; use it for the
   article max-width and the mobile TOC.

## Content

Add `hideToc: true` to the frontmatter of the four files:
- `content/docs/en/api-reference/recipes.mdx`
- `content/docs/en/api-reference/sdks.mdx`
- `content/docs/en/api-reference/faq/index.mdx`
- `content/docs/en/api-reference/api-ref/index.mdx`

## Testing

- `src/components/docs-shell/DocsShell.test.tsx`:
  - With `hideToc` (docs layout): the `docs-toc-rail` is absent; `docs-body-shell`
    carries `xl:grid-cols-[256px_minmax(0,1fr)]` and still carries the docs
    max-width class (NOT `max-w-[min(100%,1600px)]`).
  - Without `hideToc` (default docs layout): the rail is present and the docs
    3-column grid is used — guards that normal docs pages are unchanged.
- `src/components/docs-shell/DocsContent.test.tsx`:
  - With `hideToc`: the article has `max-w-none` and no mobile TOC ("On this
    page" absent).
- `src/lib/docs-page.server.ts` test (`docs-page.server.test.ts`):
  - A page whose data sets `hideToc: true` produces `payload.hideToc === true`;
    a page without it yields a falsy value.

Manual check (once): load the four pages and confirm the catalog fills the area
where the rail was (~960px), the page is no wider than before, and a normal docs
page (e.g. any guide) still shows its TOC rail.

## Out of scope

- Changing the catalog components' internal layouts.
- Any change to `openapi` pages.
- Relocating the page-feedback widget (explicitly dropped on these pages).
- zh-CN content (these flags are set only on the en catalog pages).
