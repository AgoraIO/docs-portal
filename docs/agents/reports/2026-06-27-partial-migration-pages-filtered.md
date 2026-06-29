# Partial 迁移页面清单（已排除 TEN 与 RESTful 相关项）

来源：`docs/agents/reports/2026-06-27-partial-migration-pages.md`

说明：
- 本文件仍包含一部分 `标题变化` 与错映射噪音，不能直接作为 English 修复队列。
- English 实际修复请优先使用：`docs/agents/reports/2026-06-27-partial-migration-pages-en-actionable.md`

- 已整组排除：`ten-agent`、`ten-framework`
- 已按关键字排除 RESTful/API 导向条目：`rest-api`、`restful`、`api-ref`、`channel-management-api`、`endpoint`、`webhook`、`authentication`

| 产品线 | 页面数 |
|---|---:|
| agora-analytics | 1 |
| agora-chat | 1 |
| broadcast-streaming | 5 |
| cloud-recording | 1 |
| cloud-transcoding | 1 |
| conversational-ai | 12 |
| convo-ai-device-kit | 2 |
| extensions-marketplace | 4 |
| flexible-classroom | 2 |
| interactive-live-streaming | 5 |
| interactive-whiteboard | 4 |
| iot | 1 |
| media-gateway | 8 |
| on-premise-recording | 2 |
| open-ai-integration | 2 |
| server-gateway | 2 |
| signaling | 4 |
| video-calling | 11 |
| voice-calling | 8 |

## agora-analytics (1)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Analytics | Product overview | 1 | 标题变化 | https://docs.agora.io/en/agora-analytics/overview/product-overview | /en/solutions/agora-analytics/product-overview |

## agora-chat (1)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Chat | Release notes | 1 | 标题变化 | https://docs.agora.io/en/agora-chat/overview/product-overview | /en/realtime-media/im/reference/release-notes |

## broadcast-streaming (5)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/broadcast-streaming/advanced-features/geofencing | /en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing |
| Optimized video rendering | Optimized video rendering | 4 | 正文缩短、表格缺失、代码/API 缺失 | https://docs.agora.io/en/broadcast-streaming/best-practices/optimize-frame-rendering | /en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-frame-rendering |
| Optimize video experience in multi-host scenarios | Optimize video experience in multi-host scenarios | 3 | 代码/API 缺失 | https://docs.agora.io/en/broadcast-streaming/best-practices/optimize-multihost-video | /en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video |
| Preload channels | Preload channels | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/broadcast-streaming/best-practices/preload-channels | /en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/preload-channels |
| Broadcast Streaming | Product overview | 1 | 标题变化 | https://docs.agora.io/en/broadcast-streaming/overview/product-overview | /en/realtime-media/broadcast-streaming/product-overview |

## cloud-recording (1)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/cloud-recording/reference/security | /en/realtime-media/cloud-recording/reference/security |

## cloud-transcoding (1)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Cloud Transcoding | Enable Cloud Transcoding | 1 | 渲染结构问题 | https://docs.agora.io/en/cloud-transcoding/overview/product-overview | /en/realtime-media/transcoding/build/manage-agora-account |

## conversational-ai (12)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Optimize audio | Optimize audio quality | 1 | 表格缺失 | https://docs.agora.io/en/conversational-ai/best-practices/audio-setup | /en/ai/best-practices/audio-setup |
| Use filler words | Talking while waiting | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/best-practices/filler-words | /en/ai/build/shape-the-conversation/filler-words |
| Transmit custom information | Pass information to the agent | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/develop/custom-information | /en/ai/build/shape-the-conversation/custom-information |
| Custom LLM | Connect your own LLM service | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/develop/custom-llm | /en/ai/build/custom-model-integration/custom-llm |
| Send picture messages | Send images to the agent | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/develop/send-multimodal-messages | /en/ai/build/send-multimodal-messages |
| Integrate short-term memory | Memory for Multi-Turn Conversations | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/develop/short-term-memory | /en/ai/build/shape-the-conversation/short-term-memory |
| Overview | Overview | 1 | 渲染结构问题 | https://docs.agora.io/en/conversational-ai/models/asr/overview | /en/realtime-media/im/build/notifications-and-event-handling/offline-push/overview |
| xAI | xAI Grok | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/models/asr/xai | /en/ai/models/mllm/xai |
| Overview | Overview | 1 | 渲染结构问题 | https://docs.agora.io/en/conversational-ai/models/avatar/overview | /en/realtime-media/im/build/notifications-and-event-handling/offline-push/overview |
| Overview | Overview | 1 | 渲染结构问题 | https://docs.agora.io/en/conversational-ai/models/llm/overview | /en/realtime-media/im/build/notifications-and-event-handling/offline-push/overview |
| Overview | Overview | 1 | 代码/API 缺失 | https://docs.agora.io/en/conversational-ai/models/mllm/overview | /en/realtime-media/overview |
| xAI | xAI Grok | 1 | 标题变化 | https://docs.agora.io/en/conversational-ai/models/tts/xai | /en/ai/models/mllm/xai |

## convo-ai-device-kit (2)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Enable services | Enable services | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/convo-ai-device-kit/get-started/enable-services | /en/ai/device-kit/reference/enable-services |
| Convo AI Device Kit R1 | Enable services | 1 | 标题变化 | https://docs.agora.io/en/convo-ai-device-kit/overview/product-overview | /en/ai/device-kit/reference/enable-services |

## extensions-marketplace (4)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| ActiveFence Video Content Moderation | ActiveFence Video Content Moderation | 7 | 表格缺失 | https://docs.agora.io/en/extensions-marketplace/develop/integrate/activefence | /en/realtime-media/marketplace/build/add-moderation-and-intelligence/activefence |
| HTEffect 3D Avatar | HTEffect 3D Avatar | 7 | 表格缺失 | https://docs.agora.io/en/extensions-marketplace/develop/integrate/ht_3d_avatar | /en/realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar |
| Extensions Marketplace | Release notes | 1 | 标题变化 | https://docs.agora.io/en/extensions-marketplace/overview/product-overview | /en/realtime-media/marketplace/reference/release-notes |
| Security | Security | 7 | 表格缺失 | https://docs.agora.io/en/extensions-marketplace/reference/security | /en/realtime-media/marketplace/reference/security |

## flexible-classroom (2)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Migration guide | Migration guide | 2 | 代码/API 缺失 | https://docs.agora.io/en/flexible-classroom/develop/migration-guide | /en/solutions/flexible-classroom/reference/migration-guide |
| Flexible Classroom | Product overview | 1 | 标题变化 | https://docs.agora.io/en/flexible-classroom/overview/product-overview | /en/solutions/flexible-classroom/product-overview |

## interactive-live-streaming (5)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/interactive-live-streaming/advanced-features/geofencing | /en/solutions/interactive-live-streaming/build/secure-and-protect-channels/geofencing |
| Optimized video rendering | Optimized video rendering | 4 | 正文缩短、表格缺失、代码/API 缺失 | https://docs.agora.io/en/interactive-live-streaming/best-practices/optimize-frame-rendering | /en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-frame-rendering |
| Optimize video experience in multi-host scenarios | Optimize video experience in multi-host scenarios | 3 | 代码/API 缺失 | https://docs.agora.io/en/interactive-live-streaming/best-practices/optimize-multihost-video | /en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video |
| Preload channels | Preload channels | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/interactive-live-streaming/best-practices/preload-channels | /en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/preload-channels |
| Interactive Live Streaming | Product overview | 1 | 标题变化 | https://docs.agora.io/en/interactive-live-streaming/overview/product-overview | /en/solutions/interactive-live-streaming/product-overview |

## interactive-whiteboard (4)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Core concepts | Core concepts | 1 | 表格缺失、代码/API 缺失 | https://docs.agora.io/en/interactive-whiteboard/overview/core-concepts | /en/realtime-media/whiteboard/overview/core-concepts |
| Interactive Whiteboard | Security | 1 | 标题变化 | https://docs.agora.io/en/interactive-whiteboard/overview/product-overview | /en/realtime-media/whiteboard/reference/security |
| Release notes (Whiteboard) | Release notes | 3 | 代码/API 缺失 | https://docs.agora.io/en/interactive-whiteboard/overview/release-notes | /en/realtime-media/whiteboard/overview/release-notes |
| Product and service status | Product and service status | 1 | 表格缺失 | https://docs.agora.io/en/interactive-whiteboard/reference/status-page | /en/realtime-media/whiteboard/reference/status-page |

## iot (1)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| IoT SDK | Product overview | 2 | 标题变化 | https://docs.agora.io/en/iot/overview/product-overview | /en/solutions/iot/product-overview |

## media-gateway (8)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Enable adaptive bitrate | Enable adaptive bitrate | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/advanced/abr | /en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate |
| Receive notifications about channel events | Receive notifications about channel events | 1 | 表格缺失 | https://docs.agora.io/en/media-gateway/advanced/events | /en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications |
| Handle callback events | Receive notifications about channel events | 1 | 标题变化 | https://docs.agora.io/en/media-gateway/develop/callback-events | /en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications |
| Encrypt and decrypt data | Encrypt and decrypt data | 1 | 表格缺失 | https://docs.agora.io/en/media-gateway/develop/data-encryption | /en/realtime-media/rtmp-gateway/build/secure-and-protect-streaming/data-encryption |
| Enable RTMPS | Enable RTMPS | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/develop/rtmps-encryption | /en/realtime-media/rtmp-gateway/build/secure-and-protect-streaming/rtmps-encryption |
| FAQs | FAQs | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/overview/faq | /en/realtime-media/rtmp-gateway/reference/faq |
| Media Gateway features | Media Gateway features | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/overview/features | /en/realtime-media/rtmp-gateway/reference/media-gateway-features |
| Product overview | Product overview | 1 | 标题变化 | https://docs.agora.io/en/media-gateway/overview/product-overview | /en/realtime-media/rtmp-gateway/product-overview |

## on-premise-recording (2)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Agora skills | Agora skills | 1 | 代码/API 缺失 | https://docs.agora.io/en/on-premise-recording/get-started/skills | /en/realtime-media/on-premise-recording/skills |
| On-Premise Recording | Release notes | 1 | 标题变化 | https://docs.agora.io/en/on-premise-recording/overview/product-overview | /en/realtime-media/on-premise-recording/reference/release-notes |

## open-ai-integration (2)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Quickstart guide | UI Kit quickstart | 1 | 渲染结构问题 | https://docs.agora.io/en/open-ai-integration/get-started/quickstart | /en/realtime-media/im/get-started-uikit |
| Conversational AI powered by Agora and OpenAI Realtime API | OpenAI Realtime integration | 1 | 渲染结构问题 | https://docs.agora.io/en/open-ai-integration/overview/product-overview | /en/ai/reference/openai-realtime-integration |

## server-gateway (2)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Agora skills | Agora skills | 1 | 代码/API 缺失 | https://docs.agora.io/en/server-gateway/get-started/skills | /en/realtime-media/rtmp-gateway/build/skills |
| Server Gateway | Media Gateway features | 1 | 标题变化 | https://docs.agora.io/en/server-gateway/overview/product-overview | /en/realtime-media/rtmp-gateway/reference/media-gateway-features |

## signaling (4)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Agora skills | Agora skills | 1 | 代码/API 缺失 | https://docs.agora.io/en/signaling/get-started/skills | /en/realtime-media/rtmp-gateway/build/skills |
| Manual install | Manual install | 8 | 表格缺失 | https://docs.agora.io/en/signaling/reference/downloads | /en/realtime-media/rtm/reference/downloads |
| Error codes | Error codes | 9 | 代码/API 缺失 | https://docs.agora.io/en/signaling/reference/error-codes | /en/realtime-media/rtm/reference/error-codes |
| Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/signaling/reference/security | /en/realtime-media/rtmp-gateway/reference/security |

## video-calling (11)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/video-calling/advanced-features/geofencing | /en/realtime-media/video/build/manage-connection-and-quality/geofencing |
| Simulcasting multi-bitrate video streams (Beta) | Simulcasting multi-bitrate video streams (Beta) | 4 | 表格缺失 | https://docs.agora.io/en/video-calling/advanced-features/simulcasting | /en/realtime-media/video/build/manage-connection-and-quality/simulcasting |
| Optimize first-frame rendering | Optimized video rendering | 4 | 标题变化、正文缩短、表格缺失 | https://docs.agora.io/en/video-calling/best-practices/optimize-frame-rendering | /en/realtime-media/video/build/capture-and-render-video/optimize-frame-rendering |
| Optimize video experience in multi-host scenarios | Optimize video experience in multi-host scenarios | 3 | 代码/API 缺失 | https://docs.agora.io/en/video-calling/best-practices/optimize-multihost-video | /en/realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video |
| Fast channel joining and switching | Preload channels | 1 | 标题变化、正文缩短、代码/API 缺失 | https://docs.agora.io/en/video-calling/best-practices/preload-channels | /en/realtime-media/video/build/join-and-manage-channels/preload-channels |
| Optimize video transmission | Multipath network transmission | 12 | 标题变化 | https://docs.agora.io/en/video-calling/enhance-call-quality/video-transmission-optimization | /en/realtime-media/video/build/manage-connection-and-quality/multipath-transmission |
| Product overview | Product overview | 1 | 标题变化 | https://docs.agora.io/en/video-calling/overview/product-overview | /en/realtime-media/video/product-overview |
| Quickstart | Quickstart | 12 | 渲染结构问题 | https://docs.agora.io/en/video-calling/start-call/quickstart | /en/realtime-media/video/get-started-sdk |
| Release notes | Release notes | 12 | 标题变化 | https://docs.agora.io/en/video-calling/overview/release-notes | /en/realtime-media/video/reference/release-notes |
| Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/video-calling/reference/security | /en/realtime-media/video/reference/security |
| API examples | API examples | 1 | 代码/API 缺失 | https://docs.agora.io/en/video-calling/reference/api-examples | /en/realtime-media/video/reference/api-examples |

## voice-calling (8)

| 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---:|---|---|---|
| Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/voice-calling/advanced-features/geofencing | /en/realtime-media/voice/build/manage-connection-and-quality/geofencing |
| Optimize audio transmission | Multipath network transmission | 8 | 标题变化 | https://docs.agora.io/en/voice-calling/enhance-call-quality/audio-transmission-optimization | /en/realtime-media/voice/build/manage-connection-and-quality/multipath-transmission |
| Product overview | Product overview | 1 | 标题变化 | https://docs.agora.io/en/voice-calling/overview/product-overview | /en/realtime-media/voice/product-overview |
| Quickstart | Quickstart | 8 | 渲染结构问题 | https://docs.agora.io/en/voice-calling/start-call/quickstart | /en/realtime-media/voice/get-started-sdk |
| Release notes | Release notes | 8 | 标题变化 | https://docs.agora.io/en/voice-calling/overview/release-notes | /en/realtime-media/voice/reference/release-notes |
| Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/voice-calling/reference/security | /en/realtime-media/voice/reference/security |
| API examples | API examples | 1 | 代码/API 缺失 | https://docs.agora.io/en/voice-calling/reference/api-examples | /en/realtime-media/voice/reference/api-examples |
| Error codes | Error codes | 1 | 代码/API 缺失 | https://docs.agora.io/en/voice-calling/reference/error-codes | /en/realtime-media/voice/reference/error-codes |
