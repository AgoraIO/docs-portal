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

将需要的来源 URL 写入 JSON 字符串数组，通过 `--select /absolute/path/to/sample.json` 导出。每个 URL 必须是已发布的页面或平台变体 URL，不是章节 URL。输出保存排序后的 `selection`。

样本与全量使用不同 scope；成功状态的 selection 也必须与样本清单完全一致。即使 scope 名称误写成相同，工具仍拒绝将样本清单和全量状态比较。调整样本集合需要显式调整范围及对应状态，不能借此删除已有全量 KB 文档。

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
