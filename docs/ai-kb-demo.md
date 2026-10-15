# CN AI-Bot：KB 语料与增量规划

本阶段提供离线导出与变更规划。普通搜索仍沿用现有 Meilisearch 链路。这些命令不调用百炼、不上传/删除云文档、不生成模型回答。

## 数据来源

输入必须来自同一次 CN 静态构建：

- `dist/client/sitemap.xml`
- `dist/client/__static/docs-routes.json`
- `dist/client/__static/docs-search/zh-CN.json`
- 对应的发布 Markdown 和 HTML

导出沿用普通搜索的已发布来源校验及实际章节锚点验证，但正文重新取发布 Markdown，保留标题、代码围栏、语言及缩进。平台变体各自独立，不经过普通搜索查询接口的默认平台筛选。

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

当前规划器只读取成功状态，不推进 generation，也不代表具有并发锁。它拒绝不完整/空清单、重复身份、正文/Metadata 与摘要不一致、错误范围和非法状态。输入文件不能被输出覆盖，包括符号链接和硬链接别名；JSON 输出通过临时文件 rename 完成。

## 验证与下一阶段

```sh
bun run test src/lib/ai-kb scripts/ai-kb src/lib/search
bun run types:check
```

新增测试使用临时发布产物，通过真实 Bun 子进程运行两个 CLI，不调用云服务。

后续真实百炼同步必须另行落实：隔离的 demo KB/类目、API Key 安全注入、Metadata 写入/过滤、远端 ID 和任务映射、持久化日志与锁、结果未知对账、更新/删除完成确认和可检索验证。问答 API/UI、网关、CI/CD 全量链路也仍需实现。本阶段不能用于直接覆盖现有“文档站”知识库。
