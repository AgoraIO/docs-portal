# 中文旧站增量同步执行计划（2026-11-16）

> 执行方式：在当前隔离工作区按任务顺序完成，遵循 writing-plans / executing-plans 与 fumadocs-migration；逐项记录验证结果。

**目标：** 从上批已合并源终点 0.0.542 同步到固定 0.0.544，并形成可复核的逐 PR、逐文件台账。

**架构：** 以旧站固定 Git 对象为事实源，采用源前、源后、目标三方对照；只补缺失内容，保留新站导航、格式和独立改进。旧站只读。

**技术：** Git、GitHub CLI、Markdown/MDX、OpenAPI YAML、Bun/Vitest。

## 固定基线

- 源起点：`b5f0771fd840b2e6c45b28357c206bbe94129767`（0.0.542）；源终点：`8fd46d74070a18dcb46ef943f6d6768590be9bca`（0.0.544）。
- 上批目标 PR #1407 已于 2026-11-10T08:48:11Z 合并，提交 `bc846d6069704872f168b95494b8534b7e9129bd`。
- 目标：`codex/cn-newdoc-html-api-migration@a02a0f9ce230d4be857ecfc8384a69669b40bfc0`。
- 工作分支：`codex/cn-master-hotfix-20261116`；主工作区已有生成文件修改保留。

## 任务

- [x] 读取统一断点及 11 月 10 日报告，联网确认 #1407 的合并状态。
- [x] fetch 两仓库后固定基线；以 first-parent 提交和 GitHub merged PR 双向核对 7 提交、3 内容 PR、28 净变化文件。
- [x] 核对源 #2146 与目标 #1398/#1406：两篇正文、概览、侧栏、Demo 入口、六个流程图及预览图。逐文件记录已有覆盖或明确排除，不重做目标改进。
- [x] 源 #2142：更新 `content/docs/zh-CN/api-reference/conversational-ai/agent-{go,python,typescript}/index.mdx`、`content/docs/zh-CN/ai/release-notes.mdx` 和 `content/openapi/conversational-ai/rest-api.zh-CN.yaml`。保留参数、示例、原锚点和目标现有用语，使用新站 API 路径及版本折叠。
- [x] 源 #2155：更新 `content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording.mdx` 的白板示例和配置说明。
- [x] 创建 `docs/migration/cn-master-sync-20261116.{md,json}` 与 `cn-master-sync-20261116-ledger.json`：逐 PR 记录合并时间、提交、目标映射、实际处置；逐文件记录源前/后和目标哈希；直接提交亦必须分类。
- [x] 更新 `docs/migration/cn-hotfix-checkpoint.md`：确认上批生效，本批保持待目标合并；携带既有图片上传与源疑义待办。
- [x] 验证（已执行；手机工具栏 P2 按用户决定另批修复，不记为所有读验全通过）：源码保真/锚点、operation 集合不变、相关链接、`bun run docs:tables`、`bun run qa:api source --region cn`、`bun run test --maxWorkers=2`、`bun run types:check`、Lint 与中文构建/受影响页阅读。记录实际通过和未完成边界，生成截图仅放 ignored `.agent/artifacts/`。

## 接受边界

本批不自动合并或生产部署，不把代理验证冒充 API owner 或独立人工接受。有效源基线只有在本批目标实际合并后才推进。图片沿用当前目标已存在资产，历史待办不隐式关闭。
