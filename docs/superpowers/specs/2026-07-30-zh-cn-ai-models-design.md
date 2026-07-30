# zh-CN AI Models Section Design

## 背景

英文站点已经有 `content/docs/en/ai/models` section，用于说明对话式 AI
引擎支持的 ASR、LLM、TTS、MLLM 和 AI Avatar vendor。中文站点
`content/docs/zh-CN/ai` 目前没有对应的 `models` section，并且中文区有
CN 专属 vendor，不能直接复制英文 global vendor 集合。

本次更新要为中文 `zh-CN/ai` 增加 CN 专属 models 文档。文档必须和三个
Agora Agents SDK 的 CN vendor 实现对齐：

- `https://github.com/AgoraIO/agora-agents-go`
- `https://github.com/AgoraIO/agora-agents-ts`
- `https://github.com/AgoraIO/agora-agents-python`

REST API 示例、参数名、wire vendor value 和字段说明以
`content/openapi/conversational-ai/rest-api.zh-CN.yaml` 为事实来源。

## 目标

- 在 `content/docs/zh-CN/ai` 下新增 `models` section。
- 首批覆盖 CN 明确支持的 `ASR`、`LLM`、`TTS` 和 `Avatar` 四类。
- 每个 vendor 页面提供 Python、TypeScript、Go 和 REST API 四端示例。
- 以 SDK 源码中已实现的 CN vendor class 或 constructor 作为纳入计划的准入标准。
- REST API 内容以中文 OpenAPI YAML 为准，SDK 与 OpenAPI 不一致时显式列为对齐问题。
- 尽量复用英文 `content/docs/en/ai/models` 的页面骨架和 MDX 组件格式。
- 建立可维护的 vendor catalog 审计表，便于后续 SDK 或 REST API 变化后更新文档。

## 非目标

- 不在首批新增 `MLLM`，除非后续确认 CN AgentKit 和 REST API 均支持 CN MLLM。
- 不直接复制英文 global vendor 页面。
- 不用文档掩盖 SDK 三端不一致；不一致项应列为前置对齐问题。
- 不把 OpenAPI 未列出的 REST 字段写成已正式支持。
- 不改动 SDK 仓库源码。
- 不手动编辑生成文件，例如 `src/routeTree.gen.ts`，除非后续实施流程需要重新生成。

## 信息架构

新增目录：

```text
content/docs/zh-CN/ai/models/
  index.mdx
  meta.json
  asr/
    index.mdx
    meta.json
  llm/
    index.mdx
    meta.json
  tts/
    index.mdx
    meta.json
  avatar/
    index.mdx
    meta.json
```

修改 `content/docs/zh-CN/ai/meta.json`，把 `"models"` 放在 `"build"` 和
`"reference"` 之间，使它属于“对话式 AI 引擎”主 section，而不是“对话式 AI
开发套件”section。

`models/meta.json` 使用和英文侧一致的图标：

```json
{
  "icon": "Brain",
  "title": "模型与厂商",
  "pages": ["index", "asr", "llm", "tts", "avatar"]
}
```

中文侧应补实际 `index.mdx` 文件。英文侧 `models/meta.json` 和子类
`meta.json` 里存在 `"index"`，但当前没有看到对应 `index.mdx`；中文侧不要复制这个缺口。

## Vendor Catalog

首批页面清单如下。文件名使用 kebab-case；REST wire vendor value 保持
OpenAPI 或 SDK payload 使用的 snake_case。

```text
models/asr/
  fengming.mdx
  tencent.mdx
  microsoft.mdx
  xfyun.mdx
  xfyun-bigmodel.mdx
  xfyun-dialect.mdx

models/llm/
  aliyun.mdx
  bytedance.mdx
  deepseek.mdx
  tencent.mdx

models/tts/
  minimax.mdx
  tencent.mdx
  bytedance.mdx
  microsoft.mdx
  cosyvoice.mdx
  bytedance-duplex.mdx
  stepfun.mdx
  generic.mdx

models/avatar/
  sensetime.mdx
  spatius.mdx
```

`generic` TTS 纳入首批，因为 SDK 侧支持。若
`content/openapi/conversational-ai/rest-api.zh-CN.yaml` 未列出 `generic`，
则它应标为 OpenAPI 对齐问题；页面不能把未列出的 REST 支持写成已确认事实。

## 审计表

实施前先建立 vendor catalog 审计表，列出四端覆盖情况。表格列：

```text
category | display name | page slug | REST vendor | Python class | TypeScript class | Go constructor | REST schema | status
```

`status` 取值：

- `ready`：Python、TypeScript、Go 和 REST API 四端一致，可写页面。
- `sdk-mismatch`：SDK 三端命名、参数或 payload 不一致，需要先确认。
- `openapi-mismatch`：SDK 支持但中文 OpenAPI 未列出或 schema 不一致。
- `blocked`：参数、能力或产品状态需要产品或 SDK owner 确认。

审计事实来源优先级：

1. SDK 源码中的 class、constructor 和配置序列化逻辑。
2. `content/openapi/conversational-ai/rest-api.zh-CN.yaml`。
3. SDK docs 和 tests 中的示例值。
4. 第三方 vendor 官方文档链接，只用于解释 provider 参数，不作为 Agora REST 字段事实来源。

## 页面格式

单个 vendor 页面应尽量复用英文 `content/docs/en/ai/models` 的骨架。页面模板使用以下
固定结构；实施时把 vendor 名、模块名和参数内容替换为该页面的真实内容：

```mdx
---
title: MiniMax
description: >
  在对话式 AI 引擎中集成 MiniMax TTS。
---

MiniMax 提供文本转语音能力，可用于对话式智能体的语音输出。

### 示例配置

以下示例展示如何在启动对话式智能体时配置 MiniMax TTS。

<Tabs defaultValue="python" groupId="ai-sdk-language" persist>
<TabsList>
  <TabsTrigger value="python">Python SDK</TabsTrigger>
  <TabsTrigger value="typescript">TypeScript SDK</TabsTrigger>
  <TabsTrigger value="go">Go SDK</TabsTrigger>
  <TabsTrigger value="rest-api">REST API</TabsTrigger>
</TabsList>

<TabsContent value="python">

```python
# Python SDK 示例放在这里。
```

</TabsContent>

<TabsContent value="typescript">

```typescript
// TypeScript SDK 示例放在这里。
```

</TabsContent>

<TabsContent value="go">

```go
// Go SDK 示例放在这里。
```

</TabsContent>

<TabsContent value="rest-api">

```json
{
  "tts": {
    "vendor": "minimax",
    "params": {}
  }
}
```

</TabsContent>
</Tabs>

### 关键参数

<ParameterList title="params">
  <Parameter name="model" type="string" required={true}>
    TTS 模型名称。
  </Parameter>
</ParameterList>
```

页面应遵守 `docs/agents/markdown-authoring-standard.md`：

- Tabs 和 `TabsContent` 标签顶格。
- 每个 `TabsTrigger value` 必须有对应 `TabsContent value`。
- 代码块必须指定语言。
- 不保留 Docusaurus JSX、raw HTML list 或自定义 tab 语法。
- callout 使用 `:::info`、`:::caution` 等三冒号 directive。

## 四端示例规范

每个 vendor 页面必须包含四个 tab：

- `Python SDK`
- `TypeScript SDK`
- `Go SDK`
- `REST API`

示例只展示该 vendor 所属模块的配置，其他模块用注释占位，避免每页变成完整 quickstart。

Python 示例要求：

- 使用 `agora_agent` 公开导出的 class。
- 使用 CN client 语义，例如 `Area.CN`。
- 使用 Python SDK 实际字段名，例如 snake_case。

TypeScript 示例要求：

- 从 `agora-agents` 导入 `AgoraClient`、`Agent`、`Area` 和 vendor class。
- client 使用 `area: Area.CN`。
- 使用 TypeScript SDK 实际字段名，例如 camelCase。

Go 示例要求：

- 使用 `github.com/AgoraIO/agora-agents-go/v2/agentkit/cn`。
- 使用 `github.com/AgoraIO/agora-agents-go/v2/agentkit/cn/vendors`。
- 不使用 global `agentkit/vendors`。

REST API 示例要求：

- 配置字段、参数名和 vendor 值以 `content/openapi/conversational-ai/rest-api.zh-CN.yaml` 为准。
- wire vendor value 保持 snake_case，例如 `xfyun_bigmodel` 和 `bytedance_duplex`。
- 如果 OpenAPI 未列出该 vendor，页面应说明这是 OpenAPI 对齐问题，不能给出正式 REST 示例。

如果 SDK 三端或 SDK 与 OpenAPI 不一致，页面不能猜测；该 vendor 应先进入审计表的对齐问题状态。

## 分类总览页

`models/index.mdx` 说明：

- CN models section 的适用范围。
- 四端示例约定。
- REST API 事实来源。
- 三端统一原则。
- SDK/OpenAPI 不一致时的处理规则。

四个分类 `index.mdx` 说明：

- 该类支持的 vendor。
- REST vendor value。
- 适用场景。
- Beta 或预览状态。
- 是否需要 BYOK。
- 对 TTS 和 Avatar，说明采样率或音频兼容注意事项。

## 执行阶段

1. 建立 vendor catalog 审计表。
2. 新增中文 `models` IA 和 `meta.json` 骨架。
3. 新增 `models/index.mdx` 和四个分类 `index.mdx`。
4. 按审计表中 `ready` 状态逐批写 vendor 页面。
5. 处理 SDK/OpenAPI 对齐问题，尤其是 TTS `generic` 的 REST API 状态。
6. 修复中文页中的内部链接、外部链接和英文路径残留。
7. 运行验证命令并人工抽查关键页面。

推荐落地批次：

1. ASR：`fengming`、`tencent`、`microsoft`、`xfyun`、`xfyun-bigmodel`、`xfyun-dialect`。
2. LLM：`aliyun`、`bytedance`、`deepseek`、`tencent`。
3. TTS：`minimax`、`tencent`、`bytedance`、`microsoft`、`cosyvoice`、`bytedance-duplex`、`stepfun`、`generic`。
4. Avatar：`sensetime`、`spatius`。

## 链接规则

- 中文页不应残留英文站点路径链接，除非明确引用英文-only 页面。
- REST API 参数链接应指向中文 API reference 或 OpenAPI 生成页。
- 第三方 vendor 官方文档链接可用于补充 provider 参数含义。
- 链接到已有中文 guides 时优先使用当前 `zh-CN/ai` 路径，例如自定义模型、托管模式、定价、快速开始等。

## 验收

主要验证命令：

```bash
bun run types:check
bun run test
```

如果改动涉及较多 MDX 或 UI 组件使用，也运行：

```bash
bun run lint
```

人工抽查页面：

- `/zh-CN/ai/models`
- `/zh-CN/ai/models/asr/fengming`
- `/zh-CN/ai/models/llm/deepseek`
- `/zh-CN/ai/models/tts/generic`
- `/zh-CN/ai/models/avatar/sensetime`

## 已确认决策

- 采用 SDK 对齐版方案。
- Vendor 准入标准是 SDK 源码中已经实现对应 CN vendor class 或 constructor。
- 每个 vendor 页面必须覆盖 Python、TypeScript、Go 和 REST API 四端。
- 三端 SDK 应统一；不一致项作为前置对齐问题处理。
- 首批只做 ASR、LLM、TTS 和 Avatar，不做 MLLM。
- REST API 相关内容参考 `content/openapi/conversational-ai/rest-api.zh-CN.yaml`。
- TTS `generic` 纳入首批，但 REST API 支持状态需要按中文 OpenAPI 审计结果处理。
