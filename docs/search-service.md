# 静态文档与搜索服务

文档页面和搜索服务使用同一套 TanStack Start 源码，分别构建和发布。文档站由 CDN/静态托管提供页面，同域的 `/api/*` 由独立 Node 服务处理。中文搜索页与快捷搜索都请求 `GET /api/search`；浏览器不需要 Meilisearch 地址或密钥。AI 和登录暂不启用，后续可在 Start 的 API 路由与中间件中扩展。

本仓库提供构建、运行和索引更新能力。容器、Kubernetes、网关、密钥注入及发布流水线配置由其他项目维护。

## 构建与运行

```sh
# 静态站，输出 dist/client；不发布服务端函数
VITE_DOCS_REGION=cn bun run build:static

# 独立 Node 服务，输出 .output；不依赖预先生成的静态文档产物
VITE_DOCS_REGION=cn bun run build:service

# 运行整个 .output 产物，环境变量由运行平台注入
HOST=0.0.0.0 PORT=3000 bun run start:service
```

两种构建不会互相覆盖：服务构建预留 `dist/service` 为构建目录，Nitro 的最终可运行产物是整个 `.output`。服务入口只收录同一份 `/api/search` 和 `/api/health` 路由，不打包文档 UI/MDX，不进行页面预渲染。网关只需将 `/api/*` 转发给服务；页面流量继续走静态站。运行产物本身只需要 Node，也可以直接执行 `node .output/server/index.mjs`。`vite preview` 用于预览，不是生产服务命令。

运行服务需要以下私有环境变量，构建静态站不需要这些变量：

| 变量 | 用途 |
| --- | --- |
| `MEILI_HOST` | 服务可访问的 Meilisearch URL |
| `MEILI_INDEX_UID` | 稳定的中文索引名，例如 `docs_portal_cn` |
| `MEILI_SEARCH_API_KEY` | 只允许查询上述正式索引的搜索密钥 |

本地开发可把这些变量放入忽略的 `.env.local`，使用 `VITE_DOCS_REGION=cn bun --env-file=.env.local run dev`。生产平台在启动时注入变量。不要使用 `VITE_MEILI_*`、管理员密钥或写入密钥配置浏览器。

## API 合约

`GET /api/search?q=Token&product=rtc&platform=web&type=docs&page=1`

参数为 `q`、`product`、`platform`、`version`、`type`、`page` 和快捷搜索使用的 `tab`。关键词最多 500 个字符，页码为 1–500，每页 20 个章节；`type` 为 `all`、`docs` 或 `openapi`。API 只接受规定参数，始终附加中文、公开、已发布条件，不接受 Meilisearch 原始过滤表达式。

响应使用 `CnSearchPageResponse`：`groups` 按文档聚合章节，`totalHits` 统计章节，`totalPages`、`page` 与 `facets` 用于分页及筛选。分页发生在章节聚合之前，因此每页文档数量可以少于 20。响应不缓存；请求会在 10 秒后超时。参数错误返回 400，缺少服务配置返回 503，上游失败返回 502，均不暴露上游错误或凭据。

`GET /api/health` 返回 `{ "status": "ok" }`，用于进程存活检查，不表示 Meilisearch 可用。未配置或不可用的搜索服务会在搜索界面显示错误和重试入口。

## 索引发布合约

索引更新作为独立发布任务执行，不放在服务启动或用户请求中。Job 使用额外的 `MEILI_WRITE_API_KEY`，与服务搜索密钥分开；它需要 `indexes.create`、`indexes.get`、`indexes.swap`、`settings.update`、`documents.add`、`documents.get`、`stats.get`、`tasks.get` 权限，并覆盖正式索引及其 `__` 临时索引。无需给 API 服务写入权限。

Meilisearch 将 `indexSwap` 视为全局任务。在本地验证的 1.12.8 中，限定索引的写入密钥无法读取此任务，会返回 404。此时为 Job 额外注入 `MEILI_TASK_API_KEY`，只赋予 `tasks.get`、`indexes: ["*"]`；命令仅在查询任务时使用它。这样写入密钥仍可限定索引范围。参见 [Meilisearch 的索引交换规范](https://specs.meilisearch.dev/specifications/text/0191-swap-indexes-api.html)。

```sh
# 1. 构建同一次提交的 CN 静态站，再从其生成产物导出
VITE_DOCS_REGION=cn bun run build:static
bun run search:export:cn

# 2. 准备新索引，原正式索引继续提供服务
bun run search:prepare:cn --revision="$RELEASE_SHA"

# 3. 外部流水线发布对应的静态站，并完成检查
# 4. 发布成功后激活同一提交的索引
bun run search:promote:cn --revision="$RELEASE_SHA"
```

`search:export:cn` 读取 `public/__static/docs-routes.json`、`docs-search/zh-CN.json`、`sitemap.xml` 和发布的 `.md`。文档导航名单与真实发布页面的交集决定收录范围，排除隐藏文档和重定向别名。普通文档按章节收录，保留 Fumadocs 的实际锚点和平台变体；OpenAPI 按端点页面收录，因为它的可读 Markdown 栏目与交互页面锚点不同。缺失文件或空导出会失败。默认写入 `dist/search/cn-records.json`，可通过 `--public`、`--out` 指定其他产物目录。

`prepare` 在上传前校验所有记录，使用确定的章节 ID，设置检索/筛选字段，批量上传到独立临时索引并等待任务成功，再校验数量。默认回执为 `dist/search/cn-release.json`；`--records` 和 `--receipt` 可改路径。回执包含提交号、内容摘要、数量、索引名和上一次发布标记，不包含密钥。需要把 records 和 receipt 与同一次提交的静态站作为发布产物保存。

`promote` 校验回执、目标服务和提交号，通过 Meilisearch 的原子交换激活。它会先保存交换任务 ID，再等待成功；使用同一回执重试会恢复等待或报告已激活，不会再次交换。索引里有一个仅供 Job 使用的内部发布标记，公开查询始终排除它。完整快照替换使删除的页面自然退出搜索。

外部流水线必须串行执行同一个正式索引的发布；这里的发布标记检查不替代分布式锁。出现未知请求结果、网络断开且没有保存任务 ID 时，先检查 Meilisearch 任务和索引标记，再决定是否重试。不要同时运行多个 `promote`。

交换后临时索引保留上一版内容。回滚时，外部发布系统需同时恢复匹配的静态站和搜索索引；不要直接重复运行已成功的 `promote`。历史索引的保留数量与清理策略也由外部发布系统负责。首次发布正式索引尚不存在时，激活命令会先创建它。

目前中文接入 Meilisearch API，全球站继续使用既有 Algolia/Orama 配置。既有 `search-demo:*` 命令是独立实验，不属于生产索引更新链路。
