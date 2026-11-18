# 未发布源页面处理与验收记录

日期：2026-11-09。实施范围来自本次对话中已确认的 8 页误收录与 2 页英文 Platform 暂缓副本；未部署。

## 处理结论

- 中文：将 6 个 Server SDK API 下划线页面及灵隼、Device Kit 的资源页原样移至 `docs/migration/unpublished/content/docs/**`。清单和 SHA-256 见 `docs/migration/unpublished/manifest.json`。这些文件不再属于发布集合，原稿及锚点保留在归档。
- 正式 `localuser.python.mdx`、`irtcconnectionobserver.python.mdx` 不变；没有根据副本新增、删除或改写现行 v2.2.4 SDK 的方法说明。
- 文件映射、通用转换器和 API manual MDX runner 统一遵守旧站的下划线文件/目录排除规则；共享片段仍可在正式页面内展开。当前 path-map/API inventory 标记为 excluded，不再声称有可重定向的旧站页面。
- 删除灵隼 downloads 导航、Device Kit 的隐藏导航占位和灵隼 resources 旧 IA 映射。告警指南原有资源页链接改为对应平台的原始示例仓库；iOS 使用 iOS 项目。
- 移除 LocalUser 副本的重复标题源债务豁免。其他 2 项真实源债务保留。
- 英文另在 `codex/consolidate-platform-guides` 处理：归档两个 Platform MCP/Skills 副本；网页及 `.md` 地址分别 301 到现行 `/en/introduction/agora-mcp`、`/en/introduction/agora-skills`。正文和应用路由/Vercel 配置同步。

## 来源与基线

- 旧源：`shengwang-doc-source` 的本地提交 `1975b02e0f28d3f47036b04c460a56a2eba420b8`。API `_processFile` 第 292 行、普通文档 `_processFile` 第 268 行明确跳过下划线文件；对应目录也跳过。
- 中文基线：`12fbdb428c4c6064c491bada447540e81aee4e86`，分支 `codex/exclude-unpublished-cn`。
- 英文基线：本地 `origin/main` 的 `553dbe7f8b9172c4cc119a2937208d4f5ac62ea7`，分支 `codex/consolidate-platform-guides`。未将两个地区分支互相合并。
- 历史迁移审计和 last-updated 索引保留为历史记录，不作为继续发布的依据。

## 验证

| 检查 | 结果 |
| --- | --- |
| 中文 `bun run test --maxWorkers=2` | 5814 通过、6 跳过；362 文件通过、1 文件跳过 |
| 中文 `bun run test:api-quality` | 524 项通过 |
| 中文迁移/归档重点回归 | 116 项通过，含真实 source.getPage/getPages、原稿哈希、阻止重新生成和共享片段展开 |
| 两边 `bun run types:check` | 通过 |
| 英文 MCP/Skills consolidation 回归 | 34 项通过 |
| 英文全套测试 | 1961 通过、12 失败；在未修改的基线独立复验同样 12 项失败，集合完全一致，无新增失败 |
| 中文 API source gate | PASS_WITH_DEBT：0 新缺陷、2 已知重复标题、0 过期豁免 |
| 两边 `legacy-redirects:check` | 通过 |
| 改动涉及的 TS 文件 Biome / diff whitespace | 通过 |
| 本地中文 HTTP | 8 个移除地址均 404；正式 LocalUser 为 200 |
| 本地英文 HTTP | 两个旧地址及 `.md` 共 4 条 301，Location 为对应共享指南 |
| 浏览器目标阅读 | 旧 LocalUser 显示 404，正式 LocalUser 正常；旧 MCP/Skills 可到达共享指南，标题正确 |

英文基线的 12 项失败涉及步骤编号、表格/代码标签页、IoT 示例呈现和既有 legacy sitemap 链接，保留在原内容审查范围。本次没有通过放宽这些断言获得通过。

全站 `docs:links` 扫描 7223 篇文档、25 个 OpenAPI 源，报告 210 个无效内部链接；不将该全站历史债务声称为本次修复完成。本次改动的告警指南定向链接检查为 0 个无效内部链接、0 个缺失页面、0 个缺失锚点，结果另存本地验收附件。

公共文件比较 `qa:api:shared` 未通过：英文基线缺少当前中文分支已经存在的 API 质量合同/命令及部分公共实现。这是基线差异，本次未修改共享渲染器或复制实现来规避比较。未执行双区域 `all` 浏览器生产构建验收；本记录不构成发布批准。浏览器截图工具部分调用失败，截图不作为验收证据；URL、标题与 HTTP 结果已实际确认。

## 独立审查

独立 reviewer `review_unpublished_pages` 首轮发现资源旧 IA 跳转遗漏和 iOS 链接误指 Android；两项已修正。二次只读复核未发现其他实际缺陷，并独立运行新增 6 项回归通过。

SDK 语义确认不适用：本次没有改动正式 SDK 声明、参数、返回值或版本。旧站没有发布这些下划线页面，因此没有为推导的旧站 URL 新建 301；新站误发布地址按正常缺失页面处理。若以后恢复某个 API，应另行核对相应 SDK 后明确发布。

本地日志、HTTP 结果及基线失败集合保存在忽略的 `.agent/artifacts/unpublished-pages/`；不提交截图。原飞书反馈文档未修改。生产部署、远端搜索索引刷新和发布验收尚未执行。
