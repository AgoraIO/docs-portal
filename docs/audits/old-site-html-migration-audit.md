# Old English Site HTML Migration Audit

Generated: 2026-06-26

## Scope

This audit checks the migration quality from the old English documentation site to the current docs portal.

- Old site entry: `https://docs.agora.io/en/`
- Target site: current `docs-portal` English docs
- Evidence basis: rendered HTML only
- Source paths: used only as traceability and suggested fix-location hints
- Old rendered URLs audited: 3116
- New rendered candidates audited: 1127

## Summary

| metric | count |
| --- | ---: |
| Old rendered pages reachable | 3116 |
| New rendered candidate pages reachable | 1126 |
| Migrated | 2840 |
| Partial | 265 |
| Missing | 11 |

Status definitions:

- `migrated`: a rendered new page exists and the core title/body/structure evidence aligns.
- `partial`: a rendered new page exists, but the page has visible content, structure, or title risks.
- `missing`: no rendered new page has enough title/body/URL evidence to be a reasonable match.

## Migration Matrix By Old Area

| old_area | old_pages | migrated | partial | missing |
| --- | ---: | ---: | ---: | ---: |
| video-calling | 480 | 414 | 66 | 0 |
| broadcast-streaming | 477 | 453 | 24 | 0 |
| interactive-live-streaming | 476 | 452 | 24 | 0 |
| voice-calling | 379 | 361 | 18 | 0 |
| agora-chat | 288 | 286 | 2 | 0 |
| signaling | 261 | 241 | 20 | 0 |
| extensions-marketplace | 156 | 134 | 22 | 0 |
| conversational-ai | 102 | 87 | 15 | 0 |
| flexible-classroom | 74 | 66 | 8 | 0 |
| server-gateway | 57 | 55 | 2 | 0 |
| interactive-whiteboard | 53 | 47 | 6 | 0 |
| iot | 45 | 41 | 4 | 0 |
| real-time-stt | 40 | 40 | 0 | 0 |
| media-gateway | 34 | 17 | 17 | 0 |
| cloud-recording | 27 | 24 | 3 | 0 |
| agora-analytics | 26 | 25 | 1 | 0 |
| on-premise-recording | 26 | 24 | 2 | 0 |
| ten-framework | 25 | 2 | 13 | 10 |
| cloud-transcoding | 24 | 23 | 1 | 0 |
| ten-agent | 17 | 3 | 13 | 1 |
| media-push | 16 | 16 | 0 | 0 |
| media-pull | 13 | 13 | 0 | 0 |
| convo-ai-device-kit | 10 | 8 | 2 | 0 |
| open-ai-integration | 10 | 8 | 2 | 0 |

## Missing Old Documents

These old pages do not have a reasonable rendered HTML location in the new portal.

| old_title | old_url | closest_new_candidate | recommended_action |
| --- | --- | --- | --- |
| Project overview | https://docs.agora.io/en/ten-agent/overview/project-overview | `/en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/overview` | Create or route a corresponding English page, or document intentional removal. |
| Schema system | https://docs.agora.io/en/ten-framework/architecture/schema-system | `/en/ai/build/architecture` | Create or route a corresponding English page, or document intentional removal. |
| Subgraphs | https://docs.agora.io/en/ten-framework/architecture/sub-graphs | `/en/ai/build/architecture` | Create or route a corresponding English page, or document intentional removal. |
| Type system | https://docs.agora.io/en/ten-framework/architecture/type-system | `/en/ai/build/architecture` | Create or route a corresponding English page, or document intentional removal. |
| Develop with Go | https://docs.agora.io/en/ten-framework/develop/binding | `/en/ai/studio/build/test-agent` | Create or route a corresponding English page, or document intentional removal. |
| TEN Cloud Store | https://docs.agora.io/en/ten-framework/develop/cloud-store | `/en/ai/studio/build/test-agent` | Create or route a corresponding English page, or document intentional removal. |
| Profile performance | https://docs.agora.io/en/ten-framework/develop/profile | `/en/ai/device-kit/build/specifications-and-compatibility` | Create or route a corresponding English page, or document intentional removal. |
| Validate graphs | https://docs.agora.io/en/ten-framework/develop/validate-graphs | `/en/ai/studio/build/test-agent` | Create or route a corresponding English page, or document intentional removal. |
| Development workflow | https://docs.agora.io/en/ten-framework/develop/workflow | `/en/ai/device-kit/build/run-the-demo-server` | Create or route a corresponding English page, or document intentional removal. |
| Required fields | https://docs.agora.io/en/ten-framework/reference/required | `/en/ai/device-kit/reference/enable-services` | Create or route a corresponding English page, or document intentional removal. |
| Versioning | https://docs.agora.io/en/ten-framework/reference/version_system | `/en/ai/device-kit/reference/release-notes` | Create or route a corresponding English page, or document intentional removal. |

## Partial Migration Risk Breakdown

| risk_type | affected_old_pages | what_to_check |
| --- | ---: | --- |
| Tables absent in new rendered HTML | 106 | Pages where old HTML rendered tables but the matched new page rendered no table. |
| H1/title changed | 53 | Pages where the main heading changed enough to suggest a possible wrong target or overly generic new page. |
| Code/API blocks reduced | 50 | Pages where code or API reference blocks are substantially reduced in the new rendered HTML. |
| Body much shorter | 46 | Pages where the new page is much shorter than the old rendered page. |
| Other structural differences | 10 | Lower-volume structure differences that need manual review. |

## High-Risk Body Shrinkage Cases

These are the clearest content-loss candidates. The character counts compare new rendered body text to old rendered body text.

| old_url | new_url | rendered_text_chars |
| --- | --- | --- |
| https://docs.agora.io/en/broadcast-streaming/best-practices/optimize-frame-rendering?platform=android | `/en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-frame-rendering` | 1231 / 9269 |
| https://docs.agora.io/en/broadcast-streaming/best-practices/preload-channels?platform=web | `/en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/preload-channels` | 1113 / 15548 |
| https://docs.agora.io/en/cloud-recording/rest-api/restful-authentication | `/en/realtime-media/cloud-recording/reference/restful-authentication` | 2135 / 9391 |
| https://docs.agora.io/en/convo-ai-device-kit/get-started/enable-services | `/en/ai/device-kit/reference/enable-services` | 1941 / 13510 |
| https://docs.agora.io/en/interactive-live-streaming/best-practices/optimize-frame-rendering?platform=android | `/en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-frame-rendering` | 1231 / 9344 |
| https://docs.agora.io/en/interactive-live-streaming/best-practices/preload-channels?platform=web | `/en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/preload-channels` | 1113 / 15609 |
| https://docs.agora.io/en/iot/reference/channel-management-rest-api?platform=android | `/en/solutions/iot/reference/channel-management-rest-api` | 2863 / 26891 |
| https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address | `/en/api-reference/api-ref/rtmp-gateway/query-ip-address` | 3243 / 13221 |
| https://docs.agora.io/en/ten-framework/architecture/sub-graphs | `/en/ai/build/architecture` | 7751 / 31121 |
| https://docs.agora.io/en/ten-framework/get-started/ten-designer | `/en/ai/get-started/_shared-mdx-fixture` | 1173 / 9662 |
| https://docs.agora.io/en/ten-framework/get-started/ten-manager | `/en/ai/get-started/_shared-mdx-fixture` | 1173 / 8032 |
| https://docs.agora.io/en/video-calling/best-practices/optimize-frame-rendering?platform=android | `/en/realtime-media/video/build/capture-and-render-video/optimize-frame-rendering` | 1157 / 9317 |
| https://docs.agora.io/en/video-calling/best-practices/preload-channels?platform=web | `/en/realtime-media/video/build/join-and-manage-channels/preload-channels` | 1051 / 15647 |
| https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=android | `/en/realtime-media/video/get-started-sdk` | 1375 / 32114 |
| https://docs.agora.io/en/video-calling/overview/release-notes?platform=android | `/en/realtime-media/video/reference/release-notes` | 2403 / 115661 |

## New Site Quality Findings

| issue_type | severity | affected_scope | evidence | recommended_fix |
| --- | --- | --- | --- | --- |
| Duplicate rendered H1 | High | Most audited new pages | 1122 pages render 2 H1 elements, and 4 pages render 4 H1 elements. For example, `/en/introduction/about-agora` renders two identical `About Agora` H1s. | Ensure the docs shell title and MDX body title are not both emitted as H1. Fix in the docs shell or MDX rendering path, then rerun a rendered HTML heading scan. |
| Missing Broadcast Streaming release notes route | High | `/en/realtime-media/broadcast-streaming/reference/release-notes` | The reference `meta.json` lists `release-notes`, but the rendered route returns the portal 404 page and no matching md/mdx file exists. | Add the missing release notes page, remove the stale navigation entry, or redirect to the intended release notes page. |
| Broken Interactive Live Streaming API sunset target | High | `/en/solutions/interactive-live-streaming/reference/api-sunset` | The route redirects to `/en/api-reference/api-ref/solutions-api-sunset`, which renders 404. | Fix the redirect target or create the destination page. |
| Tables missing after migration | High | 106 old pages marked partial | Old HTML rendered tables, but matched new HTML rendered no table. | Review migrated pages where table content is expected, especially platform capability, pricing, API, and configuration pages. |
| Code/API examples reduced | Medium | 50 old pages marked partial | Old pages had substantially more code/API blocks than matched new pages. | Compare rendered code/example sections and restore missing tabs, snippets, or API reference blocks. |

## Recommended Fix Order

1. Resolve the 11 TEN missing documents or explicitly document that they are intentionally removed.
2. Fix the two high-severity route issues: Broadcast Streaming release notes and Interactive Live Streaming API sunset redirect.
3. Fix the duplicate H1 rendering issue globally.
4. Manually review the 15 body-shrinkage cases above.
5. Review table-loss and code/API-loss partial pages by product area, starting with Video Calling, Broadcast Streaming, Interactive Live Streaming, Signaling, and Media Gateway.

## Notes

This report intentionally does not include the full raw 3116-row traceability matrix. The raw matrix was useful for computation, but too noisy for review. This report keeps the human-actionable findings only.
