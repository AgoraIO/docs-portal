> **Withdrawn navigation proposal (2026-11-17).** All navigation implementation, metadata declarations, source-trail changes and associated new audit/test code from this PR have been reverted to pre-PR `30b04c44d`. This report preserves historical findings from the withdrawn candidate; its navigation screenshots, results and reproduction commands do not describe the current PR. The independent API signature wrapping change remains. Content/link findings await documentation-team review. No replacement navigation rule has been adopted.

# Full navigation and entry audit — 2026-11-17

## Definitions and scope

A page omitted from the sidebar is not necessarily an orphan. This audit separates menu membership, SDK/group ownership and inbound links. A static-entry candidate has neither its own menu entry, a catalog entrance, nor an inbound link from another rendered local document. A disconnected candidate has inbound links, but no path from the audited navigation/catalog roots. Search results, external referrers and directly typed URLs are not navigation roots in this definition. These findings are not a claim that every candidate should be published or inserted into the sidebar.

This is an exhaustive local route-payload and source-link audit for the checked-out Chinese/English source sets, not a screenshot or manual visual review of every page, nor production acceptance. External SDK sites are excluded.

## Complete route and navigation results

- Every one of 5,848 API source pages was loaded through `loadDocsPagePayload`: 5,688 rendered payloads, 160 redirects, zero missing responses and zero thrown load errors.
- All 2,545 ordinary document pages were compared against the pre-PR `30b04c44d` navigation implementation: 2,525 rendered responses and 20 redirects. No differences in active path/tab, sidebar, sidebar header, breadcrumb, TOC or platform-tab data were found. Content data was held at the current checkout; this comparison tests navigation implementation changes, not unrelated content history.

| Actual API navigation state | Pages |
| --- | ---: |
| Exact page selected in sidebar | 1,226 |
| Declared owning group selected | 2,701 |
| SDK context present, no selected page/group | 1,481 |
| No SDK header (includes catalogs, FAQ and legacy material) | 280 |
| Total rendered API pages | 5,688 |

A missing SDK header is recorded, not automatically classified as a defect. In particular, catalogs and FAQ do not inherently require an SDK header. The 1,481 SDK-only pages still lack fine-grained menu location and must not be advertised as fully located.

## Entry graph

101,315 local link occurrences were scanned across both locales. The graph resolves public Chinese paths, platform-page aliases and known redirects; non-rendering source pages and self-links do not count as inbound document entrances. Navigation roots are authored ordinary-document menu entries, API pages that can select themselves in their actual menu, and active catalog destinations. Source includes were expanded, including section includes. All 166 initial extraction notices were inspected: text-form includes were expanded; the remaining notices were literal punctuation/numbers, stopPropagation-only handlers and the parameter renderer import, not dynamic local destinations.

| Entry classification | API pages |
| --- | ---: |
| Own menu entry | 1,226 |
| Catalog entrance without own menu entry | 8 |
| No menu entry, but reachable through document links | 3,412 |
| Inbound links, but disconnected from audited roots | 356 |
| No static entrance found | 686 |

Thus 4,462 rendered API pages are not their own sidebar item. Of those, 3,420 have an audited catalog/document entrance. The remaining 1,042 are **entry-graph candidates**, including historical or deliberately hidden material; they are not 1,042 newly introduced regressions or an authorization to unhide all of them.

## Original examples

- `MEDIA_DEVICE_STATE_TYPE` (C++): **not an orphan**. Four distinct rendered documents point to it: audio-device management, video-device management, the Struct/Enum index and RTC release notes. The repaired defect is missing ownership/navigation context after following those links.
- Web `EventEmitter`: **no static document/menu entrance found**. `globals.mdx` contains the plain text `EventEmitter` rather than a link; its migration warnings record the unresolved original destination. Restoring its Web sidebar does not restore those lost inbound links. This separate entry defect remains unresolved.

## Additional findings retained, not silently waived

- English `/en/api-reference/faq` has two selected sidebar links (`FAQ` and `Overview`) pointing to the same page. The exhaustive audit's uniqueness assertion failed on this finding. Comparing its full sidebar with `30b04c44d` confirmed the duplicate is unchanged. It is not an ownership conflict between different targets, but remains a duplicate-navigation issue.
- All 239 local Android 4.6.0 pages use the current-version navigation identity. Every one was compared to the pre-PR implementation; sidebar/header data is unchanged. This historical-version defect remains unresolved, and the full audit now explicitly checks source-version versus selected-version identity.
- No declared-parent/breadcrumb mismatch was found in the 5,688 rendered API payloads.

## Evidence and reproduction

The opt-in exhaustive loader is maintained at `src/lib/docs-navigation-full-audit.test.ts`:

```sh
DOCS_NAV_FULL_AUDIT=.agent/artifacts/api-feedback/full-audit \
  bun run test src/lib/docs-navigation-full-audit.test.ts
```

It records every page before asserting navigation invariants. The current candidate is expected to fail the known duplicate/version checks above; do not report this as a clean acceptance pass. The source inventory test and ordinary regression suite are complementary, not substitutes for this exhaustive run.

Local ignored evidence is under `.agent/artifacts/api-feedback/full-audit/`: `payloads.json`, `source-links.json`, `reachability.json`, `api-page-results.csv`, `ordinary-comparison.json`, `version-baseline.json` and `faq-baseline.json`. The ordinary implementation comparison and historical-version baseline comparison both passed. Full browser visual acceptance, orphan-intent review and release acceptance remain unfinished. No runtime navigation/content changes or deployment were made during this audit.
