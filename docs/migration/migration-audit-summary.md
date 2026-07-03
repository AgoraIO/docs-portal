# Migration Audit Summary

This summary makes the migration audit findings visible in PR review. It is derived from the CSV control tables in this folder and does not migrate any content pages.

## Scope

- Source repository: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source`
- Target repository: current `docs-portal`
- PR context: `AgoraIO/docs-portal#617`
- Write scope: `docs/migration/**` only

## Execution Model

Migration execution is driven by `docs/migration/path-map.csv`.

1. Pick rows from `path-map.csv` with a source path, target path, and no unresolved blocker.
2. Run `scripts/migrate-legacy-docs.mjs` for those rows.
3. The migration script marks migrated rows with `migration_progress=completed` and `audit_progress=pending`.
4. Run `scripts/audit-single-doc-fidelity.mjs --path-map ...` to audit rows where `migration_progress=completed`.
5. The audit script writes `audit_progress` and `audit_result` back to `path-map.csv`.

Use `docs/migration/work-plan.md` as the handoff checklist for colleagues taking over the migration.

## Inventory Counts

| Metric | Count |
| --- | ---: |
| Old Markdown/MDX pages inventoried | 2048 |
| Shared files inventoried | 228 |
| Legacy JSX/component types | 226 |
| HTML API roots | 36 |
| API Reference MDX files | 365 |
| OpenAPI sources | 23 |
| High-risk ledger rows | 950 |
| Blocked ledger rows | 618 |

## Legacy Component Coverage

Current `component-inventory.csv` includes 226 legacy JSX/component types.

| Status | Count |
| --- | ---: |
| needs_review | 219 |
| classified | 7 |

| Category | Count |
| --- | ---: |
| custom-mdx | 161 |
| shared-invocation | 26 |
| landing-or-card | 21 |
| platform-variant | 5 |
| api-reference | 4 |
| table | 3 |
| layout | 2 |
| tabs | 2 |
| callout | 1 |
| media | 1 |

Only 7 component types have a stable target expression today. The rest require syntax-map or IA decisions before migration.

| Legacy component | Category | Target expression |
| --- | --- | --- |
| `Td` | table | GFM table when simple; native HTML only for row/col spans or block-heavy cells |
| `Tr` | table | GFM table when simple; native HTML only for row/col spans or block-heavy cells |
| `Admonition` | callout | directive callout :::note/info/tip/warning/error |
| `Table` | table | GFM table when simple; native HTML only for row/col spans or block-heavy cells |
| `TabItem` | tabs | code fence tabs or repo-approved Tabs/TabsList/TabsTrigger/TabsContent |
| `Image` | media | Markdown image syntax; mark needs-image-standard when width/caption matters |
| `Tabs` | tabs | code fence tabs or repo-approved Tabs/TabsList/TabsTrigger/TabsContent |

## Component Mapping Gaps

The largest unmapped or review-required legacy component families are below. These should be used to backfill `syntax-map.md` or an equivalent migration rule table.

| Component | Occurrences | Category | Status | Risk | Current target mapping note |
| --- | ---: | --- | --- | --- | --- |
| `Td` | 57334 | table | classified | high | GFM table when simple; native HTML only for row/col spans or block-heavy cells |
| `Tr` | 19006 | table | classified | high | GFM table when simple; native HTML only for row/col spans or block-heavy cells |
| `Admonition` | 6156 | callout | classified | medium | directive callout :::note/info/tip/warning/error |
| `ListTitle` | 5334 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `Table` | 4120 | table | classified | high | GFM table when simple; native HTML only for row/col spans or block-heavy cells |
| `PlatformFilter` | 3594 | platform-variant | needs_review | high | static platform folders or PlatformInline/PlatformStructured |
| `VersionTitle` | 3052 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `Col` | 2508 | layout | needs_review | high | remove Ant Design layout; rewrite as Markdown sections or approved cards directive |
| `H3` | 2458 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `H2` | 2048 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `TabItem` | 2024 | tabs | classified | medium | code fence tabs or repo-approved Tabs/TabsList/TabsTrigger/TabsContent |
| `VersionSection` | 1526 | api-reference | needs_review | high | prefer structured API/OpenAPI source; otherwise conservative Markdown reference rewrite |
| `Image` | 1277 | media | classified | medium | Markdown image syntax; mark needs-image-standard when width/caption matters |
| `Row` | 1214 | layout | needs_review | high | remove Ant Design layout; rewrite as Markdown sections or approved cards directive |
| `Tabs` | 786 | tabs | classified | medium | code fence tabs or repo-approved Tabs/TabsList/TabsTrigger/TabsContent |
| `Detail` | 562 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `LinkCardV2` | 540 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `Glossary` | 486 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `Status` | 259 | shared-invocation | needs_review | medium | inline/include referenced shared content after dependency audit |
| `ListItem` | 174 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `SDKDownloadCard` | 166 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `HotArticleCard` | 135 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `PlatformGuideCard` | 122 | platform-variant | needs_review | high | static platform folders or PlatformInline/PlatformStructured |
| `DocLinkCard` | 118 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `ProductOverview` | 110 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `RecommendCard` | 100 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `Text` | 94 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `Tech` | 74 | custom-mdx | needs_review | medium | classify before migration; do not preserve legacy JSX by default |
| `InstantExperienceCard` | 73 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |
| `QuickStartCard` | 63 | landing-or-card | needs_review | high | Markdown links/lists or project-approved cards directive after IA review |

## Manual Decision Questions

The top 20 open manual decisions have been extracted to `manual-decision-questions.csv`. They are grouped from blocked ledger rows so reviewers can assign owners and close decisions without reading the whole ledger first.

## Key Interpretation

- Legacy JSX should not be preserved as compatibility components.
- New-site equivalents are mostly target syntax or migration strategies, not same-name React components.
- `classified` means a migration rule is clear enough to batch.
- `needs_review` means the item needs a syntax-map, IA, shared-content, or API-lane decision before migration.
- `blocked` rows in `migration-ledger.csv` and `path-map.csv` include explicit `blocked_reason` and `next_step`.
