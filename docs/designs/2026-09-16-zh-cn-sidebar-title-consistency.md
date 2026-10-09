# 中文产品侧边栏分组命名一致性优化清单

## 范围

本清单只覆盖 `content/docs/zh-CN/**/build/**/meta.json` 中侧边栏分组的 `title`。

不修改 URL、目录名、文件名、正文标题或页面内容，也不调整分组层级和页面顺序。

## 命名规则

### 接入准备

用于 SDK、传输类产品的接入前置任务，例如开通服务、应用配置、授权和初始化。

### 开通与接入

用于云服务或方案类产品的服务开通、鉴权和 API 接入。已有同名分组较多，作为服务类产品的稳定命名。

### 最佳实践

用于跨场景的质量、可靠性、性能或运维保障内容。明确的单一功能实现、监控任务或产品专属能力不强行归入此类。

### 产品专属任务

当标题明确表达产品对象和用户任务时保留，例如“配置录制模式”“扩展白板能力”和“管理状态与属性”。

## 建议修改

以下项目属于高置信度修改，建议在下一步直接落地。

| 编号 | 产品 | 文件路径 | 当前标题 | 修改后标题 | 分类 | 修改理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | RTM | `content/docs/zh-CN/realtime-media/rtm/build/rtm-initialization/meta.json` | RTM 初始化 | 接入准备 | 接入前置 | 分组内容为开通 RTM 服务和应用设置，与 RTC 已有的“接入准备”语义一致。 |
| 2 | RTSA | `content/docs/zh-CN/realtime-media/rtsa/build/project-preparation/meta.json` | 项目准备与授权 | 接入准备 | 接入前置 | 分组内容为开通服务和授权，与 RTM 的接入前置任务同类。 |
| 3 | 云端录制 | `content/docs/zh-CN/realtime-media/cloud-recording/build/optimize-and-operate/meta.json` | 优化与运维 | 最佳实践 | 综合保障 | 分组包含集成检查、录制状态监控、REST 高可用和页面录制可靠性，属于横向保障实践。 |
| 4 | 旁路推流 | `content/docs/zh-CN/realtime-media/media-push/build/enable-media-push/meta.json` | 开通旁路推流 | 开通与接入 | 接入前置 | 分组内容为开通服务、HTTP 鉴权和调用 API，与其他云服务的“开通与接入”分组一致。 |
| 5 | 旁路推流 | `content/docs/zh-CN/realtime-media/media-push/build/monitor-and-maintain-media-push/meta.json` | 监控并保障推流 | 最佳实践 | 综合保障 | 分组包含 Webhook、集成检查、Converter 创建保障和 REST 高可用，属于综合运维保障实践。 |
| 6 | 对话式 AI | `content/docs/zh-CN/ai/build/harden-and-optimize/meta.json` | 性能优化 | 最佳实践 | 综合保障 | 分组包含音频设置、端到端延迟优化和区域访问限制，属于质量与运行保障实践。 |
| 7 | 实时转录翻译 | `content/docs/zh-CN/realtime-media/speech-to-text/build/extend-and-optimize/meta.json` | 扩展与优化 | 最佳实践 | 综合保障 | 分组包含音频模态、客户端开启和质量/成本优化，统一归入综合实践。 |
| 8 | 灵动课堂 | `content/docs/zh-CN/solutions/flexible-classroom/build/maintain-classroom-service/meta.json` | 保障课堂服务 | 最佳实践 | 综合保障 | 分组包含课堂服务高可用，统一使用跨产品的保障类命名。 |

## 明确保留

以下标题暂不修改，原因是当前标题已经能准确表达任务对象，或内容并非单纯的综合最佳实践。

| 产品 | 文件路径 | 当前标题 | 保留理由 |
| --- | --- | --- | --- |
| 水晶球 | `content/docs/zh-CN/realtime-media/usage-analytics/build/embed-and-maintain-data-service/meta.json` | 嵌入并保障数据服务 | 该分组同时承载水晶球嵌入和 REST 服务保障，保留“集成 + 保障”的任务语义。 |
| RTC | `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/meta.json` | 最佳实践 | 已是目标命名，可作为质量、可靠性和性能保障类分组的现有样例。 |
| 本地服务端录制 | `content/docs/zh-CN/realtime-media/local-server-recording/build/best-practices/meta.json` | 最佳实践 | 已是目标命名，无需调整。 |

## 不在本次范围内

- `content/docs/zh-CN/**/build/meta.json` 中统一的“开发与集成”入口不修改。
- 已经使用“接入准备”“开通与接入”或“最佳实践”的分组不修改。
- “接入美颜能力”“扩展白板能力”“扩展 K 歌能力”等产品专属能力标题不修改。
- 本次不重命名 `build` 下的目录，因此不会产生路径重定向或外部链接变更。

## 后续验证

落地修改后执行：

1. 校验所有变更后的 `meta.json` 为合法 JSON。
2. 检查 Git diff，确认只包含上述 `title` 修改。
3. 运行 `bun run types:check`，确认 Fumadocs 内容层和 TypeScript 检查通过。
