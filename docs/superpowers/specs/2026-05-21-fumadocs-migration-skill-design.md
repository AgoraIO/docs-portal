# Fumadocs Migration Skill Design

## Goal

Create a repository-owned Codex skill that guides agents migrating legacy Shengwang docs into this portal's Fumadocs content model while treating Markdown/MDX native syntax and Fumadocs-supported directives as the content-layer standard.

## Confirmed Scope

This skill is for migration from the legacy docs source at `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source` into the current `docs-portal` content model. It should help agents classify source files, choose standard rewrites, audit deferred work, and verify the result with the Fumadocs compiler.

The first version includes:

- A concise skill entrypoint at `.agents/skills/fumadocs-migration/SKILL.md`.
- Reference files for standards, legacy case mappings, and the audit report schema.
- An audit script that scans the legacy source and writes machine-readable JSON plus a Markdown summary.
- Design and implementation plan documents under `docs/superpowers`.

The first version excludes:

- Automatic content rewrite scripts.
- Generated HTML API migration.
- Installing or wiring `fumadocs-openapi`.
- Adding broad compatibility plugins or legacy component aliases.

## Core Principle

The migrated content source must be standard Markdown/MDX native first. When a richer block is needed, use Fumadocs-supported MDX features or Markdown/directive syntax that can be mapped by remark/rehype. Rendering components are implementation details; they must not define the content format.

Legacy JSX is an input smell, not a target format. Old Docusaurus components such as `<Admonition>`, `<PlatformFilter>`, `<Table>`, `<Image>`, `<ProductOverview>`, `<ApiSectionCard>`, and `<OverloadMethodCollapse>` must not survive in migrated content.

## Current System

Current docs-portal facts:

- Content lives under `content/docs`.
- Fumadocs content is configured in `source.config.ts` with `defineDocs`, `applyMdxPreset`, `remarkDirective`, and `remarkDirectiveAdmonition`.
- Accepted frontmatter is currently `title`, `description`, `icon`, `full`, and `_openapi`.
- `bun run types:check` runs `fumadocs-mdx && tsc --noEmit`.
- Platform-specific RTM2 content is already statically split into platform directories such as `android`, `ios`, `javascript`, `cpp`, `flutter`, `harmonyos`, `swift`, and `unity`.

Legacy source facts discovered during exploration:

- Roughly 2143 legacy MD/MDX files were found across docs, API reference docs, and shared snippets.
- Roughly 221 legacy JS metadata files exist, including `_sidebar_.meta.*.js`, `_platforms_.meta.js`, `_products_.meta.js`, and `_usecase_.meta.js`.
- `html-docs` contains roughly 2148 generated API artifact files and about 26 OpenAPI YAML/JSON-like source files.
- Heavy MDX JSX usage includes `Table`, `Tr`, `Td`, `Admonition`, `PlatformFilter`, `H2`, `H3`, `Image`, `Tabs`, card components, API reference components, and landing page components.
- `@shared` imports appear in hundreds of files and must be migrated to Fumadocs include or static standardized content.

## Design Decisions

### Skill Location

The skill lives in the repository at `.agents/skills/fumadocs-migration`. It is versioned with the portal because the rules depend on this repo's Fumadocs versions, content schema, source config, and migration direction.

### Skill Shape

Use a hybrid skill:

- `SKILL.md` stays short and procedural.
- `references/standards.md` explains the target content standard.
- `references/legacy-casebook.md` maps legacy cases to target rewrites.
- `references/report-schema.md` defines audit report fields and statuses.
- `scripts/audit-legacy-docs.mjs` scans and reports; it never rewrites content.

This keeps the skill maintainable and lets future updates add case rules without expanding the entrypoint.

### Content Standard

Prefer target forms in this order:

1. Markdown native: headings, links, images, lists, code fences, GFM tables.
2. Markdown/MDX directive syntax: admonitions, tabs, steps, cards, platform notes, or any semantic block that can be compiled through remark/rehype.
3. Fumadocs MDX native features such as include.
4. MDX JSX only for newly approved runtime widgets, never as a compatibility layer for old JSX.

Callouts should be written as directives such as:

```mdx
:::info[一个核心心智模型]
可以把 Agora 理解成实时互动层：它把人、设备、媒体、消息和 AI 服务放进同一个持续在线的会话上下文里。
:::
```

The renderer may map this to `fumadocs-ui`, a local component, or another implementation. The content must remain directive-first.

### Shared Content

Shared content is allowed. The target is Fumadocs include, not legacy `@shared` imports.

Use:

```mdx
<include>./_shared/foo.mdx</include>
```

or the Fumadocs-supported Markdown/directive equivalent when operating in `.md` files. Shared files must themselves be standardized before inclusion. Legacy `props.*`, `frontMatter.ag_platform`, and `@shared` runtime imports are forbidden in target content.

### Platform Variants

Legacy `<PlatformFilter>` is forbidden in migrated output. Platform/product variants are statically expanded into paths, files, or navigation structure before content lands in the portal.

Code-language switching may use tabs/directives. Product or platform differences should not rely on runtime JSX filtering.

### Frontmatter And Metadata

Legacy build-injected fields such as `displayed_sidebar`, `ag_product`, `ag_platform`, `ag_product_label`, `ag_usecase`, and `ag_file_path` are deleted. Product/platform information belongs in the path, `meta.json`, or source data, not page runtime variables.

Legacy executable metadata files are inputs only:

- `_sidebar_.meta.*.js` becomes `meta.json` ordering and grouping.
- `_platforms_.meta.js` drives static platform page planning.
- `_products_.meta.js` drives IA mapping.
- `ag-html-autogen` becomes a generated API deferral marker.

No executable JS metadata should be carried into target content.

### Tables And Images

Legacy table JSX migrates to GFM tables whenever possible. Complex row/column spans or block-heavy cells may use native HTML `<table>`, but not React table components.

Images default to Markdown image syntax. Width, inline icon, and caption needs must use a repo-approved native/directive standard; if no standard exists, the audit must mark the case instead of keeping `<Image>`.

### API Reference And OpenAPI

Hand-authored API reference MDX is not treated as normal prose. Prefer upstream structured sources when available. If no source exists, convert conservatively to headings, definition tables, code blocks, and directives.

RESTful/OpenAPI YAML remains the source of truth. The target is the Fumadocs OpenAPI lane, not flattening YAML into one-off Markdown. The first skill version should identify OpenAPI sources and mark follow-up work; it should not create a custom React renderer.

Generated `html-docs` content is deferred by default. The audit must still record each generated API area so it cannot be forgotten.

### Compatibility Plugins

Compatibility plugins are prohibited by default. Allowed plugins must serve the new standard, such as directive parsing, Fumadocs include support, heading IDs, code highlighting, link normalization, or image path normalization.

Do not add `rehype-raw`, old component alias maps, or runtime variable simulation merely to compile legacy content.

### Audit Reporting

Each migration or audit run should produce:

- Machine-readable JSON.
- Human-readable Markdown summary.

Reports must mark deferred generated API items and unresolved standards. A successful build is not enough if the report hides unclassified or deferred content.

## File Structure

- Create `.agents/skills/fumadocs-migration/SKILL.md`: trigger metadata, workflow, and reference-loading guidance.
- Create `.agents/skills/fumadocs-migration/references/standards.md`: target Fumadocs content rules and verification gates.
- Create `.agents/skills/fumadocs-migration/references/legacy-casebook.md`: legacy syntax to target rewrite mapping.
- Create `.agents/skills/fumadocs-migration/references/report-schema.md`: JSON/Markdown report schema and status taxonomy.
- Create `.agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs`: deterministic audit-only scanner.
- Create `.agents/skills/fumadocs-migration/agents/openai.yaml`: UI metadata for the skill.
- Create `docs/superpowers/plans/2026-05-21-fumadocs-migration-skill.md`: implementation plan.

## Testing And Validation

Skill file validation:

- Check YAML frontmatter is present and concise.
- Check reference files are reachable from `SKILL.md`.
- Check `agents/openai.yaml` has quoted string values and a default prompt mentioning `$fumadocs-migration`.

Audit script validation:

- Run against `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source`.
- Confirm it writes JSON and Markdown reports.
- Confirm reports include counts for legacy JSX, shared imports, legacy anchors, metadata JS, OpenAPI sources, and generated HTML API deferrals.
- Confirm the script does not modify legacy or portal content.

Repo validation:

- `bun run types:check` remains the hard gate for content changes.
- For this skill-only change, run focused script checks plus a diff review; if content/config changes are later made, run `bun run types:check`.

## Open Follow-Ups

- Decide the exact target for shared files: global `content/docs/_shared` versus local `_shared` folders near consumers.
- Decide the image sizing/caption directive standard before migrating width-heavy pages.
- Decide the Fumadocs OpenAPI implementation lane and package wiring.
- Decide how to represent cards/tabs/steps as directive syntax if the current portal lacks a final standard.
