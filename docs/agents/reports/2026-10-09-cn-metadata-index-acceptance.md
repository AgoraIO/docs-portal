# 中文本地索引元数据验收（2026-10-09）

后续审计补齐了 FAQ 组件链接的 110 篇详情（增加 496 条章节）。当前页面索引为 2811 个页面、53335 条章节；本报告下文保留第一轮结果，最新验收及剩余问题见同目录 2026-10-09-cn-search-query-acceptance.md。

## 已完成

- 修正静态生成入口的导入路径：共享 node_modules 的符号链接原先导致生成器读取另一工作树的旧代码；改为从当前 repoRoot 导入。
- 从文档父目录 meta.json 读取当前 SDK 版本；URL 中的明确历史版本优先。不把“当前版本”等导航标签当作版本号，未声明具体版本时保持空值。
- 平台入口卡片的映射扩展到相同产品、SDK 目录中的子章节；目录内映射不一致时不继承。
- 使用已有 dist/client Markdown 更新路由版本元数据并重新导出，未重复执行完整站点渲染。
- 新数据包含 2701 个页面、52839 条章节；章节 ID 唯一，无空正文、无非法版本字符串。
- Android 当前目录的 3060 条记录均为 4.6.2；历史 4.6.0 保留。C# 2411 条、React 126 条、C++ 3168 条记录的平台标签均通过检查；秀场产品标签检查通过。

## 本地 Meilisearch

新数据已切换至页面使用的 cn-kb-full-local（52839 条记录）。保留原记录中的拆词、顺序字段和别名，并复制当前索引设置；这次更新不代表这些实验策略已接入生产发布脚本。

旧索引保留在 cn-kb-full-metadata-1791555236527，可用于本地恢复。导入记录见 dist/search/local-metadata-install.json；导出文件见 dist/search/cn-records-version-verified.json。

实际验证：remove Handler 首条命中 removeHandler；秀场产品筛选正常；C# 屏幕共享能够命中概览及 screencapture 子章节。运行中的 http://127.0.0.1:3004/api/search 已验证读取新数据。

## 覆盖边界

按 sitemap、搜索页面清单及平台变体规则筛选，有 2712 个候选发布路由，2701 个产生正文记录。以下 11 个例外已读取生成 Markdown 核实：

- 8 个组件目录页：/zh-CN/api-reference/api、/zh-CN/reference/sdks、/zh-CN/reference/faq，以及 FAQ 的 account、integration、other、product、quality 分类页。生成 Markdown 仅包含组件标签，当前提取器不能把组件输出转成检索正文。其子文档是否覆盖需独立检查，不能凭目录页推断。
- 3 个 C# 空壳页面：device-management/mobile-camera、play/rhythmplayer、video/video-prenpro/face-detection，均位于 /zh-CN/api-reference/rtc/csharp-windows/ 下；Markdown 只有标题、提示和锚点，没有 API 正文。

因此，本轮确认了发布产物的导出覆盖及列出的元数据修正，尚不能宣称所有源 MDX、组件生成内容、跳转锚点和搜索相关性均已完整验收。版本缺失也可能是源数据未声明，不能猜测填充。

## 验证

5 个相关测试文件共 27 项测试通过；bun run types:check 通过；git diff --check 通过。代码尚未提交、推送或部署到 K8s。

下一步：确认目录页是否需要可搜索的摘要、处理 3 个无正文来源；然后针对新数据运行更完整的中文查询集、排名和跳转验收。产品/平台顺序字段本轮原样保留，修正后的元数据与这些实验顺序映射的一致性还需单独评估。
