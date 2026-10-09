documentation_disposition: complete-preserve

## Preservation decision

This compact redesign is an ordinary extension of the incumbent documentation portal. The shipped documenter says: “Ordinary extensions preserve the incumbent system; report pre-existing drift without repairing it unasked.” `reference/new-work.md` section 7 applies the same preservation rule. No new visual world or approved global system change is present. Root `DESIGN.md` and `.impeccable/design.json` are absent; this pass preserves that state and the incumbent source tokens and primitives. `PRODUCT.md`, UI source, dependencies, screenshots, and unrelated documents were not edited.

Both surface briefs retain the exact FINISH line. The completed fresh full review and this source comparison discharge the ordinary-extension finish requirement without creating a new design system. The current review is [compact-finish-review.md](./compact-finish-review.md), `disposition: ship`, with persistence, fidelity, ceiling, material_fixes, and keep present and no material fixes. [finish-verdict.md](./finish-verdict.md) and [documentation-report.md](./documentation-report.md) belong to the earlier density version rejected by the user and are retained only as history.

## Evidence checked

- Read the shipped documenter definition and `reference/document.md` in full, the preservation and FINISH rules in `reference/new-work.md`, `PRODUCT.md`, the mirrored compact direction contracts, the fresh compact finish review, and the historical documentation report.
- Read `src/styles/search.css` in full; checked the inherited light/dark palette, semantic aliases, MiSans faces, language-aware stacks, and search stylesheet import in `src/styles/app.css`. Read the four search components and sampled Button, NativeSelect, ToggleGroup, and Card. This is a source comparison, not a new computed-style or live-browser run.
- Confirmed the actual source values: a 1120px maximum column; 18px page title, 16px result title, 14px two-line snippets with 75ch maximum measure, and 12px result metadata; a 44px desktop input and 14px vertical result padding. At the source's max-width 639px breakpoint, the input becomes 52px, action buttons and types retain 44px targets, and the mobile Sheet retains 44px native selects and visible removable filter chips. These are surface facts, not new normative global tokens.
- Confirmed normal chapter anchors, title/chapter alignment, inline applicability metadata, one optional disclosure for remaining hits, keyboard/pointer shared row feedback, submitted-query persistence, and reduced-motion handling. Source retains initial examples/recent browsing, loading, error/empty recovery, query clearing, and pagination. No AI or login controls were introduced by this round.
- Independently opened the exact 1280×720 user crop, the filtered 390×844 mobile capture, and the 800px tablet capture. The crop visibly contains three complete Token result groups; the mobile state shows RTC and Web chips and nine chapter matches across two groups; the tablet naturally wraps the count while retaining filters. Verified all seven image dimensions with `sips`. Full capture validity for the remaining desktop/mobile images is the fresh reviewer's evidence, not an independent recapture by this documenter.
- The implementation's supplied live evidence reports no horizontal overflow at 1440, 1280, 800, and 390px; RTC + Web filters and URL state, clear filters, page 2 ↔ 1, chapter expansion, clear-query return to start, and the Token example were verified. The single supplied detector returned `[]` and was not repeated. This pass did not repeat behavior checks, tests, the detector, or builds.
- The implementation reports 38 tests across DocsSearchPage, cn-search-page, search-page-state, and DocsSearchDialog, type checking, and Biome on four changed source files passing for this compact round. No fresh full-suite, full-lint, or production-build result is claimed. The older 1715-test snapshot (1678 passed, 35 failed, two skipped) predates the clear regression; older full-lint errors, the pre-clear CN Vite build, and the incomplete static pipeline remain bounded historical limitations. The local corpus is 25 documents/723 sections, with production-wide coverage unverified.
- `fc89dbac` remains the original structure-roll identifier corroborated by earlier session/direction artifacts; the raw launcher roll log was not retained. This round is the user's compact refinement within the selected results-first structure and makes no new visual-world assignment claim.

## Capture evidence

All captures below are browser evidence, not new raster assets shipped in the product. The fresh reviewer found them capture-valid and checked document-top/full-page correspondence. No capture file was changed by this pass.

| Evidence | Dimensions | Role |
| --- | --- | --- |
| [compact-desktop.jpg](./compact-desktop.jpg) | 1440×2365 | Complete desktop results |
| [compact-desktop-viewport.jpg](./compact-desktop-viewport.jpg) | 1440×900 | Desktop first viewport |
| [compact-mobile.jpg](./compact-mobile.jpg) | 390×1989 | Complete mobile results |
| [compact-tablet.jpg](./compact-tablet.jpg) | 800×1907 | Tablet controls and count reflow |
| [compact-user-1280.jpg](./compact-user-1280.jpg) | 1280×2342 | Complete results at user width |
| [compact-mobile-filtered.jpg](./compact-mobile-filtered.jpg) | 390×844 | Mobile selected RTC + Web state |
| [compact-search-page.jpg](compact-search-page.jpg) | 1280×720 | Exact user-window crop |

The rejected original capture is comparison history, not an approved comp. On the same Token query at 1280×720, supplied measurements put the first result at y248 instead of y472 and the first two rows at about 146px each instead of about 248px. The first viewport now holds three complete result groups instead of about one. There is no approved raster comp, generated plate, or comp-diff obligation in this density correction. Existing logos and fonts retain their prior provenance.

## Five-line system summary

Palette: inherited warm light ground `#fbfaf7`, foreground `#0e0f12`, secondary `#f4f2ec`, and dark semantic aliases; `--docs-info` provides search focus/link feedback.
Type: inherited MiSans; this compact surface uses an 18px page title, 16px result title, 14px excerpt, and 12px metadata.
Results-first rule: a continuous document column, thin result rules, honest chapter totals, inline applicability, and ordinary chapter anchors.
Standard-controls rule: local shadcn/Radix primitives and the shared shell remain; mobile uses the existing Sheet with visible applied conditions.
Shared-feedback rule: Aceternity-inspired hints, selection, and row hover/focus share keyboard/pointer behavior and honor reduced motion.

The named rules describe this surface and its incumbent implementation. Compact widths, spacing, touch adaptations, and one-off radii were not promoted to a new global token schema or world-wide prohibition.

## Files written

- [docs/designs/2026-10-08-search-page.md](../../docs/designs/2026-10-08-search-page.md)
- [.impeccable/surfaces/src-routes-locale-search-tsx.md](../surfaces/src-routes-locale-search-tsx.md)
- [.impeccable/review/compact-documentation-report.md](./compact-documentation-report.md)

The mirrored briefs now identify the fresh ship review, completed preservation result, compact evidence, supplied verification, and historical limitations. Their direction contract and verbatim FINISH line remain intact.

## Drift not canonized or repaired

No target visual drift or craft-floor refusal was found in the compact source comparison. The incumbent Card's diffuse shadow/backdrop treatment is an older variation that these flat result rows do not use; it was neither rewritten nor turned into new guidance. Existing test/lint/static-pipeline limitations remain recorded without blanket baseline proof or repairs outside this documentation boundary. No screenshot-specific size, prior rejection, or unsupported test claim was canonized as a global system rule.
