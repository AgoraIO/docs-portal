---
name: fumadocs-migration-en
description: Use when migrating legacy Agora English docs into docs-portal Fumadocs content, keeping the English site IA, product coverage, and content conventions aligned with the Agora documentation portal.
---

# Fumadocs Migration For English Site

Use this skill when the migration target is the English Agora documentation site under `content/docs/en/**`.

## When To Use This Skill

- The source material is for the English Agora docs site, not the Chinese Shengwang site.
- The migration needs to follow the English site's product coverage and information architecture.
- The work includes English landing pages, guides, API reference trees, OpenAPI inputs, or generated API content that will publish under `/en/**`.

## Hard Rules

- Treat the English site as its own product surface. Do not assume every Chinese-site product, route, or content pattern exists on the English site.
- Preserve the English site top-level IA from `content/docs/en/meta.json`: `introduction`, `ai`, `realtime-media`, `solutions`, `api-reference`, and `best-practices`.
- Reuse the shared Fumadocs migration standards from `.agents/skills/fumadocs-migration/references/*.md`, but prefer English-site routing, naming, and navigation examples when there is tension.
- Do not route English content into `zh-CN` paths, Chinese-only product buckets, or Shengwang-branded terminology.
- Keep the target content standard Markdown/MDX native first. Legacy JSX must not survive migrated content.
- OpenAPI and generated API rules stay the same: source data belongs under `content/openapi/**`, authored docs belong under `content/docs/**`, and generated endpoint leaves must follow the repo's OpenAPI lane contract.
- If the legacy English source root is unclear, stop guessing and make the source path explicit in the audit command or task notes before migrating content.

## Workflow

1. Inspect the English target IA in `content/docs/en/**` and the relevant `meta.json` files before touching content.
2. Load `.agents/skills/fumadocs-migration/references/standards.md` for shared content-layer rules.
3. Load `.agents/skills/fumadocs-migration/references/legacy-casebook.md` for legacy syntax rewrites.
4. Load `.agents/skills/fumadocs-migration/references/openapi-lane.md` when the migration involves REST or OpenAPI content.
5. Load `references/english-site.md` for English-site-specific product, routing, and naming guardrails.
6. Run the audit script with the actual English legacy source root:

   ```bash
   node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
     --source /absolute/path/to/english-legacy-docs \
     --out docs/superpowers/reports/YYYY-MM-DD-fumadocs-migration-en-audit
   ```

7. Verify with `bun run types:check`, and add `bun run build`, `bun run test`, or link checks when the migration touches routing, shared code, shell behavior, or API publication.

## References

- `.agents/skills/fumadocs-migration/references/standards.md`
- `.agents/skills/fumadocs-migration/references/legacy-casebook.md`
- `.agents/skills/fumadocs-migration/references/openapi-lane.md`
- `.agents/skills/fumadocs-migration/references/report-schema.md`
- `references/english-site.md`
