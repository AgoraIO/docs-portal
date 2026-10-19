# CN AI-Bot 本地问答链路 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 不创建云资源，通过现有 corpus 和明确标记的本地摘录演示，打通独立问答 API、新搜索页交互及引用约束。

**Architecture:** 后端通过注入的 retrieve/generate 接口编排，按受控 corpus 校验来源和平台后才生成回答。当前 runtime 仅支持 local-demo，基于本地 corpus 匹配并摘录，默认关闭，生产环境拒绝启用。UI 使用同源 POST /api/ai/answer，独立面板不改变普通搜索请求。

**Tech Stack:** TypeScript、React、TanStack Start、Vitest；复用 unified/remark-parse，不加依赖。

**Spec:** docs/superpowers/specs/2026-10-15-cn-ai-bot-kb-demo-design.md 第 6–8 节，及用户确认的暂缓建库、先完成本地链路安排。

## Global Constraints

- 延续 codex/cn-ai-bot-kb-demo 隔离工作区，不修改原 CN-NEWDOC。
- 不建库、不上传、不调用百炼/模型；不读取 Key、不写 Meili 索引。
- 模拟摘录不代表模型回答或百炼检索质量，页面与响应均标记 local-demo。
- 服务默认 503；仅 AI_BOT_MODE=local-demo、非 production 且配置绝对 AI_BOT_CORPUS_PATH 时启用。
- VITE_AI_BOT_DEMO=true 显式开启页面入口，默认页面维持原行为。
- 问题最多 2000 字符，请求最多 16KiB；上下文最多 6 段、每段 3000 字符；单次总超时 15 秒、零自动重试。
- 引用只用 corpus 中的页面/章节 URL，不采用模型给定 URL；无法确定章节则回退页面。
- 用户请求不触发任何同步；CI/CD、真实云端联调与流式输出仍另行验收。

## Review Focus

1. 未知来源、错误产品/平台/版本/类型的检索命中不得进入上下文。
2. 缺少证据或输出含未知引用，不展示看似有依据的回答。
3. 新问题、改筛选、关闭、取消时旧请求的延迟响应不得覆盖新状态。
4. 恶意 Markdown、模型 URL 和原始上游错误不得执行或泄露。
5. 默认关闭、production 拒绝本地模式、service build 注册路由，普通搜索继续可用。

### Task 1: 问答契约和可注入编排器

**Files:** src/lib/ai-answer/contracts.ts、answer.server.ts 与 answer.server.test.ts。

**Interfaces:** `AnswerRequest={question,product?,platform?,version?,type?}`；`Evidence={id,sourceId,text,sectionUrl?}`；`GeneratedAnswer={markdown,evidenceIds}`；`AnswerResponse={mode,status,answer,citations}`。`createAnswerService({corpus,retrieve,generate,timeoutMs?})` 返回 `(input,signal?) => Promise<AnswerResponse>`，retrieve/generate 只收到限定输入与合并超时 signal。

- [x] 写失败测试：`expect(await answer({question:'Token',platform:'web'})).toMatchObject({status:'no-evidence',citations:[]})`，检索器返回 Android 与未知 sourceId，生成器不可被调用。
- [x] 运行 `bun run test src/lib/ai-answer/answer.server.test.ts`，观察模块缺失失败。
- [x] 实现请求解析、来源白名单/筛选、去重/上下文限额、引用映射、超时/取消；生成器引用集合必须非空且完全属于本次证据，失败拒绝回答。corpus 通过既有 parseKbCorpus 校验。
- [x] 增加代码围栏保留、章节回退、未知引用、无证据不调用生成、错误及超时测试，运行通过。
- [x] 提交 `feat: add grounded document answer orchestration`。

### Task 2: 本地摘录模式和独立 HTTP 入口

**Files:** src/lib/ai-answer/local-demo.server.ts、answer-api.server.ts 及测试，src/routes/api/ai/answer.ts，src/router.service.ts。

**Interfaces:** `createLocalDemoAnswer(corpus)` 复用 Task 1 服务，返回 mode=local-demo；`handleAnswerRequest(request, options?)` 提供依赖注入测试，实际模式从服务端环境读取，文件大小最大 20MiB，corpus 限定最多 100 篇 demo 文档。HTTP 响应 no-store、固定公开错误码，不回显内部错误。

- [x] 写失败测试 `expect((await handleAnswerRequest(request,{env:{}})).status).toBe(503)`；额外测试真实 Request/Response 的错误 JSON、超限、跨站请求、production、取消及成功摘录。
- [x] 运行 `bun run test src/lib/ai-answer/answer-api.server.test.ts`，确认失败。
- [x] 实现流式读取请求大小上限、JSON/字段校验、同源检查、关闭保护、读取本地 corpus 和确定性关键词摘录。无关键词命中返回 no-evidence，不能总是返回第一篇。
- [x] 注册 POST 路由至普通路由树和 service router；不改普通搜索 API。运行 focused tests 和 service build。
- [x] 提交 `feat: expose opt-in local document answer API`。

### Task 3: 新搜索页的独立问答面板

**Files:** src/lib/ai-answer/client.ts 及测试，src/components/search/AiAnswerPanel.tsx、AnswerMarkdown.tsx 及测试，DocsSearchPage.tsx、DocsSearchPage.test.tsx，src/routes/$locale/search.tsx。

**Interfaces:** `askDocumentQuestion(input,signal?) => Promise<AnswerResponse>` POST 到 /api/ai/answer，运行时验证响应与安全引用 URL。`AiAnswerPanel({filters,onClose})`；`DocsSearchPage` 新增默认 false 的 aiDemoEnabled prop，路由通过 VITE_AI_BOT_DEMO 显式开启。

- [x] 写失败测试：提交后显示等待，取消后延迟结果不显示；更改筛选清除旧回答；默认普通搜索没有 AI 入口，启用后点击才展示面板，不自动请求。
- [x] 运行 `bun run test src/components/search/AiAnswerPanel.test.tsx src/lib/ai-answer/client.test.ts`，观察失败。
- [x] 实现面板、取消/重试/无证据/错误/受控引用；Markdown AST 仅渲染文本、段落、标题、列表、强调和代码，链接只显示文字，HTML/图片不执行。
- [x] 验证默认搜索回归、恶意 Markdown、信号取消、旧响应忽略和引用。记录本地启动方式、真实联调待办及证据。
- [x] 运行 focused tests、types:check、Biome、完整 test，比较已知 37 个失败；浏览器验证页面、独立 review 后处理重要问题。
- [x] 提交 `feat: add opt-in AI answer demo panel`，不 push/merge/deploy。

## 执行结果

本地范围完成；实现、独立审查修复及验证见 docs/agents/reports/2026-10-15-ai-answer-local-verification.md。最终 2953 项：2914 通过、37 基线失败、2 跳过；新增失败 0。真实云端/全量/部署仍不在本计划已完成范围内。
