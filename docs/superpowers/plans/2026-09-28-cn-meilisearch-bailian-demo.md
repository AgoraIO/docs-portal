# CN Meilisearch and Bailian Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Each task ends with verification and a user review gate before the next task starts.

**Goal:** Build a bounded CN documentation-search and Bailian Tool Call demo using a representative KB manifest, chapter-level records, Meilisearch retrieval, and cited AI answers.

**Architecture:** Normal CN search calls a restricted Meilisearch search endpoint and returns chapter results. AI mode calls a server-side `search_docs` tool; the tool queries a separate demo KB index in Meilisearch, returns selected records and citations to Bailian, and Bailian generates the answer. English Algolia and the static Nginx document runtime remain unchanged.

**Tech Stack:** TypeScript, React, Fumadocs generated document data, Meilisearch HTTP API/client, Docker Compose, Vitest, browser verification, Alibaba Cloud Bailian/DashScope API or tool-call interface.

**Spec:** `docs/superpowers/specs/2026-09-28-cn-meilisearch-bailian-demo-design.md` and `docs/superpowers/specs/2026-09-28-cn-meilisearch-bailian-demo-design.zh-CN.md`

## Global Constraints

- The demo KB contains only documents listed in the fixed representative-document manifest.
- English continues to use Algolia; only CN uses the Meilisearch provider in this work.
- Normal search and AI question answering are separate UI modes.
- `search_docs` is the only retrieval boundary exposed to the AI model; it queries Meilisearch and applies visibility/metadata rules.
- Meilisearch master keys, Bailian API keys, and RAM credentials never enter browser bundles or committed files.
- Hidden, internal, and unauthorized records are excluded before records reach the browser or model.
- Vector search, embeddings, full RAG, Kubernetes deployment, and production Bailian rollout are outside this plan.
- Every task uses TDD: write a focused failing test, verify RED, implement minimally, verify GREEN, run relevant regressions, and stop for user review.
- Use an isolated worktree based on the approved `CN-NEWDOC` baseline; preserve the existing dirty worktree.

## Review Focus

- A method query must navigate to the method anchor, not only the overview page. Test in Task 2 and Task 6.
- A support query must not return hidden, internal, or deprecated content. Test in Task 2 and Task 7.
- The demo index must not expand beyond the selected document manifest. Test in Task 1 and Task 4.
- A repeated index upload must be deterministic and duplicate-free. Test in Task 4.
- The AI model must receive selected records and citations, not the full corpus or secrets. Test in Task 7 and Task 8.

---

### Task 1: Isolated Worktree, KB Manifest, and Contracts

**Files:**
- Create: `scripts/search-demo/cn-kb-manifest.ts`
- Create: `src/lib/search/kb-record.ts`
- Create: `src/lib/search/kb-record.test.ts`
- Create: `scripts/search-demo/cn-kb-manifest.test.ts`
- Modify: `package.json` to add only the manifest test command if the existing test discovery does not include these files

**Interfaces:**
- Produces `type SearchSection` with `id`, `url`, `pageTitle`, `sectionTitle`, `content`, `headingPath`, `locale`, optional `product/platform/version`, `docType`, `audience`, `status`, `hidden`, and optional `aliases`.
- Produces `const cnKbManifest: readonly { route: string; reason: string; audience: SearchSection['audience']; queryIds: string[] }[]`.
- Produces `assertValidSearchSection(record: SearchSection): void` for later generators and tool adapters.

- [ ] **Step 1: Create an isolated worktree**

Run from the existing repository checkout:

```bash
git worktree add ../docs-portal-cn-bailian-demo -b codex/cn-bailian-demo CN-NEWDOC
```

Run:

```bash
git -C ../docs-portal-cn-bailian-demo status --short --branch
```

Expected: the new worktree is clean and based on `CN-NEWDOC`; the existing worktree's unrelated changes are untouched.

- [ ] **Step 2: Write failing contract tests**

Add tests that assert a valid API section has a stable ID, an anchor URL, non-empty section content, a supported status/audience, and that a hidden record is rejected from public indexing. Add a manifest test asserting the manifest contains the five required document shapes and no duplicate routes.

```ts
it('accepts a public anchored API section', () => {
  expect(() => assertValidSearchSection(apiSection)).not.toThrow();
});

it('rejects a hidden section from a public KB record', () => {
  expect(() => assertValidSearchSection({ ...apiSection, hidden: true })).toThrow(
    'hidden records cannot enter the public KB',
  );
});
```

- [ ] **Step 3: Run RED**

Run:

```bash
bunx vitest run src/lib/search/kb-record.test.ts scripts/search-demo/cn-kb-manifest.test.ts
```

Expected: FAIL because the record contract and manifest do not exist.

- [ ] **Step 4: Implement the smallest contract and manifest**

Add the type, validator, and a fixed manifest containing one overview, one quickstart/task guide, one API reference, one FAQ/troubleshooting page, and one platform/version-specific page. Use actual CN routes selected from the repository; do not generate routes dynamically from the entire content tree.

- [ ] **Step 5: Verify GREEN and regressions**

Run:

```bash
bunx vitest run src/lib/search/kb-record.test.ts scripts/search-demo/cn-kb-manifest.test.ts
bun run test
```

Expected: focused tests and the repository suite pass. Stop and ask the user to review the manifest and contract before Task 2.

### Task 2: Representative Document Extraction

**Files:**
- Create: `scripts/search-demo/extract-cn-kb-records.ts`
- Create: `scripts/search-demo/extract-cn-kb-records.test.ts`
- Modify: `src/lib/search/kb-record.ts`

**Interfaces:**
- Consumes `cnKbManifest` and existing build-time document/source helpers.
- Produces `extractCnKbRecords(input: { manifest: typeof cnKbManifest; source: readonly SourceDocument[] }): SearchSection[]` with deterministic ordering.
- Produces `mergeGenericChildSection(parent: SearchSection, child: SearchSection): SearchSection` for short `Parameters`/`Returns`-style sections.
- Defines `type SourceDocument = { route: string; title: string; content: string; headings: readonly { title: string; anchor: string; content: string }[]; hidden: boolean }` for the extraction boundary.

- [ ] **Step 1: Write failing extraction tests**

Test that a page with an API heading creates an anchored section, a short generic child is merged into its parent, hidden content is omitted, and the same source cannot create both `.md` and `.mdx` public records.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run scripts/search-demo/extract-cn-kb-records.test.ts
```

Expected: FAIL because extraction functions do not exist.

- [ ] **Step 3: Implement deterministic extraction**

Read only routes from `cnKbManifest`. Preserve heading paths, canonical URLs, anchors, source metadata, and enough local body text for result previews and later context. Sort records by `id` before writing output.

- [ ] **Step 4: Verify GREEN and inspect fixture output**

```bash
bunx vitest run scripts/search-demo/extract-cn-kb-records.test.ts
bun run types:check
```

Generate a small JSON fixture and manually inspect one record from each document shape. Stop for user review of samples, counts, and metadata.

### Task 3: Local Meilisearch Compose Service

**Files:**
- Create: `search-demo/docker-compose.yml`
- Create: `search-demo/.env.example`
- Create: `search-demo/README.md`
- Create: `scripts/search-demo/meilisearch-health.test.ts`

**Interfaces:**
- Compose service name: `meilisearch`.
- Health endpoint: `GET http://localhost:7700/health`.
- Required environment variables: `MEILI_MASTER_KEY`, `MEILI_HOST`, `MEILI_INDEX_UID`.

- [ ] **Step 1: Write failing service readiness test**

Test the health helper against an unavailable endpoint and assert it returns a clear readiness error without exposing the master key.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run scripts/search-demo/meilisearch-health.test.ts
```

Expected: FAIL because the service helper/Compose setup does not exist.

- [ ] **Step 3: Add pinned Compose service**

Configure a pinned Meilisearch image, named persistent volume, health check, and local-only port. Keep secrets in `.env` or shell environment; `.env.example` contains placeholders only.

- [ ] **Step 4: Verify the service**

```bash
docker compose --env-file search-demo/.env -f search-demo/docker-compose.yml up -d meilisearch
curl --fail http://localhost:7700/health
```

Expected: health response reports available. Stop for user review of the Compose service and secret instructions.

### Task 4: KB Indexer and Meilisearch Settings

**Files:**
- Create: `scripts/search-demo/index-cn-kb.ts`
- Create: `scripts/search-demo/index-cn-kb.test.ts`
- Create: `scripts/search-demo/meilisearch-settings.ts`
- Create: `scripts/search-demo/fixtures/cn-kb-golden-queries.json`

**Interfaces:**
- `buildMeilisearchSettings(): { searchableAttributes: string[]; filterableAttributes: string[]; displayedAttributes: string[] }`.
- `indexCnKb(records, client): Promise<{ indexUid: string; taskUid: number }>`.
- Index UID is the explicit demo value `cn-kb-demo-v1`.

- [ ] **Step 1: Write failing idempotency and settings tests**

Assert title/alias/content ordering, filterable metadata, hidden exclusion, deterministic record count, and that indexing the same records twice does not create duplicate IDs.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run scripts/search-demo/index-cn-kb.test.ts
```

Expected: FAIL because settings and indexer do not exist.

- [ ] **Step 3: Implement upload and task polling**

Upload settings, then records, and wait for Meilisearch task completion before any query is considered valid. Abort on failed tasks. Do not replace the index with an empty or partial record set.

- [ ] **Step 4: Verify with Docker**

```bash
bun run search-demo:index
curl --fail http://localhost:7700/indexes/cn-kb-demo-v1/settings
```

Restart the container and verify the named-volume index remains available. Stop for user review of index settings, document count, and sample records.

### Task 5: CN Normal Search Adapter

**Files:**
- Create: `src/lib/search/meilisearch-client.ts`
- Create: `src/lib/search/meilisearch-client.test.ts`
- Modify: `src/lib/search/search-provider.ts`
- Modify: `src/lib/search/search-provider.test.ts`

**Interfaces:**
- `createMeilisearchClient(config): SearchClient`.
- `searchCnDocuments(query: string, options: { filters?: string[] }): Promise<SearchResult[]>`.
- `type SearchResult = { id: string; title: string; content: string; url: string; headingPath: string[]; highlights?: Record<string, string> }`.
- Provider selection remains `global/English -> Algolia`, `CN -> Meilisearch`.

- [ ] **Step 1: Write failing provider tests**

Assert CN selects Meilisearch, English selects Algolia, and no master key is accepted by client-side configuration.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run src/lib/search/meilisearch-client.test.ts src/lib/search/search-provider.test.ts
```

- [ ] **Step 3: Implement the adapter**

Map Meilisearch hits into the existing search result shape while preserving section title, preview, anchor URL, metadata, and highlight data. Use a restricted search-only key for the demo.

- [ ] **Step 4: Verify GREEN and provider isolation**

```bash
bunx vitest run src/lib/search/meilisearch-client.test.ts src/lib/search/search-provider.test.ts
bun run types:check
```

Stop for user review before changing the search dialog.

### Task 6: CN Search UI Mode and Navigation

**Files:**
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx`
- Modify: `src/components/docs-shell/DocsSearchDialog.test.tsx`
- Modify: `src/lib/search/docs-search-navigation.ts`
- Modify: related search styles only if required by the existing component conventions

**Interfaces:**
- UI mode is `'document-search' | 'ai-answer'`.
- Normal mode consumes `searchCnDocuments` and renders section result metadata.
- AI mode renders a handoff/loading state until Task 8 supplies the backend.

- [ ] **Step 1: Write failing component tests**

Test mode switching, CN result title/section display, highlight rendering, loading/empty/error states, and click navigation to a `#anchor`.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx
```

- [ ] **Step 3: Implement normal mode**

Add the two-mode control, retain existing keyboard behavior, wire document mode to Meilisearch, and keep English Algolia behavior unchanged. Do not implement a fake AI answer.

- [ ] **Step 4: Verify browser behavior**

```bash
bun run dev
```

In a browser, search `removeHandler` and `manualSOS`, verify the first result URL contains the section anchor, and verify empty/error states. Stop for user review.

### Task 7: `search_docs` Tool Adapter

**Files:**
- Create: `search-demo/ai/search-docs.ts`
- Create: `search-demo/ai/search-docs.test.ts`
- Create: `search-demo/ai/server.ts`
- Create: `search-demo/ai/.env.example`

**Interfaces:**
- `searchDocs(input: SearchDocsInput): Promise<SearchDocsOutput>`.
- `SearchDocsInput` and `SearchDocsOutput` match the tool contract in the Chinese spec.
- `POST /api/search-docs` accepts a validated tool input and returns only selected KB records.

- [ ] **Step 1: Write failing tool-boundary tests**

Test that the tool applies `audience`, `platform`, and `version` filters; removes hidden/internal records; caps result count and content size; and never returns secrets.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run search-demo/ai/search-docs.test.ts
```

- [ ] **Step 3: Implement the tool adapter**

Validate input, query only `cn-kb-demo-v1`, map hits to citations, and keep Meilisearch master credentials server-side. Return a structured no-result response rather than an unbounded fallback.

- [ ] **Step 4: Verify GREEN and local HTTP behavior**

```bash
bunx vitest run search-demo/ai/search-docs.test.ts
curl -X POST http://localhost:8787/api/search-docs \
  -H 'content-type: application/json' \
  -d '{"query":"如何移除事件处理器","audience":"customer-support"}'
```

Stop for user review of the tool payload and citation format.

### Task 8: Bailian AI Answer Demo

**Files:**
- Create: `search-demo/ai/bailian-client.ts`
- Create: `search-demo/ai/bailian-client.test.ts`
- Modify: `search-demo/ai/server.ts`
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx`
- Modify: `src/components/docs-shell/DocsSearchDialog.test.tsx`
- Modify: `search-demo/README.md`

**Interfaces:**
- `createBailianClient(config): BailianClient`.
- `answerWithBailian(question: string, searchDocs: SearchDocsTool): Promise<{ answer: string; citations: Citation[] }>`.
- `type Citation = { id: string; title: string; url: string; headingPath: string[] }`.
- `type SearchDocsTool = (input: SearchDocsInput) => Promise<SearchDocsOutput>`.
- `DASHSCOPE_API_KEY`, `BAILIAN_MODEL`, and any required workspace/region settings are server-only.

- [ ] **Step 1: Write failing client and UI tests**

Test that the AI server calls the tool before generating an answer, passes only tool results to the model, returns citations, handles no results, and returns a safe configuration error when the API key is absent. UI tests assert AI mode renders answer/citations and loading/error states.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run search-demo/ai/bailian-client.test.ts src/components/docs-shell/DocsSearchDialog.test.tsx
```

- [ ] **Step 3: Implement server-side Bailian call**

Read the API key from the process environment, call the selected Bailian model using the documented endpoint/SDK, and keep the prompt bounded to returned KB records. Never expose the raw API key or full Meilisearch response to the browser.

- [ ] **Step 4: Verify with a small manual query**

Configure local-only environment variables from the user’s RAM-authorized Bailian account, run one or two questions against the demo KB, and confirm the answer includes source URLs. Do not enable automatic billing after free quota; use the console’s stop-on-exhaustion setting.

Stop for user review of the first real AI answer before Task 9.

### Task 9: Golden Query, Browser, and AI Evaluation

**Files:**
- Modify: `scripts/search-demo/fixtures/cn-kb-golden-queries.json`
- Create: `scripts/search-demo/run-cn-search-evaluation.ts`
- Create: `scripts/search-demo/run-cn-search-evaluation.test.ts`
- Create: `docs/agents/reports/2026-09-28-cn-meilisearch-bailian-demo-report.md`

**Interfaces:**
- Evaluation output records provider, query, top-1/top-3 IDs, match field, URL, latency, and pass/fail reason.
- The report separates index build, browser download, first query, repeated query, tool retrieval, and model generation time.

- [ ] **Step 1: Write failing evaluation assertions**

Assert exact API queries, anchored navigation, controlled alias queries, typo queries, metadata filters, and AI citation presence.

- [ ] **Step 2: Run RED**

```bash
bunx vitest run scripts/search-demo/run-cn-search-evaluation.test.ts
```

- [ ] **Step 3: Implement reproducible evaluation**

Run the same Golden Query fixture against the existing Orama baseline and `cn-kb-demo-v1`. Record misses and result provenance rather than only aggregate scores.

- [ ] **Step 4: Run full verification**

```bash
bun run test
bun run types:check
bun run lint
```

Perform a real browser pass for both modes, inspect the report, and verify no secrets occur in the client bundle. Stop and ask the user to review the final report; do not deploy or merge automatically.

## Plan Self-Review

- Spec coverage: manifest, KB metadata, chapter extraction, Meilisearch service/indexing, CN UI, Tool Call boundary, Bailian server call, citations, and browser evaluation each have an owning task.
- Placeholder scan: no task depends on an undefined “later” implementation; exact file paths and interfaces are named above.
- Type consistency: `SearchSection`, `SearchDocsInput`, `SearchDocsOutput`, and `Citation` are introduced before consumers.
- Review focus coverage: each of the five failure modes is pinned to a test in Tasks 1, 2, 4, 6, 7, or 8.
- RAM/Bailian access is a local configuration prerequisite for Task 8, not a reason to put credentials in repository code.
