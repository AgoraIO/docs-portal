# Docs Link Strict Failure Classification

Generated from `scripts/audit-doc-links.mjs` stats. This report classifies current `docs:links:strict` failures before any broad broken-link cleanup.

Regenerate with:

```bash
bun run docs:links:classify
```

Check drift with:

```bash
bun run docs:links:classify:check
```

## Audit Baseline

- Docs files scanned: 1858
- Total links scanned: 40485
- Invalid internal links: 132
- Missing internal paths: 102
- Missing hash anchors: 30
- Missing root links: 94
- Missing relative Markdown links: 8

## Strict Failure Buckets

Buckets are exclusive. Hash failures are counted first; unresolved template variables, `.md/.mdx` normalization issues, current-version API-reference alias/parser cases, hosted/API-reference candidates, and stale legacy paths are removed before the remaining failures are counted as true missing internal routes.

| Bucket | Count | Fix bucket | Safe automated | Manual review |
| --- | ---: | --- | ---: | ---: |
| True missing internal routes | 9 | content-fix/manual-review | 0 | 9 |
| Missing hash anchors | 30 | content-fix/manual-review | 0 | 30 |
| Stale legacy docs paths/redirect candidates | 85 | content-fix/manual-review | 0 | 85 |
| Hosted/API-reference routes | 0 | audit-script-fix | 0 | 0 |
| Current-version API-reference alias/parser cases | 6 | audit-script-fix/manual-review | 0 | 6 |
| Unresolved template variables | 0 | content-fix/manual-review | 0 | 0 |
| .md/.mdx route normalization issues | 2 | mixed | 0 | 2 |

## Content-Fix vs Audit-Script-Fix

- Audit-script-fix candidates: 0
- Content-fix/manual-review candidates: 132

Audit-script-fix candidates are links the current strict audit should classify more precisely before content cleanup starts. Content-fix/manual-review candidates still need page-level decisions.

## Intentional Valid Route Handling

| Class | Count | Notes |
| --- | ---: | --- |
| Hosted references already skipped | 141 | Existing `hosted-reference` skips from `audit-doc-links`. |
| Generated OpenAPI routes resolved | 550 | Existing `openapi-route` resolutions. |
| Known redirect routes resolved | 11 | Existing `redirect` resolutions. |
| Route-resolved relative Markdown links | 1522 | Relative `.md/.mdx` links that already resolve through route normalization. |
| Legacy paths already normalized/resolved | 61 | Existing legacy normalizer coverage; do not rewrite these during issue #564. |
| API-reference macro links already skipped | 550 | Existing `{{Global.API_REF_*}}` / `{{global.API_REF_*}}` skips from `audit-doc-links`. |

## Safe Automated Fixes

- Audit policy: treat hosted API-reference route prefixes as intentional when ownership confirms they are externally hosted or generated. Current safe candidate count: 0.
- Audit normalization: strip root-link `.md/.mdx` suffixes only when the extensionless route exists. Current safe candidate count: 0.
- Report refresh: rerun the classifier and review drift before changing launch gates.

## Manual Review Required

- Missing hash anchors: 30. Confirm the intended heading or update the link target.
- True missing internal routes: 9. Decide whether to restore content, redirect, or remove the link.
- Stale legacy docs paths/redirect candidates: 85. Add deterministic redirect mappings only after confirming the replacement route.
- Unresolved template variables: 0. Replace legacy `{{Global.*}}` style values with concrete hosted API-reference URLs or supported variables.
- Current-version API-reference alias/parser cases: 6. These require audit parser/alias review before being treated as intentional hosted links.
- Remaining `.md/.mdx` normalization issues: 2. These do not resolve after extension stripping and need page-level review.

## Launch Gate

| Gate | Scope | Blocking invalid links | Audit-script candidates | Content/manual candidates | Status |
| --- | --- | ---: | ---: | ---: | --- |
| Voice Agent | `content/docs/{en,zh-CN}/ai/**` | 0 | 0 | 0 | pass |
| RTC Voice/Video | `content/docs/{en,zh-CN}/realtime-media/{voice,video}/**` | 0 | 0 | 0 | pass |

Launch rule: Voice Agent and RTC Voice/Video can launch only when their scoped blocking invalid links are zero, or when remaining links are explicitly classified as intentional hosted/API-reference audit-policy skips. Do not use unrelated broad-link cleanup to satisfy this gate.

## Bucket Samples

### True missing internal routes

Top target prefixes:
- `/en/voice-calling/core-functionality/cloud-proxy`: 2
- `/real-time-stt/develop/translation`: 2
- `/en/agora-chat/reference/error-codes`: 1
- `/en/best-practices/release-notes`: 1
- `/en/interactive-whiteboard/develop/enable-whiteboard`: 1

Samples:
- source: `en/api-reference/api-ref/speech-to-text/rest-api-v5/start.mdx` | target: `/real-time-stt/develop/translation#supported-languages` | reason: `missing-internal-path` | href: `/real-time-stt/develop/translation#supported-languages`
- source: `en/api-reference/api-ref/speech-to-text/rest-api-v6/start.mdx` | target: `/real-time-stt/develop/translation#supported-languages` | reason: `missing-internal-path` | href: `/real-time-stt/develop/translation#supported-languages`
- source: `en/api-reference/faq/integration/cant_upload_courseware.mdx` | target: `/en/interactive-whiteboard/develop/enable-whiteboard` | reason: `missing-internal-path` | href: `/en/interactive-whiteboard/develop/enable-whiteboard`
- source: `en/api-reference/faq/integration/chat_issues.mdx` | target: `/en/agora-chat/reference/error-codes` | reason: `missing-internal-path` | href: `/en/agora-chat/reference/error-codes`
- source: `en/api-reference/faq/integration/console_error_web.mdx` | target: `/en/voice-calling/core-functionality/cloud-proxy` | reason: `missing-internal-path` | href: `/en/voice-calling/core-functionality/cloud-proxy`
- source: `en/api-reference/faq/integration/console_error_web.mdx` | target: `/en/voice-calling/core-functionality/cloud-proxy` | reason: `missing-internal-path` | href: `/en/voice-calling/core-functionality/cloud-proxy`
- source: `en/api-reference/faq/integration/console_error_web.mdx` | target: `/en/voice-calling/reference/firewall` | reason: `missing-internal-path` | href: `/en/voice-calling/reference/firewall`
- source: `en/introduction/community-resources.md` | target: `/en/best-practices/release-notes` | reason: `missing-internal-path` | href: `/en/best-practices/release-notes`
- ... 1 more

### Missing hash anchors

Top target prefixes:
- `#Status-codes`: 9
- `##dress-up-resources`: 3
- `#create_session`: 3
- `/en/video-calling/get-started/manage-agora-account`: 2
- `#with_avatarvendor`: 2

Samples:
- source: `en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/manage-thread-members.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- source: `en/api-reference/api-ref/im/thread-management/manage-thread-members.md` | target: `#Status-codes` | reason: `missing-hash-anchor` | href: `#Status-codes`
- ... 22 more

### Stale legacy docs paths/redirect candidates

Top target prefixes:
- `/en/cloud-recording/reference/restful-api`: 7
- `/en/3.x/interactive-live-streaming/introduction`: 5
- `/en/interactive-live-streaming/get-started/get-started-sdk`: 5
- `/en/video-calling/advanced-features/custom-video`: 5
- `/en/cloud-recording/reference/common-errors`: 4

Samples:
- source: `en/api-reference/api-ref/broadcast-streaming/index.mdx` | target: `/help` | reason: `missing-internal-path` | href: `/help`
- source: `en/api-reference/api-ref/flexible-classroom/classroom-sdk.mdx` | target: `/help/integration-issues/agora_class_custom_properties` | reason: `missing-internal-path` | href: `/help/integration-issues/agora_class_custom_properties`
- source: `en/api-reference/api-ref/flexible-classroom/classroom-sdk.mdx` | target: `/help/integration-issues/agora_class_custom_properties` | reason: `missing-internal-path` | href: `/help/integration-issues/agora_class_custom_properties`
- source: `en/api-reference/api-ref/signaling/flutter.mdx` | target: `/signaling/reference/error-codes` | reason: `missing-internal-path` | href: `/signaling/reference/error-codes`
- source: `en/api-reference/api-ref/signaling/flutter.mdx` | target: `/signaling/reference/error-codes` | reason: `missing-internal-path` | href: `/signaling/reference/error-codes`
- source: `en/api-reference/api-ref/speech-to-text/rest-api-v5/start.mdx` | target: `/cloud-recording/reference/region-vendor` | reason: `missing-internal-path` | href: `/cloud-recording/reference/region-vendor`
- source: `en/api-reference/api-ref/speech-to-text/rest-api-v6/start.mdx` | target: `/cloud-recording/reference/region-vendor` | reason: `missing-internal-path` | href: `/cloud-recording/reference/region-vendor`
- source: `en/api-reference/faq/integration/acquire_file_directory.mdx` | target: `/en/cloud-recording/reference/restful-api#query` | reason: `missing-internal-path` | href: `/en/cloud-recording/reference/restful-api#query`
- ... 77 more

### Hosted/API-reference routes

None.

### Current-version API-reference alias/parser cases

Top target prefixes:
- `/en/api-reference/rtc/android`: 6

Samples:
- source: `en/realtime-media/marketplace/build/add-moderation-and-intelligence/livedata-conversation-intelligence.mdx` | target: `/en/api-reference/rtc/android/(current/(current` | reason: `missing-internal-path` | href: `../../../../api-reference/rtc/android/(current` | safeAutomated: false
- source: `en/realtime-media/marketplace/build/add-video-and-ar-effects/faceunity.mdx` | target: `/en/api-reference/rtc/android/(current/(current` | reason: `missing-internal-path` | href: `../../../../api-reference/rtc/android/(current` | safeAutomated: false
- source: `en/realtime-media/marketplace/build/add-video-and-ar-effects/faceunity.mdx` | target: `/en/api-reference/rtc/android/(current/(current` | reason: `missing-internal-path` | href: `../../../../api-reference/rtc/android/(current` | safeAutomated: false
- source: `en/realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar.mdx` | target: `/en/api-reference/rtc/android/(current/(current` | reason: `missing-internal-path` | href: `../../../../api-reference/rtc/android/(current` | safeAutomated: false
- source: `en/realtime-media/marketplace/build/build-your-own-extension/audio-filter.mdx` | target: `/en/api-reference/rtc/android/(current/(current` | reason: `missing-internal-path` | href: `../../../../api-reference/rtc/android/(current` | safeAutomated: false
- source: `en/realtime-media/marketplace/build/build-your-own-extension/video-filter.mdx` | target: `/en/api-reference/rtc/android/(current/(current` | reason: `missing-internal-path` | href: `../../../../api-reference/rtc/android/(current` | safeAutomated: false

### Unresolved template variables

None.

### .md/.mdx route normalization issues

Top target prefixes:
- `/zh-CN/best-practice/audio-settings`: 1
- `/zh-CN/get-started/quick-start`: 1

Samples:
- source: `zh-CN/best-practices/audio-settings.mdx` | target: `/zh-CN/get-started/quick-start` | reason: `missing-internal-path` | href: `../get-started/quick-start.md` | routeCandidate: /zh-CN/get-started/quick-start | safeAutomated: false
- source: `zh-CN/best-practices/release-notes.md` | target: `/zh-CN/best-practice/audio-settings` | reason: `missing-internal-path` | href: `../best-practice/audio-settings.md` | routeCandidate: /zh-CN/best-practice/audio-settings | safeAutomated: false
