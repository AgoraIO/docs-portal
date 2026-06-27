# EN 可执行迁移修复清单

来源：
- 原始过滤清单：`docs/agents/reports/2026-06-27-partial-migration-pages-filtered.md`

筛选规则：
- 已移除纯 `标题变化` 条目
- 已移除明显错映射到无关目标页的条目
- 已移除聚合页、总览页、IA 改版页的一对一误比对
- 仅保留 `en` 真实需要修复的内容缺失、表格缺失、代码/API 缺失、或渲染结构问题

状态说明：
- `已修复`：本轮已经落地修复
- `已核实无需修改`：已对照核查，当前目标页不需要再改
- `部分修复`：已修一部分，但该条暂不算完全关单
- `未修复`：仍待处理

## broadcast-streaming

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/broadcast-streaming/advanced-features/geofencing | /en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing |
| 已修复 | Optimized video rendering | Optimized video rendering | 4 | 正文缩短、表格缺失、代码/API 缺失 | https://docs.agora.io/en/broadcast-streaming/best-practices/optimize-frame-rendering | /en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-frame-rendering |
| 已修复 | Optimize video experience in multi-host scenarios | Optimize video experience in multi-host scenarios | 3 | 代码/API 缺失 | https://docs.agora.io/en/broadcast-streaming/best-practices/optimize-multihost-video | /en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video |
| 已核实无需修改 | Preload channels | Preload channels | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/broadcast-streaming/best-practices/preload-channels | /en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/preload-channels |

## cloud-recording

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/cloud-recording/reference/security | /en/realtime-media/cloud-recording/reference/security |

## cloud-transcoding

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已核实误映射 | Cloud Transcoding | Enable Cloud Transcoding | 1 | 渲染结构问题 | https://docs.agora.io/en/cloud-transcoding/overview/product-overview | /en/realtime-media/transcoding/build/manage-agora-account |

## conversational-ai

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Optimize audio | Optimize audio quality | 1 | 表格缺失 | https://docs.agora.io/en/conversational-ai/best-practices/audio-setup | /en/ai/best-practices/audio-setup |

## convo-ai-device-kit

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Enable services | Enable services | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/convo-ai-device-kit/get-started/enable-services | /en/ai/device-kit/reference/enable-services |

## extensions-marketplace

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | ActiveFence Video Content Moderation | ActiveFence Video Content Moderation | 7 | 表格缺失 | https://docs.agora.io/en/extensions-marketplace/develop/integrate/activefence | /en/realtime-media/marketplace/build/add-moderation-and-intelligence/activefence |
| 已修复 | HTEffect 3D Avatar | HTEffect 3D Avatar | 7 | 表格缺失 | https://docs.agora.io/en/extensions-marketplace/develop/integrate/ht_3d_avatar | /en/realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar |
| 已修复 | Security | Security | 7 | 表格缺失 | https://docs.agora.io/en/extensions-marketplace/reference/security | /en/realtime-media/marketplace/reference/security |

## flexible-classroom

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Migration guide | Migration guide | 2 | 代码/API 缺失 | https://docs.agora.io/en/flexible-classroom/develop/migration-guide | /en/solutions/flexible-classroom/reference/migration-guide |

## interactive-live-streaming

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/interactive-live-streaming/advanced-features/geofencing | /en/solutions/interactive-live-streaming/build/secure-and-protect-channels/geofencing |
| 已修复 | Optimized video rendering | Optimized video rendering | 4 | 正文缩短、表格缺失、代码/API 缺失 | https://docs.agora.io/en/interactive-live-streaming/best-practices/optimize-frame-rendering | /en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-frame-rendering |
| 已修复 | Optimize video experience in multi-host scenarios | Optimize video experience in multi-host scenarios | 3 | 代码/API 缺失 | https://docs.agora.io/en/interactive-live-streaming/best-practices/optimize-multihost-video | /en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video |
| 已核实无需修改 | Preload channels | Preload channels | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/interactive-live-streaming/best-practices/preload-channels | /en/solutions/interactive-live-streaming/build/optimize-quality-and-connection/preload-channels |

## interactive-whiteboard

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Core concepts | Core concepts | 1 | 表格缺失、代码/API 缺失 | https://docs.agora.io/en/interactive-whiteboard/overview/core-concepts | /en/realtime-media/whiteboard/overview/core-concepts |
| 已修复 | Release notes (Whiteboard) | Release notes | 3 | 代码/API 缺失 | https://docs.agora.io/en/interactive-whiteboard/overview/release-notes | /en/realtime-media/whiteboard/overview/release-notes |
| 已修复 | Product and service status | Product and service status | 1 | 表格缺失 | https://docs.agora.io/en/interactive-whiteboard/reference/status-page | /en/realtime-media/whiteboard/reference/status-page |

## media-gateway

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Enable adaptive bitrate | Enable adaptive bitrate | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/advanced/abr | /en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate |
| 已修复 | Receive notifications about channel events | Receive notifications about channel events | 1 | 表格缺失 | https://docs.agora.io/en/media-gateway/advanced/events | /en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications |
| 已核实无对应目标页 | Encrypt and decrypt data | Encrypt and decrypt data | 1 | 表格缺失 | https://docs.agora.io/en/media-gateway/develop/data-encryption | /en/realtime-media/rtmp-gateway/build/secure-and-protect-streaming/data-encryption |
| 已核实无对应目标页 | Enable RTMPS | Enable RTMPS | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/develop/rtmps-encryption | /en/realtime-media/rtmp-gateway/build/secure-and-protect-streaming/rtmps-encryption |
| 已核实无对应目标页 | FAQs | FAQs | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/overview/faq | /en/realtime-media/rtmp-gateway/reference/faq |
| 已修复 | Media Gateway features | Media Gateway features | 1 | 代码/API 缺失 | https://docs.agora.io/en/media-gateway/overview/features | /en/realtime-media/rtmp-gateway/reference/media-gateway-features |

## on-premise-recording

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Agora skills | Agora skills | 1 | 代码/API 缺失 | https://docs.agora.io/en/on-premise-recording/get-started/skills | /en/realtime-media/on-premise-recording/skills |

## signaling

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Manual install | Manual install | 8 | 表格缺失 | https://docs.agora.io/en/signaling/reference/downloads | /en/realtime-media/rtm/reference/downloads |
| 已修复 | Error codes | Error codes | 9 | 代码/API 缺失 | https://docs.agora.io/en/signaling/reference/error-codes | /en/realtime-media/rtm/reference/error-codes |

## video-calling

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/video-calling/advanced-features/geofencing | /en/realtime-media/video/build/manage-connection-and-quality/geofencing |
| 已修复 | Simulcasting multi-bitrate video streams (Beta) | Simulcasting multi-bitrate video streams (Beta) | 4 | 表格缺失 | https://docs.agora.io/en/video-calling/advanced-features/simulcasting | /en/realtime-media/video/build/manage-connection-and-quality/simulcasting |
| 已修复 | Optimize first-frame rendering | Optimized video rendering | 4 | 正文缩短、表格缺失 | https://docs.agora.io/en/video-calling/best-practices/optimize-frame-rendering | /en/realtime-media/video/build/capture-and-render-video/optimize-frame-rendering |
| 已修复 | Optimize video experience in multi-host scenarios | Optimize video experience in multi-host scenarios | 3 | 代码/API 缺失 | https://docs.agora.io/en/video-calling/best-practices/optimize-multihost-video | /en/realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video |
| 已核实无需修改 | Fast channel joining and switching | Preload channels | 1 | 正文缩短、代码/API 缺失 | https://docs.agora.io/en/video-calling/best-practices/preload-channels | /en/realtime-media/video/build/join-and-manage-channels/preload-channels |
| 已修复 | Quickstart | Quickstart | 12 | 渲染结构问题 | https://docs.agora.io/en/video-calling/start-call/quickstart | /en/realtime-media/video/get-started-sdk |
| 已修复 | Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/video-calling/reference/security | /en/realtime-media/video/reference/security |
| 已修复 | API examples | API examples | 1 | 代码/API 缺失 | https://docs.agora.io/en/video-calling/reference/api-examples | /en/realtime-media/video/reference/api-examples |

## voice-calling

| 状态 | 旧标题 | 新标题 | variants | 问题类型 | 旧页面 | 新页面 |
|---|---|---|---:|---|---|---|
| 已修复 | Restrict media zones | Restrict media zones | 11 | 表格缺失 | https://docs.agora.io/en/voice-calling/advanced-features/geofencing | /en/realtime-media/voice/build/manage-connection-and-quality/geofencing |
| 已修复 | Quickstart | Quickstart | 8 | 渲染结构问题 | https://docs.agora.io/en/voice-calling/start-call/quickstart | /en/realtime-media/voice/quickstart |
| 已核实无需修改 | Security | Security | 1 | 表格缺失 | https://docs.agora.io/en/voice-calling/reference/security | /en/realtime-media/voice/reference/security |
| 已修复 | API examples | API examples | 1 | 代码/API 缺失 | https://docs.agora.io/en/voice-calling/reference/api-examples | /en/realtime-media/voice/reference/api-examples |
| 已修复 | Error codes | Error codes | 1 | 代码/API 缺失 | https://docs.agora.io/en/voice-calling/reference/error-codes | /en/realtime-media/voice/reference/error-codes |
