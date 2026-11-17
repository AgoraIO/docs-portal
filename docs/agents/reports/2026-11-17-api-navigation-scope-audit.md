> **Withdrawn navigation proposal (2026-11-17).** All navigation implementation, metadata declarations, source-trail changes and associated new audit/test code from this PR have been reverted to pre-PR `30b04c44d`. This report preserves historical findings from the withdrawn candidate; its navigation screenshots, results and reproduction commands do not describe the current PR. The independent API signature wrapping change remains. Content/link findings await documentation-team review. No replacement navigation rule has been adopted.

# API navigation ownership scope audit — 2026-11-17

Follow-up: [the exhaustive navigation and entry audit](2026-11-17-api-navigation-full-audit.md) checks every API payload and every ordinary-document navigation response. It identifies unresolved entry gaps, the existing FAQ duplicate and historical-version identity defects; the scope counts below are not a complete navigation acceptance.

## Scope and counting

This audit reads both canonical local source trees: 5,517 Chinese and 331 English API-reference pages (5,848 total). The active Chinese catalog contains 96 entries: 86 local and 10 external. External SDK sites do not use this renderer and were not certified by this audit. Source inventory counts are not production traffic or a claim that every legacy source URL is publicly linked.

Compared with the original menu-only scope resolver, source ownership recovers 3,747 source-page scopes. One is the existing RTC error-code redirect and keeps redirecting before rendering; 3,746 rendered source pages are eligible for the fallback. The audit loaded a representative payload for each of the 27 recovered scope/version combinations: 26 headers matched and one retained its redirect.

## SDK impact

The first C++/Unity-only change was incomplete. The same lookup failure occurs across 14 RTC platforms and the additional SDK families below. Counts are source pages missing a menu-derived scope, not counts of new menu entries.

| Scope metadata | Recovered scope | Explicit type-index location |
| --- | ---: | ---: |
| `zh-CN/api-reference/conversational-ai/rest-api/meta.json` | 2 | 0 |
| `zh-CN/api-reference/conversational-ai/restclient-go/meta.json` | 1 | 0 |
| `zh-CN/api-reference/local-server-recording/cpp/legacy/meta.json` | 29 | 0 |
| `zh-CN/api-reference/local-server-recording/java/legacy/meta.json` | 43 | 0 |
| `zh-CN/api-reference/rtc-server-sdk/cpp/meta.json` | 110 | 0 |
| `zh-CN/api-reference/rtc-server-sdk/java/meta.json` | 76 | 0 |
| `zh-CN/api-reference/rtc/android/meta.json` | 188 | 160 |
| `zh-CN/api-reference/rtc/cpp-all-platforms/meta.json` | 271 | 271 |
| `zh-CN/api-reference/rtc/csharp-windows/meta.json` | 298 | 217 |
| `zh-CN/api-reference/rtc/electron/meta.json` | 259 | 255 |
| `zh-CN/api-reference/rtc/flutter/meta.json` | 273 | 268 |
| `zh-CN/api-reference/rtc/harmonyos/meta.json` | 197 | 86 |
| `zh-CN/api-reference/rtc/ios/meta.json` | 263 | 253 |
| `zh-CN/api-reference/rtc/macos/meta.json` | 248 | 238 |
| `zh-CN/api-reference/rtc/mini-program/meta.json` | 8 | 0 |
| `zh-CN/api-reference/rtc/react-native/meta.json` | 264 | 260 |
| `zh-CN/api-reference/rtc/unity/meta.json` | 263 | 259 |
| `zh-CN/api-reference/rtc/unreal-blueprint/meta.json` | 184 | 182 |
| `zh-CN/api-reference/rtc/unreal-cpp/meta.json` | 255 | 252 |
| `zh-CN/api-reference/rtc/web/meta.json` | 54 | 0 |
| `zh-CN/api-reference/rtsa/c/meta.json` | 17 | 0 |
| `zh-CN/api-reference/whiteboard/whiteboard-sdk/android/meta.json` | 146 | 0 |
| `zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/meta.json` | 143 | 0 |
| `zh-CN/api-reference/whiteboard/whiteboard-sdk/web/meta.json` | 152 | 0 |
| `en/api-reference/api-ref/rtmp-gateway/meta.json` | 1 | 0 |
| `en/api-reference/api-ref/speech-to-text/meta.json` | 1 | 0 |

The 12 RTC type indexes declare 2,701 unlisted details. Declarations include only direct list entries in each maintained index, not incidental links in descriptions. Existing visible pages retain their original position. Web, Mini Program, RTSA, Whiteboard and recording/server-SDK details keep their actual authored SDK menus; no fictional Struct/Enum grouping is added. More specific highlighting for pages without an authoritative grouping remains outside this fix.

## Unchanged and excluded cases

- Ordinary documents outside the API-reference tab do not use the new source-path fallback. Existing successful scope resolution wins before the fallback, preserving existing menus and version overrides. Current and historical source-folder version selection has regression coverage.
- Five additional API pages qualify: two Chinese Conversational AI REST pages, one Go REST client page, and one English authentication page each under Media Gateway and Speech-to-Text. These are listed above rather than hidden under a claim of zero non-SDK impact.
- 485 unlisted source pages still have no declared SDK scope. They include legacy `api-ref` material, FAQ, catalog/redirect pages, and deliberately excluded content. For example IoT aPaaS metadata explicitly excludes `client-api` and `device-sdk` with `!` entries; the active catalog uses different product entrances. This patch does not unhide or assign invented SDK ownership to those pages. No blanket bug/fixed claim is made for these separate routes.
- Existing source-return links, content anchors, API signatures and ordinary code examples are unchanged by this scope expansion.

## Reproduction and evidence

```sh
DOCS_NAV_AUDIT_OUTPUT=/tmp/api-navigation-audit.json bun run test src/lib/docs-navigation-inventory.test.ts
bun run test src/lib/docs-nav-scope.test.ts src/lib/api-center-scoped-sidebar.test.ts
bun run types:check
bun run test --maxWorkers=2
```

The inventory test validates source membership for every recovered page, representative real payloads for every recovered scope/version, and all configured type-index links and local files. It emits detailed rows only when requested through the environment variable.

- Focused audit/scope/sidebar run: 120 passed.
- Browser at 1440 × 1000: Android AdvancedAudioOptions has the Class/Enum breadcrumb and selected sidebar entry; Web EventEmitter retains the authored Web menu and version selector. Android has no document overflow. Local screenshots: `.agent/artifacts/api-feedback/ownership-android.png` and `scope-web.png`.
- Final full suite: 6,084 passed, 23 skipped (369 files passed, 1 skipped). Typecheck passed. The suite exited successfully despite socket-reset diagnostics emitted by fixtures.
- Existing limitations remain: independent reading, companion-English shared-file parity and both-region all-page browser release acceptance are incomplete. No deployment is included.
