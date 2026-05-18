# Task Plan

## Goal
Refactor the `realtime-media` tab into a product-directory model where each product owns its own folder and up to two navigation levels, so document engineers can add or remove product docs by editing content structure instead of code-side separator lists.

## Phases
- [in_progress] Audit current `realtime-media` routing, sidebar generation, and content tree constraints
- [pending] Upgrade docs routing and content path resolution to support nested product paths for `realtime-media`
- [pending] Upgrade sidebar tree generation so folder structure is preserved instead of flattened
- [pending] Restructure `content/docs/{en,zh-CN}/realtime-media` into per-product folders with product-local indexes
- [pending] Update tests and verify local runtime behavior for nested product docs

## Risks
- The current docs router only supports one slug segment (`/$locale/$tab/$slug`), so nested paths will require coordinated route, loader, and path utility changes.
- The current sidebar builder flattens folder nodes, so preserving a two-level product tree requires logic changes that may affect other tabs if not scoped carefully.
- Existing links across the repo may point to old flat `realtime-media` URLs and need redirect or content updates.

## Follow-up
- Keep the change scoped to `realtime-media` for now; other tabs can remain on the current flat model until this pattern is proven.
