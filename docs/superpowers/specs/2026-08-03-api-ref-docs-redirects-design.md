# API Reference docs.agora.io Redirect Triage Design

Date: 2026-08-03

## Context

The audit report at `docs/agents/reports/2026-08-03-api-ref-docs-links.md`
scanned API Reference pages for outbound links to `docs.agora.io`.

The report found:

- 37 API Reference entries.
- 6504 API Reference pages visited.
- 1791 `docs.agora.io` link occurrences.
- 66 unique `docs.agora.io` URLs.
- 49 unique URLs returning 404.
- 15 source API Reference page errors.

The repository already has a legacy redirect pipeline:

- Source rules live in `src/lib/legacy-sitemap/redirects.json`.
- `scripts/generate-legacy-redirect-artifacts.mjs` generates:
  - `src/lib/legacy-sitemap/static-redirects.json`
  - `vercel-legacy-redirects.json`
  - `vercel.json`
- Vercel bulk and query redirects are the primary production 301 path.
- Static redirects are the client/app fallback path.

This design defines how to turn the API Reference link audit into a reviewed,
testable set of 301 redirect fixes.

## Goals

- Triage the current API Reference `docs.agora.io` audit report into explicit
  redirect decisions.
- Add 301 redirects only when there is a high-confidence, semantically
  equivalent target page in the current docs portal.
- Verify every new redirect target exists before adding it to the redirect
  source rules.
- Regenerate committed redirect artifacts from the source rules.
- Keep a durable record of links that cannot be mapped yet so the owner can
  provide target URLs later.

## Non-Goals

- Do not add scheduled or recurring API Reference link audits in this work.
- Do not modify the API Reference generation system.
- Do not add approximate product-level fallback redirects for unmapped links.
- Do not redirect a legacy URL to a nearby but semantically different page.

## Output Artifacts

### Triage Report

Create `docs/agents/reports/2026-08-03-api-ref-docs-redirect-triage.md`.

The table must contain at least:

```md
| Legacy URL | Occurrences | Status | Legacy redirect | Source API refs | Anchor texts | Proposed target | Decision | Confidence | Evidence | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

The triage report is the review surface. It explains why each URL is or is not
eligible for a 301 redirect.

### Redirect Rules

Update `src/lib/legacy-sitemap/redirects.json` only for rows where:

- `Decision` is `add-301`.
- `Confidence` is `high`.
- `Proposed target` is verified to exist.

Each added rule must follow the existing schema:

- `legacyUrl`: Full original legacy URL.
- `legacyPath`: Path without query or fragment.
- `legacySearch`: Query string when the source URL requires a query-specific
  rule.
- `target`: Current docs portal route.
- `type`: Existing rule type such as `exact-slug`, `renamed-page`, or
  `semantic-page-match`.
- `confidence`: `high`.
- `evidence`: Concrete evidence for the mapping.
- `preserveSearch`: Explicit query-preservation behavior.

Do not use `product-fallback` for this work.

### Generated Redirect Artifacts

Run `scripts/generate-legacy-redirect-artifacts.mjs` after updating source
rules. The generated files must be committed with the source rule changes.

## Decision States

- `add-301`: A high-confidence equivalent target exists and has been verified.
- `fix-existing-redirect`: The report says a legacy redirect is covered, but
  the URL still returns 404. Existing redirect behavior needs correction.
- `update-api-ref-source`: No equivalent docs page exists; the API Reference
  source should be updated or the link removed.
- `no-equivalent`: The old page has no migrated equivalent and should not be
  redirected.
- `needs-target-from-owner`: The URL is a real 404 from API Reference, but no
  high-confidence target can be found. Do not add a redirect until the owner
  provides the target URL.
- `ignore-valid`: The URL already returns 200 or does not require a legacy
  redirect.
- `source-page-error`: The source API Reference page itself returns 404. This
  is not a docs redirect candidate.

## Candidate Selection

Parse the `## Unique docs.agora.io URLs` section from the audit report.

Default redirect candidates are rows where:

- `HTTP status` is `404`.
- `Legacy redirect` is `legacy redirect missing`.

Special handling:

- `HTTP status: 404` with `legacy redirect covered` becomes
  `fix-existing-redirect`.
- `HTTP status: 200` becomes `ignore-valid` unless there is a separate reason
  to inspect it.
- `## Page Errors` entries become `source-page-error` and are not considered
  for docs redirect rules.

## URL Grouping

Group candidates by path plus query, not by fragment.

Fragments must still be recorded in the triage evidence because they affect
anchor compatibility. For example, `/path#one` and `/path#two` should not
produce separate Vercel path redirects, but the triage row must document both
anchor expectations if both appear.

## Target Discovery

Use three evidence sources to find a proposed target:

- Legacy path and leaf slug matching against `content/docs/**`.
- Anchor text matching against current page titles and body content.
- Product IA mapping, such as:
  - Old `Video` paths to `/en/realtime-media/video`.
  - Old `Interactive Broadcast` paths to either
    `/en/realtime-media/interactive-live-streaming` or
    `/en/realtime-media/broadcast-streaming`, depending on the page semantics.
  - Old `whiteboard` or `interactive-whiteboard` paths to
    `/en/realtime-media/whiteboard`.

A candidate can be marked `add-301` only when the proposed target is both
semantically equivalent and route-verifiable.

## Target Verification

Every `add-301` target must pass these checks:

- The target maps to an existing `content/docs/{en,zh-CN}/**` file or an
  existing published docs route.
- The target is not another legacy URL.
- If the legacy URL has a query string, query behavior is explicit:
  - Preserve the query when the target page still uses it.
  - Do not preserve the query when the target route already encodes the
    platform or product selection.
- If the legacy URL has a fragment, one of these must be true:
  - The target page has the same anchor.
  - The target page has a clearly equivalent anchor.
  - The triage row explicitly records that the redirect intentionally degrades
    to page-level navigation.

## Implementation Boundaries

The implementation must stay inside the existing redirect system.

Allowed changes:

- Add the triage report.
- Add high-confidence rules to `src/lib/legacy-sitemap/redirects.json`.
- Regenerate redirect artifacts.
- Add or update focused tests for the new redirect behavior.

Avoid:

- Runtime-only redirect logic outside the existing legacy sitemap resolver.
- New redirect schemas unless the existing schema cannot represent a required
  case.
- Fallback redirects for URLs without a verified semantic target.
- Broad unrelated refactors.

## Testing

Run:

```sh
node scripts/generate-legacy-redirect-artifacts.mjs
node scripts/generate-legacy-redirect-artifacts.mjs --check
```

Run focused tests:

```sh
bunx vitest run \
  scripts/generate-legacy-redirect-artifacts.test.ts \
  src/lib/legacy-sitemap/static-redirects.test.ts \
  src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts
```

Tests should cover at least:

- A path-only legacy URL.
- A query-specific legacy URL.
- An encoded-space legacy path such as `/Interactive%20Broadcast/...`.
- A `needs-target-from-owner` triage row not appearing in generated artifacts.

For substantial redirect changes, also run:

```sh
bun run types:check
```

## Acceptance Criteria

- The triage report exists and covers all unique URLs from the audit report.
- Every 404 candidate has one explicit decision state.
- Every `add-301` row has high-confidence evidence and a verified target.
- No `needs-target-from-owner`, `update-api-ref-source`, or `no-equivalent`
  row is added to `redirects.json`.
- Generated redirect artifacts are up to date.
- Focused redirect tests pass.
- The final handoff can answer:
  - Which API Reference docs 404 links now have 301 redirects.
  - Which links were not redirected and why.
  - Which links need owner-provided target URLs.
  - How each new target was verified.
