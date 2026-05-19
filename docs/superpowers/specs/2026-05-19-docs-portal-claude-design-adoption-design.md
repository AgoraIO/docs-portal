# Docs Portal Claude Design Adoption Design

## Goal

Apply the Claude standalone docs design at `file:///Users/czhen/Downloads/Agora%20Docs%20_Standalone_%20(1).html` to the current `docs-portal` shell while keeping the existing content source, routing, i18n, search, and docs tree as the product source of truth.

## Confirmed Scope

The Claude HTML is a visual and interaction reference, not an IA or content source. The implementation should preserve the real docs tree from `external/docs-cortex/raw/docs`, the current localized route model, the current search dialog behavior, and the current TanStack Start + Fumadocs data flow.

The work includes:

- Adopting the reference theme tokens across light and dark modes.
- Restyling the existing header, tabs strip, sidebar, main content column, right TOC rail, prose, and pager.
- Adding page chrome that the reference makes useful for real docs: breadcrumb, reading time pill, and a helpful feedback UI.
- Keeping mobile behavior usable with sticky header/tabs, drawer navigation, no desktop sidebar, no TOC rail, and non-overflowing content controls.

The work excludes:

- The fake `v4.2` badge.
- Claude's sample sidebar badges such as `new` and `beta` unless real metadata exists later.
- Fake overview cards or any static content copied from the standalone file.
- Right-rail `Edit this page` or `View on GitHub` links unless a real source URL is added separately.

## Current System

The app is a TanStack Start + Fumadocs docs shell. Relevant files:

- `src/components/docs-shell/DocsShell.tsx`: header, tabs strip, mobile sheet, shell layout composition.
- `src/components/docs-shell/DocsSidebar.tsx`: desktop sidebar container and scroll reset.
- `src/components/docs-shell/DocsSidebarTree.tsx`: sidebar page and section rendering.
- `src/components/docs-shell/DocsMainColumn.tsx`: desktop/mobile main column scroll and prev/next footer.
- `src/components/docs-shell/DocsTocRail.tsx`: desktop TOC rail.
- `src/components/docs-shell/DocsContent.tsx`: article title, description, TOC fallback, MDX body mounting.
- `src/styles/app.css`: MiSans font faces, theme tokens, shadcn/Fumadocs token mapping, prose, tables, code blocks.
- `src/lib/docs-page.server.ts` and `src/lib/docs-tree.ts`: docs page payload, tabs, sidebar, and navigation data.

Existing tests already cover header/tabs separation, desktop shell regions, sidebar scroll reset, locale switching, search dialog behavior, and sidebar tree rendering.

## Reference Facts

The standalone reference was inspected in `agent-browser` at desktop `1440x900` and mobile `500x701`.

Desktop reference:

- Page background is warm neutral `#fbfaf7`.
- Header height is about `52px`; tabs strip is about `40px`.
- Shell max width is `1440px`.
- Body grid is `256px minmax(0, 1fr) 220px`, with `16px` horizontal shell padding.
- Sidebar starts at x=16, width `256px`, is transparent, sticky, and scrollable.
- Main region starts at x=272, width about `932px`, with `36px 56px 96px` internal padding.
- Article readable width is `720px`; description max width is `640px`.
- TOC rail is `220px`, transparent, sticky, and uses a subtle left indicator for active headings.

Mobile reference:

- Header and tabs remain sticky.
- Desktop sidebar and TOC are hidden.
- Main content is full width with `16px` horizontal padding.
- Page chrome remains visible, including breadcrumb, title, reading time, feedback, and pager.

## Theme Design

Adopt the reference token model in `src/styles/app.css` and map it through existing shadcn and Fumadocs variables.

Light tokens:

```css
--bg: #fbfaf7;
--bg-card: #ffffff;
--bg-elev: #ffffff;
--bg-sunken: #f4f2ec;
--ink-1: #0e0f12;
--ink-2: #2a2c33;
--ink-3: #5b606b;
--ink-4: #8a8f9a;
--line: rgba(14, 15, 18, 0.075);
--line-strong: rgba(14, 15, 18, 0.12);
--accent: oklch(0.56 0.18 280);
--accent-soft: oklch(0.56 0.18 280 / 0.10);
--accent-ring: oklch(0.56 0.18 280 / 0.28);
```

Dark tokens:

```css
--bg: #0b0c0e;
--bg-card: #111316;
--bg-elev: #15171b;
--bg-sunken: #0a0b0d;
--ink-1: #f3f4f6;
--ink-2: #d8dae0;
--ink-3: #9aa0ab;
--ink-4: #6c7280;
--line: rgba(255, 255, 255, 0.07);
--line-strong: rgba(255, 255, 255, 0.12);
--accent: oklch(0.75 0.16 280);
--accent-soft: oklch(0.7 0.18 280 / 0.16);
```

The current teal radial page background should be removed. `html`, `body`, and shell containers should use `--bg` without decorative gradients.

The existing `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, and `--color-fd-*` variables should be derived from the new docs tokens so components stay coherent.

## Layout And Page Chrome Design

### Header And Tabs

`DocsShell` should keep the current data and controls but match the reference density:

- Header row around `52px` high.
- Header max width `1440px`.
- Header horizontal padding `28px` on desktop, `16px` on mobile.
- Search width `320px` on wide desktop, retaining the current command dialog.
- Language button and theme icon button should use the reference compact border, radius, and color system.
- Tabs strip should be sticky below the header, `40px` high, horizontally scrollable, and visible on mobile and desktop.
- Active tab should use `--accent` underline and `--ink-1` text.

Tab icons are optional. If added, they must use a stable local mapping by tab id and lucide icons. They must not create new content concepts.

### Desktop Shell Grid

The desktop shell should use the reference grid:

```css
grid-template-columns: 256px minmax(0, 1fr) 220px;
max-width: 1440px;
padding-inline: 16px;
```

The existing flex shell can be replaced by a grid if that keeps the height and scroll contracts clearer. The sidebar, main scroll, and TOC must continue to respect the sticky header and tabs height.

Sidebar:

- Width `256px`.
- Transparent background.
- No heavy border-right panel.
- Sticky height `calc(100svh - var(--docs-shell-header-offset))` or equivalent.
- Scroll reset on active tab changes must keep working.
- Group labels should use uppercase, `11px`, muted ink.
- Active page should use accent text, accent-soft background, 7px radius, and a 2px left indicator.
- Long labels must still wrap or clamp without pushing layout width.

Main:

- Desktop main padding should be approximately `36px 56px 96px`.
- Article content width should be `720px`.
- Description should cap at `640px`.
- Do not center the article independently; align it with the reference left edge inside the main region.

TOC:

- Width `220px`.
- Transparent background.
- No heavy border-left rail.
- Sticky and scrollable.
- TOC heading should be uppercase and muted.
- Links should use a left border indicator for active or hover states.

### Page Header

`DocsContent` should render real page chrome before the MDX body:

- Breadcrumb from real data: locale tab title, nearest sidebar section when available, and current page title.
- `h1` from the real page title.
- Description from existing page frontmatter.
- Reading time pill computed from available page text on the server, rounded to at least 1 minute.

The current route payload should be extended to pass the small amount of data needed for breadcrumb and reading time. Avoid client-only computation for reading time because the server already loads page text for TOC fallback and search data.

### Prose And Content Components

The prose layer should match the reference tone:

- `h1` around `38px/1.15`, weight `700`; Chinese should keep `letter-spacing: 0`.
- `h2` around `22px`, with generous top spacing and optional top border after the first heading.
- Body text should use `--ink-2`; secondary descriptions use `--ink-3`.
- Links should use the violet accent with subtle underline and hover background.
- Inline code should use `--bg-sunken`, `--line`, 5px radius.
- Code blocks, tables, and existing Fumadocs components should inherit the new surface tokens rather than separate one-off colors.

### Footer

`DocsMainColumn` should replace the existing plain footer links with reference-style pager cards:

- Two-column cards on desktop.
- Cards stack or remain two compact columns only when text fits on mobile.
- Label text uses uppercase muted style.
- Titles use `--ink-1`, semibold.
- Hover states use accent border/background.

Before the pager, add a static helpful feedback bar:

- Text: localized via `common` resources.
- Buttons: localized `Yes` and `No`.
- No backend or analytics in this phase.
- Buttons can keep local selected state for immediate visual feedback, but persistence is out of scope.

### Mobile

Mobile should keep the existing drawer navigation but adopt the reference density:

- Header remains sticky.
- Tabs strip remains visible and horizontally scrollable.
- Sidebar and TOC rail are hidden.
- Main content uses `24px 16px 64px`.
- Breadcrumb, reading time, feedback, and pager must not overflow at `390px` and `500px` widths.
- The mobile drawer should reuse the same sidebar link styling tokens where practical.

## Testing

Use targeted tests rather than broad snapshots.

Add or update component tests to cover:

- Header and tabs strip remain separate and include the current search, language, theme, and tabs.
- Tabs strip is available on mobile markup, not desktop-only.
- `DocsContent` renders breadcrumb, reading time, title, description, and MDX body in order.
- Reading time is computed server-side and has a minimum of 1 minute.
- Helpful feedback renders localized controls and supports local selected state if implemented.
- Pager stays inside the main column and renders previous/next cards.
- Sidebar scroll reset still works after active tab changes.

Browser verification is required:

- Compare the current app against the standalone reference at `1440x900`.
- Verify mobile at `390x844` and `500x701`.
- Confirm sidebar scroll still works with long navigation.
- Confirm theme toggle changes the token set and controls remain visible.

## Implementation Sequence

1. Theme token alignment in `src/styles/app.css`.
2. Header, tabs, shell grid, sidebar, and TOC layout updates.
3. Server payload additions for breadcrumb and reading time.
4. Page header, prose, feedback, and pager updates.
5. Mobile polish and browser verification.

Each step should be independently testable and commit-ready.
