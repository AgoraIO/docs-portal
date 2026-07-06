# Search dialog — floating detail panel + stable footer

**Date:** 2026-07-03
**Branch:** `feat/search-scope-by-product`
**Component:** `src/components/docs-shell/DocsSearchDialog.tsx`

## Problem

The ⌘K search dialog changes size as the user moves the highlight between results. The cause is the in-footer detail strip: it (a) renders only when the active item has a snippet/path, (b) uses `min-height` with a 2-line-clamped snippet, and (c) conditionally renders the path line (results have a path, tabs don't). So each highlight change can change the footer's height, and because the dialog is centred and sized to its content, the whole dialog resizes.

## Decision (validated by throwaway prototype)

Move the active item's description **out of the dialog's layout flow** into a **floating window beside the dialog**, anchored to the highlighted row. With the detail gone from the footer, the footer holds only the fixed-height keyboard-hint bar, so the dialog body is a constant height — the resize disappears. This was chosen over a fixed in-footer strip and a below-the-row popover after comparing all four in an interactive prototype. A second prototype exposed a geometry constraint the first hid — the real dialog is 896px, leaving no room beside it on laptops — so the dialog is **narrowed to 672px** and placement is decided by runtime measurement, with the in-footer strip as the fallback when there is no room beside.

## Design

### 1. Footer becomes hint-bar-only (fixes the resize)

The footer no longer *unconditionally* carries the variable-height detail strip. In the common (beside) case the footer is just the always-visible keyboard-hint bar (`↑ ↓ navigate · ↵ select · esc close`) — a constant height. The detail returns to the footer only as the fixed-height strip fallback (§4), which is also constant height. Either way the dialog never resizes on focus change.

### 2. Narrow the dialog to 672px (so beside fits on laptops)

Change the dialog width from `max-w-4xl` (896px) to `max-w-2xl` (**672px**). Geometry: a 260px panel + 14px gap needs `viewport ≥ dialogWidth + 2·(panel+gap)`. At 896px that threshold is ~1444px (beside only fits on wide monitors); at **672px it drops to ~1220px**, so the floating panel fits on essentially all laptops (1280/1366/1440). 672px is also a natural command-palette width (Raycast/Spotlight sit ~680–750px). The dialog stays **centred and fixed-width** — it does not shift horizontally when the panel toggles on/off between items.

### 3. Floating detail panel + placement decision

A new focused component (`SearchDetailPanel`) rendered in a portal to `document.body`, shown when the dialog is open **and** the active item has a description.

- **Content:** the active item's **title** (header) + **description/snippet** via the existing `HighlightedText` (preserves `<mark>` highlighting). No breadcrumb path — redundant with the row.
- **Placement is decided in JS at position time** (not a CSS breakpoint): measure `window.innerWidth`, the dialog rect, and the active-row rect, then choose:
  - **beside-right** if `innerWidth − dialogRect.right ≥ panelWidth + gap`;
  - else **beside-left** if `dialogRect.left ≥ panelWidth + gap`;
  - else **strip** (§4 fallback). `panelWidth ≈ 260`, `gap ≈ 14`.
- **Position:** `position: fixed`, at the chosen side + gap, vertically aligned to the active row, clamped within the dialog's vertical bounds. Anchored from two `getBoundingClientRect()`s: the dialog content (`[data-slot="dialog-content"]`) and the active row (the `[data-slot="command-item"]` with `aria-selected="true"` / `data-selected="true"`).
- **Non-interactive:** `pointer-events: none`, stacked above the dialog (`z-index` ≥ the dialog's z-50).
- **Recompute** on: active-item change (layout effect keyed on `activeValue`), `CommandList` scroll, and window resize. cmdk already scrolls the active row into view, so it is always visible to anchor to.
- **Show timing:** instantly on highlight, short opacity fade. No hover delay.
- **Empty case:** items with no description show no panel.

### 4. Strip fallback (narrow desktop windows, tablets, mobile)

When placement resolves to **strip** (no room beside), render a **fixed reserved detail strip** in the footer, **directly above the keyboard-hint bar**: always rendered, **fixed height (~54px)**, description clamped to 2 lines, **blank reserved space when the active item has no description**. Description-only (no path), matching the panel. This keeps the dialog height constant in strip-mode too. The panel-vs-strip choice is owned entirely by `SearchDetailPanel`'s placement calculation — there is no separate CSS media-query path.

### 5. Data

Extend the existing per-item detail record (`detailEntries` / `activeDetail`, keyed off cmdk's `activeValue`) to also carry the item's **title** (the panel header needs it). `activeValue` control (already shipped) drives which item is active; the panel and strip both read `activeDetail`.

## Components / boundaries

- `SearchDetailPanel` — owns the placement decision (beside-right / beside-left / strip), the rect math, and the scroll/resize listeners. Given `{ title, description }` plus the active-row/dialog locators, it renders **either** the floating card **or** the in-footer strip. Accepts an optional `placement` **override prop** (an injectable seam) so tests can force `right` / `left` / `strip` and assert each concrete render deterministically — happy-dom can't compute layout to pick a mode itself.
- `DocsSearchDialog` — narrows the dialog to `max-w-2xl`, supplies `activeDetail` (now with title), renders `SearchDetailPanel`, and keeps the hint-bar-only footer. No detail markup left in the footer flow.

## Testing

Scope verification to changed files (pre-existing CI baseline on `main`). Because happy-dom does not compute layout (`getBoundingClientRect()` → zeros, fixed `innerWidth`), the beside-vs-strip **decision and the pixel coordinates are not unit-testable** — they are a manual browser check. Unit tests use the injectable `placement` override to render each concrete mode.

- **Footer/resize:** the always-present footer region contains the keyboard-hint bar and **no** description text in its normal flow. The prior "uses Algolia search" assertion that the breadcrumb path appears 3× (2 rows + footer) reverts to **2×** (rows only), since the footer no longer repeats the path.
- **Floating panel (`placement="right"`):** with results rendered, the panel (`data-testid="search-detail-panel"`) shows the active item's title + snippet; pressing ArrowDown updates it to the next item's snippet (mirrors the shipped controlled-value behaviour).
- **Strip (`placement="strip"`):** the strip (`data-testid="search-detail-strip"`) renders the active description at fixed height above the hint bar.
- **No-description item:** panel/strip shows blank (no description text) when the active item has none.
- **Manual browser check (required):** on a wide window the panel floats beside the dialog aligned to the highlighted row and follows arrow/hover/scroll; on a narrow window it falls back to the strip; the dialog never changes size in either mode.

## Out of scope

- Breadcrumb path in the floating panel / strip (removed as redundant).
- Hover-delay/debounce tuning beyond a simple fade.
- Any change to the filter dropdowns, loader, or search ranking.
- Re-centring the dialog+panel as a unit (rejected — it would shift the dialog horizontally as the panel toggles, reintroducing movement; the dialog stays centred and the panel hangs to the side).
