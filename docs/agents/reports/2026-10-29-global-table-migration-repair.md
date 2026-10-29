# Global table migration repair

The migrated beauty options table lost the occupancy of vertically merged
cells. Subsequent keys, types, descriptions and ranges moved one column to the
left. This repair covers the same failure across published documentation.

## Coverage

- Parsed all 7,788 Chinese and English Markdown/MDX documents, excluding code
  examples from table detection. The initial snapshot had 12,746 GFM tables.
- Compared the Chinese source's 67 merged tables, the English source's 28
  merged tables, shared imports, platform copies and current source ownership.
  Retired, dormant and unpublished source tables were classified separately.
- Searched generated API HTML for vertical spans. Three active screen-capture
  tables (C#, Unreal Blueprint, Unreal C++) and one unpublished dummy fixture
  were found. All three active matrices are repaired.
- Updated 65 documentation files: 51 Chinese and 14 English. The 133 repair
  blocks include grouped cells, multi-level headers, stripped tables, malformed
  rows, literal pipes and native HTML tables.

The resulting 12,783 GFM tables have no mismatched row widths, legacy HTML
tables or detected option/key/type shifts. This structural check also covers
unpublished content still present in the checkout.

## Content preservation

Vertical group labels repeat in their related rows. Existing inline code,
links and rich-cell Slot definitions are retained. Nested beauty/makeup groups
and each screen-capture OS/software/version/support association are preserved.

Aggregate prices appear once outside detail rows. Whiteboard image and web
conversion share a single allowance, with the original conversion factor.
Local-recording examples separate actual seconds, console minutes and billing;
all dates, values, formulas and console disclaimers are retained. Existing
arithmetic or rounding inconsistencies in English source examples were not
changed by this formatting repair.

The audit classified intentionally blank row-label headings, SDK Slot headers,
three repeated Event-code column labels and embedded analytics images. These
are valid content, not missing cells. The analytics API limits tables match all
14 source matrices; both signaling-analysis matrices retain their six images.

The Flutter UIKit widget table and its introduction are restored. Other empty
Flutter implementation sections and the missing constructors/sample code after
that table are pre-existing non-table omissions; this report does not claim
full quickstart content parity.

The Unreal C++ screen-capture table renders all 24 compatibility rows inside a
326-pixel scroll container at a 390-pixel viewport. That page also has separate
non-table overflow: its width remains 564 pixels with the table hidden. The
beauty and local-recording page-width checks below do not extend to that page.

## Prevention

Both legacy MDX and API HTML converters use `scripts/lib/table-grid.mjs` to
preserve cell occupancy, combine grouped headers and clip overlong source
rowspans and omit physically empty rows fully covered by a merged group. HTML
conversion retains reusable rich-cell Slots. Markdown conversion
does not double-escape already escaped pipes.

`bun run docs:tables` checks every document for mismatched widths, unsupported
HTML tables, recognizable option/key/type shifts and invalid rich-cell Slot
placement using the actual publication transform. The authoring standard
documents how to express merged groups, shared allowances and totals natively.
Converter and MDX rendering tests cover nested groups, custom row/col aliases,
multi-level headers, reusable rich cells, literal pipes and overlong spans.

Detailed source inventories, retention checks and browser measurements remain
in ignored `.agent/artifacts/global-table-fix-20261029/`.

## Verification

- `bun run docs:tables`: 7,788 documents, zero errors.
- `bun run types:check`: passed.
- `bun run lint` and Biome checks of changed migration scripts: passed.
- Full Vitest suite: 321 files passed, 5,061 tests passed and two skipped.
- Browser DOM measurements: beauty and local-recording billing pages keep the
  page width at 390 pixels on a 390-pixel viewport; beauty parameter columns
  retain the correct row associations.
- Chinese production build passed with the full `zh-CN` scope: 5,789 static
  payloads, 6,979 machine-readable files and 6,744 route HTML files.
- English production build passed with the full `en` scope: 1,194 static
  payloads, 3,356 machine-readable files and 3,215 route HTML files.
