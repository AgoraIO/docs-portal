# Findings

## 2026-05-18
- `realtime-media` currently stores all product pages as flat files directly under `content/docs/{locale}/realtime-media/`.
- The left sidebar is ordered by `content/docs/{locale}/realtime-media/meta.json`, which currently uses separator strings and page slugs rather than true product-folder structure.
- The docs router currently supports only one page slug segment beyond the tab. `buildDocPath`, `getSourceSlugs`, `getContentPathSegments`, and `parseSourceSlugs` all assume `tab + optional single slug`.
- The page route only matches `/$locale/$tab/$slug`, which is insufficient for nested product docs like `/en/realtime-media/rtc/get-started`.
- Sidebar generation currently flattens folder nodes in `flattenSidebarNode`, so even if content folders are introduced, they will not render as product directories without code changes.
- Collapsible sidebar behavior is currently driven by hard-coded section titles in `isCollapsibleSectionTitle`, not by content metadata.
- The request is to move `realtime-media` to a doc-engineer-owned product directory model with at most two levels per product; this implies preserving folder nodes in the sidebar rather than continuing to encode structure through separator strings.
- The legacy `online-ktv` content is recoverable, but not by direct inclusion. It relies on old portal-only imports (`@doc-shared/*`, `@theme/Tabs`, `ProductOverview`, `PlatformFilter`, `QuickStartCard`, `HotArticleCard`, `Row`, `Col`) that do not exist in the new portal.
- A practical migration strategy for `online-ktv` is:
  1. preserve the old sidebar semantics by translating `._sidebar_.meta.js` files into new `meta.json` files,
  2. migrate “plain” or low-dependency pages first by converting `.mdx` to `.md`,
  3. leave heavier landing pages and shared-partial pages for a later compatibility pass.
