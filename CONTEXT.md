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
