# Migration Work Plan

Last updated: 2026-07-05

Goal: migrate all content from `shengwang-doc-source` into `docs-portal`, then audit each completed migration against its legacy source.

## Handoff Checklist

Every colleague taking over migration work should do this first:

1. Read this file.
2. Filter `path-map.csv` by `redirect_status`. Rows with `redirect_status=redirect` are the required migration set for the current PR.
3. Resolve rows with `migration_progress=blocked`, `deferred`, `dropped`, or `ready` through `manual-decision-questions.csv` or an explicit owner decision before assigning migration work.
4. Pick rows with source and target paths present.
5. Run the migration script for those rows.
6. Confirm the script updated `migration_progress=completed` and `audit_progress=pending`.
7. Run the audit script against completed rows.
8. Confirm the script updated `audit_progress` and `audit_result`.
9. Fix rows with `audit_result=differences:N`, `audit_result=legacy-residue:N`, or `audit_progress=failed` before treating the batch as done.

## Current Snapshot

The current control tables include the completed full redirect migration pass for PR 617.

| Area | Current state |
| --- | --- |
| Source repo | `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source` |
| Target repo | current `docs-portal` workspace |
| Mapping table | `docs/migration/path-map.csv` |
| Migration script | `scripts/migrate-legacy-docs.mjs` |
| Audit script | `scripts/audit-single-doc-fidelity.mjs` |
| Ledger rows | 2408 rows |
| Path-map rows | 2574 rows |
| Redirect migration rows | 1859 rows |
| Redirect migration progress | 1859 `completed` |
| Redirect audit progress | 1859 `completed` |
| Redirect audit result | 1618 `pass`, 241 `differences:N`, 0 `legacy-residue:N`, 0 `error:MESSAGE` |
| Non-redirect rows | 715 rows marked `not_required`, `deferred`, `dropped`, `blocked`, or `ready` according to `redirect_status` and mapping state |
| High-risk rows | 950 |
| Current execution progress | all `redirect_status=redirect` rows have generated targets under `content/docs/zh-CN/**`; remaining work is audit-difference cleanup and spot check |

## Current Execution Counts

`path-map.csv` remains the source of truth. `migration-ledger.csv` has also been synchronized where rows could be matched to the path map.

| Table | Rows | Completed migrations | Completed audits | Pass | Differences | Legacy residue | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `path-map.csv` | 2574 | 1859 | 1859 | 1618 | 241 | 0 | 0 |
| `migration-ledger.csv` | 2408 | 1506 | 1506 | 1316 | 190 | 0 | 0 |

| `path-map.csv` migration state | Count |
| --- | ---: |
| `completed` | 1859 |
| `deferred` | 527 |
| `dropped` | 86 |
| `blocked` | 86 |
| `not_required` | 12 |
| `ready` | 4 |

## Progress Vocabulary

`path-map.csv` is the execution source of truth.

| Field | Values | Owner |
| --- | --- | --- |
| `migration_progress` | `not_started`, `in_progress`, `completed`, `blocked`, `failed`, `deferred`, `dropped`, `not_required`, `ready` | Migration owner or migration script |
| `audit_progress` | `not_started`, `pending`, `completed`, `failed`, `not_required` | Audit owner or audit script |
| `audit_result` | empty, `pass`, `differences:N`, `legacy-residue:N`, `error:MESSAGE`, `not_applicable` | Audit script |

Do not use the older `status` column as the execution state. It describes mapping readiness or review risk. Execution state lives in `migration_progress`, `audit_progress`, and `audit_result`.

## Phase Plan

| Phase | Status | Exit criteria | Next action |
| --- | --- | --- | --- |
| 0. Control table setup | Complete | `path-map.csv` has migration and audit progress columns; scripts can write them. | Start P0 decision cleanup and a small pilot batch. |
| 1. P0 decision cleanup | Partially complete | Non-redirect rows have explicit non-required/deferred/dropped states or are blocked/ready for owner review. | Resolve the 86 blocked rows and 4 ready rows when those lanes are in scope. |
| 2. Pilot migration batch | Complete | A mapped batch has `migration_progress=completed`. | Superseded by the full redirect migration pass. |
| 3. Pilot audit batch | Complete | The pilot batch has `audit_progress=completed` and either `audit_result=pass` or tracked fixes. | Superseded by the full redirect audit pass. |
| 4. Scale batch migration | Complete for redirect rows | All `redirect_status=redirect` rows have generated targets. | Work through the 241 remaining `differences:N` rows by reusable migration/audit fixes. |
| 5. Final acceptance | In progress | No remaining required rows are `not_started`, `pending`, `failed`, unresolved `differences:N`, or `legacy-residue:N`. | Clear the 241 audit differences, run repository verification, and do human spot checks. |

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
| P0 | Clear remaining audit differences | 241 completed redirect rows still have `audit_result=differences:N`. | `docs/migration/generated/full-redirect-pass-1-audit/report.md` and per-row audit reports |
| P0 | Spot check passed migration rows | 1618 rows have scripted `pass` and need reviewer sampling before final acceptance. | `docs/migration/path-map.csv` |
| P1 | Resolve blocked non-redirect rows | 86 rows remain blocked outside the redirect migration set. | `manual-decision-questions.csv` and `blocked_reason` |
| P1 | Resolve ready non-redirect rows | 4 rows are marked `ready` but are outside the completed redirect pass. | `docs/migration/path-map.csv` |
| P2 | Decide deferred rows | 527 rows are explicitly deferred by redirect/mapping status. | `redirect_status=defer` |

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
