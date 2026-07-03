# Migration Work Plan

Last updated: 2026-07-03

Goal: migrate all content from `shengwang-doc-source` into `docs-portal`, then audit each completed migration against its legacy source.

## Handoff Checklist

Every colleague taking over migration work should do this first:

1. Read this file.
2. Filter `path-map.csv` for rows where `migration_progress` is not `completed`.
3. Resolve rows with `status=blocked` through `manual-decision-questions.csv` before assigning migration work.
4. Pick a small batch of rows with source and target paths present.
5. Run the migration script for those rows.
6. Confirm the script updated `migration_progress=completed` and `audit_progress=pending`.
7. Run the audit script against completed rows.
8. Confirm the script updated `audit_progress` and `audit_result`.
9. Fix rows with `audit_result=differences:N`, `audit_result=legacy-residue:N`, or `audit_progress=failed` before treating the batch as done.

## Current Snapshot

The current control tables are an initial migration inventory, not a completed migration batch.

| Area | Current state |
| --- | --- |
| Source repo | `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source` |
| Target repo | current `docs-portal` workspace |
| Mapping table | `docs/migration/path-map.csv` |
| Migration script | `scripts/migrate-legacy-docs.mjs` |
| Audit script | `scripts/audit-single-doc-fidelity.mjs` |
| Ledger rows | 2408 rows |
| Path-map rows | 2335 rows |
| Ledger status | 1790 `needs_review`, 618 `blocked` |
| Path-map status | 1738 `needs_review`, 597 `blocked` |
| High-risk rows | 950 |
| Current execution progress | rows default to `migration_progress=not_started` and `audit_progress=not_started` until scripts update them |

## Progress Vocabulary

`path-map.csv` is the execution source of truth.

| Field | Values | Owner |
| --- | --- | --- |
| `migration_progress` | `not_started`, `in_progress`, `completed`, `blocked`, `failed` | Migration owner or migration script |
| `audit_progress` | `not_started`, `pending`, `completed`, `failed` | Audit owner or audit script |
| `audit_result` | empty, `pass`, `differences:N`, `legacy-residue:N`, `error:MESSAGE` | Audit script |

Do not use the older `status` column as the execution state. It describes mapping readiness or review risk. Execution state lives in `migration_progress`, `audit_progress`, and `audit_result`.

## Phase Plan

| Phase | Status | Exit criteria | Next action |
| --- | --- | --- | --- |
| 0. Control table setup | Complete | `path-map.csv` has migration and audit progress columns; scripts can write them. | Start P0 decision cleanup and a small pilot batch. |
| 1. P0 decision cleanup | Not started | Top blockers in `manual-decision-questions.csv` have owners and decisions. | Start with Q01-Q05 because they unblock the largest groups and API lanes. |
| 2. Pilot migration batch | Not started | A small mapped batch has `migration_progress=completed`. | Pick low-risk `migrate_page_after_syntax_and_ia_review` rows with non-empty targets. |
| 3. Pilot audit batch | Not started | The pilot batch has `audit_progress=completed` and either `audit_result=pass` or tracked fixes. | Run the audit script with `--limit` first. |
| 4. Scale batch migration | Not started | Batch owners can repeat migrate -> audit -> fix without reading chat history. | Use component and shared inventories to group similar rows. |
| 5. Final acceptance | Not started | No remaining required rows are `not_started`, `pending`, `failed`, unresolved `differences:N`, or `legacy-residue:N`. | Run repository verification and produce final migration summary. |

## Batch Operating Rules

- A row is ready for migration only when `source_path` and `target_path` are present and the blocker is empty or explicitly accepted.
- A row is ready for audit only when `migration_progress=completed`.
- A batch is not done until `audit_progress=completed`.
- `audit_result=pass` means the scripted content fidelity audit found no unresolved differences.
- `audit_result=differences:N` means the target exists but needs review or fixes before promotion.
- `audit_result=legacy-residue:N` means the target still contains old components, shared imports, or legacy runtime variables.
- `audit_progress=failed` usually means an input path is wrong, the target file was not generated, or the audit could not expand source dependencies.

## Current Priority Queue

| Priority | Work | Why it matters | Source of detail |
| --- | --- | --- | --- |
| P0 | Resolve FAQ target IA | Blocks 110 rows. | `manual-decision-questions.csv` Q01 |
| P0 | Resolve Flexible Classroom target IA | Blocks 66 rows. | `manual-decision-questions.csv` Q02 |
| P0 | Resolve one-to-one live target IA | Blocks 48 rows. | `manual-decision-questions.csv` Q03 |
| P0 | Resolve multi-usecase target IA | Blocks 42 rows. | `manual-decision-questions.csv` Q04 |
| P0 | Confirm generated HTML API strategy | Blocks API conversion and support assets. | `manual-decision-questions.csv` Q05 and Q10 |

## Command Recipes

Migrate one mapped source path:

```bash
node scripts/migrate-legacy-docs.mjs \
  --path-map docs/migration/path-map.csv \
  --page SOURCE_PATH_FROM_PATH_MAP \
  --source-root /Users/yangyixuan/Documents/GitHub/shengwang-doc-source \
  --out docs/migration/generated/BATCH_NAME
```

Audit completed rows from a generated batch:

```bash
node scripts/audit-single-doc-fidelity.mjs \
  --path-map docs/migration/path-map.csv \
  --source-root /Users/yangyixuan/Documents/GitHub/shengwang-doc-source \
  --target-root docs/migration/generated/BATCH_NAME \
  --out-dir docs/migration/generated/BATCH_NAME-audit \
  --limit 20
```

After a successful pilot, remove `--limit` for the rest of the batch.
