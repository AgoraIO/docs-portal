# 中文产品下载详情页核对

来源：`AgoraIO/shengwang-doc-source@150c49c2654cf1e17c2ea94f52757e1e09cbfecd`。本轮在 PR #1326 的下载总页调整基础上，补查产品、插件和解决方案的资源详情。

## 范围与方法

- 建立 113 个详情/资源 Markdown 文件到旧站资源页的对应关系，覆盖 34 组；其中 106 个文件、31 组仍发布，7 个文件、3 组已退休。另将 `reference/sdks.mdx` 纳入总页核对记录。文件数量包含平台面板和旧 URL 文件，不等同于独立页面数量。
- 逐组对照 SDK/版本/包名/MD5/日期、Demo 地址与二维码、示例仓库及平台分配、关键版本限制。检查了资源页引用的共享示例片段，避免只比对正文而漏掉导入内容。
- 实际服务端渲染 64 次 SDK/资源组件调用，无空输出或异常；对相同下载地址比对 134 项旧站公布的元数据，未发现不一致。
- 所有目标文件均已归类。逐文件清单见 [JSON 清单](2026-10-28-download-detail-audit.json)。

## 本轮修正

1. 白板和 Fastboard 的 6 个平台面板补回 Web Demo 封面、说明及默认展开二维码。
2. 语聊 SDK/UIKit 和 KTV 场景化方案的 6 个平台面板补回二维码默认展开状态。
3. 语聊 SDK 的 IM 获取入口由空的中文 `product=chat` 目录改为既有独立 IM 站。
4. RTC React CDN 示例补回 React 18、ReactDOM 18 的前置依赖和加载顺序说明。
5. 智能摄像头/门铃下载卡片显式保留例程使用 RTM 1.x 的限制，继续链接既有迁移与互通说明。
6. KTV SDK 详情页补回 SDK 名称、开发者、合规说明和隐私规则引用。

这些修正不重新加入下载卡片底部的包管理器链接。

## 分组结论

| 组 | 发布文件 | 结论 |
| --- | ---: | --- |
| `realtime-media/rtc` | 16 | 恢复 React CDN 示例中缺失的 React 18 / ReactDOM 18 前置依赖；SDK 元数据与旧站同地址记录一致。仓库示例使用统一卡片图标替代装饰性封面。 |
| `realtime-media/rtm` | 15 | 9 个入口与旧站一致；Swift/Objective-C 共用包，C++ 聚合两种系统包。资源数据已核对，RTM 的完整安装步骤仍在快速开始中；详情页未重复工具入门帮助外链。 |
| `realtime-media/rtc-server-sdk` | 7 | C++/Java/Python/Go 的包、集成命令及示例仓库一致。 |
| `realtime-media/local-server-recording` | 5 | C++/Java 的 x86_64/arm64 包与 Java 示例仓库一致。 |
| `realtime-media/rtsa` | 1 | 18 个 C SDK 架构包一致；已退休 Java SDK 及所属说明保持下线，不恢复旧链接。 |
| `realtime-media/whiteboard/whiteboard-sdk` | 4 | 恢复三平台的 Web Demo 封面、说明和展开二维码；npm 链接固定到与旧站相同的 2.16.53 版本。 |
| `realtime-media/whiteboard/fastboard-sdk` | 4 | 恢复三平台的 Web Demo 封面、说明和展开二维码；Android 1.7.2 / Web 1.1.0 按同仓库发版说明保留，不回退到旧资源页的 1.6.2 / 1.0.0。 |
| `realtime-media/sdk-extensions/metakit` | 0 | 已退休目录，仅确认其不参与发布；不恢复下载入口或改动归档内容。 |
| `realtime-media/sdk-extensions/portrait-rhythm` | 0 | 已退休目录，仅确认其不参与发布；不恢复下载入口或改动归档内容。 |
| `realtime-media/danmaku` | 1 | 双平台 Demo 地址和二维码一致；CDN 的 overview 路径映射与旧 PNG 的 SHA-256 相同。 |
| `ai/device-kit` | 1 | X1/BK7258 的 v1.0.1 GitHub 分支和 Demo 指引一致。 |
| `ai/aigc` | 1 | AIGCService SDK 销售获取方式和 GitHub 示例一致。 |
| `ai` | 1 | 旧站资源页仅有介绍文字；未从注释内容新增未发布下载入口。 |
| `solutions/meta-world` | 1 | 销售获取方式、SDK/服务指引及已有示例/Demo 资源与旧站对应；未发现资源遗漏。 |
| `solutions/game-voice` | 3 | Unity/Unreal 的 SDK、示例仓库和特殊场景技术支持入口一致。新站统一标签 Unreal Engine 对应旧站 Unreal；沿用现有产品概览结构与简化说明。 |
| `solutions/showroom` | 3 | 逐平台 Demo 地址、二维码、封面及示例仓库/分支与旧站一致。 |
| `solutions/one-to-one-live/rtm` | 3 | 逐平台 Demo 地址、二维码、封面及示例仓库/分支与旧站一致。 |
| `solutions/one-to-one-live/custom-signaling` | 1 | 销售获取方式、SDK/服务指引及已有示例/Demo 资源与旧站对应；未发现资源遗漏。 |
| `solutions/teleoperation` | 1 | 销售获取方式、SDK/服务指引及已有示例/Demo 资源与旧站对应；未发现资源遗漏。 |
| `solutions/smart-camera` | 1 | 保留 PR #1273 的设备端内置信令/客户端迁移指南分流，补显式 RTM 1.x 示例限制；不把旧例程误导到 RTM 2 下载。 |
| `solutions/smart-watch` | 1 | 销售获取方式、SDK/服务指引及已有示例/Demo 资源与旧站对应；未发现资源遗漏。 |
| `solutions/art-class` | 5 | 保留已合并 PR #1293 将教育特殊版工单入口改为通用 RTC 下载的明确调整；RTM 1.x 限制、白板和云录制入口保留。 |
| `solutions/online-music-class` | 5 | 保留已合并 PR #1293 的通用 RTC 下载调整；RTM 1.x 限制、白板和云录制入口保留。 |
| `solutions/online-ktv/auikaraoke` | 3 | 逐平台 Demo 地址、二维码、封面及示例仓库/分支与旧站一致。 |
| `solutions/online-ktv/ktv-scenario` | 3 | 保留旧站 Demo 标题、平台链接与 v4.3.0 示例仓库；恢复二维码默认展开。 |
| `solutions/multi-usecase/scenario-based` | 3 | 与旧资源页一致复用 Android/iOS KTV Demo、二维码及 v4.0.0 / main 示例分支；旧下载正文没有 Web 资源，因此不新增空 Web 下载页。 |
| `solutions/multi-usecase/non-scenario-based` | 3 | 与旧资源页一致复用 Android/iOS KTV Demo、二维码及 v4.0.0 / main 示例分支；旧下载正文没有 Web 资源，因此不新增空 Web 下载页。 |
| `solutions/multi-usecase/ui-solution` | 3 | 与旧资源页一致复用 Android/iOS KTV Demo、二维码及 v4.0.0 / main 示例分支；旧下载正文没有 Web 资源，因此不新增空 Web 下载页。 |
| `solutions/chatroom/sdk` | 3 | Android/iOS Demo、共享示例仓库及集成版本一致；恢复二维码默认展开。IM 获取入口改为专属站，避免空的中文 product=chat 目录；不恢复旧预发布文档地址。 |
| `solutions/chatroom/uikit` | 3 | Android/iOS Demo、二维码及共享示例仓库一致；恢复二维码默认展开。 |
| `solutions/smart-doorbell` | 1 | 保留 PR #1273 的设备端内置信令/客户端迁移指南分流，补显式 RTM 1.x 示例限制。 |
| `solutions/iot-apaas` | 1 | 销售获取方式、SDK/服务指引及已有示例/Demo 资源与旧站对应；未发现资源遗漏。 |
| `solutions/flexible-classroom` | 0 | 已退休目录，仅确认其不参与发布；不恢复下载入口或改动归档内容。 |
| `solutions/online-ktv/online-ktv-sdk` | 3 | 保留 Android 4.4.1 / iOS 4.4.0 固定版本、对应校验值和包体积；补齐 SDK 身份与隐私说明链接。 |

## 差异处理边界

- 教育特殊版 → 通用 RTC 下载，是已合入 [PR #1293](https://github.com/AgoraIO/docs-portal/pull/1293) 的明确调整，本轮没有倒退回工单入口。
- 摄像头/门铃的设备端 RTM 与客户端接入分流沿用 [PR #1273](https://github.com/AgoraIO/docs-portal/pull/1273)。
- RTSA Java、灵动课堂和插件退休内容继续排除发布；旧站的模板页和空资源占位页不新增为可下载资源。
- Fastboard 按同仓库最新发版说明保留新版，白板 npm 地址固定到对应版本；这些与旧资源页的字符串差异不是 SDK 丢失。
- 装饰性平台/仓库图标由共享组件承担；少量工具安装入门外链沿用现有简化文档。核对重点是资源、版本约束与可操作内容，不要求布局或文字逐字复刻。
- 本轮没有宣称所有外部站点和 SDK 包均完成在线可用性验证。新增/恢复的白板 2 张图片及弹幕现有 2 张二维码均返回 200，且 SHA-256 与旧站图片文件一致。

## 验证

- 106 个发布详情文件的普通 Markdown/HTML 链接审计：135 条链接，无失效内部目标或缺失锚点。
- 另核对卡片对象数据中的 28 条内部链接；下载总页的动态产品锚点通过实际渲染确认，无缺失。
- 37 项内容/组件专项测试通过。最终全量 `bun run test --maxWorkers=4 --testTimeout=30000`：302 个测试文件通过，4579 项通过、2 项跳过；`bun run types:check` 通过。
- 独立只读审查核对本轮 16 个 MDX 的源文对应关系，未发现可行动问题。
- 桌面及窄屏浏览器检查白板 Demo/二维码、语聊二维码默认展开与 IM 入口；截图位于忽略目录 `.agent/artifacts/`。
