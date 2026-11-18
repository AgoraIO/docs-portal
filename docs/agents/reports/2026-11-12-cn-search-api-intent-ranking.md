# 中文搜索：API 查询的通用排序修复（2026-11-12）

本轮处理两类共性问题：准确接口名因大小写不同而出现不同分类顺序；功能指南中的 API 参考链接列表排在实际调用说明前面。没有按单个接口名或文档 URL 置顶。交付分支为 `codex/cn-search-api-intent-ranking`，PR 目标为 `codex/cn-newdoc-html-api-migration`。当前已完成本地候选验证，Staging 尚未部署。

## 通用规则

- **全部文档 / 搜索弹窗**：查询与返回的实际 API 符号完整匹配时，优先 API 组。忽略大小写、空括号、重载编号和单参数 Objective-C 方法的尾部冒号。`joinChannel`、`joinchannel`、`JOINCHANNEL` 使用相同识别规则。
- **产品文档 / 技术文档**：建索引时从整个 API 集合生成符号词表，识别指南正文中的调用指令、方法调用和参数说明；优先这些正文，其次示例，再保留参考信息、相关链接与发版说明。匹配在引擎分页之前完成。
- **误判控制**：普通英文和接口前缀不凭外观就触发 API 优先；API 页面中的 `Example`、`Parameters` 等生成标题也不作为接口证据。产品词及已维护的 Token 主题仍按主题文档发现处理。
- **正文语义边界**：单纯配额列表、负面警告中的接口提及不会因此获得用法权重；“开发注意事项”里真实讲调用方法的内容仍能获得权重。
- 完整页和弹窗共用分类识别；原来的平台合并、默认落地和摘要样式未修改。既有指南精确词/无结果时前缀回退策略保留。

## 实际结果

| 查询与视图 | 修复前 | 本地候选 |
| --- | --- | --- |
| `joinchannel`，产品文档 | “音强选流 → API 参考”第一 | “实现纯语音互动”第一，“实现音视频互动”第二；命中真实用法 |
| `renewtoken`，产品文档 | RTC、RTM 发版说明占前两条 | 前三条为“错误排查”“使用 Token 鉴权 → Token 过期处理”“客户端鉴权 → RTM Token 过期”，均有实际调用说明 |
| `onAudioVolumeIndication`，产品文档 | 发版说明第一 | “调整通话音量”第一 |
| `setupRemoteVideo`，产品文档 | “多主播场景下的视频体验优化”第一 | “实现音视频互动”第一 |
| `setclientrole`，iOS，全部文档 | 仅尾部带冒号的标题不满足旧识别条件 | `setClientRole:` 所在 API 组优先；弹窗也验证通过 |
| `token`，全部文档 | “部署 Token 服务器”第一 | “使用 Token 鉴权”第一，仍保留主题文档优先 |

这是通用权重改善，不为每个接口指定唯一“正确指南”。例如跨产品同名 `createClient` 当前产品文档首条是包含实际调用的“跨频道媒体流转发”；它是否比其他使用指南更符合具体产品意图，需结合产品/平台筛选判断。

## 验证与证据

证据统一保存在项目忽略目录 `.agent/artifacts/search-api-intent-20261112/`，截图不纳入 Git。

| 检查 | 结果 | 证据文件 |
| --- | --- | --- |
| 真实本地 Meilisearch 索引准备 | 59,178 条记录，完整候选索引创建和回执校验成功，约 92 秒 | `receipt.json`、`index-build.log` |
| Top30 × all/docs/api/faq | 修前、修后共 240 次查询；新增零结果 0；30 个 API 视图及 30 个 FAQ 视图的返回结果完全一致 | `top30-regression.json`、`verification-summary.json` |
| 真实 API 词表泛化抽查 | 词表 3,251 项，按真实指南提及频次抽取 40 个符号；大小写/空括号变体共 294 次 all/docs 查询；所有变体的 all 结果均为 API 组优先 | `symbol-sample.json`、`symbol-variants.json`、`casing.log` |
| 本地引擎集成测试 | 21 通过，包含 6 个不同名称的 API/用法/示例/参考列表对照及平台、分页等既有用例 | `integration-final.log`（提交前复核见 `pr-integration.log`） |
| 全量自动测试 | 6,062 通过、23 跳过；另一次默认并发运行中旧归档测试曾超时，降低并发后全套通过 | `full-tests-verified-final.log`（提交前复核见 `pr-full-tests.log`） |
| 类型检查、改动文件 Biome、diff 空白检查 | 通过 | `types-final.log`、`biome-final.log`、`git diff --check` |
| 真实页面 | 完整页、全部/产品分类、Android 筛选、iOS 精确方法名、弹窗 `setclientrole` 已操作检查 | `*-after.jpg`、`*-comparison.jpg` |

294 次变体查询不代表所有指南列表必须完全相同：裸词 `destroy` 与显式 `destroy()` 的指南前三条仍有差异，保留的是既有前缀发现与精确查询边界；两种输入均验证了 API 组优先。没有宣称全库每个接口都经过人工相关性验收。

### 数据与验收范围

修前冻结中文分支 `a64317f414bc7f4c0eeb6463e86811622606d15f` 的查询实现及已有索引；修后使用同一份 59,178 条记录快照，避免把内容变化混入排序比较。源数据为本地 `search-task-intents-20261109/current-records.json`；本轮并非从最新内容重新执行站点全量导出。索引 checksum 为 `8bb1d0754e8d50fa269c3b0faa5c9a1956c0328351ce11794f9a45e04eacfc64`。

Top30 结论是上述样本内没有新增零结果，API/FAQ 保持一致，指南排序变更已逐项查看。历史本就为零的查询不算修好；“请求成功”也不等于相关性全通过。本轮没有重新抓取旧正式站，也不代表 Staging 已完成验收。

## 本地怎么测

候选页：`http://127.0.0.1:3150/search?q=joinchannel&type=docs&page=1`。

1. 搜 `joinchannel`、`renewtoken`、`setclientrole`、`onAudioVolumeIndication`，选择“产品文档”，检查正文用法是否比参考列表更易找到。
2. 切到“全部文档”，对照原大小写、全小写、全大写和 `()`：实际完整接口匹配时 API 组靠前。
3. 搜 `setclientrole` 后筛选 iOS，检查 `setClientRole:` 的 API 组仍优先。在任意文档按 `⌘K` 重复此查询。
4. 搜 `RTM`、`token`、`C#`、`大小流`、`simulcast`、`加入频道后听不到声音`，检查产品导航、主题指南及排障入口。

## 发布时需要做什么

新增排序字段在索引准备阶段生成，因此部署新代码后仍需要按同一 revision 重新导出、prepare、校验并发布索引。旧索引不含新字段时分类识别能升级，指南权重不会完整生效；单独更新前端无法证明修复已部署。Staging 构建、服务版本与索引发布仍需有 Jenkins/Kubernetes 权限的同学协助，并复测相同查询。
