# 中文搜索部署交接

本仓库提供静态文档、Node 搜索 API、章节导出及索引发布 Job 的代码。容器、K8s、网关和流水线由外部部署项目承接。本文是部署输入合约，不是已经执行的生产发布。

## 本轮协作分工（2026-10-29）

用户已明确：本人没有 Staging、Jenkins 权限，部署及部署回执由有权限的小伙伴协助。本地修复、索引验证、问题清单与复测说明继续在本仓库完成；不以申请用户登录或提供管理凭据作为前提。本轮没有代发消息、触发流水线或修改远端索引。

| 事项 | 承接方 | 需要交付的结果 |
| --- | --- | --- |
| 搜索代码与本地证据 | 本仓库开发 | 可评审 diff、检查日志、同批静态产物/索引对照、手动复测步骤；交付分支 `codex/cn-search-quality-fixes`，提交/PR 及最新待办见 [build 与复测交接](./agents/reports/2026-11-04-cn-search-build-retest-handoff.md) |
| 搜索意图与旧内容取舍 | 文档同学共同复核 | 核心指南/定义是否回答查询；Top40 旧路径、已迁移或不在导航的内容如何作为验收目标；FAQ 零结果变化是否丢失有用答案 |
| Staging 发布 | 有权限的部署同学 | 本节后续完整流水线；同一最终 SHA 的前端、搜索 API 和新索引，不能只重新部署静态前端 |
| 版本回执 | 有权限的部署同学 | Jenkins 构建链接/编号和结果、前端 SHA、API revision、索引 revision/release、records/settings 校验和及旧快照标识，不含密钥 |
| Staging 页面复测 | 能访问测试环境的协作同学 | 原词、分类、筛选条件、首批排序、最终链接/锚点、点击与刷新截图；逐项填写通过/失败及证据 |

可转发的协作说明（尚未发送）：

> 中文搜索已完成一轮本地修复，目前仍在整理回归结果，尚未签署不回退。因为我没有 Staging/Jenkins 权限，待候选代码与未决问题确认后，需要请有权限的同学协助发布同一最终提交的静态前端、搜索 API 和匹配索引，并返回构建及三方版本回执。请不要只重跑前端部署。发布后按修复报告里的原词、API/FAQ 分类、产品/平台筛选及点击步骤复测，保留截图与失败请求。11-04 已复查 Staging 的 API/FAQ 分类请求返回 200；400 属于历史现象。排序、摘要、React 418 和索引版本仍需在匹配版本部署后逐项复测。

上述说明不授权提前切换正式域名或跳过未通过的质量门禁。具体执行顺序与发布门槛见下文。

## 服务与凭据

| 组件 | 构建/运行产物 | 运行配置 |
| --- | --- | --- |
| 中文静态站 | `VITE_DOCS_REGION=cn bun run build:static`，发布 dist/client | 不注入 Meilisearch 凭据 |
| 搜索 API | `VITE_DOCS_REGION=cn bun run build:service`，发布整个 .output；Node 执行 .output/server/index.mjs | HOST、PORT、MEILI_HOST、MEILI_INDEX_UID、MEILI_SEARCH_API_KEY；发布核验使用 DOCS_RELEASE_REVISION（完整应用 SHA） |
| Meilisearch | 本地验证版本 1.12.8；线上版本要固定并重新验证兼容性 | 私网服务地址、持久化存储、管理员凭据由部署平台管理 |
| 索引发布 Job | 对应提交代码及同次静态构建的 dist/search | MEILI_HOST、MEILI_INDEX_UID、MEILI_WRITE_API_KEY、MEILI_TASK_API_KEY |

搜索密钥仅允许查询正式索引。Job 写入密钥允许正式及临时索引；task key 仅 tasks.get、indexes=["*"]，用于读取全局交换任务。详情与权限集合见 search-service.md。不要把 Master Key 放到 API 或浏览器。

K8s 的 Meilisearch 数据目录必须使用持久化存储，重启 Pod 不能丢索引。由部署项目确定 namespace、StorageClass、容量、备份恢复、资源上限及健康探针；本仓库不猜测公司集群配置。API 的 /api/health 仅表示进程存活，不能代替 Meilisearch 可用性检查。

仓库现有 Dockerfile 的 runtime 是 nginx，仅发布静态站，不包含 Node API。外部项目需要另外打包整个 .output 为 API 镜像，不能只部署现有 nginx 镜像就认为 /api/search 已提供服务。

同域 `/api/*` 转发至 API，其余路径走静态托管；保持英文部署的原有搜索路径。API 服务通过私网访问 Meilisearch，浏览器只访问同域 API。

## 流水线必须执行的顺序

优先使用[统一发布入口](cn-search-release-pipeline.md)的 `bundle → prepare → 部署 → promote`，将下述步骤变成不可跳过的发布门禁，并绑定站点、API 与索引回执。现有低层命令继续兼容；单独调用它们不代表已经执行新入口的产物与部署版本校验。实际外部流水线仍需接入，构建 workflow 不执行正式部署。

1. 检出同一个发布提交，执行完整 CN build:static。
2. `bun run search:export:cn`，使用 dist/client 同次构建结果。
3. `node scripts/search/audit-cn-coverage.mjs --records=dist/search/cn-records.json`。审计与导出共用搜索产品规则，明确排除的无记录页面单独列在 `exclusions.excludedProducts`。未知无记录页、排除产品混入索引、缺失路由/章节/锚点和平台/版本错误会阻止验收；已列明的无正文目录豁免仍需维护。部署层覆盖门禁也须检查 `findings.excludedProductRecords`，不得仅凭报告文件存在而放行。
4. `bun run search:prepare:cn --revision="$RELEASE_SHA"`。正式索引继续服务，Job 写临时快照。
5. 对临时快照运行明确目标的质量查询；检查 FAQ 多产品归属、平台、版本、OpenAPI、拆词和章节跳转。候选 API 接入该快照后，运行 `bun run search:quality:cn --candidate="$CANDIDATE_ORIGIN" --baseline=scripts/search/fixtures/cn-top-queries-20261029-baseline.json --out=.agent/artifacts/cn-search-release-quality`，比较真实 Top30 和热门页面标题场景，要求退出码为 0。单项目标/分类丢失、排名后移、新增零结果和请求错误不可用其他词的改善抵消；历史点击目标的合理替换需依据意图审查并明确更新用例。本次冻结快照为未通过的观测记录，不能作为放行依据；方法及已知问题见 [Top 关键词对比报告](./agents/reports/2026-10-29-cn-search-top-comparison.md)。不要用本地索引可搜代替这一步；外部流水线需实际接入此命令，本仓库的交接文档不等于 Jenkins 已配置门禁。
6. 发布同提交静态站并检查。使用无 `/zh-CN` 前缀索引时，先运行 `bun run search:verify:urls:cn --origin="$FRONTEND_ORIGIN" --records=dist/search/cn-records.json --html=dist/client`，确认公开页面与本次构建一致后，再执行 `bun run search:promote:cn --revision="$RELEASE_SHA"`。
7. 在切换前及正式域名切换后，分别用原始 Top30 原词检查 all/docs/api/faq（120 项请求），并在搜索页实际点击 API/FAQ 分类、筛选、分页和结果。核对平台正文、锚点及刷新后的状态。保存前端 `__docs-release.json`、API revision、索引 revision/release、records/settings 校验和及同次 Jenkins 回执；三者版本一致是验收前提。HTTP 200 不等于相关性通过。发现站点/索引不一致时按已记录版本回滚两者。

保存 dist/search/cn-records.json、cn-release.json、审计和查询结果，与提交 SHA、静态产物建立对应关系。同一正式索引发布必须串行。交换成功后保留旧快照；不要再次执行已成功 promote 来充当回滚。发生网络异常且未记录交换任务时，先查任务及发布标记，避免重复交换。

## 发布门槛与待确认输入

- 2026-10-29 本地完整构建已成功，用同批产物完成了冻结 HEAD 与候选的提取对照；期间源码继续修改，因此正式发布仍须冻结最终 SHA 并执行上面的全量干净构建。见 [本轮修复与验收记录](./agents/reports/2026-10-29-cn-search-optimization.md)。
- 2026-10-09 的 35 项测试失败审计是历史记录；2026-10-29 最新本地候选为 318 文件、5,015 条测试通过、2 条跳过，类型检查及最终 API 构建通过。构建 API 的 Top30 四分类 120 次请求均为 200。完整静态构建在最后的摘要清理前通过；发布提交仍须重新执行完整流水线，不能用本地结果代替 Staging 验收。
- 最新覆盖审计命令退出 1：20 项 genuineMissingToc 与基线相同，但仍阻止门禁通过；otherPlatformToc 97、duplicateIdsAcrossPanels 153 继续保留。不能因它们不是此次引入，就跳过审计或自动放行。
- 页面存在原有目录坏锚点、重复正文/平台 ID。已验证的点击样例不代表全部重复 ID 都安全；部署验收应加入高风险样例。
- 本轮调整了产品入口及准确 API 的显示顺序；严格历史目标对照和部分相关性变化仍未签收，不能宣称所有查询已经达标。不要删除告警或直接放宽阈值来通过门禁。
- 历史 Staging 前端 `12a04c8ff1b0236d7d09a5dadd757332cb7b875b` 曾出现 api/faq 400；11-04 前端已观察为 `6edf1e79e8ddad1d7162752388a718cb1557603d`，joinChannel 的 API/FAQ 均为 200。实际后端 SHA 和索引回执尚未取得，不能把本地候选视为已部署。

实际进入测试环境需要提供：外部部署 repo/负责流程、集群及 namespace、镜像仓库、测试域名/网关规则、Meilisearch 存储及备份方案、Secret 注入方式。当前本机 kubectl 没有 current-context，尚未执行集群部署。

## 2026-11-04 追加修复的发布注意事项

- C++/C# 查询使用保留语言含义的检索词，对应新索引中的 `languageTerms`。代码与新索引需一起发布，不能只更新 API。
- 摘要优先使用导出的说明文字 `summary`；完整正文与代码仍保留供搜索。旧索引没有该字段时回退原摘要，这不代表摘要修复已上线。
- React 418 修复涉及静态搜索页初始化，需要更新前端产物；API/索引更新不能替代前端部署。
- 灵动课堂按已合入的 #1248 继续排除，不将恢复该退役产品作为搜索验收条件。
- 用户已于 11-04 要求提交 PR 并通知小伙伴协助 build/复测。发布前必须以最终 PR 提交为准，保留目标分支最新修复（包括 #1342 的标题覆盖修复），重新执行干净构建与覆盖审计；历史 20 项告警数量不能代替新提交的审计结果。


### C++ / C# 入口排序追加要求

- 新索引必须包含 `languageEntryTerms` / `languageEntryRank` 的可检索、可筛选、可排序设置；API 对裸语言查询会使用这些字段。仅升级 API 而继续指向旧索引，会导致对应查询被引擎拒绝。
- 先准备并验收兼容的新索引，再切换对应 API/前端；按既有快照协调发布，不手工改线上单条记录。本地诊断 receipt 不可当作提交发布回执。
- Windows 下的 C#/C++ 下载/接入章节是有效语言入口；最终验收要检查标题、SDK 语言及 Windows 落地，不能要求它们被改链到默认 Web 页面。
- 本轮语言入口前端仅在 3149 开发预览验证；3170 仍为上一轮前端产物。提交后仍需匹配 SHA 的静态构建、前端/API/索引整体复测。
