# Docs Portal Context

This context defines the project language for the Shengwang docs portal repository.

Migration behavior, migration protocol, migration acceptance rules, and migration prohibitions belong in `spec.md`, not in this glossary.

## Language

**Real-time**:
The preferred ordinary adjective for user-facing English prose when describing low-latency communication, media, events, captions, updates, or shared state. Use **Realtime** only inside official product/API names, formal navigation or category labels, and historical feature names; keep `realtime` in URLs, code identifiers, model names, endpoint paths, and protocol values.
_Avoid_: realtime as a generic prose adjective

**Deployment region**:
The build-time publication boundary for one deployed docs site. `global` publishes every locale except `zh-CN`; `cn` publishes only `zh-CN`. A deployment region controls published routes and generated site artifacts, but does not imply different branding, source repositories, product links, or asset hosts.
_Avoid_: locale, brand region, market locale

**Published locale**:
A documentation locale exposed by a particular **Deployment region**, including its public routes, static payloads, machine-readable output, sitemap entries, and search records.
_Avoid_: supported locale, repository locale

**Static prerendered page**:
A canonical documentation route whose build-produced HTML contains the page body and can hydrate into the interactive application without a runtime server.
_Avoid_: runtime SSR page, SPA shell page, crawler-only page

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

**Migration-seed content**:
Existing target-side content that was created as a starter, placeholder-adjacent summary, or IA scaffold and may be replaced or merged when a migrated page provides materially higher source coverage for the same topic.
_Avoid_: authoritative hand-authored content, unknown existing content

**Page-level platform tabs**:
A platform switcher rendered directly under the page header area and above the main body content, used when one migrated document contains multiple platform variants that should share a single route and a single page shell.
_Avoid_: deleting platform content, inline prose flattening of all variants

**Code-block tabs**:
A code-sample-local tab set used only for language or package-manager variants inside a single code example block, not for switching the page's primary platform variant.
_Avoid_: page-level platform switching, unrelated prose switching

**Platform group**:
A contiguous set of page-level platform variants that occupy the same logical position in one migrated document and should render as one platform-switchable body segment.
_Avoid_: merging separated platform segments into one group, splitting one logical group for cosmetic reasons

**Shared segment**:
Any non-platform content between platform groups that applies to all variants, such as shared headings, paragraphs, admonitions, images, tables, or lists, and therefore terminates one platform group before the next begins.
_Avoid_: treating shared prose as platform-local residue, silently absorbing shared content into an adjacent platform group

**Single-platform block**:
A valid page-level platform content block that has only one platform variant at its logical position. It should remain platform-scoped but should not force visible platform tabs by itself.
_Avoid_: treating single-platform content as migration failure, flattening it into unrelated shared prose

**Platform-run normalization**:
The migration step that converts legacy platform wrappers and adjacent platform-specific content into target-compatible page-level platform groups, preserving group boundaries, shared segments, and per-platform semantics.
_Avoid_: grouping by file order alone, deleting repeated platform-local content because it appears structurally inconvenient

**Variable expansion**:
The mandatory resolution of legacy variable components such as `Vg`, `Vpd`, and `Vpl` into their final display text by reading the source variable maps and recursively expanding references until plain text is reached.
_Avoid_: guessing, leaving JSX variable tags in output, partial expansion

**Deferred unresolved link**:
A legacy internal docs link that is preserved in migrated content because its original target has not yet been migrated and there is no equivalent target route in the current pilot scope.
_Avoid_: opportunistic target substitution, silent deletion, semantic rewrite

**Normalized staging file**:
An intermediate Markdown or MDX artifact produced after legacy runtime constructs, variables, shared imports, and incompatible wrappers have been normalized, but before the page is committed to its final target IA path.
_Avoid_: final page, legacy source file, scratch notes

**Migration blocker report**:
A per-batch Markdown report that records every page or fragment that could not be migrated safely, including source path, intended target path, blocker type, attempted adaptation, and deferral reason.
_Avoid_: silent skip, cumulative junk log, commit message note

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

### Reference navigation

**Reference overview**:
The global landing page for the Reference tab (`/api-reference`) — a hub that links to every Reference area (SDKs, API References, Recipes, FAQ). It is not a catalog of API-reference products; that depth lives on the **API reference** page and in the sidebar.
_Avoid_: API reference index, product catalog landing, SDK/REST grid page

### FAQ

**FAQ hub**:
The single FAQ landing page at `/faq` that offers category entry points and a search across all FAQ entries.
_Avoid_: FAQ catalog, FAQ overview page

**FAQ category page**:
A per-category FAQ view that lists the FAQ entries in one category with category-scoped search and product/platform filtering.
_Avoid_: catalog tab, category rail, FAQ catalog

**FAQ category**:
One of the five top-level FAQ groupings — Integration, Quality, Product, Account & billing, Other.
_Avoid_: FAQ section, FAQ tag

**FAQ entry**:
A single question shown with a one-line summary that links out to its own troubleshooting article; FAQ answers are never inlined.
_Avoid_: FAQ card, inline FAQ answer, FAQ accordion item

## Relationships

- **Content staging** contains both **MDX-authored pages** and **OpenAPI sources**.
- **Migration-seed content** may be replaced or merged during a **High-fidelity migration** when the migrated page supersedes it with higher source coverage.
- A legacy `PlatformWrapper` should migrate to **Page-level platform tabs** when multiple platform variants must remain on one route and the platform switch belongs to the page header region rather than a single code example.
- Source-controlled platform variants may live in separate repository files, but they should still render as one page with **Page-level platform tabs** when they represent one logical document.
- A split-file route-level pure platform projection may combine only the selected platform's segments from multiple source **Platform groups**, retain intervening **Shared segments**, and omit a group when that platform has no variant; this projection does not redefine or collapse the source document's group boundaries.
- A contiguous sequence of page-level platform blocks forms one **Platform group**.
- A **Shared segment** always terminates the current **Platform group** before any later platform block begins a new group.
- A **Single-platform block** is still a valid **Platform group**, but it should not render a meaningless one-tab switcher.
- The same platform may appear more than once on a page only when those occurrences belong to different **Platform groups** separated by a **Shared segment**.
- A migrated page should only be recorded as an unsupported platform-variant case after the existing **Page-level platform tabs** surface has been shown insufficient for that page.
- Apple-shared legacy content such as `platform="ios, macos"` may render under both iOS and macOS page-level tabs without being split into separately rewritten prose sources.
- Shared legacy content must be expanded into the migrated target page rather than preserved as a runtime dependency on the source repo, while retaining original paragraphs, headings, code samples, and tab structure unless the target runtime has been proven unable to carry them.
- **Platform-run normalization** must preserve platform-local semantics and group boundaries rather than collapsing all platform content into one global page-level switcher.
- A **Platform group** reached through a one-level shared `<include>` renders as **Page-level platform tabs** and is a supported shape, not an **Unsupported migration case**; shared-content expansion depth beyond one level remains a migration blocker (`spec.md:485`).
- A **Shared-bundle container page** must undergo **Product-scope extraction** before page-fatal evaluation or final promotion.
- After **Product-scope extraction**, the default unit of a **High-fidelity migration** remains the full source prose page rather than a reduced subset.
- **Reference narrowing** is an exception path and must not be triggered only because a shared prose page is broad, cross-product, or larger than a preferred product-local reference page.
- If the source repo already contains the desired paragraphs, headings, code samples, tabs, or platform structure, migration should preserve them directly rather than replacing them with a cleaner static rewrite.
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
- An **FAQ hub** links to **FAQ category pages**, one per **FAQ category**; the hub and the category pages are **MDX-authored pages**.
- A **FAQ category page** lists **FAQ entries**; each **FAQ entry** links to its own troubleshooting **MDX-authored page** and is never expanded inline.
- **FAQ entries** are trimmed out of the docs sidebar tree but remain routable; the sidebar shows only the **FAQ hub** and its **FAQ category pages**.
- The **Reference overview** links to each Reference area (SDKs, **API reference**, recipes, **FAQ hub**) and does not duplicate their contents; the per-product SDK and REST references live on the **API reference** page and the sidebar.

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
- "Server SDK" was used as a generic label for the in-portal `api-ref/server-sdk` references; resolved: this is **Voice Agents** — the named Conversational AI server SDK (TypeScript/Python/Go) for integrating Agora's Conversational AI server-side, a distinct DevX product. (Earlier called "Agora Agents"; renamed to "Voice Agents".) Avoid the generic "Server SDK" name for it.
