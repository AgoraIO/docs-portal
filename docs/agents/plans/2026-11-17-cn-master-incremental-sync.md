# 中文旧站增量同步执行计划（2026-11-17）

> 执行方式：按 using-git-worktrees、writing-plans、subagent-driven-development 和 fumadocs-migration 完成内容同步、规范审查与质量复核。

**目标：** 将旧站 0.0.544 至 0.0.546 的缺失增量同步到基于当前本地分支建立的工作树。

**架构：** 固定 Git 对象进行源前、源后与目标三方比较，逐文件记录处置。保留新站既有平台、锚点、导航和独立改进；旧站只读。

**技术：** Git、GitHub CLI、Bun、Fumadocs MDX、既有 API 导入器。

## 固定基线

- 目标基线：`472e0250ff2c4a61bf7a0f10a472628192b33f31`，原分支 `codex/cn-newdoc-html-api-migration`。
- 工作分支：`codex/cn-master-hotfix-20261117`。
- 上批 #1434 已于 `2026-11-16T07:45:02Z` 合并为 `9e6f1a68baf96b8517e43d4e9ab4aad7aaa69001`。
- 源起点：`8fd46d74070a18dcb46ef943f6d6768590be9bca`；源终点：`b9aa4166a265ad2693ced2ce36ea4a7d5e21e826`。
- 8 个 first-parent 提交，6 个内容 PR：#2147、#2157、#2152、#2153、#2148、#2159；153 个净变化文件。
- 当前目标远端比用户指定的本地基线领先 4 个提交；按用户要求保留本地基线，不隐式合入远端。

## 任务

- [x] 创建并附加原生工作树，在指定本地提交创建工作分支，确认上批合并与源范围。
- [x] 冻结安装 539 个依赖并完成基线测试（367 文件通过、1 跳过；6071 项通过、23 跳过）；旧站语法审计已执行。
- [x] RTC：同步 #2147、#2152 的集成、下载、指南、发版说明和 Web API 增量；核对 #2157 与目标 #1432，记录已覆盖内容。现有入口位于 `content/docs/zh-CN/realtime-media/rtc/**`、`content/docs/zh-CN/api-reference/rtc/**` 及相关 FAQ；API 以既有迁移清单与导入器定位，保留新站锚点。
- [x] RTM 实践：将 #2153 的五平台十篇实践与四份流程图迁移到 `content/docs/zh-CN/realtime-media/rtm/**`，沿用现有 Web 实践和平台语法，更新相关 meta 导航。
- [x] RTM 2.3.1：同步 #2148、#2159 的 presence API、功能列表、限制、配置、错误码、下载、发版和 FAQ，修正最终发布日期与 CocoaPods 依赖。英文源镜像不自动写入英文站。
- [x] 逐文件及逐 PR 台账：创建 `docs/migration/cn-master-sync-20261117.{md,json}` 和 `cn-master-sync-20261117-ledger.json`，更新 `cn-hotfix-checkpoint.md`。记录源前后/目标哈希、排除项、已有覆盖和待办。
- [x] 规范审查：独立复核源增量、平台覆盖、导航、链接、旧锚点及台账完整性，修复发现后复核。
- [x] 质量复核：`bun run test --maxWorkers=2`、`bun run types:check`、`bun run docs:tables`、`bun run qa:api source --region cn`、受影响链接审计、中文构建及页面阅读。日志和截图仅置于 ignored `.agent/artifacts/hotfix-20261117/`。

## 接受边界

本批不自动部署；有效源断点只有实际合入目标后推进。延续上批图片上传、源语义疑义及长 OpenAPI 示例手机工具栏待办。机器验证不代替 API owner 语义接受、独立人工阅读或生产发布决定。
