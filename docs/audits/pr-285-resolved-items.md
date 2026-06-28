# PR 285 Resolved Audit Items

Source audit: [PR 285](https://github.com/AgoraIO/docs-portal/pull/285), commit `5f5ef4ba55c6008d97e073a808c8ce04013c7bad`.

This file marks the subset of the PR 285 migration audit that is resolved by this follow-up branch. It does not claim the full PR 285 audit is complete.

## Resolved Summary

| PR 285 audit bucket | Original count | Resolved in this branch | Notes |
| --- | ---: | ---: | --- |
| Tables absent in new rendered HTML | 106 | 19 target pages | Restored missing Markdown tables, parameter tables, status metric tables, region lists, geofencing outcome tables, security classification/responsibility tables, SDK install mapping tables, Media Gateway event tables, and Whiteboard release note tables. |
| Code/API blocks reduced | 50 | 6 target pages | Restored platform-specific code examples, API call examples, endpoint overview details, and Whiteboard release note code snippets. |
| Link issues found during follow-up QA | Not part of PR 285 summary buckets | 1 target page family | Fixed Cloud Recording API Reference relative links that resolved outside `/cloud-recording`. |

## Resolved Items

| Status | PR 285 issue text | Old URL | New URL | Source file | Resolution |
| --- | --- | --- | --- | --- | --- |
| Resolved | code/API blocks appear substantially reduced | `https://docs.agora.io/en/broadcast-streaming/best-practices/optimize-multihost-video?platform=android` | `/en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video` | `content/docs/en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx` | Restored the migrated Android, iOS, and Flutter platform sections with code examples and API references. |
| Resolved | code/API blocks appear substantially reduced | `https://docs.agora.io/en/video-calling/best-practices/optimize-multihost-video?platform=android` | `/en/realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video` | `content/docs/en/realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video.mdx` | Restored the migrated Android, iOS, and Flutter platform sections with code examples and API references. |
| Resolved | code/API blocks appear substantially reduced | `https://docs.agora.io/en/interactive-live-streaming/best-practices/optimize-multihost-video?platform=android` | `/en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video` | `content/docs/en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx` | Restored the migrated Android, iOS, and Flutter platform sections with code examples and API references. |
| Resolved | code/API blocks appear substantially reduced | `https://docs.agora.io/en/cloud-recording/rest-api/overview` | `/en/realtime-media/cloud-recording/reference/restful-api` | `content/docs/en/realtime-media/cloud-recording/reference/restful-api.mdx` | Restored the endpoint overview content and HTTP method lines for the Cloud Recording RESTful API wrapper page. |
| Resolved | tables present in old HTML are absent in new HTML; code/API blocks appear substantially reduced | `https://docs.agora.io/en/interactive-whiteboard/overview/core-concepts` | `/en/realtime-media/whiteboard/overview/core-concepts` | `content/docs/en/realtime-media/whiteboard/overview/core-concepts.md` | Restored the SDK, room, and task token permission tables. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/interactive-whiteboard/reference/status-page` | `/en/realtime-media/whiteboard/reference/status-page` | `content/docs/en/realtime-media/whiteboard/reference/status-page.md` | Restored the Status Page content, images, and QoE metric table. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/video-calling/advanced-features/simulcasting?platform=android` | `/en/realtime-media/video/build/manage-connection-and-quality/simulcasting` | `content/docs/en/realtime-media/video/build/manage-connection-and-quality/simulcasting.mdx` | Restored the comparison table for Simulcasting versus Dual-stream mode. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/extensions-marketplace/develop/integrate/ht_3d_avatar?platform=android` | `/en/realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar` | `content/docs/en/realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar.mdx` | Restored the interface description table and key/value parameter tables. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/streaming-information/mute` | `/en/realtime-media/rtmp-gateway/reference/srt-streaming` | `content/docs/en/realtime-media/rtmp-gateway/reference/srt-streaming.md` | Restored the SRT region code list and corrected the Get streaming key anchor. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/broadcast-streaming/advanced-features/geofencing?platform=android` | `/en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing` | `content/docs/en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing.mdx` | Converted the repeated bare HTML table fragments to Markdown tables so the geofencing outcome table renders. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/video-calling/advanced-features/geofencing?platform=android` | `/en/realtime-media/video/build/manage-connection-and-quality/geofencing` | `content/docs/en/realtime-media/video/build/manage-connection-and-quality/geofencing.mdx` | Converted the repeated bare HTML table fragments to Markdown tables so the geofencing outcome table renders. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/interactive-live-streaming/advanced-features/geofencing?platform=android` | `/en/solutions/interactive-live-streaming/build/secure-and-protect-channels/geofencing` | `content/docs/en/solutions/interactive-live-streaming/build/secure-and-protect-channels/geofencing.mdx` | Converted the repeated bare HTML table fragments to Markdown tables so the geofencing outcome table renders. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/voice-calling/advanced-features/geofencing?platform=android` | `/en/realtime-media/voice/build/manage-connection-and-quality/geofencing` | `content/docs/en/realtime-media/voice/build/manage-connection-and-quality/geofencing.mdx` | Converted the repeated bare HTML table fragments to Markdown tables so the geofencing outcome table renders. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/cloud-recording/reference/security` | `/en/realtime-media/cloud-recording/reference/security` | `content/docs/en/realtime-media/cloud-recording/reference/security.mdx` | Converted table-bearing accordion blocks to native details blocks so the data classification and responsibilities tables render. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/video-calling/reference/security` | `/en/realtime-media/video/reference/security` | `content/docs/en/realtime-media/video/reference/security.mdx` | Converted table-bearing accordion blocks to native details blocks so the data classification and responsibilities tables render. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/extensions-marketplace/reference/security?platform=android` | `/en/realtime-media/marketplace/reference/security` | `content/docs/en/realtime-media/marketplace/reference/security.mdx` | Converted table-bearing accordion blocks to native details blocks so the data classification and responsibilities tables render. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/media-gateway/reference/security` | `/en/realtime-media/rtmp-gateway/reference/security` | `content/docs/en/realtime-media/rtmp-gateway/reference/security.md` | Restored the data classification and responsibilities tables. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/extensions-marketplace/develop/integrate/activefence?platform=android` | `/en/realtime-media/marketplace/build/add-moderation-and-intelligence/activefence` | `content/docs/en/realtime-media/marketplace/build/add-moderation-and-intelligence/activefence.mdx` | Restored the ActiveFence custom callback fields table as a top-level Markdown table. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/signaling/reference/downloads?platform=android` | `/en/realtime-media/rtm/reference/downloads` | `content/docs/en/realtime-media/rtm/reference/downloads.md` | Restored Android and Unity SDK file mapping tables. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/media-gateway/overview/core-concepts` | `/en/realtime-media/rtmp-gateway/reference/core-concepts` | `content/docs/en/realtime-media/rtmp-gateway/reference/core-concepts.md` | Restored the channel profile comparison table. |
| Resolved | tables present in old HTML are absent in new HTML | `https://docs.agora.io/en/media-gateway/develop/receive-notifications` | `/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications` | `content/docs/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications.md` | Restored the Media Gateway event type summary table. |
| Resolved | code/API blocks appear substantially reduced | `https://docs.agora.io/en/interactive-whiteboard/overview/release-notes` | `/en/realtime-media/whiteboard/overview/release-notes` | `content/docs/en/realtime-media/whiteboard/overview/release-notes.mdx` | Restored the full Android, iOS, and Web Whiteboard release notes from shared source, including the Web domain table and Android/iOS SDK integration code snippets, while converting legacy Docusaurus JSX to renderable MDX directives and Markdown links. |

## Deferred Items

| Status | Scope | Reason |
| --- | --- | --- |
| Deferred | API Reference and OpenAPI-generated pages | User requested that API pages can be left untouched for now. |
| Deferred | Obvious automated audit mismatches such as TEN/AI old pages mapped to unrelated overview pages | These require route/remapping decisions before content can be safely restored. |

## Additional QA Fixes

| Status | Found during | URL | Source files | Resolution |
| --- | --- | --- | --- | --- |
| Resolved | Manual check after restoring Cloud Recording API content | `/en/api-reference/api-ref/cloud-recording` | `content/docs/en/api-reference/api-ref/cloud-recording/index.mdx`, `content/docs/en/api-reference/api-ref/cloud-recording/authentication.md`, `content/docs/en/api-reference/api-ref/cloud-recording/status-codes.mdx`, `content/docs/zh-CN/api-reference/api-ref/cloud-recording/index.mdx`, `content/docs/zh-CN/api-reference/api-ref/cloud-recording/authentication.md` | Replaced relative links such as `(acquire)` with absolute Cloud Recording API Reference links such as `/en/api-reference/api-ref/cloud-recording/acquire`, so overview and authentication links stay inside the Cloud Recording API Reference route. |

## Verification

- `bun test src/lib/docs-content-regressions.test.ts -t "keeps PR 285 code and table recovery pages"`
- `bun test src/lib/docs-content-regressions.test.ts -t "keeps block-style lists and notes out of GFM table cells"`
- `bun run types:check`
- `git diff --check`
- MDX compile check for the restored table pages.
- Browser QA for `/en/api-reference/api-ref/cloud-recording`: overview links now resolve to `/en/api-reference/api-ref/cloud-recording/*`, and the Acquire link lands on `/en/api-reference/api-ref/cloud-recording/acquire`.
