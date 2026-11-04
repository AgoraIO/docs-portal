# 中文 RESTful 示例与 HTML API 展示保真核对

日期：2026-11-04。修复 PR：[#1372](https://github.com/AgoraIO/docs-portal/pull/1372)，目标分支 `codex/cn-newdoc-html-api-migration`。

## 范围和判定

覆盖当前已发布的 14 条中文 RESTful lane、126 个接口：145 个请求场景，cURL / Python Requests / Node.js Fetch 共 435 份代码，以及 202 个响应状态/场景组合（含 8 个无 Body 的说明状态）。接口清单来自 `src/lib/openapi/lanes.ts`，源映射来自 `docs/migration/api-center-openapi-audit.json`。

旧站源仓库 `shengwang-doc-source`，版本 `847cc38783ea50223bc2e5007fc4f4a5597c7ad8`；本次核对的 14 个 YAML 源文件无未提交改动。默认值策略另外对照该仓库 `src/components/restful/OpenapiRender.tsx` 与 `src/components/restful/utils.ts`，不能用新站 sampler 的结果替代旧站预期。

请求的显式 Body 按结构化值比对；无显式 Body 的 16 个接口恢复旧站不采样 Body 的行为。Header 名称/鉴权按源声明核对，并用旧站实际页面抽查。代码静态解析，未调用业务 API。响应中 128 个原有显式场景与 47 个旧算法默认场景逐值匹配，8 个无 Body 状态保留说明；另有 19 个历史补充状态，见例外。

最终 SSR 核对未发现遗漏的旧源显式场景或未解释的样例值差异；435 份客户端代码解析后未发现缺失 Header 或 Body 差异。此结论限定于下表接口的请求/响应样例及已列出规则，不代表全站正文或每个接口的浏览器交互都逐页通过。

## 修复及原因

- 请求生成器只取部分参数且未读取鉴权声明，导致可选 Header 和 Authorization 消失；通过每页独立生成器上下文补齐，不改真实参数的 required。去重 Content-Type，按实际媒体类型显示一次。保留鉴权值中的引号和 URL 占位符。
- 中文请求无显式 Body 时停止制造示例；英文保留原有采样策略。明确编写的请求数据保持原值。云端转码 3 个场景中被改写的 31 个占位符字符串恢复旧源。
- 将旧站响应默认算法的 47 个场景固定为 36 处共享 media.examples（46 个接口/状态组），防止更换采样器改写字段和值；media-push get 保留两场景切换。
- media-pull 的 region 四项列表、uid 两项注意事项和 UID 上标恢复；media-gateway 同类上标恢复。Proto 代码被误标为 JSON，改回 proto，并复用共享 DocsCodeBlock。
- Converter 场景切换补偿发起交互的页签视口位置；数组标签显示元素类型，例如 `array<number>`。alpha 的 format: float 在旧 YAML 中已经存在，保留该源信息。
- HTML API 参数说明仍有 ul/ol 节点，但 not-prose 容器让项目符号消失；ParameterDescription 显式恢复无序/有序列表标记和缩进。
- Doxygen 邮箱防爬隐藏节点被当作正文，产生 .nosp@m.；转换器移除相应隐藏片段，从可见邮箱重建 mailto，不执行 onclick。修正 RTSA C 和 RTC Server C++ 的 3 页共 6 处，并同步生成归属哈希。

## 保留的历史差异

下列 15 个错误响应示例与 4 个 VoIP 错误 Body 结构在本轮之前就已加入，旧源未提供对应样例/结构。本轮保留，不能把它们计为旧站逐字一致。状态码键归一（例如 200 → 2XX、非 200 → default）按对应响应映射比对；不据键名不同删除内容。Content-Type 使用实际 application/json，而不是旧生成代码的泛型 `<string>` 占位符。

| 接口 | 状态 | 保留补充 |
| --- | --- | --- |
| `/api-reference/api-ref/cloud-recording/acquire` | `非 200` | 错误示例 `authentication-error` |
| `/api-reference/api-ref/cloud-recording/start` | `非 200` | 错误示例 `authentication-error` |
| `/api-reference/api-ref/cloud-recording/update` | `非 200` | 错误示例 `authentication-error` |
| `/api-reference/api-ref/cloud-recording/update-layout` | `非 200` | 错误示例 `authentication-error` |
| `/api-reference/api-ref/cloud-recording/query` | `非 200` | 错误示例 `authentication-error` |
| `/api-reference/api-ref/cloud-recording/stop` | `非 200` | 错误示例 `authentication-error` |
| `/api-reference/api-ref/rtc/create-ban-rule` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/get-ban-rule-list` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/update-ban-expiration` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/delete-ban-rule` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/query-user-status` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/query-user-list` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/query-host-list` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/query-channel-list` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/rtc/query-ip-address` | `非 200` | 错误示例 `invalid-app-id` |
| `/api-reference/api-ref/voip-callkit/activate-license` | `非 200` | VoIP message 错误结构 |
| `/api-reference/api-ref/voip-callkit/list-expiring-licenses` | `非 200` | VoIP message 错误结构 |
| `/api-reference/api-ref/voip-callkit/renew-license` | `非 200` | VoIP message 错误结构 |
| `/api-reference/api-ref/voip-callkit/list-license-renewals` | `非 200` | VoIP message 错误结构 |

## 逐接口结果

请求数为场景数，每场景核对 3 种客户端。响应数包括无 Body 状态。通过表示旧源显式值/旧算法默认值及请求 Header/Body 检查通过；“保留补充”明确标记上述例外。

| Lane | 页面 | 请求场景 | 响应状态/场景 | 结果 |
| --- | --- | ---: | ---: | --- |
| `convoai` | `/api-reference/api-ref/conversational-ai/join` | 4 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/leave` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/update` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/query` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/list` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/speak` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/interrupt` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/think` | 1 | 1 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/history` | 1 | 2 | 通过 |
| `convoai` | `/api-reference/api-ref/conversational-ai/turns` | 1 | 1 | 通过 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/acquire` | 2 | 2 | 通过；保留补充 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/start` | 7 | 2 | 通过；保留补充 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/update` | 3 | 2 | 通过；保留补充 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/update-layout` | 1 | 2 | 通过；保留补充 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/query` | 1 | 2 | 通过；保留补充 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/stop` | 1 | 2 | 通过；保留补充 |
| `cloud-recording-rest` | `/api-reference/api-ref/cloud-recording/get-ncs-ip` | 1 | 1 | 通过 |
| `speech-to-text-rest` | `/api-reference/api-ref/speech-to-text/join` | 1 | 2 | 通过 |
| `speech-to-text-rest` | `/api-reference/api-ref/speech-to-text/query` | 1 | 2 | 通过 |
| `speech-to-text-rest` | `/api-reference/api-ref/speech-to-text/leave` | 1 | 2 | 通过 |
| `speech-to-text-rest` | `/api-reference/api-ref/speech-to-text/update` | 1 | 2 | 通过 |
| `speech-to-text-rest` | `/api-reference/api-ref/speech-to-text/list` | 1 | 2 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/call-list` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/call-sessions` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/call-metrics` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/call-statistics` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/call-freeze-bucket` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/call-statistics-time` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/insight-usage-time` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/insight-quality-time` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/insight-usage-aggregation` | 3 | 3 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/insight-quality-aggregation` | 3 | 3 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/realtime-usage` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/realtime-quality` | 1 | 3 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/realtime-usage-top20` | 1 | 1 | 通过 |
| `agora-analytics-rest` | `/api-reference/api-ref/agora-analytics/realtime-quality-top20` | 1 | 1 | 通过 |
| `console-rest` | `/api-reference/api-ref/console/create-project` | 1 | 2 | 通过 |
| `console-rest` | `/api-reference/api-ref/console/get-project` | 1 | 2 | 通过 |
| `console-rest` | `/api-reference/api-ref/console/list-projects` | 1 | 2 | 通过 |
| `console-rest` | `/api-reference/api-ref/console/update-project-status` | 1 | 2 | 通过 |
| `console-rest` | `/api-reference/api-ref/console/update-primary-app-certificate` | 1 | 2 | 通过 |
| `console-rest` | `/api-reference/api-ref/console/reset-primary-app-certificate` | 1 | 2 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/generate-sdk-token` | 1 | 1 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/generate-task-token` | 1 | 1 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/start-conversion` | 1 | 2 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/list-pending-tasks` | 1 | 1 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/query-task` | 1 | 1 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/cancel-task` | 1 | 1 | 通过 |
| `ppt-conversion-rest` | `/api-reference/api-ref/ppt-conversion-service/set-task-priority` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/get-cloud-game-list` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/get-cloud-game-detail` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/start-cloud-game` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/stop-cloud-game` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/get-cloud-game-status` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/renew-cloud-game-token` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/push-message` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/start-pc-game` | 1 | 1 | 通过 |
| `danmaku-rest` | `/api-reference/api-ref/danmaku/stop-pc-game` | 1 | 1 | 通过 |
| `media-pull-rest` | `/api-reference/api-ref/media-pull/create` | 1 | 2 | 通过 |
| `media-pull-rest` | `/api-reference/api-ref/media-pull/update` | 1 | 2 | 通过 |
| `media-pull-rest` | `/api-reference/api-ref/media-pull/list` | 1 | 2 | 通过 |
| `media-pull-rest` | `/api-reference/api-ref/media-pull/delete` | 1 | 2 | 通过 |
| `media-pull-rest` | `/api-reference/api-ref/media-pull/get-ncs-ip` | 1 | 1 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/create` | 1 | 2 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/delete` | 1 | 2 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/update` | 1 | 2 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/get` | 1 | 3 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/list` | 1 | 2 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/list-by-channel` | 1 | 2 | 通过 |
| `media-push-rest` | `/api-reference/api-ref/media-push/get-ncs-ip` | 1 | 1 | 通过 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/create-ban-rule` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/get-ban-rule-list` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/update-ban-expiration` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/delete-ban-rule` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/query-user-status` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/query-user-list` | 1 | 3 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/query-host-list` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/query-channel-list` | 1 | 2 | 通过；保留补充 |
| `rtc-rest-zh-cn` | `/api-reference/api-ref/rtc/query-ip-address` | 1 | 2 | 通过；保留补充 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/acquire` | 1 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/create` | 3 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/query` | 1 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/update` | 1 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/destroy` | 1 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/template-create` | 1 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/template-query` | 1 | 2 | 通过 |
| `cloud-transcoding-rest-zh-cn` | `/api-reference/api-ref/cloud-transcoding/ncs-query-ip` | 1 | 1 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/create-streaming-key` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/list-streaming-keys` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/query-streaming-key` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/update-streaming-key` | 2 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/delete-streaming-key` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/create-reset-template` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/update-template` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/delete-template` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/set-global-template` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/query-streaming-list` | 1 | 3 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/query-streaming-information` | 1 | 3 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/force-disconnection` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/mute-streaming` | 1 | 2 | 通过 |
| `media-gateway-rest-zh-cn` | `/api-reference/api-ref/rtmp-gateway/query-ip-address` | 1 | 1 | 通过 |
| `voip-callkit-rest` | `/api-reference/api-ref/voip-callkit/call-mini-app` | 1 | 2 | 通过 |
| `voip-callkit-rest` | `/api-reference/api-ref/voip-callkit/hangup-mini-app` | 1 | 2 | 通过 |
| `voip-callkit-rest` | `/api-reference/api-ref/voip-callkit/activate-license` | 1 | 2 | 通过；保留补充 |
| `voip-callkit-rest` | `/api-reference/api-ref/voip-callkit/list-expiring-licenses` | 1 | 2 | 通过；保留补充 |
| `voip-callkit-rest` | `/api-reference/api-ref/voip-callkit/renew-license` | 1 | 2 | 通过；保留补充 |
| `voip-callkit-rest` | `/api-reference/api-ref/voip-callkit/list-license-renewals` | 1 | 2 | 通过；保留补充 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/generate-sdk-token` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/generate-room-token` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/generate-task-token` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/create-room` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/list-rooms` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/get-room` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/ban-room` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/list-scene-paths` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/insert-scenes` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/switch-scene` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/screenshot-scene` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/screenshot-scene-list` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/start-file-conversion` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/list-file-conversion-tasks` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/get-file-conversion-task` | 1 | 3 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/cancel-file-conversion-task` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/set-file-conversion-task-priority` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/start-legacy-file-conversion` | 1 | 1 | 通过 |
| `whiteboard-rest` | `/api-reference/api-ref/whiteboard/restful/get-legacy-file-conversion-task` | 1 | 1 | 通过 |

## 来源快照

源 SHA-256 对应上述旧仓库版本；目标 SHA-256 对应本报告完成时的维护 YAML，便于后续修改时重新核验。

| Lane / 源路径 | 旧源 SHA-256 | 目标 SHA-256 |
| --- | --- | --- |
| `convoai` / `html-docs/convoai/RESTful/convoai.yaml` | `752d5fe6d19563043238149b5a9b6838712aefd2b05d8b8863b165aa64ad2ebe` | `da01069817a169a060ce82b019eea345106a6514628c01d957ec5e45bd29687c` |
| `cloud-recording-rest` / `html-docs/cloud-recording/cloud-recording.yaml` | `b9dcd25351e5aea412fed4f6b0af5d20352eccc83c9c635296731454393d18ab` | `664d7bcec8a2eea88d65d71b2acbed1010984b1a85406225585ee686279791bf` |
| `speech-to-text-rest` / `html-docs/speech-to-text/RESTful/v7.yaml` | `ac163870b1aeed078d2b72e4e5046af26973127b4b88a9117b4fb21e605123d5` | `3c89f551235354ecd3d396b014db67141e0a97d5fe4bce5d023f0d9af5251186` |
| `agora-analytics-rest` / `html-docs/analytics/RESTful/restful-aa.yaml` | `ae7642e77b1d98d34b50c624ec4d163773790f8679db968f68300c1a8a40faa3` | `dae6221a035bf60ff4a08ce34ccf7908af20f309a6872fde95189c60364c1233` |
| `console-rest` / `html-docs/console/RESTful/console.yaml` | `dd4cc51c0ea200a27b3e03ef28444f58638208f9ba132737134f3112637f3b7c` | `ae1481b07c903b6b45a20bae61352923330a93ce637eebf54828ad637f9e5f92` |
| `ppt-conversion-rest` / `html-docs/conversion-ppt/RESTful/restful-ppt.yaml` | `be2522d9f7c17a342d415074e460e3415c1a4cc781cf61e5d6f43652ad618597` | `42208228198a8f1e8104d220f986b6002dd22bf4d1d3b96907cb7283ade8d480` |
| `danmaku-rest` / `html-docs/danmaku/RESTful/danmaku.yaml` | `985b7609553c9888a7ac188312941eb5f0ec4056ddba14880c965f7ad6d7b446` | `ffd5e87eb8782c45d796c7c58050d7816206da3584f0fa12f547ae46d0061301` |
| `media-pull-rest` / `html-docs/media-pull/restful/media-pull.yaml` | `241fa5816b030285431471a58b75a248b262dbd9d20f738a4ae102c07fd4d0a4` | `1d4f2ef63d69b4c9faac2edf229dbc0306d4e297dbc7a51a560cd2d33b46d7fc` |
| `media-push-rest` / `html-docs/media-push/restful/media-push.yaml` | `1b7698cd272c8e3c1b165940ad2ca3ecbcd91adfd2799429e01918d1d55b3b82` | `403bc8689fe2777916d0a7accdf741336873f8d22de20fe676978e9e7881eece` |
| `rtc-rest-zh-cn` / `html-docs/rtc/restful/channel-management.yaml` | `a4f6fd966fbfc1c73513f086fbc8d33c208d08c62e771582186579e39f792a21` | `a17f5d2a00dd3678bea29d9228a01bdf87e129bdcb215f035a4f5f31814bfbd9` |
| `cloud-transcoding-rest-zh-cn` / `html-docs/cloud-transcoder/RESTful/cloud-transcoder.yaml` | `0d06dfe81185f78dd27e8a87e360fb0d976c2a7b19587c5eb63083d354ce6ba8` | `ca51dad73178bbb238be50df76eb621c95f88fd0721f74ed6565b9e160b0cecd` |
| `media-gateway-rest-zh-cn` / `html-docs/rtmp-gateway/restful/rtmp-gateway.yaml` | `5abcd9de39317b45a9ea64598bd041d667fee591759cf8675b8c3056f1dd7d3f` | `7953882a11cd4e35d2aa2c13ec363e14b905857fa7087cfa8b5229a8eb4f8e75` |
| `voip-callkit-rest` / `html-docs/voip-callkit/call.yaml` | `7158a5b3a98d3d582867c602ea12312b8b96f2bd10a0d0e8f9b85c719cf61431` | `747b92125a78cf7ac399a24c9c01d2b9fa8a88429e8fbab90506ec57c2b43bca` |
| `whiteboard-rest` / `html-docs/whiteboard/RESTful/restful-wb.yaml` | `ae8357455832d7e94dcfb3515965baf78f60184afadbf4ce7791b52c27ec6566` | `fbb634ccc8a8977425afc67976b9632ed8c9e513ff6edc681465dc676c1bfdc8` |

## 验证与限制

- `bun run test --maxWorkers=4 --testTimeout=30000`：337 个测试文件通过、1 个跳过；5532 项测试通过、6 项跳过。
- `bun run openapi:sync`、`bun run types:check`、改动代码的 Biome 检查、`git diff --check` 通过。
- 实际 Fumadocs 组件 SSR 遍历 126 接口；临时客户端渲染测试采集 435 份代码，分别用 shlex、Python AST、JavaScript AST 解析，未执行示例请求。Header 名称从源独立收集；预期 Header 值复用上下文解析器，故还用旧站实时 media-pull 示例抽查，不把此项称为独立全量 Header 值 oracle。
- 浏览器抽查：media-pull 鉴权/Header、四项 region 列表、uid 注意事项和上标、Proto 共用代码框；Converter 场景双向切换在 975 px 下页签位移 0 px；数组元素类型；邮箱 mailto；RTSA 参数列表显示 disc、20 px 缩进。
- 旧站线上 media-pull 页面已展开代码并提取证据；未声称对 126 个旧站线上页面逐页截图比对。
- PPT info.description 的历史概述改写属于概览组织，未纳入本次接口示例修复；不把它误判为已恢复全文。
- 原始 JSON、脚本、渲染样本与基线保存在忽略的 `.agent/rest-parity/`；截图保存在忽略的 `.agent/artifacts/rest-parity/`。报告记录覆盖及结论，不提交原始临时 QA 载荷。
