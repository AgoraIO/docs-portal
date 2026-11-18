# OpenAPI 中文站渲染策略与维护记录

本文记录 2026-07-06 对 OpenAPI 页面 `zh-CN` locale 的渲染决策、已实施改动，以及后续继续接收中文站反馈时应优先修改的位置。

背景分析见同目录报告：
`docs/agents/reports/2026-07-06-openapi-auth-header-presentation-diff.md`。

## 目标

中文站 OpenAPI 页面需要更接近旧中文站的阅读习惯：

- 在正文参数区直接显示 `Authorization` 请求 Header。
- `zh-CN` 不渲染右侧鉴权卡片，避免和正文 `Authorization` Header 重复表达。
- 将 OpenAPI 框架标题中文化，例如 `Path Parameters`、`Header Parameters`、`Request Body`、`Response Body`。
- 保留英文站现有体验：英文站继续隐藏认证 Header，并通过右侧鉴权卡片表达认证要求。
- 不维护两套 YAML 转换器，也不拆分出中英文两套 OpenAPI 数据模型。

## 已定方案

采用 locale-aware 的局部渲染策略。

核心原则：

- 数据层保持一致，继续使用当前 OpenAPI YAML 和 Fumadocs 渲染管线。
- 渲染层根据 `locale` 做细粒度差异化。
- `zh-CN` 允许 `Authorization` header 参数出现在正文 `请求 Header` 列表中。
- `zh-CN` 不显示右侧 Authorization/鉴权卡片。
- `en` 保持原行为：认证 Header 不出现在参数列表中，认证信息展示在右侧 Authorization 区块。
- 真实协议字段名不翻译，例如 `Authorization`、`appid`、`Content-Type` 保持原样。

## 已实施改动

### 1. 传递 locale

文件：`src/components/docs-shell/DocsContent.tsx`

OpenAPI 内容渲染时，将当前页面 locale 传入 `FumadocsOpenApiContent`：

```tsx
<FumadocsOpenApiContent
  locale={currentLocale}
  pageProps={resolvedBody.pageProps}
/>
```

### 2. 中文站显示 Authorization Header

文件：`src/components/openapi/FumadocsOpenApiContent.tsx`

`isDisplayableParameter` 增加 `locale` 参数。认证 Header 的过滤逻辑变为：

- `locale === 'zh-CN'`：显示 `Authorization` header 参数。
- 其他 locale：继续隐藏 `Authorization` header 参数。

### 3. 中文站隐藏右侧鉴权卡片

文件：`src/components/openapi/FumadocsOpenApiContent.tsx`

`OpenApiAuthorizationSection` 对 `locale === 'zh-CN'` 直接返回 `null`：

- 中文站不渲染右侧 `鉴权` 标题、`该接口需要鉴权。` 文案和 `basicAuth` 标签。
- 中文站仍在正文 `请求 Header` 参数区显示真实协议字段 `Authorization`。
- 英文站继续显示右侧 Authorization 区块，并继续隐藏正文里的认证 Header。

### 4. 中文化 OpenAPI 框架标题

文件：`src/components/openapi/FumadocsOpenApiContent.tsx`

新增 `ZH_CN_OPENAPI_LABELS`，用于我们自定义渲染层里的标题和提示文案，例如：

- `Path Parameters` -> `路径参数`
- `Header Parameters` -> `请求 Header`
- `Query Parameters` -> `查询参数`
- `Cookie Parameters` -> `Cookie 参数`
- `Response Headers` -> `响应 Header`
- `Request examples` -> `请求示例`
- `Response example` -> `响应示例`
- `Response schema` -> `响应 Schema`

Fumadocs 内部生成的 `Request Body`、`Response Body` 标题不在我们直接控制的 React 组件树中，因此使用 `useLocalizedOpenApiGeneratedChrome` 在 `zh-CN` 页面内同步这两个标题：

- `request-body` -> `请求 Body`
- `response-body` -> `响应 Body`

同步范围被限制在 `.openapi-operation` 容器内，只修改 `h2#request-body a` 和 `h2#response-body a` 的文本，不会修改参数名、代码块、正文或真实 Header 字段。

### 5. 回归测试

文件：`src/components/openapi/FumadocsOpenApiContent.test.tsx`

新增测试 `shows localized OpenAPI chrome in zh-CN without the auth sidebar`，覆盖：

- 中文站显示 `路径参数`
- 中文站显示 `请求 Header`
- 中文站正文参数区显示 `Authorization`
- 中文站不显示右侧 `鉴权`、`该接口需要鉴权。` 和 `basicAuth`
- 中文站显示 `请求 Body`
- 中文站显示 `响应 Body`
- 中文站不再显示 `Header Parameters`
- 中文站不再显示 `Request Body`

既有英文测试仍覆盖英文站隐藏 `Authorization` 参数的行为。

### 6. OpenAPI 描述中的 blockquote 提示样式

OpenAPI YAML 的 `description` 字段会按 Markdown 渲染。描述里直接写 Markdown blockquote：

```yaml
description: |-
  智能体在 RTC 频道内的用户 ID。
  > 同一 `channel` 内的用户 ID 不可重复，否则智能体加入频道会失败。
```

当前会展示为中文站的“注意”提示块样式，适合放一两句紧跟字段描述的注意事项。

这不是 `x-docs-callouts` 结构化提示块，只是 Markdown `>` 经过 OpenAPI Markdown 渲染链路后的展示效果。需要明确控制提示类型、标题、位置，或需要把提示从字段描述中拆出来时，仍应使用 `x-docs-callouts`。

## 后续维护入口

以后如果继续收到 `locale === 'zh-CN'` 的 OpenAPI 展示反馈，优先按下面顺序判断改哪里。

### 情况 A：我们自定义组件里的英文标题

修改：

```ts
const ZH_CN_OPENAPI_LABELS: Record<string, string> = {
  ...
};
```

适用例子：

- `Response Headers`
- `Request examples`
- `Response example`
- `Response schema`

### 情况 B：Fumadocs 内部生成的固定标题

修改：

```ts
const ZH_CN_OPENAPI_GENERATED_HEADING_LABELS: Record<string, string> = {
  'request-body': '请求 Body',
  'response-body': '响应 Body',
};
```

适用条件：

- 标题有稳定 DOM id。
- 标题由 Fumadocs 内部 slot 生成，不能通过我们已有组件 props 直接传文案。
- 只需要改标题文本，不需要改数据或结构。

如果未来这类标题明显变多，应重新评估是否要在应用根部接入 Fumadocs UI 的 i18n provider，而不是继续扩展 DOM 同步表。

### 情况 C：协议字段、参数名、Schema 字段名

通常不翻译。

例如：

- `Authorization`
- `Content-Type`
- `appid`
- `agent_id`

这些是 API 协议的一部分，应保持和请求示例、YAML、服务端协议一致。

### 情况 D：中文文档内容本身不对

修改 OpenAPI YAML 或迁移源内容，而不是渲染层。

例如：

- `Authorization` 参数描述不完整。
- 旧源链接指向错误。
- Token 和 Basic Auth 示例文本缺失。
- 中文语气或术语需要调整。

优先检查：

- `content/openapi/conversational-ai/rest-api.zh-CN.yaml`
- 旧源：`/Users/yejiayi/Documents/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml`

### 情况 E：字段描述内需要简短注意提示

如果提示只服务于当前字段，且不需要自定义提示类型或位置，可直接在该字段的 `description` 中使用 Markdown blockquote：

```yaml
description: |-
  字段说明。
  > 注意事项。
```

当前渲染会显示为“注意”提示块。不要把这种写法误认为结构化 callout；跨字段、跨段落或需要稳定元数据的提示，仍优先用 `x-docs-callouts`。

## 验证命令

当前改动已用以下命令验证：

```bash
bun run test -- src/components/openapi/FumadocsOpenApiContent.test.tsx
bun run types:check
bunx biome check src/components/docs-shell/DocsContent.tsx src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
```

全量 `bun run lint` 在当前工作区可能仍会被既有无关 Biome 问题阻塞；处理 OpenAPI zh locale 反馈时，至少应先保证本次触碰文件的 Biome 检查通过。

## 当前未解决/需注意

- `useLocalizedOpenApiGeneratedChrome` 是对 Fumadocs 内部标题的局部同步层。它的作用范围很小，但如果 Fumadocs 未来改变标题 DOM id，需同步更新 `ZH_CN_OPENAPI_GENERATED_HEADING_LABELS`。
- 不要把真实请求字段名加入中文翻译表，避免把协议字段误改成中文。
- 英文站行为是兼容性边界：除非明确要求，否则不能因为中文站反馈改变英文站 Authorization/参数展示逻辑。
