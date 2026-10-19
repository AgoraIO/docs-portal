# 本地 KB + 千问 demo 验证记录（2026-10-16）

## 范围与实际结果

分支 `codex/cn-ai-bot-kb-demo`，在独立 worktree 实现；原 `CN-NEWDOC` 工作区未修改。本轮在已批准的本地链路上继续，用户确认先跑通问答，MCP 后续再接。

- 现有 5 篇真实文档语料，运行时重建 88 个 MDX 片段，中文分词与关键词排序后交给共享回答编排器。
- 新增 `local-kb`：只用本地文档检索 + 真实千问；保留 `local-demo` 摘录与 `bailian` 托管检索模式。
- 抽取共用千问生成和受限 HTTP 处理。独立审查发现的不同检索/模型 Key 回显回归已补测试并修复。
- 私下复用旧 demo 的模型 Key 到忽略的 `.env.local`（权限 600）；值未写入报告、日志输出或 Git。
- 未创建/导入百炼托管 KB；未添加 MCP；普通搜索、Meilisearch 索引和构建发布代码未改。

## 真实联调

`bun run dev:ai-local` 启动于 `127.0.0.1:3008`，已从页面提问并显示回答/章节引用：

| 场景 | 结果 |
| --- | --- |
| Web Token 过期处理，服务端强制 web 筛选 | HTTP 200 / local-kb / answered；千问回答到期前 30 秒回调、renewToken 及到期后 join；引用 Web Token 过期处理章节 |
| 同一问题从浏览器提交 | 页面真实模型回答与参考链接正常；显示“本地知识库检索，百炼模型生成” |
| 创建智能体的 HTTP 方法/路径，type=openapi | HTTP 200 / answered；`POST /v2/projects/{appid}/join`，引用创建智能体文档 |
| 北京天气 | HTTP 200 / no-evidence；没有引用；没有依据时不调用模型的分支另有自动化测试 |

当前本机普通搜索服务未连接，页面可能提示搜索暂不可用、筛选选项为空；这是独立服务状态。AI 测试不依赖 Meili，服务端筛选通过直接 API 和自动化测试验证。

## 自动化与审查

- 新增用例先红后绿：本地 KB 模型接入、无依据不调模型、中文自然问题召回、UI 模式展示、两种 Key 不同时的回显拦截。
- 聚焦：`bun run test src/lib/ai-answer src/lib/ai-kb scripts/ai-kb src/components/search/AiAnswerPanel.test.tsx src/components/search/DocsSearchPage.test.tsx`：17 文件 / 198 测试通过。
- `bun run types:check`：通过。
- `bun run build:service`：通过；复用现有文档产物，未重跑耗时全站构建。
- Biome 检查本次修改的代码：无错误；旧测试字符串拼接存在 info 提示。
- 独立 fresh review 复核修复后，两份问答测试 37 项通过，无进一步 actionable findings。
- 最终全量 `bun run test --reporter=json --outputFile=/tmp/local-kb-full-final.json`：2988 总测试，2949 通过，37 失败，2 跳过。按文件 + 完整测试名与上轮 `/tmp/bailian-full.json` 比较，37 项失败集合完全相同，没有新增失败。

## 全量测试的既有失败

以下逐项列出本轮仍失败的测试；不将全量套件称为通过。

| 文件 | 测试 |
| --- | --- |
| `scripts/api-center-navigation-runner.test.ts` | API Center navigation runner keeps the PR 847 cloud transcoding REST navigation unchanged |
| `scripts/audit-doc-links.test.ts` | auditDocsLinks keeps the OpenAPI generated route list aligned with the site registry |
| `src/components/docs-overview/ApiReferenceCards.test.tsx` | ApiReferenceCards keeps every internal API reference card link pointed at an existing route file |
| `src/components/docs-shell/DocsSidebar.reference-navigation.test.tsx` | DocsSidebar Reference navigation folds FAQ categories into the standard Reference tree |
| `src/components/faq/faq-content-sync.test.tsx` | faq content integrity does not leave zh-CN docs pointing at legacy FAQ routes |
| `src/components/faq/faq-content-sync.test.tsx` | faq content integrity keeps Chinese FAQ navigation schema aligned with English FAQ |
| `src/components/faq/faq-content-sync.test.tsx` | faq content integrity keeps zhCnFaqItems 1:1 with Chinese article pages |
| `src/components/openapi/FumadocsOpenApiContent.test.tsx` | FumadocsOpenApiContent matches fieldless states to boolean and map schema rendering |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars adds the ordinary docs destination for api-ref,console |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars keeps the Conversational AI RESTful lane API-only and under Reference Center |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars keeps the Whiteboard RESTful lane API-only and under Reference Center |
| `src/lib/api-center-scoped-sidebar.test.ts` | API Center scoped sidebars keeps the reference resources together in the Reference tab |
| `src/lib/api-reference-no-endpoint-leak.test.ts` | api reference sidebar does not leak REST endpoint pages keeps the Chinese Speech-to-Text lane out of root navigation and lists focused endpoints |
| `src/lib/docs-content-regressions.test.ts` | docs content regressions keeps CodeBlockTab panels code-only |
| `src/lib/docs-content-regressions.test.ts` | docs content regressions keeps realtime video get-started-sdk sections that were missing in the PDF review |
| `src/lib/docs-content-render-regressions.test.tsx` | docs content render regressions renders a Chinese page through the upgraded MDX component runtime |
| `src/lib/docs-journeys.test.ts` | docs journeys keeps zh-CN RTC API navigation versioned while English uses canonical Voice and Video reference docs |
| `src/lib/docs-single-folder-sections.test.ts` | single-folder docs sections does not keep navigation sections whose only page is another folder |
| `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts` | legacy sitemap compatibility audit allows the current zh-CN small Build migration redirects outside the sitemap snapshot |
| `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts` | legacy sitemap compatibility audit does not keep stale redirect records outside the sitemap snapshot |
| `src/lib/legacy-sitemap/static-redirects.test.ts` | static legacy sitemap redirects marks all 76 flattened zh-CN Build routes as permanent redirects |
| `src/lib/legacy-sitemap/static-redirects.test.ts` | static legacy sitemap redirects uses exactly the application-layer small Build redirect sources for permanent status |
| `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts` | legacy redirect Vercel artifacts ships every zh-CN small Build flattening redirect directly to its canonical URL |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links embeds realtime-media/danmaku 服务端 API as a collapsed API sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links embeds solutions/meeting 服务端 API as a collapsed API sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links embeds solutions/online-ktv,online-ktv-sdk 服务端 API as a collapsed API sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links keeps single-page teleoperation API entries as direct product links |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links merges the VoIP service API leaves into one product sidebar section |
| `src/lib/product-api-reference-sidebar.test.ts` | product API reference sidebar links reads the service API leaf from the Chinese solutions product metadata |
| `src/lib/rtc-mini-program-client-content.test.ts` | RTC mini-program Client reference keeps each on overload with its own documentation |
| `src/lib/rtc-mini-program-client-content.test.ts` | RTC mini-program Client reference starts with the constructor reference instead of TypeDoc indexes |
| `src/lib/rtc-mini-program-client-content.test.ts` | RTC mini-program Client reference uses the legacy-style table layout for every parameter and return block |
| `src/lib/zh-cn-product-ia-standard.test.ts` | zh-CN product IA standard keeps every route from the prior staging manifest publishable |
| `src/lib/zh-cn-product-navscope-content.test.ts` | zh-CN product nav scope content keeps RTC overview as the Voice and Video product entry target |
| `src/lib/zh-cn-reference-order.test.ts` | zh-CN product reference ordering keeps the approved order for realtime-media/meeting/reference/meta.json |
| `src/lib/zh-cn-reference-order.test.ts` | zh-CN product reference ordering keeps the approved order for realtime-media/rtsa/reference/meta.json |
| `src/routes/-docs-routing-guards.test.ts` | docs route locale guards keeps llms index feed English-only |

## 边界

检索为小样本关键词检索，尚未验证向量召回/重排或全站效果。只校验引用来源合法与片段匹配，仍须人工核对模型事实。接口默认关闭且生产环境禁用。模型使用原账号适用的额度/计费；本地 KB 不产生托管实例费用。尚未推进云 KB、MCP、CI/CD、发布或合并。

运行和测试步骤：[本地问答 demo](../../ai-kb/local-answer-demo.md)。本地截图保存在当前 worktree 的 `.superpowers/local-kb-model-demo.png`，不纳入 Git。
