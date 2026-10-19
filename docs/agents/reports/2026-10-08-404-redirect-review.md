# 2026-10-08 PostHog 404 redirect review

复核时间：2026-10-08 17:19:53（北京时间）。
输入：output/posthog/404-revalidation-2026-10-08.json 中当前严格返回 HTTP 404 的 690 个路径。

## 结果

- 新增可验证重定向：51 条；目标均已线上 GET 验证为 HTTP 200。
- 已有规则覆盖：5 条；目标均已线上 GET 验证为 HTTP 200，不重复添加。
- 候选目标复核失败：1 条，未加入生产规则。
- 暂不安全映射：633 条，保留在 unresolved 清单。

## 新增规则

规则源：src/lib/legacy-sitemap/posthog-revalidated-404s.json。生成器会将其合并到现有 legacy redirect artifacts。

| 404 源路径 | 目标 | 历史事件次数 | 当前目标状态 |
| --- | --- | ---: | ---: |
| <code>/en/All/faq/billing_account</code> | <code>/en/api-reference/faq/account/billing_account</code> | 2 | 200 |
| <code>/en/All/faq/browser_support</code> | <code>/en/api-reference/faq/product/browser_support</code> | 1 | 200 |
| <code>/en/All/faq/ios_bluetooth</code> | <code>/en/api-reference/faq/quality/ios_bluetooth</code> | 2 | 200 |
| <code>/en/api_reference</code> | <code>/en/api-reference</code> | 15 | 200 |
| <code>/en/broadcast-streaming/core-functionality/join-multiple-channels</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels</code> | 1 | 200 |
| <code>/en/cloud-recording/develop/composite-mode/</code> | <code>/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode</code> | 1 | 200 |
| <code>/en/cloud-recording/develop/individual-mode/</code> | <code>/en/realtime-media/cloud-recording/build/start-a-recording/individual-mode</code> | 1 | 200 |
| <code>/en/cloud-recording/develop/recording-video-profile</code> | <code>/en/realtime-media/cloud-recording/build/customize-the-recording/recording-video-profile</code> | 1 | 200 |
| <code>/en/cloud-recording/reference/restful-authentication</code> | <code>/en/realtime-media/cloud-recording/reference/restful-authentication</code> | 3 | 200 |
| <code>/en/extensions-marketplace/develop/integrate/voicemod</code> | <code>/en/realtime-media/marketplace/build/add-audio-effects/voicemod</code> | 2 | 200 |
| <code>/en/faq/api_download</code> | <code>/en/api-reference/faq/other/api_download</code> | 4 | 200 |
| <code>/en/faq/audio_format</code> | <code>/en/api-reference/faq/product/audio_format</code> | 2 | 200 |
| <code>/en/faq/billing_account</code> | <code>/en/api-reference/faq/account/billing_account</code> | 2 | 200 |
| <code>/en/faq/billing_free</code> | <code>/en/api-reference/faq/account/billing_free</code> | 1 | 200 |
| <code>/en/faq/browser_support</code> | <code>/en/api-reference/faq/product/browser_support</code> | 2 | 200 |
| <code>/en/faq/echo</code> | <code>/en/api-reference/faq/quality/echo</code> | 2 | 200 |
| <code>/en/faq/record_split</code> | <code>/en/api-reference/faq/quality/record_split</code> | 1 | 200 |
| <code>/en/faq/return-404</code> | <code>/en/api-reference/faq/integration/return_404</code> | 3 | 200 |
| <code>/en/faq/switch_screen_camera_web</code> | <code>/en/api-reference/faq/integration/switch_screen_camera_web</code> | 2 | 200 |
| <code>/en/faq/unity_crash</code> | <code>/en/api-reference/faq/integration/unity_crash</code> | 2 | 200 |
| <code>/en/faq/video_blank</code> | <code>/en/api-reference/faq/quality/video_blank</code> | 3 | 200 |
| <code>/en/faq/web_camera_light</code> | <code>/en/api-reference/faq/integration/web_camera_light</code> | 1 | 200 |
| <code>/en/faqs/capacity</code> | <code>/en/api-reference/faq/product/capacity</code> | 1 | 200 |
| <code>/en/flexible-classroom/overview/pricing</code> | <code>/en/realtime-media/flexible-classroom/reference/pricing</code> | 2 | 200 |
| <code>/en/flexible-classroom/overview/technical-architecture</code> | <code>/en/realtime-media/flexible-classroom/reference/technical-architecture</code> | 2 | 200 |
| <code>/en/help/account-and-billing/billing_free</code> | <code>/en/api-reference/faq/account/billing_free</code> | 1 | 200 |
| <code>/en/help/integration-issues/channel</code> | <code>/en/api-reference/faq/integration/channel</code> | 1 | 200 |
| <code>/en/help/integration-issues/kick_user</code> | <code>/en/api-reference/faq/integration/kick_user</code> | 2 | 200 |
| <code>/en/help/integration-issues/reconnection</code> | <code>/en/api-reference/faq/integration/reconnection</code> | 1 | 200 |
| <code>/en/help/integration-issues/set_log_file</code> | <code>/en/api-reference/faq/integration/set_log_file</code> | 1 | 200 |
| <code>/en/help/integration-issues/unity_crash</code> | <code>/en/api-reference/faq/integration/unity_crash</code> | 1 | 200 |
| <code>/en/help/quality-issues/android_background</code> | <code>/en/api-reference/faq/quality/android_background</code> | 1 | 200 |
| <code>/en/help/quality-issues/audio_freeze</code> | <code>/en/api-reference/faq/quality/audio_freeze</code> | 2 | 200 |
| <code>/en/help/quality-issues/audio_noise</code> | <code>/en/api-reference/faq/quality/audio_noise</code> | 2 | 200 |
| <code>/en/help/quality-issues/video_blur</code> | <code>/en/api-reference/faq/quality/video_blur</code> | 2 | 200 |
| <code>/en/interactive-whiteboard/develop/file-conversion-overview</code> | <code>/en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview</code> | 1 | 200 |
| <code>/en/interactive-whiteboard/get-started/enable-whiteboard</code> | <code>/en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/enable-whiteboard</code> | 1 | 200 |
| <code>/en/interactive-whiteboard/overview/pricing</code> | <code>/en/realtime-media/whiteboard/reference/pricing</code> | 3 | 200 |
| <code>/en/interactive-whiteboard/reference/pricing</code> | <code>/en/realtime-media/whiteboard/reference/pricing</code> | 1 | 200 |
| <code>/en/on-premise-recording/reference/release-notes</code> | <code>/en/realtime-media/on-premise-recording/reference/release-notes</code> | 2 | 200 |
| <code>/en/Real-time-Messaging/downloads</code> | <code>/en/realtime-media/rtm/reference/downloads</code> | 1 | 200 |
| <code>/en/signaling/best-practices/message-payload-structuring</code> | <code>/en/realtime-media/rtm/build/send-and-receive-messages/message-payload-structuring</code> | 1 | 200 |
| <code>/en/signaling/get-started/migration-guide</code> | <code>/en/realtime-media/rtm/reference/migration-guide</code> | 1 | 200 |
| <code>/en/signaling/reference/pricing</code> | <code>/en/realtime-media/rtm/reference/pricing</code> | 1 | 200 |
| <code>/en/signaling/reference/release-notes</code> | <code>/en/realtime-media/rtm/reference/release-notes</code> | 1 | 200 |
| <code>/en/video-calling/develop/authentication-workflow</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> | 6 | 200 |
| <code>/en/video-calling/develop/media-stream-encryption</code> | <code>/en/realtime-media/rtc/build/secure-and-protect-channels/media-stream-encryption</code> | 1 | 200 |
| <code>/en/video-calling/get-started-sdk</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> | 1 | 200 |
| <code>/en/video-calling/reference/channel-management-api/</code> | <code>/en/realtime-media/rtc/reference/channel-management-api</code> | 1 | 200 |
| <code>/en/video-calling/reference/manage-agora-account</code> | <code>/en/introduction/account</code> | 1 | 200 |
| <code>/en/voice-calling/reference/supported-platforms</code> | <code>/en/realtime-media/rtc/reference/supported-platforms</code> | 2 | 200 |

## 已有规则但本次仍观测到 404 的源路径

这些路径没有重复写入新源文件；需要随本次部署验证生成产物和线上规则是否生效。

| 404 源路径 | 现有目标 | 历史事件次数 | 目标状态 |
| --- | --- | ---: | ---: |
| <code>/en/video-calling/reference/supported-platforms</code> | <code>/en/realtime-media/rtc/reference/supported-platforms</code> | 3 |  |
| <code>/en/Agora Platform/get_appid_token</code> | <code>/en/introduction/account#generate-temporary-tokens</code> | 2 |  |
| <code>/en/on-premise-recording/develop/individual-mode/</code> | <code>/en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode</code> | 2 |  |
| <code>/en/on-premise-recording/develop/composite-mode/</code> | <code>/en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode</code> | 1 |  |
| <code>/en/video-calling/overview/migration-guide</code> | <code>/en/realtime-media/rtc/reference/migration-guide</code> | 1 |  |

## 排除的候选

- /en/realtime-media/iot/build/stream-and-optimize-media/ensure-channel-quality → /en/realtime-media/iot/build/stream-and-optimize-media/ensure-channel-quality：候选目标返回 HTTP 404，未加入规则。

## Unresolved

未安全确定目标的路径未添加重定向，完整列表见 [2026-10-08-404-unresolved-paths.txt](./2026-10-08-404-unresolved-paths.txt)。分类统计：

- unresolved：633 条
- already-covered：5 条
- inventory-exact：1 条

事件次数最多的 unresolved 路径：

| 路径 | 历史事件次数 | 原因 |
| --- | ---: | --- |
| <code>/en/quick_start/start_with_audio_calling</code> | 17 | No compatible current route was found. |
| <code>/en/sdk-downloads/download-sdk</code> | 15 | No compatible current route was found. |
| <code>/en/quick_start/start_with_video_calling</code> | 14 | No compatible current route was found. |
| <code>/en/sdk_downloads/download_sdk</code> | 14 | No compatible current route was found. |
| <code>/en/Agora Analytics/aa_api</code> | 5 | No compatible current route was found. |
| <code>/en/All/downloads</code> | 5 | The leaf slug maps to multiple current routes. |
| <code>/en/Interactive Broadcast/API Reference/cpp/namespaceagora.html</code> | 5 | No compatible current route was found. |
| <code>/en/Interactive Broadcast/API Reference/oc/Classes/[AgoraRtcChannel muteRemoteVideoStream:mute:]</code> | 5 | No compatible current route was found. |
| <code>/en/Interactive Broadcast/API Reference/unity/classagora__gaming__rtc_1_1_i_rtc_engine.html</code> | 5 | No compatible current route was found. |
| <code>/en/Interactive Broadcast/billing_rtc</code> | 5 | No compatible current route was found. |
| <code>/en/Real-time-Messaging/API Reference/RTM_oc/Blocks/[AgoraRtmJoinChannelErrorCode]</code> | 5 | No compatible current route was found. |
| <code>/en/Real-time-Messaging/API Reference/RTM_oc/Blocks/[AgoraRtmLeaveChannelErrorCode]</code> | 5 | No compatible current route was found. |
| <code>/en/Real-time-Messaging/faq/audience_event</code> | 5 | No compatible current route was found. |
| <code>/en/Real-time-Messaging/messaging_android</code> | 5 | No compatible current route was found. |
| <code>/en/Video/API Reference/oc/v2.3.2/Protocols/[AgoraVideoSourceProtocol]</code> | 5 | No compatible current route was found. |
| <code>/en/Video/API Reference/oc/v2.4.1/Protocols/[AgoraVideoSourceProtocol]</code> | 5 | No compatible current route was found. |
| <code>/en/Video/API Reference/oc/v2.4.1/docs/headers/[AgoraMediaMetadataDelegate receiveMetadata:fromUser:atTimestamp: ]</code> | 5 | No compatible current route was found. |
| <code>/en/Video/release_web_video</code> | 5 | No compatible current route was found. |
| <code>/en/cloud-recording/cloud_recording_rest</code> | 5 | No compatible current route was found. |
| <code>/en/live-streaming/product_live_standard</code> | 5 | No compatible current route was found. |

判定标准：只添加可由当前文档 inventory/既有审核证据确定、且目标线上返回 HTTP 200 的路径；不把未知路径批量指向首页或产品 overview。

## Follow-up: batch 1 (2026-10-19)

Mapped 29 paths from the unresolved list: current-site paths (`/en/realtime-media/`, `/en/ai/`, `/en/conversational-ai/`, `/en/api-reference/`) and the four highest-traffic legacy quickstart and SDK download paths. Rules are appended to `src/lib/legacy-sitemap/posthog-revalidated-404s.json`. Each source was re-checked as HTTP 404 and each target as HTTP 200 on production on 2026-10-19. The unresolved list now has 604 paths.

| 404 source path | Target |
| --- | --- |
| <code>/en/quick_start/start_with_audio_calling</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |
| <code>/en/quick_start/start_with_video_calling</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |
| <code>/en/sdk-downloads/download-sdk</code> | <code>/en/api-reference/sdks</code> |
| <code>/en/sdk_downloads/download_sdk</code> | <code>/en/api-reference/sdks</code> |
| <code>/en/realtime-media/media-push/build/restful-api</code> | <code>/en/api-reference/api-ref/media-push</code> |
| <code>/en/realtime-media/get-started-sdk</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |
| <code>/en/realtime-media/rtc/build/control-audio-and-devices/custom-audio</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/custom-audio</code> |
| <code>/en/api-reference/rtmp-gateway</code> | <code>/en/api-reference/api-ref/rtmp-gateway</code> |
| <code>/en/conversational-ai/develop/subtitles</code> | <code>/en/ai/build/transcripts</code> |
| <code>/en/conversational-ai/rest-api/join</code> | <code>/en/api-reference/api-ref/conversational-ai/join</code> |
| <code>/en/realtime-media/cloud-recording/reference/rest-api-overview</code> | <code>/en/api-reference/api-ref/cloud-recording</code> |
| <code>/en/realtime-media/media-pull/reference/restful-api</code> | <code>/en/api-reference/api-ref/media-pull</code> |
| <code>/en/ai/choose-your-path/quickstart-coding</code> | <code>/en/ai/get-started/quickstart</code> |
| <code>/en/ai/domain-overview</code> | <code>/en/ai</code> |
| <code>/en/api-reference/api-ref-rtc/channel-management-rest-api</code> | <code>/en/realtime-media/rtc/reference/channel-management-api</code> |
| <code>/en/conversational-ai/get-started/manage-agora-account</code> | <code>/en/introduction/account</code> |
| <code>/en/realtime-media/iot/quickstart/linux-c</code> | <code>/en/realtime-media/iot/quickstart</code> |
| <code>/en/realtime-media/rtc/build/control-audio-and-devices/audio-strength-stream-selection.md</code> | <code>/en/realtime-media/rtc/build/optimize-and-operate/audio-strength-stream-selection.md</code> |
| <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels/electron.md</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels.md</code> |
| <code>/en/realtime-media/rtc/build/process-raw-and-custom-media/app-size-optimization</code> | <code>/en/realtime-media/rtc/build/optimize-and-operate/app-size-optimization</code> |
| <code>/en/realtime-media/rtc/interactive-live-streaming/</code> | <code>/en/realtime-media/rtc</code> |
| <code>/en/realtime-media/rtc/overview/product-overview</code> | <code>/en/realtime-media/rtc</code> |
| <code>/en/realtime-media/rtc/reference/channel-management-api/restful-authentication</code> | <code>/en/api-reference/api-ref/rtc/authentication</code> |
| <code>/en/realtime-media/rtc/reference/channel-management-rest-api</code> | <code>/en/realtime-media/rtc/reference/channel-management-api</code> |
| <code>/en/realtime-media/rtc/token-authentication/overview</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> |
| <code>/en/realtime-media/signaling/reference/release-notes</code> | <code>/en/realtime-media/rtm/reference/release-notes</code> |
| <code>/en/realtime-media/whiteboard/build/authenticate-users/enable-whiteboard</code> | <code>/en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/enable-whiteboard</code> |
| <code>/en/realtime-media/whiteboard/reference/whiteboard-api/screenshots</code> | <code>/en/api-reference/api-ref/whiteboard/screenshots</code> |
| <code>/en/ai/best-practices</code> | <code>/en/ai/best-practices/audio-setup</code> |

Left unresolved in this batch:

- `/en/realtime-media/cloud-proxy/reference/pricing`: Cloud Proxy pricing only appears on the legacy RTC pricing page, which would mislead readers on current plans.
- `/en/conversational-ai/models/tts/groq`: no Groq TTS page has ever existed.
- `/en/api-reference/rtc/android/class-and-enum/classes/class-channelmediaoptions` and `/en/api-reference/whiteboard/web`: client SDK API reference paths, deferred to the API reference batch.
- Malformed paths that are not real links: unfilled `{{Global.API_REF_*}}` placeholders, `/en/api-reference/faq/integration│200`, `/en/realtime-media/rtc/referenc=`, `/en/realtime-media/rtc/reference/releas=`, and `/en/realtime-media/media-pull/reference/pricing.`. The placeholders no longer appear in `content/docs/en`.

Batch 1 correction (2026-10-19): the Media Push, Media Pull, and Cloud Recording REST rules above originally targeted stub pages that are not in the sidebar and only point to the API reference. They now target the API reference directly.

## Follow-up: batch 2 (2026-10-19)

Mapped 139 paths from the old docs site's lowercase URL structure: old product folders (`/en/cloud-recording/`, `/en/video-calling/`, `/en/signaling/`, `/en/whiteboard/`), versioned SDK folders (`/en/3.x/`, `/en/live-streaming-premium-4.x/`, `*-legacy`), and old FAQ and help categories. Rules are appended to `src/lib/legacy-sitemap/posthog-revalidated-404s.json`. Each target was verified as HTTP 200 on a local dev server on 2026-10-19. Each source was rechecked as HTTP 404 on production on 2026-10-19. The unresolved list now has 461 paths.

Rows marked *closest match* have no exact current equivalent.

| 404 source path | Target | Note |
| --- | --- | --- |
| <code>/en/cloud-recording</code> | <code>/en/realtime-media/cloud-recording</code> |  |
| <code>/en/cloud-recording/product_cloud_recording</code> | <code>/en/realtime-media/cloud-recording</code> |  |
| <code>/en/cloud-recording/cloud_recording_rest</code> | <code>/en/api-reference/api-ref/cloud-recording</code> |  |
| <code>/en/cloud-recording/cloud_recording_api_rest</code> | <code>/en/api-reference/api-ref/cloud-recording</code> |  |
| <code>/en/cloud-recording/cloud_recording_api_start</code> | <code>/en/api-reference/api-ref/cloud-recording/start</code> |  |
| <code>/en/cloud-recording/reference/rest-api/query</code> | <code>/en/api-reference/api-ref/cloud-recording/query</code> |  |
| <code>/en/cloud-recording/cloud_recording_convert_format</code> | <code>/en/realtime-media/cloud-recording/build/process-recorded-files/convert-format</code> |  |
| <code>/en/cloud-recording/billing_cloud_recording</code> | <code>/en/realtime-media/cloud-recording/reference/pricing</code> |  |
| <code>/en/cloud-recording/cloud_recording_composite_mode</code> | <code>/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode</code> |  |
| <code>/en/cloud-recording/cloud_recording_webpage_mode</code> | <code>/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode</code> |  |
| <code>/en/cloud-recording/cloud_recording_layout</code> | <code>/en/realtime-media/cloud-recording/build/customize-the-recording/layout</code> |  |
| <code>/en/cloud-recording/cloud_recording_screen_capture</code> | <code>/en/realtime-media/cloud-recording/build/start-a-recording/screen-capture</code> |  |
| <code>/en/cloud-recording/cloud_recording_subscription</code> | <code>/en/realtime-media/cloud-recording/build/customize-the-recording/subscription</code> |  |
| <code>/en/cloud-recording/reference/message-notification-service</code> | <code>/en/realtime-media/cloud-recording/build/handle-events/receive-notifications</code> |  |
| <code>/en/cloud-recording/faq</code> | <code>/en/api-reference/faq/integration/recording_faq</code> |  |
| <code>/en/cloud-recording/get-started/enable-service</code> | <code>/en/realtime-media/cloud-recording/rest-quickstart</code> | closest match |
| <code>/en/cloud-recording/get-started/enable-service.md</code> | <code>/en/realtime-media/cloud-recording/rest-quickstart.md</code> | closest match |
| <code>/en/on-premise-recording/get-started/record-cmd</code> | <code>/en/realtime-media/on-premise-recording/quickstart</code> |  |
| <code>/en/voice-calling/get-started/authentication-workflow</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> |  |
| <code>/en/broadcast-streaming/get-started/authentication-workflow</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> |  |
| <code>/en/interactive-live-streaming/get-started/authentication-workflow</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> |  |
| <code>/en/live-streaming-4.x-beta/token_server_android_ng</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/3.x/voice-calling/reference/error-codes</code> | <code>/en/realtime-media/rtc/reference/error-codes</code> |  |
| <code>/en/3.x/voice-calling/introduction/pricing</code> | <code>/en/realtime-media/rtc/reference/pricing</code> |  |
| <code>/en/voice-call-4.x-beta/billing_rtc_ng</code> | <code>/en/realtime-media/rtc/reference/pricing</code> |  |
| <code>/en/3.x/voice-calling/introduction/release-notes</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/video-call-4.x-beta/release_flutter_ng</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/3.x/interactive-live-streaming/reference/security</code> | <code>/en/realtime-media/rtc/reference/security</code> |  |
| <code>/en/live-streaming-premium-4.x/migration_guide_windows_ng</code> | <code>/en/realtime-media/rtc/reference/migration-guide</code> |  |
| <code>/en/live-streaming-premium-4.x/migration_guide_mac_ng</code> | <code>/en/realtime-media/rtc/reference/migration-guide</code> |  |
| <code>/en/broadcast-streaming/reference/agora-console-rest-api</code> | <code>/en/realtime-media/rtc/reference/console-overview</code> |  |
| <code>/en/3.x/video-calling/reference/manage-agora-account</code> | <code>/en/introduction/account</code> |  |
| <code>/en/live-streaming-premium-legacy/rtc_sunset</code> | <code>/en/introduction/billing/billing-policies</code> | closest match |
| <code>/en/3.x/interactive-live-streaming/introduction/product-overview</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/rtc/overview/product-overview</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/interactive-live-streaming/overview</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/live-streaming/product_live_standard</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/live-streaming-premium-4.x/product_live_ng</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/video-call-4.x-beta/product_video_ng</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/voice-call-4.x-beta/landing-page</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/live-streaming-premium-4.x-beta/landing-page</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/3.x/video-calling/quickstart-guide/get-started-sdk</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/interactive-live-streaming/get-started-sdk</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/sdks/realtime-communication/get-started/get-started-sdk</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/solutions/interactive-live-streaming/quickstart</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/live-streaming-premium-4.x/start_live_mac_ng</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/live-streaming-premium-4.x/start_live_windows_ng</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/video-call-4.x/start_call_mac_ng</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/live-streaming/start_live_standard_audio_android</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/3.x/interactive-live-streaming/introduction/downloads-more-video</code> | <code>/en/api-reference/sdks</code> |  |
| <code>/en/2.1.1/download</code> | <code>/en/api-reference/sdks</code> |  |
| <code>/en/video-calling/client-sdk/linux/download</code> | <code>/en/realtime-media/rtc-server-sdk/reference/downloads</code> | closest match |
| <code>/en/3.x/server-gateway/develop/cloud-proxy</code> | <code>/en/realtime-media/rtc-server-sdk</code> | closest match |
| <code>/en/live-streaming-premium-4.x/screensharing_web_ng</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/live-streaming-premium-4.x/screensharing_android_ng</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/video-legacy/screensharing_web</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/voice-legacy/screensharing_web</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/3.x/interactive-live-streaming/basic-features/screensharing</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/interactive-live-streaming/start-screen-share/start-screen-share-android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/video-call-4.x/screen-share-android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/live-streaming-premium-4.x/in-call_quality_web_ng</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/live-streaming-standard-4.x/in-call_quality_apple_ng</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/live-streaming-standard-4.x-beta/in-call_quality_android_ng</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/3.x/interactive-live-streaming/advanced-features/in-call-quality</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/3.x/interactive-live-streaming/basic-features/lastmile-quality</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> |  |
| <code>/en/3.x/voice-calling/basic-features/lastmile-quality</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> |  |
| <code>/en/video-calling/develop/ensure-channel-quality</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> | closest match |
| <code>/en/live-streaming-premium-legacy/test_switch_device_web</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> | closest match |
| <code>/en/video-legacy/channel_connection_android</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/connection-status-management</code> |  |
| <code>/en/live-streaming-premium-4.x/media_relay_web_ng</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/cross-channel-media-relay</code> |  |
| <code>/en/video-call-4.x-beta/multiple_channel_apple_ng</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels</code> |  |
| <code>/en/broadcast-streaming/develop/live-streaming-over-multiple-channels</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels</code> | closest match |
| <code>/en/live-streaming-4.x-beta/video_profile_android_ng</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/configure-video-encoding</code> |  |
| <code>/en/live-streaming-4.x-beta/video_profile_apple_ng</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/configure-video-encoding</code> |  |
| <code>/en/live-streaming-4.x-beta/audio_profile_android_ng</code> | <code>/en/realtime-media/rtc/build/control-audio-and-devices/configure-audio-encoding</code> |  |
| <code>/en/live-streaming-4.x-beta/audio_route_ng</code> | <code>/en/realtime-media/rtc/build/control-audio-and-devices/set-audio-route</code> |  |
| <code>/en/live-streaming-premium-4.x/custom_audio_web_ng</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/custom-audio</code> |  |
| <code>/en/live-streaming-premium-4.x-beta/custom_video_source_apple_ng</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/custom-video</code> |  |
| <code>/en/video-calling/develop/custom-video-and-audio</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/custom-video</code> | closest match |
| <code>/en/3.x/video-calling/advanced-features/raw-audio-data</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/stream-raw-audio</code> |  |
| <code>/en/3.x/video-calling/best-practices/speed-up-rendering-video</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/optimize-frame-rendering</code> |  |
| <code>/en/3.x/voice-calling/advanced-features/audio-effect-mixing</code> | <code>/en/realtime-media/rtc/build/enhance-the-audio-experience/audio-mixing-and-sound-effects</code> |  |
| <code>/en/live-streaming-4.x-beta/voice_changer_android_ng</code> | <code>/en/realtime-media/rtc/build/enhance-the-audio-experience/voice-effects</code> |  |
| <code>/en/3.x/interactive-live-streaming/advanced-features/voice-changer</code> | <code>/en/realtime-media/rtc/build/enhance-the-audio-experience/voice-effects</code> |  |
| <code>/en/3.x/interactive-live-streaming/advanced-features/media-push</code> | <code>/en/realtime-media/media-push</code> |  |
| <code>/en/live-streaming-4.x-beta/cdn_streaming_android_ng</code> | <code>/en/realtime-media/media-push</code> |  |
| <code>/en/live-streaming-premium-4.x/inject_stream_web_ng</code> | <code>/en/realtime-media/media-pull</code> |  |
| <code>/en/media-push/reference/pricing</code> | <code>/en/realtime-media/media-push/reference/pricing</code> |  |
| <code>/en/video-calling/channel-management-api/endpoint/ban-user-privileges/create-a-banning-rule</code> | <code>/en/api-reference/api-ref/rtc/create-ban-rule</code> |  |
| <code>/en/video-calling/channel-management-api/endpoint/query-user-list</code> | <code>/en/api-reference/api-ref/rtc/query-user-list</code> |  |
| <code>/en/video-calling/reference/rest-api/channel-management</code> | <code>/en/realtime-media/rtc/reference/channel-management-api</code> |  |
| <code>/en/video-calling/reference/restful-api/endpoints</code> | <code>/en/api-reference/api-ref/rtc</code> |  |
| <code>/en/faq/restful_authentication</code> | <code>/en/api-reference/api-ref/rtc/authentication</code> | closest match |
| <code>/en/signaling/restful-api/restful-authentication</code> | <code>/en/api-reference/api-ref/signaling/authentication</code> |  |
| <code>/en/signaling/reference/restful-authentication</code> | <code>/en/api-reference/api-ref/signaling/authentication</code> |  |
| <code>/en/signaling/develop/call-invitation</code> | <code>/en/realtime-media/rtm/reference/migration-guide</code> |  |
| <code>/en/signaling/get-started/sdk</code> | <code>/en/realtime-media/rtm/quickstart</code> |  |
| <code>/en/signaling/start_signaling_web</code> | <code>/en/realtime-media/rtm/quickstart</code> |  |
| <code>/en/1.x/signaling/reference/pricing</code> | <code>/en/realtime-media/rtm/reference/pricing</code> |  |
| <code>/en/agora-chat/agora_chat_overview</code> | <code>/en/realtime-media/im</code> |  |
| <code>/en/agora-chat/landing-page</code> | <code>/en/realtime-media/im</code> |  |
| <code>/en/agora-chat/agora_chat_manage_message_ios</code> | <code>/en/realtime-media/im/build/build-core-messaging/messages/manage-messages</code> |  |
| <code>/en/agora-class/agora_class_quickstart_android</code> | <code>/en/realtime-media/flexible-classroom/quickstart</code> |  |
| <code>/en/agora-class/agora_class_custom_ui_web</code> | <code>/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom</code> |  |
| <code>/en/flexible-classroom/develop/customize-ui</code> | <code>/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-classroom</code> |  |
| <code>/en/flexible-classroom/client-api/web/classroom-sdk</code> | <code>/en/api-reference/api-ref/flexible-classroom/classroom-sdk</code> |  |
| <code>/en/flexible-classroom/client-api/education-sdk/web/launch</code> | <code>/en/api-reference/api-ref/flexible-classroom/classroom-sdk</code> | closest match |
| <code>/en/whiteboard/generate_whiteboard_token_at_app_server</code> | <code>/en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server</code> |  |
| <code>/en/whiteboard/generate_whiteboard_token</code> | <code>/en/realtime-media/whiteboard/build/authenticate-users/authentication-workflow</code> | closest match |
| <code>/en/whiteboard/present_files_android</code> | <code>/en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-white</code> |  |
| <code>/en/whiteboard/reference/room</code> | <code>/en/api-reference/api-ref/whiteboard/room-management</code> |  |
| <code>/en/whiteboard/billing_whiteboard</code> | <code>/en/realtime-media/whiteboard/reference/pricing</code> |  |
| <code>/en/interactive-whiteboard/reference/whiteboard-api/room-management</code> | <code>/en/api-reference/api-ref/whiteboard/room-management</code> |  |
| <code>/en/interactive-whiteboard/reference/whiteboard-api/scene-management</code> | <code>/en/api-reference/api-ref/whiteboard/scene-management</code> |  |
| <code>/en/interactive-whiteboard/overview/release-notes_web</code> | <code>/en/realtime-media/whiteboard/reference/release-notes</code> |  |
| <code>/en/extension_customer/use_extension_mac</code> | <code>/en/realtime-media/marketplace/quickstart-integrate</code> |  |
| <code>/en/extension_customer/use_extension_windows</code> | <code>/en/realtime-media/marketplace/quickstart-integrate</code> |  |
| <code>/en/extension_vendor/vendor_join</code> | <code>/en/realtime-media/marketplace/build/publish-and-document/publish-extension</code> | closest match |
| <code>/en/record-captions</code> | <code>/en/realtime-media/speech-to-text/build/process-transcription-data/record-captions</code> |  |
| <code>/en/ten-framework/</code> | <code>/en/ai/ten-agent/framework-overview</code> |  |
| <code>/en/faq</code> | <code>/en/api-reference/faq</code> |  |
| <code>/en/help/</code> | <code>/en/api-reference/faq</code> |  |
| <code>/en/help/general/general_faq</code> | <code>/en/api-reference/faq</code> |  |
| <code>/en/live-streaming-premium-legacy/faq</code> | <code>/en/api-reference/faq</code> |  |
| <code>/en/help/integration-issues</code> | <code>/en/api-reference/faq/integration</code> |  |
| <code>/en/help/account-and-billing</code> | <code>/en/api-reference/faq/account</code> |  |
| <code>/en/help/other-issues</code> | <code>/en/api-reference/faq/other</code> |  |
| <code>/en/help/quality-issues</code> | <code>/en/api-reference/faq/quality</code> |  |
| <code>/en/help/general-product-inquiry</code> | <code>/en/api-reference/faq/product</code> |  |
| <code>/en/faq/logfile</code> | <code>/en/api-reference/faq/integration/set_log_file</code> |  |
| <code>/en/faqs/logfile</code> | <code>/en/api-reference/faq/integration/set_log_file</code> |  |
| <code>/en/faqs/token_error</code> | <code>/en/api-reference/faq/integration/token_related_issues</code> |  |
| <code>/en/faqs/token_usage_generation_description</code> | <code>/en/api-reference/faq/integration/token_related_issues</code> | closest match |
| <code>/en/help/integration-issues/rtc_token_expiration</code> | <code>/en/api-reference/faq/integration/token_related_issues</code> | closest match |
| <code>/en/video/faq/video_blank</code> | <code>/en/api-reference/faq/quality/video_blank</code> |  |
| <code>/en/voice-legacy/faq/billing_basis</code> | <code>/en/api-reference/faq/account/billing_basis</code> |  |
| <code>/en/2.3/faq/faq/security</code> | <code>/en/introduction/security-privacy</code> | closest match |
| <code>/en/pricing</code> | <code>/en/introduction/billing</code> | closest match |
| <code>/en/live-streaming/support@agora.io</code> | <code>/en/introduction/support</code> | closest match |

Left unresolved in this batch:

- SDK docs from versions 1.x to 2.x, such as `/en/2.1.2/...`, `/en/1.14/...`, and `/en/2.3.1/...`, including `/en/2.2.2/product/Interactive+Broadcast/Agora+Platform/firewall`. The `+` in that path is a pattern character in `vercel.json`, so a literal rule breaks once it overflows from the bulk redirect file.
- Pages with no current equivalent: the RTC UIKit quickstarts, `/en/3.x/voice-calling/reference/upgrade-token`, `/en/cloud-recording/faq/call_invite_notification`, `/en/extensions-marketplace/develop/integrate/symbl_ai`, `/en/remote-control/downloads`, `/en/real-time-optimization/landing`, `/en/faq/web_on_mobile`, and `/en/faqs/switchdevice_web`.
- Unknown purpose: `/en/search-new` and `/en/faq/sdk_behavior`.
- `/en/realtime-communication/llms-index.txt`: excluded by decision.

Also mapped in this batch: `/en/llms.txt`, `/en/llm.txt`, `/en/sitemap.xml`, and `/en/sitemap.ml` are requests for root-level discovery files under `/en/`. They redirect to `/llms.txt` and `/sitemap.xml` through plain redirects in `vercel.base.json`, because their targets are files in `public/`, not docs routes.

## Follow-up: batch 3, API reference patterns (2026-10-19)

Mapped 263 legacy API reference paths with 18 regex redirect routes in the `routes` array of `vercel.base.json`. These paths contain spaces, `+`, double-encoded `%2520`, brackets, and colons, which the exact-match PostHog rules and the path-pattern `redirects` in `vercel.json` cannot hold safely. Each regex accepts `%20`, `+`, and `%2520` as the separator in `API Reference`. The old 2.x and 3.x symbols mostly no longer exist, so each platform's references land on that platform's current API reference overview. The unresolved list now has 198 paths.

| Old platform segment | Target |
| --- | --- |
| `API Reference/oc` | <code>https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit</code> |
| `API Reference/java` | <code>https://api-ref.agora.io/en/video-sdk/android/4.x/API/rtc_api_overview.html</code> |
| `API Reference/cpp` | <code>https://api-ref.agora.io/en/video-sdk/cpp/4.x/API/rtc_api_overview.html</code> |
| `API Reference/web`, `web_ng` | <code>https://api-ref.agora.io/en/video-sdk/web/4.x/index.html</code> |
| `API Reference/flutter`, `flutter_ng` | <code>https://api-ref.agora.io/en/video-sdk/flutter/6.x/API/rtc_api_overview.html</code> |
| `API Reference/react_native` | <code>https://api-ref.agora.io/en/video-sdk/react-native/4.x/API/rtc_api_overview.html</code> |
| `API Reference/unity` | <code>https://api-ref.agora.io/en/video-sdk/unity/4.x/API/rtc_api_overview.html</code> |
| `API Reference/electron`, `electron_ng` | <code>https://api-ref.agora.io/en/video-sdk/electron/4.x/API/rtc_api_overview.html</code> |
| `API Reference/RTM_oc` | <code>/en/api-reference/api-ref/signaling/ios</code> |
| `API Reference/RTM_java` | <code>/en/api-reference/api-ref/signaling/android</code> |
| `API Reference/RTM_java_linux` | <code>/en/api-reference/api-ref/signaling/linux-java</code> |
| `API Reference/RTM_web` | <code>/en/api-reference/api-ref/signaling/web</code> |
| `API Reference/recording_cpp`, `recording_java` | <code>/en/api-reference/api-ref/on-premise-recording</code> |
| `API Reference/whiteboard_oc` | <code>https://api-ref.agora.io/en/interactive-whiteboard-sdk/ios/2.x/index.html</code> |
| `API Reference/edu_context_swift` | <code>/en/api-reference/api-ref/flexible-classroom/edu-context-sdk</code> |
| `/en/All/api-ref`, `/en/Agora Platform/api-ref`, `/en/live-streaming/api-ref` | <code>/en/api-reference</code> |
| `/en/api-reference/whiteboard/web` | <code>https://api-ref.agora.io/en/interactive-whiteboard-sdk/web/2.x/index.html</code> |
| `/en/api-reference/rtc/android/class-and-enum/classes/class-channelmediaoptions` | <code>https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_channelmediaoptions.html</code> |

Decisions: platform-level API reference overviews are accepted targets for legacy symbol pages. All RTC references, including Voice and Audio Broadcast, go to the Video SDK reference, a superset of the Voice SDK reference. Obj-C references go to iOS, not macOS.

Verification: every target returned HTTP 200 on 2026-10-19, and a simulation matched 263 unresolved paths in both raw and `encodeURI` form with no current docs route matched. How Vercel matches encoded paths against `routes` still needs a check on a PR preview deployment before merge.

Left unresolved: 1.x and 2.x `user_guide` and `/en/2.x/product/.../API Reference/<page>` paths without a platform segment, `cocos_creator`, `/en/Real-time-Messaging/index.html`, and malformed paths.

## Follow-up: batch 3, old-site guide pages (2026-10-19)

Mapped 145 guide pages from the oldest docs site, which used product names with spaces in the path, such as `/en/Interactive Broadcast/` and `/en/Video/`. 138 rules are appended to `src/lib/legacy-sitemap/posthog-revalidated-404s.json`. Seven sources contain `+` or `%2520`, which break a literal rule once it overflows from the bulk redirect file into `vercel.json`, so they are exact-match regex routes in `vercel.base.json` instead. Each source was rechecked as HTTP 404 and each target as HTTP 200 on production on 2026-10-19. The unresolved list now has 53 paths.

Rows marked *closest match* have no exact current equivalent. Rows marked *route* are in `vercel.base.json`.

| 404 source path | Target | Note |
| --- | --- | --- |
| <code>/en/Agora Analytics/aa_api</code> | <code>/en/api-reference/api-ref/agora-analytics/analytics-rest-api</code> |  |
| <code>/en/Agora Analytics/aa_billing</code> | <code>/en/realtime-media/agora-analytics/reference/pricing</code> |  |
| <code>/en/Agora Analytics/aa_guide</code> | <code>/en/realtime-media/agora-analytics/product-overview</code> |  |
| <code>/en/Agora Platform/aa_guide</code> | <code>/en/realtime-media/agora-analytics/product-overview</code> |  |
| <code>/en/All/downloads</code> | <code>/en/api-reference/sdks</code> |  |
| <code>/en/Interactive Broadcast/downloads</code> | <code>/en/api-reference/sdks</code> |  |
| <code>/en/Interactive Gaming/downloads</code> | <code>/en/api-reference/sdks</code> |  |
| <code>/en/Recording/downloads</code> | <code>/en/api-reference/sdks</code> | closest match |
| <code>/en/Interactive Broadcast/billing_rtc</code> | <code>/en/realtime-media/rtc/reference/pricing</code> |  |
| <code>/en/InteractiveBroadcast/billing_rtc</code> | <code>/en/realtime-media/rtc/reference/pricing</code> |  |
| <code>/en/Interactive Broadcast/billing_interactive_broadcast</code> | <code>/en/realtime-media/rtc/reference/pricing</code> |  |
| <code>/en/Real-time-Messaging/faq/audience_event</code> | <code>/en/api-reference/faq/integration/audience_event</code> |  |
| <code>/en/Interactive Broadcast/faq/audience_event</code> | <code>/en/api-reference/faq/integration/audience_event</code> |  |
| <code>/en/Real-time-Messaging/messaging_android</code> | <code>/en/realtime-media/rtm/quickstart</code> |  |
| <code>/en/Real-time-Messaging/messaging_web</code> | <code>/en/realtime-media/rtm/quickstart</code> |  |
| <code>/en/Real-time-Messaging/release_ios_rtm</code> | <code>/en/realtime-media/rtm/reference/release-notes</code> |  |
| <code>/en/Real-time-Messaging/rtm_invite_android</code> | <code>/en/realtime-media/rtm/reference/migration-guide</code> | closest match |
| <code>/en/Real-time-Messaging/rtm_signaling_oc</code> | <code>/en/realtime-media/rtm/reference/migration-guide</code> | closest match |
| <code>/en/Video/release_web_video</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/Voice/release_web_video</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/Interactive Broadcast/release_android_video</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/Interactive Broadcast/release_windows_video</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/Interactive Broadcast/release_flutter_video</code> | <code>/en/realtime-media/rtc/reference/release-notes</code> |  |
| <code>/en/All/faq/restful_authentication</code> | <code>/en/api-reference/api-ref/rtc/authentication</code> | closest match |
| <code>/en/Video/faq/restful_authentication</code> | <code>/en/api-reference/api-ref/rtc/authentication</code> | closest match |
| <code>/en/Recording</code> | <code>/en/realtime-media/on-premise-recording</code> |  |
| <code>/en/Recording/product_recording</code> | <code>/en/realtime-media/on-premise-recording</code> |  |
| <code>/en/Recording/recording_composite_mode</code> | <code>/en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode</code> |  |
| <code>/en/Recording/recording_integrate_java</code> | <code>/en/realtime-media/on-premise-recording/quickstart</code> |  |
| <code>/en/Recording/recording_integrate_cpp</code> | <code>/en/realtime-media/on-premise-recording/quickstart</code> |  |
| <code>/en/Recording/billing_recording</code> | <code>/en/realtime-media/on-premise-recording/reference/pricing</code> |  |
| <code>/en/Recording/token_server</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/Video/custom_video_android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/custom-video</code> |  |
| <code>/en/Video/custom_video_unity</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/custom-video</code> |  |
| <code>/en/Interactive Broadcast/custom_video_android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/custom-video</code> |  |
| <code>/en/Interactive Broadcast/custom_audio_android</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/custom-audio</code> |  |
| <code>/en/Interactive Broadcast/custom_audio_apple</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/custom-audio</code> |  |
| <code>/en/Video/screensharing_ios</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/Video/screensharing_android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/Voice/chrome_screensharing_plugin</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing</code> |  |
| <code>/en/Agora Platform/faq/billing_free</code> | <code>/en/api-reference/faq/account/billing_free</code> |  |
| <code>/en/Video/faq/billing_free</code> | <code>/en/api-reference/faq/account/billing_free</code> |  |
| <code>/en/Agora Platform/manage_projects</code> | <code>/en/introduction/projects</code> |  |
| <code>/en/Audio Broadcast/in-call_quality_unity</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/Interactive Broadcast/in-call_quality_android</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/Interactive Broadcast/in_call_statistics_windows</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring</code> |  |
| <code>/en/Interactive Broadcast/fallback_android</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/media-stream-fallback</code> |  |
| <code>/en/Interactive Broadcast/fallback_windows</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/media-stream-fallback</code> |  |
| <code>/en/Interactive Broadcast/faq/live_streaming_disconnection_web</code> | <code>/en/api-reference/faq/integration/live_streaming_disconnection_web</code> |  |
| <code>/en/Interactive Broadcast/faq/string</code> | <code>/en/api-reference/faq/integration/string_uid</code> |  |
| <code>/en/Voice/string_android</code> | <code>/en/api-reference/faq/integration/string_uid</code> |  |
| <code>/en/Interactive Broadcast/landing-page</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/Voice/landing-page</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/Audio/landing-page</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/Interactive Broadcast/product</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/Voice/product_voice</code> | <code>/en/realtime-media/rtc</code> |  |
| <code>/en/Interactive</code> | <code>/en/realtime-media/rtc</code> | closest match |
| <code>/en/Interactive Broadcast/android_video</code> | <code>/en/realtime-media/rtc</code> | closest match |
| <code>/en/Video/android_video</code> | <code>/en/realtime-media/rtc</code> | closest match |
| <code>/en/Voice/android_audio</code> | <code>/en/realtime-media/rtc</code> | closest match |
| <code>/en/Voice/ios_audio</code> | <code>/en/realtime-media/rtc</code> | closest match |
| <code>/en/Audio Broadcast/mac_audio</code> | <code>/en/realtime-media/rtc</code> | closest match |
| <code>/en/Interactive Broadcast/lastmile_quality_android</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> |  |
| <code>/en/Interactive Broadcast/lastmile_quality_windows</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> |  |
| <code>/en/Interactive Broadcast/start_live_android</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Interactive Broadcast/start_live_flutter</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Interactive Broadcast/start_live_ios</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Audio Broadcast/start_live_ios</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Video/start_live_flutter</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Video/start_call_electron</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Voice/start_call_web</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Voice/start_call_react_native</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Voice/start_call_flutter</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> |  |
| <code>/en/Video/start_live_react_na</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> | closest match |
| <code>/en/Interactive Broadcast/web_prepare</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> | closest match |
| <code>/en/Video/web_prepare</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> | closest match |
| <code>/en/Interactive Broadcast/publish_web_live</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> | closest match |
| <code>/en/Interactive Broadcast/initialize_web_live</code> | <code>/en/realtime-media/rtc/get-started-sdk</code> | closest match |
| <code>/en/Interactive Broadcast/start_live_audio_android</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Interactive Broadcast/start_live_audio_react_native</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Audio Broadcast/start_live_audio_android</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Audio Broadcast/start_live_audio_web</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Voice/start_call_audio_android</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Voice/start_call_audio_ios</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Voice/start_call_audio_web</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> |  |
| <code>/en/Voice/run_demo_voice_call_ios</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/compile-run-sample-project</code> |  |
| <code>/en/Interactive Broadcast/token</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> |  |
| <code>/en/Video/token</code> | <code>/en/realtime-media/rtc/build/authenticate-users/authentication-workflow</code> |  |
| <code>/en/Voice/token_server</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/Video/token_server_php</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/Interactive Broadcast/token_server_cpp</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/Interactive Broadcast/token_server_python</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/Interactive Gaming/token_server_php</code> | <code>/en/realtime-media/rtc/build/authenticate-users/deploy-token-server</code> |  |
| <code>/en/Video/raw_data_video_android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/raw-video-processing</code> |  |
| <code>/en/Interactive Broadcast/raw_data_video_android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/raw-video-processing</code> |  |
| <code>/en/Interactive Broadcast/raw_data_audio_apple</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/stream-raw-audio</code> |  |
| <code>/en/Voice/audio_effect_mixing_apple</code> | <code>/en/realtime-media/rtc/build/enhance-the-audio-experience/audio-mixing-and-sound-effects</code> |  |
| <code>/en/Voice/voice_changer_android</code> | <code>/en/realtime-media/rtc/build/enhance-the-audio-experience/voice-effects</code> |  |
| <code>/en/Voice/audio_profile_apple</code> | <code>/en/realtime-media/rtc/build/control-audio-and-devices/configure-audio-encoding</code> |  |
| <code>/en/Video/volume_ios</code> | <code>/en/realtime-media/rtc/build/control-audio-and-devices/volume-control-and-mute</code> |  |
| <code>/en/Interactive Broadcast/video_profile_android</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/configure-video-encoding</code> |  |
| <code>/en/Video/video_profile_web_ng</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/configure-video-encoding</code> |  |
| <code>/en/Interactive Broadcast/autoplay_policy_web</code> | <code>/en/realtime-media/rtc/build/optimize-and-operate/autoplay</code> |  |
| <code>/en/Interactive Broadcast/media_relay_android</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/cross-channel-media-relay</code> |  |
| <code>/en/Interactive Broadcast/multiple_channel_android</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels</code> |  |
| <code>/en/Interactive Broadcast/multiple_channel_windows</code> | <code>/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels</code> |  |
| <code>/en/Interactive Broadcast/reduce_rtc_app_size</code> | <code>/en/realtime-media/rtc/build/optimize-and-operate/app-size-optimization</code> |  |
| <code>/en/Video/faq/reduce_app_size_rtc</code> | <code>/en/api-reference/faq/integration/reduce_app_size_rtc</code> |  |
| <code>/en/Interactive Broadcast/mediaplayer_release_ios</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/play-media</code> | closest match |
| <code>/en/Interactive Broadcast/cdn_streaming_android</code> | <code>/en/realtime-media/media-push</code> |  |
| <code>/en/Interactive Broadcast/cdn_streaming_apple</code> | <code>/en/realtime-media/media-push</code> |  |
| <code>/en/Audio Broadcast/cdn_streaming_apple</code> | <code>/en/realtime-media/media-push</code> |  |
| <code>/en/Interactive Broadcast/inject_stream_web</code> | <code>/en/realtime-media/media-pull</code> |  |
| <code>/en/Interactive Broadcast/inject_stream_web_ng</code> | <code>/en/realtime-media/media-pull</code> |  |
| <code>/en/Interactive Broadcast/inject_stream_windows</code> | <code>/en/realtime-media/media-pull</code> |  |
| <code>/en/Interactive Broadcast/faq/billing_basis</code> | <code>/en/api-reference/faq/account/billing_basis</code> |  |
| <code>/en/Interactive Broadcast/faq/capacity</code> | <code>/en/api-reference/faq/product/capacity</code> |  |
| <code>/en/Interactive Broadcast/faq/logfile</code> | <code>/en/api-reference/faq/integration/set_log_file</code> |  |
| <code>/en/Interactive Broadcast/faq/token_cohost</code> | <code>/en/api-reference/faq/integration/token_cohost</code> |  |
| <code>/en/Interactive Broadcast/faq/differences_between_setenabled_and_setmuted</code> | <code>/en/api-reference/faq/integration/set_enabled_set_muted</code> |  |
| <code>/en/InteractiveBroadcast/faq/billing_account</code> | <code>/en/api-reference/faq/account/billing_account</code> |  |
| <code>/en/Video/faq/business_billing</code> | <code>/en/api-reference/faq/account/billing_account</code> | closest match |
| <code>/en/Video/faq/browser_support</code> | <code>/en/api-reference/faq/product/browser_support</code> |  |
| <code>/en/Video/faq/audio_format</code> | <code>/en/api-reference/faq/product/audio_format</code> |  |
| <code>/en/Video/faq/restful_api_call_frequency</code> | <code>/en/api-reference/faq/integration/restful_api_call_frequency</code> |  |
| <code>/en/Video/faq</code> | <code>/en/api-reference/faq</code> |  |
| <code>/en/All/faq/token_error</code> | <code>/en/api-reference/faq/integration/token_related_issues</code> |  |
| <code>/en/Agora Platform/channel</code> | <code>/en/api-reference/faq/integration/channel</code> |  |
| <code>/en/Agora Platform/cloud_proxy_web</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/cloud-proxy</code> |  |
| <code>/en/AgoraPlatform/get_appid_token</code> | <code>/en/introduction/account</code> |  |
| <code>/en/AgoraPlatform/firewall</code> | <code>/en/introduction/firewall</code> |  |
| <code>/en/Agora Platform/agora_console_restapi</code> | <code>/en/api-reference/api-ref/console/solutions-agora-console-rest-api</code> |  |
| <code>/en/Video/dashboard_restful_communication</code> | <code>/en/api-reference/api-ref/console/solutions-agora-console-rest-api</code> | closest match |
| <code>/en/Interactive Broadcast/rtc_channel_management_restfulapi</code> | <code>/en/realtime-media/rtc/reference/channel-management-api</code> |  |
| <code>/en/Agora Platform/security_practice</code> | <code>/en/introduction/security-privacy</code> |  |
| <code>/en/Agora Platform/iso_cert</code> | <code>/en/introduction/security-privacy</code> |  |
| <code>/en/Agora Platform/bug_bounty</code> | <code>/en/introduction/security-privacy</code> | closest match |
| <code>/en/One-to-one Classroom/1_to_1_class_overview_6.0</code> | <code>/en/realtime-media/flexible-classroom/product-overview</code> | closest match |
| <code>/en/Interactive+Broadcast/voice_changer_apple</code> | <code>/en/realtime-media/rtc/build/enhance-the-audio-experience/voice-effects</code> | route |
| <code>/en/Interactive+Broadcast/custom_audio_web_ng</code> | <code>/en/realtime-media/rtc/build/customize-audio-processing/custom-audio</code> | route |
| <code>/en/Interactive+Broadcast/video_profile_web</code> | <code>/en/realtime-media/rtc/build/capture-and-render-video/configure-video-encoding</code> | route |
| <code>/en/Agora+Platform/proxy_web</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/cloud-proxy</code> | route |
| <code>/en/Audio+Broadcast/inject_stream_windows_audio</code> | <code>/en/realtime-media/media-pull</code> | route |
| <code>/en/Audio+Broadcast/test_switch_device_unity</code> | <code>/en/realtime-media/rtc/build/manage-connection-and-quality/pre-call-tests</code> | route |
| <code>/en/Interactive%2520Broadcast/start_live_audio_mac</code> | <code>/en/realtime-media/rtc/voice-quickstart</code> | route |

Left unresolved in this batch: `multi_user_video` (two products), `start_live_cocos_creator`, `game_unity`, `leave_ios`, `live_stream_shopping_overview`, `co_host_ios`, `aa_big_channel`, `recording_merge_files`, `recording_raw_data`, `rtm_call_busy`, `switchdevice_web`, `peer_to_peer_message`, `rtc_recording_apple`, and the truncated `/en/Voice/audio_`. None has a clear current equivalent.
