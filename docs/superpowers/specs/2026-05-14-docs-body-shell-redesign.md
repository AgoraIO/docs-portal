# Docs Body Shell Redesign

## Context

The docs portal shell already moved to a local `shadcn/ui`-based header and tabs strip, but the desktop docs body is still structurally wrong for the intended experience.

Current problems:

- the page still behaves like a mostly full-page scroll document instead of a true docs app shell
- the left navigation, main content, and right TOC do not have clear independent scroll boundaries
- the left sidebar usage is too flat and too coupled to the current one-level data shape
- the current sidebar layout does not leave a clean path for future nested navigation with expand/collapse behavior
- long navigation labels can break the left rail visually

The target direction is an ElevenLabs-like docs reading shell:

- compressed top header
- compact left-aligned tabs strip
- fixed-height desktop body below the shell chrome
- left docs navigation
- center reading column
- right TOC rail

This is still a POC. The design should stay simple, but it must establish extensible layout and data boundaries so future hierarchy and polish do not require another structural rewrite.

## Goals

- Rebuild the desktop docs body as a true app-shell layout under the existing header and tabs strip.
- Make the left nav, main content, and right TOC independently scrollable on desktop.
- Re-align docs shell usage with `shadcn/ui` sidebar primitives instead of continuing the current partial ad hoc composition.
- Refactor docs sidebar rendering so it can grow into nested, collapsible navigation later.
- Handle long sidebar labels safely without breaking the rail layout.
- Keep mobile behavior working through the existing sheet-based docs navigation model.

## Non-Goals

- No visual polish pass beyond what is required to make the structure correct.
- No redesign of docs IA, content taxonomy, or routing.
- No requirement to implement nested expand/collapse interactions in this pass.
- No persistence layer for sidebar expansion state.
- No changes to search backend or docs page rendering semantics.

## User Experience Requirements

### Desktop shell

Desktop docs pages must be structured as:

1. `Header`
2. `Tabs strip`
3. `Docs body`

The header and tabs strip remain fixed shell chrome at the top.

The docs body must occupy the remaining viewport height:

- `height = 100svh - header - tabs`

Inside that body:

- left sidebar rail is fixed-width and independently scrollable
- main content column fills remaining space and is independently scrollable
- right TOC rail is fixed-width and independently scrollable

The outer page should no longer be the primary reading scroll container for desktop docs pages.

On desktop, the intended reading model is:

- shell chrome remains fixed
- the docs body is the viewport-bounded region below that chrome
- the browser page itself should not remain the main reading scroll path once the docs body is mounted

### Desktop responsive behavior

- Desktop left rail remains visible from `lg` and above.
- Right TOC rail appears only at `xl` or above.
- Below `xl`, the layout becomes two columns: left nav + main content.
- Main content must use `min-w-0` and own the remaining width so the reading column can actually expand.

### Pagination placement

Previous/next pagination must move inside the main content flow instead of living as a shell-level footer outside the reading column.

That means:

- pagination renders at the bottom of the main reading column
- pagination scrolls with the main content column
- shell-level footer chrome should not force the page back into global scrolling

### Tabs behavior

- top tabs remain a separate shell strip
- switching tabs changes the left sidebar tree to that tab’s nav set
- switching tabs resets the left sidebar scroll position to the top
- main content and TOC naturally reset because navigation lands on a new page

### Left sidebar behavior

The sidebar must stop assuming the nav is a permanently flat list.

The implementation must support, at the component boundary level:

- section labels
- page links
- future nested groups with children

Even if the first pass renders only the currently available depth, the rendering model must be shaped so nested and collapsible behavior can be added without replacing the whole sidebar implementation.

### Long label handling

Long sidebar labels must not break layout.

Rules:

- item labels default to single-line truncation
- section labels also truncate
- icon/chevron affordances must keep fixed width
- future indentation must not rely on shrinking the rail width
- full labels may be exposed via `title` or tooltip, but the rail layout must remain stable without expansion

### Mobile behavior

Mobile behavior should keep the current direction:

- header remains compact
- docs navigation and tabs continue to live in the left sheet
- locale/theme remain reachable in the sheet

This redesign is primarily about the desktop docs body and must not regress the mobile shell.

## Technical Design

### Sidebar primitive strategy

`src/components/ui/sidebar.tsx` should be re-aligned with the current official `shadcn/ui` sidebar primitive shape before further shell work continues.

This does not mean importing a full docs block blindly.

It means:

- use the official sidebar primitive as the base contract
- remove drift that makes the current docs shell composition harder to reason about
- keep docs-specific layout decisions in docs shell components, not in a forked primitive API

### Block adoption strategy

Use `sidebar-03` as a structural reference, not as a full block transplant.

Adopt selectively:

- left sidebar and main inset relationship
- full-height app-shell layout principles
- fixed shell + scrollable interior model

Do not force the docs page into a literal `sidebar-03` copy, because docs still needs a custom right TOC rail.

### Component boundaries

Recommended component responsibilities:

- `DocsShell`
  - owns header + tabs + desktop body frame
- `DocsSidebar`
  - owns left rail container, height contract, and scrolling boundary
- `DocsSidebarTree`
  - renders nav tree nodes
- `DocsSidebarItem`
  - renders section/page/group node variants
- `DocsMainColumn`
  - owns center reading scroll container and in-flow pagination
- `DocsTocRail`
  - owns right TOC container and its independent scrolling boundary

This split is preferred because the current `DocsShell` file is doing too much and the sidebar tree needs a future-proof boundary.

### Data shape

The docs sidebar rendering input should move toward an explicit tree-node contract rather than a permanently flat list with ad hoc separator handling.

Minimum supported node concepts:

- `section`
- `page`
- `group`

The first pass may use a compatibility mapper from the current docs-tree output into the new rendering shape.

That is acceptable and preferred over forcing every upstream producer to change at once.

### State model

- `activeTab` remains route-derived state
- future `expandedSidebarGroups` state may exist at the sidebar tree boundary, but it does not need persistence in this pass
- default expansion behavior, if introduced, should be simple and route-driven

Do not add cookie/localStorage persistence for docs sidebar expansion in this POC pass.

## Acceptance Criteria

The redesign is acceptable when all of the following are true:

- desktop docs body fills remaining viewport height below header and tabs
- left nav scrolls independently
- center reading column scrolls independently
- right TOC rail scrolls independently on `xl+`
- right TOC rail is hidden below `xl`
- left nav width remains stable when labels are long
- tab changes swap the left nav set and reset the left nav scroll position
- pagination lives inside the reading column
- mobile docs navigation still works through the sheet
- no route, search, locale, or theme regressions are introduced by the shell refactor

## Testing Requirements

Minimum required verification:

- component tests for shell structure and independent region contracts
- component tests for sidebar tree rendering contracts
- tests covering long-label truncation class contract where practical
- route/docs shell regression coverage for tab-root navigation behavior
- `bun run types:check`
- `bun run build`

Manual verification should cover:

- large desktop with left nav + main + TOC
- medium desktop with TOC hidden
- tab switch behavior
- long sidebar labels
- mobile sheet navigation still functioning

## Recommended Implementation Bias

Bias toward the fastest path that fixes the shell correctly without premature feature work:

- do the structural shell rewrite now
- keep interaction complexity low
- make component boundaries extensible
- do not spend this pass on fancy nested collapsible UX unless needed to support the structure
