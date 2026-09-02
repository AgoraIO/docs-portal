# REST API reference readability improvements

**Date:** 2026-09-02

**Target:** PR #1034 (`feat: improve REST API reference scanability`)

**Status:** Approved for implementation planning

## Problem

The REST API operation page exposes the full request schema inline. On the
Conversational AI `join` endpoint this produces a page tens of thousands of
pixels tall, pushes the response content far below the request body, and makes
field hierarchy difficult to scan. The schema filter only matches properties
at the current level, so visible nested fields such as
`properties.channel` and `properties.remote_rtc_uids` incorrectly produce a
no-results state. Several smaller presentation choices also reduce clarity:
the endpoint method is not prominent, requiredness uses unexplained symbols,
enum values appear in a heavy callout, synthetic additional-property rows add
noise, field names resemble their descriptions, and the examples rail is too
narrow for common code samples.

## Goals

- Make large request and response schemas progressively discoverable without
  hiding information from search, hash navigation, or keyboard users.
- Make a field's name, type, requiredness, description, and allowed values
  distinguishable at a glance.
- Put the HTTP method and endpoint path together as the operation's primary
  identifier.
- Give desktop code examples enough width while retaining a readable schema
  column and responsive single-column fallback.
- Preserve OpenAPI references, unions, arrays, recursion guards, callouts,
  examples, legacy field anchors, and response status behavior introduced by
  PR #1034.

## Non-goals

- Reordering the mobile request and response example sections.
- Changing the underlying OpenAPI documents or API semantics.
- Adding an API playground or request execution.
- Redesigning the global docs shell, sidebar, header, or footer.

## Architecture

Keep Fumadocs' `generateSchemaUI` output as the schema normalization layer, but
move inline tree presentation into a local controlled renderer owned by
`src/components/openapi`. The renderer receives generated refs and exposes a
small interface for initial disclosure policy, recursive filtering, hash
reveal, and field presentation. This avoids growing the patched dependency's
UI responsibilities and gives the portal deterministic, testable control over
the required behavior.

The current `OpenApiSchema` adapter remains responsible for normalization,
extra descriptions, legacy anchor conversion, and generating find targets. A
new local tree component owns expansion and filtering state. Shared helpers
derive stable field identities, paths, searchable descendants, initial open
state, and visible rows. Rendering must stop at recursive references already in
the ancestor chain.

## Schema disclosure

All root-level fields remain visible. On initial render:

- A root-level required object, array-of-object, or union is expanded one
  level so its immediate children are visible.
- Root-level optional expandable fields are collapsed.
- Expandable fields below the root are collapsed, including required fields.
- Primitive fields do not render disclosure controls.

`Expand all` opens every non-recursive expandable field. `Collapse all` closes
every expandable field while leaving root rows visible. Both controls use
native buttons with explicit accessible names and visible focus states.

Collapsed descendants remain mounted in `hidden="until-found"` containers so
they consume no layout space but remain discoverable by native browser find.
Handling `beforematch` opens only the ancestor chain required to reveal the
matched descendant.

Hash or legacy-anchor navigation opens every ancestor needed to reveal the
target, scrolls the target into view, and applies the existing highlight. It
must override the default disclosure policy without expanding unrelated
branches.

## Recursive field filtering

The filter performs a case-insensitive recursive match against field names and
full dotted paths. For example, `channel` and `properties.channel` both match
the same field.

While a query is active:

- Render every matching field and the minimum ancestor chain needed to show
  it.
- Automatically expand those ancestor chains.
- Show the full dotted path as secondary text on each direct match.
- Show a localized match count next to the filter.
- Do not count ancestor-only context rows as matches.
- Keep nonmatching branches hidden.

When the query is cleared, restore the expansion state that existed before
search began. Enter focuses or reveals the first match; Escape clears the
query. A zero-match state remains explicit and localized.

## Field rows

Each field header uses this order:

1. Disclosure control, when applicable.
2. Field name in the existing monospace face at `font-weight: 600`.
3. Type in the same line, using the monospace face and muted foreground.
4. `Required` or `Optional` badge aligned to the right.
5. Existing field-link action, visually quiet but keyboard accessible.

Descriptions remain normal-weight body text in a muted foreground. Required
and optional badges use the existing local `Badge` primitive with semantic
tokens, not raw status colors. The field name remains the strongest item in the
row; the type and badge must not compete with it.

Synthetic unnamed dictionary entries rendered as `[key: string] any` are not
shown. Named map fields and their descriptions remain visible. A parent object
that permits additional properties retains its description when one exists,
but it does not receive a separate placeholder row.

## Enum values

Replace the generated `Value in` callout with a compact metadata section named
`Allowed values`. Values render as wrapping inline code tokens with no bullet
markers, elevated card, or drop shadow. String enum values display without
decorative quotation marks; numeric, boolean, and null values retain their
literal representation.

The layout wraps naturally at narrow widths and remains fully visible without
horizontal scrolling.

## Endpoint bar

Render the normalized HTTP method immediately before the endpoint URL. Use a
compact method badge with semantic light/dark variants:

- GET: blue
- POST: green
- PUT and PATCH: amber
- DELETE: red
- Other methods: neutral

The method remains visible when the URL scrolls horizontally. The existing URL
copy action and its accessible feedback remain unchanged.

## Examples rail

At the existing two-column container breakpoint, set the examples column to
400px and keep the main schema column as `minmax(0, 1fr)`. If the container is
too narrow to preserve a usable main column, use the existing stacked layout.
The sticky height, internal vertical scrolling, scenario selector, language
tabs, and response tabs remain unchanged.

## Localization and accessibility

Add English and zh-CN labels for `Required`, `Optional`, `Allowed values`,
match-count text, `Expand all`, `Collapse all`, and disclosure actions. Do not
encode meaning through color alone. All disclosure controls expose
`aria-expanded` and identify the affected field. Search results and match-count
changes use a polite live region. Native browser find and direct field links
must continue to reveal hidden descendants.

## Testing

Follow test-driven development at these seams:

- Pure tree-state helpers: initial expansion, expand/collapse all, recursion,
  synthetic additional-property filtering, recursive query matching, ancestor
  retention, full paths, and match counts.
- Schema component: accessible disclosure controls, state restoration after
  search, Enter/Escape behavior, hash reveal, badge alignment contract, field
  typography hooks, and enum token rendering.
- Operation content: method badge text and method variants, existing copy
  behavior, and preservation of request/response schemas.
- CSS regressions: 400px rail, responsive fallback, wrapping enum values, and
  field-row hierarchy hooks.

Visual verification uses the Conversational AI `join` page at desktop and
390px widths in light and dark modes. Confirm that `channel` and
`remote_rtc_uids` are searchable, root required objects alone are initially
open, all controls are keyboard reachable, endpoint method remains visible,
and there is no page-level horizontal overflow caused by the changed UI.

## Acceptance criteria

- Searching `channel` or `remote_rtc_uids` returns the nested field, displays
  its full path, opens its ancestors, and reports the correct result count.
- Clearing a query restores the user's pre-search disclosure state.
- Initial schema state expands only root-level required expandable fields and
  only to their immediate children.
- Expand-all and collapse-all work across nested schemas without infinite
  recursion.
- No `[key: string] any` synthetic row is rendered.
- Every field shows its type beside the bold field name and an explicit,
  right-aligned `Required` or `Optional` badge.
- Enum values render as wrapping inline code tokens under `Allowed values`.
- The operation header shows a color-distinguished method beside its URL.
- The desktop examples rail measures 400px in the two-column layout and stacks
  responsively below the breakpoint.
- Existing anchors, code samples, response accordions, localization, and copy
  controls continue to work.

## Baseline note

At PR head `8d2fe4bc9`, the focused OpenAPI baseline passes 59 tests across four
files. The repository-wide baseline has 41 pre-existing failures in unrelated
migration, content-audit, link-integrity, private-release, and analytics mock
tests. Implementation verification will require all affected OpenAPI tests,
type checking, and linting to pass; repository-wide results will be compared
against this recorded baseline rather than reported as fully green.
