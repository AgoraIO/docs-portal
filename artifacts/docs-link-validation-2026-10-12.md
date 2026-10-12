# 文档站内跳转验证报告

- 验证日期：2026-10-12
- 验证范围：英文 global 部署、中文 cn 部署；文档源链接、根路径链接、相对 Markdown 链接、锚点、渲染页面链接，以及代表性按钮/标签交互。
- 验证环境：Vite dev，global `http://127.0.0.1:4173`，cn `http://127.0.0.1:4174`（`VITE_DOCS_REGION=cn`）。

## 结论

当前不能判定为“所有站内跳转有效”。静态审计发现 185 个无效内部链接、76 个未解析根路径、98 个缺失锚点和 11 个未解析相对链接。对这些候选链接进行真实 HTTP 验证后，global 部署有 45 个去重后的实际 404 路径；cn 部署在此基础上新增 10 个 404 路径。另有 48 个锚点候选在运行时表现为页面 404 或页面 200 但锚点不存在。

## 静态审计

执行：`bun run docs:links:strict`

| 指标 | 数量 |
| --- | ---: |
| 文档文件 | 7,842 |
| OpenAPI 文件 | 26 |
| 总链接 | 135,472 |
| 无效内部链接 | 185 |
| 未解析相对 Markdown 链接 | 11 |
| 未解析根路径链接 | 76 |
| 缺失锚点 | 98 |
| 外部链接（未在本轮检查） | 26,390 |

## 真实运行时 404（global）

| 路径 | 引用来源（最多 4 个） |
| --- | --- |
| `/cloud-recording/reference/region-vendor` | en/api-reference/api-ref/speech-to-text/rest-api-v5/start.mdx<br>en/api-reference/api-ref/speech-to-text/rest-api-v6/start.mdx |
| `/en/3.x/interactive-live-streaming/basic-features/screensharing` | en/api-reference/faq/integration/switch_screen_camera_web.mdx |
| `/en/3.x/interactive-live-streaming/introduction/product-overview` | en/api-reference/faq/quality/web_screen_share_issues.mdx |
| `/en/3.x/interactive-live-streaming/introduction/release-notes` | en/api-reference/faq/integration/reduce_app_size_rtc.mdx |
| `/en/3.x/voice-calling/best-practices/reduce-app-size` | en/api-reference/faq/integration/reduce_app_size_rtc.mdx |
| `/en/agora-chat/reference/error-codes` | en/api-reference/faq/integration/chat_issues.mdx |
| `/en/cloud-recording/develop/recording-video-profile` | en/api-reference/faq/integration/return_404.mdx |
| `/en/cloud-recording/reference/common-errors` | en/api-reference/faq/integration/fail_to_upload.mdx<br>en/api-reference/faq/integration/return_404.mdx |
| `/en/cloud-recording/reference/rest-api-overview` | en/api-reference/faq/integration/acquire_file_directory.mdx<br>en/api-reference/faq/integration/ncs_vs_query.mdx |
| `/en/cloud-recording/reference/restful-api` | en/api-reference/faq/integration/acquire_file_directory.mdx<br>en/api-reference/faq/integration/fail_to_upload.mdx<br>en/api-reference/faq/integration/stop_cloud_recording.mdx<br>en/api-reference/faq/product/platform_version.mdx |
| `/en/interactive-live-streaming/core-functionality/join-multiple-channels` | en/api-reference/faq/product/capacity.mdx |
| `/en/interactive-live-streaming/core-functionality/screen-sharing` | en/api-reference/faq/quality/web_screen_share_issues.mdx |
| `/en/interactive-live-streaming/get-started/get-started-sdk` | en/api-reference/faq/integration/host_set_role.mdx<br>en/api-reference/faq/integration/image_enhancement.mdx<br>en/api-reference/faq/integration/judge_voice_video_call.mdx<br>en/api-reference/faq/quality/video_blank.mdx |
| `/en/interactive-whiteboard/develop/enable-whiteboard` | en/api-reference/faq/integration/cant_upload_courseware.mdx |
| `/en/on-premise-recording/get-started/integrate-sdk` | en/api-reference/faq/product/platform_version.mdx |
| `/en/realtime-media/video/account-settlement` | en/realtime-media/on-premise-recording/reference/pricing.mdx<br>en/realtime-media/video/reference/pricing.mdx |
| `/en/signaling/develop/call-invitation` | en/api-reference/faq/integration/judge_voice_video_call.mdx |
| `/en/signaling/develop/manage-connection-states` | en/api-reference/faq/integration/call_duration.mdx |
| `/en/signaling/get-started/get-started-sdk` | en/api-reference/faq/integration/judge_voice_video_call.mdx |
| `/en/signaling/get-started/sdk-quickstart` | en/api-reference/faq/integration/host_set_role.mdx |
| `/en/signaling/reference/release-notes` | en/api-reference/faq/integration/judge_voice_video_call.mdx |
| `/en/video-calling/advanced-features/audio-mixing-and-sound-effects` | en/api-reference/faq/quality/track_ended.mdx |
| `/en/video-calling/advanced-features/custom-video` | en/api-reference/faq/quality/pixelated_green_video.mdx<br>en/api-reference/faq/quality/unsynchronized_video.mdx |
| `/en/video-calling/best-practices/optimize-frame-rendering` | en/api-reference/faq/quality/optimize_video_rendering.mdx |
| `/en/video-calling/core-functionality/media-stream-encryption` | en/api-reference/faq/quality/video_blank.mdx |
| `/en/video-calling/core-functionality/receive-notifications` | en/api-reference/faq/integration/audience_event.mdx<br>en/api-reference/faq/integration/restful_api_call_frequency.mdx |
| `/en/video-calling/get-started/authentication-workflow` | en/api-reference/faq/integration/kick_user.mdx<br>en/api-reference/faq/integration/token_cohost.mdx |
| `/en/video-calling/get-started/get-started-sdk` | en/api-reference/faq/integration/android_startaudiomixing_permission.mdx<br>en/api-reference/faq/integration/image_enhancement.mdx |
| `/en/video-calling/reference/agora-console-rest-api` | en/api-reference/faq/integration/string_uid.mdx |
| `/en/video-calling/reference/channel-management-rest-api` | en/api-reference/faq/integration/restful_api_call_frequency.mdx |
| `/en/video-calling/reference/supported-platforms` | en/api-reference/faq/integration/console_error_web.mdx<br>en/api-reference/faq/product/platform_version.mdx |
| `/en/voice-calling/core-functionality/cloud-proxy` | en/api-reference/faq/integration/console_error_web.mdx |
| `/en/voice-calling/reference/firewall` | en/api-reference/faq/integration/console_error_web.mdx |
| `/help/integration-issues/agora_class_custom_properties` | en/api-reference/api-ref/flexible-classroom/classroom-sdk.mdx |
| `/openapi/speech-to-text/join` | openapi/speech-to-text/v7.yaml |
| `/real-time-stt/develop/translation` | en/api-reference/api-ref/speech-to-text/rest-api-v5/start.mdx<br>en/api-reference/api-ref/speech-to-text/rest-api-v6/start.mdx |
| `/signaling/reference/error-codes` | en/api-reference/api-ref/signaling/flutter.mdx |
| `/zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye` | zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye/index.mdx |
| `/zh-CN/api-reference/rtm/unity/enumv` | zh-CN/api-reference/rtm/toc-presence/presence.mdx<br>zh-CN/api-reference/rtm/unity/presence.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx<br>zh-CN/realtime-media/rtsa/build/media-transmission/audio-codec.mdx<br>zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx<br>zh-CN/realtime-media/rtsa/index.mdx |
| `/zh-CN/api-reference/rtsa/c/structagora-rtc-event-handler-t` | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx |
| `/zh-CN/realtime-media/cloud-recording/get-started/quick-start` | zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual-without-transcoding.mdx<br>zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual.mdx<br>zh-CN/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite.mdx<br>zh-CN/realtime-media/cloud-recording/get-started/quick-start/go.mdx |
| `/zh-CN/realtime-media/rtc/build/get-started/quick-start` | zh-CN/realtime-media/rtc/build/extensions/web/noise-reduction.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/super-clarity.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/video-compositing.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/virtual-background.mdx |
| `/zh-CN/solutions/iot-apaas/build/customize-and-extend/_` | zh-CN/solutions/iot-apaas/build/customize-and-extend/upgrade-ota.mdx |
| `/zh-CN/solutions/voip-call/voip-events` | zh-CN/solutions/voip-call/build/license.mdx |

## 真实运行时 404（cn 相对 global 新增）

| 路径 | 引用来源（最多 4 个） |
| --- | --- |
| `/en/api-reference/api-ref/cloud-recording` | en/realtime-media/cloud-recording/reference/pricing-webpage-recording.mdx |
| `/en/api-reference/api-ref/uikit-sdk` | en/realtime-media/whiteboard/reference/release-notes-uikit.mdx |
| `/en/cloud-recording/get-started/getstarted` | en/api-reference/faq/integration/bucket_region.mdx |
| `/en/realtime-media/cloud-recording/reference/billing-policies` | en/realtime-media/cloud-recording/reference/pricing-webpage-recording.mdx |
| `/en/realtime-media/iot/build/manage-agora-account` | en/realtime-media/iot/build/stream-and-optimize-media/multi-channel-streaming.mdx<br>en/realtime-media/iot/quickstart.mdx |
| `/en/realtime-media/media-pull/reference/glossary` | en/api-reference/api-ref/media-pull/index.md |
| `/en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-sdk` | en/realtime-media/whiteboard/reference/release-notes.mdx |
| `/en/signaling/get-started/manage-agora-account` | en/api-reference/faq/integration/return_404.mdx |
| `/en/solutions/interactive-live-streaming/reference/firewall` | en/realtime-media/interactive-live-streaming/reference/release-notes.mdx |
| `/en/video-calling/get-started/manage-agora-account` | en/api-reference/faq/account/billing_account.mdx |

## 锚点验证

| 页面 | 缺失锚点 | 状态 | 引用来源（最多 3 个） |
| --- | --- | --- | --- |
| `/en/api-reference/api-ref/conversational-ai/client-toolkit/ios` | `loadaudiosettings-12` | 页面 200，锚点不存在 | en/api-reference/api-ref/conversational-ai/client-toolkit/ios.mdx |
| `/en/api-reference/api-ref/conversational-ai/client-toolkit/ios` | `loadaudiosettings-22` | 页面 200，锚点不存在 | en/api-reference/api-ref/conversational-ai/client-toolkit/ios.mdx |
| `/en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads` | `Status-codes` | 页面 200，锚点不存在 | en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md |
| `/en/api-reference/api-ref/im/thread-management/manage-thread-members` | `Status-codes` | 页面 200，锚点不存在 | en/api-reference/api-ref/im/thread-management/manage-thread-members.md |
| `/en/realtime-media/media-pull/reference/glossary` | `app=id` | 页面 200，锚点不存在 | en/api-reference/api-ref/media-pull/index.md |
| `/en/api-reference/api-ref/server-sdk/go` | `agentkit-newagent` | 页面 200，锚点不存在 | en/api-reference/api-ref/server-sdk/go.mdx |
| `/en/api-reference/api-ref/server-sdk/python` | `expires_in_hours-expires_in_minutes` | 页面 200，锚点不存在 | en/api-reference/api-ref/server-sdk/python.mdx |
| `/en/api-reference/api-ref/server-sdk/python` | `say-text-priority-none-interruptable-none` | 页面 200，锚点不存在 | en/api-reference/api-ref/server-sdk/python.mdx |
| `/en/video-calling/get-started/manage-agora-account` | `billing-center` | 页面 200，锚点不存在 | en/api-reference/faq/account/billing_account.mdx |
| `/en/cloud-recording/get-started/getstarted` | `start-recording` | 页面 200，锚点不存在 | en/api-reference/faq/integration/bucket_region.mdx |
| `/en/api-reference/faq/integration/console_error_web` | `DTLS` | 页面 200，锚点不存在 | en/api-reference/faq/integration/console_error_web.mdx |
| `/en/signaling/get-started/manage-agora-account` | `configure--features` | 页面 200，锚点不存在 | en/api-reference/faq/integration/return_404.mdx |
| `/en/realtime-media/cloud-recording/reference/billing-policies` | `agoras-free-of-charge-policy-for-the-first-10000-minutes` | 页面 200，锚点不存在 | en/realtime-media/cloud-recording/reference/pricing-webpage-recording.mdx |
| `/en/api-reference/api-ref/cloud-recording` | `extensionserviceconfig` | 页面 200，锚点不存在 | en/realtime-media/cloud-recording/reference/pricing-webpage-recording.mdx |
| `/en/realtime-media/cloud-recording/reference/billing-policies` | `billing-fee-deductions-and-account-suspension-policies` | 页面 200，锚点不存在 | en/realtime-media/cloud-recording/reference/pricing-webpage-recording.mdx |
| `/en/realtime-media/iot/build/manage-agora-account` | `generate-a-temporary-token` | 页面 200，锚点不存在 | en/realtime-media/iot/build/stream-and-optimize-media/multi-channel-streaming.mdx<br>en/realtime-media/iot/quickstart.mdx |
| `/en/api-reference/api-ref/uikit-sdk` | `setstrokerange` | 页面 200，锚点不存在 | en/realtime-media/whiteboard/reference/release-notes-uikit.mdx |
| `/en/api-reference/api-ref/uikit-sdk` | `settoolboxedgemargin` | 页面 200，锚点不存在 | en/realtime-media/whiteboard/reference/release-notes-uikit.mdx |
| `/en/api-reference/api-ref/uikit-sdk` | `setresource` | 页面 200，锚点不存在 | en/realtime-media/whiteboard/reference/release-notes-uikit.mdx |
| `/en/api-reference/api-ref/uikit-sdk` | `settoolscolors` | 页面 200，锚点不存在 | en/realtime-media/whiteboard/reference/release-notes-uikit.mdx |
| `/en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-sdk` | `get-the-whiteboard-sdk` | 页面 200，锚点不存在 | en/realtime-media/whiteboard/reference/release-notes.mdx |
| `/zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye` | `video_view_setup_mode` | 页面 404 | zh-CN/api-reference/online-music-teaching/cpp-all-platforms/api/fish-eye/index.mdx |
| `/zh-CN/api-reference/rtm/unity/enumv` | `rtm_channel_type` | 页面 404 | zh-CN/api-reference/rtm/toc-presence/presence.mdx<br>zh-CN/api-reference/rtm/unity/presence.mdx |
| `/zh-CN/realtime-media/cloud-recording/get-started/quick-start` | `申请录制服务器资源` | 页面 404 | zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual-without-transcoding.mdx<br>zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual.mdx<br>zh-CN/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite.mdx |
| `/zh-CN/realtime-media/cloud-recording/get-started/quick-start` | `开始录制` | 页面 404 | zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual-without-transcoding.mdx<br>zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual.mdx |
| `/zh-CN/realtime-media/cloud-recording/get-started/quick-start` | `模拟音视频互动场景` | 页面 404 | zh-CN/realtime-media/cloud-recording/get-started/quick-start/go.mdx<br>zh-CN/realtime-media/cloud-recording/get-started/quick-start/java.mdx<br>zh-CN/realtime-media/cloud-recording/get-started/quick-start/nodejs.mdx |
| `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api` | `start_listening` | 页面 404 | zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx |
| `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api` | `flush_listening` | 页面 404 | zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx |
| `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api` | `stop_listening` | 页面 404 | zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx |
| `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api` | `log_lv` | 页面 404 | zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx |
| `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api` | `ist_result` | 页面 404 | zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx |
| `/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api` | `its_result` | 页面 404 | zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_join_channel` | 页面 404 | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx<br>zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_send_rdt_msg` | 页面 404 | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_get_rdt_status_info` | 页面 404 | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/structagora-rtc-event-handler-t` | `on_rdt_state` | 页面 404 | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/structagora-rtc-event-handler-t` | `on_rdt_msg` | 页面 404 | zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `audio_codec_type_e` | 页面 404 | zh-CN/realtime-media/rtsa/build/media-transmission/audio-codec.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_create_connection` | 页面 404 | zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_send_video_data` | 页面 404 | zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_send_audio_data` | 页面 404 | zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_leave_channel` | 页面 404 | zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_rtc_destroy_connection` | 页面 404 | zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `audio_data_type_e` | 页面 404 | zh-CN/realtime-media/rtsa/index.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `video_data_type_e` | 页面 404 | zh-CN/realtime-media/rtsa/index.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `agora_err_code_e` | 页面 404 | zh-CN/realtime-media/rtsa/reference/release-notes.mdx |
| `/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h` | `area_code_e` | 页面 404 | zh-CN/realtime-media/rtsa/reference/release-notes.mdx |
| `/zh-CN/solutions/voip-call/voip-events` | `98-api_error` | 页面 404 | zh-CN/solutions/voip-call/build/license.mdx |

## 浏览器交互冒烟验证

- 英文首页、AI 快速开始页和中文首页均可渲染；英文代表性页面链接抽样 96 个，返回 200/307 的 96 个；中文代表性页面链接抽样 156 个，返回 200/307 的 156 个。
- 首页主导航、搜索弹层、主题切换、文档复制按钮、目录折叠按钮可触发；AI 快速开始页的 Windows/macOS 与 Python/TypeScript/Go 标签切换可触发，标签状态发生变化。
- `/en/introduction#build-an-agent` 的目标元素存在，浏览器加载后锚点位置在可视区域内。
- 浏览器控制台还记录到 hydration mismatch；其中一次动态模块加载失败与本地 Vite 重启有关。hydration mismatch 在主题状态与 SSR 初始状态不一致时可复现，属于独立于 404 的前端问题。

## 判定

本轮验证未修改文档或路由。要达到“每个按钮、文中引用、跳转都 valid，不能是 404”，至少需要处理上面列出的实际 404 路径、缺失锚点和 11 个未解析相对链接，然后重新运行静态审计及两区域运行时爬取。
