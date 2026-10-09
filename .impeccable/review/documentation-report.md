documentation_disposition: complete-preserve

## Preservation decision

This is an ordinary extension of the incumbent documentation portal. The shipped documenter's instruction is explicit: “Ordinary extensions preserve the incumbent system; report pre-existing drift without repairing it unasked.” No new visual world or system replacement was approved. The absence of root `DESIGN.md` and `.impeccable/design.json` does not authorize creating them for this pass. `PRODUCT.md`, all incumbent tokens and primitives, implementation files, dependencies, generated assets, and external systems were preserved.

Both surface briefs retain the FINISH line verbatim as required by `reference/new-work.md` section 5. A separate implementation note applies section 7's specific ordinary-extension rule: compare the finished build with the incumbent system, preserve its files, and report the evidence checked. The completed review and this preservation report satisfy that rule; creation of a new `DESIGN.md` or system sidecar is not authorized. The review verdict's earlier persistence sentence expecting `DESIGN.md` is retained as review history, not treated as authority for a new global system. The approved THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, and FORM are unchanged.

## Evidence checked

- Read the shipped documenter definition and `reference/document.md` in full, both persisted surface briefs, root `PRODUCT.md` and `AGENTS.md`, and both finish-review artifacts. The current authoritative review is `finish-verdict.md` with disposition ship; `finish-review.md` records the resolved clear-query finding.
- Checked `reference/new-work.md` section 5's verbatim FINISH requirement and section 7's specific ordinary-extension rule; confirmed both briefs mirror and retain the required line.
- Read `src/styles/search.css` in full and sampled the incumbent light/dark palette, semantic aliases, font faces, language-aware stacks, and base typography in `src/styles/app.css`. Its branch diff adds only the search stylesheet import. The page binds to existing semantic colors rather than introducing a palette.
- Read the four search component implementations, both route files, `cn-search-page.ts`, and `search-page-state.ts`; sampled shared shell/quick-search diffs and Button, NativeSelect, ToggleGroup, Toggle, Card, and Empty primitives. Ordinary anchors, native filters, Radix single selection, abortable public CN search, URL state, and the clear-to-start action agree with the contract.
- Reopened desktop viewport, mobile, and cleared-state captures for visual spot checks. Independently checked all five dimensions: desktop 1440×3800, desktop viewport 1440×900, mobile 390×3604, user viewport capture 1280×3802, cleared state 1280×720. The final reviewer reports all captures validated at document top. Loading, error, empty-result, selected-filter, and dark behavior remain source-reviewed rather than claimed as captured.
- Checked the relevant test names and clear-state source. The implementation agent reports 38 search tests, one search-shell test, type checking, and changed-file Biome passing after the clear fix, plus live filtering, pagination, browser-back, clear-URL checks, and the compatibility route's HTTP 307 preserving `q=Token`. This documentation pass did not rerun those checks. The local engine corpus is 25 documents/723 sections; production-wide coverage is unverified.
- Independently read the full-suite JSON summary at `/tmp/docs-portal-search-all-tests.json`: 1715 tests, 1678 passed, 35 failed, two skipped. This snapshot predates the added clear regression test. The implementation agent reports successful CN `bunx vite build` client, SSR, Nitro, and regular prerender output; it began before the final clear fix and is not production behavioral proof of that correction. The full `build:app:static` pipeline was not verified because its attempted run lacked the pre-generated docs routes manifest prerequisite.

## Five-line system summary

Palette: inherited warm light background `#fbfaf7`, foreground `#0e0f12`, secondary `#f4f2ec`, and incumbent dark semantic aliases; `--docs-info` supplies interaction feedback.
Type: inherited MiSans; this surface uses 28/24px page headings, 18/17px result headings, 14px excerpts, and 12–13px metadata.
Results-first rule: one restrained document column, flat section rows, honest chapter totals, and ordinary destination anchors.
Standard-controls rule: reuse local shadcn/Radix primitives and shared navigation; the mobile filter sheet replaces desktop filters below the source's 640px boundary.
Shared-feedback rule: Aceternity-inspired hints, single-selection background, and result hover/focus highlight use the same keyboard/pointer affordances and honor reduced motion.

These names describe this approved surface; they are not new system-wide prohibitions or normative token definitions. One-off input/highlight radii and page dimensions were not promoted into global tokens. No new shipping raster was introduced; inherited logos and fonts remain unchanged.

## Files written

`docs/designs/2026-10-08-search-page.md` and `.impeccable/surfaces/src-routes-locale-search-tsx.md` now mirror concise implementation, integration, verification, and limitation notes. The surface's related stylesheet target is `src/styles/search.css`. This report records the preservation outcome.

## Drift not canonized or repaired

No new visual drift was found on the target. The incumbent Card primitive's diffuse shadow/backdrop treatment is an existing material variation and is not used by these flat search rows. The full-suite snapshot remains non-green: the implementation agent attributes 35 failures to older content/routing/layout cases and reproduced three older DocsShell failures using HEAD source; repository-wide lint also has earlier errors. No blanket baseline proof is implied, and none of this was repaired or converted into future design guidance because it is outside the authorized documentation boundary.
