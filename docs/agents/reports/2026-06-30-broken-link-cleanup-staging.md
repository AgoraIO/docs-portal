# Broken-link cleanup staging after migration

Parent issue: #539

This report records the current broken-link audit staging pass for the migration cleanup. The purpose is to keep the repo-wide cleanup reviewable: classify what the audit is reporting, keep unsafe broad cleanup out of one PR, and route follow-up work into scoped child issues.

## Current audit baseline

Command:

```bash
bun run docs:links
```

Current local baseline after the audit-script classification updates:

| Metric | Count |
|---|---:|
| docsFiles | 1858 |
| totalLinks | 40485 |
| invalidInternalLinks | 132 |
| missingRelativeMarkdownLinks | 8 |
| missingRootLinks | 94 |
| missingHashLinks | 30 |
| invalidExternalLinks | 0 |
| apiReferenceMacroLinks | 550 |
| skippedTemplateLinks | 0 |
| skippedRootLinks | 141 |

Reason split:

| Reason | Count |
|---|---:|
| missing-internal-path | 102 |
| missing-hash-anchor | 30 |

Area split:

| Area | Count |
|---|---:|
| api-reference | 101 |
| other-realtime-media | 27 |
| other | 2 |
| introduction | 1 |
| solutions | 1 |

## Categories

### Classified as audit/runtime normalization

These should not be fixed by deleting links from docs pages:

- Static legacy sitemap redirects: resolved through `src/lib/legacy-sitemap/static-redirects.json`.
- Fumadocs route groups such as `(current)`: route-group segments are stripped only when building known route paths; malformed links that still contain a route group remain visible to the audit.
- Generated OpenAPI routes: resolved against the site OpenAPI route registry.
- API reference macros such as `{{Global.API_REF_*}}`: counted as `apiReferenceMacroLinks` because they need a separate macro-expansion/audit pass.
- Hosted API-reference prefixes for RTC Android/Whiteboard: counted as hosted only when the path does not contain unresolved route-group syntax.

### Still actionable

These remain as invalid internal links and should be handled in child issues, not in this umbrella PR:

- True missing internal paths in API reference / FAQ content.
- Remaining non-API-reference links are concentrated in `other-realtime-media`, introduction, solutions, and other areas.
- Missing hash anchors: currently 30 examples remain visible instead of being masked as generated anchors.

## Child issue routing

- #564 — classify `docs:links:strict` failures before broad broken-link cleanup.
- #565 — fix Voice Agent broken links from `docs:links:strict`.
- #566 — fix RTC Voice/Video broken links from `docs:links:strict`.
- #567 — fix API Reference broken links after priority launch areas.
- #568 — fix remaining non-priority docs broken links by area.

Priority remains:

1. Finish the classification/baseline work (#564).
2. Verify the now-clean priority launch areas stay clean as child issues land (#565, #566).
3. Defer broad API-reference and lower-priority areas (#567, #568).

## Safety rules for follow-up PRs

- Do not make blind global replacements across unrelated docs areas.
- Prefer canonical current routes or redirects; do not remove useful links just to pass the audit.
- Keep exact legacy allowlists exact. Broad prefix fallbacks should stay visible unless they describe hosted/generated routes with a stable owner.
- Missing anchors on redirects, hosted routes, or OpenAPI routes must not be treated as valid unless they are exact known legacy/generated cases.

## Verification notes

`bun run docs:links` is the classification command for this umbrella and should complete with the counts above. `bun run docs:links:strict` is expected to fail until the child issues remove or explicitly categorize the remaining 132 invalid internal links.
