# P0 implementation review — 2026-10-19

Runtime source: `8802e22eface30960d2404d6c6f7235874870bfd`.
Base: `7c6c60ead44406e69906c5c3808cd489784aa89e`.
Deployment recipe: `01f509a7f179f24e800b5ab88b8a7b8d1cd38e07`.

## Standards review

Two independent reviews covered repository standards and P0 behavior. No standards exception or approval is needed.

Resolved findings:

- Record a full-page search failure only when its current error state is actually displayed.
- Invalidate held search snapshots on explicit journey reset, idle expiry and account changes.
- Normalize product/platform metadata, preserve filter timing and match content-type filter fields.
- Carry invitation eligibility, selection and frequency status separately.
- Remove background body context from search feedback.
- Reobserve the visible body after a same-document selection or explicit task reset; pause background body visibility while a search dialog covers it.
- Defer and coalesce visibility checks until the animation frame, so a restored platform preference cannot record an unpainted default platform. A real provider + measurement hook regression reproduced the issue before the fix and passes after it.
- Filter DOM mutation records so unrelated animations/content do not repeat layout checks.
- Put the browser adapter behind Start isomorphic functions. The production compiler smoke check confirms the client module is absent from the server output.
- Derive content surface on body facts; select search origin from its submitted fact.
- Derive the SQL scan start from the selected cohort date instead of silently dropping dates older than31days.
- Validate returned product/platform/version metadata in quality checks.

## Spec review

Resolved findings:

- Preserve millisecond event order and response revision when selecting the final answer.
- Take response and nullable document attribution in one tuple, so a search revision can clear a previous page.
- Keep repeated identical answers from resetting the confirmation-time anchor.
- Preserve unresponded journeys, immature cohorts, late answers, and unknown search attribution.
- Keep zero-result searches separate from requests that failed; count logical searches rather than requests/retries/pages.

The SQL-only regression fixture runs without inserting fake events. Actual marked local browser data also validated final feedback attribution, search origin, content surface membership and privacy.

## Verification scope

- Current candidate `8802e22ef` completed the full local build with the exact staging configuration: 6844 payloads, 8050 machine-readable files, 7741 route HTML files. The normal client, server and static generation stages passed.
- Focused runtime verification: 13 files / 141 tests pass.
- Type checking passes; changed runtime files pass Biome.
- Full suite after incorporating the current Chinese base: 227 files pass; 2891 tests pass, 2 skipped. Earlier base failures were repaired by upstream changes.
- The 27 changed source files pass Biome.
- Mobile form:390px, visible controls usable, no horizontal overflow in mobile emulation.
- Actual compressed collector requests decoded for an email-shaped test query: no raw test address, URL query/hash or DOM text; search query is `[redacted]`.
- Quality runner checks retrieval in the top three document units, metadata compatibility, HTTP targets and static anchors. SDK/task correctness remains `not_reviewed` pending product-owner review.

Build #104 failed before deployment at server import protection. Build #105 was cancelled before deployment to incorporate the newer Chinese base. Build #107 is queued behind another user’s #106; that build is unchanged. The current candidate includes the platform-preference paint regression fix and passes all tests. Staging release and real ingestion receipts will be recorded after successful deployment. Production rollout is outside this change; its P0 build flag stays disabled.

