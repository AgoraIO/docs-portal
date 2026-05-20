# Task Plan

## Goal
Migrate and supplement the English `introduction` tab from `Doc-Source-Private` into Fumadocs-friendly Markdown pages under `content/docs/en/introduction`, using local MDX files as the source of truth, preserving any MDX-only source fragments as comments, localizing images, and removing migrated `.mdx` pages from the target directory.

## Phases
- [in_progress] Audit `content/docs/en/introduction` and map each page to its source files in `Doc-Source-Private`
- [pending] Update repo-local planning files with the English introduction migration scope and source mapping
- [pending] Rewrite `content/docs/en/introduction` pages in Markdown with complete frontmatter and source-backed content
- [pending] Copy required image assets into `public/images/...` and update image references to local paths
- [pending] Update `content/docs/en/introduction/meta.json` if needed and verify no migrated `.mdx` files remain
- [completed] Run a local verification pass for content paths, links, and image references
- [completed] Start a local preview server and verify introduction routes return successfully

## Risks
- `Doc-Source-Private` does not contain a ready-made `introduction` tree, so several introduction pages must be assembled from multiple product and shared source files.
- Many source pages are MDX-heavy and rely on components such as `ProductOverview`, `Tabs`, `TabItem`, and token macros; these must be converted into plain Markdown while preserving original MDX snippets as comments.
- Some shared pages reference image paths like `/images/common/...` that are not yet present in `docs-portal/public`, so assets must be copied deliberately to avoid broken images.

## Follow-up
- Keep this pass scoped to `content/docs/en/introduction`; do not modify `zh-CN` or YAML sources.
