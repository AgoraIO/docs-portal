# Doc-Source-Private Migration Skill Design

## Problem

The existing `fumadocs-migration` skill is written for `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source`.
`/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private` is a different source contract:

- product-bucketed folders rather than the Shengwang-source layout
- `_category_.json` navigation metadata
- `@docs/shared/**` imports
- `@site/src/components/rest-api/**` JSX for REST reference pages
- private runtime variables such as `<Vpd />` and `<Vg />`

These differences are structural, not just route-level differences. A migration skill that assumes the Shengwang-source contract will misclassify source files, preserve unsupported syntax, or overclaim coverage for product lanes that still need source-specific rules.

## Decision

Use a split architecture:

- keep `.agents/skills/fumadocs-migration` as the shared core
- add `.agents/skills/fumadocs-migration-private-en` as the source-specific entrypoint

Do not fold `Doc-Source-Private` rules into a thin `fumadocs-migration-en` wrapper because the main delta is the source contract, not only the `/en/**` target route.

The shared core should keep the repository-wide Fumadocs standards, rewrite priorities, verification gates, and audit-report taxonomy. The new private-source entrypoint should own source routing, lane support policy, and `Doc-Source-Private`-specific classification rules.

## V1 Scope

Supported lanes:

- `conversational-ai`
- `open-ai-integration`
- `real-time-stt`

Deferred lanes:

- `ten-agent`
- `ten-framework`

Reason: these deferred lanes rely heavily on source-private variables or widgets such as `<Vpd />`, `<Vg />`, and product-specific landing content that need separate rules.

V1 is intentionally narrow. It should cover the product lanes that are already close to the current docs-portal information architecture and can be migrated through the shared Fumadocs content model plus a small set of private-source transforms. It should not imply that every product folder under `Doc-Source-Private` is ready for the same workflow.

## Required Transformations

- `_category_.json` -> `meta.json`
- `@docs/shared/**` imports -> Fumadocs include or static expansion
- `@site/src/components/rest-api/**` pages -> OpenAPI or structured prose/reference rewrite decision
- private variables such as `<Vpd />` / `<Vg />` -> explicit text expansion or deferred status

These transformations are required for V1 because the target docs-portal standard does not preserve legacy source contracts in place. `_category_.json` must become portal navigation metadata. Shared imports must be resolved into repo-supported content composition. REST API JSX pages must be rewritten into the existing OpenAPI lane or into static Fumadocs-compatible reference prose. Private runtime variables must either be expanded into explicit product text or marked deferred when the expansion rule is not yet defined.

## Consequences

This split keeps the existing `fumadocs-migration` skill reusable instead of forking its entire rule set for one source. It also creates a clean place to reject unsupported private-source constructs without weakening the shared migration standard.

The tradeoff is that private-source support now depends on two layers:

- the shared core staying stable and repo-owned
- the private-source entrypoint staying explicit about lane boundaries and deferred syntax

That tradeoff is acceptable because it prevents source-specific exceptions from leaking into the shared migration workflow.
