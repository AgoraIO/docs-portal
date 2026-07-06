# Legacy sitemap compatibility

This directory tracks compatibility for URLs from the legacy
`https://docs.agora.io/sitemap.xml`.

## Files

- `sitemap.xml`: snapshot downloaded from `https://docs.agora.io/sitemap.xml`
  on 2026-06-29.
- `new-docs-inventory.json`: generated inventory of new docs routes used for
  matching legacy paths to article-level targets.
- `redirects.json`: executable app-level redirect configuration. It stores one
  traceable record for every non-native legacy sitemap URL.
- `review-report.json`: non-blocking human review report for applied fallback or
  low-confidence decisions.

## Refresh workflow

```sh
curl -L https://docs.agora.io/sitemap.xml -o src/lib/legacy-sitemap/sitemap.xml
node scripts/generate-legacy-sitemap-redirects.mjs
bunx vitest run src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
```

If the refreshed sitemap introduces new legacy products or paths that are not
covered, update `redirects.json`, regenerate `review-report.json`, and rerun the
audit.

## Rule types

- `exact-path`: same path suffix exists under the migrated product area.
- `exact-slug`: the target leaf slug matches the legacy leaf slug in the
  migrated product area.
- `renamed-page`: deterministic known rename, such as `overview` to
  `product-overview`.
- `semantic-page-match`: high-confidence content match under a new path.
- `product-fallback`: conservative product-level fallback used to prevent a
  broken link.
- `unavailable`: no replacement exists and the decision is explicitly
  justified.

The compatibility pass must not wait for human decisions. If a precise mapping
cannot be established with high confidence, apply the safest product-level
fallback and record the case in `review-report.json`. Human quality review
happens after the PR is opened.

## Current audit

The current snapshot contains 3116 legacy URLs and 0 broken URLs. The latest
generated mapping classifies them as:

- `exact-path`: 490
- `exact-slug`: 1942
- `renamed-page`: 39
- `semantic-page-match`: 645
- `product-fallback`: 0
- `unavailable`: 0

`review-report.json` contains no remaining product-level fallback cases.
Platform-specific targets can opt out of preserving the legacy query string
when the platform is encoded in the target path.
