# OpenAPI Migration Playbook

本文是将旧 Shengwang RESTful API YAML 迁移到 `docs-portal` 并在站内展示的标准流程。后续 agent 迁移 OpenAPI 文件时，应先阅读本文，再开始复制文件或改路由。

## 目标模型

OpenAPI YAML/JSON 是结构化数据源，不是 Fumadocs 页面源。

- 源文件只维护在 `content/openapi/**`。
- 不要把 OpenAPI YAML/JSON 放进 `content/docs/**`。
- 不要手动维护 `public/openapi/**`；它由 `bun run openapi:sync` 从 `content/openapi/**` 生成。
- 站内 endpoint 页面由 `src/lib/openapi/lanes.ts` 的 lane registry 根据 `operationId` 派生。
- `src/lib/openapi/lanes.ts` 同时驱动路由、左侧导航 overlay、搜索、llms 导出和 prerender 路径。
- 每个被 lane 使用的 YAML/JSON 都必须在 `src/lib/openapi/source-text.server.ts` 注册 `?raw` import，避免部署运行时依赖文件系统读取源码目录。

## 迁移前决策

开始前先回答这些问题，并把结论记录到迁移 PR 或 issue 中。

- 这个 YAML 只是作为 `/openapi/**` 公共源文件发布，还是也要生成站内 endpoint 页面？
- 目标产品路径是什么，例如 `api-reference/api-ref/conversational-ai` 或 `api-reference/api-ref/cloud-recording`？
- 语言策略是什么：共用英文 YAML，还是维护 `.en.yaml` 和 `.zh-CN.yaml`？
- 旧源中每个接口是否都有稳定、唯一的 `operationId`？
- 是否已有同产品 lane、入口页、鉴权页、状态码页或 `meta.json`？
- 是否需要新增或修改 legacy redirect、link audit 规则、机器可读导出断言？

## 文件放置规则

推荐命名：

```text
content/openapi/{product}/{name}.en.yaml
content/openapi/{product}/{name}.zh-CN.yaml
content/openapi/{product}/openapi.meta.json
```

示例：

```text
content/openapi/conversational-ai/rest-api.en.yaml
content/openapi/conversational-ai/rest-api.zh-CN.yaml
content/openapi/cloud-recording/cloud-recording.en.yaml
content/openapi/speech-to-text/v7.zh-CN.yaml
```

`openapi.meta.json` 可作为产品级 OpenAPI 元信息，但站内 endpoint 路由的真实合同仍然是 `src/lib/openapi/lanes.ts`。

## 标准迁移步骤

### 1. 盘点源 YAML

列出旧源文件，并记录来源、目标路径、语言、产品和预期路由。

```bash
find /Users/yejiayi/Documents/shengwang-doc-source/html-docs \
  -type f \( -name '*.yaml' -o -name '*.yml' \)
```

每个文件至少记录：

- source path：旧仓库绝对路径。
- target path：`content/openapi/{product}/{name}.{locale}.yaml`。
- public URL：`/openapi/{product}/{name}.{locale}.yaml`。
- lane id：例如 `convoai`、`cloud-recording-rest`。
- route prefix：例如 `api-reference/api-ref/cloud-recording`。
- locale：`en`、`zh-CN`，或明确只支持单语言。

### 2. 检查现有产品结构

迁移前先确认仓库里是否已有同产品 OpenAPI、lane 和 docs 入口。

```bash
ls -la content/openapi/{product}
rg "{product}|sourcePath|publicSourceUrl|routePrefix" src/lib/openapi content/docs
```

重点检查：

- `content/openapi/{product}/`
- `src/lib/openapi/lanes.ts`
- `src/lib/openapi/source-text.server.ts`
- `content/docs/{locale}/api-reference/api-ref/{product}/index.mdx`
- `content/docs/{locale}/api-reference/api-ref/{product}/meta.json`
- `src/lib/openapi/*.test.ts`

### 3. 复制并清理 YAML

把文件放到 `content/openapi/**`。

```bash
cp /path/to/source.yaml content/openapi/{product}/{name}.zh-CN.yaml
perl -i -pe 's/^\x{FEFF}//' content/openapi/{product}/{name}.zh-CN.yaml
```

清理时只做确定性的迁移：

- 去掉 BOM。
- 保留产品真实 server URL 和区域差异。
- 修正明确可映射的新站内部链接。
- 将旧源描述中的 raw HTML tag（例如 `<ul>`、`<li>`、`<br>`）改成标准 Markdown。保留 Markdown blockquote（`> ...`）：中文 OpenAPI renderer 会将其渲染为提示样式。
- 保留无法确认的第三方链接、控制台链接、FAQ 链接，并在 PR 中说明。
- 不改接口字段含义、示例语义或错误码定义。

### 4. 校验 operationId

站内 endpoint 页面以 `operationId` 为主键。复制到目标位置后，必须确认 YAML 的 operation list。

```bash
python3 - <<'PY'
import yaml
from pathlib import Path

file = Path('content/openapi/{product}/{name}.zh-CN.yaml')
doc = yaml.safe_load(file.read_text(encoding='utf-8-sig'))

for path, methods in (doc.get('paths') or {}).items():
    for method, operation in (methods or {}).items():
        if isinstance(operation, dict):
            print(operation.get('operationId'), method.upper(), path, operation.get('summary'))
PY
```

要求：

- 每个要展示的 operation 必须有 `operationId`。
- 同一 YAML 内 `operationId` 必须唯一。
- 同一 lane 的不同 locale YAML 应共享同一组 `operationId`。
- 不要为了通过测试随意重命名 `operationId`；先确认旧源和目标 IA 的真实意图。

### 5. 拆分 operation 描述和正文

站内 OpenAPI endpoint 的页面头部会把 operation `description` 当作短摘要渲染。这个位置是纯文本，不解析 Markdown。因此不要把多段正文、列表、链接、反引号或 `>` blockquote 放进 operation `description`。

每个要展示的 operation 应使用这个结构：

- `summary`：页面标题的短标题。
- `description`：一句短页面摘要，不包含 Markdown 块语法。
- `x-docs-sections`：正文说明，支持 Markdown。
- `x-docs-callouts`：提示、注意事项、限制条件，支持 Markdown；中文页面会渲染为本地化提示样式。

不要这样写：

```yaml
paths:
  /v1/apps/{appid}/cloud_recording/acquire:
    post:
      summary: 获取云端录制资源
      description: |-
        `acquire` 方法：获取云端录制资源。

        在开始云端录制之前，你需要调用 `acquire` 方法获取一个 Resource ID。

        > - `acquire` 和 `start` 的请求需配对调用。
        > - 在获取 Resource ID 后的 2 秒内调用 [`start`](./start)。
```

应该拆成：

```yaml
paths:
  /v1/apps/{appid}/cloud_recording/acquire:
    post:
      summary: 获取云端录制资源
      description: 获取用于云端录制任务的 Resource ID。
      x-docs-sections:
        - position: after-description
          markdown: |-
            `acquire` 方法用于获取云端录制资源。

            在开始云端录制之前，你需要调用 `acquire` 方法获取一个 Resource ID。一个 Resource ID 只能用于一次云端录制服务。
      x-docs-callouts:
        - position: after-description
          markdown: |-
            - `acquire` 和 `start` 的请求需配对调用。
            - 在每次 `acquire` 请求获取到 Resource ID 后的 2 秒内立即发起对应的 [`start`](start) 请求。
```

注意链接写法：

- 同一 OpenAPI lane 内的 endpoint 链接使用 route leaf，例如 `[start](start)`。
- 不要保留旧源里的 `./start`，除非已经确认当前 renderer 和 link audit 都能正确解析。
- 站内其他页面使用新站绝对路径，例如 `/zh-CN/api-reference/api-ref/cloud-recording/authentication`。

迁移后用脚本检查 operation 级 `description` 是否还包含 Markdown 块语法：

```bash
python3 - <<'PY'
import yaml
from pathlib import Path

file = Path('content/openapi/{product}/{name}.zh-CN.yaml')
doc = yaml.safe_load(file.read_text(encoding='utf-8-sig'))

for path, methods in (doc.get('paths') or {}).items():
    for method, operation in (methods or {}).items():
        if not isinstance(operation, dict) or not operation.get('operationId'):
            continue
        description = operation.get('description') or ''
        if '\n' in description or '`' in description or '>' in description or '[' in description:
            print(operation.get('operationId'), repr(description[:160]))
PY
```

正常情况下不应输出 operation。字段级 schema/parameter/response `description` 可以继续使用 Markdown，因为它们由 OpenAPI renderer 的 Markdown 处理器渲染。其中 Markdown blockquote（`> ...`）可以保留，用于提示类内容；不要把旧源 raw HTML tag 当作 Markdown 保留。

迁移后用脚本检查 OpenAPI 描述中是否仍包含 raw HTML tag：

```bash
python3 - <<'PY'
import re
import yaml
from pathlib import Path

file = Path('content/openapi/{product}/{name}.zh-CN.yaml')
doc = yaml.safe_load(file.read_text(encoding='utf-8-sig'))
html_tag = re.compile(r'<[A-Za-z][^>]*>')

def walk(value, path):
    if isinstance(value, dict):
        for key, child in value.items():
            walk(child, f'{path}.{key}')
    elif isinstance(value, list):
        for index, child in enumerate(value):
            walk(child, f'{path}[{index}]')
    elif isinstance(value, str) and html_tag.search(value):
        print(f'{path}: {html_tag.search(value).group(0)}')

walk(doc, file.as_posix())
PY
```

正常情况下不应输出 raw HTML tag。若输出的是必须保留的占位符或示例值，需在 PR 中说明；其他情况应改写为标准 Markdown。

### 6. 注册 bundled source text

更新 `src/lib/openapi/source-text.server.ts`。

新增 raw import：

```ts
import productRestZhCnYaml from '../../../content/openapi/{product}/{name}.zh-CN.yaml?raw';
```

新增 map entry：

```ts
const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/{product}/{name}.zh-CN.yaml': productRestZhCnYaml,
};
```

如果漏掉这一步，本地文件系统可用时可能不暴露问题，但部署运行时会因为缺少 bundled source 而失败。

### 7. 注册或更新 lane

更新 `src/lib/openapi/lanes.ts`。每个 YAML source 对应一条 lane 记录，或作为已有 lane 的一个 locale source。

lane 必须包含：

- `id`
- `parentUrl`
- `publicSourceUrl`
- `routePrefix`
- `sourcePath`
- `tab`
- `operations`
- 必要时的 `locales`

示例形状：

```ts
{
  id: 'example-rest',
  parentUrl: {
    en: '/en/api-reference/api-ref/example',
    'zh-CN': '/zh-CN/api-reference/api-ref/example',
  },
  publicSourceUrl: {
    en: '/openapi/example/rest-api.en.yaml',
    'zh-CN': '/openapi/example/rest-api.zh-CN.yaml',
  },
  routePrefix: 'api-reference/api-ref/example',
  sourcePath: {
    en: 'content/openapi/example/rest-api.en.yaml',
    'zh-CN': 'content/openapi/example/rest-api.zh-CN.yaml',
  },
  tab: 'api-reference',
  operations: {
    'create-example': {
      routeLeaf: 'create',
      title: {
        en: 'Create an example',
        'zh-CN': '创建示例',
      },
    },
  },
}
```

不要在 `docs-page.server.ts`、search、llms、prerender 或 renderer 中添加产品专用分支。它们应继续从 lane table 派生。

### 8. 创建或更新 docs 入口和导航

OpenAPI endpoint 是虚拟页面，但产品入口和左侧导航仍然依赖 `content/docs/**`。

通常需要：

```text
content/docs/en/api-reference/api-ref/{product}/index.mdx
content/docs/en/api-reference/api-ref/{product}/meta.json
content/docs/zh-CN/api-reference/api-ref/{product}/index.mdx
content/docs/zh-CN/api-reference/api-ref/{product}/meta.json
```

`meta.json` 的 `pages` 必须列出 lane 中的 `routeLeaf`，否则 endpoint 可以解析但不会按预期出现在左侧导航中。

示例：

```json
{
  "title": "Example REST API",
  "navScope": {},
  "pages": [
    "index",
    "authentication",
    "create",
    "query",
    "update",
    "delete",
    "status-codes"
  ]
}
```

入口页 `index.mdx` 应说明 API 基础信息，并链接到生成的 endpoint 页面。人工页面仍然使用 `docs/agents/markdown-authoring-standard.md`。

### 9. 更新测试

OpenAPI lane 迁移至少要覆盖：

- `src/lib/openapi/lanes.test.ts`
  - 新 lane 是否存在。
  - endpoint URL 是否可解析。
  - prerender path 数量是否正确。
- `src/lib/openapi/source.server.test.ts`
  - lane registry 的 `operationId` 与 YAML 同步。
  - locale-specific YAML 确实加载了本地化 summary/server/description。
- `src/lib/openapi/fumadocs-source.server.test.ts`
  - operation `description` 保持短摘要。
  - 长正文进入 `x-docs-sections`。
  - 注意事项进入 `x-docs-callouts`。
- `src/lib/openapi/source-text.server.test.ts`
  - 所有 `content/openapi/**` YAML 都有 bundled source 注册。
- `src/lib/openapi/markdown.test.ts`
  - 如果影响 llms 或 raw markdown 输出，补 source traceability 断言。
- `scripts/audit-doc-links.test.ts`
  - 如果新增链接解析或旧站链接映射规则，补测试。

### 10. 运行验证

最小验证集：

```bash
bun run openapi:sync
bun test src/lib/openapi/lanes.test.ts \
  src/lib/openapi/source.server.test.ts \
  src/lib/openapi/source-text.server.test.ts \
  src/lib/openapi/markdown.test.ts
bun run types:check
```

如果新增产品、路由、导航、搜索、llms、prerender 或可见页面，继续运行：

```bash
bun run docs:links
bun run build
```

构建后检查：

```bash
ls -l public/openapi/{product}/{name}.zh-CN.yaml
git status --short public/openapi
git status --short --ignored public/openapi
```

预期：

- `/public/openapi/**` 有同步产物。
- `git status --short public/openapi` 没有 tracked 变更。
- `git status --short --ignored public/openapi` 可以显示 ignored 产物。

### 11. 浏览器抽查

启动开发服务：

```bash
bun run dev
```

检查：

```text
http://localhost:3000/{locale}/api-reference/api-ref/{product}
http://localhost:3000/{locale}/api-reference/api-ref/{product}/{routeLeaf}
http://localhost:3000/openapi/{product}/{name}.{locale}.yaml
```

确认：

- endpoint 页面能加载。
- 左侧导航显示虚拟 endpoint。
- 标题、summary、description、server URL 使用正确语言源。
- 请求参数、请求体、响应、schema 和示例能正常渲染。
- 页面没有明显溢出、空白或重复标题。

## 常见错误

- 把 YAML 放到 `content/docs/**`，导致 Fumadocs metadata/page tree 误处理。
- 复制到 `content/openapi/**` 后忘记更新 `source-text.server.ts`。
- lane 的 `operationId` 和 YAML 不一致。
- 把多段 Markdown、列表或 blockquote 放进 operation `description`，导致页面头部按纯文本显示反引号和 `>`。
- 把注意事项放进 `x-docs-sections` 而不是 `x-docs-callouts`，导致中文提示样式缺失。
- 保留旧源 raw HTML tag，例如 `<ul>`、`<li>`、`<br>`；应改成标准 Markdown。Markdown blockquote（`> ...`）不是 raw HTML，可以保留用于提示样式。
- `meta.json` 没列 `routeLeaf`，导致侧边栏缺 endpoint。
- 中文 locale 仍指向英文 YAML，或标题没有本地化。
- 手动提交 `public/openapi/**` 产物。
- 只跑 `openapi:sync`，没有验证 endpoint 页面、搜索、llms 和 prerender。
- 为某个产品在 loader/search/llms 里写专用逻辑，绕过 lane registry。

## 参考样例

- 双语 REST YAML：`content/openapi/conversational-ai/rest-api.en.yaml` 和 `content/openapi/conversational-ai/rest-api.zh-CN.yaml`
- REST lane registry：`src/lib/openapi/lanes.ts`
- bundled source registry：`src/lib/openapi/source-text.server.ts`
- endpoint 导航：`content/docs/en/api-reference/api-ref/cloud-recording/meta.json`
- 中文 endpoint 导航：`content/docs/zh-CN/api-reference/api-ref/conversational-ai/meta.json`
- 迁移验证总表：`docs/migration/verification-checklist.md`
