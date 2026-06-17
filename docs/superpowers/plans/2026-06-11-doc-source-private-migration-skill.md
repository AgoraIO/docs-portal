# Doc-Source-Private Migration Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new migration skill for `Doc-Source-Private` that reuses shared Fumadocs migration rules, but adds source-specific guidance for English/private docs source structure, syntax, and auditing.

**Architecture:** Keep the existing `.agents/skills/fumadocs-migration` as the shared core for content standards, rewrite rules, and OpenAPI guidance. Add a new private-source entrypoint skill plus private-source references, and extend the audit script to classify `Doc-Source-Private`-specific syntax such as `_category_.json`, `@docs/shared/**`, site-private JSX, and product lanes that need deferred handling.

**Tech Stack:** Codex skills, Markdown, Node.js ESM, Fumadocs MDX/core, GitHub Issues, repository docs under `docs/superpowers`.

---

## Source Spec

- GitHub issue `#54`: missing migration skill for the English documentation site
- Existing shared skill: `.agents/skills/fumadocs-migration/SKILL.md`
- Existing prior attempt for reference: PR `#58` (`docs: add english migration skill`)

## File Structure

- Create `.agents/skills/fumadocs-migration-private-en/SKILL.md`: private-source migration entrypoint.
- Create `.agents/skills/fumadocs-migration-private-en/references/private-source.md`: source taxonomy, routing, and lane support policy.
- Create `.agents/skills/fumadocs-migration-private-en/references/lane-mapping.md`: `_category_.json` to `meta.json`, source-lane to target-lane mapping, and deferred lane policy.
- Create `.agents/skills/fumadocs-migration-private-en/agents/openai.yaml`: skill UI metadata.
- Modify `.agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs`: add `Doc-Source-Private` profile support and new classifications.
- Modify `.agents/skills/fumadocs-migration/references/report-schema.md`: add new audit statuses for private-source lanes and syntax.
- Create `docs/superpowers/specs/2026-06-11-doc-source-private-migration-skill-design.md`: design record for the new skill split and scope.
- Create `docs/superpowers/plans/2026-06-11-doc-source-private-migration-skill.md`: this plan.

## Supported Scope For V1

- First-class supported source lanes:
  - `conversational-ai`
  - `open-ai-integration`
  - `real-time-stt`
- Deferred or product-specific lanes:
  - `ten-agent`
  - `ten-framework`
  - other products that require private runtime variables or bespoke product widgets beyond the shared/private rules

## Task 1: Write The Design Record

**Files:**
- Create: `docs/superpowers/specs/2026-06-11-doc-source-private-migration-skill-design.md`

- [ ] **Step 1: Write the spec header and problem statement**

Add:

```md
# Doc-Source-Private Migration Skill Design

## Problem

The existing `fumadocs-migration` skill is written for `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source`.
`/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private` is a different source contract:

- product-bucketed folders
- `_category_.json` navigation metadata
- `@docs/shared/**` imports
- `@site/src/components/rest-api/**` JSX for REST reference pages
- private runtime variables such as `<Vpd />` and `<Vg />`
```

- [ ] **Step 2: Record the architectural decision**

Document:

```md
## Decision

Use a split architecture:

- keep `.agents/skills/fumadocs-migration` as the shared core
- add `.agents/skills/fumadocs-migration-private-en` as the source-specific entrypoint

Do not fold `Doc-Source-Private` rules into a thin `fumadocs-migration-en` wrapper because the main delta is the source contract, not only the `/en/**` target route.
```

- [ ] **Step 3: Record the V1 lane boundary**

Document:

```md
## V1 Scope

Supported lanes:

- `conversational-ai`
- `open-ai-integration`
- `real-time-stt`

Deferred lanes:

- `ten-agent`
- `ten-framework`

Reason: these deferred lanes rely heavily on source-private variables or widgets such as `<Vpd />`, `<Vg />`, and product-specific landing content that need separate rules.
```

- [ ] **Step 4: Record the source-specific transformation contract**

Document these required mappings:

```md
## Required Transformations

- `_category_.json` -> `meta.json`
- `@docs/shared/**` imports -> Fumadocs include or static expansion
- `@site/src/components/rest-api/**` pages -> OpenAPI or structured prose/reference rewrite decision
- private variables such as `<Vpd />` / `<Vg />` -> explicit text expansion or deferred status
```

- [ ] **Step 5: Review the design doc**

Run:

```bash
sed -n '1,220p' docs/superpowers/specs/2026-06-11-doc-source-private-migration-skill-design.md
```

Expected: the file explicitly states the split architecture, V1 lane scope, and deferred lane policy.

## Task 2: Create The Private-Source Skill Entrypoint

**Files:**
- Create: `.agents/skills/fumadocs-migration-private-en/SKILL.md`
- Create: `.agents/skills/fumadocs-migration-private-en/agents/openai.yaml`

- [ ] **Step 1: Write `SKILL.md` frontmatter**

Use:

```yaml
---
name: fumadocs-migration-private-en
description: Use when migrating docs from /Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private into docs-portal Fumadocs content for the English site, applying private-source routing, shared-content, and audit rules.
---
```

- [ ] **Step 2: Write the entrypoint workflow**

Add this workflow:

```md
# Fumadocs Migration For Doc-Source-Private

Use this skill when the source root is `/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private`.

## Workflow

1. Inspect the target IA in `content/docs/en/**`.
2. Load shared rules from `.agents/skills/fumadocs-migration/references/*.md`.
3. Load `references/private-source.md`.
4. Load `references/lane-mapping.md`.
5. Run the audit script with the private-source profile.
6. Classify the source lane as supported or deferred before editing.
7. Verify with `bun run types:check`, and add build or test checks when routing or code changes are involved.
```

- [ ] **Step 3: Add hard rules for private-source work**

Include:

```md
## Hard Rules

- Do not assume `_category_.json` maps 1:1 to current `content/docs/en/**` folders.
- Do not preserve `@docs/shared/**` imports in migrated content.
- Do not preserve `@site/src/components/rest-api/**` JSX in migrated content.
- Do not claim unsupported product lanes are covered; mark them with deferred statuses.
- Treat `ten-agent` and `ten-framework` as deferred unless product-specific rules are added.
```

- [ ] **Step 4: Add skill UI metadata**

Create `.agents/skills/fumadocs-migration-private-en/agents/openai.yaml` with:

```yaml
interface:
  display_name: "Doc-Source-Private Migration"
  short_description: "Migrate private English docs source into Fumadocs"
  default_prompt: "Use $fumadocs-migration-private-en to audit and migrate content from Doc-Source-Private into docs-portal."

policy:
  allow_implicit_invocation: true
```

- [ ] **Step 5: Review the new skill files**

Run:

```bash
sed -n '1,240p' .agents/skills/fumadocs-migration-private-en/SKILL.md
sed -n '1,200p' .agents/skills/fumadocs-migration-private-en/agents/openai.yaml
```

Expected: the skill clearly points to `Doc-Source-Private`, shared references, private-source references, and the V1 lane boundary.

## Task 3: Add Private-Source References

**Files:**
- Create: `.agents/skills/fumadocs-migration-private-en/references/private-source.md`
- Create: `.agents/skills/fumadocs-migration-private-en/references/lane-mapping.md`

- [ ] **Step 1: Write the source taxonomy reference**

In `references/private-source.md`, include:

```md
# Doc-Source-Private Source Contract

## Source Characteristics

- product-bucketed top-level folders such as `conversational-ai`, `open-ai-integration`, and `real-time-stt`
- `_category_.json` files that define source navigation labels and order
- shared content imported through `@docs/shared/**`
- code or prose fragments under `assets/code/**`
- source-private variables such as `<Vpd />` and `<Vg />`
- Docusaurus/site JSX under `@site/src/components/rest-api/**`
```

- [ ] **Step 2: Write the private rewrite rules**

Add:

```md
## Rewrite Rules

- Replace `@docs/shared/**` imports with `<include>` when the shared fragment is content-only.
- If the shared fragment depends on runtime variables or product props, statically expand it or mark the page deferred.
- Convert `_category_.json` order and label into static `meta.json`.
- Treat `assets/code/**` as source fragments that may need inlining or generated tabs, not direct content-page imports.
- Expand `<Vpd />` and `<Vg />` to explicit product text only when the replacement is unambiguous; otherwise mark deferred.
```

- [ ] **Step 3: Write the lane mapping reference**

In `references/lane-mapping.md`, include:

```md
# Lane Mapping

## Supported V1 lanes

- `conversational-ai` -> `content/docs/en/ai/**` and `content/docs/en/api-reference/conversational-ai/**`
- `open-ai-integration` -> `content/docs/en/ai/openai-realtime/**` or adjacent approved AI routes
- `real-time-stt` -> `content/docs/en/api-reference/speech-to-text/**` and approved prose lanes

## Deferred lanes

- `ten-agent`
- `ten-framework`
```

- [ ] **Step 4: Add `_category_.json` mapping guidance**

Document:

```md
## Navigation Mapping

Source `_category_.json` drives:

- label -> `meta.json.title`
- position -> `meta.json.pages` order
- nested folders -> nested `meta.json` groups or folder index pages

Do not copy `_category_.json` into the target repo.
```

- [ ] **Step 5: Add REST reference routing guidance**

Document:

```md
## REST Reference Decision

If a source page imports `@site/src/components/rest-api/**`, classify it before migration:

- `needs-openapi-decision` when it should be generated from OpenAPI
- `needs-structured-reference-rewrite` when it remains authored prose/reference
```

- [ ] **Step 6: Review the references**

Run:

```bash
rg -n "category|@docs/shared|@site/src/components/rest-api|Vpd|V1 lanes|deferred" .agents/skills/fumadocs-migration-private-en/references
```

Expected: all private-source-specific rules are present in the two new reference files.

## Task 4: Extend The Audit Script For Doc-Source-Private

**Files:**
- Modify: `.agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs`
- Modify: `.agents/skills/fumadocs-migration/references/report-schema.md`

- [ ] **Step 1: Add a source profile flag**

Update the script argument contract to support:

```bash
node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
  --source /Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private \
  --profile doc-source-private \
  --out docs/superpowers/reports/2026-06-11-doc-source-private-audit
```

Implement the default profile logic like:

```js
const args = {
  source: DEFAULT_SOURCE,
  out: 'docs/superpowers/reports/fumadocs-migration-audit',
  profile: 'shengwang-doc-source',
};
```

- [ ] **Step 2: Add private-source detectors**

Extend markdown analysis to detect:

```js
const sharedDocsImports = (content.match(/from\s+['"]@docs\/shared\//g) ?? []).length;
const siteRestImports = (content.match(/from\s+['"]@site\/src\/components\/rest-api\//g) ?? []).length;
const privateVariables = (content.match(/<(?:Vpd|Vg)\b/g) ?? []).length;
const categoryJsonHints = relativePath.endsWith('/_category_.json');
```

Map them to statuses:

```js
if (sharedDocsImports > 0) statuses.push('needs-private-include-standardization');
if (siteRestImports > 0) statuses.push('needs-openapi-decision');
if (privateVariables > 0) statuses.push('needs-product-specific-rules');
```

- [ ] **Step 3: Add lane classification**

Add a top-level lane detector:

```js
function topLevelLane(relativePath) {
  return relativePath.split('/')[0] ?? null;
}
```

Classify lanes:

```js
const supportedPrivateLanes = new Set([
  'conversational-ai',
  'open-ai-integration',
  'real-time-stt',
]);

if (args.profile === 'doc-source-private') {
  const lane = topLevelLane(relativePath);
  if (lane === 'ten-agent' || lane === 'ten-framework') {
    statuses.push('needs-product-specific-rules');
  } else if (lane && !supportedPrivateLanes.has(lane) && lane !== 'shared' && lane !== 'assets') {
    statuses.push('needs-lane-mapping');
  }
}
```

- [ ] **Step 4: Update the audit report schema**

In `.agents/skills/fumadocs-migration/references/report-schema.md`, add statuses:

```md
- `needs-private-include-standardization`
- `needs-openapi-decision`
- `needs-structured-reference-rewrite`
- `needs-product-specific-rules`
- `needs-lane-mapping`
```

- [ ] **Step 5: Run the audit on the private source**

Run:

```bash
node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
  --source /Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private \
  --profile doc-source-private \
  --out docs/superpowers/reports/2026-06-11-doc-source-private-audit
```

Expected: JSON and Markdown reports are created and include private-source statuses.

- [ ] **Step 6: Inspect the audit output**

Run:

```bash
sed -n '1,220p' docs/superpowers/reports/2026-06-11-doc-source-private-audit.md
node -e "const fs=require('fs'); const r=JSON.parse(fs.readFileSync('docs/superpowers/reports/2026-06-11-doc-source-private-audit.json','utf8')); console.log(r.summary); console.log(r.files.slice(0,3).map((f)=>({path:f.path,statuses:f.statuses})));"
```

Expected: sample rows show statuses such as `needs-private-include-standardization`, `needs-openapi-decision`, and `needs-product-specific-rules`.

## Task 5: Validate The Skill Package

**Files:**
- Create: `.agents/skills/fumadocs-migration-private-en/**`
- Modify: `.agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs`
- Modify: `.agents/skills/fumadocs-migration/references/report-schema.md`
- Create: `docs/superpowers/specs/2026-06-11-doc-source-private-migration-skill-design.md`

- [ ] **Step 1: Validate skill structure**

Run:

```bash
python3 /Users/czhen/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/fumadocs-migration-private-en
```

Expected: validation passes, or any reported manifest/format issue is fixed before commit.

- [ ] **Step 2: Sanity-check the new rules**

Run:

```bash
rg -n "Doc-Source-Private|doc-source-private|needs-product-specific-rules|needs-openapi-decision|conversational-ai|ten-agent" .agents/skills/fumadocs-migration-private-en .agents/skills/fumadocs-migration
```

Expected: the new entrypoint, references, and audit statuses all line up on the same naming.

- [ ] **Step 3: Run a focused repo compile gate**

Run:

```bash
bun run types:check
```

Expected: PASS. The skill-only change must not break the repo's content/type generation.

- [ ] **Step 4: Review the final diff**

Run:

```bash
git diff -- .agents/skills/fumadocs-migration .agents/skills/fumadocs-migration-private-en docs/superpowers/specs/2026-06-11-doc-source-private-migration-skill-design.md docs/superpowers/plans/2026-06-11-doc-source-private-migration-skill.md docs/superpowers/reports/2026-06-11-doc-source-private-audit.md docs/superpowers/reports/2026-06-11-doc-source-private-audit.json
```

Expected: only the shared skill audit/schema files, the new private skill files, the design doc, the plan, and the audit outputs are changed.

- [ ] **Step 5: Commit**

Run:

```bash
git add .agents/skills/fumadocs-migration .agents/skills/fumadocs-migration-private-en docs/superpowers/specs/2026-06-11-doc-source-private-migration-skill-design.md docs/superpowers/plans/2026-06-11-doc-source-private-migration-skill.md docs/superpowers/reports/2026-06-11-doc-source-private-audit.md docs/superpowers/reports/2026-06-11-doc-source-private-audit.json
git commit -m "docs: add Doc-Source-Private migration skill plan"
```

Expected: one scoped commit for the new private-source migration skill package and audit outputs.

## Self-Review

- Spec coverage:
  - split architecture covered in Task 1 and Task 2
  - private-source references covered in Task 3
  - audit-script extension covered in Task 4
  - V1 lane boundary and deferred handling covered in Task 1 and Task 3
- Placeholder scan:
  - no `TODO`, `TBD`, or “similar to” placeholders remain
- Type consistency:
  - use `fumadocs-migration-private-en` consistently as the new skill name
  - use `doc-source-private` consistently as the audit profile name
