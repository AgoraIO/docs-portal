# Fumadocs Migration Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repository-owned migration skill that teaches agents how to standardize legacy Shengwang docs into Fumadocs-native Markdown/MDX and audit deferred migration work.

**Architecture:** Keep `SKILL.md` concise and route detailed rules to reference files. Add one audit-only Node script that scans the legacy docs source and emits JSON plus Markdown without mutating content.

**Tech Stack:** Codex skills, Markdown, Node.js ESM, Fumadocs MDX/core, repository docs under `docs/superpowers`.

---

## Source Spec

- `docs/superpowers/specs/2026-05-21-fumadocs-migration-skill-design.md`

## File Structure

- Create `.agents/skills/fumadocs-migration/SKILL.md`: entrypoint workflow and reference map.
- Create `.agents/skills/fumadocs-migration/references/standards.md`: target content standards.
- Create `.agents/skills/fumadocs-migration/references/legacy-casebook.md`: legacy case conversion rules.
- Create `.agents/skills/fumadocs-migration/references/report-schema.md`: audit output contract.
- Create `.agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs`: scanner.
- Create `.agents/skills/fumadocs-migration/agents/openai.yaml`: skill UI metadata.
- Create `docs/superpowers/specs/2026-05-21-fumadocs-migration-skill-design.md`: design record.
- Create `docs/superpowers/plans/2026-05-21-fumadocs-migration-skill.md`: this plan.

## Task 1: Skill Entrypoint And References

**Files:**
- Create: `.agents/skills/fumadocs-migration/SKILL.md`
- Create: `.agents/skills/fumadocs-migration/references/standards.md`
- Create: `.agents/skills/fumadocs-migration/references/legacy-casebook.md`
- Create: `.agents/skills/fumadocs-migration/references/report-schema.md`

- [ ] **Step 1: Write `SKILL.md` frontmatter**

Use frontmatter:

```yaml
---
name: fumadocs-migration
description: Use when migrating legacy Shengwang/Docusaurus docs into docs-portal Fumadocs content, standardizing old MDX JSX, shared snippets, platform variants, metadata, OpenAPI, generated API docs, assets, and links into Markdown/MDX native or Fumadocs-supported directive/include patterns.
---
```

- [ ] **Step 2: Add the workflow**

Document this workflow:

1. Inspect target portal config (`source.config.ts`, `package.json`, `content/docs`).
2. Audit/classify legacy source before editing.
3. Rewrite to Markdown/MDX native first.
4. Use Fumadocs include for shared content.
5. Eliminate old JSX and executable metadata.
6. Mark deferred generated API and unresolved standards.
7. Verify with `bun run types:check`.

- [ ] **Step 3: Add standards reference**

In `references/standards.md`, include:

```md
# Fumadocs Content Standards

## Priority
1. Markdown native.
2. Markdown/MDX directives parsed by remark/rehype.
3. Fumadocs MDX native features, including include.
4. New approved runtime widgets only when static syntax cannot express the content.

## Hard Rules
- Legacy JSX must not survive migrated content.
- Do not add compatibility plugins for old Docusaurus semantics.
- `bun run types:check` is the hard compile gate.
```

Include concrete examples for `:::info[...]`, `<include>`, frontmatter fields, platform directory split, and OpenAPI source handling.

- [ ] **Step 4: Add casebook reference**

In `references/legacy-casebook.md`, document conversions for:

- `<Admonition>` to directive callouts.
- `@shared` imports to Fumadocs include.
- `<PlatformFilter>` to static expansion.
- `<Table>/<Tr>/<Td>` to GFM table or native HTML table.
- `<Image>` to Markdown image or marked unresolved sizing standard.
- `<H2>/<H3 id>` and `<a name/id>` to heading IDs or standalone anchors.
- API reference JSX to structured reference content.
- OpenAPI YAML to Fumadocs OpenAPI lane.
- `html-docs` to deferred generated API markers.
- `_sidebar_.meta.*.js` and `_platforms_.meta.js` to static `meta.json` planning.

- [ ] **Step 5: Add report schema reference**

In `references/report-schema.md`, define:

```json
{
  "sourceRoot": "string",
  "generatedAt": "string",
  "summary": {},
  "files": [],
  "deferred": [],
  "statuses": []
}
```

List statuses: `ready-native`, `needs-directive-rewrite`, `needs-include-standardization`, `needs-platform-expansion`, `needs-table-normalization`, `needs-image-standard`, `needs-api-reference-source`, `has-openapi-source`, `deferred-generated-api`, `needs-source-discovery`, `manual-html-review`, `needs-landing-page-normalization`.

- [ ] **Step 6: Review reference consistency**

Run:

```bash
rg -n "legacy JSX|PlatformFilter|Fumadocs include|types:check|deferred-generated-api" .agents/skills/fumadocs-migration
```

Expected: each major rule appears in the entrypoint or referenced docs.

## Task 2: Audit Script

**Files:**
- Create: `.agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs`

- [ ] **Step 1: Write audit-only scanner**

Implement a Node ESM script that accepts:

```bash
node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
  --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source \
  --out docs/superpowers/reports/fumadocs-migration-audit
```

It should:

- Recursively scan `docs`, `docs-api-reference`, `shared`, and `html-docs`.
- Count MD/MDX files, metadata JS files, generated HTML files, and OpenAPI YAML files.
- Detect legacy JSX component names.
- Detect `@shared` imports, legacy anchors, platform filters, old frontmatter fields, API reference components, landing page components, and image width/inline props.
- Emit `<out>.json` and `<out>.md`.
- Never write into source content directories.

- [ ] **Step 2: Run audit script on legacy source**

Run:

```bash
node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
  --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source \
  --out docs/superpowers/reports/2026-05-21-fumadocs-migration-audit
```

Expected: JSON and Markdown reports are created under `docs/superpowers/reports`.

- [ ] **Step 3: Inspect report coverage**

Run:

```bash
sed -n '1,220p' docs/superpowers/reports/2026-05-21-fumadocs-migration-audit.md
node -e "const r=require('./docs/superpowers/reports/2026-05-21-fumadocs-migration-audit.json'); console.log(r.summary); console.log(r.deferred.length)"
```

Expected: summary includes nonzero counts for MDX files, legacy JSX, shared imports, metadata JS, OpenAPI sources, and generated HTML deferrals.

## Task 3: Skill Metadata And Validation

**Files:**
- Create: `.agents/skills/fumadocs-migration/agents/openai.yaml`

- [ ] **Step 1: Add skill UI metadata**

Create:

```yaml
interface:
  display_name: "Fumadocs Migration"
  short_description: "Standardize legacy docs into Fumadocs MDX"
  default_prompt: "Use $fumadocs-migration to audit and standardize a legacy docs migration into Fumadocs-native Markdown/MDX."

policy:
  allow_implicit_invocation: true
```

- [ ] **Step 2: Validate skill structure**

Run:

```bash
python3 /Users/czhen/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/fumadocs-migration
```

Expected: validation passes or reports only issues that are fixed before commit.

- [ ] **Step 3: Run a focused repo check**

Run:

```bash
bun run types:check
```

Expected: PASS. This verifies existing content compilation was not broken by the skill-only change.

- [ ] **Step 4: Review diff**

Run:

```bash
git diff -- .agents/skills/fumadocs-migration docs/superpowers/specs/2026-05-21-fumadocs-migration-skill-design.md docs/superpowers/plans/2026-05-21-fumadocs-migration-skill.md docs/superpowers/reports/2026-05-21-fumadocs-migration-audit.json docs/superpowers/reports/2026-05-21-fumadocs-migration-audit.md
```

Expected: only skill, design, plan, and audit report files changed.

- [ ] **Step 5: Commit**

Run:

```bash
git add .agents/skills/fumadocs-migration docs/superpowers/specs/2026-05-21-fumadocs-migration-skill-design.md docs/superpowers/plans/2026-05-21-fumadocs-migration-skill.md docs/superpowers/reports/2026-05-21-fumadocs-migration-audit.json docs/superpowers/reports/2026-05-21-fumadocs-migration-audit.md
git commit -m "docs: add fumadocs migration skill"
```

Expected: focused local commit with the new skill and reports.
