# Legacy Docs Migration Spec

## 1. Purpose

This spec defines the reusable migration execution protocol for moving legacy documentation from `/Users/yejiayi/Documents/Doc-Source-Private` into `/Users/yejiayi/Documents/docs-portal`.

The goal of this spec is not only to describe target information architecture, but also to make migration runs repeatable enough that an agent can execute them with minimal human intervention, including for complex pages.

This spec is repository-wide and reusable across products. `Signaling` remains the first pilot used to validate the protocol.

## 2. Scope

Source repository:
- `/Users/yejiayi/Documents/Doc-Source-Private`

Target repository:
- `/Users/yejiayi/Documents/docs-portal`

Primary target content surface:
- `content/docs/{locale}/**`

Primary static asset surface:
- `public/images/**`

Out of scope unless explicitly added in a later task:
- Generated API reference implementations
- OpenAPI ingestion or publication work
- Cross-locale synchronization
- Docs-shell runtime redesign
- Editorial rewrites not required for compatibility

## 3. Global IA Contract

Every migrated product must fit the target docs IA used by the current portal rather than recreating the legacy site structure verbatim.

The default product sidebar contract is:
- `Quickstart`
- `Build`
- `Reference`

The product root `index.md` or `index.mdx` is the `Quickstart` landing page.

The migration must preserve this target sidebar contract while reclassifying legacy content into:
- product-root sibling pages
- `build/**`
- `reference/**`
- `meta.json`

The agent must not invent additional top-level product sections unless the target repository already uses them for that product or the task explicitly requires them.

## 4. Global Source Classification

Before editing files, classify each legacy source page into one of these buckets:
- product overview or conceptual page
- quickstart or onboarding page
- build or capability page
- non-API reference or support page
- API reference or generated API page
- shared-content dependency
- unsupported migration case

This classification controls the target route and whether the content is migrated now or deferred.

## 5. Global Mapping Rules

### 5.1 Product-root sibling pages

Use product-root sibling pages for conceptual content that should remain directly visible beside the `Quickstart` landing page.

Typical legacy sources:
- product overview
- core concepts
- beginner guide
- conceptual introductions

These pages must live beside `index.md` or `index.mdx` under the product root instead of being merged into the landing page.

### 5.2 Quickstart

Use `index.md` or `index.mdx` for the primary onboarding or first-run path for the product.

Allowed behaviors:
- merge one or more legacy quickstart pages into the landing page when they form one coherent entry path
- keep additional quickstart pages as product-root sibling pages when they deserve standalone routes

Disallowed behaviors:
- using the landing page as a dumping ground for all conceptual or onboarding content
- forcing all quickstart pages into `build/**`

### 5.3 Build

Use `build/**` for feature implementation, capability configuration, task workflows, and development-oriented content.

Typical legacy sources:
- feature guides
- core functionality pages
- how-to pages
- implementation tasks

The agent should preserve one-page-per-topic granularity whenever the source already has clear topic boundaries.

### 5.4 Reference

Use `reference/**` for non-API support and reference material that belongs in the product reference area but is not generated API reference.

Typical legacy sources:
- pricing or billing policy
- downloads
- console overview
- firewall requirements
- glossary
- security
- support policies
- infrastructure reference notes

### 5.5 Deferred API Material

Defer content that depends on an API-reference lane rather than prose migration.

Typical deferred sources:
- SDK API reference entry pages
- REST API pages
- generated HTML API references
- platform-bound API error catalogs that are tightly coupled to API/reference generation
- pages whose correct target depends on OpenAPI or generated reference pipelines

Deferred content must be listed explicitly in migration output rather than silently skipped.

## 6. Global Migration Constraints

Default to high-fidelity migration: preserve original page semantics, paragraphs, headings, code samples, and information structure as much as possible. Only make the smallest necessary compatibility adaptation when the legacy MDX, JSX, or runtime surface cannot work in the target portal.

Do not use migration as a reason to perform editorial rewrites, structural beautification, summarization, or opportunistic content compression.

The following rules are mandatory:

- Expand legacy shared-content dependencies into migrated content or into target-approved static forms.
- Do not preserve runtime dependencies on source-repo imports such as `@docs/shared/...`.
- Expand legacy variable components such as `Vg`, `Vpd`, and `Vpl` into final display text.
- Do not leave legacy JSX runtime markers in migrated content.
- Migrate legacy `PlatformWrapper` usage to target-compatible structures only when platform differentiation is required to preserve original semantics.
- Use page-level platform tabs when one logical document must preserve multiple platform variants on one route.
- Use code-block tabs only for code-example-local language or package-manager variants.
- Preserve legacy internal links when the target page does not yet exist by treating them as deferred unresolved links.
- Do not rewrite unresolved legacy links to a nearby but semantically different page.
- When a normalized page still carries product-semantic ambiguity, mixed product models, or mismatched examples, the agent must treat this as a page risk that requires explicit block-level handling rather than subjective cleanup.
- Unknown existing target content must never be overwritten; it must be recorded and left unchanged.

## 7. Trigger-Based Execution Protocol

This spec uses a trigger-based protocol instead of agent intuition.

The agent must decide page handling mode before writing any final docs files:
- `simple-flow`
- `complex-flow`

The decision must be based only on machine-detectable evidence from:
- the source page
- its shared-content dependency chain
- the normalized staging output

### 7.1 Page-fatal triggers

A page-fatal trigger blocks only the current page from entering the final docs tree. It does not stop the whole batch.

If any page-fatal trigger is present, the page must end in one of these states only:
- `staged-only`
- `deferred-with-report`
- `remediated-and-promoted`

It must not remain as a half-written final page in `content/docs/**`.

Page-fatal triggers:
- final page still contains legacy runtime syntax or wrappers
- final page frontmatter cannot be parsed
- final page contains unfenced raw XML, HTML, storyboard, or config samples
- final page fails page-level verification
- final page contains image references whose assets are missing from `public/images/**`

### 7.2 Complex-page triggers

Complex-page triggers are a closed list. The agent must not invent new triggers at runtime.

If a page hits any complex-page trigger, it must enter `complex-flow`.

Complex-page triggers are grouped as follows.

Content structure triggers:
- shared-content expansion depth greater than one level
- source contains `Tabs`, `TabItem`, `CodeBlock`, `PlatformWrapper`, `ProductWrapper`, `Admonition`, `details`, or `summary`
- source contains raw XML, HTML, storyboard, plist, Gradle, Maven, or other config-like samples
- source contains multiple platform variants in one logical page
- source contains large multi-platform or multi-language example sections

Resource dependency triggers:
- source references shared image directories outside product-private assets, such as `/images/common/**`, `/images/console/**`, `/images/video-sdk/**`, `/images/chat/**`, or equivalent shared trees
- source references assets introduced by shared-content dependencies rather than only product-private assets
- source requires asset sync into `public/images/**` before the page can render safely

### 7.3 Semantic-risk triggers

Semantic-risk triggers are a closed list. The agent must not invent new semantic-risk triggers at runtime.

If a page hits any semantic-risk trigger after normalization, it must enter `salvage-flow` before promotion is allowed.

Semantic-risk triggers:
- page-level examples, payloads, code samples, or data models contradict the product-specific reference material preserved in the same normalized page
- a shared-content expansion mixes generic multi-product explanation with product-specific reference details in one route and the mixed content cannot be promoted verbatim without introducing ambiguity
- the normalized page contains route, anchor, or prerequisite references that are structurally valid but no longer align with the target IA for that product
- the normalized page contains product-specific event, request, response, or configuration sections whose surrounding explanatory blocks still describe another product model or a generic wrapper contract
- the normalized page contains one or more unsafe blocks that require explicit disposition before the page can become promotion-safe

## 8. Flow Definitions

### 8.1 Simple-flow

Use `simple-flow` only when the page hits no complex-page trigger and no page-fatal trigger.

Simple-flow rules:
- the page still requires page-level precheck
- the page does not require a persisted staging file
- the page may be written directly to final target paths only after page-level precheck passes

### 8.2 Complex-flow

Use `complex-flow` whenever a page hits any complex-page trigger.

Complex-flow is mandatory, not advisory.

Complex-flow minimum steps:
1. audit
2. classify
3. expand
4. normalize
5. stage
6. page-verify
7. promote
8. batch-verify
9. report

The order is mandatory.

### 8.3 Salvage-flow

Use `salvage-flow` when a normalized page hits any semantic-risk trigger.

`salvage-flow` is a mandatory subflow under `complex-flow`, not an optional rewrite mode.

`salvage-flow` minimum steps:
1. block-inventory
2. semantic-risk-scan
3. disposition
4. fragment-verify
5. page-verify
6. promote-or-defer

Required rules:
- the agent must classify the normalized page into explicit blocks before promotion
- each unsafe block must receive exactly one disposition action
- the agent must not leave any unsafe block in the final promoted page without an explicit disposition record
- a page may still be promoted if every unsafe block has been resolved, replaced, split, or deferred at fragment level and the remaining final page is promotion-safe
- if unsafe blocks cannot be isolated without breaking the page meaning, the page remains `staged-only` or `deferred-with-report`

Allowed disposition actions:
- `keep-as-safe-block`
- `replace-with-static-adaptation`
- `split-to-separate-target-page`
- `defer-fragment-with-report`
- `drop-with-report`

Disallowed behaviors:
- silent deletion of an unsafe block
- vague “manually cleaned up” promotion with no block-level record
- whole-page promotion when the page still contains an unresolved unsafe block

## 9. Required Responsibilities

The spec must distinguish tasks that must be scripted from those that may remain agent-authored.

### 9.1 Must be scripted

- shared recursion expansion
- variable expansion
- machine-detectable trigger scanning
- asset reference collection
- asset existence verification
- shared asset sync into `public/images/**`
- structural normalization of legacy wrappers, tabs, callouts, and details blocks
- frontmatter sanitation checks
- staging generation
- block inventory generation for salvage-flow pages
- machine-detectable semantic-risk scanning
- disposition recording for unsafe blocks
- fragment-level verification and report scaffolding
- blocker report scaffolding

### 9.2 May be agent-authored

- final IA bucket decisions
- target page titles and descriptions
- deferred unresolved link reasoning
- concise migration summaries
- narrow high-fidelity prose cleanup that does not change page meaning

## 10. Staging Contract

Complex pages must produce a normalized staging artifact before promotion to final target paths.

Staging artifacts do not need to be created for simple-flow pages.

Staging artifacts are required for:
- complex-flow pages
- deferred pages where partial normalization work has already occurred
- remediation of polluted final pages
- salvage-flow pages that require block-level disposition

Recommended staging location:
- `docs/superpowers/staging/YYYY-MM-DD-<product>/`

The exact filename scheme may vary, but the staging artifact must be durable enough for review and re-entry.

## 11. Page-Level Precheck And Verification

Every page must pass page-level precheck before final promotion.

Simple-flow page precheck checklist:
- frontmatter parses
- no legacy runtime residue remains
- no bare angle-bracket placeholders remain in prose
- no unfenced XML, HTML, storyboard, or config samples remain in prose
- internal links are classified as resolved or deferred unresolved links
- image assets referenced by the page exist in `public/images/**`
- no page-fatal trigger remains

Complex-flow page verification checklist includes all of the above, plus:
- shared expansion is complete
- structural normalization is complete
- staging artifact exists
- normalized staging output itself contains no page-fatal trigger

Salvage-flow page verification checklist includes all of the above, plus:
- a block inventory exists
- every unsafe block has an explicit disposition action
- fragment-level deferrals are recorded in the blocker report
- the promoted page contains no unresolved semantic-risk trigger
- any replaced or split block preserves page-level product semantics more safely than the unmodified normalized block

A staging page may still be complex after normalization; complexity alone is not failure. Only page-fatal conditions block promotion.

## 12. Asset Sync Contract

Shared image asset handling is a first-class migration step.

Before promoting any page that references `/images/**`, the agent must:
1. collect all image references from the page and its expanded shared dependencies
2. verify whether each referenced asset already exists in `public/images/**`
3. sync any missing assets from source-controlled image trees
4. rerun page-level verification after sync

The agent must not assume only product-private image directories are relevant.

If a page depends on shared image directories, this is a complex-page trigger.

If an image reference remains but the asset is still missing, this becomes a page-fatal trigger.

## 13. Existing Target Content Contract

Before writing target files, the agent must inspect the target product directory and classify existing files as:
- placeholder page
- navigation metadata
- unknown existing content

Default assumption:
- most product directories primarily contain placeholders

Rules:
- placeholders may be replaced or removed only when the corresponding real target page is created in the same batch
- navigation metadata may be updated according to the IA contract
- unknown existing content must not be overwritten
- unknown existing content must be recorded and bypassed

Unknown existing content is not fatal for the batch; it must be recorded and left unchanged.

## 14. Blocker And Report Contract

When a page cannot be migrated safely, the agent must record it.

Recommended report location:
- `docs/superpowers/reports/YYYY-MM-DD-<product>-migration-blockers.md`

The report must separate:
- `deferred content`
- `repository anomaly`

Each report entry must contain at least:
- source path
- intended target path
- current flow (`simple` or `complex`)
- blocker type
- exact failing pattern
- attempted adaptation
- why final promotion was blocked
- next missing rule, tool, or compatibility contract

If the blocker is fragment-scoped rather than page-scoped, the report entry must also contain:
- block id
- block disposition
- whether the parent page was promoted, staged-only, or deferred

## 15. Pollution Remediation Contract

If a broken page has already entered the final docs tree, the agent must not stop at recording the problem.

It must enter a remediation loop:
1. identify the polluted page
2. prevent further propagation into navigation or adjacent pages
3. repair the page or remove it from final routing
4. rerun page-level verification
5. update blocker reporting with remediation status

“Broken final page left in tree” is never an acceptable stable state.

## 16. Batch Completion Rules

There is no batch-fatal concept in this spec.

The batch should continue migrating safe pages even if some pages become deferred or page-fatal.

A migration batch succeeds when:
- all safely promotable pages are promoted
- all page-fatal pages are kept out of the final docs tree or remediated
- all salvage-flow pages are either promoted as promotion-safe pages or recorded with fragment-aware blocker reporting
- blockers are recorded
- required verification is run

A batch fails when:
- page-fatal pages remain in the final docs tree without remediation
- hard-stop conditions are ignored
- required reports are missing
- verification is skipped while completion is claimed

## 17. Deliverables

For each migration batch, the agent must produce:
- migrated final pages
- `meta.json` updates
- required asset sync
- blocker report
- concise migration summary
- verification results
- repo-local migration tooling when needed for repeatable execution
- block inventory and disposition evidence for any salvage-flow page

Migration tooling is a first-class deliverable for complex-page migration work.

## 18. Verification And Acceptance Criteria

The minimum acceptance gate remains:
- `bun run types:check`

Additional checks:
- `bun run build` when routing, navigation, or publication behavior changes
- `bun run test` when code or test-covered behavior changes

The batch is not complete until:
- migrated pages land only in approved target paths
- sidebar contract remains coherent
- no legacy runtime dependency remains in final promoted pages
- no unresolved variable JSX remains
- page-fatal pages are absent from the final docs tree or remediated
- no promoted salvage-flow page contains an unresolved unsafe block
- deferred items are listed explicitly
- shared image assets required by promoted pages are present

## 19. Pilot Appendix: Signaling

This appendix validates the execution protocol using the Signaling product.

Source product root:
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling`

Target product root:
- `/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/rtm`

Pilot locale scope:
- English only

Pilot in-scope source directories:
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/overview`
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/get-started`
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/core-functionality`
- non-API support pages under `/Users/yejiayi/Documents/Doc-Source-Private/signaling/reference`

Pilot target sidebar contract:
- `Quickstart`
- `Build`
- `Reference`

Pilot mapping rules:
- `content/docs/en/realtime-media/rtm/index.md` or `index.mdx` is the `Quickstart` landing page
- product-introduction and concept pages from `overview/*` remain as product-root sibling pages beside the landing page
- `get-started/*` pages may be merged into the landing page or kept as product-root sibling pages when standalone routes are justified
- `core-functionality/*` pages migrate into `build/**`
- non-API support pages from `reference/*` migrate into `reference/**`
- existing placeholders may be replaced or removed only when their real target pages are created in the same batch

Pilot deferred list:
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/reference/api.mdx`
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/reference/error-codes.mdx`
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/reference/limitations.mdx`
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/reference/troubleshooting.mdx`
- `/Users/yejiayi/Documents/Doc-Source-Private/signaling/rest-api/**`

Pilot deferred reasons:
- requires API-reference lane
- tightly coupled to REST/API-specific reference behavior
- not part of the current prose-migration pilot
