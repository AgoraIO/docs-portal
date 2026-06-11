# Task Plan

## Goal
Migrate the entire `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private/agora-chat` documentation tree into `content/docs/en/realtime-media/im` in the portal repo, converting legacy MDX/Docusaurus patterns into Fumadocs-compatible Markdown structure with complete frontmatter, local images, working internal links, and `meta.json` navigation.

## Phases
- [in_progress] Audit the full `agora-chat` source tree, shared imports, category metadata, and legacy JSX/component patterns
- [pending] Build a repeatable migration pipeline that expands shared MDX imports and converts legacy syntax to Markdown
- [pending] Generate the target `im` directory tree, pages, images, and `meta.json` files in Fumadocs structure
- [pending] Normalize internal links, ensure no migrated `.mdx` remains, and preserve YAML files untouched
- [pending] Run content recognition and link verification, then summarize migrated files and remaining manual review items

## Risks
- Many `agora-chat` pages are wrappers around `shared/chat-sdk/**` and `shared/common/**`, so simple file copy is insufficient.
- Platform-specific blocks are embedded inline with `PlatformWrapper`, which must be preserved in a readable static form without relying on runtime filters.
- Some pages include AI-tooling content (`mcp`, `skills`) whose best target path inside `im` may need follow-up editorial confirmation.
- Existing repo-wide `tsc --noEmit` errors may limit full verification even when migrated docs themselves compile at the content layer.

## Follow-up
- Keep this pass focused on English `agora-chat` to `realtime-media/im`.
- Do not modify `.yaml` or `.yml` source files.
