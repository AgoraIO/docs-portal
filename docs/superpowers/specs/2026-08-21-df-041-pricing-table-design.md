# DF-041 Pricing Table Layout Design

## Goal

Improve the responsive layout of the English RTM2 IM RESTful API detailed-pricing table so long headers do not expand one column disproportionately, while preserving the table's data and narrow-screen horizontal scrolling.

## Context

The affected page is `content/docs/en/realtime-media/im/reference/pricing-plan-details.md`. Its detailed-pricing table has seven columns, including the long header `API calls included in the package/application (times/second)`. The current prose table rules use intrinsic column sizing, nowrap headers, and generous cell spacing, so the long header can push useful columns beyond a common desktop viewport.

## Chosen approach

Apply a scoped global CSS rule to Markdown tables with at least five header columns. At desktop widths, these dense tables will use the available content width with fixed table layout, allow header and cell text to wrap, remove the inherited minimum cell width, and use tighter padding. On narrow screens, the existing Fumadocs overflow wrapper remains responsible for horizontal scrolling.

This scope covers the affected seven-column table and similar information-dense tables without changing the layout of ordinary small tables or the pricing values themselves.

## Boundaries

- Modify only the shared prose table styles and their CSS regression tests.
- Do not alter pricing data, table headings, endpoint values, or page content.
- Do not remove horizontal scrolling from narrow layouts.
- Keep image-containing table cells on their existing readable sizing rules.

## Verification

- Add a regression test asserting the dense-table selector has fixed layout, full available width, zero inherited minimum width, wrapping, and tighter padding.
- Run the focused CSS regression test.
- Run the full Vitest suite, type checking, lint, and production build before publishing the PR.
- Inspect the final diff and verify the branch is based on `origin/main`.
