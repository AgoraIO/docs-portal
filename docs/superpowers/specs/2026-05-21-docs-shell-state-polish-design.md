# Docs Shell State Polish Design

## Goal

Refine the docs shell interaction states so navigation hover, active, tabs, header actions, and TOC highlighting feel calm, aligned, and layout-stable without changing the docs information architecture or shell structure.

## Confirmed Scope

This is a focused visual and interaction polish pass for the existing docs shell. It should preserve the current routes, tabs, sidebar data, search behavior, locale switching behavior, theme behavior, content source, and desktop/mobile shell structure.

The work includes:

- Softer hover states for left navigation, TOC links, and right-rail action links.
- Layout-stable active states for left navigation and TOC links.
- Tabs underline alignment with the tabs strip separator.
- Ghost styling for language, theme, and GitHub header actions.
- TOC highlighting for all sections whose content is visible in the page viewport, with one primary active item for `aria-current`.

The work excludes:

- Changing docs IA, tab definitions, sidebar tree generation, or content grouping.
- Rebuilding the shell layout grid.
- Adding analytics or persistence for TOC state.
- Reworking search dialog styling beyond what is needed to keep header actions visually coherent.
- Introducing new shadcn variants unless existing local class composition becomes unmaintainable.

## Current System

Relevant files:

- `src/components/docs-shell/DocsShell.tsx`: header controls, language switcher, theme button, GitHub button, tabs strip, mobile sheet.
- `src/components/docs-shell/DocsSidebarTree.tsx`: desktop sidebar link, nested link, active, and hover classes.
- `src/components/docs-shell/DocsContent.tsx`: `DocsTableOfContents`, TOC scroll behavior, active item state, right-rail action links.
- `src/components/docs-shell/DocsTocRail.tsx`: desktop TOC rail container.
- `src/components/ui/tabs.tsx`: shared tabs trigger underline implementation.
- `src/components/ui/button.tsx`: shared button variants used by header actions.
- `src/styles/app.css`: docs shell tokens, including `--docs-soft-fill`, `--accent-brand`, `--accent-brand-soft`, `--ink-*`, and border tokens.

Existing tests already cover:

- Header row and tabs strip separation.
- Header controls and active tab links.
- Desktop sidebar, main column, and TOC regions.
- TOC click-to-scroll and single active item behavior.
- Mobile sheet access to locale and theme controls.

## Design Decisions

### Hover States

Hover should be a light feedback state, not a card-like surface.

Apply this principle to:

- Sidebar page links.
- Sidebar sub links.
- Sidebar section toggles.
- TOC links.
- TOC right-rail action links such as edit and GitHub.
- Header ghost actions.

Recommended visual treatment:

- Text changes from `--ink-3` to `--ink-1`.
- Background is transparent or `--docs-soft-fill`.
- Avoid `bg-card` for hover in nav lists, because it reads as a sudden white block in the current shell.
- Preserve focus-visible rings for keyboard users.

### Active States

Left navigation and TOC active states must not use heavier font weight. The active state should keep the same text metrics as inactive and hover states.

Use:

- Regular or existing base font weight.
- Text color change to `--ink-1` or `--accent-brand`, depending on context.
- A 2px left indicator.
- A subtle fill using `--accent-brand-soft` or a softer docs state token.

Avoid:

- `font-semibold` on active sidebar links.
- `font-semibold` on active TOC links.
- Any active style that changes label width or line wrapping.

### Tabs Underline

The active tabs underline should align with the tabs strip bottom separator. The separator is the baseline; the active tab underline is a stronger segment of that same baseline.

Implementation intent:

- Keep the tabs strip `border-b`.
- Move the line-variant `TabsTrigger` pseudo-element to the same y-axis as that border.
- Remove the current visual offset where the underline sits below the separator.
- Keep the active underline height at about 2px.
- Preserve the existing active text styling and tab links.

### Header Actions

Search remains the only input-like bounded header control.

Language, theme, and GitHub should be ghost actions:

- Language keeps `LanguagesIcon + current locale label`.
- Theme remains icon-only.
- GitHub remains icon-only.
- Hover is subtle, using the same light hover treatment as the rest of the shell.
- Desktop language should no longer look like an outline pill.
- Mobile sheet locale/theme controls should also avoid outline styling where practical.

### TOC Visibility Highlighting

TOC should highlight every item whose content section is visible in the active docs scroll viewport. On desktop, that viewport is the nested main column scroll container returned by the existing docs scroll-container helper. On mobile or any layout without the desktop scroll container, it is the browser viewport.

Each TOC item owns a section range:

- Start: its heading top.
- End: the next heading with depth less than or equal to the current item depth.
- If no such heading exists, the section ends at the bottom of the article content.

If a section range intersects the visible scroll viewport by more than a minimal threshold, that TOC item is visible-active. Use a small threshold such as `4px` to avoid flickering when only a sub-pixel or border edge intersects the viewport.

There must still be one primary active item:

- Primary active is the current scroll anchor used for `aria-current="location"`.
- It should remain compatible with current click-to-scroll and hash update behavior.
- Only the primary active item gets `aria-current`.

Visible-active items:

- Use a lighter version of the active visual treatment.
- Do not set `aria-current`.
- Should not override the primary active item styling.

## Accessibility

- Preserve keyboard focus states on links, buttons, tabs, and popover triggers.
- Preserve `aria-current="page"` for sidebar/page links where currently provided by router output or explicit state.
- Preserve `aria-current="location"` for exactly one TOC item.
- Do not use multiple `aria-current` values for visible TOC items.
- Header ghost buttons must keep their current accessible labels.
- Language options remain crawlable links with `hrefLang`.

## Testing Plan

Use targeted component tests and one browser-backed visual check.

Test updates:

- `src/components/docs-shell/DocsShell.test.tsx`
  - Assert desktop language trigger uses `variant="ghost"` styling or does not include outline-specific classes.
  - Assert mobile theme button no longer uses outline styling.
  - Keep existing assertions that search, language, theme, GitHub, and tabs are present.

- `src/components/docs-shell/DocsContent.test.tsx`
  - Replace or extend the current single-active TOC scroll test.
  - Add a test where two section ranges intersect the scroll viewport.
  - Assert both items receive visible-active state.
  - Assert only one item receives `aria-current="location"`.
  - Keep click-to-scroll behavior and hash update expectations.

- `src/components/docs-shell/DocsSidebarTree.test.tsx`
  - Add or update assertions that active sidebar links do not include `font-semibold`.
  - Assert active sidebar links still expose active styling through indicator/fill/text classes.

- `src/components/ui/tabs` tests if no existing test covers class contract.
  - Assert line variant active underline class aligns to the strip baseline rather than using the old negative offset.

Browser verification:

- Open a representative docs page with multiple headings.
- Verify left nav hover and active states do not shift text width.
- Verify TOC shows multiple visible sections while only one is primary active.
- Verify tabs underline visually sits on the separator line.
- Verify language/theme/GitHub controls read as ghost actions.
- Check one mobile viewport around 390-500px for header/sheet regressions.

## Implementation Notes

- Prefer local class constants in `DocsSidebarTree.tsx` and `DocsContent.tsx` over broad CSS overrides.
- If the same state classes are repeated too much, extract small local constants, not new global component variants.
- Keep `button.tsx` and `tabs.tsx` changes minimal because they are shared primitives.
- Use existing tokens first: `--docs-soft-fill`, `--accent-brand`, `--accent-brand-soft`, `--ink-1`, `--ink-3`, `--line`, and `--line-strong`.
- Do not introduce new colors unless an existing token cannot express the state clearly.

## Acceptance Criteria

- Hover states across sidebar, TOC, and header actions are subtle and no longer appear as abrupt white cards.
- Sidebar and TOC active states do not change text width or cause wrapping shifts.
- Active tabs underline aligns with the tabs strip separator.
- Desktop language, theme, and GitHub actions use ghost styling; search remains input-like.
- TOC highlights all currently visible content sections and exposes exactly one `aria-current="location"`.
- Existing locale switching, theme switching, search, sidebar scroll reset, and TOC click-to-scroll behavior continue to work.
