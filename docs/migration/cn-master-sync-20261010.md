# 中文新站同步记录（2026-10-10）

- 源仓库：`shengwang-doc-source@5d03551cf`（`origin/master`）
- 目标基线：`docs-portal@99e7f81b4`（`origin/codex/cn-newdoc-html-api-migration`）
- 目标分支：`codex/cn-newdoc-master-sync-20261010`

本次同步把共同基线之后的中文文档变更转换为 docs-portal 的 Markdown/MDX/OpenAPI 格式，覆盖 RTC、RTM/RTM2、ConvoAI、RTSA、云端录制、内容审核、媒体推流、微呼叫和智能门铃等内容。旧站生成 HTML 没有直接复制；对应语义已写入目标 API MDX。新增的 RTM2 小程序、ConvoAI ASR 热词/承接词/自定义工具页面使用目标站目录和 `meta.json` 导航。

同步前固定读取了源仓库 `origin/master`，没有使用其他工作区的补丁或未提交结果。`bun run openapi:sync` 已执行并完成静态 OpenAPI 复制；`git diff --check` 和目标新增目录的 MDX 静态语法审计已通过。完整 `bun run types:check` 受当前工作区依赖缺失阻塞：`fumadocs-core/mdx-plugins` 未安装。
