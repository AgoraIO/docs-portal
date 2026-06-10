---
name: fumadocs-migration
description: Use when migrating legacy Shengwang/Docusaurus docs into docs-portal Fumadocs content, standardizing old MDX JSX, shared snippets, platform variants, metadata, OpenAPI, generated API docs, assets, and links into Markdown/MDX native or Fumadocs-supported directive/include patterns.
---

# Fumadocs Migration

Use this skill to migrate legacy docs from `/Users/yejiayi/Documents/shengwang-doc-source` into this `docs-portal` repo.

## Hard Rules

- The target content standard is Markdown/MDX native first.
- Legacy JSX must not survive migrated content.
- Rendering components are implementation details; content syntax must be standard Markdown, MDX native, or directive/include syntax.
- Common MDX components must come from Fumadocs UI or repo-local shadcn/radix primitives. Do not invent custom tabs, code blocks, callouts, cards, or platform selectors when Fumadocs or shadcn already provides the primitive.
- `src/components/mdx.tsx` is the common registry only: link normalization plus repo-approved shadcn/radix wrappers for Fumadocs/core outputs such as tabs, code blocks, generated code tabs, copy buttons, and standard links. Do not put page-specific overview widgets in this registry.
- Human-authored editorial overview widgets must live outside the common registry, such as `src/components/docs-overview/mdx-components.tsx`, and must be injected only for approved overview content paths.
- Component styling belongs in Tailwind classes colocated with the component. Do not add selector-heavy component skins, widget variables, or page-specific card styles to `src/styles/app.css`.
- Global CSS custom properties are reserved for theme, shell layout, shadcn bridge tokens, and Fumadocs integration tokens. Do not add component-local variables for migrated MDX widgets.
- Shared content is allowed, but use Fumadocs include or a project-approved directive, not legacy `@shared` imports.
- Platform/product variants must be statically expanded into files, folders, or navigation. Do not keep runtime platform filters.
- Independent product or platform navigation must be declared with `navScope` in `meta.json`; do not hard-code scoped sidebars in docs-shell code.
- When API reference versions differ by platform, place version folders under the platform folder, not under the product root.
- Use `(current)` for current-version clean URLs when a versioned scope should omit the version segment.
- Same-page platform variants should use existing `Tabs` or generated `CodeBlockTabs` with `groupId` and `persist`; do not create custom platform tab components.
- Do not add legacy compatibility plugins, old component maps, or Docusaurus runtime variable shims.
- Do not add relative JSON `$schema` paths to migrated `meta.json` files.
- `bun run types:check` is the minimum compile gate before claiming migrated content is complete.
- For generated HTML API references, rebuild the legacy TOC as real folders plus `meta.json`; do not flatten a nested navigation tree unless the user explicitly asks for a flat sidebar.
- For generated HTML API references, treat all non-code inline HTML as MDX-unsafe until proven otherwise. Escape literal `<`, `>`, `{`, and `}` outside code fences and preserve inline links/code spans during normalization.
- Stable fragment IDs from legacy API references must survive migration. Prefer heading-bound IDs where possible and only use standalone anchors when compatibility requires them.

## Workflow

1. Inspect current portal contracts: `package.json`, `source.config.ts`, `content/docs`, and existing `meta.json` patterns.
2. Run or update the audit script before migrating a new batch:

   ```bash
   node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
     --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source \
     --out docs/superpowers/reports/YYYY-MM-DD-fumadocs-migration-audit
   ```

3. Classify each source file before editing: native prose, shared snippet, platform variant, API reference MDX, OpenAPI source, generated HTML API, landing page, or asset/link cleanup.
4. Rewrite in this priority order:
   - Markdown native.
   - Markdown/MDX directive syntax parsed by remark/rehype.
   - Fumadocs MDX native features such as include.
   - Newly approved runtime widgets only when static syntax cannot represent the content. Restrict these to allowlisted editorial overview pages unless the user explicitly approves a broader runtime component surface.
5. For generated HTML API references, extract and freeze the legacy `nav.toc` tree before writing files. Use that tree to decide target folders, folder index pages, and every `meta.json`.
6. Update or create `meta.json` from legacy sidebar order. Do not migrate executable JS metadata.
7. For independent or versioned navigation, update `meta.json` with `navScope` and keep version folder page order inside the version folder.
8. Mark deferred generated API, unresolved OpenAPI lane work, and missing standards in the audit report.
9. Verify with `bun run types:check`; add `bun run docs:links`, `bun run test`, or `bun run build` when the migration touches links, code, routing, shell behavior, or generated API publication.
10. If the repo build expects OpenAPI assets under `public/openapi/**`, run the sync step before the final build so prerender can fetch `/openapi/**`.
11. If the default shell runtime lacks the required Node/Bun version, use the approved workspace runtime and still complete the equivalent `fumadocs-mdx`, `tsc --noEmit`, asset sync, and build checks whenever possible.

## References

Load only the reference needed for the current case:

- `references/standards.md`: target Fumadocs content-layer standards and verification gates.
- `references/legacy-casebook.md`: legacy syntax and component rewrite rules.
- `references/openapi-lane.md`: OpenAPI staging, endpoint generation, override, publication, and llms rules.
- `references/report-schema.md`: audit report JSON/Markdown schema and status taxonomy.
