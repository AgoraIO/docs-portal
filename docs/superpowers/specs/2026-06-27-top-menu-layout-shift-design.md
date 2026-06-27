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

Keep the bold emphasis on the active tab, but stop the menu from shifting. The
active and inactive tabs look the same as today; the only deliberate change is
that each tab now permanently reserves room for its bold title, so inactive
tabs carry ~1–2px of extra internal slack and the whole row is marginally wider.
This is imperceptible for the short tab titles in use and is inherent to keeping
the bold — it is the cost that buys away the layout jump.

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
   (line 352) and add `group/tab` to it. The `Link` keeps `font-medium` as its
   baseline.
2. Replace the bare `{tab.title}` with a grid-stack wrapper whose visible copy
   reads the active state from the `Link`'s group:

   ```jsx
   <span className="grid">
     <span aria-hidden className="invisible col-start-1 row-start-1 font-semibold">
       {tab.title}
     </span>
     <span className="col-start-1 row-start-1 group-data-[state=active]/tab:font-semibold">
       {tab.title}
     </span>
   </span>
   ```

   Mechanism: `TabsTrigger` uses `asChild`, so Radix renders the trigger as the
   `Link` and sets `data-state="active"` on that `Link` element only. A plain
   `data-[state=active]:` modifier on the inner span would never fire, because
   the span has no `data-state`. Tagging the `Link` with `group/tab` and using
   `group-data-[state=active]/tab:font-semibold` on the visible span lets it
   react to the `Link`'s state. This named-group idiom is already used
   throughout `tabs.tsx` and `DocsShell.tsx`.
3. Leave the optional leading icon (`docs-tab-icon` span) exactly where it is,
   before the title wrapper.

## Out of scope

- The vertical mobile navigation (`DocsShell.tsx:606`). It stacks tabs
  vertically, so a weight change does not push siblings horizontally. Left
  unchanged.
- Any change to colors, the underline indicator, spacing, or tab ordering.

## Testing

jsdom does not perform real layout (`getBoundingClientRect` returns zeros), so
tests cannot assert pixel-level "no shift." They guard the *structure* the fix
depends on. The no-shift result itself is verified by eye once — the grid-stack
technique is deterministic, so it needs no ongoing pixel assertions.

Extend `src/components/docs-shell/DocsShell.test.tsx`:

- Assert each top tab renders the title twice — one `aria-hidden` ghost copy at
  `font-semibold` and one visible copy — so removing the space-reservation
  fails the test.
- Confirm the visible copy carries `group-data-[state=active]/tab:font-semibold`
  and the `Link` no longer carries an unconditional active-state weight change
  that would reintroduce the shift.

Manual check (once): activate each top tab and confirm sibling tabs do not move.
