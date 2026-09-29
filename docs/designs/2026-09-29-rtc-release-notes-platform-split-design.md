# RTC Release Notes platform split (English)

## Goal and scope

Split `content/docs/en/realtime-media/rtc/reference/release-notes.mdx` into useful, independently searchable platform pages while preserving the existing public entry and navigable historical links. This is a docs-portal content/routing change, not an SDK release or API/DITA regeneration. RTC quickstarts, Voice, Video Calling, other products, and Chinese pages are out of scope for this round.

The current source is 19,163 lines (about 1.29 MB). It contains 12 SDK platform variants, second blocks for Web/Android/iOS extensions, and shared Notifications. Platform separation is useful because readers need a single SDK's versions and extension releases; splitting merely by equal line counts would mix unrelated release streams.

## Proposed pages

Keep `/en/realtime-media/rtc/reference/release-notes` as a short `platform-group` index, with Android as the current default and the original descriptive metadata. Add one child page per existing platform: `android`, `ios`, `macos`, `web`, `windows`, `electron`, `flutter`, `react-native`, `javascript` (source key `react-js`), `unity`, `unreal`, and `blueprint`. Preserve the order of versions within each page. Append the later extension blocks to Web, Android, and iOS respectively. Place the shared Notifications content where it remains reachable from the old entry and from platform navigation; do not silently drop or duplicate it across all twelve large files.

Follow the existing Video Calling `platform-group` route, tab/navigation, search, and Markdown/LLM export conventions where applicable, but choose headings and content boundaries based on RTC content. Do not modify generated manifests by hand. Only add a sidebar entry if required by the existing RTC reference navigation behavior, which currently omits `release-notes` from `meta.json`.

## Backward compatibility

Before editing, inventory all existing heading IDs, explicit HTML IDs, accordion IDs, URLs in repository content, and old query aliases. Keep canonical legacy IDs for version headings and distinct section headings on the platform pages; where headings repeat, resolve historical numbered IDs according to their original order. Map `?platform=` aliases (including `windows-cpp` and `react-js`) to the correct platform without discarding fragments or unrelated query parameters. A plain old URL continues to show the default platform and platform chooser. Update known internal links where the destination platform is unambiguous; preserve the old URL for deliberately platform-neutral links.

Fragments are not sent to the server: a `#hash`-only inbound link may require client-side routing or a lightweight compatibility target on the old entry. Test both unique historical anchors and ambiguous repeated anchors. If a hash is shared by multiple platforms and neither query nor other context chooses a platform, retain a reachable default/chooser rather than silently promising an unknowable destination. Keep the old path valid for inbound links and exports; do not introduce a blanket server redirect that loses fragment context.

## Verification

Use a before/after inventory to compare each platform's release content, headings, explicit IDs, accordion IDs, and links. Verify known internal links, canonical route plus `?platform=` and `#hash` combinations, sidebar/tabs, search entries, and Markdown/LLM exports. Add focused regression tests for compatibility behavior and source integrity, then run `bun run test`, `bun run types:check`, and `bun run build`. Record any failures and distinguish unverified third-party inbound hashes from verified repository links.

## Assumptions and risks

The scope is the English RTC Release Notes, not every RTC guide. Existing Video Calling platform-group handling can be reused only after confirming RTC's actual anchor and route behavior. External sites' complete inbound URL inventory is unavailable; ambiguous hash-only links cannot always recover the original platform without an explicit platform hint.
