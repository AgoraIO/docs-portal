# Chinese merged table rendering

Legacy tables lost row/column spans and multi-level header geometry during
migration. The portal now preserves those relationships as actual native table
cells. This PR changes Chinese documentation content only.

## Rendering and content contract

`DocsTable` uses the same accessible scroll container as GFM tables. Native MDX
`thead`, `tbody`, `tr`, `th` and `td` elements retain explicit `rowSpan` and
`colSpan` attributes. Rich Markdown stays inside its owning cell. The publication
plugin removes Markdown paragraph wrappers around structural table elements
while preserving paragraphs and lists inside cells.

Simple tables remain GFM. Repeated text does not imply a merge: unrelated
types, prices and defaults remain independent. Both migration converters
preserve source spans and header rows. Nested exported header arrays retain
their original row structure, fixing the Cloud Recording header that had been
incorrectly flattened into 21 columns instead of 11 logical columns.

## Coverage and preservation

- Reviewed 2,148 primary MD/MDX sources plus 33 reachable shared fragments,
  2,175 import edges and all 67 source merged tables. Header-only merges and
  nonliteral span attributes were checked independently; no additional Chinese
  MDX merge cases remain outside the inventory.
- Scanned 8,557 API HTML sources. Of 1,197 spanning tables, 1,046 are generator
  member-index layouts, intentionally represented as API navigation/signatures.
  All 151 content tables are accounted for: 109 active tables and 42 dummy
  fixtures. The 109 active tables include 106 enum tables and three screen-capture
  tables. Enum headers' horizontal merges are restored too.
- Restored 196 tables across 57 Chinese pages to actual merged cells, including
  tables previously rewritten as repeated text or separate subtables.
- This includes the four SDK beauty variants, domain/region groups, comparison
  tables, shared allowances/totals, Cloud Recording billing, local-recording
  billing and three generated screen-capture compatibility matrices.
- Retained earlier unrelated Chinese fixes for malformed rows and literal
  pipes. The preview index covers 66 Chinese pages across this table work.
- English documentation remains byte-for-byte equal to the PR merge base.

Source overlong spans are clipped to actual rows; omitted empty source slots
become explicit blank cells. Authored tables are checked strictly for positive
spans, complete logical columns, overlaps and row-group boundaries.

The independent retention check found no missing numeric values or links in
all 196 replacements. All 551 body rows in the 106 enum tables are textually
identical, with no links or anchors lost. Of 67 other directly comparable expanded logical matrices,
66 are identical. The analytics billing matrix intentionally restores the
source's two-column merged feature labels, replacing the earlier synthetic
category column; all rates, plan values and links are retained.

The Cloud Recording rendering regression checks all 50 usage values, two
header levels, the three-row/five-column disclaimer and the five-column total.
Whiteboard image/web-page conversion keeps one shared allowance and its
original conversion factor in one merged cell.

## Verification

- `bun run docs:tables` validates 6,654 Chinese documents, including native
  merged-cell occupancy and rich GFM Slot adjacency.
- An independent target scan finds 196 native merged tables across 57 published
  pages, with no legacy Table/Tr/Td elements, raw spanning tables, orphaned spans
  or unsupported/dynamic span attributes. Source-side coverage has no unresolved
  published merged content tables.
- Renderer, converter and table-fidelity tests cover actual DOM spans, nested
  groups, rich Markdown, independent equal values and multi-level headers.
- Browser measurements confirm beauty option groups span six rows, makeup
  spans 18 rows, and Cloud Recording retains its merged header/disclaimer/total.
- Types and lint passed. The final serial full suite passed 323 files and
  5,070 tests, with two skipped, including the border follow-up.
- Full Chinese production build at merged-content commit `6b560cbc5` passed with all 196 merged tables: 5,789
  static payloads, 6,979 machine-readable files and 6,744 route HTML files.
- Browser checks cover seven representative pages on desktop and at 390px:
  beauty, Cloud Recording billing, Whiteboard billing, Unreal C++ compatibility,
  RTSA enums, RTC overview and ByteDance integration. All 64 visible merged cells
  are vertically centered, their bottoms align exactly with their covered rows,
  all final columns are reachable, and no structural paragraph wrappers remain.

## Logical cell borders

Fumadocs removes the start border from physical `:first-child` cells. With
rowspans, the first physical cell can belong to a later logical column, leaving
gaps beside a merged cell. The publication transform now marks each cell's
logical column and whether it reaches the table's final row. Shared table
styles use those markers to retain internal vertical borders and avoid doubled
bottom outlines on cells that begin above the final row. Ordinary GFM cells
without these markers keep their existing styles.

The border follow-up is validated by 112 focused tests, types, lint, the full
suite above and all 57 affected pages in a real browser: all 196 merged tables
and 3,818 cells have correct borders on desktop, at 390px and in dark mode.
No source content or merge boundaries changed. The earlier complete production
build result applies to the merged-content implementation; this border-only
follow-up was checked through actual Vite-compiled styles on every affected page.

The initial API samples exposed separate non-table narrow-screen overflow:
hiding tables still left 564 pixels on Unreal C++ and 477 pixels on the RTSA
enum page at a 390-pixel viewport. A subsequent 20-page review found seven
affected pages. The Chinese article typography follow-up fixes the long-title,
heading flex-item and prose wrapping causes; all seven now measure 390 pixels.
See [the narrow-screen report](2026-10-30-cn-api-narrow-screen-overflow.md) for
the measurements and browser regression scope. Tables retain their independent
scroll containers; this is not a claim of full-site typography parity.

Detailed source mappings, retention results and local browser measurements are
kept in ignored `.agent/artifacts/merged-tables-20261030/`.
