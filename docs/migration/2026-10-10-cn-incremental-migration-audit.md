# 中文文档增量迁移审计（2026-10-10）

- Source baseline: `474985f901fffffd4ffed27ed35a060f986bdb98`
- Source head: `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`
- Previous cutoff: `2026-08-03T08:55:38Z`
- Target base: `origin/CN-NEWDOC` at the branch starting point
- Detailed checklist: [`2026-10-10-cn-incremental-migration-audit.csv`](./2026-10-10-cn-incremental-migration-audit.csv)

## Status counts

| Status | Count |
| --- | ---: |
| `already-present-needs-semantic-patch` | 23 |
| `already-present-or-no-content-diff` | 1 |
| `deferred-generated-or-navigation` | 187 |
| `migrated` | 4 |
| `needs-manual-mapping` | 87 |
| `skipped-generated-or-site-asset` | 6 |


Tracked target pages were preserved when direct conversion would replace merged multi-platform content; those rows are marked for semantic patch review.
