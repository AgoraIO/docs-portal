# Search Analytics Instrumentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostHog instrumentation that measures whether users find and meaningfully engage with answers through docs search.

**Architecture:** Keep the existing three search events and add stable `search_session_id` and `query_attempt_id` identifiers. Add one result-impression event and one internal landing-engagement event. Persist a short-lived same-origin attribution record before internal navigation.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, PostHog JS, TanStack Router, sessionStorage, visibility and scroll APIs.

---

## Files and responsibilities

- Modify `src/lib/analytics/posthog.ts`: typed search event functions and safe query/link handling.
- Modify `src/components/docs-shell/DocsSearchDialog.tsx`: session lifecycle, request IDs, impressions, clicks, and attribution.
- Create `src/lib/analytics/search-attribution.ts`: pending internal landing storage and pathname matching.
- Create `src/components/docs-shell/DocsSearchLandingEngagement.tsx`: one valid internal landing event.
- Modify `src/components/docs-shell/DocsContent.tsx`: mount the landing tracker.
- Test `src/lib/analytics/posthog.test.ts`, `src/lib/analytics/search-attribution.test.ts`, `src/components/docs-shell/DocsSearchDialog.test.tsx`, `src/components/docs-shell/DocsSearchLandingEngagement.test.tsx`, and `src/components/docs-shell/DocsContent.test.tsx`.

## Data contract

Every search dialog open creates one `search_session_id`. Every non-empty completed query creates one `query_attempt_id`. Completion, impression, click, and landing events for that query share the attempt ID.

The five events are:

```text
docs_search_opened
docs_search_completed
docs_search_results_impressed
docs_search_result_clicked
docs_search_landing_engaged
```

Normal technical queries may send a normalized, 100-character maximum `query_text`. Queries matching URL, token, App ID, or long-random-string patterns send `query_hash` instead.

## Task 1: Add event APIs and attribution storage

**Files:**
- Modify: `src/lib/analytics/posthog.ts:131-190`
- Modify: `src/lib/analytics/posthog.test.ts:170-245`
- Create: `src/lib/analytics/search-attribution.ts`
- Test: `src/lib/analytics/search-attribution.test.ts`

- [ ] **Step 1: Write failing tests.** Add PostHog tests for completion fields `search_session_id`, `query_attempt_id`, `query_text/query_hash`, `search_intent`, `latency_ms`, `docs_result_count`, `api_result_count`, and `api_available`. Add tests for impression and landing payloads. Test that sensitive queries never appear as raw text.

- [ ] **Step 2: Run the tests and verify failure.**
```bash
npx --yes bun run test -- src/lib/analytics/posthog.test.ts
```
Expected: FAIL because the new functions and properties do not exist.

- [ ] **Step 3: Implement typed capture functions.** Extend `captureDocsSearchOpened` and `captureDocsSearchResultClicked` with approved IDs and metadata. Add:
```ts
export function captureDocsSearchResultsImpressed(input: {
  firstResultSource?: string;
  firstResultType?: string;
  hasPlatformVariants: boolean;
  locale: string;
  queryAttemptId: string;
  resultCount: number;
  resultGroupOrder: string;
  searchSessionId: string;
  visibleResultCount: number;
}): void;

export function captureDocsSearchLandingEngaged(input: {
  codeCopied: boolean;
  dwellTimeMs: number;
  href: string;
  locale: string;
  nextPageClicked: boolean;
  queryAttemptId: string;
  scrollDepth: number;
  searchSessionId: string;
}): void;
```
Use the existing structured-event and link-sanitization paths.

- [ ] **Step 4: Implement storage.** Create `src/lib/analytics/search-attribution.ts` with:
```ts
export type PendingSearchLanding = {
  createdAt: number;
  href: string;
  queryAttemptId: string;
  searchSessionId: string;
};

export function savePendingSearchLanding(record: PendingSearchLanding): void;
export function consumePendingSearchLanding(pathname: string, now?: number): PendingSearchLanding | null;
export function clearPendingSearchLanding(): void;
```
Use `docs-portal:search-attribution:v1`; reject malformed or older-than-30-minute records; ignore query/hash in pathname matching; never throw on storage errors.

- [ ] **Step 5: Test storage behavior.** Cover valid matching records, mismatched paths, expiry, malformed JSON, query/hash normalization, and unavailable storage.

- [ ] **Step 6: Run and commit.**
```bash
npx --yes bun run test -- src/lib/analytics/posthog.test.ts src/lib/analytics/search-attribution.test.ts
git add src/lib/analytics/posthog.ts src/lib/analytics/posthog.test.ts src/lib/analytics/search-attribution.ts src/lib/analytics/search-attribution.test.ts
git commit -m "feat: define search analytics events"
```
Expected: both test files pass before commit.

## Task 2: Instrument search sessions, impressions, and clicks

**Files:**
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx`
- Modify: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Write failing tests.** Add mocks and assertions for one session ID per open, one attempt ID per non-empty completed query, shared completion/impression/click IDs, no events for empty input, one impression per rendered result set, click rank/delay, filters, selected platform, same-origin attribution, and external click-only behavior.

- [ ] **Step 2: Run the dialog tests and verify failure.**
```bash
npx --yes bun run test -- src/components/docs-shell/DocsSearchDialog.test.tsx
```
Expected: FAIL because IDs and impression capture are absent.

- [ ] **Step 3: Add lifecycle refs.** Add:
```ts
const searchSessionIdRef = useRef<string | null>(null);
const latestQueryAttemptIdRef = useRef<string | null>(null);
const searchAttemptStartedAtRef = useRef<number | null>(null);
const impressedAttemptIdsRef = useRef(new Set<string>());
```
Create a `crypto.randomUUID()` helper with a deterministic fallback. Create session IDs on open, attempt IDs when non-empty requests start, and reset them on close. Preserve the latest-request guard.

- [ ] **Step 4: Enrich completion and emit impressions.** Use the existing intent classifier for `search_intent`, `getLastStatus()` for `api_available`, the result array for docs/API counts, and the request timestamp for latency. Emit `docs_search_results_impressed` once after a non-empty result list renders, with first-result type/source, platform-variant presence, and group order. Do not emit impressions for zero-result or unavailable states.

- [ ] **Step 5: Enrich clicks and persist attribution.** Include IDs, rank, type, source, selected platform, and click delay. Before same-origin navigation, save the target pathname and IDs. Keep recent-page selections unattributed and preserve external `window.open`.

- [ ] **Step 6: Run and commit.**
```bash
npx --yes bun run test -- src/components/docs-shell/DocsSearchDialog.test.tsx
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx
git commit -m "feat: instrument search results"
```
Expected: all dialog tests pass.

## Task 3: Track meaningful internal landing engagement

**Files:**
- Create: `src/components/docs-shell/DocsSearchLandingEngagement.tsx`
- Test: `src/components/docs-shell/DocsSearchLandingEngagement.test.tsx`
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Test: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Write failing tracker tests.** Test no record, mismatched path, no movement at 10 seconds, one event after 10 seconds plus scroll, dwell time, clamped scroll depth, clearing after capture, no duplicate capture, and hidden-document behavior.

- [ ] **Step 2: Implement the tracker.** Consume a matching record on mount; listen to the active docs scroll container, window scroll, and visibility events; require at least 10 seconds visible time and non-zero scroll depth; emit once; clean up listeners and timers. Send `code_copied=false` and `next_page_clicked=false` because those signals are deferred.

- [ ] **Step 3: Mount and verify.** Mount the tracker inside `DocsContent` for same-origin docs pages with normalized locale and active pathname. Do not attribute external API pages. Assert the props in `DocsContent.test.tsx`.

- [ ] **Step 4: Run and commit.**
```bash
npx --yes bun run test -- src/components/docs-shell/DocsSearchLandingEngagement.test.tsx src/components/docs-shell/DocsContent.test.tsx
git add src/components/docs-shell/DocsSearchLandingEngagement.tsx src/components/docs-shell/DocsSearchLandingEngagement.test.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx
git commit -m "feat: track search landing engagement"
```
Expected: both test files pass.

## Task 4: Full verification

- [ ] **Step 1: Run the focused suite.**
```bash
npx --yes bun run test -- src/lib/analytics/posthog.test.ts src/lib/analytics/search-attribution.test.ts src/components/docs-shell/DocsSearchDialog.test.tsx src/components/docs-shell/DocsSearchLandingEngagement.test.tsx src/components/docs-shell/DocsContent.test.tsx
```
Expected: all new tests pass; report unrelated baseline failures by exact name.

- [ ] **Step 2: Run type and format checks.**
```bash
npx --yes bun run types:check
npx --yes bunx biome check src/lib/analytics/posthog.ts src/lib/analytics/search-attribution.ts src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchLandingEngagement.tsx src/components/docs-shell/DocsContent.tsx
git diff --check
```

- [ ] **Step 3: Browser-verify.** Confirm one open event, one completion/impression per stable query, shared attempt IDs, click rank/delay, one internal landing event after active reading, click-only external API behavior, and no raw sensitive query in PostHog requests.

- [ ] **Step 4: Handoff.** Report branch, commits, tests, and that PostHog charts/tables use the approved event contract.

