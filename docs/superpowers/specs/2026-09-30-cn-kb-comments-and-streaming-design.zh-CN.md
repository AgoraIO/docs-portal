# 中文 KB 注释与 AI 流式回答设计

## 背景与目标

本设计基于 `codex/cn-bailian-demo` 已有的 25 篇中文样本文档、章节级 Meilisearch 索引和百炼 `search_docs` Tool Call 链路。目标有两个：让维护者能在代码中直接读懂 KB 字段和切分边界；让中文站的 AI 答案在生成时逐段出现，而不是等待整段 JSON 返回。两项改动独立验收，不扩大 KB 范围。

流式输出指可见的**最终答案文本**，不是模型的内部推理内容。“正在检索文档”“正在生成回答”是服务端处理阶段，不得伪装成真实思维链。英文 Algolia 和中文普通搜索保持不变。

## 备选方案与选择

1. 前端把完整答案模拟成逐字出现：无需改后端，但不能降低首字等待时间，不能反映真实状态；不采用。
2. 保留既有 JSON 接口，增加独立的 `POST /api/ask-docs/stream`：第一轮工具决策保持非流式，第二轮答案开启百炼流式输出，通过 SSE 转发；采用。原有 curl 和 Golden Query 验证保持兼容。
3. 把原接口直接改为 SSE：接口改动最少，但破坏已有调用方；不采用。

## KB 中文注释范围

只在已有 KB 代码中加简短、准确的中文注释，不改变运行逻辑：

- `src/lib/search/kb-record.ts`：逐字段说明 `SearchSection` 的来源 ID、可引用 URL、章节上下文、可选元数据和权限状态。特别注明 Meilisearch 上传时会另生成哈希主键。
- `scripts/search-demo/cn-kb-manifest.ts`：解释五类只是 25 篇样本文档的选样分类，所有类别共用 `SearchSection`；`product`、`audience`、`platform`、`version` 是当前样本的人工配置。
- `scripts/search-demo/extract-cn-kb-records.ts`：只在不易理解的规则处解释：按 MDX 标题和显式锚点划分、有意义子节合并、无标题 FAQ 回退整页、`PlatformStructured` 展开、隐藏文档过滤和 30,000 字符上限。原始 MDX 片段并未转换为纯文本。
- `scripts/search-demo/index-cn-kb.ts`：解释 allowlist 校验、来源 ID 与哈希索引 ID 的关系，以及再次上传是 upsert 而非完整替换；不暗示删除旧记录已实现。

不改文档正文、清单选择、索引设置、索引内容或 `search_docs` 的过滤权限。注释不得把目前恒为 `docs` / `published` 的字段说成已经自动识别全部文档类型/状态。

## 流式协议与边界

保留 `POST /api/ask-docs` 的 `{answer, citations}` JSON 行为。新增 `POST /api/ask-docs/stream`，同样接受 `{question: string}`，并沿用现有长度限制、CORS 预检、错误脱敏和服务端密钥边界。成功响应为 `text/event-stream; charset=utf-8`，关闭中间层缓存；由于需要 POST JSON，请求使用 `fetch` 和 `ReadableStream`，不使用仅支持 GET 的原生 `EventSource`。

事件使用 `event: <name>\ndata: <JSON>\n\n`，顺序与语义如下：

| 事件 | JSON 数据 | 含义 |
| --- | --- | --- |
| `phase` | `{ "phase": "searching" }` 或 `{ "phase": "answering" }` | 可见的处理阶段；`searching` 包含第一轮百炼工具决策和 Meilisearch 检索 |
| `delta` | `{ "text": "..." }` | 最终答案的新增文本；客户端按到达顺序追加，不去重、不重排 |
| `done` | `{ "citations": [...] }` | 终止成功；引用只来自已检索记录，客户端收到后展示引用 |
| `error` | `{ "message": "AI service unavailable" }` | 终止失败；不得包含百炼响应体、密钥或内部错误细节 |

空片段不产生 `delta`。只允许一次终止事件（`done` 或 `error`）。现有 JSON 接口仍按原行为附加参考文档列表；流式接口不在答案文本末尾再拼一次引用，由前端已有引用列表展示，避免重复。

## 后端执行流程

```text
浏览器 POST /api/ask-docs/stream
  → phase(searching)
  → 百炼首次非流式调用，强制 search_docs Tool Call
  → 校验工具名和参数，Meilisearch 检索公开中文章节
  → phase(answering)
  → 百炼第二次请求使用 stream: true
  → 解析其 OpenAI 兼容 SSE 的 choices[0].delta.content，逐段发送 delta
  → 检查 [DONE] / 正常完成，发送 done(citations)
```

解析器须能处理任意网络分块边界、跨块 UTF-8 字符、多个 `data:` 行和 `[DONE]`；非文本增量不得显示。模型缺少强制工具调用、返回未知工具、无有效答案、流异常中断均不能伪装成成功。开始流之后的错误用 `error` 事件，不再试图返回新的 JSON HTTP 状态。请求无效时，在开始流之前保持现有 400/405 响应。

原有 `ask()` 和 `POST /api/ask-docs` 保持可用；新增流式能力复用相同的问题校验、Tool Call 定义、检索边界及引用去重规则，避免两个入口检索不同 KB 或使用不同权限。百炼 API Key 和 Meilisearch Master Key 只留在后端。

`scripts/search-demo/ask-docs-server.ts` 的 Node HTTP 包装层必须逐块写入响应，不能对流式响应调用 `result.text()`。客户端断开时中止百炼读取和下游检索；不可让前一请求在后台继续消耗模型额度。服务端需要区分正常结束、客户端取消和中途异常，避免断开后继续写响应。

## 前端交互

仅中文 `AI 问答` 模式调用新流接口。提交后依阶段显示“正在检索文档”“正在生成回答”；收到首个 `delta` 后逐段渲染累积文本。沿用安全的 `AiMarkdown`，即使代码围栏尚未闭合也不得把模型输出作为原始 HTML 执行。引用在 `done` 后显示，仍跳到原始章节锚点。

浏览器客户端用 `TextDecoder` 增量解码 SSE；事件可能跨 `ReadableStream` 块，必须缓冲至完整空行才解析。网络错误、服务端 `error`、流在没有 `done` 时结束均显示失败状态，不把部分答案冒充完整回答。输入期间禁用重复提交；关闭弹窗、切换模式、重提问题或组件卸载时取消旧请求，并用请求身份防止过期事件更新新答案。保留非流式客户端函数供已有调用方和测试使用。

## 安全与范围

- 不修改英文 Algolia、普通中文 Meilisearch 搜索、高亮、跳转和 KB 切分结果。
- 不使用原始 HTML 注入，不向前端传模型的内部推理文本、工具原始鉴权字段或密钥。
- 沿用现有 Demo 的 CORS 边界；生产化之前需单独收紧来源、鉴权、限流和资源配额，不能因为有流式输出就把本地 Demo 视作可公开服务。
- 不引入 MCP、向量搜索、模型切换、长会话历史或新的客服权限模型。
- 不自动推送 PR；开发完成后按现有逐任务审查方式验收。

## 验收与测试

1. KB 代码注释覆盖上述四个文件且和实际行为一致；索引提取测试输出在注释前后完全相同。
2. 百炼流解析在 UTF-8 字符拆块、半条 SSE、多条事件、`[DONE]`、异常结束下按序给出文本或安全错误；第一次工具调用仍强制检索。
3. HTTP 路由兼容原 JSON 和 curl 验证；新流接口在真实 Node HTTP 连接上逐段可读，而非积累到完成后一次性出现；无效输入有正确状态码。
4. 前端阶段文本、Markdown 增量、完成引用、失败、取消、切换模式、重复提交均有定向测试；英文 Algolia 与中文普通搜索回归测试通过。
5. `bun run types:check`、相关文件 Biome 和 `git diff --check` 通过；完整仓库测试另行执行并如实报告与本次无关的基线失败。
6. 本地手测：Docker Meilisearch + `search-demo:ask` + CN 前端；`manualSOS` 问题应先显示状态，再逐步显示答案，最后出现带 `#manualsos` 的引用。真实百炼调用可能产生费用。
