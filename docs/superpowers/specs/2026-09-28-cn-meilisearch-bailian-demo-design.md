# CN Meilisearch and Bailian Demo Design

## Status

Proposed. This document describes the approved direction before implementation. The implementation must be split into reviewed tasks; completing one task does not authorize starting the next task.

## Goal

Build a local, reproducible demo that improves the CN documentation search from page-level browser-side Orama search to chapter-level Meilisearch search, while preserving enough structured chapter data to support a future AI question-answering flow through Alibaba Cloud Bailian.

The demo must answer these practical questions:

1. Does chapter-level indexing make API and section queries land on the correct anchored section?
2. Does moving indexing and querying to a local Meilisearch service avoid the browser download/index-build cost of the current Orama path?
3. Can the same chapter records later be used as citations and context for an AI answer without exposing model credentials to the browser?

## Non-goals

The first demo does not:

- replace English Algolia;
- implement vector search, embeddings, RAG, or an AI chat UI;
- integrate Alibaba Cloud Bailian into the production site or expose it to public users;
- deploy to Kubernetes;
- add a permanent Search API unless direct browser-to-Meilisearch access proves insufficient;
- redesign the existing document content or navigation structure;
- claim that Meilisearch provides Chinese semantic understanding by itself.

## Repository Baseline

The CN search path currently works as follows:

```text
MDX
  -> loadDocsSearchIndex()
  -> public/__static/docs-search/zh-CN.json
  -> browser downloads the complete JSON file
  -> Orama builds an index in the browser
  -> DocsSearchDialog queries Orama
```

The main integration points are:

- `src/lib/docs-page.server.ts`: build-time document/search data loading;
- `src/lib/docs-search.ts`: search record types and generated search data access;
- `src/lib/docs-search-index.ts`: search index generation/loading boundary;
- `src/lib/search/orama-client.ts`: browser-side Orama database and query behavior;
- `src/lib/search/search-provider.ts`: provider selection;
- `src/components/docs-shell/DocsSearchDialog.tsx`: search UI, result rendering, loading and error states;
- `src/lib/search/algolia-records.server.ts`: existing section-oriented extraction logic that can inform, but should not automatically refactor, the English Algolia path;
- `Dockerfile`: current static Nginx runtime; it does not host a persistent application server.

The existing worktree contains unrelated uncommitted changes. Implementation must use an isolated worktree/branch based on the approved `CN-NEWDOC` baseline and must not overwrite those changes.

## Architecture

### Two user modes

The demo exposes two modes from the same search box:

```text
                         ┌─→ Meilisearch ─→ document search results
user → mode selection ───┤
                         └─→ Bailian LLM tool call
                                  └─→ search_docs tool
                                      └─→ Meilisearch
                                          └─→ Bailian LLM
                                              └─→ answer + citations
```

#### Normal document search

```text
user keyword
  -> CN browser search client
  -> Meilisearch
  -> section title, preview, highlight, and anchored URL
```

This mode is the direct replacement for the current CN Orama path. English Algolia remains unchanged.

#### AI question-answering mode

```text
user question
  -> AI backend / Bailian Agent
  -> LLM tool call: search_docs(query, filters)
  -> search_docs implementation
  -> Meilisearch KB index
  -> selected chapter chunks + metadata + citation URLs
  -> Bailian LLM final answer
```

The model does not receive the whole documentation corpus. It receives only the records returned by the tool. The tool boundary is deliberately explicit so retrieval filters, result limits, hidden-content rules, and citations remain under application control.

### Local services

The first local demo uses Docker Compose to run Meilisearch and a small AI/tool-call backend or mock tool endpoint. The static site remains a static site. The indexer is a build/development tool, not a runtime dependency inside the Nginx image.

The browser may call Meilisearch directly for normal search, using a restricted search-only key. AI mode must call the backend; Bailian API keys and Meilisearch master keys must never be shipped to browser code. A permanent Search API is not required for normal search in this demo, but the AI backend/tool endpoint is required for the AI mode because it protects credentials and owns the tool contract.

## What the KB Means

KB means **Knowledge Base**. In this demo it is not a second copy of every document and it is not merely the Meilisearch database. It is a curated, structured retrieval dataset that can be consumed by both:

- the documentation search experience;
- the customer-service question-answering experience.

The KB pipeline is:

```text
selected source documents
  -> section/chunk extraction
  -> metadata and visibility validation
  -> KB records
  -> Meilisearch index
  -> search or AI tool retrieval
```

For customer service, each record must preserve more than searchable text:

- source document title and canonical URL;
- section title, heading path, and anchor;
- product, platform, version, locale, and document type;
- audience, such as `developer` or `customer-support`;
- content status, such as `published`, `deprecated`, or `internal`;
- `hidden` and permission boundaries;
- enough surrounding content to answer a focused question;
- citation metadata that can be shown to a support agent or end user.

The demo may use a smaller schema subset, but it must leave these boundaries visible rather than treating customer-service KB data as anonymous text.

### Representative document set

The demo will deliberately select a small document set that covers the major source shapes:

1. a product or concept overview, to test explanatory prose and page-level context;
2. a quickstart or task guide, to test ordered procedures and code blocks;
3. an API reference page, to test method/parameter/return sections and anchors;
4. an FAQ or troubleshooting page, to test question-answer phrasing;
5. a platform-specific page or versioned page, to test metadata filtering and answer scope.

Each selected document must be recorded in a manifest with its route, reason for inclusion, expected section count, and expected query cases. The manifest is the boundary of this demo; it must not silently expand to the entire site.

## Chapter Search Record Contract

The long-term record is a chapter-oriented model rather than a page-oriented extension of the current `SearchEntry`:

```ts
type SearchSection = {
  id: string;
  url: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;
  headingPath: string[];
  locale: string;
  product?: string;
  platform?: string[];
  version?: string;
  docType: 'docs' | 'openapi';
  audience: ('developer' | 'customer-support')[];
  status: 'published' | 'deprecated' | 'internal';
  hidden: boolean;
  aliases?: string[];
};
```

### Required invariants

- `id` is stable and unique for the locale, canonical page, and heading anchor.
- `url` is the canonical route and includes the correct `#anchor` when the record represents a subsection.
- One record represents one meaningful searchable chapter, not every arbitrary paragraph.
- `content` contains enough local context for both search previews and future bounded AI context.
- `headingPath` preserves the page-to-section hierarchy.
- `hidden` content is excluded from the public index.
- `locale`, `product`, `platform`, `version`, and `docType` are explicit metadata, not only inferred at query time.
- `audience` and `status` make it possible to reuse the KB for customer service without mixing internal, deprecated, or audience-specific material.
- `.md` and `.mdx` source variants do not create duplicate public records.
- Empty headings and generic fragments such as standalone `Parameters` or `Returns` are merged into their meaningful parent according to the extraction rules.

### Example

```json
{
  "id": "zh-CN:conversationalaiapi:removehandler",
  "url": "/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#removehandler",
  "pageTitle": "ConversationalAIAPI",
  "sectionTitle": "removeHandler",
  "content": "移除事件处理器……",
  "headingPath": ["ConversationalAIAPI", "removeHandler"],
  "locale": "zh-CN",
  "product": "conversational-ai",
  "platform": ["android"],
  "docType": "docs",
  "audience": ["developer", "customer-support"],
  "status": "published",
  "hidden": false
}
```

## Indexing and Relevance

The indexer will create a deterministic JSON/JSONL input from the generated CN documentation data, then upload it to a named Meilisearch index. The exact command and file locations belong to the implementation plan, but the boundary must remain explicit:

```text
document extraction -> validation -> deterministic records -> Meilisearch upload
```

The initial searchable fields and ranking policy should favor:

1. `sectionTitle`;
2. `aliases` when present;
3. `pageTitle`;
4. `content`.

Typo tolerance may be enabled for ordinary user input, but it must not be treated as semantic matching. Chinese-to-English API relationships must come from controlled aliases or documented terminology mappings. The first demo should use only a small, reviewable alias fixture for known Golden Queries rather than inventing a large automatic translation system.

The index configuration must also define:

- filterable metadata fields needed by the CN search UI;
- displayed fields needed for title, section, preview, and URL rendering;
- a restricted browser search key for local/demo use;
- a stable index name/version so an incomplete upload cannot silently replace a usable index.

## Frontend Integration

Provider selection must become explicit:

```text
global/English with Algolia configuration -> Algolia
CN -> Meilisearch
fallback or unavailable demo service -> existing Orama only when explicitly configured
```

The existing English Algolia behavior remains unchanged. CN results must:

- render the section title and useful nearby content;
- preserve and navigate to the section anchor;
- highlight the matched text where the chosen client/API supports it;
- show loading, empty, and service-error states;
- avoid exposing a Meilisearch master key;
- keep result metadata consistent with the chapter record contract.

The fallback policy must be decided explicitly during implementation. Silent fallback that makes quality comparisons impossible is not acceptable for the demo; diagnostics should make it clear which provider returned the result.

## Docker Compose Local Environment

The local environment should be reproducible with Docker Desktop:

- one Meilisearch service with a pinned image version;
- a persistent named volume for the index data;
- a health check that waits for Meilisearch readiness;
- environment-provided master/search keys, with safe development defaults documented without committing secrets;
- a one-shot indexing command that waits for health, uploads records/settings, and waits for task completion;
- a documented query command or browser configuration for manual comparison.

The production Nginx image must not be changed to run Meilisearch. The demo may use two containers or a compose service plus a host-run indexer. The choice should optimize local reproducibility and keep the deployment boundary clear.

## Bailian Tool-Call Demo

This demo will exercise the tool-controlled route, following the useful part of DocTalk's design:

```text
user question
  -> Bailian LLM
  -> tool call: search_docs(query, filters)
  -> tool implementation / AI backend
  -> Meilisearch KB index
  -> structured sections and citations
  -> Bailian LLM
  -> answer with cited source links
```

MCP or the chosen Bailian tool interface is only the tool-call protocol. It does not search the documents itself. The implementation of `search_docs` is responsible for calling Meilisearch, applying the selected KB boundary, limiting the number and size of returned sections, and returning stable citation metadata.

The tool contract for the demo should be conceptually equivalent to:

```ts
type SearchDocsInput = {
  query: string;
  locale?: string;
  product?: string;
  platform?: string[];
  version?: string;
  audience?: 'developer' | 'customer-support';
};

type SearchDocsOutput = {
  results: Array<{
    id: string;
    title: string;
    content: string;
    url: string;
    headingPath: string[];
    score?: number;
  }>;
};
```

The demo should use a fixed, explicitly named KB index containing only the representative document manifest. It must not silently query the entire production CN corpus. No browser-side code may call Bailian directly with a secret key.

## Testing Strategy

Implementation follows TDD at each task boundary:

1. add one focused failing test;
2. run it and capture the expected failure;
3. implement the smallest behavior;
4. run the focused test and the relevant repository suite;
5. verify the task acceptance criteria;
6. stop for user review before starting the next task.

### Data tests

- stable IDs are deterministic;
- section anchors are preserved;
- hidden records are excluded;
- duplicate source variants collapse to one canonical record;
- metadata fields are populated or explicitly absent;
- audience and status filters exclude records outside the requested support scope;
- generic child sections merge according to the extraction rule.

### Search quality tests

The Golden Query fixture must include at least:

| Query | Expected first result |
| --- | --- |
| `removeHandler` | the `#removehandler` section |
| `manualSOS` | the `#manualsos` section |
| Chinese description of `removeHandler` | the mapped API section when an alias is configured |
| a known typo | the intended section when typo tolerance is enabled |
| a product/platform-specific query | a result within the requested metadata scope |

The AI tool-call fixture must additionally verify that:

- a question about a procedure retrieves the quickstart/task-guide record rather than an unrelated overview;
- a customer-support query does not retrieve `internal` or `hidden` records;
- the final model input contains only the selected result records and their citations, not the full corpus;
- the answer exposes the returned document URLs so a reviewer can verify the source.

The test report must record exact top-1/top-3 results, misses, duplicates, and whether the match came from title, alias, or content. It must not describe a query as semantically understood merely because it matched an alias.

### Service tests

- Compose starts Meilisearch;
- health check becomes ready;
- settings and records upload successfully;
- indexing waits for task completion before querying;
- a restart preserves the named-volume index;
- repeated indexing is deterministic and does not create duplicate records;
- missing or invalid credentials fail clearly.

### Browser verification

Because the current Orama cost occurs in the browser, the demo must include a real browser check in addition to Node-level tests. Verify CN search manually or with browser automation for cold load, first query, repeated query, result navigation, highlight rendering, empty results, and service failure. Node tests alone cannot prove browser download, hydration, network, layout, or anchor-navigation behavior.

## Acceptance Criteria

The demo is acceptable when all of the following are true:

### Search quality

- five exact API/section Golden Queries place the correct chapter first;
- `removeHandler` and `manualSOS` navigate to their actual anchors;
- the controlled Chinese alias case reaches the intended API chapter;
- the documented typo case returns the intended chapter;
- metadata filtering does not mix incompatible platform/product records.

### Data quality

- every indexed record satisfies the `SearchSection` contract;
- hidden content is absent;
- IDs, URLs, and anchors are deterministic;
- no `.md`/`.mdx` duplicate records remain;
- the generated record set can be reused as future AI retrieval input.

### Runtime quality

- Docker Compose starts a pinned Meilisearch instance locally;
- the indexer can create/update the index and wait for completion;
- the browser uses CN Meilisearch while English still uses Algolia;
- the AI tool can call the demo KB index and return structured chapter records to Bailian;
- the demo KB contains only the manifest-selected representative documents;
- master/model credentials are not present in client bundles;
- service loading, empty, and failure states are observable.

### Evaluation quality

- the report separates index-build/download time from query latency;
- Node benchmark results are not presented as browser UX results;
- the comparison records Orama baseline versus Meilisearch chapter-index results using the same Golden Query fixture;
- conclusions state what was measured and what remains unproved.

## Implementation Gates

The work is intentionally divided into reviewable tasks. No task may start until the preceding task is reviewed and approved by the user.

1. **Task 1: isolated branch/worktree and KB manifest** — establish the implementation baseline, choose representative documents, and write data-contract tests; no runtime integration yet.
2. **Task 2: chapter/KB record extraction** — generate and validate records from only the manifest-selected documents, including audience, status, visibility, and citations.
3. **Task 3: local Meilisearch Compose service** — start the service, health check it, and document credentials/volume behavior.
4. **Task 4: KB indexer and settings upload** — upload the demo KB records to a separate named index and verify completed tasks, idempotency, and metadata filters.
5. **Task 5: Meilisearch client/provider adapter** — add the CN normal-search boundary while preserving English Algolia and an explicit demo fallback policy.
6. **Task 6: CN search UI integration** — render chapter results, highlights, states, and anchor navigation.
7. **Task 7: Bailian `search_docs` tool adapter** — expose the constrained KB retrieval contract to a local AI backend/tool-call endpoint without exposing credentials.
8. **Task 8: AI answer demo** — call Bailian with tool results, return citations, and verify that the model receives selected sections only.
9. **Task 9: Golden Query and browser comparison** — produce the measured Orama-versus-Meilisearch report and verify both search and AI acceptance criteria.

After this spec is approved, a separate implementation plan will define exact files, interfaces, test commands, and commits for each task. The plan itself must be reviewed before Task 1 begins.

## Risks and Explicit Decisions

### Static site versus search service

The documentation pages can remain static because search is an external runtime service, as English Algolia already demonstrates. The static Nginx container does not need to become a backend. The cost is an additional service dependency and network request, which is acceptable for this demo because the company can provision K8s resources and the current browser-side Orama index has a measurable startup cost.

### Direct browser access versus Search API

Direct browser access is the smallest first demo and matches the English architecture. A Search API is reserved for requirements that direct access cannot safely or cleanly satisfy. Introducing it before those requirements exist would add another runtime service and obscure whether Meilisearch itself solved the search problem.

### Meilisearch versus MiniSearch

MiniSearch, as used by DocTalk, is an in-process JavaScript BM25 library. It would require the browser or an application server to own the index and does not remove the current client-side indexing concern by itself. Meilisearch is selected for this demo because it provides a separately deployable service with persistent indexing, typo tolerance, field ranking, filters, and a clear future retrieval endpoint. This is a pragmatic choice for the confirmed deployment environment, not a claim that MiniSearch cannot produce useful search results.

### Chinese semantics

Meilisearch and Orama can match indexed terms, tolerate some typos, and use aliases. Neither automatically understands every Chinese paraphrase or maps arbitrary Chinese descriptions to English API names. The demo must keep this distinction visible in both the data model and the evaluation report.
