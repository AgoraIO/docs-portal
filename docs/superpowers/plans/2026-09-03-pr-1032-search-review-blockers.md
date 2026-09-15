# PR 1032 Search Review Blockers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the five blocking findings on PR #1032 while preserving the approved search UI and limiting changes to search semantics, API URL normalization, regression evidence, and Preview gating.

**Architecture:** Introduce one focused API query identity module shared by intent parsing, API admission, and exact-match ordering. Run every supported V2 query as a Docs + API federated request with a fixed fallback state machine, normalize only the `language` URL parameter before aggregation, and gate Preview after deployment with 54 shared-index golden queries.

**Tech Stack:** TypeScript, React 19, Algolia JavaScript client 5.56, Vitest, Testing Library, Bun, GitHub Actions, Vercel.

**Approved design:** `docs/superpowers/specs/2026-09-03-pr-1032-search-review-blockers-design.md`

---

## File Map

- Create `src/lib/search/api-query-identity.ts`: parse API-style query targets, own modifier and root-client aliases, and calculate direct/canonical exact matches.
- Create `src/lib/search/api-query-identity.test.ts`: lock query parsing, retrieval aliases, and exact-match semantics.
- Create `src/lib/search/api-url-normalizer.ts`: normalize only the `language` query parameter while preserving URL shape and fragment.
- Create `src/lib/search/api-url-normalizer.test.ts`: lock absolute/relative, ordering, empty-value, and fragment behavior.
- Modify `src/lib/search/search-intent.ts` and `src/lib/search/search-intent.test.ts`: consume the shared API symbol recognizer and retrieval query helper.
- Modify `src/lib/search/api-result-normalizer.ts` and `src/lib/search/api-result-normalizer.test.ts`: consume shared canonical aliases and normalized URLs before identity and aggregation.
- Modify `src/lib/search/algolia-client.ts` and `src/lib/search/algolia-client.test.ts`: always federate supported V2 searches, use exact-match fields for admission/promotion, and implement the retry state machine.
- Modify `src/components/docs-shell/DocsSearchDialog.test.tsx`: prove the selected platform opens the normalized iOS URL.
- Modify `src/lib/search/golden-search-queries.ts` and `src/lib/search/golden-search-queries.test.ts`: expand the approved corpus to 54 cases and align SDK evidence with the shared live index.
- Modify `src/lib/search/golden-search-replay.ts` and `src/lib/search/golden-search-replay.test.ts`: match aggregated SDK results by canonical key plus representative/platform URL.
- Create `scripts/replay-algolia-search-report.ts` and `scripts/replay-algolia-search-report.test.ts`: write replay evidence before returning the exit code.
- Modify `scripts/replay-algolia-search.ts`: delegate report output and set `process.exitCode` only after the report is written.
- Create `scripts/vercel-deploy-workflow.test.ts`: lock Preview deployment/comment/replay/artifact ordering.
- Modify `.github/workflows/vercel-deploy.yml`: run shared-index replay after publishing the Preview URL and always upload evidence.

### Task 1: Rebase And Establish The Baseline

**Files:**
- No intentional source changes.
- Existing design commit remains on the branch.

- [ ] **Step 1: Confirm the isolated worktree and clean state**

```bash
pwd
git status --short --branch
git rev-parse --show-toplevel
```

Expected: the worktree is `pr-1032-comment-analysis`, the branch is `codex/pr-1032-comment-analysis`, and there are no uncommitted files.

- [ ] **Step 2: Fetch and rebase onto current main**

```bash
git fetch origin main codex/global-search-ranking-v2
git rebase origin/main
```

Expected: the PR commits and the design commit are replayed onto the current `origin/main`. Resolve only conflicts involving the PR changes; do not restore files intentionally removed by `main`.

- [ ] **Step 3: Install the rebased dependency set**

```bash
bun install --frozen-lockfile
```

Expected: install succeeds without changing `bun.lock`.

- [ ] **Step 4: Run the focused baseline**

```bash
bun run test \
  src/components/docs-shell/DocsSearchDialog.test.tsx \
  src/lib/i18n/i18n-config.test.ts \
  src/lib/search/algolia-client.test.ts \
  src/lib/search/algolia-config.test.ts \
  src/lib/search/algolia-records.server.test.ts \
  src/lib/search/api-result-normalizer.test.ts \
  src/lib/search/docs-search-navigation.test.ts \
  src/lib/search/golden-search-queries.test.ts \
  src/lib/search/golden-search-replay.test.ts \
  src/lib/search/orama-client.test.ts \
  src/lib/search/search-intent.test.ts \
  src/lib/search/search-provider.test.ts
```

Expected: all tests in the 12 selected files pass. Record the baseline count because rebasing onto newer `main` may change it from the 332 tests observed during review.

- [ ] **Step 5: Run the full rebased baseline**

```bash
bun run test
bun run types:check
git status --short
```

Expected: the full test suite and type check pass, and the worktree remains clean. If `main` itself has a reproducible unrelated failure, record the exact command and failure, stop, and ask the user whether to proceed; do not change unrelated content to make this PR green.

### Task 2: Centralize Canonical API Query Identity

**Files:**
- Create: `src/lib/search/api-query-identity.ts`
- Create: `src/lib/search/api-query-identity.test.ts`
- Modify: `src/lib/search/search-intent.ts`
- Modify: `src/lib/search/search-intent.test.ts`
- Modify: `src/lib/search/api-result-normalizer.ts`
- Test: `src/lib/search/api-result-normalizer.test.ts`

- [ ] **Step 1: Write failing API identity tests**

Create `src/lib/search/api-query-identity.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  canonicalizeApiSymbol,
  getApiIdentityMatch,
  getApiRetrievalQuery,
  parseApiQueryIdentity,
} from './api-query-identity';

describe('API query identity', () => {
  it.each([
    ['setAudioProfile method', 'setAudioProfile', 'setaudioprofile'],
    ['renewToken api', 'renewToken', 'renewtoken'],
    ['joinChannel method', 'joinChannel', 'joinchannel'],
    ['RtcEngine class', 'RtcEngine', 'rtcengine'],
  ])('parses %s', (query, target, canonicalTarget) => {
    expect(parseApiQueryIdentity(query)).toMatchObject({
      canonicalTarget,
      target,
    });
  });

  it('does not treat a generic word plus modifier as an API target', () => {
    expect(parseApiQueryIdentity('audio method')).toBeUndefined();
  });

  it.each([
    ['RtcEngine', 'rtcengine'],
    ['AgoraRtcEngineKit', 'rtcengine'],
    ['IRtcEngine', 'rtcengine'],
    ['IAgoraRtcClient', 'rtcengine'],
  ])('canonicalizes %s as the RTC root client', (value, expected) => {
    expect(canonicalizeApiSymbol(value)).toBe(expected);
  });

  it('uses the live-index spelling for RtcEngine retrieval', () => {
    expect(getApiRetrievalQuery('RtcEngine class')).toBe('AgoraRtcEngineKit');
  });

  it('distinguishes direct and alias exact matches', () => {
    expect(
      getApiIdentityMatch(
        ['setAudioProfile(_:)', 'setAudioProfile'],
        parseApiQueryIdentity('setAudioProfile method'),
      ),
    ).toEqual({ aliasesExactMatch: false, titleExactMatch: true });
    expect(
      getApiIdentityMatch(
        ['AgoraRtcEngineKit'],
        parseApiQueryIdentity('RtcEngine class'),
      ),
    ).toEqual({ aliasesExactMatch: true, titleExactMatch: false });
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

```bash
bun run test src/lib/search/api-query-identity.test.ts
```

Expected: FAIL because `api-query-identity.ts` does not exist.

- [ ] **Step 3: Implement the identity boundary**

Create `src/lib/search/api-query-identity.ts`:

```ts
import { compactSearchText } from './search-normalization';

const API_QUERY_MODIFIER_TERMS = new Set([
  'api',
  'class',
  'enum',
  'function',
  'interface',
  'method',
  'parameter',
  'property',
]);

const ROOT_CLIENT_ALIASES = new Set([
  'irtcengine',
  'agorartcenginekit',
  'rtcengine',
  'iagorartcclient',
]);

const API_RETRIEVAL_ALIASES = new Map([
  ['rtcengine', 'AgoraRtcEngineKit'],
]);

export type ApiQueryIdentity = {
  canonicalTarget: string;
  retrievalQuery: string;
  target: string;
};

export type ApiIdentityMatch = {
  aliasesExactMatch: boolean;
  titleExactMatch: boolean;
};

export function canonicalizeApiSymbol(value: string) {
  const normalized = compactSearchText(value);
  return ROOT_CLIENT_ALIASES.has(normalized) ? 'rtcengine' : normalized;
}

export function isApiSymbol(value: string) {
  if (/\s/u.test(value)) return false;
  const compact = value.replace(/\s+/gu, '');
  if (!compact || compact.length < 2) return false;
  const identifier = compact.replace(/\(\)$/u, '');
  const hasCamelBoundary = /[a-z][A-Z]/u.test(identifier);
  const hasPascalBoundary =
    /[a-z]/u.test(identifier) && /[A-Z].*[A-Z]/u.test(identifier);
  const isIdentifier = /^[A-Za-z][A-Za-z\d]*$/u.test(identifier);
  const isDelimitedIdentifier =
    /^[A-Za-z][A-Za-z\d]*(?:(?:\.|::|->)[A-Za-z][A-Za-z\d]*)+$/u.test(
      identifier,
    );
  const hasCallSyntax = compact.endsWith('()');
  const hasApiPunctuation =
    (hasCallSyntax ? isIdentifier : isDelimitedIdentifier) &&
    (hasCamelBoundary || hasPascalBoundary);
  return hasApiPunctuation || hasCamelBoundary || hasPascalBoundary;
}

export function parseApiQueryIdentity(
  query: string,
): ApiQueryIdentity | undefined {
  const normalized = query.normalize('NFKC').trim();
  const directTarget = isApiSymbol(normalized) ? normalized : undefined;
  const modifierTarget = directTarget
    ? undefined
    : (normalized.match(/[A-Za-z][A-Za-z\d]*/gu) ?? []).filter(
        (token) =>
          !API_QUERY_MODIFIER_TERMS.has(token.toLowerCase()) &&
          isApiSymbol(token),
      );
  const target = directTarget ??
    (modifierTarget?.length === 1 ? modifierTarget[0] : undefined);
  if (!target) return undefined;
  const canonicalTarget = canonicalizeApiSymbol(target);
  return {
    canonicalTarget,
    retrievalQuery: API_RETRIEVAL_ALIASES.get(canonicalTarget) ?? target,
    target,
  };
}

export function getApiRetrievalQuery(query: string) {
  return parseApiQueryIdentity(query)?.retrievalQuery ?? query;
}

export function getApiIdentityMatch(
  fields: Array<string | undefined>,
  identity: ApiQueryIdentity | undefined,
): ApiIdentityMatch {
  if (!identity) {
    return { aliasesExactMatch: false, titleExactMatch: false };
  }
  const usableFields = fields.filter(
    (field): field is string => typeof field === 'string' && field.length > 0,
  );
  const directTarget = compactSearchText(identity.target);
  const titleExactMatch = usableFields.some(
    (field) => compactSearchText(field) === directTarget,
  );
  const canonicalMatch = usableFields.some(
    (field) => canonicalizeApiSymbol(field) === identity.canonicalTarget,
  );
  return {
    aliasesExactMatch: !titleExactMatch && canonicalMatch,
    titleExactMatch,
  };
}
```

- [ ] **Step 4: Make search intent consume the shared recognizer**

In `src/lib/search/search-intent.ts`, import `isApiSymbol` from `./api-query-identity`. Delete the local `API_RETRIEVAL_QUERY_ALIASES`, `API_QUERY_MODIFIER_TERMS`, `getApiRetrievalQuery`, and `isApiSymbol` implementations. Keep `getDocsRetrievalQuery` in this file.

In `src/lib/search/search-intent.test.ts`, move the `getApiRetrievalQuery` table to the new identity test and keep classification assertions unchanged.

- [ ] **Step 5: Make API normalization consume the shared root alias**

In `src/lib/search/api-result-normalizer.ts`, import `canonicalizeApiSymbol` and replace the local alias set with:

```ts
function canonicalRootClientAlias(value: string) {
  return canonicalizeApiSymbol(stripDoxygenPagePrefix(value).name);
}
```

Delete the local `ROOT_CLIENT_ALIASES` constant. Do not change canonical key serialization in this task.

- [ ] **Step 6: Run identity, intent, and normalizer tests**

```bash
bun run test \
  src/lib/search/api-query-identity.test.ts \
  src/lib/search/search-intent.test.ts \
  src/lib/search/api-result-normalizer.test.ts
bun run types:check
```

Expected: all selected tests and type checking pass.

- [ ] **Step 7: Commit the shared identity boundary**

```bash
git add \
  src/lib/search/api-query-identity.ts \
  src/lib/search/api-query-identity.test.ts \
  src/lib/search/search-intent.ts \
  src/lib/search/search-intent.test.ts \
  src/lib/search/api-result-normalizer.ts \
  src/lib/search/api-result-normalizer.test.ts
git commit -m "fix: unify API search identity"
```

### Task 3: Tie Admission And API-First Ordering To Exact Identity

**Files:**
- Modify: `src/lib/search/algolia-client.ts`
- Test: `src/lib/search/algolia-client.test.ts`

- [ ] **Step 1: Add failing modifier and weak-signal tests**

Add a table-driven test beside the existing V2 modifier tests in `src/lib/search/algolia-client.test.ts`:

```ts
it.each([
  ['setAudioProfile method', 'setAudioProfile', 'setaudioprofile'],
  ['renewToken api', 'renewToken', 'renewtoken'],
  ['joinChannel method', 'joinChannel', 'joinchannel'],
  ['RtcEngine class', 'AgoraRtcEngineKit', 'rtcengine'],
])('promotes a strict API identity for %s', async (query, symbol, keyPart) => {
  const searchForHits = vi.fn().mockResolvedValue({
    results: [
      { hits: [docsHit({ objectID: `docs:${query}` })] },
      {
        hits: [
          apiHit({
            hierarchy: {
              lvl0: 'API Reference ❯ Video SDK ❯ iOS ❯ 4.x',
              lvl1: symbol,
            },
            objectID: `api:${query}`,
            platform: 'ios',
            product: 'video-sdk',
            url:
              query === 'RtcEngine class'
                ? 'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit'
                : `https://api-ref.agora.io/${keyPart}`,
          }),
        ],
      },
    ],
  });
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const results = await createClient().search(query);

  expect(results[0]).toMatchObject({
    aliasesExactMatch: query === 'RtcEngine class',
    objectType: 'sdk-api',
    titleExactMatch: query !== 'RtcEngine class',
  });
});
```

Add a weak-signal test:

```ts
it('does not promote API candidates for a generic modifier query', async () => {
  const searchForHits = vi.fn().mockResolvedValue({
    results: [
      { hits: [docsHit({ objectID: 'audio-guide', title: 'Configure audio' })] },
      { hits: [apiHit({ hierarchy: { lvl1: 'AudioVolumeInfo' } })] },
    ],
  });
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const results = await createClient().search('audio method');

  expect(results.map(({ id }) => id)).toEqual(['audio-guide']);
});
```

- [ ] **Step 2: Run the focused client tests and verify RED**

```bash
bun run test src/lib/search/algolia-client.test.ts -t "strict API identity|generic modifier"
```

Expected: `RtcEngine class` is filtered out and exact fields for modifier queries are false.

- [ ] **Step 3: Parse identity once and use it for admission**

In `src/lib/search/algolia-client.ts`, import:

```ts
import {
  getApiIdentityMatch,
  getApiRetrievalQuery,
  parseApiQueryIdentity,
} from './api-query-identity';
```

Remove `getApiRetrievalQuery` from the `search-intent` import. At the beginning of `searchWithRankingV2`, add:

```ts
const apiIdentity = parseApiQueryIdentity(query);
```

Replace the explicit-signal fallback in API normalization with the shared match:

```ts
const normalizedApiEntries = (apiHits ?? []).flatMap((hit) => {
  const normalized = normalizeApiHit(hit, intent);
  if (!normalized) return [];
  const exactMatch = getApiIdentityMatch(
    [normalized.displayTitle, normalized.symbol],
    apiIdentity,
  );
  if (
    !admitApiHit(normalized, intent, apiScopeSelected) &&
    !exactMatch.titleExactMatch &&
    !exactMatch.aliasesExactMatch
  ) {
    return [];
  }
  return [{ hit, normalized }];
});
```

Delete `GENERIC_API_SIGNAL_TERMS` and `isStrictApiSignalFallbackMatch` from `algolia-client.ts`. Keep `hasExplicitApiSignal` temporarily because Task 4 has not yet replaced classifier-driven API request participation; Task 4 deletes it together with `shouldSearchApiImmediately`.

- [ ] **Step 4: Derive result fields and ordering from the same match**

Inside the aggregated API result mapping, compute:

```ts
const exactMatch = getApiIdentityMatch(
  [result.displayTitle, result.symbol],
  apiIdentity,
);
```

Spread `exactMatch` into the returned result and remove the previous calculations based on `intent.originalQuery` and `intent.normalizedQuery`:

```ts
return {
  ...exactMatch,
  allMajorTermsMatch,
  canonicalKey: result.canonicalKey,
  content: highlightedTitle,
  contentMatch: result.contentMatch,
  currentVersion: result.isCurrentVersion,
  id: result.id,
  intentMatch: result.symbolMatch || result.titleMatch || allMajorTermsMatch,
  objectType: 'sdk-api',
  path: result.path,
  platform: result.platforms,
  platformUrls: result.platformUrls,
  product: result.product,
  recordKind: 'sdk-symbol',
  sectionMatch: false,
  snippet: highlightedSnippet ?? result.snippet,
  title: highlightedTitle,
  titleMatch: result.titleMatch || result.symbolMatch,
  type: 'page',
  url: result.url,
  version: result.version,
};
```

Replace API-first selection with:

```ts
const apiFirst =
  apiScopeSelected ||
  apiCandidates.some(
    ({ aliasesExactMatch, titleExactMatch }) =>
      titleExactMatch || aliasesExactMatch,
  );
```

- [ ] **Step 5: Run client and identity tests and verify GREEN**

```bash
bun run test \
  src/lib/search/api-query-identity.test.ts \
  src/lib/search/algolia-client.test.ts \
  src/lib/search/api-result-normalizer.test.ts
bun run types:check
```

Expected: all tests pass; modifier queries promote only strict canonical matches.

- [ ] **Step 6: Commit exact admission and ordering**

```bash
git add src/lib/search/algolia-client.ts src/lib/search/algolia-client.test.ts
git commit -m "fix: promote exact API search matches"
```

### Task 4: Make V2 Consistently Federated With Fixed Fallbacks

**Files:**
- Modify: `src/lib/search/algolia-client.ts`
- Test: `src/lib/search/algolia-client.test.ts`

- [ ] **Step 1: Replace the task-query request test with a failing federated assertion**

Replace the current `does not request the SDK API index for a task query` test with:

```ts
it('requests both indices for a supported Documentation query', async () => {
  const searchForHits = vi.fn().mockResolvedValue({
    results: [{ hits: [docsHit()] }, { hits: [] }],
  });
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient();
  const results = await client.search('voice agent quickstart');

  expect(searchForHits).toHaveBeenCalledTimes(1);
  expect(searchForHits).toHaveBeenCalledWith({
    requests: [
      expect.objectContaining({ indexName: 'docs_portal_en' }),
      expect.objectContaining({ indexName: 'agora_APIRefSearch' }),
    ],
  });
  expect(results[0]).toMatchObject({ id: 'guide' });
  expect(client.getLastStatus()).toEqual({
    api: 'success',
    docs: 'success',
  });
});
```

- [ ] **Step 2: Add the exact fallback-state tests**

Add these cases next to the V2 error tests:

```ts
it('retries only API when its multi-index sub-result is malformed', async () => {
  const searchForHits = vi
    .fn()
    .mockResolvedValueOnce({ results: [{ hits: [docsHit()] }, { error: 'bad' }] })
    .mockResolvedValueOnce({ results: [{ hits: [] }] });
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient();
  await client.search('voice agent quickstart');

  expect(searchForHits).toHaveBeenCalledTimes(2);
  expect(searchForHits.mock.calls[1][0].requests).toEqual([
    expect.objectContaining({ indexName: 'agora_APIRefSearch' }),
  ]);
  expect(client.getLastStatus()).toEqual({ api: 'success', docs: 'success' });
});

it('falls directly back to Docs when the multi-index request rejects', async () => {
  const searchForHits = vi
    .fn()
    .mockRejectedValueOnce(new Error('multi failed'))
    .mockResolvedValueOnce({ results: [{ hits: [docsHit()] }] });
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient();
  await expect(client.search('voice agent quickstart')).resolves.toHaveLength(1);

  expect(searchForHits).toHaveBeenCalledTimes(2);
  expect(searchForHits.mock.calls[1][0].requests).toEqual([
    expect.objectContaining({ indexName: 'docs_portal_en' }),
  ]);
  expect(client.getLastStatus()).toEqual({ api: 'error', docs: 'success' });
});

it('fails when the Docs-only retry also rejects', async () => {
  const docsError = new Error('docs failed');
  const searchForHits = vi
    .fn()
    .mockRejectedValueOnce(new Error('multi failed'))
    .mockRejectedValueOnce(docsError);
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient();
  await expect(client.search('voice agent quickstart')).rejects.toBe(docsError);
  expect(client.getLastStatus()).toEqual({ api: 'error', docs: 'error' });
});
```

Add the successful-empty case:

```ts
it('does not retry a well-formed empty API result', async () => {
  const searchForHits = vi.fn().mockResolvedValue({
    results: [{ hits: [docsHit()] }, { hits: [] }],
  });
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient();
  await client.search('voice agent quickstart');

  expect(searchForHits).toHaveBeenCalledTimes(1);
  expect(client.getLastStatus()).toEqual({ api: 'success', docs: 'success' });
});
```

Add this test helper inside the `ranking v2` describe block:

```ts
function federatedResponse({
  apiHits = [],
  docsHits = [docsHit()],
}: {
  apiHits?: Record<string, unknown>[];
  docsHits?: Record<string, unknown>[];
} = {}) {
  return { results: [{ hits: docsHits }, { hits: apiHits }] };
}
```

Use `federatedResponse` in every normal-success V2 test that currently returns Docs in one mock call and API in a second mock call. This includes exact symbols, modifier queries, API tasks, aggregation, explicit API scope, and status sequencing. Keep a missing or malformed second result only in the API-only retry tests from this task.

Replace the existing explicit-scope test with:

```ts
it('keeps explicit API Reference scope API-first without an exact query', async () => {
  const searchForHits = vi.fn().mockResolvedValue(
    federatedResponse({
      apiHits: [apiHit({ objectID: 'scoped-api-result' })],
    }),
  );
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient({
    scope: { field: 'tab', value: 'api-reference' },
  });
  const results = await client.search('voice agent quickstart');

  expect(searchForHits).toHaveBeenCalledTimes(1);
  expect(results[0]).toMatchObject({
    id: 'scoped-api-result',
    objectType: 'sdk-api',
  });
});
```

Delete the obsolete `requests an API fallback only after docs are empty and the query has an API signal` test; the ordinary federated test and well-formed-empty test now cover the intended behavior.

Update the stale-status test to model the Docs-only retry of the rejected old request without overwriting the newer status:

```ts
it('does not let an older failed search overwrite the latest successful status', async () => {
  let rejectOldSearch: ((reason: Error) => void) | undefined;
  const oldSearchResult = new Promise<never>((_resolve, reject) => {
    rejectOldSearch = reject;
  });
  const oldError = new Error('Old docs request failed');
  const searchForHits = vi
    .fn()
    .mockReturnValueOnce(oldSearchResult)
    .mockResolvedValueOnce(federatedResponse())
    .mockRejectedValueOnce(oldError);
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

  const client = createClient();
  const oldSearch = client.search('voice agent quickstart');
  await expect(client.search('screen sharing')).resolves.toHaveLength(1);
  expect(client.getLastStatus()).toEqual({ api: 'success', docs: 'success' });

  rejectOldSearch?.(oldError);
  await expect(oldSearch).rejects.toBe(oldError);
  expect(client.getLastStatus()).toEqual({ api: 'success', docs: 'success' });
});
```

- [ ] **Step 3: Run the new federated tests and verify RED**

```bash
bun run test src/lib/search/algolia-client.test.ts -t "supported Documentation|retries only API|falls directly|Docs-only|empty API"
```

Expected: the ordinary query sends only Docs and whole-request rejection does not recover.

- [ ] **Step 4: Build both requests for every supported scope**

In `searchWithRankingV2`, replace classifier-driven request selection with:

```ts
const apiRequested = canSearchApi ? apiReferenceIndexName : undefined;
const docsRequest = buildDocsSearchRequest({
  indexName,
  locale,
  platform,
  query: getDocsRetrievalQuery(retrievalQuery),
  scope,
});
const apiRequest = apiRequested
  ? buildApiSearchRequest({
      apiReferenceIndexName: apiRequested,
      platform,
      query: getApiRetrievalQuery(retrievalQuery),
      scope,
    })
  : undefined;
```

The first call uses:

```ts
requests: [docsRequest, ...(apiRequest ? [apiRequest] : [])],
```

Remove `shouldSearchApiImmediately` and the now-unused `hasExplicitApiSignal` helper.

- [ ] **Step 5: Implement the fixed whole-request fallback**

Use one flag to prevent API-only retry after a whole-request failure:

```ts
let searchResponse: unknown;
let multiRequestRejected = false;
try {
  searchResponse = await client.searchForHits({
    requests: [docsRequest, ...(apiRequest ? [apiRequest] : [])],
  });
} catch (error) {
  if (!apiRequest) {
    setStatus({ api: 'not-requested', docs: 'error' });
    throw error;
  }
  multiRequestRejected = true;
  try {
    searchResponse = await client.searchForHits({ requests: [docsRequest] });
  } catch (docsError) {
    setStatus({ api: 'error', docs: 'error' });
    throw docsError;
  }
}

const docsResult = getResultAt(searchResponse, 0);
let apiResult =
  apiRequest && !multiRequestRejected ? getResultAt(searchResponse, 1) : undefined;

if (apiRequest && !multiRequestRejected && !getResultHits(apiResult)) {
  try {
    const retryResponse = await client.searchForHits({ requests: [apiRequest] });
    apiResult = getResultAt(retryResponse, 0);
  } catch {
    apiResult = undefined;
  }
}
```

When setting the successful Docs status, use:

```ts
setStatus({
  api: apiRequest
    ? multiRequestRejected
      ? 'error'
      : apiSucceeded
        ? 'success'
        : 'error'
    : 'not-requested',
  docs: 'success',
});
```

- [ ] **Step 6: Run the complete client suite and type check**

```bash
bun run test src/lib/search/algolia-client.test.ts
bun run types:check
```

Expected: all client tests pass and ordinary queries make one two-index call.

- [ ] **Step 7: Commit federated request and fallback behavior**

```bash
git add src/lib/search/algolia-client.ts src/lib/search/algolia-client.test.ts
git commit -m "fix: federate V2 search requests"
```

### Task 5: Normalize API Language URLs Before Aggregation

**Files:**
- Create: `src/lib/search/api-url-normalizer.ts`
- Create: `src/lib/search/api-url-normalizer.test.ts`
- Modify: `src/lib/search/api-result-normalizer.ts`
- Test: `src/lib/search/api-result-normalizer.test.ts`
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Write failing URL contract tests**

Create `src/lib/search/api-url-normalizer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeApiReferenceUrl } from './api-url-normalizer';

describe('normalizeApiReferenceUrl', () => {
  it('deduplicates an absolute comma-separated language value', () => {
    expect(
      normalizeApiReferenceUrl(
        'https://api-ref.agora.io/method?foo=1&language=objc,objc&bar=2#app-main',
      ),
    ).toBe(
      'https://api-ref.agora.io/method?foo=1&language=objc&bar=2#app-main',
    );
  });

  it('keeps a relative URL relative and chooses the first non-empty value', () => {
    expect(
      normalizeApiReferenceUrl(
        '/method?language=&keep=a&language=swift,objc#section%201',
      ),
    ).toBe('/method?language=swift&keep=a#section%201');
  });

  it('chooses the first distinct value in URL order', () => {
    expect(
      normalizeApiReferenceUrl(
        '/method?language=swift,objc&language=objc#fragment',
      ),
    ).toBe('/method?language=swift#fragment');
  });

  it('removes language when every value is empty', () => {
    expect(
      normalizeApiReferenceUrl('/method?language=,&keep=1&language=#fragment'),
    ).toBe('/method?keep=1#fragment');
  });

  it('returns a URL without language unchanged', () => {
    const url = '/method?keep=a%20b#fragment';
    expect(normalizeApiReferenceUrl(url)).toBe(url);
  });

  it('preserves unrelated query segments byte-for-byte', () => {
    expect(
      normalizeApiReferenceUrl(
        '/method?keep=a%20b&language=objc,objc&encoded=%2Fvalue#fragment',
      ),
    ).toBe(
      '/method?keep=a%20b&language=objc&encoded=%2Fvalue#fragment',
    );
  });
});
```

- [ ] **Step 2: Run the URL test and verify RED**

```bash
bun run test src/lib/search/api-url-normalizer.test.ts
```

Expected: FAIL because `api-url-normalizer.ts` does not exist.

- [ ] **Step 3: Implement deterministic language normalization**

Create `src/lib/search/api-url-normalizer.ts`:

```ts
export function normalizeApiReferenceUrl(value: string) {
  const fragmentIndex = value.indexOf('#');
  const fragment = fragmentIndex >= 0 ? value.slice(fragmentIndex) : '';
  const withoutFragment =
    fragmentIndex >= 0 ? value.slice(0, fragmentIndex) : value;
  const queryIndex = withoutFragment.indexOf('?');
  if (queryIndex < 0) return value;

  const prefix = withoutFragment.slice(0, queryIndex);
  const segments = withoutFragment.slice(queryIndex + 1).split('&');
  const retained: string[] = [];
  let firstLanguage: string | undefined;
  let languageInsertionIndex: number | undefined;

  for (const segment of segments) {
    const parsedSegment = new URLSearchParams(segment);
    const key = [...parsedSegment.keys()][0];
    if (key !== 'language') {
      retained.push(segment);
      continue;
    }
    languageInsertionIndex ??= retained.length;
    firstLanguage ??= (parsedSegment.get('language') ?? '')
      .split(',')
      .map((token) => token.trim())
      .find(Boolean);
  }

  if (languageInsertionIndex === undefined) return value;

  const normalized = [...retained];
  const languageSegment = firstLanguage
    ? new URLSearchParams({ language: firstLanguage }).toString()
    : undefined;
  if (languageSegment) {
    normalized.splice(languageInsertionIndex, 0, languageSegment);
  }
  const query = normalized.join('&');
  return `${prefix}${query ? `?${query}` : ''}${fragment}`;
}
```

- [ ] **Step 4: Normalize URLs before API hit identity is derived**

In `normalizeApiHit`:

```ts
const rawUrl = text(hit.url) ?? '';
if (!isNavigableUrl(rawUrl)) return undefined;
const url = normalizeApiReferenceUrl(rawUrl);
```

Import `normalizeApiReferenceUrl` from `./api-url-normalizer`. Ensure the normalized `url` is used by `urlIdentity`, fallback IDs, canonical keys, representative URLs, and `platformUrls`.

Add an integration test in `api-result-normalizer.test.ts` using:

```ts
const malformedLanguage = Array.from({ length: 256 }, () => 'objc').join(',');
const normalized = normalizeValidApiHit(
  {
    hierarchy: { lvl1: 'setAudioProfile(_:)' },
    objectID: 'ios-set-audio-profile',
    platform: 'ios',
    product: 'video-sdk',
    url: `https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=${malformedLanguage}#app-main`,
  },
  intent('setAudioProfile'),
);
const [result] = aggregateApiResults([normalized]);
expect(result.platformUrls.ios).toBe(
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
);
```

- [ ] **Step 5: Exercise the selected normalized URL in the component test**

Update the platform-aware navigation test in `DocsSearchDialog.test.tsx` so its iOS value is:

```ts
const normalizedIosUrl =
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main';
```

Select that option, click the result row, and assert:

```ts
expect(openSpy).toHaveBeenCalledWith(
  normalizedIosUrl,
  '_blank',
  'noopener,noreferrer',
);
```

- [ ] **Step 6: Run URL, normalizer, and UI tests**

```bash
bun run test \
  src/lib/search/api-url-normalizer.test.ts \
  src/lib/search/api-result-normalizer.test.ts \
  src/components/docs-shell/DocsSearchDialog.test.tsx
bun run types:check
```

Expected: URL shape, value ordering, aggregation, and selected-platform navigation tests pass.

- [ ] **Step 7: Commit URL normalization**

```bash
git add \
  src/lib/search/api-url-normalizer.ts \
  src/lib/search/api-url-normalizer.test.ts \
  src/lib/search/api-result-normalizer.ts \
  src/lib/search/api-result-normalizer.test.ts \
  src/components/docs-shell/DocsSearchDialog.test.tsx
git commit -m "fix: normalize API language URLs"
```

### Task 6: Expand Golden Evidence And Make Replay Aggregation-Aware

**Files:**
- Modify: `src/lib/search/golden-search-queries.ts`
- Modify: `src/lib/search/golden-search-queries.test.ts`
- Modify: `src/lib/search/golden-search-replay.ts`
- Modify: `src/lib/search/golden-search-replay.test.ts`
- Create: `scripts/replay-algolia-search-report.ts`
- Create: `scripts/replay-algolia-search-report.test.ts`
- Modify: `scripts/replay-algolia-search.ts`

- [ ] **Step 1: Add failing aggregation-aware replay tests**

Extend `GoldenReplayResult` test data in `golden-search-replay.test.ts` with:

```ts
const sdkCase = {
  expectedCanonicalKey: 'video-sdk|rtcengine|setaudioprofile|member',
  expectedIntent: 'unknown',
  expectedKind: 'sdk-symbol',
  expectedTitle: 'setAudioProfile',
  expectedUrl:
    'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
  query: 'setAudioProfile method',
} satisfies GoldenSearchCase;
```

Add the passing assertion:

```ts
const report = await replayGoldenSearchCases([sdkCase], async () => [
  {
    canonicalKey: sdkCase.expectedCanonicalKey,
    platformUrls: { ios: sdkCase.expectedUrl },
    recordKind: 'sdk-symbol',
    title: 'setAudioProfile(_:)',
    url: 'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title128',
  },
]);
expect(report).toMatchObject({ failed: 0, passed: 1, total: 1 });
```

Add the negative assertion:

```ts
const missingUrlReport = await replayGoldenSearchCases([sdkCase], async () => [
  {
    canonicalKey: sdkCase.expectedCanonicalKey,
    platformUrls: { ios: 'https://api-ref.agora.io/en/video-sdk/ios/wrong' },
    recordKind: 'sdk-symbol',
    title: 'setAudioProfile(_:)',
    url: 'https://api-ref.agora.io/en/video-sdk/blueprint/wrong',
  },
]);
expect(missingUrlReport).toMatchObject({ failed: 1, passed: 0, total: 1 });
```

- [ ] **Step 2: Run replay tests and verify RED**

```bash
bun run test src/lib/search/golden-search-replay.test.ts
```

Expected: FAIL because replay ignores `canonicalKey` and `platformUrls`.

- [ ] **Step 3: Implement canonical-key and platform-URL matching**

Extend `GoldenReplayResult`:

```ts
export type GoldenReplayResult = {
  canonicalKey?: string;
  platformUrls?: Record<string, string>;
  recordKind?: string;
  title: string;
  url: string;
};
```

Add:

```ts
function containsExpectedUrl(
  result: GoldenReplayResult,
  expectedUrl: string | undefined,
) {
  if (!expectedUrl) return true;
  return (
    result.url === expectedUrl ||
    Object.values(result.platformUrls ?? {}).includes(expectedUrl)
  );
}
```

Find the expected top-three result with:

```ts
const expectedResult = topThree.find((result) =>
  goldenCase.expectedCanonicalKey
    ? result.canonicalKey === goldenCase.expectedCanonicalKey
    : containsExpectedUrl(result, goldenCase.expectedUrl),
);
```

Require `containsExpectedUrl(expectedResult, goldenCase.expectedUrl)` in the non-empty pass condition.

- [ ] **Step 4: Expand the golden corpus to 54 cases**

Add these exact cases to `golden-search-queries.ts`:

```ts
{
  query: 'setAudioProfile method',
  expectedIntent: 'unknown',
  expectedKind: 'sdk-symbol',
  expectedTitle: 'setAudioProfile',
  expectedCanonicalKey: 'video-sdk|rtcengine|setaudioprofile|member',
  expectedUrl:
    'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
},
{
  query: 'renewToken api',
  expectedIntent: 'unknown',
  expectedKind: 'sdk-symbol',
  expectedTitle: 'renewToken',
  expectedCanonicalKey: 'video-sdk|rtcengine|renewtoken|member',
  expectedUrl:
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128',
},
{
  query: 'joinChannel method',
  expectedIntent: 'unknown',
  expectedKind: 'sdk-symbol',
  expectedTitle: 'JoinChannel',
  expectedCanonicalKey: 'video-sdk|rtcengine|joinchannel|member',
  expectedUrl:
    'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78',
},
{
  query: 'RtcEngine class',
  expectedIntent: 'unknown',
  expectedKind: 'sdk-symbol',
  expectedTitle: 'AgoraRtcEngineKit',
  expectedCanonicalKey: 'video-sdk|rtcengine|type',
  expectedUrl:
    'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main',
},
```

Update the six existing SDK cases and independent API corpus URLs to the same shared-index snapshot observed on 2026-09-03. In particular, use:

```ts
joinChannel:
  'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78'
setAudioProfile:
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main'
NetworkQuality:
  'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html'
AudioVolumeInfo:
  'https://api-ref.agora.io/en/video-sdk/flutter/5.x/API/rtc_api_data_type.html#ariaid-title89'
RtcEngine:
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main'
renew token:
  'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128'
```

Extend the corpus kind and hierarchy fixture so the offline records represent the shared index rather than forcing every non-method record to be a class:

```ts
type ApiCorpusEntry = {
  queries: readonly string[];
  symbol: string;
  kind: 'class' | 'enum' | 'interface' | 'member' | 'method' | 'type';
  namespace?: string;
  platformHits: readonly {
    label: string;
    namespace?: string;
    platform: string;
    symbol?: string;
    url: string;
  }[];
};

function apiHierarchy(entry: ApiCorpusEntry, symbol: string, namespace?: string) {
  if (entry.kind === 'method') {
    return { lvl1: `Class ${namespace}`, lvl2: symbol };
  }
  if (entry.kind === 'member') return { lvl1: symbol };
  const label = {
    class: 'Class',
    enum: 'Enum',
    interface: 'Interface',
    type: 'Type',
  }[entry.kind];
  return { lvl1: `${label} ${symbol}` };
}
```

Use `kind: 'member'` with the Flutter URL for `AudioVolumeInfo`, and `kind: 'type'` with the iOS DocC URL for `RtcEngine`. Have `apiHit` use `apiHierarchy(entry, symbol, namespace)` for its `hierarchy` field.

Set the corresponding observed canonical keys for `AudioVolumeInfo` and `RtcEngine` to:

```ts
'video-sdk|rtcapidatatype|audiovolumeinfo|member'
'video-sdk|rtcengine|type'
```

Extend the relevant independent corpus query arrays exactly as follows:

```ts
queries: ['joinChannel', 'joinChannel method']
queries: ['setAudioProfile', 'setAudioProfile method']
queries: ['RtcEngine', 'RtcEngine class']
queries: ['renew token', 'renewToken api']
```

Update the independent expected retrieval map to:

```ts
const EXPECTED_API_RETRIEVAL_QUERY = new Map([
  ['RtcEngine', 'AgoraRtcEngineKit'],
  ['RtcEngine class', 'AgoraRtcEngineKit'],
  ['joinChannel method', 'joinChannel'],
  ['renewToken api', 'renewToken'],
  ['setAudioProfile method', 'setAudioProfile'],
]);
```

Change the approved-count assertion to 54.

Replace `createGoldenClient`'s first-request-only mock with a response for every request in the federated call:

```ts
const searchForHits = vi.fn().mockImplementation(({ requests }) => {
  expect(
    requests.map((request: { indexName: string }) => request.indexName),
  ).toEqual(['docs_portal_en', 'agora_APIRefSearch']);
  return Promise.resolve({
    results: requests.map(
      (request: { indexName: string; query: string }) => ({
        hits: sourceHitsFor(
          query,
          request.query,
          request.indexName,
          intent,
        ),
      }),
    ),
  });
});
```

This assertion prevents the offline suite from passing through the API-only recovery path.

Replace the old tracked SDK URL constants with this independently verified shared-index evidence set:

```ts
const STABLE_WEB_NETWORK_QUALITY_URL =
  'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html';

// Verified with the read-only shared Algolia index on 2026-09-03.
const EXTERNALLY_VERIFIED_SDK_URL_ALLOWLIST = new Set([
  'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78',
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
  'https://api-ref.agora.io/en/video-sdk/flutter/5.x/API/rtc_api_data_type.html#ariaid-title89',
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main',
  'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128',
]);

const REAL_SDK_TARGET_URLS = new Set([
  STABLE_WEB_NETWORK_QUALITY_URL,
  ...EXTERNALLY_VERIFIED_SDK_URL_ALLOWLIST,
]);
```

Delete `TRACKED_ANDROID_SDK_URLS`, `TRACKED_IOS_RTC_ENGINE_URL`, and the assertions that search old tracked content for those stale URLs. Keep the assertion that the six SDK golden target URLs equal `REAL_SDK_TARGET_URLS`.

- [ ] **Step 5: Add a report-writer seam and failing evidence-order test**

Create `scripts/replay-algolia-search-report.test.ts`:

```ts
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { writeReplayReport } from './replay-algolia-search-report';

describe('writeReplayReport', () => {
  it('writes complete failing evidence before returning exit code 1', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'search-replay-'));
    const outputPath = join(directory, 'report.json');
    const report = {
      cases: [
        {
          actualUrls: ['/en/unrelated'],
          expectedUrl: '/en/expected',
          passed: false,
          query: 'expected query',
        },
      ],
      failed: 1,
      passed: 0,
      total: 1,
    };

const exitCode = await writeReplayReport(report, outputPath, {
  error: vi.fn(),
  log: vi.fn(),
});
expect(JSON.parse(await readFile(outputPath, 'utf8'))).toEqual(report);
expect(exitCode).toBe(1);
  });
});
```

- [ ] **Step 6: Implement the report writer and update the CLI**

Create `scripts/replay-algolia-search-report.ts`:

```ts
import { writeFile } from 'node:fs/promises';
import type { GoldenReplayReport } from '../src/lib/search/golden-search-replay';

type ReplayIo = Pick<Console, 'error' | 'log'>;

export async function writeReplayReport(
  report: GoldenReplayReport,
  outputPath: string | undefined,
  io: ReplayIo = console,
) {
  const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) await writeFile(outputPath, serializedReport, 'utf8');
  io.log(
    `Global Algolia replay: ${report.passed}/${report.total} passed, ${report.failed} failed.`,
  );
  for (const result of report.cases.filter(({ passed }) => !passed)) {
    io.error(
      JSON.stringify({
        actualUrls: result.actualUrls,
        error: result.error,
        expectedUrl: result.expectedUrl,
        query: result.query,
      }),
    );
  }
  return report.failed > 0 ? 1 : 0;
}
```

In `scripts/replay-algolia-search.ts`, remove the direct `writeFile` import and replace serialization/logging/exit handling with:

```ts
import { writeReplayReport } from './replay-algolia-search-report';

process.exitCode = await writeReplayReport(report, outputPath);
```

- [ ] **Step 7: Run golden and report tests**

```bash
bun run test \
  src/lib/search/golden-search-queries.test.ts \
  src/lib/search/golden-search-replay.test.ts \
  scripts/replay-algolia-search-report.test.ts
bun run types:check
```

Expected: 54 cases are represented, aggregated URL matching passes, and failed reports are written before exit code `1` is returned.

- [ ] **Step 8: Commit golden and replay evidence changes**

```bash
git add \
  src/lib/search/golden-search-queries.ts \
  src/lib/search/golden-search-queries.test.ts \
  src/lib/search/golden-search-replay.ts \
  src/lib/search/golden-search-replay.test.ts \
  scripts/replay-algolia-search-report.ts \
  scripts/replay-algolia-search-report.test.ts \
  scripts/replay-algolia-search.ts
git commit -m "test: cover live API search regressions"
```

### Task 7: Gate Preview After Publishing Its URL

**Files:**
- Modify: `.github/workflows/vercel-deploy.yml`
- Create: `scripts/vercel-deploy-workflow.test.ts`

- [ ] **Step 1: Write a failing workflow-order test**

Create `scripts/vercel-deploy-workflow.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

type WorkflowStep = {
  if?: string;
  name?: string;
  run?: string;
  uses?: string;
};

const workflow = load(
  readFileSync(
    resolve(process.cwd(), '.github/workflows/vercel-deploy.yml'),
    'utf8',
  ),
) as { jobs: Record<string, { steps: WorkflowStep[] }> };
const previewSteps = workflow.jobs['deploy-preview'].steps;

function stepIndex(name: string) {
  return previewSteps.findIndex((step) => step.name === name);
}

describe('Vercel Preview live search gate', () => {
  it('publishes the Preview URL before replay and always uploads evidence', () => {
    expect(stepIndex('Deploy prebuilt output')).toBeGreaterThan(-1);
    expect(stepIndex('Write workflow summary')).toBeGreaterThan(
      stepIndex('Deploy prebuilt output'),
    );
    expect(stepIndex('Comment preview URL')).toBeGreaterThan(
      stepIndex('Write workflow summary'),
    );
    expect(stepIndex('Replay Global search golden queries')).toBeGreaterThan(
      stepIndex('Comment preview URL'),
    );
    expect(stepIndex('Upload Global search replay evidence')).toBeGreaterThan(
      stepIndex('Replay Global search golden queries'),
    );
    expect(
      previewSteps[stepIndex('Upload Global search replay evidence')].if,
    ).toBe('always()');
  });

  it('uses read-only search credentials and does not sync the Preview index', () => {
    const replay = previewSteps[stepIndex('Replay Global search golden queries')];
    expect(replay.run).toContain('bun run search:replay');
    expect(JSON.stringify(previewSteps)).not.toContain('ALGOLIA_ADMIN_API_KEY');
    expect(JSON.stringify(previewSteps)).not.toContain('bun run search:sync');
  });
});
```

- [ ] **Step 2: Run the workflow test and verify RED**

```bash
bun run test scripts/vercel-deploy-workflow.test.ts
```

Expected: FAIL because the Preview job has no replay or artifact steps.

- [ ] **Step 3: Add replay after the Preview URL comment**

Immediately after `Comment preview URL` in the `deploy-preview` job, add:

```yaml
      - name: Replay Global search golden queries
        if: steps.preview-context.outputs.should_deploy == 'true'
        env:
          VITE_ALGOLIA_APP_ID: ${{ secrets.VITE_ALGOLIA_APP_ID }}
          VITE_ALGOLIA_SEARCH_API_KEY: ${{ secrets.VITE_ALGOLIA_SEARCH_API_KEY }}
          VITE_ALGOLIA_INDEX_NAME: ${{ vars.ALGOLIA_INDEX_NAME }}
          VITE_SEARCH_RANKING_V2: 'true'
        run: bun run search:replay -- --gate=preview-blockers --out=global-search-replay-preview.json

      - name: Upload Global search replay evidence
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: global-search-replay-preview
          path: global-search-replay-preview.json
          if-no-files-found: warn
```

Do not move or remove the existing production replay.

Preview still executes and reports all 54 cases, but only the four modifier regressions determine its exit status. Production continues to run replay without `--gate` after `search:sync`, preserving strict all-54 behavior.

- [ ] **Step 4: Run workflow, golden, and type verification**

```bash
bun run test \
  scripts/vercel-deploy-workflow.test.ts \
  scripts/replay-algolia-search-report.test.ts \
  src/lib/search/golden-search-replay.test.ts
bun run types:check
git diff --check
```

Expected: workflow ordering tests, report writer tests, replay tests, type checking, and whitespace validation pass.

- [ ] **Step 5: Commit the Preview gate**

```bash
git add .github/workflows/vercel-deploy.yml scripts/vercel-deploy-workflow.test.ts
git commit -m "ci: gate previews with live search replay"
```

### Task 8: Final Verification And Handoff

**Files:**
- No planned source changes.

- [ ] **Step 1: Run all focused search and UI tests**

```bash
bun run test \
  src/components/docs-shell/DocsSearchDialog.test.tsx \
  src/lib/i18n/i18n-config.test.ts \
  src/lib/search/api-query-identity.test.ts \
  src/lib/search/api-url-normalizer.test.ts \
  src/lib/search/algolia-client.test.ts \
  src/lib/search/algolia-config.test.ts \
  src/lib/search/algolia-records.server.test.ts \
  src/lib/search/api-result-normalizer.test.ts \
  src/lib/search/docs-search-navigation.test.ts \
  src/lib/search/golden-search-queries.test.ts \
  src/lib/search/golden-search-replay.test.ts \
  src/lib/search/orama-client.test.ts \
  src/lib/search/search-intent.test.ts \
  src/lib/search/search-provider.test.ts \
  scripts/replay-algolia-search-report.test.ts \
  scripts/vercel-deploy-workflow.test.ts
```

Expected: all selected files pass with no skipped regression case.

- [ ] **Step 2: Run repository verification**

```bash
bun run types:check
bun run test
git diff --check
git status --short --branch
```

Expected: type checking and the full suite pass; the branch is clean and ahead only by the intended design and implementation commits.

- [ ] **Step 3: Run the shared-index live replay**

```bash
VITE_ALGOLIA_APP_ID="$VITE_ALGOLIA_APP_ID" \
VITE_ALGOLIA_SEARCH_API_KEY="$VITE_ALGOLIA_SEARCH_API_KEY" \
VITE_ALGOLIA_INDEX_NAME="${VITE_ALGOLIA_INDEX_NAME:-docs_portal_en}" \
VITE_SEARCH_RANKING_V2=true \
bun run search:replay -- --gate=preview-blockers --out=global-search-replay.json
```

This is the Preview-equivalent check. Production omits `--gate=preview-blockers` after `search:sync` and therefore remains strict across all 54 cases.

Expected output against the current shared index after relative-fragment matching is fixed:

```text
Global Algolia replay: 43/54 passed, 11 failed.
Global Algolia replay gate (preview-blockers): 4/4 passed, 0 failed.
```

Confirm the command exits `0` and `global-search-replay.json` reports overall `total: 54`, approximately `passed: 43`, `failed: 11`, plus gate `total: 4`, `passed: 4`, and `failed: 0`. Shared-index drift may change the overall monitoring counts, but all four blockers must pass. Do not update golden expected values to mirror the 11 known shared-index top-three gaps, reorder Algolia for this task, or commit the local evidence file.

- [ ] **Step 4: Inspect the final commit set**

```bash
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
git status --short
```

Expected: no unrelated refactors, content edits, UI changes, generated files, credentials, or replay artifacts are present.

- [ ] **Step 5: Prepare the PR handoff**

Report:

- The exact commit list.
- Focused and full test counts.
- Type-check result.
- Live replay result and artifact path.
- Preview workflow ordering guarantee.
- Any shared-index drift discovered after the 2026-09-03 snapshot.

Do not push, force-push, or reply to the GitHub review comment without explicit user authorization.
