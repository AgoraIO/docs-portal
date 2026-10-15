# CN AI-Bot：KB 语料与增量规划

本阶段提供离线导出与变更规划。普通搜索仍沿用现有 Meilisearch 链路。这些命令不调用百炼、不上传/删除云文档、不生成模型回答。

## 数据来源

输入必须来自同一次 CN 静态构建：

- `dist/client/sitemap.xml`
- `dist/client/__static/docs-routes.json`
- `dist/client/__static/docs-search/zh-CN.json`
- 对应的发布 Markdown 和 HTML

导出沿用普通搜索的已发布来源校验及实际章节锚点验证，但正文重新取发布 Markdown，保留标题、代码围栏、语言及代码内部缩进。对带渲染器章节标记的平台容器缩进执行限定修复，避免整段教程被解析成无语言代码块；普通搜索的导出代码不变。平台变体各自独立，不经过普通搜索查询接口的默认平台筛选。

工具对同一次运行中读过的文件内容进行缓存，以保证导出的 Markdown 和验证使用一致的字节；它不替代构建目录的原子发布。调用方应使用不可变构建目录，不在导出期间重建它。

## 导出

先按项目现有流程生成完整 CN 静态产物。不要为了运行离线工具反复完整构建；可以复用已核实版本的产物。

```sh
bun run kb:export:cn --public dist/client --out dist/ai-kb/corpus.json --scope cn-full-v1 --revision "$(git rev-parse HEAD)"
```

`revision` 由调用方提供，必须对应输入产物；本工具记录它，不独立证明构建产物的源码版本。输出目录须位于发布输入目录之外。

清单包含 `schema`、`scope`、`revision`、`complete` 和 `documents`。每篇文档有发布 URL 身份、Markdown、Metadata 与 SHA-256 摘要。标题、产品、平台、版本、章节映射变化会改变摘要；整仓 revision、文件时间不参与摘要，所以无关提交不触发全文重传。

## 小样本范围

真实文档 demo 的固定 5 篇选择、导出步骤和测试问题见 [真实样本说明](ai-kb/real-sample-demo.md)。该样本与早期合成 fixture 分开，不代表云端已导入。

将需要的来源 URL 写入 JSON 字符串数组，通过 `--select /absolute/path/to/sample.json` 导出。每个 URL 必须是已发布的页面或平台变体 URL，不是章节 URL。输出保存排序后的 `selection`。

样本与全量使用不同 scope；成功状态的 selection 也必须与样本清单完全一致。即使 scope 名称误写成相同，工具仍拒绝将样本清单和全量状态比较。调整样本集合需要显式调整范围及对应状态，不能借此删除已有全量 KB 文档。

正文完整性按本次导出范围检查：样本只要求所选身份全部有有效正文，全量仍要求全部合格来源。路由清单和锚点校验不关闭；样本中的空页面、缺失身份会失败。样本 `complete` 不代表全站覆盖通过。

## 规划增量

准备一份与目标 scope 对应的上次成功状态。首次空目标的显式初始状态示例：

```json
{"schema":1,"scope":"cn-full-v1","generation":0,"entries":[]}
```

这是空目标的初始状态，不是接管现有远端知识库的方法。已有远端对象需要先对账。不要通过删除状态文件来强制初始化；输入缺失时命令会失败。

已成功条目形态：

```json
{
  "sourceId":"/zh-CN/ai/example",
  "hash":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "remoteIds":["example-remote-document-id"]
}
```

hash 必须来自对应已成功语料，remoteIds 必须来自后续真实同步；以上仅为结构示例。样本状态还需带上与语料一致的顶层 selection。

```sh
bun run kb:plan:cn --corpus dist/ai-kb/corpus.json --state /absolute/path/to/kb-successful-state.json --out dist/ai-kb/plan.json
```

计划输出 `create`、`update`、`delete`、`skip`、`stateGeneration`。若有删除候选，`deletionBlocked` 始终为 true；当前工具没有执行或解除删除保护的选项。重命名表现为新身份 create、旧身份 delete。

当前规划器只读取成功状态，不推进 generation，也不代表具有并发锁。它拒绝不完整/空清单、重复身份、正文/Metadata 与摘要不一致、错误范围和非法状态。同一个远端对象 ID 只能归属于一个来源身份，冲突状态会被拒绝。输入文件不能被输出覆盖，包括符号链接和硬链接别名；JSON 输出通过临时文件 rename 完成。

## 验证与下一阶段

```sh
bun run test src/lib/ai-kb scripts/ai-kb src/lib/search
bun run types:check
```

新增测试使用临时发布产物，通过真实 Bun 子进程运行两个 CLI，不调用云服务。

后续真实百炼同步必须另行落实：隔离的 demo KB/类目、API Key 安全注入、Metadata 写入/过滤、远端 ID 和任务映射、持久化日志与锁、结果未知对账、更新/删除完成确认和可检索验证。问答 API/UI、网关、CI/CD 全量链路也仍需实现。本阶段不能用于直接覆盖现有“文档站”知识库。

阶段验证、基线失败清单及审查取舍见 [Phase 1 验证记录](agents/reports/2026-10-15-ai-kb-phase1-verification.md)。

## 第二阶段：本地同步执行器

### 当前执行方式：暂缓创建云端 KB

百炼托管方案已确认，但先不创建 demo 知识库、不上传文档、不调用收费模型。空着的是云端目标资源，不是创建一个空知识库；标准版空库创建后也会开始按小时计费。

现有语料导出、增量规划和同步状态机可以继续在本地验证，无需真实 KB ID 或 API Key。离线测试中的目标 ID 和检索结果都是模拟值，不能填入真实配置或作为云端验收结果。

接下来的问答开发顺序为：先定义后端检索证据与回答/引用契约，再通过注入模拟检索器和模型验证无证据、平台限制、来源引用、错误与取消行为，最后接到新版页面。真实百炼检索协议和模型配置核实后单独接入；不使用普通搜索 Meilisearch 作为临时真实 KB 替代，也不修改它的索引。

真实同步计划的 Task 5 保持待验收。创建费用、凭据与目标 ID 落实后，再验证真实导入、Metadata、可检索性及问答效果；本地模拟通过不解除这些验收条件。

本地已实现协议适配、目标绑定、持久化日志、进程锁和增量执行。它尚未完成真实百炼账号验收；CLI 没有启用未经验证的检索接口，因此导入后会停在 `verifying`，不会伪造成功投影。普通搜索不受影响。

目标配置不含凭据，示例（ID 必须换成实际已确认的业务空间与独立上传类目）：

```json
{
  "schema": 1,
  "environment": "local-demo",
  "region": "cn-beijing",
  "workspaceId": "llm-example",
  "categoryId": "example-demo-category",
  "name": "cn-ai-bot-demo",
  "origin": "https://doc.shengwang.cn",
  "scope": "cn-demo-v1",
  "selection": ["/zh-CN/ai/example"]
}
```

`scope/selection` 必须与 corpus 一致。初始化配置不带 indexId；首次 API 建库的返回 ID 会一次性绑定到状态内。此后沿用原配置，不往配置里补写 indexId（会改变目标身份）。缺失受管状态时拒绝接管现有 indexId。当前不支持从 UI 创建的库自动迁移所有权。

以下路径均为操作者指定的持久化本地目录；使用绝对真实路径，不用符号链接、网络盘、临时 CI 缓存或其他任务的状态目录。锁仅保障同机串行，不是多机分布式锁。

```sh
# 无需 Key；只预览、保存回执，不调用云 API
bun run kb:sync:cn --config /absolute/target.json --corpus /absolute/corpus.json --state-dir /absolute/kb-state --receipt /absolute/preview.json

# 由操作者安全设置 BAILIAN_API_KEY 环境变量；不在命令参数/聊天中传 Key
bun run kb:preflight:cn --config /absolute/target.json

# 费用/凭据落实后才执行：明确允许为本 demo 首次建库
bun run kb:sync:cn --config /absolute/target.json --corpus /absolute/corpus.json --state-dir /absolute/kb-state --receipt /absolute/apply.json --apply --new-demo

# 后续执行/恢复沿用相同目标、状态和 pending 对应的原语料
bun run kb:sync:cn --config /absolute/target.json --corpus /absolute/corpus.json --state-dir /absolute/kb-state --receipt /absolute/resume.json --apply
```

preflight 仅证明读取类目/库的请求被接受，不证明写权限。`--new-demo` 是显式初始化开关，不替代付费确认。初次 API 创建要求非空首篇文件，后续逐篇明确指定文件 ID；不会隐式导入整个数据中心。

状态文件为 `state.json`（0600），使用临时文件 fsync → rename → 目录 fsync，并按 generation 校验。每次远端副作用前写意图，收到 ID 后立即保存。Key、上传租约 URL 和原始云错误不进状态/回执。保留状态文件是增量和归属判断的前提，不能删除它强行重跑。

回执状态：`preview` 为未执行；`indexing` 为任务尚未完成；`verifying` 为未证明可检索；`complete` 才是同步成功；`needs-reconciliation` 为远端结果未知，停止自动写入。未完成返回非零退出码（indexing/verifying 为 2）。`remoteWrites` 统计本次写请求尝试，包含上传租约，不代表已创建对象数量。

更新先验证新版本，再清理旧受管文档；期间可能短暂存在双版本。清理被明确拒绝时可恢复清理；请求结果未知时先查列表，只有旧对象已消失才能安全推进，否则需人工对账。删除回执为空不等于已删除。不删除数据中心原始文件、不删除整个知识库。

来源删除默认阻止。显式 `--delete-approval /absolute/approval.json` 必须提供与当前重新计算计划完全一致的 `identity`、`generation`、`sourceIds`；从预览回执取得 identity/generation，从离线计划审阅来源集合。样本 selection 不可通过删 URL 来变更，换样本需新 scope/目标。真实不可恢复删除需先审阅具体对象，不把本地测试等同云端删除授权。

恢复注意：

- 同一语料重跑会恢复已有任务和清理，不重新上传已登记的新版本。
- 未知注册/建库/导入不能通过同名对象猜测归属或重发；保留意图和所有 ID，需结合控制台与任务证据人工对账。本版没有自动修复状态命令。
- 崩溃锁不会按时间过期。先查看 `writer.lock` 的 PID，并确认该机器无同步进程、备份整个状态目录，再由操作者解除残留锁；不要在进程仍活跃时删锁。
- 断电/磁盘写入失败后必须停止，重新检查磁盘快照再恢复；状态写失败不继续云操作。

Metadata 完整保留在 corpus；目前远端仅映射平台确认的 tags 和 originalFileUrl。标签不能代替已验证的检索筛选，章节引用仍依赖本地受控 Metadata。MD5 编码、文件/文档 ID 映射、实际解析与检索均需真实样本验收。

防旧任务回滚：状态保存已接受的 `revision` 和规范语料摘要。同 revision 的不同语料会拒绝；存在 pending 时必须使用原 revision/语料。切换 revision 时 CLI 要求两个 40 位 Git 提交存在，且旧提交是新提交祖先。历史缺失、分叉或回退均停止；不会为了继续而覆盖已完成的新版本。运行库允许注入版本验证器，默认拒绝未经验证的版本切换。

执行开始后回执先记为 `applying`，`remoteWrites: null` 表示尚无法确认写入次数；进程被强杀时不能当作 preview/零写入。恢复以持久化意图为准。远端提供的安全 requestId 和错误码写入状态及回执，便于对账；不保存原始错误文本。

## 第三阶段：不调用云服务的问答链路

新增独立 `POST /api/ai/answer` 和新版搜索页的可选 AI 问答面板。当前只支持 `local-demo`：对本地 corpus 做确定性关键词匹配，再展示原文摘录，不调用百炼或任何模型，也不读写 Meilisearch。它用于验证请求、筛选、来源映射和页面交互，不代表语义检索或模型回答质量。

服务默认返回 503。明确配置 `AI_BOT_MODE=local-demo`、绝对路径 `AI_BOT_CORPUS_PATH`，且运行环境不是 `production` 时才启用。语料使用前面导出的 corpus，最多 100 篇、20MiB；不是源码路径，也不是 Meili 索引。服务端按既有 corpus 契约校验摘要。前端独立通过 `VITE_AI_BOT_DEMO=true` 打开入口：

```sh
AI_BOT_MODE=local-demo \
AI_BOT_CORPUS_PATH=/absolute/path/to/sample-corpus.json \
VITE_AI_BOT_DEMO=true \
VITE_DOCS_REGION=cn \
bun run dev --port 3008
```

打开 `http://127.0.0.1:3008/zh-CN/search`，点击“AI 问答”，输入语料中实际包含的关键词并提问。预期页面明确标记“本地文档摘录演示”，显示摘录与来源；输入无关词显示依据不足；更改筛选后旧回答清除，需要重新提问。等待时可以取消，关闭面板也会取消；失败可重试。不开启前端开关时普通搜索页面没有新增入口。

后端检索器返回证据 ID、sourceId、原文片段和可选章节 URL；编排器按受控 corpus 再校验产品、平台、版本和类型，并确认片段属于原文。最多使用 6 段、每段 3000 字符。生成器只能引用本次证据 ID，来源链接由后端 Metadata 生成；未知章节回退受控页面。没有证据时不调用生成器。所有证据不可信时返回 no-evidence，生成结果含未知引用时拒绝回答。

超过片段上限时按 Markdown 块选取，代码围栏、语言和内部缩进保持完整。单个代码/列表/引用块超过上限会跳过，不能为了返回结果截断围栏；这可能导致本地演示无命中，需要换用较短样本。中文连续短语按原文匹配，不具备语义召回能力。

HTTP 请求限制 16KiB，问题限制 2000 字符，总时限 15 秒，用户请求不触发同步。接口拒绝跨站/跨源浏览器请求，不返回内部文件路径或上游错误详情，响应不缓存。前端仅渲染受限 Markdown：文本、代码、段落、强调和列表等；原始 HTML、图片和模型生成的导航链接不执行，仅“参考文档”区域可导航。

本 worktree 的 node_modules 是指向其他目录的软链接。如果 Vite 报已有依赖文件 `ERR_LOAD_URL`，本次验证使用临时配置显式允许 repo 和该依赖真实目录，未改变 tracked Vite/部署配置。正常独立安装依赖的 checkout 无需该临时配置。

仍未完成：百炼真实检索/模型适配、KB Metadata 及可检索性实测、真实回答效果、发布产物到云 KB 的实测、CI/CD/网关和全量验收。生产环境不会启用本地摘录模式；后续真实适配必须单独配置，不会自动退回本地摘录或 Meili。
