# zh-CN 实时与媒体、解决方案 IA 调整发现

## 已确认范围

本轮需要处理 50 个产品目录：实时与媒体 19 个，解决方案 31 个。`realtime-media/rtc` 与 `realtime-media/rtm` 已在本分支完成重点调整，后续仍需纳入最终断链验证和报告。

## 已完成重点产品

### `realtime-media/rtm`

- 问题：连接、登录、事件监听分散在不同任务组，用户从开通服务到登录、监听状态的路径不连续；发版说明原先不在产品概览后的首篇；部分代码/表格按语言或场景摊开，不利于扫描。
- 调整：把连接基础、连接状态、添加事件监听移动到 `build/setup-and-access`；按“开通/配置 -> 登录/连接 -> 频道 -> 消息 -> Topic -> Presence/Metadata -> 安全”组织 build；把多语言代码和多场景表格改为 tab。
- 链接：已将指向旧 RTM 路径的源文档链接更新到新路径。
- 验证：RTM scoped absolute/relative link check、`bun run types:check` 已通过。

### `realtime-media/rtc`

- 问题：核心初始化、频道连接、音视频能力、进阶频道、安全接入、质量运维混杂在历史分组中；用户需要先完成开通、Token、防火墙、调用 API，再进入初始化、发流订阅和音视频能力。
- 调整：创建 `initialize-and-channel`、`advanced-channel`，把设备/Track/入离频道/发布订阅归到初始化与频道，把多频道/媒体流转发/频道加密等归到进阶频道；把 Token、HTTP Basic Auth、防火墙、Token Server 升级前置到 `setup-and-access`；把质量、自动播放、预加载、包体积、REST 可用性、Webhook 归到 `optimize-and-operate`。
- 链接：已将指向旧 RTC 路径的源文档链接更新到新路径，并修复若干历史旧路径。未新增 redirect。
- 验证：RTC scoped absolute/relative link check、`bun run types:check`、`git diff --check` 已通过；本地预览抽检新 URL 可渲染。

## 全局观察

- 许多产品已经有 `setup-and-access`、`implement-core-features`、`optimize-and-operate` 等任务型 build 分组，但顺序和 release notes/reference 排序需要逐一确认。
- 解决方案目录通常更像集成方案，`get-started` 应优先承载方案理解和最小集成，`build` 应先核心集成再定制扩展，`reference` 才放计费、API、平台、发版说明等查阅内容。
- 只要移动源文件，就必须同步扫描 `content/docs` 中的旧路径引用，避免源文档中残留旧链接。

## 本轮逐产品 IA 审查与调整摘要

| 产品目录 | 当前 IA 问题 | 调整原则与结果 | 内部链接处理 |
| --- | --- | --- | --- |
| `realtime-media/danmaku` | 参考区把计费放在错误码、限制、Base URL 前，查接口路径不顺。 | `reference` 调整为 Base URL -> 响应码 -> API 限制 -> 下载 -> 计费。 | 修正 API reference 中旧的开通、认证、API 限制、响应码链接。 |
| `realtime-media/fusion-cdn` | 参考区计费早于 API/错误码。 | `reference` 调整为 API 参考 -> 响应码 -> NCS 事件 -> 配额 -> 计费。 | 未移动页面，无新增路径链接。 |
| `realtime-media/marketplace` | `build` 先讲创建插件再讲集成插件，不符合多数使用者先消费插件的任务路径；API 参考分散在概念之后。 | `build` 调整为集成插件 -> 创建插件；`reference` API 前置。 | 未移动页面，无新增路径链接。 |
| `realtime-media/media-pull` | 参考区计费早于错误码、事件、参数限制。 | `reference` 调整为响应码 -> NCS 事件 -> 视频规格 -> 配额 -> 计费。 | 未移动页面，无新增路径链接。 |
| `realtime-media/media-push` | 同拉流，参考区查错/查参数路径被计费打断。 | `reference` 调整为响应码 -> NCS 事件 -> 视频规格 -> 配额 -> 计费。 | 未移动页面，无新增路径链接。 |
| `realtime-media/recording/cloud-recording` | 参考区概念和计费早于 API、错误码和事件。 | `reference` 调整为 API -> 响应码 -> NCS 事件 -> 配额 -> 计费 -> 概念。 | 未移动页面，无新增路径链接。 |
| `realtime-media/recording/local-server-recording` | 生命周期/下载与计费顺序不清。 | `reference` 调整为下载 -> 迁移 -> 停服 -> 计费。 | 修正术语表中本地录制模式旧路径。 |
| `realtime-media/rtc` | 频道、初始化、音视频、安全接入、质量运维混在历史分组中。 | 已完成源文档移动：开通/鉴权/防火墙前置，初始化与频道、音频、视频、进阶频道、扩展、质量运维、安全治理按任务路径排列。 | 已更新旧 RTC 入链，未新增 redirect。 |
| `realtime-media/rtc-server-sdk` | 参考区基本可用，但历史入链指向旧 get-started 开通页。 | 保留 build 顺序，reference 维持错误码/下载/平台；修正旧链接。 | API reference 旧开通/区域链接改到 `build/setup-and-access`。 |
| `realtime-media/rtm` | 登录连接、事件监听、消息和连接状态分散；多语言内容未成组。 | 已完成源文档移动到 setup-and-access，并按接入 -> 频道 -> 消息 -> Topic -> Presence/Metadata -> 安全 -> 排障排列。 | 已批量更新 RTM user-guide 旧路径和跨产品入链，未新增 redirect。 |
| `realtime-media/rtmp-gateway` | 主流程基本正确。 | 保留开通接入 -> 媒体流 -> 优化运维 -> 事件通知。 | OpenAPI 虚拟操作链接按现有规则过滤，无页面断链。 |
| `realtime-media/rtsa` | 参考区计费早于错误码/平台。 | `reference` 调整为错误码 -> 平台支持 -> 下载 -> 计费 -> 停服。 | 修正 AI 文档中 RTSA 计费旧路径。 |
| `realtime-media/sdk-extensions/metakit` | 参考区下载早于 API。 | `reference` 调整为 API -> 下载。 | 总览页 SDK 插件卡片改到可打开的 MetaKit 页面。 |
| `realtime-media/sdk-extensions/portrait-rhythm` | 结构简单，build 顺序符合 quick start -> key/value。 | 保持现状。 | 无链接变更。 |
| `realtime-media/speech-to-text` | `build` 中 Webhook 事件早于转写数据处理和扩展能力。 | `build` 调整为开始转写/翻译 -> 处理数据 -> 扩展优化 -> Webhook；`reference` 响应码/事件/语言/计费。 | 未移动页面，无新增路径链接。 |
| `realtime-media/transcoding` | 参考区计费早于错误码/事件/规格。 | `reference` 调整为响应码 -> NCS 事件 -> 视频规格 -> 配额 -> 计费。 | 未移动页面，无新增路径链接。 |
| `realtime-media/usage-analytics` | 参考区概念早于错误码和 API 限制。 | `reference` 调整为响应码 -> API 限制 -> 计费 -> 概念。 | 未移动页面，无新增路径链接。 |
| `realtime-media/whiteboard/fastboard-sdk` | 参考区计费早于错误码、平台、下载和迁移。 | `reference` 调整为响应码 -> 平台 -> 下载 -> PPT 转换 -> 迁移 -> 计费。 | 修正 API reference 中 Fastboard 旧路径。 |
| `realtime-media/whiteboard/whiteboard-sdk` | 同 Fastboard，参考区查阅路径不一致。 | `reference` 调整为响应码 -> 平台 -> 下载 -> PPT 转换 -> 迁移 -> 计费。 | 删除未被根导航引用且指向不存在页面的白板孤立 `reference/meta.json`。 |
| `solutions/art-class` | 单一集成型方案，主路径清晰。 | 保持快速开始 -> 开通 -> 定制扩展 -> 参考。 | 无链接变更。 |
| `solutions/breakout-classroom` | `build` 中最佳实践早于集成指南。 | 调整为方案介绍 -> 集成指引 -> 集成注意事项。 | 未移动页面，无新增路径链接。 |
| `solutions/chatroom/sdk` | reference 下载早于 API。 | `reference` 调整为 API -> IM API -> RTC API -> 下载 -> 方案对比。 | 未移动页面，无新增路径链接。 |
| `solutions/chatroom/uikit` | 结构简单，开通和核心功能顺序符合任务路径。 | 保持现状。 | 无链接变更。 |
| `solutions/digital-learning/course-delivery` | 单页集成方案，无复杂 IA。 | 保持概览 -> 集成。 | 无链接变更。 |
| `solutions/digital-learning/course-resource` | 单页集成方案，无复杂 IA。 | 保持概览 -> 集成。 | 无链接变更。 |
| `solutions/digital-learning/school-resource` | 单页集成方案，无复杂 IA。 | 保持概览 -> 集成。 | 无链接变更。 |
| `solutions/flexible-classroom` | reference 中 API/错误码被计费和下载前置打断。 | `reference` 调整为 Call API -> 响应码 -> 平台 -> 配额 -> 计费 -> 概念/架构/迁移 -> 下载。 | 修正 API reference 中生成 Token 和插件旧路径。 |
| `solutions/game-voice` | reference 下载/计费早于 API。 | `reference` 调整为 API -> 平台 -> 下载 -> 计费。 | 无页面移动。 |
| `solutions/iot-apaas` | reference REST API 不在最前；旧入链指向 get-started 开通。 | `reference` 调整为 RESTful -> 平台 -> 技术架构 -> 下载。 | 修正 API reference 中开通服务旧路径。 |
| `solutions/meeting` | reference 中配额、下载早于接口与事件。 | `reference` 调整为 Call API/创建房间/查询录制/Webhook -> 响应码 -> 平台 -> 配额 -> 下载。 | 修正 API reference 中开通和 Token 旧路径。 |
| `solutions/meta-world` | get-started/build 主路径基本清晰。 | 保持跑通示例 -> 集成 SDK -> 开通 -> 核心能力 -> 扩展。 | 无本轮路径变更。 |
| `solutions/multi-usecase/non-scenario-based` | demo -> 平台目录项顺序符合最小路径。 | 保持现状。 | 无链接变更。 |
| `solutions/multi-usecase/scenario-based` | 合唱早于 Demo/取歌/独唱，任务路径跳跃。 | 调整为 Demo -> 获取版权音乐 -> 独唱 -> 合唱 -> Android/iOS。 | 未移动页面，无新增路径链接。 |
| `solutions/multi-usecase/ui-solution` | 开通后进入核心功能，顺序清晰。 | 保持现状。 | 无链接变更。 |
| `solutions/one-to-one-classroom` | `build` 中最佳实践早于集成指南。 | 调整为方案介绍 -> 集成指引 -> 集成注意事项。 | 未移动页面，无新增路径链接。 |
| `solutions/one-to-one-live/custom-signaling` | reference 下载/平台早于 API。 | `reference` 调整为 Call API -> RTC API -> 平台 -> 计费 -> 下载 -> 方案对比。 | 无页面移动。 |
| `solutions/one-to-one-live/rtm` | 同 custom-signaling，API 查阅不够前置。 | `reference` 调整为 Call API -> RTC API -> 平台 -> 计费 -> 下载 -> 方案对比。 | 无页面移动。 |
| `solutions/online-ktv/auikaraoke` | reference API 被计费/下载前置。 | `reference` 调整为 AUIKit API -> 歌词 API -> 计费 -> 下载 -> 方案对比。 | 无页面移动。 |
| `solutions/online-ktv/ktv-scenario` | `build` 先讲扩展能力再讲实现方案；reference API 被计费/下载前置。 | `build` 调整为开通 -> 实现方案 -> 扩展能力；`reference` API 前置。 | 无页面移动。 |
| `solutions/online-ktv/online-ktv-sdk` | reference API 被计费/下载前置。 | `reference` 调整为歌词 API/曲库/RTC API -> 计费 -> 下载 -> 方案对比。 | 无页面移动。 |
| `solutions/online-music-class` | 单一路径清晰。 | 保持快速开始 -> 开通 -> 鱼眼能力 -> 参考。 | 无链接变更。 |
| `solutions/ppt-transcoding` | reference 中计费早于 API/响应码；响应码页有旧短链 `cancel-task`。 | `reference` 调整为 Slide API -> 转换效果 -> 响应码 -> 计费；短链改为真实 REST API 操作链接。 | 修正 `cancel-task` 断链。 |
| `solutions/showroom` | reference 下载早于 API。 | `reference` 调整为 API -> 下载。 | 无页面移动。 |
| `solutions/small-classroom` | `build` 中最佳实践早于集成指南。 | 调整为方案介绍 -> 集成指引 -> 集成注意事项。 | 未移动页面，无新增路径链接。 |
| `solutions/smart-camera` | reference API 后的高级能力和下载顺序不一致。 | `reference` 调整为 API 概览 -> 高级功能 -> 下载。 | 无页面移动。 |
| `solutions/smart-doorbell` | reference API 后的高级能力和下载顺序不一致。 | `reference` 调整为 API 概览 -> 高级功能 -> 下载。 | 无页面移动。 |
| `solutions/smart-watch` | reference 下载早于平台。 | `reference` 调整为 API 概览 -> 平台支持 -> 下载。 | 无页面移动。 |
| `solutions/status-page` | 单页功能指南和发版说明，结构足够简单。 | 保持现状。 | 无链接变更。 |
| `solutions/teleoperation` | reference 下载早于设备/操作者接口。 | `reference` 调整为设备端 -> 操作者端 -> 下载。 | 无页面移动。 |
| `solutions/voip-call` | build 按接入 -> 定制输入输出 -> Webhook，路径清晰。 | 保持现状。 | 修正 API reference 中 license 和 set-source-sink 旧路径。 |

## 验证结果

- `meta.json` 导航引用检查：通过。
- zh-CN 实时与媒体、解决方案相对内部链接检查：通过；按仓库现有规则过滤 OpenAPI `operations/` 虚拟路由和静态资源。
- 全站指向 `/zh-CN/realtime-media/**`、`/zh-CN/solutions/**` 的绝对内部链接检查：通过。
- `bun run types:check`：通过。
- `git diff --check`：通过。
- `src/lib/zh-cn-product-ia-redirects.ts`：无 diff，本轮未新增 redirect。

## 标题信息气味审查

### 检查范围

已检查 `content/docs/zh-CN/realtime-media` 与 `content/docs/zh-CN/solutions` 下 759 个 MDX 页面标题。产品目录清单沿用本文件上方 IA 审查的 50 个产品目录，并额外覆盖范围内的聚合页和 overview 页。

### 审查原则

- 标题优先表达用户任务，而不是内部目录名或泛化功能名。
- 对 `get-started` 和 `build` 中的页面，优先使用“动作 + 对象/场景”，例如“开通 RTM 服务”“快速集成 KTV API”。
- 对 `reference` 中的页面，保留“计费说明”“错误码”“平台支持”“下载”等强约定查阅标题；只修改“参考信息”“客户端 API”“服务端 API”等对象不清的标题。
- 只改标题和指向这些页面的链接文字，不移动页面，不新增 redirect。

### 逐产品标题问题与调整

| 产品目录 | 当前标题问题 | 为什么影响用户心智 | 调整结果 |
| --- | --- | --- | --- |
| `realtime-media/danmaku` | “开通服务”缺少产品对象。 | 用户从其他产品跳转时无法判断开通的是哪项服务。 | 改为“开通弹幕服务”。 |
| `realtime-media/fusion-cdn` | “开通服务”“参考信息”过泛。 | `reference` 中“参考信息”无法说明用户要查参数还是概念。 | 改为“开通融合 CDN 服务”“融合 CDN API 参数参考”。 |
| `realtime-media/marketplace` | 多个插件页标题为“使用说明”，API 页标题为“API 参考”。 | “使用说明”没有动作，不如“集成插件”能提示用户任务。 | 改为“集成 xx 插件/服务”“智能会议纪要 API 参考”。 |
| `realtime-media/media-pull` | “如何调用 API”“开通服务”缺少产品对象。 | 拉流、推流、转码等服务都有同名页，标题不可区分。 | 改为“调用拉流 RESTful API”“开通拉流服务”。 |
| `realtime-media/media-push` | “如何调用 API”缺少产品对象。 | 同名 API 调用页难以扫读。 | 改为“调用推流 RESTful API”。 |
| `realtime-media/recording/cloud-recording` | “开通服务”“参考信息”过泛。 | 云端录制参考页实际讲存储参数，原标题信息气味弱。 | 改为“开通云端录制服务”“云端录制存储参数参考”。 |
| `realtime-media/recording/local-server-recording` | “开通服务”缺少产品对象。 | 不能直接说明开通对象。 | 改为“开通本地服务端录制服务”。 |
| `realtime-media/rtc` | “如何调用 API”“开通服务”缺少产品对象。 | RTC build 中同名通用标题不利于定位接入任务。 | 改为“调用 RTC RESTful API”“开通 RTC 服务”。 |
| `realtime-media/rtc-server-sdk` | “跑通示例项目”缺少 SDK 对象。 | 用户无法从导航判断示例属于 RTC 服务端 SDK。 | 改为“跑通 RTC 服务端 SDK 示例项目”。 |
| `realtime-media/rtm` | “开通服务”缺少产品对象。 | 与其他产品接入页同名。 | 改为“开通 RTM 服务”。 |
| `realtime-media/rtmp-gateway` | “如何调用 API”缺少产品对象。 | API 调用任务不够可区分。 | 改为“调用 RTMP 网关 RESTful API”。 |
| `realtime-media/rtsa` | “跑通基于 C API 的 Linux 示例项目”语序偏实现细节。 | 当前浏览器页是 RTSA 快速开始，标题应先说产品和目标。 | 改为“跑通 RTSA C API Linux 示例项目”。 |
| `realtime-media/transcoding` | “如何调用 API”“开通服务”缺少产品对象。 | 同名页影响扫读和交叉引用。 | 改为“调用转码 RESTful API”“开通转码服务”。 |
| `realtime-media/whiteboard/fastboard-sdk` | “如何调用 API”缺少 SDK 对象。 | Fastboard 与白板 SDK 都有 RESTful API 调用页。 | 改为“调用 Fastboard RESTful API”。 |
| `realtime-media/whiteboard/whiteboard-sdk` | “如何调用 API”缺少产品对象。 | 与 Fastboard 同名，导航区分度不足。 | 改为“调用互动白板 RESTful API”。 |
| `solutions/art-class` | “集成指引”“开通服务”过泛。 | 方案页应让用户知道是在看在线美术课堂路径。 | 改为“查看在线美术课堂集成路径”“开通在线美术课堂服务”。 |
| `solutions/breakout-classroom` | “方案介绍”“集成指引”泛化。 | 方案型产品需要标题说明架构或集成对象。 | 改为“了解超级小班课方案架构”“集成超级小班课 PaaS 方案”。 |
| `solutions/chatroom/sdk` | “开通服务”“客户端 API”缺少方案对象。 | SDK、UIKit、RTC/IM API 容易混淆。 | 改为“开通语聊房 SDK 相关服务”“语聊房客户端 API”。 |
| `solutions/chatroom/uikit` | “跑通示例项目”“开通服务”缺少 UIKit 对象。 | 不能区分 SDK 方案与 UIKit 方案。 | 改为“跑通语聊房 UIKit 示例项目”“开通语聊房 UIKit 相关服务”。 |
| `solutions/digital-learning/course-delivery` | “集成指引”过泛。 | 无法体现专递课堂场景。 | 改为“查看专递课堂集成路径”。 |
| `solutions/digital-learning/course-resource` | “集成指引”过泛。 | 无法体现名师课堂场景。 | 改为“查看名师课堂集成路径”。 |
| `solutions/digital-learning/school-resource` | “集成指引”过泛。 | 无法体现名校网络课堂场景。 | 改为“查看名校网络课堂集成路径”。 |
| `solutions/flexible-classroom` | “跑通示例项目”“如何调用 API”缺少产品对象。 | 灵动课堂有多个接入和 API 查阅任务，需要标题区分。 | 改为“跑通灵动课堂示例项目”“调用灵动课堂 RESTful API”等。 |
| `solutions/game-voice` | “开通服务”“客户端 API”缺少产品对象。 | 不能说明 API 属于游戏语音。 | 改为“开通游戏语音服务”“游戏语音客户端 API”。 |
| `solutions/meeting` | “开通服务”“如何调用 API”缺少产品对象。 | 与灵动课堂 API 调用页同构，需区分。 | 改为“开通灵动会议服务”“调用灵动会议 RESTful API”。 |
| `solutions/meta-world` | “Demo 体验”“集成 SDK”“跑通示例项目”缺少对象。 | 用户无法判断 Demo、SDK、示例都属于 MetaWorld。 | 改为“体验 MetaWorld 示例场景”“集成 Meta SDK”“跑通 MetaWorld 示例项目”。 |
| `solutions/multi-usecase/non-scenario-based` | “Demo 体验”“Android 目录项”“iOS 目录项”是内部目录口吻。 | 标题暴露迁移占位，不像用户任务。 | 改为“了解非场景化 K 歌 Demo”“跑通 Android/iOS 示例项目”。 |
| `solutions/multi-usecase/scenario-based` | 同上。 | 用户无法判断目录项对应什么任务。 | 改为“了解场景化 K 歌 Demo”“跑通 Android/iOS 示例项目”。 |
| `solutions/multi-usecase/ui-solution` | “方案概述”“Demo 体验”“目录项”过泛。 | 含 UI 方案需要突出 AUIKaraoke 和平台示例任务。 | 改为“了解 AUIKaraoke 方案”“了解含 UI K 歌 Demo”“跑通 AUIKaraoke/Android/iOS 示例项目”。 |
| `solutions/one-to-one-classroom` | “方案介绍”“集成指引”泛化。 | 无法说明是一对一课堂 PaaS。 | 改为“了解一对一课堂方案架构”“集成一对一课堂 PaaS 方案”。 |
| `solutions/one-to-one-live/custom-signaling` | “进阶集成指引”“跑通示例项目”缺少方案对象。 | 自定义信令和 RTM 信令并列，必须在标题区分。 | 改为“优化自定义信令方案集成逻辑”“跑通自定义信令示例项目”。 |
| `solutions/one-to-one-live/rtm` | 同上。 | 与自定义信令方案容易混淆。 | 改为“优化 RTM 信令方案集成逻辑”“跑通 RTM 信令示例项目”。 |
| `solutions/online-ktv/auikaraoke` | “快速实现”“方案介绍”“开通服务”缺少 AUIKit 对象。 | 在线 K 歌下有多个方案，标题必须区分方案。 | 改为“快速集成 AUIKit K 歌”“了解 AUIKit K 歌方案”“开通 AUIKit K 歌相关服务”。 |
| `solutions/online-ktv/ktv-scenario` | “快速实现”“服务端 API”泛化。 | 场景化方案里用户需要知道快速集成的是 KTV API，服务端 API 是版权音乐。 | 改为“快速集成 KTV API”“版权音乐服务端 API”。 |
| `solutions/online-ktv/online-ktv-sdk` | “快速实现”“服务端 API”泛化。 | SDK 方案和 KTV API 方案需要标题区分。 | 改为“快速集成在线 K 歌 SDK”“版权音乐服务端 API”。 |
| `solutions/online-music-class` | “集成指引”“开通服务”过泛。 | 方案页标题需要体现在线音乐课堂。 | 改为“查看在线音乐课堂集成路径”“开通在线音乐课堂服务”。 |
| `solutions/ppt-transcoding` | “开通服务”缺少服务对象。 | 与其他开通页同名。 | 改为“开通 PPT 转码服务”。 |
| `solutions/showroom` | “概述”“实现原理”“集成要点”“客户端 API”过泛。 | 深层功能页需要体现美颜、秒开秒切、秀场直播 RTC 等任务对象。 | 改为“了解秀场直播美颜能力”“了解秒开秒切实现原理”“集成秀场直播 RTC 能力”“秀场直播客户端 API”等。 |
| `solutions/small-classroom` | “方案介绍”“集成指引”泛化。 | 标题未体现小班课 PaaS。 | 改为“了解小班课方案架构”“集成小班课 PaaS 方案”。 |
| `solutions/smart-camera` | “开通服务”缺少对象。 | 无法区分智能设备方案。 | 改为“开通智能摄像头服务”。 |
| `solutions/smart-doorbell` | “开通服务”“智能门铃 aPaaS 方案介绍”标题动作弱。 | 用户需要判断是了解方案还是开通服务。 | 改为“开通智能门铃服务”“了解智能门铃 aPaaS 方案”。 |
| `solutions/smart-watch` | “开通服务”缺少对象。 | 与其他智能设备同名。 | 改为“开通智能手表服务”。 |
| `solutions/status-page` | “功能指南”过泛。 | 标题没有说明健康看板能帮用户完成什么任务。 | 改为“使用健康看板查看服务状态”。 |
| `solutions/teleoperation` | “开通服务”“跑通示例项目”缺少方案对象。 | 远程控制下设备端/操控端路径需要区分。 | 改为“开通远程控制服务”“跑通远程控制示例项目”。 |
| `solutions/voip-call` | “开通服务”缺少对象。 | 无法从链接文字判断开通的是 VoIP 通话。 | 改为“开通 VoIP 通话服务”。 |

### 标题验证结果

- 标题复扫：剩余命中均为可接受标题，例如“语聊房客户端 API”“版权音乐服务端 API”“了解秒开秒切实现原理”。
- 同步修改：指向已改标题页面的 Markdown 链接文字已同步更新。
- `meta.json` 导航引用检查：通过。
- zh-CN 实时与媒体、解决方案相对内部链接检查：通过。
- 全站指向 `/zh-CN/realtime-media/**`、`/zh-CN/solutions/**` 的绝对内部链接检查：通过。
- `bun run types:check`：通过。
- `git diff --check`：通过。
- `src/lib/zh-cn-product-ia-redirects.ts`：无 diff，本轮未新增 redirect。
