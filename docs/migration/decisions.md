# Migration Decisions

This file records approved decisions for migration agents. It answers: "What has already been decided, and which migration items must follow that decision?"

Do not use this file for raw progress. Put progress in `migration-ledger.csv`, addresses in `path-map.csv`, syntax rules in `syntax-map.md`, and acceptance evidence in `verification-checklist.md` plus the relevant ledger row.

## Decision Format

| Field | Meaning |
| --- | --- |
| ID | Stable identifier such as `D001`. |
| Status | `approved`, `superseded`, or `rejected`. |
| Decision | What agents must do. |
| Rationale | Why this is the current rule. |
| Impact | Which files, ledgers, or verification checks this affects. |

When a decision affects a ledger row or path map row, add the decision ID to that row's `decision_refs` field.

## Approved Decisions

### D001: Migration Control Files Are Source Of Truth

Status: `approved`

Decision: Multi-agent migration work must be tracked in `docs/migration/**`. Chat history, one-off summaries, and local notes are not enough to resume or audit migration state.

Rationale: The migration has many products, platforms, versions, shared dependencies, generated references, and manual decisions. Durable ledgers let each agent continue from the same state.

Impact: Every migration batch must update `migration-ledger.csv`, `path-map.csv`, or another relevant control file before it can be called complete.

### D002: HTML API References Are Direct Migration Work

Status: `approved`

Decision: Legacy generated HTML API references under `html-docs/**` are part of migration scope. Agents should convert them into real Fumadocs folder trees, `meta.json` files, and MDX pages rather than treating them as automatically deferred.

Rationale: HTML API references are user-facing documentation and must land in the current portal navigation. Static iframe dumps are not acceptable as the target architecture.

Impact: `html-docs/**` items should use action `convert-html-api`. Migration must preserve legacy TOC hierarchy, stable fragment IDs, inline links, code spans, notes, parameter tables, return values, and nested lists where possible.

### D003: OpenAPI Sources Stay In `content/openapi/**`

Status: `approved`

Decision: OpenAPI YAML and JSON sources must be tracked under `content/openapi/**`, then published to `/openapi/**` through the build sync step. They must not be placed under `content/docs/**` or hand-maintained under `public/openapi/**`.

Rationale: `content/docs/**` is the Fumadocs MDX/page-tree domain. OpenAPI source data needs a separate lane so routes, sidebar entries, search, llms exports, and prerender paths can derive from a stable registry.

Impact: OpenAPI rows in `migration-ledger.csv` should use action `openapi-lane` and verification must include OpenAPI sync/build checks when route or renderer behavior changes.

### D004: Legacy JSX And Shared Imports Must Be Normalized

Status: `approved`

Decision: Final migrated docs must not keep legacy Docusaurus JSX, runtime `@shared` imports, old platform filters, legacy metadata JS, or old API renderer components.

Rationale: The target portal uses Markdown/MDX native syntax, directives, approved include/static expansion patterns, Fumadocs-compatible components, and local OpenAPI/generated-reference lanes.

Impact: Use `syntax-map.md` before migrating content. Items with unresolved shared dependencies, nested shared chains, or platform filters must remain `blocked`, `needs_review`, or `partial` instead of `done`.

### D005: Build Success Is Not Content Fidelity Proof

Status: `approved`

Decision: A successful build or type check is required for many migration batches, but it does not prove content completeness, page parity, link correctness, shared expansion quality, or API-reference fidelity.

Rationale: A page can compile while losing sections, flattening platform variants, dropping anchors, or replacing source content with an incomplete summary.

Impact: Verification records must name content checks performed, not only commands run.
