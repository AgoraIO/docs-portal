# CN AI-Bot KB Phase 1 验证记录

日期：2026-10-15。分支：`codex/cn-ai-bot-kb-demo`。
基线：`d6f39b8fbb4d39a973e6c03b2f286fe76b82957d`（新版 CN 普通搜索开发分支）。
实现及审查修复：`5f9fbc125`、`f7a464d77`、`756df6f7c`、`2aec5f5a2`、`7255a8a82`。

## 交付与限制

已交付已发布 Markdown/HTML/manifest/sitemap 到 KB corpus 的离线导出、Metadata/稳定摘要、成功状态校验、确定性 create/update/delete/skip 规划及两个 CLI。代码位于独立 worktree，原 CN-NEWDOC 的其他修改未纳入。本分支没有修改普通搜索组件、查询 API、索引导出或发布流程，未增加依赖。

本阶段没有百炼请求、上传或删除，没有 push、PR、merge 或部署。缺少同版本完整发布产物，因此未运行全量构建或全量 corpus 验收。真实 KB 同步/检索、问答、持久化与并发、CI/CD 全链路仍是后续交付，不能把本记录视作 AI-Bot 完工。

## 验证

- `bun run test src/lib/ai-kb scripts/ai-kb src/lib/search`：173/173 通过（含 62 个新增测试）。
- `bun run types:check`：退出码 0，包含 Fumadocs 生成和 TypeScript 检查。
- `bunx --no-install biome check --write src/lib/ai-kb scripts/ai-kb package.json`：15 个文件检查通过。
- `git diff --check`：通过。
- 完整测试基线：2800 tests，2761 passed，37 failed，2 skipped。
- 最终完整测试：2862 tests，2823 passed，37 failed，2 skipped；新增 62 个测试全部通过。按文件路径和 fullName 对比，新增失败 0、消失失败 0；完整命令仍退出 1，不能宣称全套通过。JSON 未报告额外 runtime error suites；日志中保留原有 localhost 网络错误噪声。

CLI 测试实际通过 Bun 子进程执行，验证稳定输出、原成功状态字节不变、输入别名/路径越界保护及半份导出失败。测试数据均为临时发布 fixture，没有调用云服务。

## 独立审查

独立只读 reviewer 检查整个基线到实现提交范围。发现 3 个 Important、0 个 Critical、2 个 Minor。

三个 Important 均先写复现测试并观察失败，再修复：

1. 不能用 canonical 章节覆盖所有平台：现在逐个验证有导航资格的 sitemap 页面/平台 URL 必须有 route，每个可导出 route 必须有验证后的章节；保留普通搜索有意排除被平台变体替代的 canonical 页。
2. CN 平台容器四空格会把标题/语言围栏变成无语言代码：KB 层限定修复带渲染器锚点标记的块；通过 Markdown AST 验证标题和代码语言/内部缩进，普通代码与 fenced 示例不变。
3. 不同 sourceId 不能拥有同一 remoteId：现在拒绝跨条目冲突，而非生成同时 skip 和 delete 同一对象的矛盾计划。

## 决策与暂缓项

- 全局技能脚本缺执行位：使用 bash/等效手工 task 与 ledger 记录，未修改技能安装；代价是手工记录须保持完整。
- 样本不仅绑定 scope，还绑定 selection 身份集合；避免样本误配产生全量删除候选。代价是改变选样需要明确迁移范围。
- CLI 子进程使用 PATH 的 Bun，因 Vitest process.execPath 为 Node，不能运行本仓库 TS 导入；依赖已有 Bun 前提。
- 增加 files.ts 共用原子写入/别名保护；代价是多一个 IO 模块。
- 渲染器格式修复保留在 KB 层，与现有 CN 搜索识别规则对齐，不修改普通搜索生产逻辑；代价是渲染器变化时须同步核查两套规则。
- Reviewer 不判断的云端 API/格式转换、解析完成、检索/引用/模型、执行器恢复与未知结果、远端替换/删除、日志/锁/命名空间/并发、AI UI/网关/CI/CD，均明确归后续里程碑；代价是当前不能宣称在线 AI-Bot 可用。
- 同 SHA 全量验收缺证据；revision 由调用方保证对应不可变构建，隐藏/导航外页面沿用当前 allowlist；代价是正式全量与下游切块仍需实测。
- 基线失败按完整文件和 fullName 比较，不顺手修复无关内容/导航/渲染；代价是仓库整体集成门禁仍红，本阶段不合并/推送/部署。

暂缓的两个 Minor：拒绝合法 percent-encoded 空格及部分保留字符路径；拒绝含第二个 # 的 fragment。未确认当前发布内容存在对应实例；如果今后出现，应补契约和测试后支持，当前会显式失败。

## 完整测试的基线失败清单

以下 37 个用例在产品代码实施前就失败：

| 文件 | 用例 fullName |
| --- | --- |
| `scripts/api-center-navigation-runner.test.ts` | API Center navigation runner keeps the PR 847 cloud transcoding REST navigation unchanged |
| `scripts/audit-doc-links.test.ts` | auditDocsLinks keeps the OpenAPI generated route list aligned with the site registry |
| `src/routes/-docs-routing-guards.test.ts` | docs route locale guards keeps llms index feed English-only |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars adds the ordinary docs destination for api-ref,console |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars keeps the reference resources together in the Reference tab |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars keeps the Conversational AI RESTful lane API-only and under Reference Center |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars keeps the Whiteboard RESTful lane API-only and under Reference Center |
| `src/lib/api-reference-no-endpoint-leak.test.ts` | api reference sidebar does not leak REST endpoint pages keeps the Chinese Speech-to-Text lane out of root navigation and lists focused endpoints |
| `src/lib/docs-content-regressions.test.ts` | docs content regressions keeps realtime video get-started-sdk sections that were missing in the PDF review |
| `src/lib/docs-content-regressions.test.ts` | docs content regressions keeps CodeBlockTab panels code-only |
| `src/lib/docs-content-render-regressions.test.tsx` | docs content render regressions renders a Chinese page through the upgraded MDX component runtime |
| `src/lib/docs-journeys.test.ts` | docs journeys keeps zh-CN RTC API navigation versioned while English uses canonical Voice and Video reference docs |
| `src/lib/docs-single-folder-sections.test.ts` | single-folder docs sections does not keep navigation sections whose only page is another folder |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links embeds realtime-media/danmaku 服务端 API as a collapsed API sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links embeds solutions/meeting 服务端 API as a collapsed API sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links embeds solutions/online-ktv,online-ktv-sdk 服务端 API as a collapsed API sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links reads the service API leaf from the Chinese solutions product metadata |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links merges the VoIP service API leaves into one product sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links keeps single-page teleoperation API entries as direct product links |
| `src/lib/rtc-mini-program-client-content.test.ts` | RTC mini-program Client reference starts with the constructor reference instead of TypeDoc indexes |
| `src/lib/rtc-mini-program-client-content.test.ts` | RTC mini-program Client reference keeps each on overload with its own documentation |
| `src/lib/rtc-mini-program-client-content.test.ts` | RTC mini-program Client reference uses the legacy-style table layout for every parameter and return block |
| `src/lib/zh-cn-product-ia-standard.test.ts` | zh-CN product IA standard keeps every route from the prior staging manifest publishable |
| `src/lib/zh-cn-product-navscope-content.test.ts` | zh-CN product nav scope content keeps RTC overview as the Voice and Video product entry target |
| `src/lib/zh-cn-reference-order.test.ts` | zh-CN product reference ordering keeps the approved order for realtime-media/meeting/reference/meta.json |
| `src/lib/zh-cn-reference-order.test.ts` | zh-CN product reference ordering keeps the approved order for realtime-media/rtsa/reference/meta.json |
| `src/components/faq/faq-content-sync.test.tsx` | faq content integrity keeps zhCnFaqItems 1:1 with Chinese article pages |
| `src/components/faq/faq-content-sync.test.tsx` | faq content integrity keeps Chinese FAQ navigation schema aligned with English FAQ |
| `src/components/faq/faq-content-sync.test.tsx` | faq content integrity does not leave zh-CN docs pointing at legacy FAQ routes |
| `src/components/docs-overview/ApiReferenceCards.test.tsx` | ApiReferenceCards keeps every internal API reference card link pointed at an existing route file |
| `src/components/docs-shell/DocsSidebar.reference-navigation.test.tsx` | DocsSidebar Reference navigation folds FAQ categories into the standard Reference tree |
| `src/components/openapi/FumadocsOpenApiContent.test.tsx` | FumadocsOpenApiContent matches fieldless states to boolean and map schema rendering |
| `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts` | legacy sitemap compatibility audit allows the current zh-CN small Build migration redirects outside the sitemap snapshot |
| `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts` | legacy sitemap compatibility audit does not keep stale redirect records outside the sitemap snapshot |
| `src/lib/legacy-sitemap/static-redirects.test.ts` | static legacy sitemap redirects marks all 76 flattened zh-CN Build routes as permanent redirects |
| `src/lib/legacy-sitemap/static-redirects.test.ts` | static legacy sitemap redirects uses exactly the application-layer small Build redirect sources for permanent status |
| `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts` | legacy redirect Vercel artifacts ships every zh-CN small Build flattening redirect directly to its canonical URL |
