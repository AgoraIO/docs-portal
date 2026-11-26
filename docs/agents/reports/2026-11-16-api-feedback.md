> **Withdrawn navigation proposal (2026-11-17).** All navigation implementation, metadata declarations, source-trail changes and associated new audit/test code from this PR have been reverted to pre-PR `30b04c44d`. This report preserves historical findings from the withdrawn candidate; its navigation screenshots, results and reproduction commands do not describe the current PR. The independent API signature wrapping change remains. Content/link findings await documentation-team review. No replacement navigation rule has been adopted.

# Historical checkpoint — superseded scope

The 530-page C++/Unity scope below describes the earlier checkpoint. See [the complete SDK scope audit](2026-11-17-api-navigation-scope-audit.md) for the current implementation and impact.

# API feedback: navigation ownership and signature wrapping

## Original feedback and current scope

The source screenshot already contains a return-to-audio-device link. Its red box requests a source link in the breadcrumb; that proposed solution is not adopted. Navigation now distinguishes fixed content ownership from the reader's source page.

The second screenshot clearly shows a long `user-info-updated` signature clipped into a horizontally scrolling line. Signatures now wrap initially, with links, copying and the wrap toggle preserved. The separate phrase about a missing “jump preview” still lacks a reproducible interaction and is not claimed fixed.

## Ownership contract

`meta.json.navigationParents` maps an existing visible parent URL to an explicit list of unlisted detail URLs. The generic resolver is independent of locale, API generator and browsing history. Visible pages keep their original position. Missing parents and conflicting declarations do not select a new parent. Ordinary body links are not runtime ownership evidence.

The initial declarations reproduce the maintained Struct/Enum indexes: 271 C++ Struct/Enum and 259 Unity Class/Enum current-version pages. All 530 URLs were checked against the index links and existing files. No historical version, other SDK or ordinary document is opted in by URL pattern. Future imported details need corresponding maintained metadata.

The declared parent supplies the SDK scope, sidebar location and breadcrumb ancestor. Sidebar entries remain unchanged; only the owning entry is highlighted. Its location is revealed inside the sidebar without scrolling the article. Shared cached sidebar arrays are not mutated. The earlier catalog-based fallback was removed.

Existing return-to-source behavior remains independent. Browser verification found `/device-management/audio-device#devicestate` as the return target; clicking it restored that section and selected audio-device in the sidebar. Direct entry and article-link entry show the same enum ownership.

## Verification and limits

- Focused resolver, API sidebar and sidebar component tests: 131 passed.
- Typecheck passed.
- Full test run: 6,079 passed, 23 skipped (368 files passed, 1 skipped); confirmed by a second run. The subsequent mobile highlight fix passed all 96 shell/sidebar component tests, including its new regression test.
- C++ browser check at 1440 × 1000: selected Struct/Enum entry and matching breadcrumb, article scroll remains zero. Unity desktop and 390 × 844 mobile checked separately. Screenshots are local under ignored `.agent/artifacts/api-feedback/ownership-*.png`.
- Generic resolver tests cover English/non-API paths, undeclared documents, visible pages, different locales/versions, missing and conflicting parents. Existing integration tests exercise other SDKs and reference pages.
- Shared-file comparison against the English main checkout failed: that checkout lacks the newer quality contract/tooling and contains divergent shared files. Both-region `all` browser acceptance and independent reading are still incomplete. This is a draft candidate, not a release certification.
- No production or staging deployment was made.

Lint: changed runtime navigation components pass focused Biome checks. Three pre-existing nested test-component diagnostics remain in DocsShell/DocsSidebarTree tests; their definitions are unchanged from the previous head. Existing docs-page/docs-tree warnings also remain.
