# 第三批修复：外链及剩余待核查项

> 后续范围决定：用户已确认这 27 个源头空文档不再处理。以下保留当时核查证据；当前待办以[后续事项清单](./cn-doc-link-follow-up.md)为准。

本轮在 `codex/cn-doc-links-validation` 工作树继续修复 `codex/cn-newdoc-html-api-migration` 的中文文档。基准为 2026-10-26 staging 审计，验证日期为 2026-10-27。修改涉及 137 个内容文件，另修正跳转定位和链接检查器。

## 结果

- 原审计确认的 54 个失效外部请求已逐项处置。修改范围内的 Markdown/MDX 已无这些旧地址的可点击引用；中文 OpenAPI 的旧 StepFun 文档地址也已更新。
- 修正 260 处站内锚点引用。原先待核查的 307 项非空页面问题，按修改后的来源链接复测，共验证 324 个不同的当前目标：最终页面、正文、目标锚点以及适用的平台均匹配。
- 27 个空正文页面仍需补原文；IoT Android 示例仍需产品方提供有效工程。这些缺失未被计为通过。
- 登录、反爬、网络阻断和无法证明导航成功的外链继续列为待核查。不能据本轮结果宣称全站链接已经全部通过。
- 修复尚未部署。本轮没有重建完整生产站点，staging 仍需发布后按新产物复测。

## 外链处置

| 原问题 | 数量 | 处置 |
| --- | ---: | --- |
| GitHub 文档、示例或类型源码 | 25 | 21 项固定到保留原路径的有效版本；白板类型源码逐符号重定位；Android ConvoAI 使用当前工具包源码入口；iOS 旧源码明确标为历史参考；IoT 缺失工程明确说明获取渠道。 |
| 厂商文档、图片、账号入口或服务地址 | 12 | 9 项改到已查证的具体官方目标；账号入口更新为声网现行域名；`uikit-v2` 作为后端 Host 配置值展示，根路径 GET 不能证明服务是否可用。 |
| 旧声网文档 | 10 | 9 项保留 Legacy 产品和 SDK 版本，改到仍有对应正文的 `docportal.shengwang.cn`；RTC SDK 概念引用改到站内 RTC 概览。 |
| 标点错误、占位地址或 URL 前缀 | 7 | 腾讯云链接排除句末标点；6 项示例值改为行内代码，保留原参数含义。 |

另处理了待核查清单中能确认的厂商章节变更，包括 MiniMax、Boost、Dart、Gradle、环信、AWS、Unity 和 MDN；本机开发地址与 `modules.example.com` 示例不再被渲染为公共资源链接。

### 版本与源码定位

- CallAPI 使用 `2.0.0` 正式 tag；React Native 示例使用 `v4.5.2`。示例运行指南的克隆命令和目录说明同步到该版本，避免克隆 main 后找不到 `/example/`。
- 白板原类型声明仓库失效，改到同作者的 `Nero-Hu/Whiteboard-Docs`，固定提交 `23e952d7ae62eefb7e95dfb3440c287425d8d328`。380 个旧定位逐符号核对，修正 453 处源码引用及对应的可见行号标签；两个构造函数另按实际声明行校正。该来源仍为原作者个人仓库。
- Android ConvoAI 的源码入口按维护要求指向工具包 `main` 分支；已通过 GitHub API 核对路径、包名和组件文件。正文及卡片不重复写具体版本号。iOS 历史源码仅供参考，保留历史 tag 链接，当前组件继续通过 CocoaPods/SPM 集成。依赖安装示例中的版本号保留。
- IoT Android 旧仓库没有找到可靠的同平台替代，文档明确提示先联系技术支持确认工程获取方式；没有改指 iOS、设备端或小程序示例。

## 站内锚点及检查器

第一轮按同平台唯一标题修正 193 处引用；后续结合父章节、方法声明和具体发版版本，再修正 67 处。重复章节里的同一旧 hash 可能需要分别改成不同的新 hash，因此按来源位置处理。

`deliverVideoFrame` 的五处引用指向本章节包含该成员声明的 `Control` 定义，并明确标注用途。HarmonyOS 和 Unreal 的四处不存在的 `onRenewTokenResult` 引用，改为同平台 `renewToken` 返回值说明，只描述方法调用结果。

共用定位逻辑补充了旧式 `a[name]` 锚点，并在同名章节都处于折叠状态时优先选择当前平台。检查器补充：

- 重复 ID/name 选择可见候选；同时校验路径或查询参数所指定的平台，共享正文单独识别。
- GitHub 标题的 `user-content-` 前缀及 `L`/`LC` 行号定位。行范围两端都必须有证据；GitHub 可视代码层的辅助阅读器隐藏属性仅在严格限定条件下豁免，CSS 隐藏仍不通过。
- OpenAPI 旧锚点自动展开字段时，仅在原字段确实可见且高亮、原业务查询参数完整保留的情况下，接受新增的 `path`、`s-highlight` 状态。
- `#/…` 形式的 SPA 路由保留为待内容核查，不按普通 DOM 锚点缺失处理。

## 验证与证据

- 完整测试：4,452 项通过，2 项失败，2 项跳过。失败仅为此前已有的 `src/lib/rtm-pr2069-sync.test.ts` Web／小程序 USER 示例平台分段断言。
- 类型检查通过；修改的代码文件 Biome 检查及 `git diff --check` 通过。
- 最新检查器专项测试 94 项通过；React Native 获取方式的版本文案另经现有内容回归检查。
- 307 项站内问题全部有最终浏览器证据。工具导航失败记录单独重试，原始失败保留，没有将上一页内容计为成功。
- 外部网络复核保留 789 个完整 URL 的结果，网络请求按去除片段后的地址去重；其中含已替换的旧待核查地址，不能把原始结果数当作当前有效链接数。复核发现的两条错误 SDK 路径已修正并重新取得 HTTP 200。
- Apple 与 Android CameraManager 新目标通过浏览器验证；GitHub 固定源码中的 `L2948` 已实际打开，确认代码行位于可见区域。其余类型源码定位还按固定版本的声明内容逐项核对，未仅依赖初始 HTML 的虚拟化行节点。
- 完整源链接清单已重新生成。静态模式没有完整网络及浏览器证据，仍报告 INCOMPLETE，不能替代发布后的全量验收。

可复查的本地证据位于忽略目录 `.agent/artifacts/cn-links/third-batch/`：

| 文件 | 内容 |
| --- | --- |
| `github-research.json`、`vendor-research.json`、`vendor-fragment-research.json` | 旧址、新址、版本和语义依据。 |
| `github-whiteboard-replacements.json`、`whiteboard-constructor-overrides.json` | 类型源码逐符号定位及构造函数校正。 |
| `platform-source-changes.json`、`context-source-changes.json` | 260 处站内引用修改依据。 |
| `internal-final-results.json` | 307 项问题与各自当前目标、浏览器证据。 |
| `external-recheck.ndjson`、`external-correction-results.json` | 网络复核与修正后的补验。 |
| `github-live-evidence.json`、`external-browser-final-results.json` | 外链浏览器证据；保留无法确认的状态。 |
| `changed-source-links.json` | 修改范围内旧失效引用检查与解析结果。 |
| `full-test-release.log`、`types-release.log`、`biome-release.log` | 最终代码验证输出。 |

## 仍需提供的资料

27 个页面只有标题、空壳或原迁移的 `empty-source-body` 标记，没有可靠的同平台、同版本替代正文。需要上游原文或产品方明确页面处置；单凭 HTTP 200 不足以关闭这些项。完整清单见 `remaining-empty-pages.json`，下表列出源文件。

| 类型 | 源文件 |
| --- | --- |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/classagora-1-1linuxsdk-1-1-i-engine.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/classagora-1-1linuxsdk-1-1-i-engine-config.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/local-server-recording/java/legacy/(current)/classio-1-1agora-1-1recording-1-1common-1-1-common.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1in-place-t.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-copy-assignable.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1internal.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-copy-constructible.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespacestd.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1internal-1-1swappable-impl.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-move-assignable.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-move-constructible.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/classagora-1-1-optional.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/java/(current)/namespaceio-1-1agora-1-1rtc.mdx` |
| C# API目录空壳，overview仍指向该页 | `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/play/rhythmplayer.mdx` |
| C# API目录空壳，overview仍指向该页 | `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/device-management/mobile-camera.mdx` |
| C# API目录空壳，overview仍指向该页 | `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/video/video-prenpro/face-detection.mdx` |
| HarmonyOS类型页只有描述和旧锚点 | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-musiccollection.mdx` |
| 原内容即空的弹幕发版说明 | `content/docs/zh-CN/realtime-media/danmaku/reference/release-notes.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/namespaceagora.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/local-server-recording/java/legacy/(current)/namespaceio-1-1agora-1-1recording-1-1common.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1commons-1-1cjson.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1media.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1signaling.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-243a4ba6b4f893d71afbb5a3e90552fa.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-340c0ffa940b473f799cd5b0c256e868.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-4e254d624c24658fbc5d27800386d172.mdx` |
| 原迁移标记empty-source-body的Doxygen空正文页 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-b8989817a9fe3fd6f75fb81e8578f096.mdx` |

另外需要确认 IoT Android 客户端示例的现行公开仓库或下载包。外链中的账号、验证码、反爬、网络超时和部分 SPA 定位继续保留待核查。


## 发布后复测

部署本工作分支的产物后，按相同环境重新构建并运行完整检查：

```sh
VITE_DOCS_REGION=cn bun run docs:links:cn:full --build --match content --origin https://cn-preview.example --out .agent/artifacts/cn-links/post-remediation
```

该命令会重新检查源码、产物、网络与浏览器证据。存在未补齐内容或外部访问限制时，仍应保留 INCOMPLETE 状态。

## 补充源文件核查

已在 `shengwang-doc-source` 找到另外五页的对应源文件，并核对本地历史：三个 C# 页面同样没有方法正文，HarmonyOS 类型页及弹幕发版说明页只有简介。详见[五页源文件核查](./cn-empty-page-source-audit.md)。这五项仍需补充上游内容，27 页待补数量未减少。
