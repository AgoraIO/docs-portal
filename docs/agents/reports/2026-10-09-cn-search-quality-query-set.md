# 中文搜索质量验收查询集

## 2026-10-09 最终状态

下文保留设计与早期实验记录，不代表当前未实施。生产 prepare 已固化同义词、技术词容错、API 拆词和相关性之后的产品/平台排序；64,065 条记录的最终快照已通过标准 prepare/promote 安装到本地 cn-kb-full-local。通用词“云录制/云端录制”和“发布消息/发送消息”的明确入口排名通过。最新验收见 `2026-10-09-cn-search-query-acceptance.md` 和覆盖审计报告。SDK/API/RTC 仍是观察项，尚未证明技术词容错对误召回的整体收益。

这组查询用于全量中文索引完成后，比较基础配置、旧仓库策略迁移配置以及最终候选配置。每次实验只改变一个因素，并记录首个命中结果、目标结果排名、是否命中以及筛选结果数量。

## 查询分类

| 类别 | 查询 | 预期检查 | 目标 URL 或筛选 |
| --- | --- | --- | --- |
| 精确 API | `manualSOS` | API 章节能否排在前列，锚点是否准确 | `/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos` |
| API 平台隔离 | `manualSOS` + `platform=ios` | 同名 API 是否只返回 iOS 内容 | `/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi#manualsos` |
| API 拆词 | `remove Handler`、`removeHandler` | camelCase 拆词后是否仍能找到同一 API | `/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#removehandler` |
| API 大小写 | `API`、`SDK`、`RTC` | 技术缩写不会被错误切分或降权 | 记录首屏相关性和误召回 |
| 产品元数据 | `showroom` + `product=showroom` | 产品字段修正后筛选能命中 | `/zh-CN/solutions/showroom` 或其章节 URL |
| 中文产品名 | `秀场` | 中文正文/标题召回正确，同时观察 product 是否为 `showroom` | `/zh-CN/solutions/showroom` |
| 平台元数据 | `csharp-windows` + `platform=csharp` | C# 平台记录能被筛选 | RTC C# 文档 URL |
| 平台别名 | `React` + `platform=web` | react-sdk 是否归一到 web | RTC React 文档 URL |
| 同义词 | `发布消息`、`发送消息` | 配置同义词后两者是否召回同一主题；展示标题保持原文 | 需要选定消息 API 真实章节 |
| 同义词 | `云录制`、`云端录制` | 两种说法是否召回云端录制内容 | `/zh-CN/realtime-media/cloud-recording` |
| 技术词容错 | `屏幕共享` 的轻微拼写错误 | 对业务技术词保持保守容错，比较误召回和漏召回 | 记录是否命中，不预设必须纠错 |
| 普通中文 | `如何开启云端录制` | 页面标题、章节标题和正文组合召回 FAQ/教程 | 记录文档类型分布 |
| 类型过滤 | `云端录制` + `docType=openapi` | OpenAPI 过滤只返回 API 页面 | `/zh-CN/api-reference/api-ref/cloud-recording/*` |
| 版本过滤 | `overview` + 指定版本 | 当前版本字段不会把旧版本混入 | 选一个有 current/version 的产品 |

## 实验方式

先在不改记录的情况下比较三组 settings：

1. 当前基线：`sectionTitle > aliases > pageTitle > content`；
2. 加入旧仓库同义词和技术词容错配置；
3. 在 API 记录已经具备拆词字段后，再加入 `nameSplit` 和 `groupNameSplit`。

每组实验都使用独立候选索引，保留相同的记录和索引 UID 版本。不要直接修改当前正式索引。记录以下指标：

- 目标 URL 是否进入前 10；
- 目标 URL 的排名；
- 查询是否出现错误产品或错误平台的首位结果；
- 产品、平台、版本筛选是否命中；
- 同义词查询是否召回同一主题；
- 技术词轻微错误的召回率和明显错误的误召回率。

## 通过标准

- 已有两个基础 Golden Query `manualSOS` 和 `removeHandler` 必须继续命中；
- 元数据筛选不能因为修正而丢失原本可搜索的页面；
- 同义词只扩大召回，不修改展示标题和 URL；
- API 拆词提高 `removeHandler`、`joinChannel` 等 camelCase 查询的稳定性，不把普通正文结果推到 API 结果之前；
- 技术词容错不能让明显错误查询产生大量无关结果；
- 全量索引的查询结果必须与记录审计中的 `product/platform/version/docType` 一致。

## 当前限制

这是一组验收设计，不代表策略已经应用。当前中文 settings 尚未包含旧仓库的同义词、技术词禁用列表或 API 拆词字段；全量索引完成后先做基线测量，再逐项实验。

## 实验索引初步结果

在 `cn-kb-full-experiment-v1` 上使用了当前全量导出记录，并加入旧仓库的同义词、技术词禁用列表、API 拆词字段以及产品/平台排序字段。与 `cn-kb-full-local` 对比得到：

- `remove Handler` 在基础索引首位返回无关的 RTM 内容，实验索引首位返回 `removeHandler` API，说明拆词有直接收益。
- `product=showroom` 在基础索引返回 0 条，实验索引能返回秀场页面，说明产品元数据修正有效。
- `platform=csharp` 查询“屏幕共享”时，基础索引只返回其他 C# 文档，实验索引能返回 C# 屏幕共享章节，说明平台元数据修正有效。
- 基础索引没有 `productSeq` 和 `platformSeq` 可排序字段；实验索引可以使用旧仓库顺序进行显式排序。
- `云录制` 同义词扩大了召回，但首屏仍包含多个解决方案 FAQ，需要后续查询集判断这种扩大是否符合产品预期。
- `removeHander`、`manualSO` 和“屏幕共亨”等轻微错误在两套索引中都能召回，当前样例无法证明旧仓库的技术词禁用列表带来了排序收益，需要补充误召回和明显错误样本。

该实验使用的是第一次全量导出；Android current version 修复尚未反映到这份导出，因此实验结果只用于评估搜索策略，不能作为最终全量元数据验收结果。
