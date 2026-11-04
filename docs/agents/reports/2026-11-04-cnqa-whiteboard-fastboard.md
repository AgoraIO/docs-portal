# CNQA-002／005 白板与 Fastboard 版本复核

目标基线：`ae8fe94cb`（`codex/cn-newdoc-html-api-migration`）。当前内容对照旧站发布源 `664ac1bf33`（0.0.540）；历史参考分别固定到自己的 Git tag，不使用当前 SDK 源覆盖旧版。

## 复核结果

| 项目 | 结论与处理 |
| --- | --- |
| 白板 API 仅有简介／成员缺失 | 当前版本已恢复；本轮不整体重新迁移。检查 551 个有源映射的页面，核对完整声明／代码及参数、说明等结构化文本，剩余文本差异人工核对为链接、列表、static 标签等表现差异。 |
| 白板当前版本 | Android 2.16.134、iOS 2.16.147、Web 2.16.59。下载卡、安装依赖、API 菜单与发布源对应，历史 2.16.100 已非当前 Android 下载。 |
| 白板 Web 快速开始 | 多窗口 mount、入房前 Slide 注册、Full/Sub Worker 路径及同版本要求已在基线恢复。 |
| 白板 iOS 快速开始 | CocoaPods／SwiftPM 系统条件已经区分，但 SwiftPM 操作步骤仍缺失，且统一 Xcode 10.10 条件不适用于 Swift tools 5.9。补齐同版本 SwiftPM 流程与下载页入口。 |
| Fastboard 当前 API | Android 公开构造函数说明、createFastReplay；iOS createFastRoom 的 FastRoom 返回类型、完成回调及 updateWritable；Web 泛型约束、Promise 泛型、setPlaybackRate 已恢复。 |
| Fastboard 当前版本 | Android 1.8.2、iOS 1.4.6、Web 1.1.10。当前参考、安装和下载一致，本轮不改版本数据。 |
| 最早三个 Fastboard 历史入口 | 原 0.0.67 的 /api-ref/fastboard 路径显示“暂无内容”并会跳首页。该版本尚属 /api-ref/whiteboard；修正三个平台路径，浏览器确认分别显示 1.3.4、1.2.2、0.3.8 和 API 正文。 |
| Fastboard 0.0.323 历史入口 | iOS 空白；Android／Web 的菜单混入 Whiteboard 版本。把对应 Android 1.6.0、iOS 1.4.0、Web 0.3.10 参考从该 tag 冻结为站内历史页，菜单和侧栏指向具体版本。没有把旧版签名改成当前版。 |

## 内容证据

- 当前 Whiteboard 与 Fastboard 共 554 个映射文件参与检查；259 个含代码／声明的文件共 1,088 个原始代码块或 iOS 成员声明全部保留。另检查 6,779 个结构化签名／说明片段；自动对齐后的 5 页差异逐项核对，分别为列表标记、链接括号和 ApiSignature 的 static 标签搬移。索引／导航页面未按“应有成员”的类型页规则误判。
- Fastboard 三个站内历史页采用 `0.0.323` 对应提交 `0311fafd71dbd119897d9657aab95b2f0508d382`，共 126 个代码块逐一对齐，包含旧版原有不完整返回类型写法。当前 SDK 页保持更新后的契约。源路径与 SHA-256 记录于 `docs/migration/cnqa-fastboard-historical-snapshots.json`。
- 浏览器逐个打开六个平台的 24 个原历史菜单目标；20 个能显示正文，4 个显示空内容（0.0.67 三项、0.0.323 iOS）；0.0.323 Android／Web 另有版本菜单错误。白板 iOS 2.16.62 入口正文完整，该旧归档未显示版本按钮，使用对应 tag 的平台元数据核定版本。
- SwiftPM 依据 [Whiteboard-iOS 2.16.147 的 Package.swift](https://github.com/netless-io/Whiteboard-iOS/blob/2.16.147/Package.swift)：Swift tools 5.9、iOS 12、Whiteboard 产品及 NTLBridge／White_YYModel 依赖。没有把 SwiftPM 条件应用到 CocoaPods。

## 验证范围

本地浏览器确认 iOS 指南展示两种接入方式；三个新增历史页均显示正确版本按钮、完整 API 正文和各自旧签名。平台 Markdown 转换核对 iOS 新步骤，Android 不泄漏 SwiftPM 步骤；三个历史 Markdown 出口保留冻结代码。

当前版本 API、下载及导航的已有回归通过；五个 GitHub ZIP 目标经 HEAD 跟随重定向均返回 200，Whiteboard Web 2.16.59 经 npm registry 确认版本及 tarball。新增归档回归覆盖旧签名与当前签名分离、菜单／侧栏目标和 0.0.67 原始路径。最终全量测试 337 个文件、5,564 项通过（另 1 文件／6 项跳过）；`bun run types:check` 通过。使用 `DOCS_DEV_SCOPE=zh-CN/api-reference/whiteboard` 并将 `TSS_PRERENDER_PATHS` 固定到三个新增历史页后，`bun run build` 通过：710 份页面数据、832 份机器出口和 684 份 HTML。该结果是白板 API 作用域构建，不是本分支的全站生产构建。初次 scoped 构建未限制预渲染路径，因不在作用域内的 `/zh-CN/ai` 返回 404 而失败；对齐作用域后通过。截图、浏览器结果、源码对齐清单均在 ignored `.agent/artifacts/cnqa/`；不提交 QA 图片。

修复未部署，不能把本地通过记为新站线上复验完成。外部归档验证针对本次访问结果；旧归档已有的标题笔误和正文中的旧版契约按历史内容保留，不回写当前 SDK 改动。
