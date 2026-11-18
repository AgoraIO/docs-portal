# 中文热更新逐 PR 修复进度

本表追踪源 PR 对应修复，原覆盖审计仍是 `7c6c60ead4` 的历史快照。合入迁移分支不等于线上生效。

## 当前状态（2026-11-12 核对）

20 个独立修复 PR（#1217–#1231、#1233–#1237，不含其他任务的 #1232）均已于 2026-10-20 合入 `codex/cn-newdoc-html-api-migration`。本次逐项读取 GitHub 的 `state`、`mergedAt`、`baseRefName` 和 `mergeCommit.oid`，并用 `git merge-base --is-ancestor` 确认全部合并提交均在目标分支 `53d7a8eb5a70bb3d72a2a06c5705075855a06079` 的历史中。下表记录合并提交；备注中的测试、构建与截图仍为各自历史提交的实施证据。

本次仅收尾审计记录，不修改产品正文或运行时代码，未重新运行应用测试、类型检查、构建、浏览器或外链验收，也未确认当前部署状态。下方 2026-10-20 的组合验收不构成对当前分支或线上版本的重新验收。源 #2060 仍按冻结源回退处理，不擅自恢复。

## 修复明细

- 已批准方式：当前会话主控，首两项串行建立标准，之后仅实际写集不重叠的产品组有限并行；每个源 PR 独立工作树、分支、修复 PR。
- 目标分支：`codex/cn-newdoc-html-api-migration`。
- 计划：[首两项与后续队列](../plans/2026-10-19-hotfix-repair-first-two.md)。仓库忽略 `docs/superpowers/plans`，计划存于可追踪的 agents 目录，不修改忽略规则。
- 验收调度：实施/轻量回归可并行；全量测试、构建/重型预览集中串行。#2056/#2106/#2108 并行全量曾出现未改动用例超时，已保留真实失败/中断证据，后续按 #2056 → #2106 → #2108 完成独占复核，不更改测试时限。

| 源 PR | 状态 | 修复 PR / 历史实施证据 | 合并提交 |
| --- | --- | --- | --- |
| 2107 | 已合并（2026-10-20） | [#1217](https://github.com/AgoraIO/docs-portal/pull/1217)；提交 `7d63c17bae`；三条命令补齐，TDD 3 红→3 绿，全量 2868 通过/2 跳过；规格与质量审查通过。 | [`0fa3ec9155e0`](https://github.com/AgoraIO/docs-portal/commit/0fa3ec9155e0ae71af8962019f4978efeb264013) |
| 2077 | 已合并（2026-10-20） | [#1218](https://github.com/AgoraIO/docs-portal/pull/1218)；提交 `9d5d6c067c`；6 红/4 保护→10 绿，全量 2875 通过/2 跳过，MDX/锚点/双审通过。 | [`75ab556909e0`](https://github.com/AgoraIO/docs-portal/commit/75ab556909e0dacf6e4a3b51b97c4fd9d9ba0161) |
| 2063 | 已合并（2026-10-20） | [#1221](https://github.com/AgoraIO/docs-portal/pull/1221)；`151276f3c7`；TS 参数与 Python 表归属均修正，7 绿/全量 2872 通过+2 跳过，双审通过。 | [`563945faf63e`](https://github.com/AgoraIO/docs-portal/commit/563945faf63e3411518eafb588a43e97b2c2c60d) |
| 2074 | 已合并（2026-10-20） | [#1227](https://github.com/AgoraIO/docs-portal/pull/1227)；`4ef360f566`、`2422c972ec`；45绿/全量2910通过+2跳过，双审通过；25内容文件，组合中文生产构建及浏览器验收/截图通过。Basic Auth基线严格schema问题仍保留。 | [`8b2e63759c01`](https://github.com/AgoraIO/docs-portal/commit/8b2e63759c0140b68e8a2f22a81d165a94dd688a) |
| 2101 | 已合并（2026-10-20） | [#1228](https://github.com/AgoraIO/docs-portal/pull/1228)；最终`62049c759f`；7绿/全量2872通过+2跳过/80.71秒，双审通过；与2074相邻小节无冲突承接并通过组合定向。 | [`ea4ca5388f98`](https://github.com/AgoraIO/docs-portal/commit/ea4ca5388f9879e7c8dcf700b42e9cd18c97faac) |
| 2085 | 已合并（2026-10-20） | [#1237](https://github.com/AgoraIO/docs-portal/pull/1237)；最终`95ae4255b7`；唯一Android六项回调参数，7源全分类；独立双审/full2867通过+2跳过，20组合build/UI通过。历史交#1231、下载交#1230。 | [`145b9d51372a`](https://github.com/AgoraIO/docs-portal/commit/145b9d51372a95327f89c9e5993d8a6ecabe5e79) |
| 2084 | 已合并（2026-10-20） | [#1235](https://github.com/AgoraIO/docs-portal/pull/1235)；最终`299bf4afc5`；7生产/121定向/4MDX，双审与full2876通过+2跳过；20组合build及Flutter/RN目录/枚举/回调UI通过，语音包不变。 | [`81d6f6d1b735`](https://github.com/AgoraIO/docs-portal/commit/81d6f6d1b73564dfb4132e1f982121b5aaa38795) |
| 2094 | 已合并（2026-10-20） | [#1234](https://github.com/AgoraIO/docs-portal/pull/1234)；最终`f8f34890c1`；40生产/46源/36新回归，双审与最终full2901通过+2跳过；20组合build/参数/错误码/版本菜单UI通过。两4.6.4原归档已真实浏览器确认；早期HTTP404及不一致风险保留。 | [`afb03d81dec2`](https://github.com/AgoraIO/docs-portal/commit/afb03d81dec2b37f290afd848abbaa8d3d78d118) |
| 2056 | 已合并（2026-10-20） | [#1222](https://github.com/AgoraIO/docs-portal/pull/1222)；`4198277abe`；22 绿/最终独占全量 2887 通过+2 跳过，双审通过，原中断失败记录保留。 | [`33e464fd69c0`](https://github.com/AgoraIO/docs-portal/commit/33e464fd69c060096f8f6f44fedc2e0f56b733c6) |
| 2108 | 已合并（2026-10-20） | [#1224](https://github.com/AgoraIO/docs-portal/pull/1224)；`e02671ea6f`；10 绿/最终独占全量 2875 通过+2 跳过，双审通过，原中断失败记录保留。 | [`34bbd4cf48aa`](https://github.com/AgoraIO/docs-portal/commit/34bbd4cf48aa7822247a63a5254ccca670100914) |
| 2098 | 已合并（2026-10-20） | [#1230](https://github.com/AgoraIO/docs-portal/pull/1230)；最终`1b253c24a6`；完整15源→8生产文件，最终25新回归/相关108绿；双审/7MDX编译/类型/UI通过。独立全量pre-Minor 2888通过+2跳过，最终新守卫含于组合3055通过。140历史保留，8新包准确。 | [`1f3cbf832f5a`](https://github.com/AgoraIO/docs-portal/commit/1f3cbf832f5a0a0193d8dd3babe5fa69dd3536d6) |
| 2067 | 已合并（2026-10-20） | [#1236](https://github.com/AgoraIO/docs-portal/pull/1236)；最终`a0b3d66d99`；19生产/23源/107定向/17MDX，双审/full2886通过+2跳过；20组合build/下载/版本及Web/mini Presence隔离UI通过。 | [`ee299a93116e`](https://github.com/AgoraIO/docs-portal/commit/ee299a93116e588502bd4f12fb548626552ea0e3) |
| 2069 | 已合并（2026-10-20） | [#1229](https://github.com/AgoraIO/docs-portal/pull/1229)；最终`b2f9224ce0`（后两次仅测试/报告，生产不变）；27新回归/相关70绿，原双审/类型/9MDX/UI及14组合通过；本轮收窄过宽Web负断言并接受等价范围写法，增量质量/20组合3150通过及生产UI通过。178旧占位债不夹改。 | [`7f0b916c8590`](https://github.com/AgoraIO/docs-portal/commit/7f0b916c85908505a6a24679119979d75e7a3d1a) |
| 2065 | 已合并（2026-10-20） | [#1219](https://github.com/AgoraIO/docs-portal/pull/1219)；`1b98376196`；5 绿/全量 2870 通过+2 跳过，双审通过。 | [`a9485510f73c`](https://github.com/AgoraIO/docs-portal/commit/a9485510f73cc1db5f79816e8498b6b54d4c2eb3) |
| 2106 | 已合并（2026-10-20） | [#1223](https://github.com/AgoraIO/docs-portal/pull/1223)；`ac9592f442`；5 绿/最终独占全量 2870 通过+2 跳过，双审通过，原失败汇总保留。 | [`58245f6cfd75`](https://github.com/AgoraIO/docs-portal/commit/58245f6cfd7566a8eca1c1653f0885f1b39e03bf) |
| 2083 | 已合并（2026-10-20） | [#1233](https://github.com/AgoraIO/docs-portal/pull/1233)；最终`61420caf04`；42生产/84源801hunks/40MDX/13新回归。首次full16旧fixture失败后精确修正并保旧锚点意图，最终full2878通过+2跳过；双审/20组合build/表格、索引、声明及菜单UI通过。 | [`c35654dd4d08`](https://github.com/AgoraIO/docs-portal/commit/c35654dd4d08a3dbfd1fe92c9ee7f9e2cb8b4cef) |
| 2109 | 已合并（2026-10-20） | [#1225](https://github.com/AgoraIO/docs-portal/pull/1225)；`0cbe7a7899`；6 绿/全量 2871 通过+2 跳过，双审通过；仅 API 计费副本插入一句，不恢复隐藏导航。 | [`f01d6a6a4234`](https://github.com/AgoraIO/docs-portal/commit/f01d6a6a4234dcb22e89d06bb3fc60ac064d13b9) |
| 2091 | 已合并（2026-10-20） | [#1226](https://github.com/AgoraIO/docs-portal/pull/1226)；`1fddf92c89`；新旧20 绿/全量2876 通过+2 跳过，双审通过；两个 API raw 指南副本，保持 provenance 和已同步主线/Go/YAML。 | [`efb2599b52e3`](https://github.com/AgoraIO/docs-portal/commit/efb2599b52e3d31618bde604db61bc64d9e6d791) |
| 2110 | 已合并（2026-10-20） | [#1220](https://github.com/AgoraIO/docs-portal/pull/1220)；`6df0a99e52`；仅删旧图，7 绿/全量 2872 通过+2 跳过，双审通过。 | [`58c2e98dffd5`](https://github.com/AgoraIO/docs-portal/commit/58c2e98dffd5cf32032e738a3a09257f0b1f6411) |
| 2113 | 已合并（2026-10-20） | [#1231](https://github.com/AgoraIO/docs-portal/pull/1231)；最终`2537534d26`；四meta归档外链，12新回归/28定向、完整2877通过+2跳过，独立双审与本站四下拉/真实外链/本地4.6.0 UI通过，截图入报告。 | [`734ce7a16982`](https://github.com/AgoraIO/docs-portal/commit/734ce7a16982d88767c6340928cbbec73852c16d) |
| 2060 | 冻结源已回退，不恢复 | 后续源 #2094 回退且目标一致；不擅自恢复源终点不存在的修复，不计入portal机械补丁。 | — |

## 组合验收（不合并或推送组合分支）

基于固定基线逐项cherry-pick的独立验证树，前八项229文件/2934通过/2跳过，退出0，93.45秒；类型通过。前十一项组合在`f452f84662`执行中文完整生产构建退出0：6844 payload、8047机器可读、client与SSR及全站预渲染、7741路由HTML。浏览器确认think三action、三客户端消息表和字幕五种2.10安装，截图已入#1227报告；预览与专用会话已关闭。

随后加入2101、2069、2098；仅RTC Android发版首部发生预期文本冲突，主控保留CDN caution在前、包名迁移caution在后，两段均在首个版本前。其余文件自动合并，包含SDK共享目录；7定向文件165测试通过。后续2069补首页可见Beta元数据卡、2098修测试起止守卫，均有独立增量双审。

最终生产/回归代码HEAD`edf95162a6`：关闭中文范围开发预览与隔离浏览器后，无scope执行types成功；独占完整测试**236文件、3055通过、2跳过，退出0，82.40秒**。后续只cherry-pick报告及截图，验证树最终HEAD`460897ce9c`且干净、不推送。最后两项开发页面验收及截图通过；后加三项未重跑生产build，不能据前十一项构建推定这三项也完成生产构建。

## 2026-10-20 提交时的历史交付

以下保留实施结束时的交付状态；其中 OPEN、未合并、未部署均为当时记录，最新合并结果见本文顶部。

十四项无需归档策略的修复分别提交为#1217–#1230，目标分支均正确，未自动合并、未部署，不能称线上已生效。各项规格与质量均通过；所有最终生产/测试改动已包含上述组合完整回归。原用户主工作区三份未跟踪分析文档保留。

2026-10-20用户已批准D006，第二阶段六项均已提交：#1231、#1233–#1237，加上原十四项共20个独立修复PR（不含其他任务的#1232）。全部目标正确、OPEN、非draft，未合并或部署。历史API外链与当前API/指南补齐均按批准策略实施，旧锚点与平台差异保留；不宣称全站迁移债清零。

0.0.519早期HTTP软404保留；主控最终真实浏览器验证Android/iOS4.6.4原URL及SDK版本正确，并从生产菜单实际点击确认，因此两条已补齐；外站存在请求结果不一致风险，不承诺永久可用。macOS/C++使用同SDK4.6.2的已验证0.0.492备用。2060按冻结源回退不恢复。

最终20组合代码`2dcdf75b2b`：无scope types通过，243测试文件/3150通过/2跳过，exit0，106.05秒；中文完整build exit0，6846 payload/8053机器可读/7747路由HTML；真实生产UI通过。报告/截图追加后组合树HEAD`4e3442ed8c`，与代码HEAD相比仅reports/assets差异、树干净且不推送。专用浏览器/服务器关闭，用户工作区及其未跟踪文件保留。[完整验收](./2026-10-20-hotfix-phase2-verification.md)。
