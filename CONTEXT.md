# Docs Portal Context

This context defines the project language for the Shengwang docs portal migration and rendering pipeline.

## Language

**Content staging**:
The repository-owned staging layer that holds normalized documentation inputs before the docs website renders them.
_Avoid_: source dump, public assets

**OpenAPI source**:
An OpenAPI YAML or JSON file maintained as structured API reference input under `content/openapi/**`.
_Avoid_: OpenAPI page, generated Markdown, public YAML

**OpenAPI endpoint page**:
A canonical endpoint reference page generated from an **OpenAPI source** operation, keyed by `operationId`.
_Avoid_: MDX endpoint page, generated MDX shadow

**MDX-authored page**:
A canonical documentation page authored under `content/docs/**` and compiled by Fumadocs MDX.
_Avoid_: OpenAPI endpoint page

**High-fidelity migration**:
A content-porting mode where a legacy documentation page is carried into the rebuilt docs site with the smallest possible set of changes: route placement, frontmatter normalization, asset and link rewriting, and the minimum compatibility edits required by the target MDX/runtime surface.
_Avoid_: prose rewrite, structural simplification, summary-first replacement

**Compatibility adaptation**:
The smallest technical change required when a legacy page cannot be carried over verbatim because the rebuilt docs site does not support the same MDX syntax, wrapper components, globals, or rendering behavior.
_Avoid_: design rewrite, opportunistic cleanup, editorial modernization, aesthetic simplification

**Migration-seed content**:
Existing target-side content that was created as a starter, placeholder-adjacent summary, or IA scaffold and may be replaced or merged when a migrated page provides materially higher source coverage for the same topic.
_Avoid_: authoritative hand-authored content, unknown existing content

**Page-level platform tabs**:
A platform switcher rendered directly under the page header area and above the main body content, used when one migrated document contains multiple platform variants that should share a single route and a single page shell.
_Avoid_: deleting platform content, inline prose flattening of all variants

**Code-block tabs**:
A code-sample-local tab set used only for language or package-manager variants inside a single code example block, not for switching the page's primary platform variant.
_Avoid_: page-level platform switching, unrelated prose switching

**Variable expansion**:
The mandatory resolution of legacy variable components such as `Vg`, `Vpd`, and `Vpl` into their final display text by reading the source variable maps and recursively expanding references until plain text is reached.
_Avoid_: guessing, leaving JSX variable tags in output, partial expansion

**Deferred unresolved link**:
A legacy internal docs link that is preserved in migrated content because its original target has not yet been migrated and there is no equivalent target route in the current pilot scope.
_Avoid_: opportunistic target substitution, silent deletion, semantic rewrite

**Migration execution protocol**:
A mandatory multi-stage migration workflow that separates audit, scripted normalization, staging review, final route placement, and verification, instead of allowing one-step direct writes from legacy source into `content/docs/**`.
_Avoid_: ad hoc direct migration, one-shot page rewrite

**Normalized staging file**:
An intermediate Markdown or MDX artifact produced after legacy runtime constructs, variables, shared imports, and incompatible wrappers have been normalized, but before the page is committed to its final target IA path.
_Avoid_: final page, legacy source file, scratch notes

**Migration blocker report**:
A per-batch Markdown report that records every page or fragment that could not be migrated safely, including source path, intended target path, blocker type, attempted adaptation, and deferral reason.
_Avoid_: silent skip, cumulative junk log, commit message note

**Hard-stop signal**:
A predefined migration failure condition that requires the agent to stop writing final docs pages and switch to staging or blocker reporting.
_Avoid_: best-effort continuation, subjective discomfort

**Page-fatal trigger**:
A fatal migration condition scoped to one page, meaning that page must not be written into the final docs tree until remediated, while the rest of the batch may continue.
_Avoid_: batch-wide stop, silent continuation of a broken page

**Complex-page trigger**:
A machine-detectable migration risk signal, such as shared-expansion depth, runtime wrapper residue, tabs, raw XML/HTML examples, or shared image references, used to decide whether a page must enter the complex-page workflow.
_Avoid_: intuition, page vibe, undocumented exceptions

**Complex-page workflow**:
The required migration path for pages that hit any **Complex-page trigger**, including scripted normalization, staging review, page-level verification, and possible blocker reporting before any final route write.
_Avoid_: direct final write, best-effort port

**Target-collision resolution**:
The required classification and decision step when the intended final target path already exists, distinguishing placeholder, migration-seed, mixed, authoritative, and unknown content before overwrite, merge, or bypass decisions are made.
_Avoid_: treating every non-placeholder page as untouchable unknown content

**Shared-bundle container page**:
A legacy shared page whose body contains multiple product branches, usually gated by `ProductWrapper` or equivalent conditions, and which must be reduced to the target product scope before final migration decisions are made.
_Avoid_: one-shot full-page promotion, raw multi-product expansion into a product-local route

**Product-scope extraction**:
The mandatory removal of non-target-product branches, assets, and examples from a **Shared-bundle container page** after expansion and before final normalization or page-fatal evaluation.
_Avoid_: evaluating page-fatal conditions against pre-extraction shared output

**Reference narrowing**:
An exceptional migration strategy, not the default, where a broad shared reference page is reduced below full-page fidelity only because an explicit user instruction or product-specific rule requires it.
_Avoid_: using narrowing as the default response to broad shared prose pages

**Product-relevant semantic coverage**:
The minimum set of concepts, warnings, examples, definitions, and operational instructions from a legacy page that must survive in the target product route for the migration to still count as high-fidelity for that product.
_Avoid_: full shared-page coverage as a hard requirement, summary-only replacement

**Page-level verification**:
A migration gate that checks an individual normalized page before it is promoted into the final docs tree.
_Avoid_: batch-only verification, post-merge discovery

**Batch-level verification**:
A migration gate that checks the full migration batch after final pages, navigation files, assets, and blocker reporting have been produced.
_Avoid_: single-page success as completion proof

**Unsupported migration case**:
A legacy content shape that the rebuilt docs site has been shown unable to carry after trying the existing MDX/runtime surface, including page-level platform tabs, code-block tabs, variable expansion, and shared-content expansion.
_Avoid_: aesthetic objections, file-length objections, style-only objections

**OpenAPI endpoint registry**:
A docs-portal consumption layer that maps **OpenAPI source** operations to canonical page routes without turning them into Fumadocs MDX source files.
_Avoid_: Fumadocs source fork, generated MDX page source

**Canonical endpoint route**:
The only public docs route for an **OpenAPI endpoint page** in the rebuilt docs site.
_Avoid_: placeholder route, compatibility route, operationId route

**Bilingual IA skeleton**:
The matching English and Chinese docs tree for product areas, container pages, and navigation metadata.
_Avoid_: locale-specific placeholder tree

**Static API reference**:
A read-only endpoint reference that explains request and response contracts without executing API calls.
_Avoid_: Try It, API explorer, request console

**Fumadocs version gate**:
An isolated compatibility checkpoint that upgrades Fumadocs packages before OpenAPI rendering work continues.
_Avoid_: incidental dependency churn, renderer implementation step

**Locale-neutral OpenAPI source**:
A single OpenAPI source consumed by multiple locale routes until locale-specific OpenAPI sources are explicitly introduced.
_Avoid_: English shadow source, implicit translation source

**Override contract**:
A deferred extension point for supplemental endpoint content keyed by `operationId`.
_Avoid_: first-version renderer feature, endpoint shadow content

**Endpoint route registry**:
A single route map that derives canonical URLs, sidebar entries, locale links, llms entries, and prerender paths for OpenAPI endpoint pages.
_Avoid_: case-by-case route lists, hand-maintained prerender pages

**Route leaf**:
The human-chosen final URL segment for an OpenAPI endpoint, mapped from `operationId`.
_Avoid_: path-derived slug, duplicated slug config

**OpenAPI search document**:
A search-index document derived from an OpenAPI endpoint page rather than an MDX-authored page.
_Avoid_: unindexed endpoint page, MDX shadow for search

**Schema tree**:
A recursive read-only rendering of OpenAPI schema fields for nested request and response contracts.
_Avoid_: first-level-only table, unbounded flat table

**Published OpenAPI asset**:
The build-produced public YAML/JSON file served under `/openapi/**`.
_Avoid_: source asset, committed public copy

**OpenAPI lane acceptance gate**:
The full verification boundary for OpenAPI endpoint pages across build output, public YAML, rendered docs, llms exports, search, and browser layout.
_Avoid_: types-only verification, unit-test-only completion

## Relationships

- **Content staging** contains both **MDX-authored pages** and **OpenAPI sources**.
- A **High-fidelity migration** should produce an **MDX-authored page** whose content remains recognizably the same page as the legacy source.
- A **Compatibility adaptation** is allowed inside a **High-fidelity migration**, but only after direct carry-over has failed.
- **Migration-seed content** may be replaced or merged during a **High-fidelity migration** when the migrated page supersedes it with higher source coverage.
- A legacy `PlatformWrapper` should migrate to **Page-level platform tabs** when multiple platform variants must remain on one route and the platform switch belongs to the page header region rather than a single code example.
- Source-controlled platform variants may live in separate repository files, but they should still render as one page with **Page-level platform tabs** when they represent one logical document.
- A migrated page should only be recorded as an unsupported platform-variant case after the existing **Page-level platform tabs** surface has been shown insufficient for that page.
- Apple-shared legacy content such as `platform="ios, macos"` may render under both iOS and macOS page-level tabs without being split into separately rewritten prose sources.
- Shared legacy content must be expanded into the migrated target page rather than preserved as a runtime dependency on the source repo, while retaining original paragraphs, headings, code samples, and tab structure unless the target runtime has been proven unable to carry them.
- A **Shared-bundle container page** must undergo **Product-scope extraction** before page-fatal evaluation or final promotion.
- After **Product-scope extraction**, the default unit of a **High-fidelity migration** remains the full source prose page rather than a reduced subset.
- **Reference narrowing** is an exception path and must not be triggered only because a shared prose page is broad, cross-product, or larger than a preferred product-local reference page.
- If the source repo already contains the desired paragraphs, headings, code samples, tabs, or platform structure, migration should preserve them directly rather than replacing them with a cleaner static rewrite.
- A **Migration execution protocol** should produce a **Normalized staging file** before writing a final migrated docs page.
- A **Hard-stop signal** requires the migration to stop before final page output and to emit a **Migration blocker report** entry instead.
- A **Page-fatal trigger** blocks only the current page from entering the final docs tree; it must not be widened into a batch-wide stop rule.
- A **Complex-page trigger** must be derived from machine-detectable evidence in the source or normalized content, not from a subjective judgment about the page.
- The **Complex-page workflow** must run before final route output for any page that hits a **Complex-page trigger**.
- **Target-collision resolution** must run before final promotion when the intended target path already exists.
- **Page-level verification** must pass before a **Normalized staging file** is promoted into a final docs route.
- **Batch-level verification** must pass before the migration batch is considered complete.
- Legacy language tabs inside examples should migrate to **Code-block tabs**, not **Page-level platform tabs**.
- Legacy `Vg`, `Vpd`, and `Vpl` usages must undergo **Variable expansion** before migrated content is considered complete.
- A legacy internal docs link with no migrated equivalent in the current pilot should remain present as a **Deferred unresolved link** rather than being deleted or rewritten to a nearby page.
- An **Unsupported migration case** exists only when the current docs runtime has been shown unable to compile, render, or correctly express the original content semantics; style or elegance concerns do not qualify.
- An **OpenAPI source** produces one or more **OpenAPI endpoint pages**.
- An **OpenAPI endpoint page** is not an **MDX-authored page** and must not be duplicated as a full MDX shadow.
- The **OpenAPI endpoint registry** consumes **OpenAPI sources** for this docs website, but the **OpenAPI source** remains portable content data rather than docs-portal-specific page source.
- An **OpenAPI endpoint page** has exactly one **Canonical endpoint route** per locale.
- The **Bilingual IA skeleton** can contain MDX-authored container pages, but endpoint leaves under it can still be **OpenAPI endpoint pages**.
- An **OpenAPI endpoint page** is a **Static API reference** in the first implementation.
- The **Fumadocs version gate** must pass before OpenAPI renderer changes are evaluated.
- A **Locale-neutral OpenAPI source** may render into multiple locale routes without translating every schema description.
- The first OpenAPI renderer does not implement the **Override contract**; endpoint content comes only from the **OpenAPI source**.
- The **Endpoint route registry** is the only place where OpenAPI endpoint route leaves are configured.
- Each **Route leaf** is mapped from exactly one OpenAPI `operationId` and must be covered by registry tests.
- Each **OpenAPI endpoint page** should produce an **OpenAPI search document**.
- A **Static API reference** renders nested fields as a **Schema tree**, expanded by default only for shallow levels.
- A **Published OpenAPI asset** is generated from an **OpenAPI source** during build and is not committed as a second source.
- The **OpenAPI lane acceptance gate** must pass before OpenAPI rendering work is considered complete.

## Example dialogue

> **Dev:** "Should `join.md` contain the Start Agent request and response reference?"
> **Domain expert:** "No. The Start Agent reference is an **OpenAPI endpoint page** generated from `convoai.yaml`; prose pages can stay as **MDX-authored pages**."

> **Dev:** "Should we merge generated endpoint pages into the Fumadocs source object?"
> **Domain expert:** "No. Keep Fumadocs source for **MDX-authored pages** and use the **OpenAPI endpoint registry** as the docs website's consumer of portable OpenAPI data."

> **Dev:** "Should `/zh-CN/api-reference/start-agent` redirect to the rebuilt endpoint page?"
> **Domain expert:** "No. This is a rebuilt docs site, so only the **Canonical endpoint route** is part of the target IA."

> **Dev:** "Can the Chinese API reference keep its flat placeholder endpoints?"
> **Domain expert:** "No. Use the same **Bilingual IA skeleton** as English; generated endpoint leaves are supplied by the **OpenAPI endpoint registry**."

> **Dev:** "Should the endpoint page let users send live API requests?"
> **Domain expert:** "No. The first implementation is a **Static API reference**; interactive API execution is a separate product decision."

> **Dev:** "Can we upgrade Fumadocs packages while adding the renderer?"
> **Domain expert:** "Only as a separate **Fumadocs version gate** before renderer work, so compatibility failures are isolated."

> **Dev:** "Should the English endpoint page reuse old English MDX as translated schema content?"
> **Domain expert:** "No. Start from the **Locale-neutral OpenAPI source**; locale-specific OpenAPI sources or overrides can be added later."

> **Dev:** "Should the first renderer read `overrides/*.mdx` to patch endpoint pages?"
> **Domain expert:** "No. The first renderer uses only `convoai.yaml`; the **Override contract** is documented for future work."

> **Dev:** "Should prerender paths be maintained as a separate list?"
> **Domain expert:** "No. Derive prerender paths from the **Endpoint route registry** so route, sidebar, llms, and static generation stay aligned."

> **Dev:** "Can we derive endpoint slugs from OpenAPI path templates?"
> **Domain expert:** "No. Use a tested `operationId` to **Route leaf** map because URL language is part of the docs IA."

> **Dev:** "Can endpoint pages skip site search because they are generated?"
> **Domain expert:** "No. Generate **OpenAPI search documents** from the same registry and source data."

> **Dev:** "Can request bodies show only first-level fields?"
> **Domain expert:** "No. Use a **Schema tree** so deeply nested request and response contracts remain readable."

> **Dev:** "Should `public/openapi/conversational-ai/convoai.yaml` be committed?"
> **Domain expert:** "No. Commit the **OpenAPI source** under `content/openapi/**`; generate the **Published OpenAPI asset** during build."

> **Dev:** "Can we call the OpenAPI lane done after unit tests and typecheck?"
> **Domain expert:** "No. The **OpenAPI lane acceptance gate** includes static output, llms, search, public YAML, and browser layout checks."

## Flagged ambiguities

- "OpenAPI page" was used to mean both the YAML source file and the rendered endpoint documentation; resolved: use **OpenAPI source** for YAML/JSON and **OpenAPI endpoint page** for generated endpoint documentation.
- "source" was used to mean both portable content data and the Fumadocs `source` object; resolved: use **OpenAPI source** for portable YAML/JSON data and **OpenAPI endpoint registry** for docs-portal route consumption.
- "compatibility" was used to mean preserving routes inside the current rebuilt portal; resolved: current placeholder routes are not compatibility requirements and should not constrain the target IA.
- "Chinese endpoint pages" was used to mean existing flat placeholders; resolved: Chinese uses the same **Bilingual IA skeleton** as English, with endpoint leaves generated from OpenAPI.
- "OpenAPI rendering" was broad enough to include interactive explorers; resolved: first implementation means **Static API reference** only.
- "latest Fumadocs" was broad enough to hide unrelated risk; resolved: dependency upgrades are handled as a separate **Fumadocs version gate**.
- "English OpenAPI page" implied a translated schema source; resolved: first implementation uses a **Locale-neutral OpenAPI source** for both locales.
- "overrides" sounded like a first-version rendering feature; resolved: the **Override contract** is deferred and must not become endpoint shadow content.
- "explicit prerender" sounded like hand-maintained URLs; resolved: prerender paths are explicit build inputs derived from the **Endpoint route registry**.
- "route generation" sounded fully automatic from API paths; resolved: **Route leaf** values are the only manual route labels and are tested against OpenAPI `operationId` coverage.
- "generated page" sounded exempt from search; resolved: generated endpoint pages still need **OpenAPI search documents**.
- "schema table" sounded like a shallow or horizontally wide table; resolved: render nested contracts as a **Schema tree** with guarded recursion.
- "public YAML" sounded like another maintained file; resolved: `/openapi/**` is a **Published OpenAPI asset** derived at build time.
- "done" was too narrow when it meant only typecheck or unit tests; resolved: use the **OpenAPI lane acceptance gate** for completion.
