# OpenAPI YAML Migration Playbook

本文记录从旧 Shengwang 文档仓库批量迁移 OpenAPI YAML 到 `docs-portal`
的标准步骤，并以本次迁移
`/Users/yejiayi/Documents/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml`
为例说明实际改动。

## 目标模型

OpenAPI YAML 是结构化数据源，不是 Fumadocs 页面源。

- 源文件放在 `content/openapi/**`。
- 不要把 OpenAPI YAML 放进 `content/docs/**`。
- `public/openapi/**` 由 `scripts/sync-openapi-assets.mjs` 生成，不手动维护。
- endpoint 页面由 `src/lib/openapi/lanes.ts` 中的 lane registry 根据
  `operationId` 生成路由、侧边栏、搜索、llms 和 prerender 路径。
- 每个 OpenAPI source 必须在 `src/lib/openapi/source-text.server.ts` 注册
  `?raw` import，否则部署运行时在没有源码目录的环境里无法读取 YAML。

## 批量迁移步骤

### 1. 盘点源文件

先列出需要迁移的旧 YAML，并记录来源、产品、语言和预期目标文件。

```bash
find /Users/yejiayi/Documents/shengwang-doc-source/html-docs \
  -type f \( -name '*.yaml' -o -name '*.yml' \)
```

建议为每个文件记录：

- source path：旧仓库绝对路径。
- target path：`content/openapi/{product}/{name}.{locale}.yaml`。
- public URL：`/openapi/{product}/{name}.{locale}.yaml`。
- lane id：例如 `convoai`、`speech-to-text-rest`。
- locale：`en`、`zh-CN`，或暂时只支持单语言。

### 2. 对比现有站内 OpenAPI 结构

迁移前检查当前 repo 是否已有同产品的英文版、lane、测试和 meta。

```bash
ls -la content/openapi/{product}
rg "{product}|rest-api.en.yaml|sourcePath|publicSourceUrl" \
  src/lib/openapi content/openapi scripts
```

重点看这些文件：

- `content/openapi/{product}/`
- `content/openapi/{product}/openapi.meta.json`
- `src/lib/openapi/lanes.ts`
- `src/lib/openapi/source-text.server.ts`
- `src/lib/openapi/*.test.ts`
- `scripts/audit-doc-links.test.ts`

### 3. 解析并比对 operationId

迁移前必须确认新 YAML 的 `operationId` 是否与 lane registry 一致。
如果是同一产品的中文版本，通常应该和英文版共享同一组 `operationId`。

```bash
python3 - <<'PY'
import yaml
from pathlib import Path

files = [
    Path('content/openapi/conversational-ai/rest-api.en.yaml'),
    Path('/Users/yejiayi/Documents/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml'),
]

for file in files:
    doc = yaml.safe_load(file.read_text(encoding='utf-8-sig'))
    print(f'\n{file}')
    print('title:', doc.get('info', {}).get('title'))
    print('server:', (doc.get('servers') or [{}])[0].get('url'))
    for path, methods in (doc.get('paths') or {}).items():
        for method, operation in (methods or {}).items():
            if isinstance(operation, dict) and operation.get('operationId'):
                print(operation['operationId'], method.upper(), path, operation.get('summary'))
PY
```

如果发现新增、删除或重命名的 `operationId`：

- 新增 operation：在 `src/lib/openapi/lanes.ts` 加 `operationId -> routeLeaf`。
- 删除 operation：确认是否要删除 lane entry，否则测试应失败。
- 重命名 operation：优先确认是不是源文件错误；不要为了通过测试盲改路由。

### 4. 复制 YAML 到 content/openapi

按 repo 命名约定放入 `content/openapi/**`。

```bash
cp /path/to/source.yaml content/openapi/{product}/{name}.zh-CN.yaml
perl -i -pe 's/^\x{FEFF}//' content/openapi/{product}/{name}.zh-CN.yaml
```

注意：

- 使用 `utf-8-sig` 或去 BOM，避免文件首字符污染 `openapi:`。
- 保留区域差异，例如中文源的国内 server URL。
- 不改业务字段含义，只做站内链接和格式必要清理。

### 5. 清理可确定的站内旧链接

OpenAPI description 里常有旧站链接，例如 `/doc/convoai/...` 或
`https://doc.shengwang.cn/doc/...`。能明确映射到新站路径的，应改成新站路径。

常见映射示例：

| 旧路径 | 新路径 |
| --- | --- |
| `/doc/convoai/restful/user-guides/custom-llm` | `/zh-CN/ai/user-guides/custom-llm` |
| `/doc/convoai/restful/user-guides/listen-agent-events` | `/zh-CN/ai/user-guides/listen-agent-events` |
| `/doc/convoai/restful/webhook/enable-ncs` | `/zh-CN/ai/webhook/enable-ncs` |
| `/doc/convoai/restful/convoai/operations/start-agent` | `/zh-CN/api-reference/api-ref/conversational-ai/join` |
| `/doc/convoai/restful/convoai/operations/stop-agent` | `/zh-CN/api-reference/api-ref/conversational-ai/leave` |
| `/doc/convoai/restful/convoai/operations/agent-speak` | `/zh-CN/api-reference/api-ref/conversational-ai/speak` |
| `/doc/convoai/restful/convoai/operations/agent-interrupt` | `/zh-CN/api-reference/api-ref/conversational-ai/interrupt` |
| `https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication` | `/zh-CN/realtime-media/rtc/basic-features/token-authentication` |

不要猜测无法确认的外链。第三方服务文档、控制台链接和 FAQ 可暂时保留。

### 6. 更新 lane registry

在 `src/lib/openapi/lanes.ts` 中更新或新增 lane。

已有 lane 增加中文 YAML 时，通常只改：

```ts
publicSourceUrl: {
  en: '/openapi/{product}/{name}.en.yaml',
  'zh-CN': '/openapi/{product}/{name}.zh-CN.yaml',
},
sourcePath: {
  en: 'content/openapi/{product}/{name}.en.yaml',
  'zh-CN': 'content/openapi/{product}/{name}.zh-CN.yaml',
},
```

新增产品时，必须补全：

- `id`
- `parentUrl`
- `publicSourceUrl`
- `routePrefix`
- `sourcePath`
- `tab`
- `operations`
- 必要时的 `locales`

不要在 `docs-page.server.ts`、search、llms 或 prerender 里加产品专用逻辑。
这些消费者应继续从 lane table 派生。

### 7. 更新 bundled source text registry

在 `src/lib/openapi/source-text.server.ts` 增加 raw import 和 map entry。

```ts
import productRestZhCnYaml from '../../../content/openapi/{product}/{name}.zh-CN.yaml?raw';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/{product}/{name}.zh-CN.yaml': productRestZhCnYaml,
};
```

`src/lib/openapi/source-text.server.test.ts` 会检查
`content/openapi/**` 下每个 YAML 都有注册。

### 8. 更新测试

至少更新这些测试：

- `src/lib/openapi/lanes.test.ts`
  - source path 和 public URL 期望。
  - prerender path 数量如有变化，也要更新。
- `src/lib/openapi/source.server.test.ts`
  - 验证每个 locale 的 YAML `operationId` 与 registry 同步。
  - 验证本地化字段来自正确 YAML，例如中文 summary 或 server URL。
- `src/lib/openapi/source-text.server.test.ts`
  - 通常不用改；新增 YAML 后它会自动覆盖。
- `src/lib/openapi/markdown.test.ts`
  - 如果机器可读导出策略变化，更新 traceability 断言。
- `scripts/audit-doc-links.test.ts`
  - 如果新增 link normalization 规则，补测试。

### 9. 运行验证

OpenAPI lane 变更至少跑：

```bash
bun test src/lib/openapi/lanes.test.ts \
  src/lib/openapi/source.server.test.ts \
  src/lib/openapi/source-text.server.test.ts \
  src/lib/openapi/markdown.test.ts

bun test scripts/audit-doc-links.test.ts
bun run types:check
bun run build
git diff --check
```

构建成功后检查：

```bash
ls -l public/openapi/{product}/{name}.zh-CN.yaml
git status --short --ignored public/openapi
```

预期结果：

- `public/openapi/**` 里能看到同步产物。
- `git status --short public/openapi` 不应出现跟踪变更。
- `git status --short --ignored public/openapi` 可以显示 `!! public/openapi/`。

### 10. 抽查本地 URL

开发服务启动后抽查：

```text
http://localhost:3000/{locale}/api-reference/api-ref/{product}
http://localhost:3000/{locale}/api-reference/api-ref/{product}/{routeLeaf}
http://localhost:3000/openapi/{product}/{name}.zh-CN.yaml
```

确认页面展示中文 summary、中文描述、正确 server URL 和 endpoint body。

## 本次 ConvoAI 迁移做了什么

用户要求迁移：

```text
/Users/yejiayi/Documents/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml
```

站内已有英文 OpenAPI：

```text
content/openapi/conversational-ai/rest-api.en.yaml
```

实际处理如下。

### 1. 检查现有结构

查看了：

- `content/openapi/conversational-ai/`
- `src/lib/openapi/lanes.ts`
- `scripts/sync-openapi-assets.mjs`
- `src/lib/openapi/source-text.server.ts`
- OpenAPI 相关测试

结论：

- 现有 `convoai` lane 的英文和中文都指向 `rest-api.en.yaml`。
- 中文页面需要切换到新的中文 YAML。
- `public/openapi/**` 由 sync 脚本生成，不直接提交。

### 2. 比对英文和中文 YAML

用脚本解析了两个 YAML：

- 英文：`content/openapi/conversational-ai/rest-api.en.yaml`
- 中文：`/Users/yejiayi/Documents/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml`

确认结果：

- 两边都有 10 个 operation。
- `operationId` 完全一致：
  - `start-agent`
  - `stop-agent`
  - `agent-update`
  - `query-agent-status`
  - `get-agent-list`
  - `agent-speak`
  - `agent-interrupt`
  - `agent-think`
  - `get-history`
  - `get-turns`
- 中文源的 server 是：
  `https://api.agora.io/cn/api/conversational-ai-agent`
- 英文源的 server 是：
  `https://api.agora.io/api/conversational-ai-agent`

因此没有改 endpoint 路由表，只切换中文 locale 的 YAML source。

### 3. 新增中文 YAML

新增：

```text
content/openapi/conversational-ai/rest-api.zh-CN.yaml
```

处理：

- 从旧仓库复制源 YAML。
- 去掉 UTF-8 BOM。
- 保留中文标题、中文描述和国内 server URL。
- 将能确认的新站路径替换掉旧 ConvoAI/RTC 站内链接。

### 4. 更新 lane

修改：

```text
src/lib/openapi/lanes.ts
```

将 `convoai` lane 的中文配置改为：

```ts
publicSourceUrl: {
  en: '/openapi/conversational-ai/rest-api.en.yaml',
  'zh-CN': '/openapi/conversational-ai/rest-api.zh-CN.yaml',
},
sourcePath: {
  en: 'content/openapi/conversational-ai/rest-api.en.yaml',
  'zh-CN': 'content/openapi/conversational-ai/rest-api.zh-CN.yaml',
},
```

### 5. 更新 raw source registry

修改：

```text
src/lib/openapi/source-text.server.ts
```

新增中文 YAML 的 `?raw` import，并加入 `OPENAPI_SOURCE_TEXT`。

### 6. 更新测试

修改：

```text
src/lib/openapi/lanes.test.ts
src/lib/openapi/source.server.test.ts
```

测试覆盖：

- `convoai` lane 的中文 public URL 和 source path。
- 每个 lane 的每个 locale 都要验证 YAML `operationId` 与 registry 同步。
- `start-agent` 中文 summary 为 `创建对话式智能体`。
- 中文 server URL 为 `https://api.agora.io/cn/api/conversational-ai-agent`。

另修：

```text
scripts/audit-mdx-build-syntax.test.ts
```

原因是 `bun run types:check` 暴露该测试里对 `{}` 做字符串索引的既有 TS
错误。只改断言写法，不改运行逻辑。

### 7. 验证结果

已通过：

```bash
bun test src/lib/openapi/lanes.test.ts \
  src/lib/openapi/source.server.test.ts \
  src/lib/openapi/source-text.server.test.ts \
  src/lib/openapi/markdown.test.ts

bun test scripts/audit-doc-links.test.ts
bun run types:check
bun run build
git diff --check
```

`bun run build` 中确认同步了：

```text
public/openapi/conversational-ai/rest-api.zh-CN.yaml
```

全量 `bun run test` 未通过，但失败集中在既有无关用例：

- `DocsShell.test.tsx`
- `SdksCatalog.test.tsx`
- `docs-journeys.test.ts`
- `docs-single-folder-sections.test.ts`
- `docs-content-regressions.test.ts`

这些失败指向移动导航菜单、SDK 版本预期、Flexible Classroom 表格等内容，
与本次 ConvoAI OpenAPI YAML 迁移无直接交集。

## 本次入口 URL

开发服务启动后：

```text
http://localhost:3000/zh-CN/api-reference/api-ref/conversational-ai
http://localhost:3000/zh-CN/api-reference/api-ref/conversational-ai/join
http://localhost:3000/openapi/conversational-ai/rest-api.zh-CN.yaml
```

