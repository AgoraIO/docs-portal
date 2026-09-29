# Final Search Query Instrumentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture one final, privacy-safe query per docs search session and use it in the PostHog problem-query tables.

**Architecture:** Keep per-request completion events unchanged. `DocsSearchDialog` retains the latest completed request metadata and finalizes it once when the dialog closes or a result is selected. `posthog.ts` owns the typed event payload and existing safe-query handling. The PostHog tables filter this new event rather than reconstructing query intent from intermediate requests.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, PostHog JS, HogQL.

---

### Task 1: Define the final-query event API

**Files:**

- Modify: `src/lib/analytics/posthog.ts`
- Test: `src/lib/analytics/posthog.test.ts`

- [ ] Add a failing payload test for `captureDocsSearchFinalized`, with a normal query and a sensitive-query case.
- [ ] Run `bun run test -- src/lib/analytics/posthog.test.ts` and confirm the new test fails because the export is absent.
- [ ] Add `captureDocsSearchFinalized` using `captureStructuredDocsEvent` and `getSafeSearchQueryProperties`. It accepts the finalization reason, query and correlation IDs, result count, result visibility, and first-result metadata.
- [ ] Re-run `bun run test -- src/lib/analytics/posthog.test.ts` and confirm the new tests pass.

### Task 2: Finalize exactly one latest completed query per dialog session

**Files:**

- Modify: `src/components/docs-shell/DocsSearchDialog.tsx`
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] Add failing dialog tests for closing after a completed query, selecting a result, no completed query, and duplicate prevention.
- [ ] Run `bun run test -- src/components/docs-shell/DocsSearchDialog.test.tsx` and confirm the new assertions fail.
- [ ] Retain the latest completed request's query, IDs, result count, first result type/source, and visibility state. Clear it on session open and after finalization.
- [ ] Finalize with `result_clicked` before navigation and with `closed` in the shared close path, using one helper to emit at most one final event.
- [ ] Re-run `bun run test -- src/components/docs-shell/DocsSearchDialog.test.tsx` and confirm all focused tests pass.

### Task 3: Switch PostHog problem-query tables to final queries

**External configuration:** PostHog project `494535`, dashboard `2094234`.

- [ ] After deployment, verify `docs_search_query_finalized` has safe query text/hash, result count, visibility, and finalization reason.
- [ ] Update “高频零结果查询” to filter final events where `result_count = 0`.
- [ ] Update “高频有结果但无点击查询” to filter final events where `result_count > 0`, `results_impressed = true`, and `finalization_reason = closed`.
- [ ] Verify both tables return final-query rows once the new event reaches production.

### Task 4: Full verification

- [ ] Run `bun run test -- src/lib/analytics/posthog.test.ts src/components/docs-shell/DocsSearchDialog.test.tsx`.
- [ ] Run `bun run types:check`, `bunx biome check src/lib/analytics/posthog.ts src/lib/analytics/posthog.test.ts src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx`, and `git diff --check`.
- [ ] Commit source, tests, and these design documents with `feat: capture final docs search queries`.
