# PR 1032 Search Review Blockers Design

## Goal

Resolve the five blocking findings in the latest review of PR #1032 with the smallest coherent change set. Preserve the approved search dialog UI and existing product behavior while fixing API query identity, federated participation, API-first promotion, malformed iOS target URLs, and the live PR regression gate.

The implementation uses the PR code against the shared read-only Algolia indices for Preview replay. It does not create or synchronize a per-PR index.

## Delivery Strategy

Work proceeds in dependency order:

1. Rebase the PR branch onto the latest `main` and establish a clean baseline.
2. Introduce one canonical API identity boundary, then use it for retrieval, admission, and strict exact-match promotion.
3. Make supported V2 searches consistently federated and preserve Documentation availability through a fixed retry sequence.
4. Normalize the confirmed malformed `language` query parameter before API results are aggregated or rendered.
5. Expand the golden cases and add shared-index live replay to the PR Preview job after deployment.

Each functional step starts with a failing focused test and is verified before moving to the next step.

## Canonical API Identity

Add a small search-domain boundary dedicated to API query identity. It owns:

- Recognition of an API-style identifier.
- Removal of supported query modifiers such as `api`, `method`, and `class` when exactly one API identifier remains.
- Retrieval aliases required by the live API index.
- Canonical aliases used to compare a query with a normalized API result.

The existing `API_RETRIEVAL_QUERY_ALIASES` and root-client aliases move behind this shared boundary instead of remaining independent rules in search intent and API result normalization.

For the RTC root client, the supported aliases continue to resolve to one canonical identity. In particular:

```text
RtcEngine
AgoraRtcEngineKit
IRtcEngine
IAgoraRtcClient
→ rtcengine
```

The retrieval query may still use an index-specific spelling such as `AgoraRtcEngineKit`, but admission and promotion compare canonical identities rather than the retrieval spelling.

Examples:

```text
setAudioProfile method
→ target: setAudioProfile
→ canonical identity: setaudioprofile
→ strict API exact match: yes

RtcEngine class
→ retrieval query: AgoraRtcEngineKit
→ canonical identity: rtcengine
→ strict API exact match against AgoraRtcEngineKit: yes

audio method
→ no API-style identifier
→ strict API exact match: no
```

## Search Data Flow

For every V2 search whose current scope supports API Reference:

1. Classify the documentation intent and parse the optional canonical API identity.
2. Build both the Documentation request and the strict API request.
3. Send them in one Algolia multi-index request.
4. Preserve Algolia order inside each source.
5. Map Documentation hits using the existing behavior.
6. Normalize API hits, apply strict admission, and aggregate admitted platform variants.
7. Render separate Documentation and API Reference sections.

An ordinary documentation query still searches the API index, but weak API hits do not enter the result model. For example, `voice agent quickstart` remains Documentation-first even if the API index returns candidates.

The API request keeps its strict query-time settings, including disabled typo tolerance, no word removal fallback, and strict prefix behavior.

## API Admission And Promotion

API admission and API-first promotion use the same canonical identity result.

Outside an explicit API Reference scope, an API candidate is admitted only when the existing API-task rules accept it or its canonical title/symbol identity strictly matches the parsed API query target. Generic modifier words do not count as the identity.

API-first ordering is enabled only when:

- The user explicitly selected API Reference scope; or
- At least one admitted API result has a strict canonical title/symbol match.

The presence of `api`, `method`, `class`, or another modifier alone does not promote the API section.

The result model retains `titleExactMatch` and `aliasesExactMatch`. `titleExactMatch` is true when a normalized candidate title or symbol directly equals the parsed API query target. `aliasesExactMatch` is true when their canonical identities are equal but their direct normalized spellings differ. Both fields are false when the query has no parsed API target. API-first promotion directly checks `titleExactMatch || aliasesExactMatch`; there is no separate promotion heuristic.

## Federated Error Handling

The retry sequence is fixed:

1. Send the Docs + API multi-index request.
2. If Docs succeeds but the API sub-result is missing or invalid, perform one API-only retry.
3. If the entire multi-index request rejects, perform one Docs-only retry directly. Do not attempt API-only first in this branch.
4. If Docs-only retry succeeds, return Documentation results with status `{ docs: 'success', api: 'error' }`.
5. If Docs-only retry fails, mark the search as failed and surface the existing unavailable state.

When the multi-index response contains a failed Docs result but a successful API result, retain the current product behavior and treat the overall search as failed. Changing the primary-source fallback policy is outside this work.

No retry is performed after a successful, well-formed empty API result.

## API URL Normalization

Normalize API URLs at the start of `normalizeApiHit`, before the URL contributes to IDs, canonical keys, representative selection, `platformUrls`, or UI navigation.

Only the `language` query parameter is normalized:

1. Read all `language` keys in URL order.
2. Split every value on commas.
3. Trim values and discard empty tokens.
4. Select the first remaining token in its original URL occurrence order.
5. Replace all `language` keys with one `language=<selected-value>` parameter.
6. If no non-empty token remains, remove `language` entirely.

The normalization contract also requires:

- An absolute input URL remains absolute.
- A site-relative input URL remains site-relative.
- The fragment remains byte-for-byte unchanged.
- All non-`language` query parameters are preserved.
- Multiple different language values deterministically select the first value in URL order; implementations must not rely on `Set` iteration or parameter reordering to define the winner.

This intentionally does not introduce a language allowlist or a general query-parameter whitelist.

Because normalized URLs enter the aggregation model, the UI does not need a second URL-repair layer. Selecting a platform variant and opening the result uses the already normalized URL.

## Golden Cases And Live Replay

Keep the existing unmodified API symbol cases and add these four regressions:

- `setAudioProfile method`
- `renewToken api`
- `joinChannel method`
- `RtcEngine class`

The approved live list therefore grows from 50 to 54 cases.

For aggregated SDK results, replay matching must not depend exclusively on the representative platform URL. When `expectedCanonicalKey` is present, replay locates the expected top-three result by that key and verifies that the expected target URL is either the representative `url` or one of the result's `platformUrls`. Documentation cases continue to use their expected URL.

The replay report is always fully constructed and written before a failed case causes a non-zero process exit status.

## PR Preview Gate

The Preview deployment job runs in this order:

1. Build and verify the Vercel output.
2. Deploy the Preview.
3. Write the workflow summary and publish or update the PR Preview URL comment.
4. Run the 54-case live replay with the PR code and shared read-only Algolia indices.
5. Upload the replay JSON artifact with `if: always()`.
6. Let the replay result determine whether the Preview check is green or red.

This ordering ensures a failed live replay blocks the check without hiding the deployed Preview URL needed for investigation.

The Preview gate uses only the search API key. It does not run `search:sync`, use an Algolia admin key, mutate the shared index, or attempt to validate branch-only documentation content that is not present in the shared index.

## Testing

Focused automated tests cover:

### Canonical identity and ordering

- `RtcEngine class` admits the live index spelling `AgoraRtcEngineKit`.
- All four modifier regressions produce a strict exact API match and API-first ordering.
- A weak query such as `audio method` remains Documentation-first.
- Explicit API Reference scope remains API-first.

### Federated request and errors

- Ordinary Documentation queries include Docs and API in the first request.
- Weak API hits are discarded after retrieval.
- A malformed API sub-result causes exactly one API-only retry.
- A rejected multi-index request causes exactly one Docs-only retry.
- Successful Docs-only retry produces `{ docs: 'success', api: 'error' }`.
- Failed Docs-only retry fails the whole search.
- A well-formed empty API result does not retry.

### URL normalization and navigation

- Absolute and site-relative input shapes are preserved.
- Repeated `language` keys are collapsed.
- Comma-separated duplicate values are collapsed.
- Different values select the first value in original URL order.
- Empty values remove the parameter.
- Other query parameters and the fragment remain unchanged.
- Selecting the iOS platform variant causes `window.open` to receive the normalized URL.

### Replay and workflow

- All 54 golden queries are declared.
- SDK replay can match an aggregated result by canonical key and platform URL.
- Replay writes its JSON report before returning a failing exit status.
- The Preview workflow deploys and publishes its URL before replay.
- Artifact upload runs with `if: always()`.

Final verification runs in this order:

1. Focused search, docs-shell, and i18n tests.
2. `bun run types:check`.
3. `bun run test`.
4. The 54-case live replay against the shared indices.
5. `git diff --check`.

## Scope Boundaries

This change does not:

- Replace the delimiter-based canonical key serializer.
- Consolidate all legacy and V2 Algolia request configuration.
- Create or synchronize per-PR Algolia indices.
- Change the search dialog UI, result limits, aggregation behavior, or platform priority.
- Change the API index or its source data.
- Introduce a general URL sanitizer or language allowlist.

## Acceptance Criteria

- All five blocking review findings have direct automated coverage.
- The four modifier queries return the intended API result in the top three against the shared live index.
- API-first ordering follows canonical strict exact match or explicit API Reference scope only.
- Ordinary supported V2 searches issue a federated request while retaining Documentation-first behavior when no strict API result exists.
- Malformed repeated iOS `language` values cannot reach platform navigation.
- A failed Preview replay leaves the Preview URL published and uploads its JSON evidence.
- Focused tests, type checking, the full test suite, all 54 live cases, and `git diff --check` pass after rebasing onto the latest `main`.
