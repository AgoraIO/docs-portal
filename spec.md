# Repository Agent Spec

## Purpose

This file is the repository-level work agreement for agents. It defines how agents should coordinate, resume, verify, and hand off work in this repo.

Keep this file short and stable. Product details, migration scope, task progress, path decisions, syntax recipes, and acceptance evidence belong in task control files such as `docs/migration/**`.

## Core Operating Model

Use one file for one job:

| File | Owns | Does Not Own |
| --- | --- | --- |
| `spec.md` | Rules for how agents work in this repo. | Product scope, task progress, path tables, syntax recipes, or one-off decisions. |
| `migration-ledger.csv` | Migration progress and per-item status. | Global rules or route design rationale. |
| `path-map.csv` | Source-to-target path mapping. | Page completion status or syntax conversion rules. |
| `syntax-map.md` | Legacy-to-target syntax mapping. | Per-page progress or product IA decisions. |
| `verification-checklist.md` | Acceptance gates and evidence expectations. | Migration ownership or path mapping. |
| `decisions.md` | Approved human/senior-agent decisions. | Raw progress tracking. |

In plain language: `spec.md` governs rules, ledgers govern progress, maps govern addresses, checklists govern acceptance, and decisions govern human judgment.

## Source Of Truth

Agents must follow these files in order:

1. `AGENTS.md`
2. `spec.md`
3. `docs/agents/markdown-authoring-standard.md`
4. Relevant task control files

If two files conflict, prefer the more specific task file only when it does not violate `AGENTS.md` or this spec. If the correct behavior is still unclear, record the blocker in the relevant task control file instead of guessing silently.

## Durable State

Long-running or multi-agent work must keep durable state in repository files, not only in chat. For migration work, use `docs/migration/**`.

Every durable migration record should answer:

- What source item is this?
- Where should it go?
- What action is required?
- What is the current status?
- What risk or blocker remains?
- What verification proves the current status?
- What should the next agent do?

`spec.md` must not be used as a progress ledger.

## Single-Document Fidelity Audits

When the task is to audit one migrated document for content fidelity, compare one source document against one target document only.

- Use the same-language source baseline when it exists. Do not compare a Chinese target against an English source when a Chinese source file or generated Chinese baseline is available.
- Audit visible content inside that document only: title, headings, paragraph meaning, callouts, lists, tables, code blocks, examples, and platform-scoped content that belongs to the same page.
- Do not treat route reshaping, IA changes, link rewrites, indentation-only changes, or formatting-only Markdown/MDX cleanup as content drift unless the visible content meaning or order changes.
- Prefer `scripts/audit-single-doc-fidelity.mjs` for this audit mode, and record the exact old source path, new source path, and report output path in the relevant task control file.

## Agent Work Protocol

Before editing:

1. Read the relevant repository contract and task control files.
2. Identify the exact ledger row or create one before starting work.
3. Confirm source path, target path, migration action, risk level, batchability, blockers, and required verification.
4. Check whether the work depends on a recorded decision.

During editing:

1. Keep changes scoped to the assigned item.
2. Preserve source meaning unless the ledger explicitly calls for a rewrite.
3. Normalize legacy syntax into repository-approved Markdown, MDX, directive, include, OpenAPI, or generated-reference forms.
4. Record unresolved links, missing assets, shared chains, path questions, and manual-review needs as soon as they are found.

After editing:

1. Run the required verification for the touched surface.
2. Update the ledger, path map, decision references, and verification evidence.
3. Mark status truthfully as `needs_review`, `done`, `blocked`, `deferred`, or `wontfix`.
4. Summarize remaining human judgment separately from completed work.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| `todo` | Known work exists, but no agent is actively working on it. |
| `ready` | Inputs, path mapping, and decisions are sufficient for an agent to start. |
| `in_progress` | An agent is actively working on the item. |
| `blocked` | Work cannot continue without a missing input, source, decision, or tool result. |
| `needs_review` | Work is implemented or drafted and needs human or senior-agent review. |
| `done` | The item meets the done definition and verification is recorded. |
| `deferred` | The item is intentionally postponed and has an owner or follow-up reason. |
| `wontfix` | The item is intentionally not migrated or not changed. |

## Hard Rules

- Do not overwrite unrelated work or unknown existing target content.
- Do not keep task state only in chat when the work needs handoff.
- Do not invent target paths when a path map is required.
- Do not mark work `done` without updating the ledger and recording verification.
- Do not treat build success alone as content fidelity proof.
- Do not leave legacy Docusaurus JSX, runtime platform filters, legacy shared imports, or old rendering shims in final migrated docs.
- Do not put OpenAPI YAML or JSON under `content/docs/**`; use `content/openapi/**`.
- Do not hand-maintain `public/openapi/**` as source.
- Do not iframe or static-dump generated HTML API reference pages unless an approved decision explicitly allows it.

## Done Definition

An item is `done` only when:

- The target file, route, asset, or data source exists in the approved location.
- The source-to-target mapping follows `path-map.csv` or records an approved exception.
- Legacy syntax has been normalized according to `syntax-map.md` and `docs/agents/markdown-authoring-standard.md`.
- Shared content, platform variants, links, anchors, images, and assets are resolved or recorded as accepted follow-up work.
- Required verification has passed or the remaining risk is explicitly accepted.
- The relevant ledger row has current status, risk, blocker, batchability, decision references, verification, and next-step fields.
