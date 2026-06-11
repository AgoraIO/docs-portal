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
