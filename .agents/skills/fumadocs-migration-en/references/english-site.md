# English Site Migration Guardrails

## Scope

This reference is for migrations that target the English Agora docs site under `content/docs/en/**`.

Use it together with the shared migration references from `.agents/skills/fumadocs-migration/references/**`.

## Top-Level IA

The English site top-level sections are:

- `introduction`
- `ai`
- `realtime-media`
- `solutions`
- `api-reference`
- `best-practices`

Do not invent new top-level buckets when the target content fits one of these sections.

## Product And Naming Guardrails

- Prefer `Agora` branding and English product naming already present in the English tree.
- Reuse the English site labels from nearby `meta.json` and page titles before introducing new wording.
- Do not back-port Shengwang-only product groupings or Chinese-site IA assumptions into the English tree.
- When Chinese and English trees differ, match the English tree that already exists in this repo instead of forcing parity.

## Routing Guardrails

- The migration target must land under `/en/**`.
- Preserve clean URLs that match the English tree's folder and `meta.json` structure.
- For API reference work, keep English routes aligned with the repo's current API reference layout and OpenAPI lane registry.
- For versioned or independently scoped content, prefer the repo's existing `navScope` patterns instead of custom route logic.

## Content Guardrails

- Keep editorial content written for an English reader. Do not leave untranslated UI labels, section headings, or explanatory prose in migrated English pages.
- Preserve nearby English page patterns for overview pages, quickstarts, API reference indexes, and cross-links.
- Reuse Fumadocs-native primitives and existing repo-local MDX components; do not reintroduce legacy runtime widgets because the legacy English source used them.

## Validation

Before handing off a migration, spot-check:

- the target file tree under `content/docs/en/**`
- affected `meta.json` ordering
- generated links under `/en/**`
- any API reference or OpenAPI-derived routes for English pages
