# P0 implementation review — 2026-10-19

Runtime source: `68ef9a31859f366d79f8d6f5d314bbfdaebc1111`.
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

- Focused runtime verification: 10files / 133tests pass.
- Type checking passes; changed runtime files pass Biome.
- Full suite: 2791passed,37failed,2skipped. The clean base also fails (2765passed,56failed,2skipped). Current failed cases reproduced at base, except one timing timeout that passes in isolation. Existing migration/content and OpenAPI expectations remain outside this change.
- Repository-wide lint has existing formatting failures; changed-file checks pass.
- Mobile form:390px, visible controls usable, no horizontal overflow in mobile emulation.
- Actual compressed collector requests decoded for an email-shaped test query: no raw test address, URL query/hash or DOM text; search query is `[redacted]`.
- Quality runner checks retrieval in the top three document units, metadata compatibility, HTTP targets and static anchors. SDK/task correctness remains `not_reviewed` pending product-owner review.

Staging release and real ingestion receipts are recorded separately after deployment. Production rollout is outside this change; its P0 build flag stays disabled.

