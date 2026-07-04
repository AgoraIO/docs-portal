# Search dialog — floating detail panel + stable footer

**Date:** 2026-07-03
**Branch:** `feat/search-scope-by-product`
**Component:** `src/components/docs-shell/DocsSearchDialog.tsx`

## Problem

The ⌘K search dialog changes size as the user moves the highlight between results. The cause is the in-footer detail strip: it (a) renders only when the active item has a snippet/path, (b) uses `min-height` with a 2-line-clamped snippet, and (c) conditionally renders the path line (results have a path, tabs don't). So each highlight change can change the footer's height, and because the dialog is centred and sized to its content, the whole dialog resizes.

## Decision (validated by throwaway prototype)

Move the active item's description **out of the dialog's layout flow** into a **floating window beside the dialog**, anchored to the highlighted row. With the detail gone from the footer, the footer holds only the fixed-height keyboard-hint bar, so the dialog body is a constant height — the resize disappears. This was chosen over a fixed in-footer strip and a below-the-row popover after comparing all four in an interactive prototype.

## Design

### 1. Footer becomes hint-bar-only (fixes the resize)

Remove the detail strip from the footer region. The footer keeps only the always-visible keyboard-hint bar (`↑ ↓ navigate · ↵ select · esc close`), which is a constant height. Net: the dialog never resizes on focus change.

### 2. Floating detail panel (desktop)

A new focused component (e.g. `SearchDetailPanel`) rendered in a portal to `document.body`, shown when the dialog is open **and** the active item has a description.

- **Content:** the active item's **title** (header) + **description/snippet** rendered with the existing `HighlightedText` (preserves `<mark>` highlighting). No breadcrumb path — it's redundant with the row.
- **Position:** `position: fixed`, at the dialog's right edge + a small gap, vertically aligned to the active row. Computed from two `getBoundingClientRect()`s: the dialog content (`[data-slot="dialog-content"]`) and the active row (`[data-slot="command-item"][data-selected="true"]`). Clamp within the viewport.
- **Recompute** on: active-item change (React render / layout effect), `CommandList` scroll, and window resize.
- **Show timing:** instantly on highlight, with a short opacity fade. No hover delay (a delay lags behind fast arrow-key navigation).
- **Empty case:** items with no description (e.g. a no-snippet result) show no panel.

### 3. Mobile / narrow fallback

Beside-the-dialog has no room on narrow viewports. Below the `lg` breakpoint, render a **fixed reserved detail strip** in the footer instead (the stable "variant 2": always-rendered, fixed height, description clamped to 2 lines) and hide the floating panel. The split is **CSS-driven** (`hidden lg:block` on the panel, `lg:hidden` on the strip) — no JS media query. Both keep the dialog height constant.

### 4. Data

Extend the existing per-item detail record (`detailEntries` / `activeDetail`, keyed off cmdk's `activeValue`) to also carry the item's **title** (the panel header needs it). `activeValue` control (already shipped) drives which item is active; the panel and strip both read `activeDetail`.

## Components / boundaries

- `SearchDetailPanel` — pure presentational + positioning: given `{ title, description }` and a way to locate the active row + dialog, renders the floating card and positions it. Owns the rect math and the scroll/resize listeners. Testable in isolation.
- `DocsSearchDialog` — supplies `activeDetail` (now with title), renders `SearchDetailPanel` (desktop) and the fixed strip (mobile), and the hint bar. No detail markup left in the footer flow.

## Testing

Scope verification to changed files (pre-existing CI baseline on `main`).

- **Footer/resize:** the always-present footer region contains the keyboard-hint bar and **no** description text in its normal flow. The prior assertion that the breadcrumb path appears 3× (2 rows + footer) reverts to **2×** (rows only), since the footer no longer repeats the path.
- **Floating panel:** with results rendered, the panel (`data-testid="search-detail-panel"`) shows the active item's title + snippet; pressing ArrowDown updates it to the next item's snippet (mirrors the existing controlled-value behaviour).
- **Mobile strip:** the fallback strip (`data-testid="search-detail-strip"`) renders the active description (both panel and strip exist in the test DOM; CSS visibility isn't evaluated by happy-dom, so assert on content/testids, not which is visually shown).
- **No-description item:** neither panel nor strip shows description text when the active item has none.

## Out of scope

- Breadcrumb path in the floating panel (removed as redundant).
- Hover-delay/debounce tuning beyond a simple fade.
- Any change to the filter dropdowns, loader, or search ranking.
