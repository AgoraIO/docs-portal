# Search filter picker + hover descriptions

**Date:** 2026-07-03
**Branch:** `feat/search-scope-by-product`
**Component:** `src/components/docs-shell/DocsSearchDialog.tsx`

## Goal

Bring the docs search dialog's filter controls up to the polish seen in Vapi's
docs UI: replace the plain native `<select>` product filter and the platform
pill row with two matching, searchable, keyboard-navigable dropdowns; surface
product descriptions inside the product dropdown; and move result-row
descriptions into a fixed footer detail strip so the result list stays compact
while still exposing the matched snippet for the active row.

## Current state

- **Product filter** — a native `<select>` with `<optgroup>` grouping, driven by
  `ProductScope[]` (`filter`, `group`, `id`, `label` — no description/icon).
- **Platform filter** — a row of pill `Button`s, single-select toggle.
- **Result rows** — title + breadcrumb path + context chips + description shown
  always inline (`line-clamp-2`).
- **Keyboard nav** — cmdk's `CommandDialog` already handles ↑/↓/↵ on the result
  list; ⌘K opens the dialog.
- **Primitives available** — `ui/command.tsx` (cmdk), `ui/popover.tsx`,
  `ui/tooltip.tsx`.

## Design

### 1. Filter controls (two matching dropdowns)

Replace the native `<select>` and the platform pill row with two dropdown
buttons in the existing filter bar. Each dropdown = a `Popover` wrapping a
`Command` list (cmdk), which provides typeahead search, ↑/↓/↵ navigation, and
Esc-to-close for free.

- **Product ▾**
  - `Command` with a search input.
  - One `CommandGroup` per section (Real-Time Media, Solutions, …), preserving
    the grouping already produced by `groupProductScopes`.
  - Each item renders label + an inline muted description line (Vapi style).
  - Trigger button shows "All products" by default, or the selected scope label
    with a clear (×) affordance.
  - Tab-level scopes (`AI`, `API Reference`) appear as **ungrouped top-level
    entries** above the grouped products. The control keeps the existing
    `docs.searchAllProducts` = "All products" label even though a couple of
    entries are whole tabs rather than products — renaming is orthogonal to this
    feature and would churn i18n (see Out of scope).
- **Platform ▾**
  - Same `Popover` + `Command` shell (including its search input) for visual
    consistency — search is marginal over ~10 items but keeps the two dropdowns
    identical.
  - Items are **label-only** (platforms have no meaningful descriptions).
  - Keeps the same fixed platform subset used today (web, javascript, android,
    ios, flutter, react-native, windows, macos, electron, unity).
  - Trigger shows "All platforms" by default, or the selected platform label
    with a clear (×).

Both filters remain **single-select**, matching today's behavior and the
Algolia query shape (one `scopeFilter`, one `platform`). Multi-select is out of
scope — it would complicate the filter expression and is not requested.

The inline descriptions inside the open product dropdown *are* the "expanded"
view — no secondary hover is needed there. Hover tooltips apply to result rows
(below).

### 2. Result rows → fixed footer detail strip

**Why not a hover/focus tooltip:** cmdk keeps real DOM focus on the command
input and marks the active row only with `data-[selected=true]`
(`aria-selected`). A row never receives DOM focus, so a Radix `Tooltip` keyed on
`onFocus` would never fire for keyboard users arrowing through results. cmdk does
set `data-selected` for **both** keyboard ↑/↓ **and** mouse hover (it re-selects
the item under the pointer), so "the active row" is a single state that already
unifies mouse and keyboard. We drive a detail strip off that state instead of a
tooltip.

- Remove the always-inline `line-clamp-2` description block from each row.
- Rows become **title + breadcrumb path + context chips** only, so the list is
  denser and scannable.
- Add a **fixed footer detail strip** below the `CommandList` that reflects the
  currently active (`data-selected`) item:
  - **Primary line:** the matched snippet, rendered with the existing
    `HighlightedText` component (keeps the `<mark>` highlighting).
  - **Secondary line:** the full breadcrumb path (rows themselves only show a
    truncated path).
  - **No title/URL** — the title is already visible in the list above; the URL
    is not user-meaningful.
  - **Fixed, clamped min-height** (~2–3 lines) so the dialog does not resize as
    the user arrows or hovers through results. Layout stability is the whole
    reason this strip is preferred over inline-expanding the active row.
  - **Hidden when the list is empty** (no query / no results) rather than
    rendering an empty box. cmdk auto-selects the first item, so a populated list
    always has an active row to describe.
- **Scope:** the strip reflects the active item in the **result list only**,
  including the tab shortcuts at the top of the list (which also carry
  descriptions). The filter dropdowns keep their own inline descriptions and do
  not drive the strip.

### 3. Data model (`src/lib/docs-tree.ts`)

Extend `ProductScope` with an optional description only:

```ts
export type ProductScope = {
  description?: string;
  filter: string;
  group?: string;
  id: string;
  label: string;
};
```

`icon` is intentionally **not** added: not every product folder configures one,
so the dropdown would render a ragged mix of icon/no-icon rows, and none of the
approved mockups use icons. Icons are a clean follow-up once icon frontmatter is
backfilled (see Out of scope).

Populate the description in `getProductScopes`:

- **Product-level scopes** — read `getTabIndex(child)?.description` from the
  product folder's index page, the same mechanism `getTabSummaries` already uses
  for tabs. (Verified present: e.g. Video, Voice, Signaling, Cloud Recording all
  set a `description`.)
- **Tab-level scopes** — read the description from the tab index item.

The surfaced text is whatever the `index` frontmatter says today — currently
marketing taglines, and `video` / `broadcast-streaming` share an identical
string. The picker shows that faithfully; improving the copy is a separate
content task.

This is purely build-time page-tree data. No Algolia re-sync is required — the
`filter` expressions are unchanged.

### 4. Keyboard navigation

- Each dropdown inherits cmdk's ↑/↓/↵/typeahead/Esc (a `Popover` wrapping a
  `Command`). The dropdown's `Popover`/`Command` layer sits above the search
  `Dialog`; Esc closes the topmost layer (dropdown) first, then the dialog.
- The main result list keeps its existing cmdk navigation.
- The footer detail strip follows cmdk's `data-selected` active row, so keyboard
  ↑/↓ browsing reveals each result's snippet without any DOM-focus dependency.

## Testing

Scope verification to changed files (per the known pre-existing CI baseline on
`main`). Test the wiring, not cmdk's pointer/keyboard internals — those are flaky
under jsdom, so we avoid scripting arrow/hover to chase selection changes.

- **`DocsSearchDialog.test.tsx`**
  - Product dropdown opens, a click on an option drives `scopeFilter` into the
    (re-created) search client; the trigger label updates; the clear (×) resets
    it. Same for platform → `platform`. Plain clicks, no pointer-move dependence.
  - On render with results, the footer strip shows the **first (auto-selected)**
    item's snippet + path. Assert the inline `line-clamp-2` description is gone
    from the rows.
- **`docs-tree` test** — a `getProductScopes` case asserting that `description`
  flows from the product folder's index frontmatter (product-level) and from the
  tab index item (tab-level). Pure function, no DOM.

## Out of scope

- Multi-select filters.
- Descriptions for platform options.
- Leading icons in the scope dropdown (needs icon-frontmatter backfill first).
- Renaming the "All products" control (would churn en + zh-CN i18n; the
  tab-level scopes reading slightly oddly under "products" is a pre-existing
  wart).
- Improving the product-description copy (marketing taglines, one duplicate).
- Sharing a filter component with FAQ — `FaqSearch.tsx` has no product/platform
  filter of this shape, so there is no reuse pressure here.
- Re-indexing / Algolia record changes.
- Any change to search ranking (handled by prior commits).
