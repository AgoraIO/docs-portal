# 首页实时互动扩展能力入口设计

## 背景

中文文档站首页 `/zh-CN/introduction` 当前直接展示实时互动 RTC、实时消息 RTM、即时通讯 IM 和媒体流加速 RTSA 等核心产品，但没有完整承接实时互动扩展能力。用户从首页进入后，无法直接发现录制、媒体处理、内容安全、监控管理等相关文档。

本次调整在首页增加 17 个扩展能力入口。所有入口均从首页一键直达对应文档概览页，不增加中间聚合页。

## 目标

- 在首页完整呈现 17 项实时互动扩展能力。
- 通过任务分组降低用户在长列表中的查找成本。
- 保持现有核心实时互动产品入口的优先级和结构不变。
- 复用现有首页卡片组件和站内路由，不增加新的交互模式。

## 非目标

- 不修改 17 项能力各自的文档内容或侧边栏结构。
- 不创建新的扩展能力聚合页。
- 不调整英文首页。
- 不重命名现有 `Status Page` 文档目录；仅在首页使用“健康看板”作为入口名称。
- 不把“控制台”入口改为外部控制台地址；该入口指向站内控制台使用指南。

## 信息架构

在现有“开发实时互动应用”区块之后增加二级区块“实时互动扩展能力”。区块内按用户任务拆成四组，每组使用三级标题和独立卡片网格：

1. 互动与生态
2. 媒体处理与录制
3. 智能与安全
4. 监控与管理

首页整体顺序为：

1. 集成语音智能体
2. 开发实时互动应用
3. 实时互动扩展能力
4. 从 AI 工具开始
5. 接入场景化解决方案
6. 获取帮助

该顺序让首次接入用户先看到核心产品，再让已有明确扩展需求的用户立即找到相关能力，同时不打断后续 AI 工具、解决方案和支持资源入口。

## 入口、文案与图标

### 互动与生态

| 入口 | 描述 | 路径 | 现有图标 |
| --- | --- | --- | --- |
| 互动白板 | 多人实时协作、文档演示和白板互动能力。 | `/zh-CN/realtime-media/whiteboard` | `whiteboard` |
| 微呼叫 | 在微信小程序中快速集成音视频通话。 | `/zh-CN/solutions/voip-call` | `voice-calling` |
| 云市场 | 集成第三方音视频、AI 和美颜扩展能力。 | `/zh-CN/realtime-media/marketplace` | `tools` |
| RTC 服务端 SDK | 在服务端管理频道、用户和实时互动任务。 | `/zh-CN/realtime-media/rtc-server-sdk` | `server-sdk` |
| SDK 拓展插件 | 为实时互动 SDK 集成更多音视频处理插件。 | `/zh-CN/realtime-media/sdk-extensions` | `tools` |

### 媒体处理与录制

| 入口 | 描述 | 路径 | 现有图标 |
| --- | --- | --- | --- |
| 云端录制 | 将实时音视频和互动白板内容录制并保存到云端。 | `/zh-CN/realtime-media/cloud-recording` | `cloud-recording` |
| 本地服务端录制 | 在自有服务器部署录制服务，灵活控制录制流程。 | `/zh-CN/realtime-media/local-server-recording` | `on-premise-recording` |
| 旁路推流 | 将 RTC 频道内容转推到 CDN 或其他直播平台。 | `/zh-CN/realtime-media/media-push` | `media-push` |
| 输入在线媒体流 | 将在线音视频地址输入 RTC 频道。 | `/zh-CN/realtime-media/media-pull` | `media-pull` |
| 云端转码 | 对实时音视频进行合流、转码和布局处理。 | `/zh-CN/realtime-media/transcoding` | `transcoding` |
| RTMP 网关 | 通过 RTMP 推流和拉流接入实时互动频道。 | `/zh-CN/realtime-media/rtmp-gateway` | `rtmp-gateway` |
| PPT 转码服务 | 将 PPT、PPTX 等文件转换为可在互动场景中展示的内容。 | `/zh-CN/solutions/ppt-transcoding` | `whiteboard` |

### 智能与安全

| 入口 | 描述 | 路径 | 现有图标 |
| --- | --- | --- | --- |
| 实时转录翻译 | 将实时语音转换为文字，并提供实时翻译能力。 | `/zh-CN/realtime-media/speech-to-text` | `transcription` |
| 内容审核 | 识别和处理实时音视频中的违规内容。 | `/zh-CN/realtime-media/content-moderation` | `analytics` |

### 监控与管理

| 入口 | 描述 | 路径 | 现有图标 |
| --- | --- | --- | --- |
| 水晶球 | 查看实时互动项目的用量、质量和运营数据。 | `/zh-CN/realtime-media/usage-analytics` | `analytics` |
| 健康看板 | 查看声网服务运行状态、故障和维护信息。 | `/zh-CN/solutions/status-page` | `analytics` |
| 控制台 | 注册账号、创建项目、开通服务并管理开发参数。 | `/zh-CN/introduction/quickstart` | `tools` |

## 页面实现

仅修改 `content/docs/zh-CN/introduction/index.mdx`。

- 在现有“开发实时互动应用”的 `SolutionCardGrid` 后插入新二级标题和四个三级分组。
- 每个分组使用现有 `SolutionCardGrid`，设置 `size="small"`。
- 每张卡片使用现有 `SolutionCard`，设置 `size="small"`，并提供 `title`、`href`、`icon`、`tone` 和 `description`。
- 继续使用当前主题驱动的中性图标底色；不为分组增加新的颜色语义。
- 保留卡片描述和右上角箭头，使入口的用途和可点击性清晰可见。
- 网格沿用现有响应式布局，在窄屏上自动换行，不增加折叠、标签页或横向滚动。

本次不新增 React 组件或业务逻辑。现有组件已经支持所需的卡片尺寸、图标、描述和站内链接行为。

## 路由与异常处理

17 个入口全部使用仓库中已有的站内文档路径。链接点击后由现有 TanStack Router 和 Fumadocs 页面加载流程处理，本次不增加新的错误状态或回退逻辑。

如果后续某项能力迁移路径，应在同一次迁移中同步更新首页入口；本次不增加独立的路径注册表。

## 验证方案

### 内容与路由检查

- 核对首页恰好出现 17 张扩展能力卡片。
- 核对每张卡片的标题、描述和目标路径与本设计一致。
- 核对所有目标路径对应的文档概览页在内容目录中存在。
- 核对“健康看板”显示名称和 `Status Page` 目标文档的对应关系。
- 核对“控制台”进入站内使用指南，而非外部控制台。

### 自动验证

- 运行与文档概览 MDX 组件相关的现有测试。
- 运行 `bun run types:check`，确认 Fumadocs 内容生成和 TypeScript 检查通过。
- 如改动触发格式或静态检查问题，运行 `bun run lint`。

### 页面检查

- 在桌面宽度下确认四个分组顺序正确，卡片间距和高度一致。
- 在窄屏下确认卡片自动换行，标题和描述不溢出。
- 逐一点击 17 个入口，确认均可一键到达预期页面。

纯内容排列不新增单元测试。`SolutionCardGrid` 和 `SolutionCard` 的通用渲染行为继续由现有组件测试覆盖。

## 验收标准

- 用户能在 `/zh-CN/introduction` 直接看到全部 17 项扩展能力。
- 用户无需经过聚合页即可从首页打开任一能力的文档概览。
- 入口按四类任务组织，核心实时互动产品区块保持不变。
- 首页在桌面和窄屏布局下均可正常阅读和操作。
- 内容生成、类型检查和相关现有测试通过。
