# Documentation Migration Control Spec

## Purpose

This spec defines the repeatable control flow for legacy documentation
migration. The current flow is file-map driven:

1. A mapping table identifies each legacy source file and its new target.
2. A migration script converts mapped source files into target files.
3. The mapping or execution ledger records migration progress.
4. An audit script checks only rows marked as migration-completed.
5. The mapping or execution ledger records audit progress and audit result.

This file governs workflow. Product IA, reusable syntax recipes, one-off
decisions, generated redirect rows, and per-row progress belong in the migration
control files.

## Current Control Files

| File | Owns | Does Not Own |
| --- | --- | --- |
| `docs/2026-07-03-legacy-to-new-docs-mapping.md` | Human-approved directory mapping, route rules, lane decisions, and mapping statuses. | Per-file migration progress or audit results. |
| `docs/2026-07-03-legacy-file-redirects.csv` | Machine-readable file-level mapping from old source/URL to new source/URL and redirect disposition. | Content fidelity judgment or script run history. |
| `docs/migration/path-map.csv` | Optional normalized source-to-target address view for migration scripts. | Audit result or migration evidence. |
| `docs/migration/migration-ledger.csv` | Operational migration state, audit state, evidence, blockers, and next steps. | Route design rationale. |
| `docs/migration/component-map.yaml` | Script-readable legacy component and syntax conversion rules. | Per-page status or human IA decisions. |
| `docs/migration/syntax-map.md` | Human-readable legacy-to-target syntax rules. | Per-page progress. |
| `docs/migration/decisions.md` | Approved exceptions and human decisions. | Raw generated mapping rows. |
| `docs/migration/verification-checklist.md` | Acceptance gates and evidence expectations. | Path mapping. |

When `path-map.csv` or `migration-ledger.csv` lags behind the latest file-level
mapping table, seed or update it from `docs/2026-07-03-legacy-file-redirects.csv`
before running migration or audit automation.

## Source Of Truth

Agents must follow these files in order:

1. `AGENTS.md`
2. `spec.md`
3. `docs/agents/markdown-authoring-standard.md`
4. `docs/2026-07-03-legacy-to-new-docs-mapping.md`
5. `docs/2026-07-03-legacy-file-redirects.csv`
6. Relevant files under `docs/migration/**`

If two files conflict, prefer the more specific control file only when it does
not violate `AGENTS.md` or this spec. If the correct behavior is still unclear,
mark the row blocked in the execution ledger instead of guessing silently.

## File-Level Mapping Table

`docs/2026-07-03-legacy-file-redirects.csv` is the current machine-readable
file-level mapping table.

| Column | Meaning |
| --- | --- |
| `old_source_path` | Legacy source path relative to the legacy source root. |
| `old_url` | Legacy public URL, when the source had one. |
| `source_type` | Source lane, such as `docs`, `docs-api-reference`, `openapi`, `html-api`, `shared`, `metadata`, or `asset`. |
| `old_product` | Legacy product or scenario directory. |
| `old_platform` | Platform parsed from filename or route, when applicable. |
| `new_source_path` | Target docs-portal source path. Empty means no target page is created yet. |
| `new_url` | Target public URL. Empty means no redirect target is created yet. |
| `redirect_status` | Redirect disposition: `redirect`, `no-redirect`, `defer`, or `ignore`. |
| `http_status` | HTTP redirect status when applicable, normally `301`. |
| `notes` | Short explanation for mapping, platform split, defer, ignore, or special handling. |

For migration scripts that expect `source_path` and `target_path`, copy:

| Script Field | File-Level Mapping Field |
| --- | --- |
| `source_path` | `old_source_path` |
| `target_path` | `new_source_path` |
| `target_route` | `new_url` |
| `product` | `old_product` |
| `platform` | `old_platform` |

## Mapping Statuses

The human mapping document uses these statuses:

| Status | Meaning |
| --- | --- |
| `mapped` | The target location is known and the item may enter file-level migration planning. |
| `needs-decision` | The item is understood but still needs a human path, ownership, or split decision. |
| `defer` | The item is intentionally postponed or belongs to a later lane. |
| `ignore` | The item is not formal migration content. |
| `ignore-empty` | The item is empty or has no useful content. |
| `fallback-default/defer` | A default source exists, but specific platform files already exist and the default should not create a formal page now. |
| `defer-en` | English source is outside the current `zh-CN` migration scope. |

The file-level redirect table uses these redirect statuses:

| `redirect_status` | Migration Meaning |
| --- | --- |
| `redirect` | Content should migrate to `new_source_path`; old URL should redirect to `new_url`. |
| `no-redirect` | Track the legacy item, but do not create a page redirect. Common for metadata. |
| `defer` | Do not migrate or audit until the lane or decision is ready. |
| `ignore` | Do not migrate, audit, or redirect. |

`redirect_status=redirect` does not prove that the target file exists. It only
means the row is eligible for content migration.

## Execution Ledger Contract

Every migrated content row must have an execution row before work starts. The
execution row may live in `migration-ledger.csv` or in an extended active mapping
table, but it must be traceable to the file-level mapping row.

Required identity columns:

| Column | Meaning |
| --- | --- |
| `id` | Stable execution row ID. |
| `old_source_path` or `source_path` | Legacy source path. |
| `new_source_path` or `target_path` | Target source path. |
| `redirect_status` | Copied from the file-level mapping table. |

Required progress columns:

| Column | Meaning |
| --- | --- |
| `migration_progress` | Current migration state for this row. |
| `audit_progress` | Current audit state for this row. |
| `audit_result` | Latest audit judgment for this row. |
| `updated_at` | Last update date. |

Recommended evidence columns:

| Column | Meaning |
| --- | --- |
| `old_url` | Legacy public URL. |
| `new_url` or `target_route` | Target public URL. |
| `source_type` | Source lane. |
| `migration_action` | `copy`, `merge`, `split`, `rewrite`, `convert-html-api`, `openapi-lane`, `shared-include`, `defer`, or `drop`. |
| `migration_report` | Migration script report path. |
| `audit_report` | Audit script report path. |
| `blocked_reason` | Exact missing input, source, decision, or tool result. |
| `next_step` | Concrete action for the next agent. |
| `verification` | Commands and manual checks already performed. |
| `owner` | Current agent or reviewer. |
| `notes` | Short extra context. |

If the current CSV still uses a single `status` column, treat it as a legacy
field. Add explicit `migration_progress`, `audit_progress`, and `audit_result`
before using the table for automated migration and audit loops.

## Progress Vocabulary

Use these values for `migration_progress`:

| Value | Meaning |
| --- | --- |
| `not_started` | Row exists but migration has not started. |
| `ready` | Source and target are known and the migration script may run. |
| `in_progress` | Migration is actively running or being fixed. |
| `completed` | Target content has been produced at the mapped target path. |
| `blocked` | Migration cannot continue without a missing input, source, decision, or tool result. |
| `deferred` | Migration is intentionally postponed. |
| `dropped` | Item is intentionally not migrated. |
| `not_required` | The row is tracked but does not create migrated content. |

Use these values for `audit_progress`:

| Value | Meaning |
| --- | --- |
| `not_started` | Audit has not started. |
| `ready` | Migration is completed and the row is ready for audit. |
| `in_progress` | Audit is actively running. |
| `completed` | Audit finished and `audit_result` is populated. |
| `blocked` | Audit cannot run or finish because an input is missing. |
| `not_required` | Audit is not required. |

Use these values for `audit_result`:

| Value | Meaning |
| --- | --- |
| `pending` | No completed audit result yet. |
| `pass` | Audit found no unresolved content-fidelity issues. |
| `pass_with_notes` | Audit passed with accepted or documented follow-up risk. |
| `fail` | Audit found unresolved differences that must be fixed or accepted. |
| `blocked` | Audit could not produce a result. |
| `not_applicable` | Audit is not applicable. |

## Initial Row State

When seeding the execution ledger from the file-level mapping table:

| File-Level Row | Initial Execution State |
| --- | --- |
| `redirect_status=redirect` and `new_source_path` is populated | `migration_progress=ready`, `audit_progress=not_started`, `audit_result=pending` |
| `redirect_status=redirect` but `new_source_path` is empty | `migration_progress=blocked`, `audit_progress=blocked`, `audit_result=blocked` |
| `redirect_status=no-redirect` | `migration_progress=not_required`, `audit_progress=not_required`, `audit_result=not_applicable` |
| `redirect_status=defer` | `migration_progress=deferred`, `audit_progress=not_required`, `audit_result=not_applicable` |
| `redirect_status=ignore` | `migration_progress=dropped`, `audit_progress=not_required`, `audit_result=not_applicable` |

Rows with `source_type=metadata` are tracked for completeness but normally use
`redirect_status=no-redirect` and do not enter content migration or content
fidelity audit.

## End-To-End Workflow

### 1. Prepare Mapping

Before migration starts:

1. Confirm the item exists in `docs/2026-07-03-legacy-file-redirects.csv`.
2. Confirm `old_source_path`, `new_source_path`, `old_url`, `new_url`, and
   `redirect_status`.
3. Create or update the matching execution ledger row.
4. Set initial `migration_progress`, `audit_progress`, and `audit_result`.

Do not migrate a document that has no file-level mapping row.

### 2. Run Migration

Select rows where:

- `redirect_status=redirect`
- `migration_progress=ready` or explicitly assigned
- `new_source_path` or `target_path` is populated

The migration script must:

1. Read the file-level mapping row or a ledger row derived from it.
2. Read the legacy source from `old_source_path`.
3. Write converted content to `new_source_path`, or to approved staging that is
   promoted to `new_source_path` in the same task.
4. Normalize content according to the repository Markdown and migration rules.
5. Produce a migration report with warnings, unresolved syntax, shared
   dependencies, generated targets, and any skipped links or assets.

After the target output exists:

- set `migration_progress` to `completed`
- set `audit_progress` to `ready`
- set `audit_result` to `pending`
- record `migration_report` when available
- clear or update `blocked_reason`
- set `next_step` to the audit action
- update `updated_at`

If migration cannot finish, set `migration_progress=blocked`, set
`audit_progress=blocked` or `not_started`, set `audit_result=blocked` or
`pending`, and record a concrete `blocked_reason` and `next_step`.

### 3. Run Audit

The audit script must only audit rows where:

- `redirect_status=redirect`
- `migration_progress=completed`
- `audit_progress=ready` or explicitly assigned
- `new_source_path` or `target_path` is populated

It must not audit rows that are `not_started`, `ready`, `in_progress`,
`blocked`, `deferred`, `dropped`, or `not_required`.

For each audited row, the audit script compares the mapped legacy source against
the mapped target document. The default audit checks visible content fidelity:
titles, headings, paragraphs, callouts, lists, tables, code samples, examples,
and platform-scoped content that belongs to the same page.

After audit finishes:

- set `audit_progress` to `completed`
- set `audit_result` to `pass`, `pass_with_notes`, or `fail`
- record `audit_report` when available
- set `next_step` to final review or the fix required by the audit
- update `updated_at`

If audit cannot finish, set `audit_progress=blocked`, set
`audit_result=blocked`, and record `blocked_reason` and `next_step`.

### 4. Fix And Re-Audit

When `audit_result=fail`, the row remains migrated but not accepted.

To fix it:

1. Set `migration_progress=in_progress`.
2. Fix the target document or mapping issue.
3. Set `migration_progress=completed`.
4. Set `audit_progress=ready`.
5. Set `audit_result=pending`.
6. Re-run the audit script.

Do not convert a failed audit into `pass_with_notes` unless the remaining risk
is explicitly accepted in the ledger or a decision record.

## Script Contracts

Migration scripts should consume `docs/2026-07-03-legacy-file-redirects.csv`
directly or consume a normalized table derived from it. When a script operates
on one source/target pair at a time, the wrapper must read the mapping row
before the script run and update the execution ledger after the script run.

Audit scripts should filter to `redirect_status=redirect` and
`migration_progress=completed`. When a script operates on one source/target pair
at a time, the wrapper must enforce that filter before running the script.

Scripts must produce machine-readable or stable text reports that can be linked
from the execution ledger. A run is not complete merely because the script exits
successfully; the execution row must be updated in the same task.

## Guardrails

- Do not invent a target path outside the file-level mapping table.
- Do not migrate rows marked `ignore`, `defer`, or `no-redirect` as content.
- Do not treat `redirect_status=redirect` as proof that content has already
  migrated.
- Do not overwrite unknown existing target content; mark the row blocked and
  record the collision.
- Do not mark `migration_progress=completed` before the target content exists at
  the mapped target path or approved staging output.
- Do not set `audit_progress=completed` without an `audit_result`.
- Do not set `audit_result=pass` when the audit report has unresolved
  differences.
- Do not treat build success alone as content-fidelity proof.
- Do not keep durable migration state only in chat.
- Do not leave legacy Docusaurus JSX, legacy shared imports, runtime platform
  filters, or old rendering shims in final migrated docs unless an approved
  decision explicitly allows it.

## Done Definition

A content row is done only when:

- `redirect_status=redirect`.
- `old_source_path`, `new_source_path`, `old_url`, and `new_url` are correct.
- `migration_progress=completed`.
- `audit_progress=completed`.
- `audit_result=pass` or `pass_with_notes`.
- Required migration and audit reports are recorded.
- Any remaining risk is documented in `notes`, `next_step`, or an approved
  decision record.

A non-content row is done only when:

- `redirect_status` is `no-redirect`, `defer`, or `ignore`.
- `migration_progress` is `not_required`, `deferred`, or `dropped`.
- `audit_progress=not_required`.
- `audit_result=not_applicable`.
- The reason is clear in `notes` or a decision record.

A migration batch is done only when every in-scope row is done, deferred,
dropped, or blocked with a concrete next step.
