# zh-CN 全局产品 IA 迁移进度

## 2026-07-07

- 用户要求从单产品试点扩展为全局一起更新，并强调 `build` 内部需要按照用户心智创建内容。
- 已确认当前分支为 `codex/ia-rtc-solutions-duplicate-docs`，本地预览为 `http://127.0.0.1:3001/`。
- 已将工作计划从上一轮平台后缀收敛切换到全局产品 IA 迁移。
- 用户补充移动后的路径必须确保不出现断链；已加入验收条件。
- 已清理误改范围：`content/docs/zh-CN/api-reference` 正文恢复，`content/docs/zh-CN/ai` 只保留共享 MCP/Skills 删除与 meta 清理。
- 已整理智能门铃产品根：`index` 为产品概览，PaaS 概览移动到 `build/paas/paas-overview`，并同步重定向表和迁移 CSV。
- 已修复 scoped 审计发现的页面级断链：IoT aPaaS REST 文档、one-to-one-live API 参考相对链接、VoIP 概览 RTSA 链接。
- 已通过 scoped 路由级链接审计：759 个文件、21636 个链接，页面路由级问题 0。
- 已通过验证：Biome check、目标 Vitest、`bun run types:check`、`git diff --check`、本地预览旧/新 URL 抽检。
