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
- `Overview`
- `Build`
- `Reference`

The product root `index.md` or `index.mdx` is the `Product overview` landing page. The product `Quickstart` is a product-root sibling page beside the landing page, not the landing page itself.

The migration must preserve this target sidebar contract while reclassifying legacy content into:
- product-root sibling pages
- `build/**`
- `reference/**`
- `meta.json`

The agent must not invent additional top-level product sections unless the target repository already uses them for that product or the task explicitly requires them.

The sidebar contract constrains left-navigation sections, not the full set of product-root sibling pages. Product-root sibling pages that remain outside `build/**` and `reference/**` may still be promoted when they fit the task scope and do not require adding a new top-level sidebar section.

## 4. Global Source Classification

Before editing files, classify each legacy source page into one of these buckets:
- product overview or conceptual page
- quickstart or onboarding page
- build or capability page
- non-API reference or support page
- API reference or generated API page
- AI tooling or ecosystem page
- shared-content dependency
- unsupported migration case

This classification controls the target route and whether the content is migrated now or deferred.

## 5. Global Mapping Rules

### 5.1 Product overview landing page

Use the product root `index.md` or `index.mdx` for the product overview landing page.

Typical legacy source:
- product overview

The product overview page becomes the landing page for the product. When the legacy source has a dedicated product-overview page, that page maps to the product-root `index.md` or `index.mdx`.

### 5.1.1 Product-root sibling pages

Use product-root sibling pages for conceptual and onboarding content that should remain directly visible beside the `Product overview` landing page.

Typical legacy sources:
- quickstart
- core concepts
- beginner guide
- conceptual introductions

These pages must live beside `index.md` or `index.mdx` under the product root instead of being merged into the landing page.

### 5.2 Quickstart

Use a product-root sibling page such as `quickstart.md` or `quickstart.mdx` for the primary onboarding or first-run path for the product.

Allowed behaviors:
- merge one or more legacy quickstart pages into a single quickstart sibling page when they form one coherent entry path
- keep additional quickstart pages as separate product-root sibling pages when they deserve standalone routes

Disallowed behaviors:
- using the landing page as a dumping ground for all conceptual or onboarding content
- forcing all quickstart pages into `build/**`
- treating landing-page placement as permission to rewrite source body structure, heading hierarchy, or prose wording

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
- AI tooling or ecosystem pages inside a product tree when the task did not explicitly request that lane

Deferred content must be listed explicitly in migration output rather than silently skipped.

## 6. Global Migration Constraints

Default to high-fidelity migration: preserve original page semantics, paragraphs, headings, code samples, and information structure as much as possible. Only make the smallest necessary compatibility adaptation when the legacy MDX, JSX, or runtime surface cannot work in the target portal.

Do not use migration as a reason to perform editorial rewrites, structural beautification, summarization, or opportunistic content compression.

For prose migration, high fidelity means source-faithful carry-over by default. After shared expansion, variable expansion, and required product-scope extraction, the expanded source page body is the authoritative content shape for migration.

### 6.0 Anti-Drift Contract

This spec is intentionally hostile to "good enough" prose rewrites.

The agent must not satisfy migration by producing a shorter, cleaner, portal-style substitute for the source page. A migrated page is valid only when the final promoted body is traceable to the expanded source page body.

The following are always disallowed unless the user explicitly requests them:
- replacing a source page with a newly written summary page
- replacing long source sections with a shorter restatement
- preserving only the "main points" of a source page
- writing a new page from source reading notes instead of from expanded source content
- generating final content from a script or template that does not ingest the actual source page body
- using build success, route success, or sidebar completeness as evidence of content fidelity

If the agent cannot yet preserve a page faithfully, the correct default is to keep solving the page in `complex-flow`, not to publish a reduced page.

The following rules are mandatory:

- Expand legacy shared-content dependencies into migrated content or into target-approved static forms.
- Do not preserve runtime dependencies on source-repo imports such as `@docs/shared/...`.
- Expand legacy variable components such as `Vg`, `Vpd`, and `Vpl` into final display text.
- Do not leave legacy JSX runtime markers in migrated content.
- Migrate legacy `PlatformWrapper` usage to target-compatible structures only when platform differentiation is required to preserve original semantics.
- Use page-level platform tabs when one logical document must preserve multiple platform variants on one route.
- Use code-block tabs only for code-example-local language or package-manager variants.
- If a shared-content dependency is a multi-product container, perform product-scope extraction before deciding whether the page is promotable, staged-only, or deferred.
- For shared prose pages that remain within current scope after expansion and product-branch pruning, the default promotion unit is the full page, not a reduced subset.
- Product-branch pruning removes only non-target-product branches; it must not be used to shrink or summarize the target product semantics.
- Unless the user explicitly asks otherwise, default to one source prose page mapping to one final prose page after compatibility adaptation.
- Preserve legacy internal links when the target page does not yet exist by treating them as deferred unresolved links.
- Preserve legacy links that point into explicitly excluded lanes by default as deferred unresolved links; these links do not by themselves block final promotion.
- Do not rewrite unresolved legacy links to a nearby but semantically different page.
- Unknown existing target content must never be overwritten; it must be recorded and left unchanged.
- A complex page must not use `deferred` as the first escape hatch merely because it is large, shared, awkward, or expensive to normalize.
- For pages that remain in current task scope, `deferred` is allowed only after the required resolution attempts defined by this spec have been performed and recorded.
- The default response to complexity is mandatory resolution work, not simplification.

### 6.0.1 Target MDX Compatibility Contract

Source-faithful migration is constrained by the target repo's actual MDX runtime.

The agent must normalize final content into a closed compatibility subset rather than assuming any MDX syntax that "looks reasonable" will compile or prerender.

Minimum required rules:
- `TabsList`, `TabsTrigger`, and `TabsContent` must appear only inside a matching `Tabs` root.
- `Accordion` must appear only inside `Accordions`.
- Do not place `Accordions`, `Tabs`, or other block MDX components inside Markdown list items unless the target repo already demonstrates that exact nesting pattern.
- Do not rely on GitHub-style heading-id syntax such as `## Title {#id}` unless the target repo has already proven that syntax is accepted in the current content pipeline.
- Prefer plain Markdown headings over custom heading-id syntax when stable fragment preservation is not strictly required.
- Raw HTML inside Markdown tables is disallowed unless the target repo already uses and successfully builds the same pattern.
- In prose and table cells, literal `<`, `>`, and `<=` style comparison text must be escaped or wrapped in code spans when needed to avoid MDX expression parsing.
- Code fences may contain raw `<...>` text freely; code-fence contents must not be treated as page-fatal syntax by themselves.

When a candidate normalization would produce syntactically ambiguous MDX, the agent must choose the simpler target-compatible form even if that means dropping a non-essential presentational wrapper.

### 6.0.2 Platform-Variant Migration Contract

When a source page contains multiple platform variants, migration must preserve them as target-compatible page-level platform content rather than flattening them into shared prose.

Mandatory rules:
- Normalize legacy `PlatformWrapper` or equivalent source platform gating into target-compatible page-level platform structures.
- Treat a contiguous run of platform-scoped content at one logical location in the page as one platform group.
- Treat any shared heading, paragraph, admonition, image, table, list, or equivalent non-platform content as a group boundary that terminates the current platform group before the next one begins.
- A platform group may contain one variant or multiple variants. Single-platform groups are valid and must not be treated as migration failure.
- A single-platform group must remain platform-scoped in the normalized page body, but it must not force a visible one-tab switcher by itself.
- The same platform key may appear more than once on one final page only when each occurrence belongs to a different platform group separated by shared content.
- Duplicate platform keys inside one platform group are invalid and must be resolved during normalization rather than deferred to runtime.
- When two adjacent platform runs would otherwise merge incorrectly, insert or preserve the minimum faithful shared separator needed to keep the groups distinct; do not delete platform-local content merely to satisfy grouping constraints.
- Use page-level platform tabs only for page-body platform variants that share one route and one document shell.
- Use code-block tabs only for code-example-local language, SDK-language, version, or package-manager variants. Do not promote code-example-local tabbing into page-level platform groups.
- Preserve shared platform content for multiple targets, such as Apple-shared prose for iOS and macOS, only when the source semantics are actually shared; do not duplicate or fork such prose without need.
- If platform-local content exists in multiple source-controlled files but represents one logical page, merge it into one final route with page-level platform grouping unless a product-specific rule explicitly requires separate routes.

Required normalization decisions to record or make explicit during complex-flow:
- which source wrapper or syntax established each platform boundary
- which shared segments split platform groups
- whether a group is multi-platform or single-platform
- whether any repeated platform key was resolved by splitting groups rather than deleting content
- whether any platform-scoped content was converted into shared prose, and the exact compatibility reason if so

### 6.5 Excluded-Lane Link Contract

Some migration tasks intentionally exclude one or more target lanes, such as REST API, generated API, or AI tooling surfaces.

When a promotable prose page contains links into an explicitly excluded lane, the default behavior is:
- preserve the source link target as-is when possible
- classify the link as a `deferred unresolved link` or `excluded-lane dependency`
- allow final promotion if the page otherwise passes compatibility adaptation and page-level verification

Allowed behaviors:
- preserve the original excluded-lane link
- replace the link with semantically equivalent target routing only when that exact target already exists
- record the dependency in the blocker or migration report without blocking the containing page

Disallowed behaviors unless explicitly requested:
- rewriting an excluded-lane link to a nearby but semantically different non-API page
- summarizing away the surrounding operational prose just to avoid the excluded-lane link
- treating excluded-lane dependencies as batch-fatal

An excluded-lane dependency becomes page-fatal only when:
- the page cannot preserve its core meaning without that linked lane being present
- the page still contains legacy runtime syntax or unresolved variable syntax
- the page fails another independent page-level verification rule

### 6.5.1 Link Rewrite Decision Matrix

When rewriting links during migration, use the following default matrix:

- In-scope source page -> exact promoted target exists:
  rewrite to the exact promoted target route.
- In-scope source page -> target not yet promoted in the current batch:
  preserve the source link target or classify it as deferred unresolved.
- Explicitly excluded lane -> exact equivalent target already exists:
  rewrite only to that exact equivalent target.
- Explicitly excluded lane -> no exact equivalent target exists:
  preserve the original target and record an excluded-lane dependency.
- Shared reference anchor -> anchor preserved exactly:
  rewrite to the promoted target plus the preserved anchor.
- Shared reference anchor -> anchor not preserved exactly:
  do not invent a nearby anchor; preserve the original link target or record it as deferred unresolved.

Disallowed behaviors:
- rewriting a source link to a nearby "good enough" target
- rewriting a REST/API source link to a prose page merely because the API lane is excluded
- dropping a source link silently because the target is inconvenient

### 6.6 AI Tooling Page Contract

Some source product trees contain pages that document AI tooling, MCP, skills, agents, or broader ecosystem workflows rather than the product capability itself.

Unless the task explicitly includes that lane, these pages are out of scope for product prose migration by default.

Default behavior:
- classify the page as `AI tooling or ecosystem page`
- record it as deferred content
- do not force the page into `Quickstart`, `Build`, `Reference`, or a product-root sibling route by agent discretion alone

Allowed exception:
- if the user explicitly includes these pages in scope, the task may define a product-specific mapping rule

### 6.1 Source-Faithful Prose Rules

Unless an explicit compatibility blocker prevents it, the migrated final page must preserve the expanded source page body with only the minimum necessary changes for:
- frontmatter normalization
- route placement
- shared-content expansion
- variable expansion
- target-supported syntax conversion
- asset path normalization
- semantically identical internal link rewriting when the correct target route already exists

The following are disallowed unless the user explicitly requests them:
- rewriting source prose into a newly authored summary
- replacing source paragraphs with portal-style explanatory prose
- adding synthetic intro sections, outro sections, or "next steps" prose not present in the source body
- replacing a source sentence with a broader conceptual explanation
- collapsing prose into bullets for readability alone
- replacing source operational language with cleaner or more generic wording

If the source content feels sparse, awkward, or portal-inconsistent, the default action is still source-faithful migration rather than rewrite.

Landing-page placement is a route-shell adaptation only. When a source page maps to `index.md` or `index.mdx`, that changes the final filename and route role, but it does not create an exception for rewriting the page body.

### 6.2 Heading Fidelity Rules

The expanded source heading tree is authoritative by default.

Mandatory rules:
- Preserve source heading text unless variable expansion or a documented compatibility adaptation requires a literal change.
- Preserve source heading levels unless the target runtime cannot safely express the same structure.
- Route placement into `index.md` or `index.mdx`, `build/**`, or `reference/**` does not justify changing in-page heading wording or heading levels.
- Preserve intermediate headings even when the route path already implies the topic.

The following are disallowed unless a documented compatibility blocker requires them:
- renaming headings to better match target style
- promoting or demoting headings to make the page read more cleanly
- splitting one source section into several new headings
- removing a source heading because nearby prose appears sufficient
- flattening or re-rooting headings because the page became the product landing page

### 6.3 No-Added-Prose Rule

Migration must not invent new explanatory body prose beyond the minimum connective text required by a compatibility adaptation.

Usually-disallowed additions include:
- new opening summaries
- new "what this page covers" prose
- new recommendation or best-practice commentary that is not in the source
- new cross-links framed as narrative body text
- new closing sections such as "Next steps" or "Related pages" when these were not present in the source body

If a migration run adds prose that is not traceable to the expanded source page, that is a migration defect unless the user explicitly requested the addition.

### 6.7 No-Summary Promotion Rule

The agent must never promote a page whose body is materially shorter because the source was summarized, compressed, merged, collapsed, or selectively restated for readability.

The following are summary-style defects and must be treated as source-fidelity failures:
- replacing a source section with one or two synthetic paragraphs
- collapsing multiple source sections into one generic section
- removing examples, tables, warnings, or procedure steps because they feel repetitive
- replacing detailed operational prose with higher-level explanation
- keeping only representative examples from a longer source page without an explicit extraction rule

If a page legitimately needs scope extraction, the extraction must follow product-scope or task-scope rules and preserve the full remaining target-product semantics. Extraction is not permission to summarize.

### 6.8 Mandatory Resolution Attempt Contract

For in-scope pages that hit `complex-page` triggers, the agent must attempt to resolve the page before considering `deferred`.

Minimum required attempt sequence:
1. classify the page and target route
2. expand shared dependencies
3. expand variables
4. collect and sync assets
5. normalize unsupported syntax
6. perform product-scope extraction when required
7. stage the normalized output
8. run page-level verification against the expanded source

Only after the above attempts are performed and recorded may the page become:
- `remediated-and-promoted`
- `staged-only`
- `deferred-with-report`

The blocker report must record which of the required attempts were completed and exactly what still prevented promotion.

The following are not valid reasons, by themselves, to skip the required attempts:
- the page is long
- the page is shared
- the page uses many imports
- the page would take too long to normalize manually
- the page already has a placeholder target
- the agent can quickly write a cleaner substitute

### 6.4 Frontmatter Fidelity Rules

Source frontmatter is authoritative by default for migrated prose pages.

Mandatory rules:
- Preserve source `title` by default.
- Preserve source `description` by default.
- Only remove source frontmatter fields that are clearly legacy-runtime-specific, build-injected, or unsupported by the target content model.
- If a source wrapper page contains only frontmatter plus a shared-content import, treat that wrapper frontmatter as the page-level frontmatter source of truth unless an explicit compatibility blocker prevents it.

Allowed frontmatter adaptation:
- quote-style normalization
- whitespace normalization
- removal of unsupported legacy metadata keys
- variable expansion inside supported fields
- the smallest text normalization required when a source `description` contains unresolved runtime syntax that cannot be preserved verbatim

Disallowed frontmatter adaptation unless explicitly requested:
- rewriting a source `title` to better match target IA wording
- rewriting a source `description` to be more portal-native
- replacing a specific source title with the product name just because the page became `index.mdx`
- inventing a new description when a usable source description already exists

### 6.4.1 Frontmatter Normalization Contract

Frontmatter normalization is allowed only to the extent required by target compatibility.

Required rules:
- Preserve source `title` text exactly unless a documented compatibility blocker requires change.
- Preserve source `description` text exactly unless a documented compatibility blocker requires change.
- Legacy YAML block scalars such as `description: >` must be normalized into a single final display string without changing wording.
- Remove legacy build-only or runtime-only fields such as `sidebar_position`, `type`, `platform_selector`, `last_update`, and equivalent source-only metadata unless the target repo explicitly uses them in authored content.
- Final promoted frontmatter must contain only target-supported keys.
- If a source page lacks a usable `description`, omit it rather than inventing one.

Disallowed behaviors:
- shortening a long source description for style reasons alone
- synthesizing a new marketing-style description when the source description is sparse but valid
- carrying legacy operational metadata into final promoted pages just because it parses

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
- source `title` changed without a documented compatibility reason
- source `description` changed without a documented compatibility reason
- expanded source heading text changed without a documented compatibility reason
- expanded source heading level changed without a documented compatibility reason
- a prose section was added that does not exist in the expanded source page
- a prose section from the expanded source page was removed without a documented extraction or compatibility reason
- source prose was paraphrased or rewritten into portal-style explanatory prose instead of being carried over
- a source link was replaced with a semantically different nearby target link instead of being preserved or marked deferred unresolved
- the final page is a summary, digest, compressed rewrite, or hand-authored substitute for the expanded source page
- the final page was generated from a migration helper that did not ingest and preserve the expanded source page body
- a complex page was promoted without a staging artifact
- a complex page was promoted without recorded page-level fidelity evaluation against the expanded source page

Compatibility residue inside fenced code blocks does not count as legacy runtime syntax for page-fatal evaluation.

For shared multi-product pages, page-fatal evaluation must happen after product-scope extraction. A removable non-target product branch is not itself a page-fatal condition.

When any of the source-fidelity page-fatal triggers above is discovered before promotion, the page must be repaired before it can enter the final docs tree.

When any of the source-fidelity page-fatal triggers above is discovered after promotion, the page is considered polluted final content and must enter the remediation loop immediately. Recording the defect is not sufficient by itself.

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
- source depends on remote-hosted legacy images that may require availability classification or reporting

Target collision triggers:
- intended target file already exists and is not an obvious placeholder
- intended target landing page already exists with seed or mixed authored content that may require merge review instead of direct overwrite

Shared reference triggers:
- source page is a broad shared glossary, security, policy, or similar reference page whose semantic scope exceeds the target product
- source page is a multi-product shared container whose branches are selected by `ProductWrapper` or equivalent product gating

Shared container detection must include these common source forms, not just the quoted-string form:
- `ProductWrapper product="a,b"`
- `ProductWrapper notAllowed="a,b"`
- `ProductWrapper product={["a","b"]}`
- `ProductWrapper notAllowed={["a","b"]}`
- equivalent whitespace or closing-tag variants such as `</ProductWrapper >`

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
4. extract
5. normalize
6. stage
7. page-verify
8. promote
9. batch-verify
10. report

The order is mandatory.

The `extract` step is mandatory whenever the page hits a target collision trigger or shared reference trigger, even if no new compatibility syntax needs to be normalized.

Complex-flow has an additional hard requirement:
- the agent must treat promotion as forbidden until staging and page-fidelity evidence exist

Complex-flow must not be short-circuited into:
- direct hand-authored final-page reconstruction
- direct final-page summarization
- "temporary" reduced-content promotion
- promotion justified only by successful build output

### 8.3 Target collision resolution

When the intended target path already exists, the agent must classify the existing file into one of these buckets before deciding whether final promotion is allowed:

- `placeholder`
- `navigation metadata`
- `migration-seed content`
- `authoritative hand-authored content`
- `mixed existing content`

Rules:
- `placeholder` may be replaced in the same batch when the real page is created.
- `migration-seed content` may be replaced or merged when the migrated page preserves the same topic with materially higher source coverage.
- `mixed existing content` must not be overwritten directly; it requires merge review or staged-only output.
- `authoritative hand-authored content` must not be overwritten without an explicit rule or user decision.

The agent must not collapse `migration-seed content` into `unknown existing content`.

### 8.4 Product-scope extraction

Product-scope extraction is a mandatory sub-flow for shared container pages.

Minimum extraction responsibilities:
1. expand shared dependencies far enough to expose product-conditional branches
2. remove branches that do not apply to the target product
3. keep all branches, examples, assets, headings, and prose that are required to preserve the target product semantics in full
4. re-evaluate complexity and page-fatal conditions on the extracted result rather than on the pre-extraction shared bundle

Allowed outcomes after extraction:
- one source page promotes to one final page
- one source page promotes to multiple final pages when the extracted topics remain semantically separate
- one source page remains staged-only or deferred if the extracted result still fails page-level verification

### 8.5 Shared reference narrowing

Some shared reference sources are wider than a single product route should carry. Typical examples include:
- glossary
- security
- policy
- infrastructure overview
- shared notification-center references

By default, these pages still promote as full pages when they remain prose, pass compatibility adaptation, and pass page-level verification.

Allowed behaviors:
- promote the full shared reference page under the target product route after compatibility adaptation
- prune non-target-product branches from a product-gated shared container, then promote the full remaining page
- keep one source page mapped to one final page even when the page remains broad or cross-product in scope

Disallowed behaviors unless explicitly requested by the user or by a product-specific rule:
- shrinking a shared prose page into a product-only subset because the page feels too broad
- replacing a full shared prose page with a summary page plus externalized canonical-reference linking
- splitting a single source prose page into multiple final pages purely to reduce size or widen perceived IA cleanliness

Breadth alone is not a blocker. A broad shared prose page may be deferred only when, after compatibility adaptation and any required product-branch pruning, it still hits a page-fatal trigger or falls outside the stated task scope.

### 8.6 Shared Reference Promotion Contract

Shared reference pages such as billing, firewall, glossary, security, status, policy, or similar cross-product prose may promote directly into the current product `reference/**` area when they satisfy compatibility and verification requirements.

Default behavior:
- expand the shared source
- extract non-target-product branches only when the source is explicitly product-gated
- preserve the full remaining shared prose page
- promote it as a `shared-derived promoted page` when it passes page-level verification

Allowed behaviors:
- promote the full shared prose page under the current product route
- record in the report that the page is shared-derived
- keep broad cross-product explanatory scope when the page still serves as valid product reference material

Disallowed behaviors unless explicitly requested:
- deferring a shared reference page only because it is broad
- shrinking a valid shared reference page into a product-only summary
- forcing a shared reference page into a separate global reference lane when the task asked for product migration

## 9. Required Responsibilities

The spec must distinguish tasks that must be scripted from those that may remain agent-authored.

### 9.1 Must be scripted

- shared recursion expansion
- variable expansion
- machine-detectable trigger scanning
- product-scope extraction from multi-product shared containers
- asset reference collection
- asset existence verification
- shared asset sync into `public/images/**`
- remote image classification
- structural normalization of legacy wrappers, tabs, callouts, and details blocks
- target collision classification scaffolding
- frontmatter sanitation checks
- staging generation
- blocker report scaffolding
- source-to-staging content trace collection
- source-to-final fidelity check scaffolding
- promotion gating based on evidence presence

### 9.2 May be agent-authored

- final IA bucket decisions
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

Recommended staging location:
- `docs/superpowers/staging/YYYY-MM-DD-<product>/`

The exact filename scheme may vary, but the staging artifact must be durable enough for review and re-entry.

### 10.1 Promotion Gate

For a `complex-flow` page, the staging artifact is not optional evidence; it is the minimum promotion gate.

The agent must not promote a complex page unless all of the following exist:
- expanded source input
- normalized staging artifact
- recorded page-level verification result
- recorded target-collision decision when applicable

If any item above is missing, final promotion is prohibited.

Build success, MDX parse success, or visual plausibility are not substitutes for this gate.

### 10.2 Final-Tree Protection

The final docs tree is a protected surface.

The agent must not place provisional, partial, compressed, placeholder-like, or review-pending content into `content/docs/**` merely to preserve momentum.

Allowed content states in the final tree:
- fully verified promoted page
- pre-existing untouched page

Disallowed content states in the final tree:
- summary substitute
- reduced-content temporary page
- partially normalized page awaiting later expansion
- page known to violate source-fidelity rules

## 11. Page-Level Precheck And Verification

Every page must pass page-level precheck before final promotion.

### 11.1 Source-to-final fidelity checklist

Every migrated prose page must answer the following checks at page level against the expanded source page body:

- Is the source wrapper `title` preserved?
- Is the source wrapper `description` preserved?
- Is the expanded source lead prose preserved without summary-style rewrite?
- Are expanded source headings preserved with the same text?
- Are expanded source headings preserved with the same heading levels?
- Has any prose section been added that does not exist in the expanded source page?
- Has any prose section from the expanded source page been removed?
- Has any source prose been paraphrased into portal-style explanatory prose instead of being carried over?
- Have any source links been replaced with a semantically different nearby target link instead of being preserved or marked deferred unresolved?
- If any answer above is `no`, is the exact reason recorded as a compatibility adaptation, extraction decision, or blocker?
- Is the final page demonstrably a carried-over transformation of the expanded source page rather than a newly authored summary?
- Is the final page free of any "temporary simplified migration" reasoning or content shortcuts?

This checklist is mandatory for both `simple-flow` and `complex-flow` pages.

Simple-flow page precheck checklist:
- frontmatter parses
- source `title` is preserved unless a recorded compatibility reason exists
- source `description` is preserved unless a recorded compatibility reason exists
- no legacy runtime residue remains
- no bare angle-bracket placeholders remain in prose
- no unfenced XML, HTML, storyboard, or config samples remain in prose
- internal links are classified as resolved or deferred unresolved links
- image references are classified as local verified assets, remote-hosted assets, or unverified retained assets
- no page-fatal trigger remains
- source heading text and heading levels are preserved unless a recorded compatibility reason exists
- no synthetic explanatory prose has been added beyond allowed compatibility glue
- target-compatible MDX structure is satisfied for any tabs, accordions, or other block MDX components that remain after normalization

Complex-flow page verification checklist includes all of the above, plus:
- shared expansion is complete
- product-scope extraction is complete when required
- structural normalization is complete
- staging artifact exists
- normalized staging output itself contains no page-fatal trigger
- target collision resolution state is recorded when a final target path already existed before the batch
- a source-to-staging fidelity check confirms that source prose was not silently summarized, paraphrased, or structurally rewritten
- the page-level fidelity checklist has been explicitly evaluated against the expanded source page
- the final page body is derived from the staging artifact, not re-authored separately
- the blocker report records unresolved issues when promotion is denied
- any surviving MDX component nesting has been validated against the target compatibility contract rather than inferred from source syntax alone

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

This contract applies only to repository-hosted asset paths such as `/images/**`.

### 12.1 Remote Image Tolerance Contract

Remote-hosted image URLs such as `https://...` are allowed to remain in final promoted pages by default.

Default behavior:
- preserve the original remote image URL
- do not require downloading or localizing the asset
- do not treat a missing local mirror as a page-fatal trigger
- record the page as using `remote-hosted legacy asset` or `image-not-verified` when verification was not performed

Repository-hosted image paths such as `/images/**` may remain in final promoted pages even when the file is currently missing, unless the task explicitly requires image availability verification or localization.

Default behavior for missing repository-hosted images:
- preserve the original image syntax
- do not block final promotion for image absence alone
- record the page as `local-missing-image-kept` or equivalent report status

An image problem becomes blocking only when:
- the image syntax itself breaks MDX or page parsing
- the task explicitly requires image verification, localization, or visual completeness
- the page depends on a broken image adaptation that introduced another page-fatal condition

## 13. Existing Target Content Contract

Before writing target files, the agent must inspect the target product directory and classify existing files as:
- placeholder page
- navigation metadata
- migration-seed content
- authoritative hand-authored content
- mixed existing content
- unknown existing content

Default assumption:
- most product directories primarily contain placeholders

Rules:
- placeholders may be replaced or removed only when the corresponding real target page is created in the same batch
- navigation metadata may be updated according to the IA contract
- migration-seed content may be replaced or merged when the migrated source clearly supersedes it
- authoritative hand-authored content must not be overwritten
- mixed existing content must not be overwritten directly; it must be staged for merge review or bypassed
- unknown existing content must not be overwritten
- unknown existing content must be recorded and bypassed

Unknown existing content is not fatal for the batch; it must be recorded and left unchanged.

### 13.1 Existing Content Classification Guidance

Use the following defaults when classifying existing target files:

- `placeholder page`:
  obviously generic filler text, explicit placeholder wording, or empty shell content.
- `migration-seed content`:
  short starter content that appears topic-relevant but materially under-covers the source page and is not clearly authoritative.
- `authoritative hand-authored content`:
  substantial topic coverage, repo-native wording, or signs of deliberate maintenance beyond migration scaffolding.
- `mixed existing content`:
  partial migrated content mixed with hand-authored edits or uncertain manual augmentation.
- `unknown existing content`:
  content that cannot be safely classified from local evidence alone.

The agent must not classify a target file as `placeholder` merely because it is short, and must not classify a target file as `migration-seed content` merely because replacing it would be convenient.

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
- completed mandatory resolution attempts
- why final promotion was blocked
- next missing rule, tool, or compatibility contract

When a page promotes successfully while retaining known soft defects or deferred dependencies, the migration summary or report should also record them using non-blocking statuses such as:
- `excluded-lane-dependency-kept`
- `shared-derived promoted page`
- `remote-image-kept`
- `local-missing-image-kept`
- `image-not-verified`

## 15. Pollution Remediation Contract

If a broken page has already entered the final docs tree, the agent must not stop at recording the problem.

It must enter a remediation loop:
1. identify the polluted page
2. prevent further propagation into navigation or adjacent pages
3. repair the page or remove it from final routing
4. rerun page-level verification
5. update blocker reporting with remediation status

“Broken final page left in tree” is never an acceptable stable state.

This includes pages that are syntactically valid and build successfully but violate source-fidelity rules. A compressed rewrite in the final tree is pollution even when the app builds.

## 16. Batch Completion Rules

There is no batch-fatal concept in this spec.

The batch should continue migrating safe pages even if some pages become deferred or page-fatal.

A migration batch succeeds when:
- all safely promotable pages are promoted
- all page-fatal pages are kept out of the final docs tree or remediated
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
- deferred items are listed explicitly
- shared image assets required by promoted pages are present
- final promoted prose pages remain source-faithful after required expansion and compatibility adaptation
- final promoted heading text and heading hierarchy remain source-faithful unless a documented compatibility exception exists
- every promoted complex page has staging evidence and recorded page-level fidelity evidence
- no promoted page is a summary substitute for an in-scope source page

### 18.0.1 Verification Layering

Verification results must be reported in layers:

- `page-local verification`:
  syntax, fidelity, image handling, and target-path correctness for the migrated pages themselves.
- `content-pipeline verification`:
  MDX/content build or prerender failures caused by migrated content.
- `repo-global verification`:
  failures in broader app code, routing, or unrelated docs surfaces.
- `pre-existing unrelated failure`:
  a repo-global failure that local evidence shows was not introduced by the current migration batch.

If `bun run types:check` or `bun run build` fails for reasons unrelated to the migrated pages, the batch report must say so explicitly with file paths and failing commands. The agent must still fix any migrated-page failures discovered before attributing the remaining failure to unrelated repo state.

## 18.1 Non-Acceptance Conditions

The batch must be considered failed if any of the following occurred, even if build verification succeeded:
- an in-scope complex page was promoted without staging evidence
- an in-scope complex page was promoted as a simplified rewrite
- the final docs tree contains a page known to be materially shorter because of summarization rather than allowed extraction
- `deferred` was used before the mandatory resolution attempt sequence was completed and recorded
- a migration helper or script generated final content without ingesting the actual expanded source page body

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
- `Overview`
- `Build`
- `Reference`

Pilot mapping rules:
- `content/docs/en/realtime-media/rtm/index.md` or `index.mdx` is the `Product overview` landing page
- product-introduction and concept pages from `overview/*` map to the product-root `index.md` or `index.mdx` landing page
- `get-started/*` pages map to a `quickstart` product-root sibling page beside the landing page, or to additional product-root sibling pages when standalone routes are justified
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
