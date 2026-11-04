# 中文热更新 45 个源 PR 覆盖审计

## 结论

**没有全部生效。** 按固定目标分支的仓库内容核查，45 个源 PR 的结果为：

| 结果 | 数量 | 含义 |
| --- | --- | --- |
| 完整覆盖 | 24 | 本次 PR 的有效内容修改已找到对应落点；较旧版本可由后续版本合理替代。 |
| 部分覆盖 | 18 | 至少存在一处明确遗漏或旧副本，不表示整项都没有迁移。 |
| 未覆盖 | 2 | #2107 安装命令仍旧；#2113 的历史 API 版本入口及归档映射没有承接。 |
| 后续源回退 | 1 | #2060 的屏幕采集修正在后续源 #2094 中被回退；不直接计为 portal 漏迁移。 |

因此有 **20 个 PR 存在明确未完整覆盖项**，另有 1 个需要源仓库侧确认回退意图。此数量按 PR 去重；同一 PR 可能包含多个遗漏。它不是全量改动行的覆盖率。Web 两次升级的产品正文及 API 入口版本标题已覆盖，不因新站没有同构旧版选择 UI 而额外计作遗漏。

## 核查范围

- 日期：2026-10-19。
- 输入：用户提供的 45 个 `AgoraIO/shengwang-doc-source` PR，保留原清单顺序；包括晚合入的 #2056，不把 PR 编号当作合并时间顺序。
- 目标分支：`codex/cn-newdoc-html-api-migration`。
- 固定目标提交：`7c6c60ead44406e69906c5c3808cd489784aa89e`（包含 docs-portal #1185、#1206、#1207、#1213 和刚合入的 #1215）。
- 这 45 个 PR 的源范围终点：`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`（源 #2056 的合并提交，也是 #1185 使用的源快照）；更晚源改动不自动纳入本次。
- 工作分支：`codex/cn-hotfix-pr-coverage-audit`。
- 本次只审计和记录证据，不修改产品文档、API 源文件或业务代码，不宣称补齐遗漏。

这里的“覆盖”指上述目标提交中的中文文档、API MDX、平台元数据和 OpenAPI 源码已承载源 PR 的对应变更，不代表生产或 staging 已部署该提交。未做线上逐路由验收、全量生成 HTML 逐段等价证明、外部下载链接可用性或 SDK 运行测试。

## 判断方法

1. 使用 GitHub PR API / `gh pr diff` 或源仓库合并提交读取实际改动，不依赖 PR 标题或迁移 PR 自述。
2. 对照目标的实际正文、示例、版本配置及 OpenAPI；共享内容要追踪展开后的多个落点。
3. 版本标签和 release notes 更新，不足以证明 API 参数、事件和所有平台示例均已更新。
4. 删除或隐藏类变更检查实际目标导航；保留历史归档不自动算遗漏。
5. 后续源 PR 如回退较早变更，单独记录“后续源回退”，不直接当作 portal 漏迁移，也不擅自恢复。
6. 本地源仓库只通过 Git 对象读取受审文件，不使用其未提交内容。所有目标证据行号对应固定目标提交，后续修改可能使行号移动。

“完整覆盖”只针对源 PR 的本次有效内容改动，不是对整页或整产品无缺陷的保证。非内容构建产物、源站专有组件语法及源站 CI/站点配置不要求逐字复制。

## 分组证据

- [RTC / SDK / API 证据](./2026-10-19-hotfix-audit-rtc.md)
- [ConvoAI / STT / RTM / 门铃证据](./2026-10-19-hotfix-audit-ai-rtm.md)
- [RTSA / 审核 / 推流 / 录制证据](./2026-10-19-hotfix-audit-services.md)

## 45 个 PR 逐项结果

保持用户清单原顺序。具体目标文件、行号、源 merge SHA 和核查边界见上面的分组证据。

| 源 PR | 主题 | 状态 | 核查摘要 |
| --- | --- | --- | --- |
| [#2062](https://github.com/AgoraIO/shengwang-doc-source/pull/2062) | RTC Web 4.24.7 | 完整覆盖 | 发版已保留；产品示例/下载已升级 4.24.9，API 入口标题已标后续 4.24.8。 |
| [#2060](https://github.com/AgoraIO/shengwang-doc-source/pull/2060) | 屏幕采集发布轨道 | 后续源回退 | 源 #2094 重新生成时回退了相关句子，目标与源范围终点一致；需确认源侧意图。 |
| [#2064](https://github.com/AgoraIO/shengwang-doc-source/pull/2064) | STT Demo 链接 | 完整覆盖 | 首页国内体验地址已替换。 |
| [#2065](https://github.com/AgoraIO/shengwang-doc-source/pull/2065) | 音频审核回调 | 部分覆盖 | 两处 clientRequest 已改；开通前置步骤仍是联系技术支持的旧流程。 |
| [#2063](https://github.com/AgoraIO/shengwang-doc-source/pull/2063) | ConvoAI 2.11 ASR 热词 | 部分覆盖 | 指南、Go 和 REST 已更新；TS 参数说明仍旧，Python keywords 表错入 TencentSTT。 |
| [#2068](https://github.com/AgoraIO/shengwang-doc-source/pull/2068) | Android 编解码库名 | 完整覆盖 | 对应库名修正已落到裁包指南。 |
| [#2070](https://github.com/AgoraIO/shengwang-doc-source/pull/2070) | LogConfig 路径 | 完整覆盖 | current API 的日志文件路径指导已更新。 |
| [#2072](https://github.com/AgoraIO/shengwang-doc-source/pull/2072) | Metadata 截断 | 完整覆盖 | C++ current 有超出大小后截断的说明。 |
| [#2073](https://github.com/AgoraIO/shengwang-doc-source/pull/2073) | RTC 日志路径 | 完整覆盖 | HarmonyOS 日志文件名指导和默认路径已更新。 |
| [#2067](https://github.com/AgoraIO/shengwang-doc-source/pull/2067) | RTM Web 2.3.0 | 部分覆盖 | 版本标签/发版说明已更新；API、下载、错误码和 JS 退休政策仍有旧值。 |
| [#2076](https://github.com/AgoraIO/shengwang-doc-source/pull/2076) | 美颜素材范围 | 完整覆盖 | 素材适用范围说明已迁移。 |
| [#2077](https://github.com/AgoraIO/shengwang-doc-source/pull/2077) | 跨平台 Metadata 截断 | 部分覆盖 | Electron、Flutter、RN、Unity、Unreal C++ 仍缺截断提示。 |
| [#2075](https://github.com/AgoraIO/shengwang-doc-source/pull/2075) | 易盾工单账号信息 | 完整覆盖 | 工单补充登录域名和账号名称的说明已存在。 |
| [#2069](https://github.com/AgoraIO/shengwang-doc-source/pull/2069) | RTM 小程序 | 部分覆盖 | 多篇指南已迁移；平台/下载入口和 Stream 限制的适用边界未完整保留。 |
| [#2082](https://github.com/AgoraIO/shengwang-doc-source/pull/2082) | RTC Web 4.24.8 | 完整覆盖 | 发版、产品内容和 API 入口版本标题已更新。 |
| [#2085](https://github.com/AgoraIO/shengwang-doc-source/pull/2085) | RTC Android / iOS 4.6.4 | 部分覆盖 | 发版和版本信息已更新；API 焦距能力相关新增内容缺失。 |
| [#2086](https://github.com/AgoraIO/shengwang-doc-source/pull/2086) | RTC 发版说明 | 完整覆盖 | 源发版描述修订已保留，并由 #2087 后续精炼。 |
| [#2087](https://github.com/AgoraIO/shengwang-doc-source/pull/2087) | RTC 描述修订 | 完整覆盖 | 后续通信模式/NCS/REST 描述修订已保留。 |
| [#2088](https://github.com/AgoraIO/shengwang-doc-source/pull/2088) | Web String UID 链接 | 完整覆盖 | 对应新链接已落地。 |
| [#2084](https://github.com/AgoraIO/shengwang-doc-source/pull/2084) | RTC Flutter / RN 4.6.4 | 部分覆盖 | 发版已更新，API 新事件和部分下载数据仍旧。 |
| [#2089](https://github.com/AgoraIO/shengwang-doc-source/pull/2089) | DataStream 限制 | 完整覆盖 | C++ API 的速率、包大小和调用频率限制已更新。 |
| [#2090](https://github.com/AgoraIO/shengwang-doc-source/pull/2090) | 删除 macOS 15 Beta FAQ | 完整覆盖 | 对应旧 FAQ 已删除。 |
| [#2083](https://github.com/AgoraIO/shengwang-doc-source/pull/2083) | RTSA 1.10.1 | 部分覆盖 | 发版和下载已更新，但主指南/C API/支持平台/资源数据等仍有旧内容。 |
| [#2096](https://github.com/AgoraIO/shengwang-doc-source/pull/2096) | RTSA 安全修复下载 | 完整覆盖 | 18 个 C SDK 下载地址已更新。 |
| [#2099](https://github.com/AgoraIO/shengwang-doc-source/pull/2099) | License SKU | 完整覆盖 | 产品 SKU 表已更新。 |
| [#2074](https://github.com/AgoraIO/shengwang-doc-source/pull/2074) | ConvoAI 2.12 | 部分覆盖 | 新指南和客户端 API 已有；REST think append、共享安装/结构及 SDK API 仍有遗漏。 |
| [#2102](https://github.com/AgoraIO/shengwang-doc-source/pull/2102) | 112 事件 metrics | 完整覆盖 | 新指标名称、数组结构和示例已更新。 |
| [#2106](https://github.com/AgoraIO/shengwang-doc-source/pull/2106) | 视频审核前置条件 | 部分覆盖 | Android/iOS 已更新，Web 分支仍缺源共享片段新增的前置条件。 |
| [#2105](https://github.com/AgoraIO/shengwang-doc-source/pull/2105) | 媒体推流转码计费 | 完整覆盖 | 源计费文字修订已存在。 |
| [#2103](https://github.com/AgoraIO/shengwang-doc-source/pull/2103) | License 自助预授权 | 完整覆盖 | 控制台自助预授权和图示已更新。 |
| [#2107](https://github.com/AgoraIO/shengwang-doc-source/pull/2107) | Agent 快速开始安装命令 | 未覆盖 | Go/Python/TS 仍分别锁在 v2.4.0/2.4.1/2.4.0。 |
| [#2109](https://github.com/AgoraIO/shengwang-doc-source/pull/2109) | 云录制机器人费用 | 部分覆盖 | 主计费页有免费规则；API 参考仍有未同步副本及子树导航声明，但上层 API 目录隐藏，不能称顶层公开入口。 |
| [#2101](https://github.com/AgoraIO/shengwang-doc-source/pull/2101) | ConvoAI 2.13 承接词 | 部分覆盖 | 指南、Go/Python 和 REST 有新内容；TS 上下文参数和部分公开类型说明仍缺。 |
| [#2110](https://github.com/AgoraIO/shengwang-doc-source/pull/2110) | 门铃隐藏 aPaaS | 部分覆盖 | 文字/导航已隐藏；源 PR 删除的旧图仍被引用，需人工确认。 |
| [#2108](https://github.com/AgoraIO/shengwang-doc-source/pull/2108) | Android Maven CDN | 部分覆盖 | 快速开始/下载页已改；发版提醒和裁包前置引导缺失。 |
| [#2112](https://github.com/AgoraIO/shengwang-doc-source/pull/2112) | 审核截图计费链接 | 完整覆盖 | 截图计费链接已更新。 |
| [#2113](https://github.com/AgoraIO/shengwang-doc-source/pull/2113) | RTC 4.6.2 API 归档 | 未覆盖 | Android/iOS/RN 4.6.2、Flutter 6.6.2 历史 API 入口及 0.0.492 映射均未承接。 |
| [#2114](https://github.com/AgoraIO/shengwang-doc-source/pull/2114) | VoIP 加密枚举 | 完整覆盖 | 中文 OpenAPI 加密模式枚举已修正。 |
| [#2094](https://github.com/AgoraIO/shengwang-doc-source/pull/2094) | RTC 4.7.0 生成 API | 部分覆盖 | 新版本标注不等于生成 API 全量等价；已有明确 API 遗漏，详见 RTC 证据与边界。 |
| [#2098](https://github.com/AgoraIO/shengwang-doc-source/pull/2098) | RTC Native 4.7.0 指南/发版 | 部分覆盖 | 发版/下载已更新；美颜版本范围、混淆和按需 FFmpeg 等说明缺失。 |
| [#2115](https://github.com/AgoraIO/shengwang-doc-source/pull/2115) | 云录制截图间隔 | 完整覆盖 | 主指南、API 副本和 OpenAPI 的 1 秒规则已核对。 |
| [#2091](https://github.com/AgoraIO/shengwang-doc-source/pull/2091) | 云录制 raw | 部分覆盖 | #1215 已补主产品和 OpenAPI；独立 API 文档副本仍旧，不能扩展为全站完整。 |
| [#2116](https://github.com/AgoraIO/shengwang-doc-source/pull/2116) | 黑名单实时取消订阅 | 完整覆盖 | 11 个平台 current API 均有 4 处实时生效提示。 |
| [#2118](https://github.com/AgoraIO/shengwang-doc-source/pull/2118) | 小程序 event 参数 | 完整覆盖 | 四个 update 方法签名/完整事件说明/示例均已迁移。 |
| [#2056](https://github.com/AgoraIO/shengwang-doc-source/pull/2056) | renewToken 回调 | 部分覆盖 | 平台之间、同页 request/willExpire 两个回调之间覆盖不一致。 |

## 建议后续修复顺序（本次未执行）

1. 先消除会直接影响集成行为的不一致：#2107 依赖命令、#2074 REST think / 共享安装、#2083 RTSA C API 和示例、#2056 Token 回调、#2067 RTM Web API。
2. 补齐 RTC 新 API、metadata 跨平台说明、4.7.0 指南和历史 API 入口；以实际 SDK 和固定源快照核验，不能只改版本标签，不要求原样搬运旧 UI。
3. 处理共享片段的多个展开副本、云录制 API 文档副本、小程序入口和平台限制；重跑对应平台/路由测试。
4. 源侧确认 #2060 后续回退是否有意；人工核验门铃旧图。不要把两项直接套用为机械补丁。

## 迁移记录的使用边界

[docs-portal #1185](https://github.com/AgoraIO/docs-portal/pull/1185) 是这批同步的主要来源；[后续 #1206](https://github.com/AgoraIO/docs-portal/pull/1206) 补了部分 API、版本元数据、小程序和 ConvoAI schema；[#1215](https://github.com/AgoraIO/docs-portal/pull/1215) 又同步了云端录制 #2091。这些已合入事实是定位线索，不替代逐项内容验收。

[历史 checkpoint](../../migration/cn-hotfix-checkpoint.md) 仍停在 2026-08-03 / 源 #2061，不能据此推断后续 45 个 PR 没迁移，也不能因 #1185 已合入就把 checkpoint 直接推进为“全覆盖”。本审计不修改历史迁移截止点。

## 验证

- 清单一致性检查：45 个唯一 PR，顺序与用户输入一致，无遗漏；主表与三份分组报告的 45 项状态全部一致。
- 明确写出的目标文件路径及引用行号存在性检查通过；RTC 报告中的 API/RTC/DL 缩写另行展开核对。此检查不代替正文语义审阅。
- 独立复核了关键完整/遗漏样本与归因，修正 Web 两次升级的初判：概览标题已承载 API 版本，不能只凭空 navScope 判缺失。
- `bun install --frozen-lockfile`：通过。
- `bun run types:check`：通过。
- `bun run test`：221 个测试文件通过，2865 项通过，2 项跳过（2867 项总计）。输出有 happy-dom 禁止加载脚本、localStorage 和 socket 警告，但本次命令退出码为 0。
- 上述验证在未修改产品源码的固定基线上执行；它证明工程基线通过，不证明历史热更新内容完整。
- 本次仅新增审计 Markdown，不运行生产构建或触发部署。
