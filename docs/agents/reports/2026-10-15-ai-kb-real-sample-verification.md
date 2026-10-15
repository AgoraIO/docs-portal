# 真实 KB 样本准备与验证

## 范围与版本

- 工作树：`/Users/yuzhuopeng/.codex/worktrees/cn-ai-bot-kb-demo/docs-portal`。
- 分支：`codex/cn-ai-bot-kb-demo`。
- 文档与应用构建源码：`3e0287bdea5bf8de11334759aa1544786f22f928`。构建开始时 tracked 文件干净；随后修改 KB 导出脚本、测试及说明，没有修改文档内容或应用/普通搜索代码。语料 revision 指文档构建来源，导出工具修复由本报告所在提交追溯。
- 固定选择：`docs/ai-kb/demo-selection-v1.json`；scope：`cn-real-demo-v1`。
- 创建、上传、模型调用继续暂缓；没有创建云端 KB/API Key，本报告不代表百炼验收。

## 构建记录

以 `VITE_DOCS_REGION=cn` 执行现有静态构建五步：OpenAPI 同步、last-updated、static-payload、build:app:static、route-html，全部成功。输出 6,836 个 payload、8,039 个机器可读文件、7,733 个路由 HTML。last-updated 检测到浅历史，保留既有生成清单。

node_modules 指向旧 demo 工作树。本次 route-html 使用 `.superpowers/demos/cn-kb-real-v1/generate-route-html.mjs` 临时副本，只将 worker 的相对 import 改为当前工作树绝对路径；未改 tracked 构建脚本。其余步骤沿用现有命令。

## 导出范围修复与覆盖缺口

初次导出被未选中的零记录页面阻断。增加真实 Bun CLI 回归：全量导出仍失败、选择有效文档成功、选中空页或混合空页仍失败；先观察 RED，再修复为 GREEN。CLI 传入 selection，读取器仅按 selection 限定最终正文覆盖率检查；全局发布清单、路由、真实锚点校验保留。不使用路径例外名单。

Ruling: 样本完整性按显式 selection 定义，全量导出保持严格。原因：未选中页面不能阻断独立 demo 范围。若判断错误会造成缺文档仍声称完整，因此以选中空页失败和全量仍失败的回归作为保护；`complete: true` 绝不代表全站完整。

诊断发现全量还有 20 个零记录来源：8 个目录组件页、3 个仅标题/空锚点页、9 个有正文但缺少现有产品映射而被过滤的弹幕 API 页。诊断脚本不用于生成可信 corpus。这些是全量链路前的独立待办，本次未修改普通搜索产品映射，也未声称全量 KB 已准备好。

浏览器实测还发现发布 Markdown 的固定 `llms.txt` 导航提示被选为摘录。新增平台/非平台两项测试，RED→GREEN；仅在 KB 导出时去掉文件开头的已知生成提示（复用现有常量），保留正文及代码中的同样文本。普通搜索和发布 Markdown 均不修改。

## 真实样本与验证

5 篇真实来源包括 Web/Android Token 鉴权、两篇 Token FAQ、创建对话式智能体 OpenAPI。保留正文、代码、产品、平台、类型、章节链接与 SHA-256。见 [真实样本说明](../../ai-kb/real-sample-demo.md)。产物：`dist/ai-kb/cn-real-demo-v1/corpus.json`。

离线增量验证使用内存中明确标记的模拟远端 ID：首次 create 5；不变 skip 5；仅 revision 变化 skip 5；修改一篇 update 1、skip 4。没有将模拟状态写成云端 successful。

本地 HTTP：Web/Android Token 均 200 answered，引用分别指向对应平台；OpenAPI 筛选命中真实 join 文档；无关问题返回 200 no-evidence、无引用。本地仍为确定性原文摘录，不是模型问答。普通搜索没有配置 Meili，不能据此声称普通搜索 E2E 通过。

## 检查记录

- KB/问答相关 13 个文件、149 项测试通过。
- `bun run types:check`、6 个变更 TypeScript 文件 Biome 检查通过。
- 样本范围修复经独立只读审查，无重要问题；独立 CLI 测试 6/6 通过。随后导航提示修复以两项 RED→GREEN 测试验证。
- 最终完整测试：2,956 项，2,917 通过、37 失败、2 跳过。按文件路径及 fullName 对照 Phase 1 的 37 项基线，新增失败 0、消失失败 0；全仓门禁仍红。前一次运行出现 4 项额外约 5 秒的侧栏用例失败；单独重跑均通过，最终完整重跑恢复为原 37 项，不将其隐去或归因于 KB 修复。
- 去掉导航提示后，真实 corpus 已重新导出，离线增量/筛选/无证据验证再次全部通过。`verification.json` 仅在 `.superpowers/demos/cn-kb-real-v1/` 保存本地回执，`cloudVerified: false`。
- 浏览器在端口 3008 显示真实正文“创建一个对话式智能体 … 并加入 RTC 频道”，点击引用实际进入 join 文档页并显示其参数与请求示例。已回到搜索页保留演示；截图 `/tmp/cn-ai-bot-real-kb-2026-10-15.png`。最终 HTTP 同样返回该真实正文，未再返回导航提示。
- `git diff --check` 通过。
- 未 push、merge、deploy；原 CN-NEWDOC 工作区未修改。真实云端导入/Metadata 筛选/检索/模型/CI-CD 全链路仍待验收。

## 后续类型检查更正

后续质量预览阶段发现本轮 `it.each` 平台参数的 TypeScript 推断错误，前次组合命令退出状态未正确反映 tsc 失败。本报告原“types:check 通过”表述不准确；已在后续提交将参数改为 const tuple，并独立确认类型检查 exit 0。详见 `2026-10-15-ai-kb-quality-preview-verification.md`。
