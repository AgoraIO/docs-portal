# Legacy Redirect No-Query Fallbacks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add seven owner-approved 301 redirects for legacy URLs that omit the `platform` query while preserving the existing platform-specific redirects.

**Architecture:** Keep `src/lib/legacy-sitemap/redirects.json` as the redirect source of truth and regenerate the Vercel/static artifacts from it. Extend the artifact generator so query-split paths can include a no-query fallback rule using Vercel `missing` query conditions. Tests should prove the generated artifacts contain both the existing query-specific redirects and the new no-query fallback redirects.

**Tech Stack:** TypeScript/Vitest tests, Node ESM generator script, JSON redirect artifacts, Vercel `redirects`/`bulkRedirectsPath`.

---

### Task 1: Add Failing Artifact Tests

**Files:**
- Modify: `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`

- [ ] **Step 1: Extend the Vercel redirect test type**

Add `missing` to the existing `VercelRedirect` type near the top of `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`:

```ts
type VercelRedirect = {
  destination: string;
  has?: Array<{
    key: string;
    type: string;
    value: string;
  }>;
  missing?: Array<{
    key: string;
    type: string;
  }>;
  preserveQueryParams?: boolean;
  source: string;
  statusCode: number;
};
```

- [ ] **Step 2: Add the no-query fallback assertion**

Add this test inside the existing `describe('legacy redirect Vercel artifacts', () => { ... })` block after the query-split test:

```ts
  it('keeps owner-approved no-query fallbacks for legacy platform URLs', () => {
    const fallbackRedirects = [
      {
        destination: '/en/introduction/account',
        source: '/en/Agora%20Platform/get_appid_token',
      },
      {
        destination: '/en/introduction/core-concepts',
        source: '/en/Agora%20Platform/terms',
      },
      {
        destination:
          '/en/realtime-media/media-push/get-started/enable-media-push',
        source: '/en/Interactive%20Broadcast/cdn_streaming_web',
      },
      {
        destination:
          '/en/realtime-media/media-push/get-started/enable-media-push',
        source: '/en/Interactive%20Broadcast/cdn_streaming_windows',
      },
      {
        destination:
          '/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/cloud-proxy',
        source: '/en/Interactive%20Broadcast/cloud_proxy_web_ng',
      },
      {
        destination:
          '/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/in-call-quality-monitoring',
        source: '/en/Interactive%20Broadcast/in-call_quality_windows',
      },
      {
        destination:
          '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute',
        source: '/en/Interactive%20Broadcast/set_subscribing_state',
      },
    ];

    for (const expected of fallbackRedirects) {
      expect(vercelConfig.redirects).toContainEqual({
        ...expected,
        missing: [
          {
            key: 'platform',
            type: 'query',
          },
        ],
        preserveQueryParams: false,
        statusCode: 301,
      });
    }
  });
```

- [ ] **Step 3: Add a guard that platform-specific redirects remain unchanged**

Add this assertion to the same test file after the fallback test:

```ts
  it('keeps platform-specific redirects ahead of no-query fallbacks', () => {
    expect(vercelConfig.redirects).toContainEqual({
      destination:
        '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute/windows',
      has: [
        {
          key: 'platform',
          type: 'query',
          value: 'Windows',
        },
      ],
      preserveQueryParams: false,
      source: '/en/Interactive%20Broadcast/set_subscribing_state',
      statusCode: 301,
    });

    const platformRedirectIndex = vercelConfig.redirects?.findIndex(
      (rule) =>
        rule.source === '/en/Interactive%20Broadcast/set_subscribing_state' &&
        rule.destination ===
          '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute/windows',
    );
    const fallbackRedirectIndex = vercelConfig.redirects?.findIndex(
      (rule) =>
        rule.source === '/en/Interactive%20Broadcast/set_subscribing_state' &&
        rule.destination ===
          '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute',
    );

    expect(platformRedirectIndex).toBeGreaterThanOrEqual(0);
    expect(fallbackRedirectIndex).toBeGreaterThanOrEqual(0);
    expect(platformRedirectIndex).toBeLessThan(fallbackRedirectIndex);
  });
```

- [ ] **Step 4: Run the focused test and confirm it fails**

Run:

```bash
/Users/yejiayi/.bun/bin/bun test src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts
```

Expected: FAIL because the seven fallback redirects are not present yet.

### Task 2: Add Source Redirect Rules

**Files:**
- Modify: `src/lib/legacy-sitemap/redirects.json`
- Modify: `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts`

- [ ] **Step 1: Add a new stale-rule exemption marker**

In `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts`, add this constant below `apiRefRedirectAuditEvidence`:

```ts
const ownerApprovedNoQueryFallbackEvidence =
  'Owner-approved no-query fallback for legacy platform URL on 2026-08-05.';
```

- [ ] **Step 2: Update stale-rule filtering**

Change the stale rule filter so it allows the new owner-approved fallback evidence:

```ts
    const staleRules = legacySitemapRedirectConfig.rules.filter(
      (rule) =>
        !sitemapHrefs.has(rule.legacyUrl) &&
        !manualLegacyUrls.has(rule.legacyUrl) &&
        !rule.evidence.includes(apiRefRedirectAuditEvidence) &&
        !rule.evidence.includes(ownerApprovedNoQueryFallbackEvidence),
    );
```

- [ ] **Step 3: Add seven no-query fallback entries to redirects.json**

Add seven `semantic-page-match` rules to `src/lib/legacy-sitemap/redirects.json`. Each rule must omit `legacySearch`, set `preserveSearch` to `false`, and use this evidence exactly:

```json
[
  "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
]
```

The rules to add are:

```json
[
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Agora%20Platform/get_appid_token",
    "legacyPath": "/en/Agora Platform/get_appid_token",
    "target": "/en/introduction/account",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  },
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Agora%20Platform/terms",
    "legacyPath": "/en/Agora Platform/terms",
    "target": "/en/introduction/core-concepts",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  },
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Interactive%20Broadcast/cdn_streaming_web",
    "legacyPath": "/en/Interactive Broadcast/cdn_streaming_web",
    "target": "/en/realtime-media/media-push/get-started/enable-media-push",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  },
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Interactive%20Broadcast/cdn_streaming_windows",
    "legacyPath": "/en/Interactive Broadcast/cdn_streaming_windows",
    "target": "/en/realtime-media/media-push/get-started/enable-media-push",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  },
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng",
    "legacyPath": "/en/Interactive Broadcast/cloud_proxy_web_ng",
    "target": "/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/cloud-proxy",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  },
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Interactive%20Broadcast/in-call_quality_windows",
    "legacyPath": "/en/Interactive Broadcast/in-call_quality_windows",
    "target": "/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/in-call-quality-monitoring",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  },
  {
    "type": "semantic-page-match",
    "confidence": "high",
    "legacyUrl": "https://docs.agora.io/en/Interactive%20Broadcast/set_subscribing_state",
    "legacyPath": "/en/Interactive Broadcast/set_subscribing_state",
    "target": "/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute",
    "evidence": [
      "Owner-approved no-query fallback for legacy platform URL on 2026-08-05."
    ],
    "preserveSearch": false
  }
]
```

- [ ] **Step 4: Run artifact generation and expect it to fail before generator support**

Run:

```bash
/Users/yejiayi/.bun/bin/bun scripts/generate-legacy-redirect-artifacts.mjs
```

Expected: FAIL with `Cannot create query-specific redirect ... missing legacySearch`, proving the source rules need generator support.

### Task 3: Support No-Query Fallback Generation

**Files:**
- Modify: `scripts/generate-legacy-redirect-artifacts.mjs`
- Generated: `src/lib/legacy-sitemap/static-redirects.json`
- Generated: `vercel-legacy-redirects.json`
- Generated: `vercel.json`

- [ ] **Step 1: Split path rules into query and no-query rules**

Inside `createVercelRedirects`, after `const targets = ...`, add:

```js
    const queryRules = pathRules.filter((rule) => rule.legacySearch);
    const noQueryRules = pathRules.filter((rule) => !rule.legacySearch);
```

- [ ] **Step 2: Replace the query-split loop implementation**

Replace the existing `for (const rule of pathRules) { ... }` loop in the query-split branch with:

```js
    const queryKeys = getQueryKeys(queryRules);

    for (const rule of queryRules) {
      const query = parseLegacySearch(rule.legacySearch);
      if (!query) {
        throw new Error(
          `Cannot create query-specific redirect for ${rule.legacyUrl}: missing legacySearch`,
        );
      }

      queryRedirects.push({
        source: createVercelSourcePath(legacyPath),
        destination: rule.target,
        has: Object.entries(query).map(([key, value]) => ({
          type: 'query',
          key,
          value,
        })),
        statusCode: 301,
        preserveQueryParams: rule.preserveSearch,
      });
    }

    for (const rule of noQueryRules) {
      queryRedirects.push({
        source: createVercelSourcePath(legacyPath),
        destination: rule.target,
        missing: queryKeys.map((key) => ({
          type: 'query',
          key,
        })),
        statusCode: 301,
        preserveQueryParams: rule.preserveSearch,
      });
    }
```

- [ ] **Step 3: Add the query key helper**

Add this helper below `parseLegacySearch`:

```js
function getQueryKeys(rules) {
  const keys = new Set();

  for (const rule of rules) {
    const query = parseLegacySearch(rule.legacySearch);
    for (const key of Object.keys(query ?? {})) {
      keys.add(key);
    }
  }

  return Array.from(keys).sort();
}
```

- [ ] **Step 4: Regenerate artifacts**

Run:

```bash
/Users/yejiayi/.bun/bin/bun scripts/generate-legacy-redirect-artifacts.mjs
```

Expected output includes:

```text
[legacy-redirects] static fallback rules: 3178
[legacy-redirects] Vercel query redirects:
```

The query redirect count should increase by 7 compared with the pre-change count.

### Task 4: Verify and Commit

**Files:**
- Modified files from Tasks 1-3

- [ ] **Step 1: Run focused tests**

Run:

```bash
/Users/yejiayi/.bun/bin/bun test src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run redirect verifier**

Run:

```bash
/Users/yejiayi/.bun/bin/bun scripts/verify-api-ref-docs-redirects.mjs
```

Expected:

```text
[api-ref-docs-redirects] triage redirects verified
```

- [ ] **Step 3: Run artifact check**

Run:

```bash
/Users/yejiayi/.bun/bin/bun scripts/generate-legacy-redirect-artifacts.mjs --check
```

Expected output shows the artifact counts and exits 0.

- [ ] **Step 4: Review diff**

Run:

```bash
git diff --stat
git diff -- src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts scripts/generate-legacy-redirect-artifacts.mjs src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
```

Expected: only focused redirect source, generator, artifact, and test changes are present.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/legacy-sitemap/redirects.json src/lib/legacy-sitemap/static-redirects.json vercel-legacy-redirects.json vercel.json scripts/generate-legacy-redirect-artifacts.mjs src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
git commit -m "fix: add legacy no-query redirect fallbacks"
```

Expected: commit succeeds.
