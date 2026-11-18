# 旧中文搜索策略调研

调研对象：`AgoraIO/shengwang-doc-source` 的 `master` 分支，调研日期：2026-10-09。

## 已确认的策略

旧仓库在 `data/search.ts` 中维护了产品顺序、平台顺序和 API 类型顺序，并将它们转换成 `productSeq`、`platformSeq`、`typeSeq` 数字字段。未列出的值使用较大的兜底值。它还配置了少量中文同义词，例如“发布消息”映射到“发送消息”、“云录制”映射到“云端录制”。

旧仓库的技术词处理不是全局关闭 typo tolerance，而是对“日志”“静音”“水印”“降噪”“码率”“屏幕共享”等词使用 `typoTolerance.disableOnWords`，避免技术词被错误纠正。

API 索引在上传前通过 `WordsNinja` 生成 `nameSplit` 和 `groupNameSplit`。它会处理中英文边界、camelCase、下划线和连字符，并保留 `RTC`、`RTM`、`SDK`、`API` 等技术缩写。随后 API、普通文档和 FAQ 分别使用不同的 searchable attributes；普通文档优先搜索侧边栏和标题字段，API 优先搜索组名、拆词后的组名、名称、拆词后的名称，FAQ 使用标题和层级标题。

## 与当前中文 Meilisearch 的关系

当前 `docs-portal` 的 `SearchSection` 数据结构和旧仓库的排序设置是两层东西：记录字段描述“索引里有什么”，Meilisearch settings 描述“怎么检索和排序”。

- 修改 `searchableAttributes`、同义词、`typoTolerance` 或 `filterableAttributes`，通常不需要重新生成记录；它们是索引设置，但应在候选索引上验证。
- 引入 `nameSplit`、`groupNameSplit`、产品/平台顺序字段或记录级 aliases，则需要修改导出逻辑并重新导出、上传记录。
- 当前中文索引的 `sectionTitle`、`aliases`、`pageTitle`、`content` 字段顺序是字段优先级，不是“标题分数乘十”。
- 旧仓库的 `sortableAttributes` 只声明了可排序字段；是否实际影响某次查询，还取决于请求是否传入对应的 `sort` 参数。因此不能只看到顺序字段就断言所有查询都自动按产品或平台排序。

旧仓库的实现可以借鉴策略和查询集，但不应直接复制它的 Docusaurus HTML 解析器。当前中文站已经使用 MDX/Fumadocs 导出的章节记录；后续应先用真实查询集比较召回和排序，再决定哪些同义词、API 拆词和技术词容错值得迁移。

## 一手源码

- `https://github.com/AgoraIO/shengwang-doc-source/blob/master/data/search.ts`
- `https://github.com/AgoraIO/shengwang-doc-source/blob/master/scripts/updateSearchIndex/config.ts`
- `https://github.com/AgoraIO/shengwang-doc-source/blob/master/scripts/updateSearchIndex/tools.ts`
- `https://github.com/AgoraIO/shengwang-doc-source/blob/master/scripts/updateSearchIndex/index.ts`
- `https://github.com/AgoraIO/shengwang-doc-source/blob/master/scripts/buildSearchIndex.ts`
