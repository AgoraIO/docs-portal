# 404 路径重定向修复设计

## 目标

修复线上复核确认仍返回 HTTP 404 的历史文档路径，但只为能够用仓库内容或线上目标验证的路径添加重定向。无法安全判断目标的路径继续保留在待处理清单中，不通过猜测目标来消除 404。

输入清单为 `output/posthog/404-revalidation-2026-10-08.json` 中 `is_http_404: true` 的 690 个路径。36 个当前已经返回 HTTP 200 的路径不再修改。

## 方案

新增一份独立的、经过复核的 PostHog 404 重定向源文件，并接入现有 legacy redirect artifact 生成器。每条批准的规则记录旧路径、目标地址、映射类型、置信度、证据和是否保留查询参数；生成器继续负责产出静态 fallback、Vercel bulk/config redirects 和运行时 fallback 所需的产物。

候选路径按以下顺序处理：

1. 复用仓库已有的明确映射；如果规则已经存在但线上仍为 404，先验证生成产物和线上部署，避免重复添加。
2. 对旧产品目录、旧 slug 和旧 API Reference 路径，只在目标能由当前英文文档 inventory 或已审核外部 API Reference URL 唯一确认时添加 301。
3. 对同一路径存在平台或 query-specific 目标的情况，使用现有 query-aware rule 机制；不能丢失平台参数或把多个平台合并到错误目标。
4. 对无法唯一确认、疑似爬虫错误、模板变量、双重编码或已经没有对应内容的路径不添加重定向，并在复核报告中标为 unresolved。

所有内部目标必须在当前英文文档 inventory 中存在；外部目标必须在复核时返回可接受的成功响应。规则默认保留查询参数，只有目标明确不应继承查询参数时才关闭 `preserveSearch`。

## 数据流和文件边界

- `output/posthog/404-revalidation-2026-10-08.json`：线上观测输入，只读，不作为生产运行时数据。
- `src/lib/legacy-sitemap/posthog-revalidated-404s.json`：本轮批准的映射源，按现有 legacy rule schema 保存。
- `scripts/generate-legacy-redirect-artifacts.mjs`：读取新映射源，并将其合并到现有 artifact 输入。
- `src/lib/legacy-sitemap/posthog-404-redirects.test.ts`：验证批准映射、目标存在性、生成产物覆盖和无冲突。
- `src/lib/legacy-sitemap/static-redirects.json`、`vercel-legacy-redirects.json`、`vercel.json`：由生成器更新，不手工维护。
- `output/posthog/404-revalidation-2026-10-08.md`：记录本轮已修复、仍未解决和验证结果，供后续继续处理。

## 验证

实现前先为映射源和生成器接入写失败测试。实现后运行：

- 针对 legacy redirect、生成器和新增映射的 Vitest 测试。
- `bun run openapi:sync` 不涉及本次修改，不执行无关同步。
- `bun run types:check` 和 `bun run lint`。
- 重新生成 redirect artifacts，并检查源规则、静态 fallback、Vercel 配置之间的覆盖一致性。
- 对批准的旧路径线上发起 GET 请求，跟随重定向，确认最终不再返回 404；同时保留 unresolved 路径的清单。

本轮不修改 PostHog 埋点逻辑，不把未验证的路径批量重定向到首页、产品 overview 或任意相似 slug。
