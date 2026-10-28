# 中文文档与搜索的统一发布入口

## 为什么需要这个流程

搜索是独立发布的完整快照。已有的 `cn-sdk-publication.ts` 会根据各产品、平台的 `navScope.defaultVersion`（默认 `current`）过滤历史 SDK；已有 prepare/promote 提供临时索引、发布回执和原子索引交换。但是，只更新正文或部署前端不会自动更新正式搜索，向旧索引追加记录也不会删除历史内容。

本流程补齐文档仓库侧的编排与产物绑定，复用上述能力。#1329 单独补强覆盖审计和公开搜索 handler 契约；#1324 的 AI 内容、#1327 的历史锚点和 #1328 的 Unreal 文案不属于本流程的改动。建议将 #1329 与本流程都合入中文发布分支，获得完整的反向收录检查。

## 三个阶段

使用同一个完整提交 SHA、干净检出和固定依赖。以下命令中的 `RELEASE_SHA` 由部署平台提供；不填写猜测的 SDK 版本或站点标签。

```bash
bun run search:release:cn bundle --revision="$RELEASE_SHA"
bun run search:release:cn prepare --revision="$RELEASE_SHA"
# 部署平台发布本发布包中的站点与 API，完成临时索引质量查询。
bun run search:release:cn promote --revision="$RELEASE_SHA" --origin="$FRONTEND_ORIGIN"
```

- `bundle`：强制 CN 构建静态站和 Node API，导出全量记录，执行完整覆盖审计，再检查每条 SDK 记录与维护中的发布配置一致。成功后生成 `dist/search/cn-publication.json`，绑定完整提交 SHA、记录数量、发布配置摘要，以及站点、整个 `.output`、记录和审计报告的内容摘要。覆盖失败不会生成可用发布清单。构建前拒绝脏源码；构建后只容许既有生成清单与路由树的变化。
- `prepare`：核对检出 SHA、发布清单、全部产物与发布配置，重新执行维护中的覆盖门禁，再调用既有全量临时索引流程。在 `cn-release.json` 回执中增加本发布包摘要；正式索引继续服务。
- `promote`：重复核对产物与门禁，要求回执对应同一发布包、提交和数量；检查同域 `/api/health` 返回相同 `revision`，再逐个检查公开结果 HTML 与本构建字节一致，最后调用既有索引交换。缺少部署版本、站点过旧或回执混用都会在交换前失败。

所有源文件、产物和发布配置必须来自同一受信任构建；摘要用于发现串包和意外变动，不是跨信任域的签名或证明。摘要绑定实际文件的相对路径和字节，文件型存储不保留的空目录不影响核对；空产物和符号链接会被拒绝。构建产物上传/下载时保留文件路径：`dist/client`、`.output`、`dist/search`。不要重新构建或改写静态 HTML、API 文件和原始审计报告；运行时另行注入配置。

`cn-preflight-audit.json` 保存 prepare/promote 重新审计的结果，不修改已经绑定摘要的原始 `cn-coverage-audit.json`。低层 `search:prepare:cn` / `search:promote:cn` 继续存在以便兼容既有使用者；部署平台应统一调用新入口，避免绕过前置门禁。

## 自动构建与实际部署接入

`.github/workflows/cn-search-bundle.yml` 在当前中文集成分支 `codex/cn-newdoc-html-api-migration` 的 push、相关 PR 上构建并审计发布包，也支持 `workflow_call`。它没有 Meilisearch 密钥，不写索引、不部署。未来正式中文发布分支变更时，须同步维护触发分支；不能认为任意仓库 push 都是正式发布。

实际中文容器、K8s、网关和发布流程属于外部部署项目（见 [部署交接](cn-search-deployment-handoff.md)）。该项目必须把以下步骤接到真实发布入口，才能实现“每次正式发布自动更新搜索”：

1. 调用固定版本的复用 workflow（`AgoraIO/docs-portal/.github/workflows/cn-search-bundle.yml@<可信提交>`），显式传入文档完整提交 `revision`；或在自己的受信任 runner 上直接调用 `bundle`。workflow 输出的 `artifact` 是对应发布包名称。
2. 下载同一个发布包，并检出相同文档 SHA。串行持有覆盖整个 `prepare → 部署 → promote → 复验` 的发布锁；不取消已经开始交换的任务。锁内检查该任务仍是平台选定的待发布版本，过期任务不可覆盖新发布。GitHub 构建 workflow 的 concurrency 仅管理构建，不是部署锁。
3. 给索引 Job 注入 `MEILI_HOST`、`MEILI_INDEX_UID`、`MEILI_WRITE_API_KEY`、`MEILI_TASK_API_KEY`，执行 `prepare`。将更新后的回执与原发布包共同保留。凭据不进入静态站或构建产物。
4. 对明确指定的临时索引执行质量查询，覆盖产品、平台、FAQ、API/OpenAPI 和关键 SDK 方法。该质量检查仍由部署平台执行，prepare 成功不是相关性验收通过。
5. 原样发布 `dist/client` 及整个 `.output`；API 运行时设置 `DOCS_RELEASE_REVISION` 为相同 SHA，按既有约定注入仅查询正式索引的配置，保持同域 `/api/*` 转发。
6. 执行 `promote`，随后在正式域名复验搜索、分页、筛选和结果锚点。健康版本检查不能证明 API 的 Meilisearch 配置正确，必须执行真实查询。
7. 保存旧站点、API 和交换后的旧索引映射。任一阶段失败不得将整次发布标记成功；若站点已切换而搜索未切换，部署平台应恢复上一套完整发布并复验，不把再次 promote 当作回滚。

要在切换过程中也避免页面与搜索版本混用，部署平台还需实现蓝绿发布及统一切流，并处理 CDN、旧会话和客户端路由的发布归属。索引交换仅保证索引原子性，本仓库的入口不将多服务发布变成原子事务。本 PR 不代表外部接入、蓝绿发布或线上部署已经完成。

## SDK 发版维护与门禁

Android 4.7.0 更新为 4.7.2 时，一起更新真实当前正文与 Android 当前版本元数据；本流程会重新导出整个索引，旧正文记录随完整快照替换退出。其他平台维持各自发布版本。不按最大数字目录选择“最新”，也不自动把预发布设为当前版本。正文对应的真实 SDK 来源仍须发版者确认，流程不能仅凭版本标签判断正文已升级。

历史正文不进入当前搜索，不影响从版本菜单访问已验证的归档。普通指南或发版说明合理提及旧版本号，不视为历史正文混入。

既有全量审计中曾发现 8 页 20 项 `genuineMissingToc`，本流程不会豁免它们。实际数量以当前 SHA 的审计结果为准：门禁未通过就不能生成或激活新的发布包；此前报告或本地单元测试不能代替本次构建审计。
