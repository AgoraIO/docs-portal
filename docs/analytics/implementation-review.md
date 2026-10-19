# P0 implementation review — 2026-10-19

Runtime source: `7397701941746d664d2bc5ccbbd05786f4d96909`.
Base: `8240cacc776757682807d243cd79416c5e23c59f`.
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

- Full local production build passes: 6842 static payloads, 8045 machine-readable files, 7739 route HTML files; client and server compilation both pass.
- Focused runtime verification: 12 files / 136 tests pass.
- Type checking passes; changed runtime files pass Biome.
- Full suite: 2809 passed, 37 failed, 2 skipped. The clean base also fails (2765passed,56failed,2skipped). Current failed cases reproduced at base, except one timing timeout that passes in isolation. Existing migration/content and OpenAPI expectations remain outside this change.
- Repository-wide lint has existing formatting failures; changed-file checks pass.
- Mobile form:390px, visible controls usable, no horizontal overflow in mobile emulation.
- Actual compressed collector requests decoded for an email-shaped test query: no raw test address, URL query/hash or DOM text; search query is `[redacted]`.
- Quality runner checks retrieval in the top three document units, metadata compatibility, HTTP targets and static anchors. SDK/task correctness remains `not_reviewed` pending product-owner review.

Build #104 failed before deployment at server import protection. Build #105 now validates the corrected runtime source through the existing coverage/index/search/redirect/SSO gates. Staging release and real ingestion receipts will be recorded after successful deployment. Production rollout is outside this change; its P0 build flag stays disabled.

