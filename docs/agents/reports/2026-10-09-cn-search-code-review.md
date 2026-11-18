# 中文搜索正式代码审查与浏览器验收

基线：mentor 提交 1c20dbc61；审查包含基线之后的工作区 diff 及新增文件。仅看 HEAD 三点比较会漏掉这些尚未提交的改动，因此使用 git diff 1c20dbc61 和新增文件清单。

## Standards

独立规范审查没有发现硬性规范违规。发现一个验收脚本正确性问题：compare-cn-quality.mjs 假定旧快照也有可筛选 products，真正旧 schema 会报错。现已读取两侧各自的 filterable attributes，分别使用 product 或 product OR products；复核确认旧/新 schema 的模拟比较通过。

## Spec

独立需求审查发现并处理：

1. 表格代码恢复只支持单词形式语言标签：新增 c++、objective-c 和空标签回归，先复现失败，再修复为完整 info string。代码正文及后续章节均保留。
2. 修正旧锚点只改 URL，可能产生两条记录指向同一章节：现在同时更新确定 ID，并在修正后按 URL 合并、保留两边正文。新增回归先失败后通过。
3. 覆盖审计未检查新增无记录页和导航缺失路由：现在只豁免已逐个审查的 11 个无正文入口；其他符合条件的无记录页或导航缺少 canonical route 会阻止验收。

复核未发现这些修复新增的可操作问题。尚未满足的发布要求是：从同一提交重新完整构建 CN 静态站并重新导出、审计。当前复用已有产物的结果不能替代此发布门槛。

## 旧中文搜索策略对应

一手依据是旧仓库 master 的 data/search.ts、scripts/updateSearchIndex/config.ts、tools.ts、index.ts 与 scripts/buildSearchIndex.ts。参见同目录 legacy-search-strategy-research 报告。

- 同义词和技术词 typo disable 配置已迁移；不是全局关闭容错。
- API 名称拆词在当前 nameSplit/groupNameSplit 实现，兼容 camelCase、缩写、中英文边界、下划线与连字符；没有复制 Docusaurus 解析器或 WordsNinja 整套实现。
- 产品/平台顺序归一到当前 ID，在相关性之后应用。API 类别缺可靠来源，typeSeq=1000；没有假定 enum/class/method。
- 旧普通文档优先导航/标题、API 优先组名/名称的思路，映射为当前章节结构的字段优先级，未声称完整复刻旧站评分或“标题乘十”。
- SDK/API/RTC 泛词进一步优化按用户要求暂停。

## 浏览器实测

使用当前本地页面 UI 搜索、选择筛选并实际点击，非仅请求 API：

| 场景 | 结果 |
| --- | --- |
| manualSOS → Android 章节 | 打开正确 Android URL，可见 manualSOS 标题 top≈96px；另一个同 ID 元素隐藏 |
| 运行示例 → 本地服务端录制 → Java → 编译示例项目并运行 | URL 为 Java 变体；Java tab 选中；可见标题位于 java panel、top≈96px；另一份同 ID 元素隐藏 |
| manualSOS 搜索下一页 | URL page=2，显示第 2/2 页和剩余 8 个章节 |
| 第二页点击 iOS onUserManualSosEvent | 打开对应 iOS URL，可见回调标题 top≈96px，另一份元素隐藏 |

上述样例未出现错跳；不证明全部 232 个跨平台重复 ID 安全，也没有修复文档壳的原有重复正文/ID。

## 验证与部署边界

review 修复后：提取器 23 项通过，7 文件搜索专项共 49 项通过；全套 35 失败、1725 通过、2 跳过，完整失败名称与 mentor 干净基线一致，新增 0。类型检查和 CN Node service 构建通过。Node 产物在 3017 端口实际启动，/api/health 返回 ok、未配置凭据的 /api/search 返回预期 503；该临时进程已关闭，3004 开发页面保留。

重新导出仍为 2811 页、64065 条；全部锚点检查和新增覆盖 gate 通过。local-cn-reviewed-20261009 已通过标准 prepare/promote 激活本地 cn-kb-full-local；回执 dist/search/cn-reviewed-release.json，覆盖结果 cn-reviewed-coverage.json。旧快照保留在 cn-kb-full-local__4070543fe8bd4a58ab97d6a45794b477。实际查询结果保存在 cn-query-acceptance.json。

当前 kubectl 没有 current-context，外部部署 repo、namespace、镜像仓库及域名尚未指定。只能完成本地检查和草稿 PR/部署交接，尚未发布 K8s。现有 nginx Dockerfile 只提供静态站，Node API 需要独立镜像。部署输入见 docs/cn-search-deployment-handoff.md。
