# 英文页面摘要与正文一致性初轮排查

日期：2026-11-09。审查快照：`99883a156cfa207dffb480cd5c769a5dd7591771`，分支 `codex/media-push-pull-description`。

本轮基于仓库源文件确认另有 **10 个英文页面存在摘要主题、作用对象、接入方式或能力范围错配**。原先 Media Push/Pull 两页已经在 PR #1400 修正，不计入新增数。

以下排查记录保留审查快照中的原文和行号；用户确认后的修复与验证见文末。此次修复随 PR #1400 交付。用户随后明确仅保留英文范围；完整的英文导航逐页复核见 [后续报告](2026-11-09-navigation-description-audit.md)。

## 范围与方法

| 范围 | Markdown/MDX 文件数 | 非空 description 数 |
| --- | ---: | ---: |
| 英文 Realtime & Media | 463 | 460 |
| 英文 AI | 241 | 241 |
| 英文 API reference | 286 | 149 |
| 英文 Introduction | 26 | 25 |
| 合计 | **1016** | **875** |

- 使用 YAML 解析器读取全部 frontmatter，包含 `>` 折行摘要；逐域对照标题、摘要、正文导语和章节。
- 用跨主题重复摘要、产品名称、推拉流/导入导出/发送接收/加密解密等动作辅助筛查，对候选项回到具体正文、代码和同产品文档核实。
- 141 页没有可对照的非空摘要，不计为一致性通过。
- 范围是 `content/docs/en/**/*.{md,mdx}` 的内容一致性；未覆盖其他文件类型、OpenAPI 动态生成端点或外部 API 参考站点，未逐页验收线上部署与实际 API 行为。
- 自动筛查只能提供候选，以下确认项均补充了源文件证据；“本轮未发现”不表示对全部产品契约作了完整认证。

## 可按摘要修正的 9 个英文页面

以下位置均为对应文件第 3 行 `description`。每条建议只描述正文已经涵盖的主题，不新增服务能力。

### 1. Chat HTTP 状态码页误写成安全最佳实践

文件：[http-status-codes.md](../../../content/docs/en/api-reference/api-ref/im/http-status-codes.md)。

- 原摘要：`Describes the security best practices recommended by Agora Chat.`
- 依据：第 6 行明确本页描述 Chat RESTful API 的常见 HTTP 状态码；后续按 `200`、`4xx` 等说明错误及排查方法。
- 该摘要与 [Chat 安全最佳实践](../../../content/docs/en/realtime-media/im/reference/security-best-practice.md) 的摘要相同，是可复核的跨主题重复。
- 建议：`Understand common HTTP status codes returned by the Agora Chat RESTful API and how to troubleshoot errors.`

### 2. Chat 使用限制页误写成计费

文件：[limitations.md](../../../content/docs/en/api-reference/api-ref/im/limitations.md)。

- 原摘要：`Explains how your bill for using Agora Chat is calculated.`
- 依据：第 6 行介绍用户、消息、群组、聊天室和服务器 API 的使用限制；后续列举属性大小、消息大小及调用次数等。
- 该摘要与 [Chat 计费页](../../../content/docs/en/realtime-media/im/reference/pricing.md) 的摘要相同。
- 建议：`Review Agora Chat usage limits for users, messages, groups, chat rooms, and server-side API calls.`

### 3. 转写数据解析页误写成字幕加密

文件：[parse-data.mdx](../../../content/docs/en/realtime-media/speech-to-text/build/process-transcription-data/parse-data.mdx)。

- 原摘要：`Encrypt the captions transcribed with RTT`
- 依据：第 6 行介绍 Protobuf 序列化；“Understand the tech”明确本页解析 Protobuf/JSON 转写与翻译结果，并提取文本字段。
- 与同目录 [encrypt-captions.md](../../../content/docs/en/realtime-media/speech-to-text/build/process-transcription-data/encrypt-captions.md) 第 3 行的摘要相同，但两个页面主题不同。
- 建议：`Parse Protobuf and JSON transcription and translation data from Agora's Speech-to-Text service.`

### 4. 视频水印误写到音频轨道

文件：[watermark.mdx](../../../content/docs/en/realtime-media/rtc/build/apply-video-effects/watermark.mdx)。

- 原摘要：`Integrate the Watermark extension to display image watermarks on local and remote audio tracks.`
- 依据：第 8 行明确在视频流及本地、远端视频轨道添加图像水印。
- 建议：`Integrate the Watermark extension to display image watermarks on local and remote video tracks.`

### 5. Chat 与 Signaling 比较页误写成下载说明

文件：[comparison-chat-signalling.md](../../../content/docs/en/realtime-media/im/reference/comparison-chat-signalling.md)。

- 原摘要：`Links to the manual downloads for this product, and explanations on how to install them.`
- 依据：正文从业务需求说明如何选择 Chat 和 Signaling，后续按架构、产品定位及应用场景对比，没有介绍下载安装。
- 建议：`Compare Agora Chat and Signaling to choose the right service for your use case.`

### 6. 配置推送通知误写成配置翻译

文件：[configure-push-notifications.mdx](../../../content/docs/en/realtime-media/im/build/notifications-and-event-handling/offline-push/configure-push-notifications.mdx)。

- 原摘要：`Configure push translations`
- 依据：正文介绍推送扩展字段、强制推送和静默消息；翻译属于相邻的独立页面 [translate-push-notifications.mdx](../../../content/docs/en/realtime-media/im/build/notifications-and-event-handling/offline-push/translate-push-notifications.mdx)。
- 建议：`Configure custom push notification fields, force push, and silent messages in Agora Chat.`

### 7. 本地录制 SDK 迁移页误写成服务下线计划

文件：[migration-guide.mdx](../../../content/docs/en/realtime-media/on-premise-recording/reference/migration-guide.mdx)。

- 原摘要：`Sunset plans for Agora services.`
- 依据：标题为 `Migration from SDK 3.x`；第 10 行明确介绍 4.x 对比 3.x 的主要变化，后续包括功能、运行行为、API 与回调比较。
- 建议：`Understand the feature, API, and behavior changes when migrating from On-Premise Recording SDK 3.x to 4.x.`

### 8. 连接状态管理误写成网络测试与音视频调参

文件：[connection-status-management.mdx](../../../content/docs/en/realtime-media/rtc/build/manage-connection-and-quality/connection-status-management.mdx)。

- 原摘要：`Test network quality and adjust audio and video settings to optimize channel quality`
- 依据：第 8–10 行界定主题为频道连接状态、状态变化原因及处理方式；后续实现连接状态管理，解释重连和掉线排查，没有对应摘要所述的网络测试与音视频设置教程。
- 建议：`Monitor channel connection states, handle connection changes, and troubleshoot disconnections in the Agora RTC SDK.`

### 9. Chat Webhook 错写成客户端 SDK 管理能力

文件：[setup-webhooks.md](../../../content/docs/en/realtime-media/im/build/notifications-and-event-handling/setup-webhooks.md)。

- 原摘要：`Shows how to use the Agora Chat SDK to implement SetupWebhook management.`
- 依据：第 6 行说明 Chat 服务端向应用服务端发送 HTTP POST；“Configure callback rules”通过 Agora Console 配置回调规则，正文涵盖发送前、发送后回调。摘要错误地把接入主体和配置方式写成 Chat SDK。
- 建议：`Configure Agora Chat webhook rules in Agora Console and handle pre-delivery and post-delivery callbacks on your server.`

## 需要同时处理摘要和正文的英文页面

### 10. Platform 中断页承诺被当前内容契约标记为延期的能力

文件：[interrupt-agent.mdx](../../../content/docs/en/ai/platform/build/shape-the-conversation/interrupt-agent.mdx)。

- 第 3 行原摘要：`Choose how users can interrupt the agent by speaking, and interrupt it from your server.`
- 第 8–11 行仍称有两种中断方式，并说明服务端通过 REST API 手动中断。
- 同文件第 279 行的 `PLATFORM-DEFERRED` 说明 Interrupt API 延后于 Oct 29 Preview，服务端中断章节已移除，待对应能力发布后恢复。
- [Platform 总览](../../../content/docs/en/ai/platform/index.mdx)第 38 行也记载 Interrupt 延期；该中断页仍在 [导航](../../../content/docs/en/ai/platform/build/shape-the-conversation/meta.json)中。
- 按当前仓库契约，摘要建议：`Choose how users can interrupt the agent by speaking.`；正文开头也应移除或明确限制服务端中断承诺。
- **先核实当前产品状态。** 本轮确认的是仓库内的矛盾，没有验证服务端截至审查日期是否已经发布该能力。如果已经发布，应统一恢复支持说明与使用文档；若仍延期，则同步收窄摘要和正文。

## 附加风险，不计入上述确认数

- **Broadcast Streaming API 总览疑似整页内容归属错位。** [总览](../../../content/docs/en/api-reference/api-ref/broadcast-streaming/index.mdx)第 3 行摘要与第 6–8 行正文都讲 RTC Channel Management，后续使用 `/dev/v1/channel/`；同目录 [meta.json](../../../content/docs/en/api-reference/api-ref/broadcast-streaming/meta.json) 和 [entry-points.mdx](../../../content/docs/en/api-reference/api-ref/broadcast-streaming/entry-points.mdx) 却属于 Broadcast Streaming/Media Broadcast。需要核对迁移来源与正确产品归属，不能只修改摘要。
- **Platform 延期复制页的发布边界。** [地域限制](../../../content/docs/en/ai/platform/best-practices/regional-restrictions.mdx)与 [Gemini TTS](../../../content/docs/en/ai/platform/models/tts/gemini.mdx)等页的摘要和旧正文相符，但维护注释标记为未确认支持或延期。应结合导航、直达路由和搜索索引核对发布范围，本轮不据此宣称线上 API 支持或不支持。
- 泛化摘要、旧品牌称呼、英文页面含中文摘要、摘要缺失等为其他质量问题，本轮没有混入功能错配计数。

## 验证与交付边界

- 全量 frontmatter 用 PyYAML 成功解析，覆盖计数为 1016 文件、875 个非空摘要。
- 对确认问题核对了原摘要与正文行号；重复摘要问题另外对照了被复制主题的源文件。
- 上述排查阶段只审计源文件，没有运行应用测试、完整构建或对外服务调用；后续修复的验证结果见下节。
- 9 个英文页面可作独立的摘要纠正。Platform 中断页和整页产品归属问题需要更高层内容依据，避免仅改摘要掩盖正文矛盾。

## 修复与验证记录（2026-11-09）

用户确认后，已按上述建议修正全部 10 个英文页面。先前附带的中文文件修改已按最新范围要求撤回。

- 9 个英文页面仅变更 `description`，标题与正文逐字节保持不变。
- Platform 中断页移除了摘要和导语中的服务端手动中断承诺，改为说明语音中断；保留已有配置示例及延期维护说明。
- Platform 的处理依据是本仓库当前内容契约：[总览](../../../content/docs/en/ai/platform/index.mdx)中的延期说明，以及 [Platform OpenAPI](../../../content/openapi/conversational-ai/rest-api-platform.en.yaml) 的 `Interruption`、`StartOfSpeechInterruption`、`KeywordsInterruption`、`OffInterruption` schema。OpenAPI 提供语音触发中断配置，没有独立的服务端 Interrupt endpoint。本次不改变 API 支持范围，也不宣称已验证真实服务端的发布状态。
- Broadcast Streaming 整页归属及 Platform 延期复制页的发布边界保持为待核实项，不按摘要纠错直接重写整页。

验证结果：

- 英文精确替换检查通过：9 个文件仅改摘要；Platform 页除摘要与导语外的内容保持不变。
- `bun run types:check` 通过。
- `bun run test --reporter=json --outputFile=.agent/artifacts/description-fix-tests.json`：1971 项中 1957 通过、14 失败。
- 在 `git archive HEAD` 导出的未修改快照中复跑 11 个失败测试文件：127 通过、14 失败。失败的测试名称与修复后的完整测试结果逐项一致，没有新增失败。基线快照共享安装的依赖，但源码不包含本轮修复。
- `git diff --check` 通过。
- 使用本地开发服务器及浏览器抽查了 Chat HTTP 状态码页、Platform 中断页的可见摘要和 meta description；中断页不再显示旧的服务端手动中断承诺。截图保存在忽略目录 `.agent/artifacts/`。

未运行完整生产构建或对外服务行为验证。
