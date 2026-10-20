# P0 implementation review — 2026-10-19

Final deployed runtime: `e113a424668dc9bf62477351a07dac2d3164a065`.
Functional staging baseline: `8802e22eface30960d2404d6c6f7235874870bfd` (build #107).
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

- Functional baseline `8802e22ef` completed the full local build with the exact staging configuration: 6844 payloads, 8050 machine-readable files, 7741 route HTML files. The normal client, server and static generation stages passed.
- Focused runtime verification: 13 files / 141 tests pass.
- Type checking passes; changed runtime files pass Biome.
- Full suite after incorporating the current Chinese base: 227 files pass; 2891 tests pass, 2 skipped. Earlier base failures were repaired by upstream changes.
- The 27 changed source files pass Biome.
- Mobile form:390px, visible controls usable, no horizontal overflow in mobile emulation.
- Actual compressed collector requests decoded for an email-shaped test query: no raw test address, URL query/hash or DOM text; search query is `[redacted]`.
- Quality runner checks retrieval in the top three document units, metadata compatibility, HTTP targets and static anchors. SDK/task correctness remains `not_reviewed` pending product-owner review.

## Actual staging receipt

Build [#107](https://web-jenkins.agoralab.co/job/docs-portal-2026/job/hci-master/107/console) succeeded. Source `8802e22ef` passed index coverage, preparation and promotion; all 8216 legacy redirects and 5 exclusions; frontend/source identity; health, aggregated search, platform filters, pagination and login redirects.

Actual browser visits on that release produced all nine P0 event types in PostHog 509917, with the staging host/environment/source. Received counts matched distinct event IDs. Dialog keyboard/mouse, same-document selection, full-page filters/load more, controlled request failure/retry and new-tab arrivals were linked. Actual MDX, OpenAPI and restored-platform bodies were observed.

The shared SQL returned the final modified answers and withdrawn reasons. Search-page feedback cleared the previous document attribution; page helpfulness retained its own page scope. All three marked test journeys were immature at query time; none is a production business measurement. The noopener tab does not inherit the tab-local test marker, so that arrival was correlated by explicit journey/search IDs and remains excluded from production by host/environment.

Five actual gzip collector packets passed the email/query/hash/DOM-text/recording check. All 20 retrieval cases passed on source `8802e22ef`; SDK task correctness remains unreviewed. English routes are not published in this Chinese build; the Chinese-only gate is unit-tested rather than claimed as a live rendered-English check.

Curated receipts: [events](evidence/2026-10-19-b107/events.json), [renderers](evidence/2026-10-19-b107/renderers.json), [search lifecycle](evidence/2026-10-19-b107/search-lifecycle.json), [final feedback facts](evidence/2026-10-19-b107/feedback-facts.json), [privacy](evidence/2026-10-19-b107/outbound-privacy.json), [retrieval](evidence/2026-10-19-b107/retrieval-quality.json), [pipeline](evidence/2026-10-19-b107/pipeline.json).

## Final UI follow-up

Screenshot inspection on staging found weak selected-state contrast in dark mode. Source `e113a4246` adds an opt-in semantic-color toggle variant for the three feedback groups. The focused test, two-file Biome check, type check and full suite (227 files; 2891 pass, 2 skipped) pass. Both independent reviews cleared this UI-only delta.

Build [#108](https://web-jenkins.agoralab.co/job/docs-portal-2026/job/hci-master/108/console) completed the full normal build and staging release successfully. Index preparation/promotion/verification, 8216 redirects, 5 exclusions, frontend source, health, search, platform filtering, pagination and login checks all passed. Frontend, backend and index point to the final source. Production was not deployed.

Actual final-source visits independently received all nine P0 types in PostHog 509917; received counts matched distinct event IDs. Dialog keyboard selection linked to its visible body. Full search retained one logical search across controlled failure and retry. Shared SQL returned the final withdrawn reason set, cleared search-page document attribution and kept page helpfulness on its original document view. Both marked journeys are immature; test data is excluded from production business metrics.

Ten decoded final-source collector events passed synthetic-email redaction, canonical URL, DOM-text and recording checks. The 20 retrieval cases passed again after the final index activation. SDK/task correctness remains `not_reviewed`.

Final evidence: [pipeline and digests](evidence/2026-10-19-b108/pipeline.json), [nine event types](evidence/2026-10-19-b108/events.json), [shared search facts](evidence/2026-10-19-b108/search-facts.json), [final feedback facts](evidence/2026-10-19-b108/feedback-facts.json), [outbound privacy](evidence/2026-10-19-b108/outbound-privacy.json), [retrieval quality](evidence/2026-10-19-b108/retrieval-quality.json), [actual staging screenshots](evidence/2026-10-19-b108/screenshots.json).

Desktop dark/light and 390px mobile screenshots in PR #1212 come from the final deployed staging source. Computed selected colors have clear foreground/background contrast in both themes. Mobile document width equals its 390px viewport. Temporary network blocks and device emulation were cleared; the local preview server and temporary verification tabs were closed.

Build #104 failed before deployment at server import protection; the boundary is fixed. Build #105 was cancelled before deployment to incorporate the newer Chinese base. Another user’s #106 was untouched and timed out before deployment. Production rollout is outside this change; its P0 build flag stays disabled.

## Merge integration — 2026-10-20

Chinese target `58245f6cf` includes prefixless search URLs and newer accordion behavior. Runtime `f32e201fcc5756ebaae6e7502d7262154504779d` incorporates that target, preserves both the visible-body ref and the accordion content key, and normalizes new/old Chinese URL aliases to the historical document identity. Previously stored same-tab and new-tab targets are normalized at restoration too.

The browser adapter requires the Chinese build, the explicit P0 flag and a Chinese route. A second guard prevents the global build from sending P0 facts even if the flag is accidentally enabled. The English SDK retains its existing event properties and page helpfulness. No English content or OpenAPI source files differ from the Chinese target.

Final checks: 241 test files pass, 3120 tests pass and 2 skip; type checking and changed-source Biome pass. Both independent review axes cleared the restored-target regression after its two adapter tests passed. The deployment scripts also pass all 21 tests.

These are integration checks, not a new staging deployment. Actual staging screenshots and collector receipts above remain pinned to build #108/source `e113a4246`. Production remains undeployed with P0 disabled. Bitbucket deployment PR #7 still requires one reviewer approval before merge.
