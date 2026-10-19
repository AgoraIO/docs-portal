# RTM #2069 小程序完整补齐计划

按用户批准的逐源 PR 工作流，创建独立 `fix-hotfix-pr2069` 工作树与 `codex/fix-hotfix-pr2069` 分支，最终 PR 进 `codex/cn-newdoc-html-api-migration`，不自动合并。

固定源 `def3eac1345f015792dd57b3944ec8cb01cc3c98`，终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标基线 `7c6c60ead44406e69906c5c3808cd489784aa89e`。完整 36 源文件、10 shared/457 mini-program 符号的映射要落入报告，不以存在平台块或全页关键词代表内容完整。

## 唯一批准生产写集（10 文件）

1. `content/docs/zh-CN/realtime-media/rtm/index.mdx`：现有卡片模式增加小程序（Beta）快速开始入口，介绍链接带 mini-program 平台参数。
2. `src/components/docs-overview/sdk-downloads-data.zh-cn.ts`：复用既有 mini category/product 映射，新增源 npm 包 shengwang-rtm-miniapp、2.3.0-beta.0、2026-07-16；没有 ZIP/MD5，不编造。
3. `content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits.mdx`：补全页平台范围，小程序支持 Message 与 User，不支持 Stream/Topic，保留既有3.1局部 note，不回滚统一限制。
4. `content/docs/zh-CN/realtime-media/rtm/build/messaging/send-message.mdx`：源同 hunk 的 Web 与小程序 USER 两例使用 userId/Tony；小程序负载仅 Message32KB及publish，不套用Stream/Topic1KB或PublishTopicMessageOperation。
5. `content/docs/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-events.mdx`：按源恢复 Web/mini-program Announce/Interval 两模式8–128范围，不沿用原生2.3.0的512策略。
6. `content/docs/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-basic.mdx`：仅小程序两处 RtmConfig → RTMConfig。
7. `content/docs/zh-CN/realtime-media/rtm/build/troubleshooting.mdx`：仅小程序 -11006/-15003 符号按终点恢复为 RTM_ERROR_CHANNEL_IN_ERROR_STATE / RTM_ERROR_HISTORY_OPERATION_TIMEOUT。target #1185 无明确后续修订依据，其他平台不动。
8. `content/docs/zh-CN/realtime-media/rtm/get-started/quick-start.mdx`
9. `content/docs/zh-CN/realtime-media/rtm/reference/capabilities-and-compatibility/feature-list.mdx`
10. `content/docs/zh-CN/realtime-media/rtm/reference/release-notes.mdx`

最后三页仅本源新增小程序 caution 语义从错误 warning 恢复，不全局改提示。其余新增页/共享展开已在且需逐项证据保护。不新建独立小程序 API 页面、运行时组件或导航架构。

## 实施与验收

- 新增 `src/lib/rtm-pr2069-sync.test.ts`，先对真实平台块/表格/数据消费者验证RED，再最小补齐GREEN。测试要覆盖能力边界、USER示例/负载、Presence模式、不影响原生/其他产品、错误名和severity；不要仅搜整页同名关键词。
- 报告 `docs/agents/reports/2026-10-19-hotfix-pr2069-fix.md` 包含36文件与shared闭包、已在/修复/源矛盾/遗留债分类。175共同正文+3其他平台的 alias.key 占位在 #1185 前已有，不夹带全平台重构；新增mini块未展开占位数为0，但两错误名/RTMConfig属于本源实缺必须修。
- 轻量定向、类型、所有修改MDX实际编译/语法、links、Biome、最小差异/范围保护；锁文件/其他产品/英文不改。需要UI渲染验收，由主控统一排队预览。
- full/build/preview由主控独占调度，实施者未经授权不得自启。独立spec后独立quality，root复跑与组合验收后推送建PR。已建PR不称已合入或线上。
