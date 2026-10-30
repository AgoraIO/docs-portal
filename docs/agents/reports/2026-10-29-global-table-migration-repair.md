# Chinese table migration repair

The migrated Chinese beauty options table lost the occupancy of vertically
merged cells. Subsequent keys, types, descriptions and ranges moved one column
to the left. This repair covers the same failure across Chinese documentation.
The PR scope was restricted to Chinese content on October 30, 2026.

## Coverage

- Audited all 6,654 Chinese Markdown/MDX documents, excluding code examples
  from table detection. Retired and unpublished source tables were classified
  separately from active publication.
- Compared the Chinese source's 67 merged tables, shared imports, platform
  copies and current source ownership.
- Repaired three active generated API screen-capture tables: C#, Unreal
  Blueprint and Unreal C++. The dummy fixture is unpublished.
- Updated 51 Chinese documentation files in 96 table repair blocks, including
  grouped cells, multi-level headers, malformed rows, literal pipes and native
  HTML tables. The 28 beauty parameter tables cover all four SDK platforms.
- English documentation content matches the PR base. Earlier English table
  and release-note changes have been removed from the final PR diff.

## Content preservation

Vertical group labels repeat in their related rows. Existing inline code,
links and rich-cell Slot definitions are retained. Nested beauty/makeup groups
and each screen-capture OS/software/version/support association are preserved.

Aggregate prices appear once outside detail rows. Whiteboard image and web
conversion share a single allowance, with the original conversion factor.
Local-recording examples separate actual seconds, console minutes and billing;
all dates, values, formulas and console disclaimers are retained.

Intentionally blank row-label headings, SDK Slot headers and embedded
analytics images retain their source semantics. The analytics API limits
tables match all 14 source matrices; both signaling-analysis matrices retain
their six images.

The Unreal C++ screen-capture table renders all 24 compatibility rows inside a
326-pixel scroll container at a 390-pixel viewport. That page also has separate
non-table overflow: its width remains 564 pixels with the table hidden. The
beauty and local-recording page-width checks below do not extend to that page.

## Prevention

Both legacy MDX and API HTML converters use `scripts/lib/table-grid.mjs` to
preserve cell occupancy, combine grouped headers, clip overlong source rowspans
and omit physically empty rows fully covered by a merged group. HTML conversion
retains reusable rich-cell Slots. Markdown conversion does not double-escape
already escaped pipes.

`bun run docs:tables` checks Chinese documentation by default for mismatched
widths, unsupported HTML tables, recognizable option/key/type shifts and invalid
rich-cell Slot placement using the actual publication transform. The authoring
standard documents native groups, shared allowances and totals. Converter and
MDX rendering tests cover nested groups, custom row/col aliases, multi-level
headers, reusable rich cells, literal pipes and overlong spans.

Detailed source inventories and browser measurements remain in ignored
`.agent/artifacts/global-table-fix-20261029/`. The local preview index now lists
only the 51 Chinese pages in this table repair.

## Verification

- After restricting the PR to Chinese content: `bun run docs:tables` checked
  6,654 Chinese documents with zero errors; `bun run types:check` passed;
  the full suite passed 321 files and 5,061 tests, with two skipped.
- Scope verification confirms zero English documentation differences from
  the PR merge base and no changes to the verified Chinese content.
- Browser DOM measurements: beauty and local-recording billing pages keep the
  page width at 390 pixels on a 390-pixel viewport; beauty parameter columns
  retain the correct row associations.
- Full Chinese production build passed: 5,789 static payloads, 6,979
  machine-readable files and 6,744 route HTML files. The scope restriction
  leaves all Chinese content unchanged from that verified build.
