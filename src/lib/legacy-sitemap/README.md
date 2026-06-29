# Legacy sitemap compatibility

This directory tracks compatibility for URLs from the legacy
`https://docs.agora.io/sitemap.xml`.

## Files

- `sitemap.xml`: snapshot downloaded from `https://docs.agora.io/sitemap.xml`
  on 2026-06-29.
- `redirects.json`: executable app-level redirect configuration. It stores only
  non-native redirect rules, not a duplicated row for every sitemap URL.
- `review-report.json`: non-blocking human review report for applied fallback or
  low-confidence decisions.

## Refresh workflow

```sh
curl -L https://docs.agora.io/sitemap.xml -o src/lib/legacy-sitemap/sitemap.xml
bunx vitest run src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
```

If the refreshed sitemap introduces new legacy products or paths that are not
covered, update `redirects.json`, regenerate `review-report.json`, and rerun the
audit.

## Rule types

- `exact-page`: same page exists under a new path.
- `semantic-page-match`: high-confidence content match under a new path.
- `product-fallback`: conservative product-level fallback used to prevent a
  broken link.

The compatibility pass must not wait for human decisions. If a precise mapping
cannot be established with high confidence, apply the safest product-level
fallback and record the case in `review-report.json`. Human quality review
happens after the PR is opened.
