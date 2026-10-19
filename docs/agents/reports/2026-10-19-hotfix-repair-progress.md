# 中文热更新逐 PR 修复进度

本表追踪源 PR 对应修复，原覆盖审计仍是 `7c6c60ead4` 的历史快照。创建修复 PR 不等于已合入或线上生效。

- 已批准方式：当前会话主控，首两项串行建立标准，之后仅实际写集不重叠的产品组有限并行；每个源 PR 独立工作树、分支、修复 PR。
- 目标分支：`codex/cn-newdoc-html-api-migration`。
- 计划：[首两项与后续队列](../plans/2026-10-19-hotfix-repair-first-two.md)。仓库忽略 `docs/superpowers/plans`，计划存于可追踪的 agents 目录，不修改忽略规则。

| 源 PR | 状态 | 修复 PR / 备注 |
| --- | --- | --- |
| 2107 | PR 已提交，待审 | [#1217](https://github.com/AgoraIO/docs-portal/pull/1217)；提交 `7d63c17bae`；三条命令补齐，TDD 3 红→3 绿，全量 2868 通过/2 跳过；规格与质量审查通过。 |
| 2077 | PR 已提交，待审 | [#1218](https://github.com/AgoraIO/docs-portal/pull/1218)；提交 `9d5d6c067c`；6 红/4 保护→10 绿，全量 2875 通过/2 跳过，MDX/锚点/双审通过。 |
| 2063 | PR 已提交，待审 | [#1221](https://github.com/AgoraIO/docs-portal/pull/1221)；`151276f3c7`；TS 参数与 Python 表归属均修正，7 绿/全量 2872 通过+2 跳过，双审通过。 |
| 2074 | 排队 | AI 2.12 / think / 共享片段。 |
| 2101 | 排队 | AI 2.13 API。 |
| 2085 | 排队 | Android/iOS 4.6.4 API。 |
| 2084 | 排队 | Flutter/RN API 与下载。 |
| 2094 | 排队 | RTC 4.7 API 全量有效语义。 |
| 2056 | 实施中 | 新隔离组，仅补 Token 回调描述；结果回调已在 current，可先于归档/API 大项补齐，不动其范围。 |
| 2108 | 实施中 | 新隔离组，Android 发版全局 caution / 裁包前置 CDN 引导。 |
| 2098 | 排队 | RTC 4.7 指南。 |
| 2067 | 排队 | RTM Web 2.3。 |
| 2069 | 排队 | RTM 小程序入口/限制。 |
| 2065 | PR 已提交，待审 | [#1219](https://github.com/AgoraIO/docs-portal/pull/1219)；`1b98376196`；5 绿/全量 2870 通过+2 跳过，双审通过。 |
| 2106 | 实施中 | 新隔离组，只补 Web 视频审核前置条件，Android/iOS 保护。 |
| 2083 | 已完成实施前准备，未修复 | [边界与风险](./2026-10-19-hotfix-pr2083-preparation.md)；含两份共享示例与 40 HTML 完整分类，归档/源码链接适配仍需确认。 |
| 2109 | 排队 | 云录制机器人费用副本。 |
| 2091 | 排队 | 云录制 raw 文档副本。 |
| 2110 | PR 已提交，待审 | [#1220](https://github.com/AgoraIO/docs-portal/pull/1220)；`6df0a99e52`；仅删旧图，7 绿/全量 2872 通过+2 跳过，双审通过。 |
| 2113 | 待方案确认 | 历史 API 本地迁移或归档外链，不猜测。 |
| 2060 | 待源侧确认 | 后续源 #2094 回退；不计入 portal 机械修复。 |
