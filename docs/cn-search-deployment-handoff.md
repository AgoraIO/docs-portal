# 中文搜索部署交接

本仓库提供静态文档、Node 搜索 API、章节导出及索引发布 Job 的代码。容器、K8s、网关和流水线由外部部署项目承接。本文是部署输入合约，不是已经执行的生产发布。

## 服务与凭据

| 组件 | 构建/运行产物 | 运行配置 |
| --- | --- | --- |
| 中文静态站 | `VITE_DOCS_REGION=cn bun run build:static`，发布 dist/client | 不注入 Meilisearch 凭据 |
| 搜索 API | `VITE_DOCS_REGION=cn bun run build:service`，发布整个 .output；Node 执行 .output/server/index.mjs | HOST、PORT、MEILI_HOST、MEILI_INDEX_UID、MEILI_SEARCH_API_KEY |
| Meilisearch | 本地验证版本 1.12.8；线上版本要固定并重新验证兼容性 | 私网服务地址、持久化存储、管理员凭据由部署平台管理 |
| 索引发布 Job | 对应提交代码及同次静态构建的 dist/search | MEILI_HOST、MEILI_INDEX_UID、MEILI_WRITE_API_KEY、MEILI_TASK_API_KEY |

搜索密钥仅允许查询正式索引。Job 写入密钥允许正式及临时索引；task key 仅 tasks.get、indexes=["*"]，用于读取全局交换任务。详情与权限集合见 search-service.md。不要把 Master Key 放到 API 或浏览器。

K8s 的 Meilisearch 数据目录必须使用持久化存储，重启 Pod 不能丢索引。由部署项目确定 namespace、StorageClass、容量、备份恢复、资源上限及健康探针；本仓库不猜测公司集群配置。API 的 /api/health 仅表示进程存活，不能代替 Meilisearch 可用性检查。

仓库现有 Dockerfile 的 runtime 是 nginx，仅发布静态站，不包含 Node API。外部项目需要另外打包整个 .output 为 API 镜像，不能只部署现有 nginx 镜像就认为 /api/search 已提供服务。

同域 `/api/*` 转发至 API，其余路径走静态托管；保持英文部署的原有搜索路径。API 服务通过私网访问 Meilisearch，浏览器只访问同域 API。

## 流水线必须执行的顺序

1. 检出同一个发布提交，执行完整 CN build:static。
2. `bun run search:export:cn`，使用 dist/client 同次构建结果。
3. `node scripts/search/audit-cn-coverage.mjs --records=dist/search/cn-records.json`。未知无记录页、缺失路由/章节/锚点和平台/版本错误会阻止验收；已列明的无正文目录豁免仍需维护。
4. `bun run search:prepare:cn --revision="$RELEASE_SHA"`。正式索引继续服务，Job 写临时快照。
5. 对临时快照运行明确目标的质量查询；检查 FAQ 多产品归属、平台、版本、OpenAPI、拆词和章节跳转。不要用本地索引可搜代替这一步。
6. 发布同提交静态站并检查，再执行 `bun run search:promote:cn --revision="$RELEASE_SHA"`。
7. 对正式域名验证 API、搜索页、筛选、分页、结果点击与真实平台定位。发现站点/索引不一致时按已记录版本回滚两者。

保存 dist/search/cn-records.json、cn-release.json、审计和查询结果，与提交 SHA、静态产物建立对应关系。同一正式索引发布必须串行。交换成功后保留旧快照；不要再次执行已成功 promote 来充当回滚。发生网络异常且未记录交换任务时，先查任务及发布标记，避免重复交换。

## 发布门槛与待确认输入

- 当前本地结果复用了已有构建产物；正式发布前必须完成上面的全量干净构建，草稿 PR 不能作为该门槛已完成的证明。
- 原始 mentor 提交与当前均有相同的 35 项测试失败。详见 agents/reports/2026-10-09-cn-test-failure-audit.md；需由维护者确认现有问题的发布处置，不能整套跳过测试。
- 页面存在原有目录坏锚点、重复正文/平台 ID。已验证的点击样例不代表全部重复 ID 都安全；部署验收应加入高风险样例。
- SDK/API/RTC 泛词优化按当前需求暂停，不能宣称所有查询相关性已经达标。

实际进入测试环境需要提供：外部部署 repo/负责流程、集群及 namespace、镜像仓库、测试域名/网关规则、Meilisearch 存储及备份方案、Secret 注入方式。当前本机 kubectl 没有 current-context，尚未执行集群部署。
