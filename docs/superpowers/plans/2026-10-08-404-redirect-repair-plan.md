# 404 Redirect Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add only evidence-backed redirects for the currently confirmed 404 paths, regenerate all redirect artifacts, and verify the fixed paths online.

**Architecture:** Keep the observed PostHog paths as an input report and store approved mappings in a dedicated legacy redirect source file. Extend the existing artifact generator to merge that source with the current redirect rules; unresolved paths remain outside production redirect configuration and are recorded in a triage report.

**Tech Stack:** TypeScript/JavaScript, JSON redirect manifests, Vercel redirect artifacts, Vitest, Node `fetch`.

---

### Task 1: Build a deterministic 404 triage report

**Files:**
- Create: `scripts/triage-posthog-404-redirects.mjs`
- Create: `scripts/triage-posthog-404-redirects.test.ts`
- Read: `output/posthog/404-revalidation-2026-10-08.json`
- Read: `src/lib/legacy-sitemap/new-docs-inventory.json`
- Read: `src/lib/legacy-sitemap/redirects.json`
- Read: `src/lib/legacy-sitemap/gsc-observed-redirects.json`
- Create: `output/posthog/404-triage-2026-10-08.json`

- [ ] **Step 1: Write the failing parser and classification tests.**

  Test the following exact states:

  - `already-covered` when the normalized source path exists in an existing redirect source.
  - `inventory-exact` when the candidate target is an exact current inventory route.
  - `inventory-unique-leaf` only when the normalized leaf slug has exactly one current route and the source product context is compatible.
  - `unresolved` for ambiguous leaves, malformed paths, external API-reference paths, and targets that are neither in the inventory nor represented by current source content.

- [ ] **Step 2: Run the focused test and confirm it fails because the triage module does not exist.**

  Run: `bun run test -- scripts/triage-posthog-404-redirects.test.ts`

- [ ] **Step 3: Implement the triage module.**

  Read the 690 `is_http_404` rows, normalize only for comparison using URI decoding and case-insensitive slug matching, preserve the original path for output, and never emit an approved target automatically for an ambiguous candidate. Include historical event count, current status, candidate target, classification, and reason in each row.

- [ ] **Step 4: Run the focused test and generate the triage output.**

  Run: `bun run test -- scripts/triage-posthog-404-redirects.test.ts`

  Run: `bun scripts/triage-posthog-404-redirects.mjs --input output/posthog/404-revalidation-2026-10-08.json --output output/posthog/404-triage-2026-10-08.json`

  Expected: every input path appears exactly once; no row marked `unresolved` has a production target.

### Task 2: Curate and test approved redirect rules

**Files:**
- Create: `src/lib/legacy-sitemap/posthog-revalidated-404s.json`
- Create: `src/lib/legacy-sitemap/posthog-revalidated-404s.test.ts`
- Modify: `docs/agents/reports/2026-10-08-404-redirect-review.md`

- [ ] **Step 1: Add only approved mappings from the triage output.**

  Each entry must use the existing `LegacySitemapRedirectRule` shape and include `legacyPath`, `target`, `type`, `confidence`, `evidence`, and `preserveSearch`. Include only targets verified as current internal inventory routes, current source-content routes that canonicalize successfully, or verified external API destinations. Keep platform-specific and query-specific mappings explicit; do not collapse them into a generic product fallback.

- [ ] **Step 2: Write mapping integrity tests.**

  Assert that every approved source is present in the 690 confirmed-404 input set, every internal target is in `new-docs-inventory.json` or current source content, no source has conflicting targets, no approved source is one of the 36 current HTTP 200 paths, and every unresolved path is absent from the approved source.

- [ ] **Step 3: Run the mapping tests.**

  Run: `bun run test -- src/lib/legacy-sitemap/posthog-revalidated-404s.test.ts`

### Task 3: Integrate approved mappings with artifact generation

**Files:**
- Modify: `scripts/generate-legacy-redirect-artifacts.mjs`
- Modify: `scripts/generate-legacy-redirect-artifacts.test.ts`
- Modify: `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`
- Regenerate: `src/lib/legacy-sitemap/static-redirects.json`
- Regenerate: `vercel-legacy-redirects.json`
- Regenerate: `vercel.json`

- [ ] **Step 1: Extend generator fixtures and tests.**

  Add `src/lib/legacy-sitemap/posthog-revalidated-404s.json` to the generator fixture list and test sandbox setup. Assert that the generated static and Vercel artifacts include the approved mappings in addition to the existing redirect sources.

- [ ] **Step 2: Add the new source to the generator input order.**

  Read the new JSON file next to the GSC observed rules and merge it into `artifactRules` before generating all three artifacts. Preserve the existing sort and query-specific behavior.

- [ ] **Step 3: Regenerate and check artifacts.**

  Run: `bun run openapi:sync` is not part of this change and must not be run.

  Run: `node scripts/generate-legacy-redirect-artifacts.mjs`

  Run: `node scripts/generate-legacy-redirect-artifacts.mjs --check`

### Task 4: Verify behavior and record unresolved paths

**Files:**
- Modify: `output/posthog/404-revalidation-2026-10-08.md`
- Create: `output/posthog/404-revalidation-after-redirects-2026-10-08.json`
- Create: `output/posthog/404-unresolved-2026-10-08.txt`

- [ ] **Step 1: Run repository checks.**

  Run: `bun run test -- scripts/generate-legacy-redirect-artifacts.test.ts src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts src/lib/legacy-sitemap/posthog-revalidated-404s.test.ts`

  Run: `bun run types:check`

  Run: `bun run lint`

- [ ] **Step 2: Verify every approved source online.**

  Send GET requests to `https://docs.agora.io` for every approved source, follow redirects, and require the final response to be non-404. Record the final URL, status, and source rule in the verification JSON.

- [ ] **Step 3: Verify unresolved paths remain explicit.**

  Write one path per line to `output/posthog/404-unresolved-2026-10-08.txt`, and include counts by classification in the Markdown report. Do not add unresolved paths to any production redirect artifact.

- [ ] **Step 4: Review the final diff.**

  Run: `git diff --check`

  Run: `git status --short`

  Confirm that only the approved source, tests, generated redirect artifacts, triage reports, and plan/spec documents changed; preserve unrelated user files such as `public/zh-CN/`.
