# 百炼问答接口接入

代码已支持开发环境的显式 `bailian` 模式：新版搜索页 → 独立 `/api/ai/answer` → 百炼知识检索 → 本地语料来源/平台校验 → 千问生成 → 原有回答与引用面板。默认关闭，普通搜索与 Meili 索引不改变。

## 本轮确认的接口

2026-10-16 核对阿里云官方文档：

- [知识检索](https://help.aliyun.com/zh/model-studio/knowledgesearch)：`POST https://{workspaceId}.cn-beijing.maas.aliyuncs.com/api/v1/indices/knowledge/search`，Bearer API Key，传 `agent_id/query/kb_search_configs`，返回 `data.nodes`。
- [千问 OpenAI 兼容接口](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions)：同一 workspace host 下 `/compatible-mode/v1/chat/completions`，非流式、JSON 输出。

知识检索接口需要在控制台创建并发布检索服务，拿到 `agent_id`，且服务绑定目标 KB。本轮没有创建/发布服务，没有核实当前账号权限或计费，也没有调用这些付费接口。检索服务不是本地 AI Agent；它是平台保存检索配置的服务实例。未采用仅在概览出现、缺少本次详细协议核实的旧 `index/retrieve` 路径。

## 接入准备

1. 在后续确认云端资源后导入样本文档，记录真实 KB ID 和每篇文档的远端 `doc_id`。不要把上传 fileId、任务 jobId、知识库 ID 当成文档 ID。
2. 创建并发布绑定该 KB 的检索服务，记录服务 ID。
3. 把真实 doc_id 与同版本本地 corpus 的 sourceId/hash 对应，写入不提交的 bindings 文件。不能使用模拟 ID，也不能凭同名文档猜测对应关系。
4. 在服务端注入 API Key 和路径，再启动开发服务。本轮默认本地摘录服务继续运行，没有切到收费模式。

### bindings 文件结构

以下仅展示一个文档条目；实际 `documents` 必须逐一覆盖当前 corpus 的全部文档，不能遗漏或重复。scope/hash/sourceId 直接来自真实 corpus；其他 ID 来自实际平台回执。

```json
{
  "schema": 1,
  "scope": "cn-real-demo-v1",
  "workspaceId": "llm-实际业务空间ID",
  "indexId": "实际知识库ID",
  "agentId": "实际已发布检索服务ID",
  "documents": [
    {
      "sourceId": "/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication/web",
      "hash": "该文档在corpus中的SHA256",
      "documentId": "实际召回metadata.doc_id"
    }
  ]
}
```

这不是新 KB schema，也不是同步成功状态；它是问答服务的来源映射。正文或 Metadata 更新后必须完成相应云端更新、验证并刷新 bindings。只改构建 revision、内容摘要不变，不要求更换映射。

### 服务端环境变量

| 变量 | 用途 |
| --- | --- |
| `AI_BOT_MODE=bailian` | 显式启用云端问答 |
| `AI_BOT_CORPUS_PATH` | 当前 corpus 的绝对路径 |
| `AI_BOT_BAILIAN_BINDINGS_PATH` | 真实 bindings JSON 绝对路径 |
| `BAILIAN_API_KEY` | 检索服务 Bearer Key，仅后端环境注入 |
| `BAILIAN_MODEL_API_KEY` | 可选的模型专用 Key；省略则用检索 Key，必须具有相应模型调用权限 |
| `AI_BOT_MODEL` | 默认 `qwen-plus`；还允许 `qwen-flash`、`qwen-turbo`，需账号有权限且模型支持 JSON 输出 |
| `VITE_AI_BOT_DEMO=true` | 显示现有问答入口，不包含任何密钥 |
| `VITE_DOCS_REGION=cn` | CN 页面 |

不把任何 Key 放入 `VITE_*`、bindings、前端请求或提交文件。密钥通过现有私有环境配置注入，不在聊天或共享日志中填写。本实现固定北京 workspace HTTPS host，禁止自定义转发地址；检索和模型两次请求分别使用对应 Key，拒绝重定向，失败不自动重试。

`NODE_ENV=production` 继续返回 503（包括显式开启云端模式时）。本轮是 demo 接口准备，没有生产鉴权、限流与部署交付；后续生产启用需单独设计。这是沿用现有开发演示的边界，不是“配 Key 就能上线”。

## 本地验证

```sh
bun run test src/lib/ai-answer src/lib/ai-kb scripts/ai-kb src/components/search
bun run types:check
bun run build:service
```

测试替换网络传输层，包含真实请求 URL/字段/响应解析，但不访问阿里云。浏览器仍使用同一 POST：

```sh
curl -sS http://127.0.0.1:3008/api/ai/answer \
  -H 'Content-Type: application/json' \
  --data '{"question":"Token","platform":"web"}'
```

仅在后续真实配置并显式切到 bailian 后，该请求才会产生云端检索与模型调用及相应费用。未设置则保持本地模式或不可用，不能把模拟测试称为账号实测。

## 结果校验与限制

- 先验证 bindings 的 scope、来源摘要与文档 ID 唯一性；全部通过才允许网络请求。
- 召回节点的 workspace_id、pipeline_id、doc_id 必须与受管配置匹配。使用 `metadata.content` 原始正文，忽略用于展示的拼接 `text` 和远端 URL。引用仅从本地 corpus 构造。
- 生成前仍执行现有产品/平台/版本/类型筛选及正文精确子串检查。过滤后无依据时返回 `mode: bailian/status: no-evidence`，不调用模型。筛选目前是本地后置筛选，未声称云端 Metadata 过滤已验证；可能因远端返回条数有限而漏召回。
- 百炼解析可能会规范化 Markdown，导致片段不是本地原文精确子串，此时保守拒绝作为依据，不伪造匹配。需真实联调后决定经审阅的规范化策略。
- 模型只接收问题和最多 6 段原文证据，采用 JSON `{markdown,evidenceIds}` 返回；不存在的引用 ID、截断结果、非法 JSON 均拒绝。UI 只展示本地验证后的引用。
- 回答仍可能存在模型理解错误，引用校验不代表语义正确；需真实问答评测。
- 传递取消信号，保留现有 15 秒总时限，限制上游 JSON 为 2 MiB，不向用户返回供应商错误正文或密钥。
- 88 个本地切块仍是预览，没有改变现有文档级上传协议，也没有宣称百炼采用这套分块。
- 增量同步 CLI 的真实检索 verifier 尚未接入，仍保留 `verifying` 门槛；新增问答接口不能自动把旧同步状态改成 successful。后续需根据真实导入/召回回执接通该门槛。
