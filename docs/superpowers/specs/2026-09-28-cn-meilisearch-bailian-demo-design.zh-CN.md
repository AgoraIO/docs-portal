# CN Meilisearch 与百炼问答 Demo 技术方案

## 文档状态

已确认方向，待进入实施计划和逐任务开发。本文件是英文 spec 的中文版本，作为开发时的主要阅读材料；实现约束以两份 spec 的共同内容为准。

## 目标

在 CN 文档站上做一个可本地运行的 Demo：

```text
现有 CN 页面级 Orama 搜索
  → 章节级 KB 数据
  → Meilisearch 关键词搜索
  → 百炼 LLM Tool Call 问答 Demo
```

Demo 需要验证：

1. 章节级数据是否能让 API 属性命中真正的 `#anchor` 章节；
2. Meilisearch 是否能避免浏览器下载全部数据并在本地建立 Orama 索引；
3. 同一批结构化章节数据是否能同时服务普通文档搜索和未来客服问答；
4. 百炼是否能够通过 `search_docs` 工具检索相关章节后生成带引用的答案。

## 第一阶段不做什么

- 不改英文 Algolia；
- 不把全站 CN 文档直接上传给百炼；
- 不做向量搜索、Embedding 或完整 RAG；
- 不做生产环境 Kubernetes 部署；
- 不把百炼 API Key 放进浏览器；
- 不在第一版增加一个供普通搜索使用的永久 Search API；
- 不重写现有文档内容和导航结构；
- 不把 Meilisearch 或百炼描述成自动理解中文语义的系统。

## 总体链路

### 普通文档搜索

```text
用户选择“文档搜索”
  → CN 浏览器搜索客户端
  → Meilisearch
  → 返回章节标题、摘要、高亮和带 #anchor 的 URL
```

英文仍然使用 Algolia：

```text
英文 → Algolia
中文 → Meilisearch
```

### AI 问答

```text
用户选择“AI 问答”
  → AI 后端或百炼 Agent
  → 百炼 LLM Tool Call：search_docs(query, filters)
  → search_docs 工具实现
  → Meilisearch KB 索引
  → 返回少量相关章节、元数据和引用链接
  → 百炼 LLM
  → AI 答案 + 参考文档链接
```

MCP 或百炼 Tool Call 只是“调用工具的协议”，不是搜索引擎。真正执行检索的是 `search_docs` 工具内部的 Meilisearch 查询。

## KB 是什么

KB 是 Knowledge Base，即知识库。这里的 KB 不是“把所有文档复制一份”，也不只是 Meilisearch 的数据库，而是一层经过筛选、切分、补充元数据并验证过的知识数据。

```text
代表性源文档
  → 按章节/内容块提取
  → 校验语言、权限、版本、状态和引用
  → 生成 KB 记录
  → 上传到 Meilisearch
  → 普通搜索或 AI 工具调用使用
```

因为客服团队未来也要使用，KB 记录不能只保存一段匿名正文，还要保留：

- 文档标题、章节标题和规范 URL；
- `headingPath` 和 `#anchor`；
- 语言、产品、平台、版本、文档类型；
- 适用对象：开发者或客服；
- 内容状态：已发布、已废弃或内部；
- `hidden` 状态和权限边界；
- 可用于回答一个具体问题的完整局部上下文；
- 给客服或最终用户展示的引用信息。

## Demo 文档范围

本次不接入全站，而是建立固定的代表性文档 manifest。至少选择以下五类：

1. 产品或概念介绍：验证解释性正文和页面上下文；
2. Quickstart 或任务教程：验证步骤、列表和代码块；
3. API Reference：验证方法、参数、返回值和章节锚点；
4. FAQ 或故障排查：验证问答式表达；
5. 平台或版本相关文档：验证 Android/Web 等平台及版本过滤。

每篇入选文档都要在 manifest 中记录：

- 路由；
- 选择原因；
- 预期章节数量；
- 对应的 Golden Query；
- 是否允许客服使用；
- 是否存在版本或平台限制。

manifest 是本次 Demo 的边界，索引构建不能偷偷扩大到全站。

## KB 章节记录

```ts
type SearchSection = {
  id: string;
  url: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;
  headingPath: string[];
  locale: string;
  product?: string;
  platform?: string[];
  version?: string;
  docType: 'docs' | 'openapi';
  audience: ('developer' | 'customer-support')[];
  status: 'published' | 'deprecated' | 'internal';
  hidden: boolean;
  aliases?: string[];
};
```

必须保证：

- `id` 对同一语言、页面和章节锚点稳定且唯一；
- `url` 指向正确的页面和 `#anchor`；
- 一个记录代表一个有意义的章节，而不是任意一段文字；
- `content` 同时适合搜索摘要和未来 AI 的局部 context；
- 隐藏内容不能进入公开搜索或客服问答索引；
- `audience` 和 `status` 可用于避免客服看到内部或废弃内容；
- `.md` 与 `.mdx` 不产生重复记录；
- `Parameters`、`Returns` 等过短的通用子章节按规则合并到父章节。

## Meilisearch 设计

本次使用独立的 Demo KB 索引，例如 `cn-kb-demo-v1`，不覆盖现有实验索引。

初始字段优先级：

1. `sectionTitle`；
2. `aliases`；
3. `pageTitle`；
4. `content`。

Meilisearch 的 typo tolerance 可以处理部分拼写错误，但不能代替中文语义理解。中文描述和英文 API 名称之间的关系，第一阶段只使用少量可审核的 aliases，不自动生成大量翻译。

## CN 搜索适配器边界契约

本阶段只改中文 `zh-CN` 搜索为 Meilisearch；英文搜索继续使用现有 Algolia 链路，Algolia 的配置、排序、请求字段和高亮行为不在本阶段修改范围内。

搜索引擎的原始返回格式不能直接暴露给界面或未来的 AI 工具。CN 适配器分成两层：

```text
Meilisearch hit（可能带 _formatted 和引擎标签）
  → CN SearchHit（给 search_docs / AI 的规范化结构）
  → Fumadocs SearchResult（给现有搜索界面的兼容格式）
```

给 AI 和工具使用的 `SearchHit` 契约如下：

```ts
type HighlightSegment = {
  text: string;
  highlighted: boolean;
};

type SearchHit = {
  id: string;
  sourceId: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;       // 原始 Markdown/纯文本，不包含 HTML 高亮标签
  snippet: string;       // 原始摘要，不包含 HTML 高亮标签
  url: string;           // 必须保留正确的 #anchor
  headingPath: string[];
  locale: string;
  product?: string;
  platform?: string[];
  version?: string;
  docType: 'docs' | 'openapi';
  audience: string[];
  status: 'published' | 'deprecated' | 'internal';
  hidden: boolean;
  highlights: {
    sectionTitle: HighlightSegment[];
    content: HighlightSegment[];
  };
};
```

边界规则：

- Meilisearch 的 `<em>`、`<mark>` 或其他高亮标签必须在适配器内转换为 `HighlightSegment`，不能进入 `SearchHit.content` 或 `SearchHit.snippet`。
- 只有最后面向现有 Fumadocs 搜索界面时，才将结构化片段转换为界面约定的 `<mark>...</mark>`；界面不能依赖 Meilisearch 默认的 `<em>`。
- CN 浏览器搜索请求固定附带 `locale = "zh-CN"`、`hidden = false` 和 `status = "published"`；适配器收到不符合这些条件的结果时仍要丢弃，作为第二道防线。
- `url` 必须是章节 URL；API 属性命中时必须保留 `#anchor`，不能退化为 overview 页面 URL。
- 平台、产品和版本过滤只能通过适配器生成的受控过滤条件传入，不能拼接未经验证的任意查询语句。
- 浏览器只能使用 Meilisearch search-only key；master key 只允许存在于索引脚本或服务端环境变量中。
- 401、403、5xx 等搜索服务错误转换为有限的搜索错误状态，不能把原始响应、密钥或服务端配置返回给浏览器。
- Task 7 的 `search_docs` 只能消费规范化的 `SearchHit`，不能直接消费 Meilisearch 原始 hit。

## 百炼和 RAM 账号接入边界

RAM 账号解决的是“谁可以登录和操作阿里云资源”，不等于代码调用模型时直接使用 RAM 登录密码。

本地 Demo 的接入准备是：

```text
RAM 用户登录百炼控制台
  → 确认该 RAM 用户拥有百炼模型/应用访问权限
  → 在百炼控制台创建 API Key
  → API Key 只保存到本地环境变量或后端 Secret
  → AI 后端调用百炼
```

建议使用类似下面的环境变量名：

```bash
DASHSCOPE_API_KEY=只存在本地或服务端的密钥
BAILIAN_MODEL=选择的测试模型
BAILIAN_WORKSPACE_ID=业务空间 ID（如该调用方式需要）
```

不能把 `DASHSCOPE_API_KEY` 写成 `VITE_*` 变量，也不能放进 React 组件或浏览器请求中。开发阶段可以使用百炼新人免费额度，但仍要开启“免费额度用完即停”或设置费用保护。

## Tool Call 接口

`search_docs` 的职责是：

1. 接收用户问题和可选过滤条件；
2. 只查询固定的 Demo KB 索引；
3. 排除 `hidden`、`internal` 或不符合权限的记录；
4. 限制返回条数和正文长度；
5. 返回标题、正文、`headingPath`、URL 和必要元数据。

概念接口：

```ts
type SearchDocsInput = {
  query: string;
  locale?: string;
  product?: string;
  platform?: string[];
  version?: string;
  audience?: 'developer' | 'customer-support';
};

type SearchDocsOutput = {
  results: Array<{
    id: string;
    title: string;
    content: string;
    url: string;
    headingPath: string[];
    score?: number;
  }>;
};
```

## Docker Compose 本地验证

本地环境至少包括：

- 固定版本的 Meilisearch 服务；
- 持久化 volume；
- health check；
- 一次性 KB indexer；
- 独立的 AI/tool-call backend 或本地 mock；
- 不提交到 Git 的 Meilisearch master key 和百炼 API Key。

静态 Nginx 文档站不运行 Meilisearch，也不运行百炼后端。普通搜索可以在 Demo 中使用受限的 Meilisearch search-only key；AI 模式必须经过后端或受控工具接口。

## 测试和验收

每个 Task 都遵循：

```text
先写失败测试 → 确认 RED → 写最小实现 → 确认 GREEN → 验证 → 停下来交你审查
```

必须覆盖：

- API 属性命中正确章节和 anchor；
- 中文 alias 能命中明确维护的 API；
- typo tolerance 的已知案例；
- 平台、产品、版本过滤；
- hidden/internal 内容不进入搜索或客服结果；
- 重复构建不产生重复记录；
- Tool Call 只返回 manifest 中的 KB 记录；
- 百炼收到的是少量选中章节，不是全量文档；
- AI 答案包含可核验的原始文档链接；
- API Key 不出现在浏览器 bundle 和网络请求中。

## 分阶段任务

每个任务完成后暂停，等待审查，不自动开始下一项：

1. 建立独立 worktree/分支、KB manifest 和数据契约测试；
2. 从代表性文档生成章节 KB 记录；
3. 用 Docker Compose 启动本地 Meilisearch；
4. 上传 Demo KB 索引和搜索设置；
5. 接入 CN 普通搜索客户端；
6. 完成搜索结果、高亮和 anchor 跳转；
7. 实现受限的 `search_docs` Tool Call 后端；
8. 用百炼调用工具并生成带引用的答案；
9. 完成 Golden Query、浏览器和 AI Demo 验证。

本中文 spec 审查通过后，先生成详细 implementation plan；implementation plan 审查通过后才开始 Task 1。
