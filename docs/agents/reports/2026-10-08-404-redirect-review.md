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
