# 中文旧站增量同步（2026-11-16）

目标草稿 PR：[docs-portal #1434](https://github.com/AgoraIO/docs-portal/pull/1434)。

本批接续 [11 月 10 日同步](./cn-master-sync-20261110.md)，目标为中文建设分支 `codex/cn-newdoc-html-api-migration`。旧站只读；本批尚未合入目标分支或部署。

## 基线与完整差距清单

已通过 GitHub 核实新站 [#1407](https://github.com/AgoraIO/docs-portal/pull/1407) 于 `2026-11-10T08:48:11Z` 合并，合并提交 `bc846d6069704872f168b95494b8534b7e9129bd`。因此旧站有效起点是 `b5f0771fd840b2e6c45b28357c206bbe94129767`（0.0.542），不再沿用 0.0.537。

本次 fetch 后固定旧站终点为 `8fd46d74070a18dcb46ef943f6d6768590be9bca`（0.0.544）。新站固定目标基线为 `a02a0f9ce230d4be857ecfc8384a69669b40bfc0`，工作分支 `codex/cn-master-hotfix-20261116`。范围依据 first-parent 提交与 GitHub merged PR 交叉核对，包含 **7 个提交、3 个内容 PR、28 个净变化源文件**；按实际合并时间和祖先关系取范围，不按编号大小筛选。

| 旧站 PR | 合并时间（北京时间） / 提交 | 本次开始时的差距 | 本批处置及复核入口 |
| --- | --- | --- | --- |
| [#2146：RTM 在线体验和 Web 场景实践](https://github.com/AgoraIO/shengwang-doc-source/pull/2146) | 11 月 10 日 11:43 / `047d4c4b1e1a185fbc1f5ea9acc94cdaa4908e14` | 已由新站 [#1398](https://github.com/AgoraIO/docs-portal/pull/1398) 提前同步；[#1406](https://github.com/AgoraIO/docs-portal/pull/1406) 简化标题 | 对最终合并源重新核对，19 文件已覆盖，无重复迁移。两篇实践、概览、侧栏、Demo 专区及 13 份图片/Mermaid 源均有映射。 |
| [#2142：ConvoAI v2.15 及 Agents SDK](https://github.com/AgoraIO/shengwang-doc-source/pull/2142) | 11 月 11 日 18:30 / `b3f5700178cd74af628c5c1b2a2061499cedd8e6` | 三语言 SDK、中文 REST schema 和 v2.15 发版说明均缺失 | 补入 5 文件；包括 MiniMaxDuplexTTS、StepFunSTT 的完整参数和示例、供应商导入/区域提示修订、`batch`、`enable_words`、两个 schema 及请求示例。 |
| [#2155：白板页面录制 forceCanvas](https://github.com/AgoraIO/shengwang-doc-source/pull/2155) | 11 月 12 日 18:15 / `e18507c9dc611202325585548cd1e49197344d79` | 白板录制示例缺该配置及说明 | 补入 1 文件：`forceCanvas: true` 与强制 2D 渲染、CPU 占用及音视频进度风险的完整说明。 |

这三个 PR 都必须保留在复核清单中；“已提前覆盖”不能从审计范围删除。每个源文件的源前/后 SHA-256、完整 diff 散列、hunk 标题、目标映射及目标前/后 SHA-256 见[逐文件台账](./cn-master-sync-20261116-ledger.json)；固定范围、GitHub PR 元数据和验证状态见[批次 JSON](./cn-master-sync-20261116.json)。台账最终分类为：6 文件补同步、19 文件已覆盖、3 文件排除。

## 其余 4 个提交

| 提交 | 内容 | 处置 |
| --- | --- | --- |
| `03ae3abc39058325060792851927ab9b48353078` | Update agent knowledge base | 旧站代理索引元数据，无新站发布内容，排除。 |
| `57b5aae77dd2afe742238b363b95113535e00dcc` | Repair agent knowledge base file mappings | 同上；两个代理 JSON 在净变化台账保留记录。 |
| `87944935efab419af338b006ba45807364a4b544` | Release 0.0.543 | 仅 `data/version.ts`，排除旧站构建计数。 |
| `8fd46d74070a18dcb46ef943f6d6768590be9bca` | Release 0.0.544 | 同上；作为本轮已审查终点，不复制为新站版本号。 |

## 内容保真与保留决策

- 三语言新增的 6 个 API 小节，除表头及“是/否”沿用目标中文约定外，与固定源逐段一致；签名、参数类型、必填项、默认值、错误行为和完整示例均保留。目标已有中文术语、导入路径、代码标识符及显式标题 ID 保留。
- v2.15 使用既有 `Accordion` / `openFirst` 约定；新增 `v215`，原 v2.14 及历史版本保留。六条 SDK 成员链接改为现有新站路径和实际锚点；创建智能体链接使用现有 `rest-api/agent/join`。
- OpenAPI 只应用源增量，保留已有描述清理、提示类型和内链适配。接口 `operationId` 集合不变，无须新增 lane、注册或 endpoint 导航。
- RTM 两篇正文的差异仅为已存在的新站语法和链接适配；13 份资产与最终合并源逐字节相同。旧站 `CodeStore.tsx` 的在线 Demo 由新站 `DemoGallery` 承接，不复制旧 React 页面。保留新站短标题、卡片布局及现有导航决定。
- 未修改渲染器、导入器、依赖或 QA 规则。保留英文站及其他新站独立改进。

## 独立页面阅读发现：P2 按用户决定另批修复

独立代理在 Headless Chrome 150.0.0.0 完成六个受影响页面的 1440×1000/light 与 390×844/dark 阅读。v2.15 默认展开、v2.14 目录/hash 展开、六条新增成员链接、已有显式 ID、SDK 完整示例与表格末列、OpenAPI schema 与请求场景切换，以及 forceCanvas 说明均已实际检查；六页均无整页横向溢出。

仍有 **1 项 P2 未解决**：在手机的创建智能体页选择“使用阶跃 StepASR 和 MiniMax 双向流式 TTS”后，长场景名撑宽共享工具栏，语言下拉位于 x355.6–427px，换行/复制控件延伸至约487px，超出卡片右界342px而被裁切；代码容器由300px扩大至452px。切回 Default 恢复正常。该 summary 与固定旧源一致，修复归属共享布局层，不应通过缩短源文本隐藏问题。

用户于 2026-11-16 明确选择“先完成内容同步并记录该问题，另批修复共享布局”。本批据此保留原文及共享实现，记录该项待办；此范围决定不等于生产发布接受。

该发现跟踪于 [#1434](https://github.com/AgoraIO/docs-portal/pull/1434) 和批次 JSON 的 `P2-openapi-long-example-toolbar`，责任角色为 portal maintainer；保持草稿，不记为手机或发布验收全通过。若扩展修复共享组件，须按 API 质量合同补中英文共享比较、回归与新浏览器证据。

本次阅读为 4316 开发预览，未验证生产预览、真实触摸、Safari、平板/横屏或生产字体交付。完整本地读验记录及21张截图仅保存于 ignored `.agent/artifacts/hotfix-20261116/`，关键对照为 `review-openapi-mobile-toolbar-new.png` 与 `review-openapi-mobile-toolbar-default.png`。

## 验证与接受边界

已完成的验证：完整测试 367 文件通过、1 文件跳过，6071 项通过、23 项跳过、零失败（415.45 秒）；类型检查通过；7037 篇文档表格审计零结构错误；API 源门禁为 0 新增重复、2 已知重复、0 过期豁免。

受影响的 5 篇 MDX 和 1 个 OpenAPI 共 402 个链接：与同步前基线逐条比较，22 条既有显式标题 ID 静态告警完全一致，新增无效链接为 0；OpenAPI 无无效内链。全库链接审计仍有 210 条无效内链，不能记为全库链接通过。全库 Lint 与同步前基线同为 9 错误、22 警告、3 提示，未放宽规则或改动相关代码。

内容及台账的独立代理审查通过，未发现可执行问题；完整中文生产构建 `VITE_DOCS_REGION=cn bun run build` 退出码 0：6170 份页面数据、7442 份机器可读文档、7206 份静态路由 HTML，client/SSR/预渲染均完成。六个受影响规范路径的生产 HTML 已核对新增内容及六个成员 ID，清理自动生成的更新时间清单后内容 source fingerprint 保持不变。保留大 chunk、CSS `::highlight`、插件耗时和 Git 元数据等告警，未调整阈值或隐藏告警。构建临时生成的更新时间清单恢复为本分支原值，不纳入内容 PR；主工作区的原有修改未触碰。页面阅读结论与用户明确延期的 P2 见上节；最终结果以[批次 JSON](./cn-master-sync-20261116.json) 为准。执行日志、临时对照脚本和浏览器截图仅保存在本地 ignored `.agent/artifacts/hotfix-20261116/` 或 `/tmp/cn-hotfix-20261116-*.log`，不作为发布资产提交。

本批沿用上批动态配置图与两张内容审核截图的中文图床上传待办，保留 HarmonyOS 0.2.11 日期差异、历史 FastLogger 链接和既有源语义疑义。RTM 的本地图片有此前用户决定，见[原同步报告](../agents/reports/2026-11-06-rtm-pr2146-sync.md)，本批没有新增图片或宣称已完成上传。

代理独立审查与自动验证不代表 API owner 的语义接受、独立人工阅读或 release owner 的生产发布决定。旧站有效基线仍为本批起点；只有本批实际合入目标分支后，下一轮才从固定 0.0.544 终点继续。统一入口见[热更新断点](./cn-hotfix-checkpoint.md)。
