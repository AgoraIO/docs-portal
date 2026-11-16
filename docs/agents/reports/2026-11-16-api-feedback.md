# API navigation and signature feedback

## Final behavior

- Deep Chinese API pages omitted from `meta.pages` resolve their SDK navigation scope through the catalog's existing platform entry. They retain exactly the same authored sidebar and version selector as the SDK overview, including on direct visits.
- Sidebar contents remain fixed. There is no injected current-page section and no extra sidebar scroll reset.
- Breadcrumbs describe the fixed product/platform/page hierarchy. Browsing history appears only in the separate return link, never as a breadcrumb ancestor.
- Source trails recognize both `/api-reference/` and `/zh-CN/api-reference/`. New tabs and copied links retain the source section; the destination anchor remains intact.
- API signatures wrap initially and retain their type links, copy control, and wrap toggle. Ordinary code examples retain their existing default.

## Verification

- Integration tests compare the entire sidebar of the C++ and Unity enum pages with their SDK overview sidebars, rather than checking only for a few visible labels.
- A component test verifies that a shared API URL restores the separate return link without injecting that source into the breadcrumb.
- Browser check: C++ `enum-mediadevicestatetype` displays the fixed C++ v4.7.0 navigation. The audio-device navigation and return trail remain usable. Local screenshot: ignored `.agent/artifacts/api-feedback/sidebar-stable.png`.
- Prior signature check: `user-info-updated` preserves its arguments and `UID` link; computed white-space is `pre-wrap` and client/scroll widths both measure 690 px.
- Final focused tests: 162 passed. Types passed. Full-suite result is recorded in the PR.
- Two existing Biome warnings remain in `docs-page.server.ts`: optional chaining and an unused helper.

The feedback's separate phrase about a missing jump preview does not specify a hover interaction. The Web method/event table of contents and type links were verified; this patch does not add hover previews.

This is a local candidate. Independent review and release acceptance remain pending; staging and production have not been updated by this change.
