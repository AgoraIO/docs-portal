# 中文 KB 注释与 AI 流式回答实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **每完成一项即停止，等待用户审查后再执行下一项。**

**Goal:** 给 Demo KB 的真实切分/索引代码补准确中文注释，并让中文 AI 问答从百炼到浏览器逐段显示最终答案。

**Architecture:** 保留现有 JSON 问答和检索链路，增加独立 POST SSE 接口。第一轮强制 `search_docs` 仍用 JSON，第二轮百炼答案使用 `stream: true`；服务端逐块转发，中文客户端解析增量事件并安全渲染 Markdown。

**Tech Stack:** TypeScript、Bun/Node HTTP、Fetch ReadableStream、React、Vitest、Fumadocs、Meilisearch、百炼 OpenAI 兼容接口。

**Spec:** `docs/superpowers/specs/2026-09-30-cn-kb-comments-and-streaming-design.zh-CN.md`；执行前先完整阅读 spec。

## Global Constraints

- 只改 KB 代码的中文注释及中文 AI 问答；不改英文 Algolia、中文普通搜索或 KB 提取/索引结果。
- `POST /api/ask-docs` 的 `{answer,citations}` JSON 和既有调用保持兼容；新路径为 `POST /api/ask-docs/stream`。
- SSE 事件只能是 `phase`、`delta`、`done`、`error`；`done` 或 `error` 只能出现一次；`phase` 是处理状态，不是模型内部推理。
- 百炼和 Meilisearch 管理密钥只在服务端；流式引用来自已检索章节，文本末尾不再追加重复引用。
- 用户每审核通过一个任务，才进入下一个任务；不自动推送 PR，不提交环境文件或密钥。

## Review Focus

- 百炼 SSE 把一个 UTF-8 汉字、JSON 行或 `[DONE]` 切在多个块里：Task 2 测试应仍逐字节解码并正确结束。
- 百炼第二轮返回 HTTP 200 却在 `[DONE]` 前断流：Task 2 测试应失败，不输出成功引用。
- HTTP 客户端断开、上游仍在输出：Task 3 真实连接测试应中止上游，停止写入和模型消耗。
- 浏览器旧请求在弹窗关闭/切换模式后继续返回：Task 5 组件测试应忽略旧事件并取消请求。
- 模型输出未闭合代码围栏或含 HTML：Task 5 测试应显示安全 Markdown，不执行原始 HTML。

---

## 文件职责

- `src/lib/search/kb-record.ts`：KB 字段契约与验证，**仅注释**。
- `scripts/search-demo/cn-kb-manifest.ts`、`extract-cn-kb-records.ts`、`index-cn-kb.ts`：样本、章节提取和上传的真实限制，**仅注释**。
- `src/lib/ai/bailian-search-answer.ts`：复用首次 Tool Call，增加 `streamAnswer(question, {signal?,onPhase,onDelta})`，最终返回引用。
- `src/lib/ai/bailian-stream.ts`：单一职责，解析百炼响应体的 UTF-8 SSE `data` 和答案增量。
- `scripts/search-demo/ask-docs-server.ts`：路由、SSE 编码和真实 Node 流透传、取消。
- `src/lib/ai/ask-docs-client.ts`：保留 `askDocs`，增加浏览器 SSE 客户端。
- `src/components/docs-shell/DocsSearchDialog.tsx`、`src/lib/i18n/resources/zh-CN/common.ts`：CN AI 状态、取消和显示。
- 上述逻辑对应的 `*.test.ts(x)` 同文件夹增补；不要重排其它搜索模块。

### Task 1: 给 KB 代码补中文注释

**Files:** Modify `src/lib/search/kb-record.ts`, `scripts/search-demo/cn-kb-manifest.ts`, `scripts/search-demo/extract-cn-kb-records.ts`, `scripts/search-demo/index-cn-kb.ts`。Test `src/lib/search/kb-record.test.ts`, `scripts/search-demo/cn-kb-manifest.test.ts`, `scripts/search-demo/extract-cn-kb-records.test.ts`, `scripts/search-demo/index-cn-kb.test.ts`。

**Interfaces:** 不新增接口；`SearchSection` 和样本记录运行行为必须保持原样。

- [ ] **Step 1: 记录行为基线。** 运行 `bunx vitest run src/lib/search/kb-record.test.ts scripts/search-demo/cn-kb-manifest.test.ts scripts/search-demo/extract-cn-kb-records.test.ts scripts/search-demo/index-cn-kb.test.ts`，记下通过数量；这一纯注释任务不造无意义的红灯。
- [ ] **Step 2: 只加中文注释。** 对 `SearchSection` 各字段分别注释：`id` 为源记录稳定标识，`url` 为可打开章节地址，`pageTitle`/`sectionTitle`/`headingPath` 为页面及标题路径，`content` 为原始提取内容，`locale`/`product`/`platform`/`version` 为范围元数据，`docType`/`audience`/`status`/`hidden` 为类型、读者、发布和可见性，`aliases` 为可选搜索别名。其他三文件只解释选样分类、显式锚点/标题切分、`PlatformStructured`、无标题 FAQ、隐藏过滤、长度上限、allowlist、哈希索引 ID、upsert 不清除旧记录等非直观规则；不可声称 `docType`/`status` 已自动识别或 MDX 已变纯文本。
- [ ] **Step 3: 检查没有功能差异。** 运行同一步 1 测试；运行 `git diff --check` 与 `git diff -- src/lib/search/kb-record.ts scripts/search-demo/cn-kb-manifest.ts scripts/search-demo/extract-cn-kb-records.ts scripts/search-demo/index-cn-kb.ts`，逐行确认只有注释；按用户审核要求停下，获准后才提交/进入 Task 2。提交消息建议 `docs: explain CN KB records and extraction`。

### Task 2: 解析百炼流并复用检索

**Files:** Create `src/lib/ai/bailian-stream.ts`, `src/lib/ai/bailian-stream.test.ts`；Modify `src/lib/ai/bailian-search-answer.ts`, `src/lib/ai/bailian-search-answer.test.ts`。

**Interfaces:** `parseBailianAnswerStream(body: ReadableStream<Uint8Array>, signal?: AbortSignal): AsyncGenerator<string>`；`BailianSearchAnswerService.streamAnswer(question: string, hooks: { signal?: AbortSignal; onPhase: (phase: 'searching' | 'answering') => void; onDelta: (text: string) => void }): Promise<AnswerCitation[]>`。无有效检索/答案、无 `[DONE]` 或异常应抛脱敏错误；`ask()` 保持原有 JSON 行为。

- [ ] **Step 1: 先加失败测试。** 用 `ReadableStream` 的 `TextEncoder` 制造百炼 `data: {"choices":[{"delta":{"content":"你"}}]}\n\n` 与 `data: [DONE]\n\n`，按汉字字节和行中间拆块；断言增量只产出 `你`、能接受多条 `data:` 行，非文本增量被忽略、缺少 `[DONE]` 抛错、AbortSignal 中止读取。扩充服务测试：第一请求含 `tool_choice: 'required'`，调用一次 `searchDocs`，第二请求带 `stream: true`，回调按 `searching → answering → delta` 顺序，结果 URL 是实际章节锚点；拒绝未知工具，不泄露异常响应正文。
- [ ] **Step 2: 确认红灯。** `bunx vitest run src/lib/ai/bailian-stream.test.ts src/lib/ai/bailian-search-answer.test.ts`；新接口缺失导致明确失败。
- [ ] **Step 3: 最小实现。** 复用现有问题检查、`toolDefinition`、`parseSearchDocsArguments`、`deduplicateCitations`；提取共同的首次 Tool Call/检索步骤供 `ask` 与 `streamAnswer` 使用，保留 `ask` 的原 JSON 拼引用行为。流解析使用 `TextDecoder` 的 streaming 模式和累积 buffer，按空行切事件，逐行收集 `data:`；JSON 只读取 `choices[0].delta.content` 字符串；显式检查 `[DONE]`，非正常 EOF/空答案抛错，`reader.cancel()` 置于 `finally`。第二次 Fetch 用传入 signal；首次 Fetch 也要支持 signal（超时与取消同时生效）。
- [ ] **Step 4: 验证并停下。** 重跑步骤 2，另跑 `bun run types:check`、`git diff --check`；确认 JSON 旧测试仍过；用户审核后再进入 Task 3。建议提交 `feat: stream Bailian answers after document search`。

### Task 3: SSE HTTP 接口及 Node 透传

**Files:** Modify `scripts/search-demo/ask-docs-server.ts`, `scripts/search-demo/ask-docs-server.test.ts`。

**Interfaces:** `createAskDocsRequestHandler(service: AskDocsService)` 保持现有 JSON 入口；`AskDocsService` 含 Task 2 的 `streamAnswer`。导出 `createAskDocsHttpServer(service: AskDocsService)` 以便用随机端口测试，脚本入口继续监听 `ASK_DOCS_PORT`。

- [ ] **Step 1: 写失败测试。** 请求 `POST /api/ask-docs/stream`，断言 `content-type` 是 `text/event-stream; charset=utf-8`、阶段/文本/引用事件编码为 `event: name\ndata: {...}\n\n`，且第二个受控 `delta` 尚未释放时已读到第一个；请求缺 question、超过 2000 字、非法 JSON、GET、OPTIONS 分别得到 400/405/204 而不调用百炼。服务在 `delta` 后抛包含密钥的错误时，只发一次 `{message:'AI service unavailable'}` 的 `error`，无 `done`。用 `createAskDocsHttpServer` 真正监听 `127.0.0.1:0`，验证 fetch 先读到首块，再释放尾块；客户端取消后断言 `signal.aborted`。
- [ ] **Step 2: 确认红灯。** `bunx vitest run scripts/search-demo/ask-docs-server.test.ts`；缺少流路由/导出而失败。
- [ ] **Step 3: 最小实现。** 共享原 JSON 和新 SSE 的路径/方法/输入校验；在创建响应前验证 2000 字上限；用 `ReadableStream` 推送 UTF-8 SSE，第一事件 `phase(searching)`，成功 `done(citations)`，失败 `error`，终止一次。设置 CORS、`Cache-Control: no-cache, no-transform`、`X-Accel-Buffering: no`。Node 包装层对 `result.body` 逐块 `response.write`（背压时等待 `drain`），不要 `await result.text()`；在 Node response `close` 且未完成时 abort Web Request 的 controller，停止上游读取；正常 finish 不触发误取消。保持既有 32 KiB body 限制。
- [ ] **Step 4: 验证并停下。** 重跑步骤 2，加 `bun run types:check` 与 `git diff --check`；审核完成前不进 Task 4。建议提交 `feat: expose streaming ask-docs endpoint`。

### Task 4: 浏览器流客户端

**Files:** Modify `src/lib/ai/ask-docs-client.ts`, `src/lib/ai/ask-docs-client.test.ts`。

**Interfaces:** 保留 `askDocs(question, endpoint): Promise<AskDocsResponse>`；增加 `streamAskDocs(question: string, endpoint: string, options: { signal?: AbortSignal; onPhase: (phase: 'searching' | 'answering') => void; onDelta: (text: string) => void }): Promise<AskDocsCitation[]>`。现有 `isCitation` 只校验字段类型；流式引用还要限制为本站 `/zh-CN/` 路径，排除 `//` 开头或脚本协议，防止被当作可点击外链。

- [ ] **Step 1: 写失败测试。** mock `fetch` 返回分块 SSE：`phase(searching)`、`phase(answering)`、跨块中文 `delta`、`done` 引用；断言按序回调并返回 citations；恶意引用 `javascript:alert(1)` 与 `//evil.example` 被过滤；`error` 事件、无 `done` 的 EOF、非法 JSON、非 2xx、AbortSignal 取消均 reject；`askDocs` 旧测试照常运行。
- [ ] **Step 2: 确认红灯。** `bunx vitest run src/lib/ai/ask-docs-client.test.ts`；缺少 `streamAskDocs` 导出而失败。
- [ ] **Step 3: 最小实现。** POST 到 `${endpoint.replace(/\/$/, '')}/api/ask-docs/stream`，传 signal；用 `TextDecoder` streaming 模式逐块累积直到完整空行，识别 `event:`/`data:`，JSON 校验字段类型；`done` 或 `error` 必须终结且只能一次，空答案/无终止事件失败；失败文案不要包含服务端密钥或模型响应。取消时 `reader.cancel()`；不修改非流式 `askDocs`。
- [ ] **Step 4: 验证并停下。** 重跑步骤 2、`bun run types:check`、`git diff --check`；审核后才进入 Task 5。建议提交 `feat: consume CN ask-docs stream`。

### Task 5: CN 弹窗逐段展示、取消与整体验收

**Files:** Modify `src/components/docs-shell/DocsSearchDialog.tsx`, `src/components/docs-shell/DocsSearchDialog.test.tsx`, `src/lib/i18n/resources/zh-CN/common.ts`；若 i18n 类型检查要求新键同形，再在 `src/lib/i18n/resources/en/common.ts` 增加对应未启用的翻译键（不改英文搜索行为）。

**Interfaces:** 只在 `searchLocale === 'zh-CN'` 的 answer 模式使用 Task 4 `streamAskDocs`；普通搜索仍用原有搜索客户端。`AskDocsState` 在 `idle`/`streaming`（阶段、累积 answer）/`loaded`（answer、citations）/`error` 间转换。

- [ ] **Step 1: 写失败组件测试。** 在现有 `DocsSearchDialog.test.tsx` mock `streamAskDocs`，用受控 Promise 先触发 `onPhase('searching')`，再 `answering`、两次 `onDelta`、最后返回真实 `#manualsos` 引用；断言阶段文案、答案逐段出现、完成后才出现引用。对关闭、切回普通搜索、组件卸载分别断言 signal abort，后续旧回调不覆盖新的问答；连续 Enter/点击只发一个请求；返回不闭合代码围栏和 `<script>` 时不产生可执行 HTML。保留英文/中文普通搜索回归断言。
- [ ] **Step 2: 确认红灯。** `VITE_DOCS_REGION=global bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`；预期当前组件尚未消费流而失败。
- [ ] **Step 3: 最小实现。** 用 `AbortController` 和递增请求 ID 管理一个在途问题；关闭、切模式、重提、卸载时 abort 并使旧 ID 失效；`setAskDocsState` 函数式追加 `delta`；`AiMarkdown` 渲染累积答案，阶段显示中文文案“正在检索文档…”/“正在生成回答…”；仅 `done` 后显示引用，失败不把部分文本标为完成；CN AI 提交时禁用重复提交。不得更改英文 Algolia 分支或普通搜索渲染。
- [ ] **Step 4: 分层验收。** 跑步骤 2 与 Task 2-4 定向测试；`bun run types:check`、`bunx biome check` 对本任务改动文件、`git diff --check`；最后 `VITE_DOCS_REGION=global bun run test` 并区分本次失败与已存在的测试失败。若本机已有 Docker/百炼可用，再手动运行现有 `search-demo:ask` 和 CN dev 前端；问题“如何在 Web 平台调用 manualSOS？”应先显示检索/生成阶段，再累积文本，最后出现 `#manualsos` 引用。真实百炼请求可能计费；无需用户密钥时不跑真机请求。
- [ ] **Step 5: 审核交付。** 汇报各任务测试、手测是否运行、文件列表与未解决风险；等待用户审查，不自动推送 PR。建议提交 `feat: show streaming answers in CN docs search`。
