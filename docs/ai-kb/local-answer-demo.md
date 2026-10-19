# 本地 KB + 千问问答 demo

当前已跑通真实模型问答：新版搜索页 → `/api/ai/answer` → 本地文档切片检索 → 百炼千问 → 回答与来源引用。KB 留在本地，不创建或导入百炼托管知识库。MCP 按确认的范围后续再接。

## 语料与检索

复用 `cn-real-demo-v1` 的 5 篇已发布文档，内容构建版本为 `3e0287bdea5bf8de11334759aa1544786f22f928`。语料准备见 [真实样本](real-sample-demo.md)。运行时从校验过的 corpus 按 `mdx-block-v1` 重新计算切片，对应现有预览的 88 片，避免误读过时 preview。

`createLocalSearchDocs()` 是应用内的文档检索函数，不是 MCP 服务。它对中文分词、英文词和章节标题进行关键词排序，优先标题命中，应用产品/平台/版本/文档类型筛选；最多提供 6 个片段、每篇最多 2 个。大代码块不截断；超出上下文预算且无可用完整片段时跳过。它适合小样本验证，尚未提供向量检索、语义召回或生产级相关性评估。

返回片段必须出现在当前正文中，引用只能使用语料中已验证的页面/章节 URL。没有依据时直接返回，不调用模型。模型按受约束的 JSON 返回回答和所用片段 ID；这些检查保证来源可追溯，不等同于自动证明回答每句话都正确。

## 启动

在本次独立 worktree 根目录运行。`.env.local` 不提交，文件权限建议为 `600`：

```dotenv
AI_BOT_CORPUS_PATH=/绝对路径/docs-portal/dist/ai-kb/cn-real-demo-v1/corpus.json
BAILIAN_MODEL_API_KEY=在本地填入旧demo的模型APIKey
AI_BOT_MODEL=qwen-plus
```

当前机器已经私下复用旧 demo `search-demo/.env` 的模型 Key，无需在聊天中重发。不要给密钥添加 `VITE_` 前缀。也可通过服务端环境注入 `DASHSCOPE_API_KEY`；优先级为 `BAILIAN_MODEL_API_KEY`、`DASHSCOPE_API_KEY`、`BAILIAN_API_KEY`。

```sh
bun run dev:ai-local
```

默认监听 `127.0.0.1:3008`。端口被占用时先检查现有进程，避免误开另一个端口却仍查看旧页面。入口：<http://127.0.0.1:3008/zh-CN/search?q=&type=all&page=1>，点击 **AI 问答**。

此命令显式开启 `AI_BOT_MODE=local-kb`、CN 页面和 AI 入口。默认普通开发命令不会自动开启问答服务。该 demo 在 `NODE_ENV=production` 下仍禁用。配置变动后重启服务。

默认模型端点为北京官方兼容地址 `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`；如配置 `BAILIAN_WORKSPACE_ID=llm-实际空间ID`，则使用该北京业务空间专属域名。Key/空间/地域须对应。此次不需要 KB ID、检索服务 agent ID 或远端文档 bindings。

模型接口与原托管适配器共用受限的 HTTP/JSON 处理：取消、超时、响应大小限制、禁止重定向、错误脱敏及密钥回显检查。API Key 只在服务端使用。

## 怎么测试

1. 问“Web 的 Token 过期后应该怎么处理？”：应得到提前 30 秒回调、更新 Token，以及已过期后的重新加入处理，并附 Web 文档的 Token 过期章节引用。
2. 问“创建对话式智能体用哪个 HTTP 方法和接口路径？”：应返回 `POST /v2/projects/{appid}/join` 及创建智能体文档引用。
3. 问“今天北京天气怎么样？”：应显示没有足够依据，不生成回答。
4. 点击引用，核对正文。回答措辞可能变化，重点检查事实、平台和依据。

筛选与 AI 请求共用页面状态。若本机没连接普通搜索服务，下拉选项可能无法加载且普通搜索会提示暂不可用；AI 本地链路不依赖该服务。可单独验证 AI 筛选：

```sh
curl -s http://127.0.0.1:3008/api/ai/answer \
  -H 'Content-Type: application/json' \
  -d '{"question":"Token 过期后怎么办？","platform":"web","type":"docs"}'
```

正常响应 `mode` 为 `local-kb`，不是早期仅摘录的 `local-demo`，也不是托管检索的 `bailian`。页面会显示“本地知识库检索，百炼模型生成”。

普通搜索接口、Meilisearch 索引和构建发布逻辑不变。当地存储/检索不产生百炼 KB 托管费用；真实模型调用仍按账号适用的模型额度/计费规则执行。

## 验证范围

已验证真实千问 HTTP 调用、浏览器回答/引用、OpenAPI 问题和无依据问题。完整检查与原有测试失败记录见 [验证报告](../agents/reports/2026-10-16-local-kb-answer-verification.md)。尚未做百炼托管 KB 导入/检索、MCP、全站语料评测、CI/CD 接入或生产部署。
