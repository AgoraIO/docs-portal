# Generated HTML API Migration Validation Matrix

Date: 2026-07-09

This report validates the generated HTML API migration lanes against representative real legacy sources from `shengwang-doc-source`.

## Matrix

| Lane | Source | Detection | Input files | Planned outputs | Full output |
| --- | --- | --- | ---: | ---: | ---: |
| DITA/Oxygen | `rtc/Android` | `DITA-OT/Oxygen API reference (API/ directory)` | 249 | 251 | 250 MDX + 1 meta |
| TypeDoc | `flexible-classroom/Web` | `TypeDoc HTML reference` | 398 | 407 | 402 MDX + 5 meta |
| TypeDoc | `whiteboard/Web` | `TypeDoc HTML reference` | 40 | 48 | 44 MDX + 4 meta |
| Doxygen/Javadoc | `recording/cpp` | `Doxygen/Javadoc HTML reference` | 37 | 39 | 38 MDX + 1 meta |
| iOS doc-generator/appledoc | `whiteboard/iOS` | `iOS-doc-generator HTML reference` | 61 | 75 | 68 MDX + 7 meta |
| Dartdoc | `agora-chat/Flutter` | `Dartdoc HTML reference` | 817 | 902 | 816 MDX + 86 meta |

## Commands

Source root: `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs`

Each lane was run once with `--dry-run` and once as a full generation into the output root.

```bash
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/rtc/Android --output /tmp/html-migration-matrix/dita-rtc-android-dry --product rtc --platform android --route-base-path /zh-CN/api-reference --dry-run
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/rtc/Android --output /tmp/html-migration-matrix/dita-rtc-android --product rtc --platform android --route-base-path /zh-CN/api-reference
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/flexible-classroom/Web --output /tmp/html-migration-matrix/typedoc-flex-web-dry --product flexible-classroom --platform web --route-base-path /zh-CN/api-reference --dry-run
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/flexible-classroom/Web --output /tmp/html-migration-matrix/typedoc-flex-web --product flexible-classroom --platform web --route-base-path /zh-CN/api-reference
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/whiteboard/Web --output /tmp/html-migration-matrix/typedoc-whiteboard-web-dry --product whiteboard --platform web --route-base-path /zh-CN/api-reference --dry-run
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/whiteboard/Web --output /tmp/html-migration-matrix/typedoc-whiteboard-web --product whiteboard --platform web --route-base-path /zh-CN/api-reference
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/recording/cpp --output /tmp/html-migration-matrix/doxygen-recording-cpp-dry --product recording --platform cpp --route-base-path /zh-CN/api-reference --dry-run
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/recording/cpp --output /tmp/html-migration-matrix/doxygen-recording-cpp --product recording --platform cpp --route-base-path /zh-CN/api-reference
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/whiteboard/iOS --output /tmp/html-migration-matrix/ios-whiteboard-dry --product whiteboard --platform ios --route-base-path /zh-CN/api-reference --dry-run
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/whiteboard/iOS --output /tmp/html-migration-matrix/ios-whiteboard --product whiteboard --platform ios --route-base-path /zh-CN/api-reference
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/agora-chat/Flutter --output /tmp/html-migration-matrix/dartdoc-agora-chat-flutter-dry --product agora-chat --platform flutter --route-base-path /zh-CN/api-reference --dry-run
node scripts/html-to-md-migration.mjs --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/agora-chat/Flutter --output /tmp/html-migration-matrix/dartdoc-agora-chat-flutter --product agora-chat --platform flutter --route-base-path /zh-CN/api-reference
```

## Output Audits

### DITA/Oxygen (rtc/Android)

- Output: `/tmp/html-migration-matrix/dita-rtc-android`
- Sample files checked: `class-videocanvas.mdx`, `api-livetranscoding-adduser.mdx`
- Missing required files: 0
- Content assertion mismatches: 0
- Internal relative .html links: 0
- Helper-page pollution matches: 0

### TypeDoc (flexible-classroom/Web)

- Output: `/tmp/html-migration-matrix/typedoc-flex-web`
- Sample files checked: `classes/agora-rte-engine-config.mdx`, `classes/agora-rte-engine.mdx`
- Missing required files: 0
- Content assertion mismatches: 0
- Internal relative .html links: 0
- Helper-page pollution matches: 0

### TypeDoc (whiteboard/Web)

- Output: `/tmp/html-migration-matrix/typedoc-whiteboard-web`
- Sample files checked: `globals.mdx`
- Missing required files: 0
- Content assertion mismatches: 0
- Internal relative .html links: 0
- Helper-page pollution matches: 0

### Doxygen/Javadoc (recording/cpp)

- Output: `/tmp/html-migration-matrix/doxygen-recording-cpp`
- Sample files checked: `classagora-1-1recording-1-1-i-recording-engine.mdx`
- Missing required files: 0
- Content assertion mismatches: 0
- Internal relative .html links: 0
- Helper-page pollution matches: 0

### iOS doc-generator/appledoc (whiteboard/iOS)

- Output: `/tmp/html-migration-matrix/ios-whiteboard`
- Sample files checked: `classes/white-sdk.mdx`, `protocols/white-common-callback-delegate.mdx`
- Missing required files: 0
- Content assertion mismatches: 0
- Internal relative .html links: 0
- Helper-page pollution matches: 0

### Dartdoc (agora-chat/Flutter)

- Output: `/tmp/html-migration-matrix/dartdoc-agora-chat-flutter`
- Sample files checked: `agora-chat-sdk/chat-client/index.mdx`, `agora-chat-sdk/chat-client/add-connection-event-handler.mdx`, `agora-chat-sdk/chat-type/index.mdx`
- Missing required files: 0
- Content assertion mismatches: 0
- Internal relative .html links: 0
- Helper-page pollution matches: 0

## Fumadocs Compile Check

Temporary validation subtree: `content/docs/zh-CN/api-reference/__html-migration-validation/`

Result: `passed`

## REST/OpenAPI Out Of Scope

Command status: `1`

Expected: REST/OpenAPI source exits nonzero with unsupported-source guidance.

## Known Gaps

- This matrix validates representative real sources, not every product/platform folder under `html-docs`.
- REST/OpenAPI remains intentionally out of scope for this HTML migration CLI.
- Generated content still needs human spot review before being committed as product documentation.

