# Prevent top-menu layout shift on active-tab bolding

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan

## Problem

The top navigation tabs render at `font-medium` and switch to `font-semibold`
when active (`src/components/docs-shell/DocsShell.tsx:352`). Semibold text is
wider than medium, so activating a tab widens it and pushes every sibling tab
horizontally. The result is a visible positional jump across the whole menu row
each time the user picks a different top menu.

The active tab is already signaled a second way — by the underline indicator
(the `::after` element from the `variant="line"` tabs). The font-weight change
is purely cosmetic emphasis on top of that.

## Goal

Keep the bold emphasis on the active tab, but stop the menu from shifting. No
visual change to how the menu looks at rest or when active — only the layout
jump is removed.

## Approach

Reserve horizontal space for the bold text so the tab's width is constant
regardless of weight. Use a **grid-stack ghost**: each tab title is rendered
twice in a single-cell CSS grid — an invisible `font-semibold` copy that fixes
the width, and a visible copy whose weight toggles medium ↔ semibold. The grid
cell always sizes to the (widest) bold copy, so the visible text never alters
the layout.

Considered and rejected:

- **`::before` ghost via `content: attr(data-title)`** — fewer DOM nodes, but
  `attr()` content has escaping quirks and `::after` is already used by the
  underline indicator, so it means juggling pseudo-elements. More fragile.
- **Fixed/min-width per tab** — simple but brittle; breaks with localized
  titles (titles are localized here) and wastes space.

The grid-stack approach is font- and locale-agnostic and stays clear of the
existing underline pseudo-element.

## Changes

In `src/components/docs-shell/DocsShell.tsx`, within the top-menu `TabsList`
(currently lines 344-369):

1. Remove `data-[state=active]:font-semibold` from the `Link`'s className
   (line 352). The `Link` keeps `font-medium` as its baseline.
2. Replace the bare `{tab.title}` with a grid-stack wrapper:

   ```jsx
   <span className="grid">
     <span aria-hidden className="invisible col-start-1 row-start-1 font-semibold">
       {tab.title}
     </span>
     <span className="col-start-1 row-start-1 data-[state=active]:font-semibold">
       {tab.title}
     </span>
   </span>
   ```

   The active-weight toggle now lives on the *visible* span only. (If the
   `data-[state=active]` attribute does not propagate to the inner span, drive
   the visible copy's weight from the same active signal the `Link` already
   receives — the implementation plan resolves this against the actual Tabs
   primitive.)
3. Leave the optional leading icon (`docs-tab-icon` span) exactly where it is,
   before the title wrapper.

## Out of scope

- The vertical mobile navigation (`DocsShell.tsx:606`). It stacks tabs
  vertically, so a weight change does not push siblings horizontally. Left
  unchanged.
- Any change to colors, the underline indicator, spacing, or tab ordering.

## Testing

Extend `src/components/docs-shell/DocsShell.test.tsx`:

- Assert each top tab renders the title twice — one `aria-hidden` ghost copy at
  semibold and one visible copy — so the space-reservation cannot silently
  regress.
- Confirm the `Link` no longer carries an unconditional active-state width
  change that would reintroduce the shift.
