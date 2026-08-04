# Migration Control Console

This directory is the handoff point for migrating all content from `shengwang-doc-source` into `docs-portal`.

The migration workflow is mapping-table driven:

1. Use `path-map.csv` to find the source document, target document, migration action, and current progress.
2. Run the migration script for the selected mapping rows.
3. After the migration script writes the target output, it updates `migration_progress` in `path-map.csv`.
4. Run the audit script against rows where `migration_progress=completed`.
5. After the audit script finishes, it updates `audit_progress` and `audit_result` in `path-map.csv`.

## Files

| File | Purpose |
| --- | --- |
| `work-plan.md` | First file to read when taking over migration work. It contains the current phase plan, status vocabulary, handoff checklist, and latest execution counts. |
| `cn-hotfix-checkpoint.md` | Incremental CN hotfix handoff record: latest source merge checkpoint, target PR, completed scope, exclusions, and where the next batch starts. |
| `path-map.csv` | Source of truth for source path, target path, redirect status, migration progress, audit progress, and audit result. |
| `migration-ledger.csv` | Inventory-level migration ledger generated from the source audit. It is synchronized from `path-map.csv` where rows can be matched, but execution progress is still owned by `path-map.csv`. |
| `migration-audit-summary.md` | Snapshot of the initial source audit and major unresolved decision groups. |
| `manual-decision-questions.csv` | P0 decisions that block path mapping or API/source strategy. |
| `component-map.yaml` | Machine-readable legacy component and syntax conversion rules for the migration script. |
| `component-inventory.csv` | Legacy JSX/component inventory from the source repository. |
| `shared-inventory.csv` | Shared snippet inventory and dependency risks. |
| `api-inventory.csv` | API reference, generated HTML API, and OpenAPI inventory. |

## Current Snapshot

The full PR 617 redirect migration pass has been generated under `content/docs/zh-CN/**` and audited against the legacy source.

| Metric | Count |
| --- | ---: |
| `path-map.csv` rows | 2574 |
| `redirect_status=redirect` rows | 1859 |
| Completed redirect migrations | 1859 |
| Completed redirect audits | 1859 |
| Audit pass | 1618 |
| Audit differences | 241 |
| Legacy residue | 0 |
| Audit errors | 0 |

| Non-redirect state in `path-map.csv` | Count |
| --- | ---: |
| `deferred` | 527 |
| `dropped` | 86 |
| `blocked` | 86 |
| `not_required` | 12 |
| `ready` | 4 |

## Progress Columns

`path-map.csv` owns the execution state.

| Column | Meaning |
| --- | --- |
| `redirect_status` | Controls whether a row belongs to the current migration set. `redirect` rows are migrated; `ignore`, `defer`, and `no-redirect` are marked non-required or deferred. |
| `migration_progress` | `not_started`, `in_progress`, `completed`, `blocked`, `failed`, `deferred`, `dropped`, `not_required`, or `ready`. The migration script writes `completed` after it generates a mapped redirect target. |
| `audit_progress` | `not_started`, `pending`, `completed`, `failed`, or `not_required`. The migration script sets `pending` after migration completes; the audit script finishes it. |
| `audit_result` | Empty before audit, then `pass`, `differences:N`, `legacy-residue:N`, `error:MESSAGE`, or `not_applicable`. |
| `last_migration_report` | Most recent migration report path for the row. |
| `last_audit_report` | Most recent audit report path for the row. |
| `updated_at` | Last script update timestamp for the row. |

## Script Entry Points

Run migration from the mapping table:

```bash
node scripts/migrate-legacy-docs.mjs \
  --path-map docs/migration/path-map.csv \
  --page docs/rtc/get-started/quick-start.ios.mdx \
  --source-root /Users/yangyixuan/Documents/GitHub/shengwang-doc-source \
  --out docs/migration/generated/batch-name
```

Run audit for completed migration rows:

```bash
node scripts/audit-single-doc-fidelity.mjs \
  --path-map docs/migration/path-map.csv \
  --source-root /Users/yangyixuan/Documents/GitHub/shengwang-doc-source \
  --target-root docs/migration/generated/batch-name \
  --out-dir docs/migration/generated/batch-name-audit
```

Use `--limit=N` for a small audit batch. Use `--include-audited` only when intentionally rerunning completed audits.
