# Search filter picker + hover descriptions

**Date:** 2026-07-03
**Branch:** `feat/search-scope-by-product`
**Component:** `src/components/docs-shell/DocsSearchDialog.tsx`

## Goal

Bring the docs search dialog's filter controls up to the polish seen in Vapi's
docs UI: replace the plain native `<select>` product filter and the platform
pill row with two matching, searchable, keyboard-navigable dropdowns; surface
product descriptions inside the product dropdown; and move result-row
descriptions onto a hover/focus tooltip so the result list stays compact.

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
- **Platform ▾**
  - Same `Popover` + `Command` shell for visual consistency.
  - Items are **label-only** (platforms have no meaningful descriptions).
  - Trigger shows "All platforms" by default, or the selected platform label
    with a clear (×).

Both filters remain **single-select**, matching today's behavior and the
Algolia query shape (one `scopeFilter`, one `platform`). Multi-select is out of
scope — it would complicate the filter expression and is not requested.

The inline descriptions inside the open product dropdown *are* the "expanded"
view — no secondary hover is needed there. Hover tooltips apply to result rows
(below).

### 2. Result rows → hover/focus tooltip

- Remove the always-inline `line-clamp-2` description block from each row.
- Rows become **title + breadcrumb path + context chips** only, so the list is
  denser and scannable.
- Move the description into a `Tooltip` that opens on **hover and keyboard
  focus** (accessibility — keyboard users navigating with ↑/↓ still get the
  description).
- The highlighted matched-text snippet continues to render, now inside the
  tooltip, reusing the existing `HighlightedText` component.

### 3. Data model (`src/lib/docs-tree.ts`)

Extend `ProductScope` with optional description and icon:

```ts
export type ProductScope = {
  description?: string;
  filter: string;
  group?: string;
  icon?: string;
  id: string;
  label: string;
};
```

Populate them in `getProductScopes`:

- **Product-level scopes** — read `getTabIndex(child)?.description` and the
  configured icon from the product folder's index page, the same mechanism
  `getTabSummaries` already uses for tabs.
- **Tab-level scopes** — read the description from the tab index item.

This is purely build-time page-tree data. No Algolia re-sync is required — the
`filter` expressions are unchanged.

### 4. Keyboard navigation

- Each dropdown inherits cmdk's ↑/↓/↵/typeahead/Esc.
- The main result list keeps its existing cmdk navigation.
- The row tooltip triggers on focus (not just hover) so keyboard-driven browsing
  of results still reveals descriptions.

## Testing

Scope verification to changed files (per the known pre-existing CI baseline on
`main`).

- **`DocsSearchDialog.test.tsx`**
  - Product dropdown opens, filters via typeahead, selects a scope, and drives
    `scopeFilter` into the search client.
  - Platform dropdown opens, selects a platform, drives `platform`.
  - Result-row description is *not* rendered inline by default and appears on
    hover/focus.
- **`docs-tree` test** — a `getProductScopes` case asserting that `description`
  (and icon, if configured) flows from the product folder's index frontmatter,
  for both product-level and tab-level scopes.

## Out of scope

- Multi-select filters.
- Descriptions for platform options.
- Re-indexing / Algolia record changes.
- Any change to search ranking (handled by prior commits).
