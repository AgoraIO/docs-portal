# Migration Control Console

This directory is the control console for documentation migration. It lets any agent answer the same basic questions without reading chat history:

- What needs to move?
- Where does it move?
- What rule converts it?
- Who decided ambiguous cases?
- What proves it is done?
- What still needs human judgment?

## Core Principle

Use one file for one responsibility:

| File | Responsibility | When To Update |
| --- | --- | --- |
| `spec.md` | Repository-level agent rules. | Rarely. Only when the way agents work in the repo changes. |
| `migration-ledger.csv` | Progress and per-item migration state. | Whenever a source item is audited, started, blocked, reviewed, or completed. |
| `path-map.csv` | Source path to target path mapping. | Whenever a route, target file, merge, split, defer, or drop decision is made. |
| `syntax-map.md` | Legacy syntax to target syntax mapping. | Whenever a reusable old-to-new syntax rule is discovered or changed. |
| `component-map.yaml` | Script-readable legacy component and syntax conversion contract. | Whenever a reusable legacy component rule, review flag, component family, or false-positive pattern is discovered or changed. |
| `verification-checklist.md` | Acceptance gates. | Whenever the definition of acceptable migration evidence changes. |
| `decisions.md` | Human or senior-agent decisions. | Whenever ambiguity is resolved for more than one item or a risky exception is approved. |

In short: `spec.md` governs rules, `ledger` governs progress, `path-map` governs addresses, `syntax-map` and `component-map` govern conversions, `checklist` governs acceptance, and `decisions` governs judgment.

## Reading Order

1. `AGENTS.md`
2. `spec.md`
3. `docs/agents/markdown-authoring-standard.md`
4. `docs/migration/decisions.md`
5. `docs/migration/path-map.csv`
6. `docs/migration/migration-ledger.csv`
7. `docs/migration/syntax-map.md`
8. `docs/migration/component-map.yaml`
9. `docs/migration/verification-checklist.md`

## How To Use This Directory

Before starting a migration item:

1. Find or create its row in `migration-ledger.csv`.
2. Confirm its source and target in `path-map.csv`.
3. Check `decisions.md` for relevant approved decisions.
4. Check `syntax-map.md` for old syntax that must be normalized.
5. Check `component-map.yaml` for script-owned component rules, review flags, and false-positive patterns.
6. Check `verification-checklist.md` for the required evidence.

While working:

1. Keep the ledger row current.
2. Add path questions to `path-map.csv`, not prose notes.
3. Add reusable syntax discoveries to `syntax-map.md`.
4. Add reusable script-facing component mappings to `component-map.yaml`.
5. Add human decisions to `decisions.md`.
6. Keep blockers explicit and actionable.

Before marking `done`:

1. Run or perform the required verification.
2. Record the evidence in `migration-ledger.csv`.
3. Make sure the item has no unresolved blocker unless that risk is accepted in `decisions.md`.

## Component Map Contract

`component-map.yaml` is the migration script input for legacy JSX and reusable syntax normalization. Scripts should use it to decide:

1. Which legacy components and syntax patterns are safe to convert automatically.
2. Which conversions must produce a `needs_review` target status or review flag.
3. Which component families were used by each source file.
4. Which angle-bracket literals are false positives and should be escaped or code-spanned instead of parsed as components.

The map is deliberately broader than a one-file fix. It includes direct component rules, component families, reusable syntax patterns, and false-positive patterns. A batch migration should output a component usage report under `docs/migration/generated/{batch}/component-usage-report.md` with matched rules and review flags for each file.

If a new old component appears, update `component-map.yaml` first, then update `syntax-map.md` when the rule also needs a human-readable explanation.

## CSV Schemas

`migration-ledger.csv` is the total task table. Use one row per source page, shared snippet, generated API item, OpenAPI source, or explicitly tracked asset.

| Column | Meaning |
| --- | --- |
| `id` | Stable task ID, for example `MIG-0001`. |
| `locale` | Source or target locale, for example `zh-CN` or `en`. |
| `product` | Product family such as RTC, RTM, Chat, or Conversational AI. |
| `platform` | Platform when applicable, for example Android, iOS, Web, Flutter, Unity, or REST. |
| `version` | SDK/API/doc version when applicable. |
| `content_type` | Page, shared snippet, asset, OpenAPI source, HTML API page, metadata, or landing page. |
| `source_path` | Legacy source path. |
| `target_path` | Target repository path. |
| `migration_action` | One action from the default action table below. |
| `status` | One status from `spec.md`. |
| `risk` | `low`, `medium`, `high`, or `critical`. |
| `batchable` | `yes`, `partial`, or `no`. |
| `decision_refs` | Related decision IDs, for example `D002;D004`. |
| `shared_dependencies` | Shared files or nested include chain used by this item. |
| `legacy_syntax` | Legacy JSX/component/syntax patterns found. |
| `api_reference_kind` | `none`, `openapi`, `html-api`, `api-mdx`, or another reviewed kind. |
| `openapi_source` | OpenAPI YAML/JSON source path when applicable. |
| `html_api_source` | `html-docs/**` source path when applicable. |
| `merge_group` | Group ID when several source pages merge into one target. |
| `split_targets` | Target paths when one source page splits into several pages. |
| `blocked_reason` | Exact missing input, source, decision, or tool result. |
| `next_step` | Concrete next action for the next agent. |
| `verification` | Commands and manual checks already performed. |
| `owner` | Current agent or reviewer. |
| `updated_at` | Date of last update. |
| `notes` | Short extra context. |

`path-map.csv` is the address table. Use it before creating or moving target pages.

| Column | Meaning |
| --- | --- |
| `id` | Stable mapping ID. |
| `locale` | Locale for the mapping. |
| `product` | Product family. |
| `platform` | Platform when applicable. |
| `version` | Version when applicable. |
| `source_path` | Legacy source path. |
| `target_path` | Target repository file path. |
| `target_route` | Public route if known. |
| `migration_action` | Copy, merge, split, rewrite, convert HTML API, OpenAPI lane, shared include, defer, or drop. |
| `status` | Mapping status from `spec.md`. |
| `risk` | Mapping risk. |
| `batchable` | Whether the mapping can be applied in bulk. |
| `decision_refs` | Related decision IDs. |
| `reason` | Why this target location was chosen. |
| `blocked_reason` | Missing IA/source decision if mapping is not ready. |
| `next_step` | Concrete next action. |
| `updated_at` | Date of last update. |
| `notes` | Short extra context. |

## Migration Actions

| Action | Meaning |
| --- | --- |
| `copy` | Move content with only path, metadata, and syntax normalization. |
| `merge` | Combine multiple source pages into one target page. |
| `split` | Split one source page into multiple target pages. |
| `rewrite` | Rewrite content because direct migration cannot preserve meaning safely. |
| `convert-html-api` | Convert generated HTML API reference into Fumadocs folders, `meta.json`, and MDX pages. |
| `openapi-lane` | Track OpenAPI YAML or JSON under `content/openapi/**` and render through the OpenAPI lane. |
| `shared-include` | Convert reusable shared content into approved include/static expansion form. |
| `defer` | Postpone with an accepted reason and follow-up owner. |
| `drop` | Do not migrate because an approved decision says it is obsolete or out of scope. |

## Risk Levels

| Risk | Meaning |
| --- | --- |
| `low` | Native Markdown or straightforward metadata/path cleanup. |
| `medium` | Requires syntax normalization, link fixes, asset moves, or simple shared expansion. |
| `high` | Requires platform branching, nested shared dependencies, API reference conversion, generated HTML parsing, or major IA judgment. |
| `critical` | Blocks product migration, affects many pages, or requires human/API-source decision before agents can proceed. |

## Batchability

Use `yes` when the same rule can be safely applied across many files. Use `partial` when a script can prepare the change but review is still required. Use `no` when the item needs page-specific human or senior-agent judgment.
