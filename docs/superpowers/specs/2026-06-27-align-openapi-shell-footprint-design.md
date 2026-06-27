# Align the api-reference (openapi) shell footprint with docs pages

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan
**Builds on:** `fix/remove-full-page-layout` (docs/openapi layout modes; `hideToc` catalog treatment).

## Problem

Every page type centers its layout with `mx-auto`, but the outer max-width
differs by layout mode:

- Regular docs and catalog (`hideToc`) pages:
  `max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]` ≈ **1308px**.
- api-reference (openapi) pages: `max-w-[min(100%,1600px)]` ≈ **1600px**.

Because the centered block is wider on openapi pages, the sidebar's left edge,
the top-nav/header, and the whole content area sit at a different position when
navigating between a normal doc and an api-ref page. The overall content area
does not align across page types.

This affects all api-reference pages — both the generated REST operation pages
and the hand-authored MDX overview/guide pages under a lane prefix (e.g.
`/en/api-reference/api-ref/rtc`), since both resolve to the openapi layout.

## Goal

Make every page type share the same outer shell footprint so the sidebar, top
nav, and content area align when moving between them. The fix targets the
**outer container width only** — not the inner content width.

## Decision

Make openapi pages use the same shell max-width as docs pages
(`DOCS_SHELL_MAX_WIDTH_CLASS_NAME`, ~1308px) instead of the wide
`max-w-[min(100%,1600px)]`. The openapi internal layout is unchanged: openapi
pages keep their `256px | minmax(0,1fr)` grid (content fills, no TOC rail). Only
the outer box shrinks to the docs footprint.

Rejected alternatives:
- **Reclassify hand-authored MDX pages to `docs` layout and/or squeeze
  operation pages to 720px** — invasive (the openapi body forces width via
  `effectiveLayoutMode = isOpenApiBody ? 'openapi' : layoutMode` in
  `DocsContent`) and would cramp the width-dependent OpenAPI schema UI. The goal
  is footprint alignment, not a 720px content cap.

## Change

In `src/components/docs-shell/DocsShell.tsx`:

- Delete the constant `DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME`
  (`'max-w-[min(100%,1600px)]'`), which has no other consumer.
- Replace the layout-mode branch for the shell width:

  ```tsx
  const shellWidthClassName = isOpenApiLayout
    ? DOCS_WIDE_SHELL_MAX_WIDTH_CLASS_NAME
    : DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  ```

  with the docs width for all modes:

  ```tsx
  const shellWidthClassName = DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  ```

`isOpenApiLayout` is still used for `desktopGridClassName` (via
`contentFillsWidth`) and the TOC rail, so the openapi internal layout is
preserved. `shellWidthClassName` is applied to the header row, the top-tabs
strip, the body shell, and the footer, so all of them align.

## Effect

All page types now share the identical ~1308px centered footprint:

- docs: `sidebar 256 | content 720 | toc 220`
- hideToc/catalog: `sidebar 256 | content fills ~940`
- api-ref (openapi): `sidebar 256 | content fills ~940` (was ~1100–1600)

The OpenAPI schema/parameter UI renders within ~940px instead of up to 1600px —
narrower, but not squeezed to 720px, and no TOC rail is added. Wide tables fall
back to their existing overflow behavior.

fumadocs-openapi's two-column "operation + code sample" split is a container
query at `@4xl` (896px). The narrowed content column (~970px) stays above that
threshold, so the two-column layout is preserved — but the ~74px margin is
small, so the manual check below must confirm it empirically.

## Testing

- `src/components/docs-shell/DocsShell.test.tsx`: the openapi-layout test
  currently asserts `max-w-[min(100%,1600px)]` on the header row, the tabs
  strip's first child, and the body shell. Flip those three assertions to the
  docs max-width `max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]`. Keep
  the rest of that test (openapi still uses the `256px | minmax(0,1fr)` grid and
  renders no TOC rail).
- The catalog/`hideToc` tests already assert the body shell is NOT
  `max-w-[min(100%,1600px)]`; they remain valid.

Manual check (once):
- Navigate between a normal docs page, a catalog page, and an api-ref page (both
  an MDX overview like `/en/api-reference/api-ref/rtc` and a generated operation
  page); confirm the sidebar, top nav, and content area do not shift — same
  outer footprint throughout.
- Open a generated operation page (e.g.
  `/en/api-reference/api-ref/rtc/query-channel-list`) and confirm its OpenAPI UI
  still renders the code-sample panel **side by side** with the operation
  details (the `@4xl` two-column layout), not stacked, at the new narrower width.

## Out of scope

- Reclassifying which pages are openapi vs docs (the MDX-under-lane-prefix
  behavior is unchanged).
- Any change to the OpenAPI body rendering or to docs/catalog pages.
