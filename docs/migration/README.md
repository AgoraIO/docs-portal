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
| `work-plan.md` | First file to read when taking over migration work. It contains the current phase plan, status vocabulary, and handoff checklist. |
| `path-map.csv` | Source of truth for source path, target path, migration progress, audit progress, and audit result. |
| `migration-ledger.csv` | Inventory-level migration ledger generated from the source audit. Use it for analysis, but update execution progress in `path-map.csv`. |
| `migration-audit-summary.md` | Snapshot of the initial source audit and major unresolved decision groups. |
| `manual-decision-questions.csv` | P0 decisions that block path mapping or API/source strategy. |
| `component-map.yaml` | Machine-readable legacy component and syntax conversion rules for the migration script. |
| `component-inventory.csv` | Legacy JSX/component inventory from the source repository. |
| `shared-inventory.csv` | Shared snippet inventory and dependency risks. |
| `api-inventory.csv` | API reference, generated HTML API, and OpenAPI inventory. |

## Progress Columns

`path-map.csv` owns the execution state.

| Column | Meaning |
| --- | --- |
| `migration_progress` | `not_started`, `in_progress`, `completed`, `blocked`, or `failed`. The migration script writes `completed` after it generates a mapped target. |
| `audit_progress` | `not_started`, `pending`, `completed`, or `failed`. The migration script sets `pending` after migration completes; the audit script finishes it. |
| `audit_result` | Empty before audit, then `pass`, `differences:N`, `legacy-residue:N`, or `error:MESSAGE`. |
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
