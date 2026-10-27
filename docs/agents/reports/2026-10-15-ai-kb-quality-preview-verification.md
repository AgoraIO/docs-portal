# 本地 KB 质量与切块预览验证

## 范围

分支 `codex/cn-ai-bot-kb-demo`，本轮基线 `98aa8748d`。工作树 `/Users/yuzhuopeng/.codex/worktrees/cn-ai-bot-kb-demo/docs-portal`。文档语料来自构建 revision `3e0287bdea5bf8de11334759aa1544786f22f928`，沿用上轮真实静态产物，不重复全站构建。

新增 `previewKbCorpus` 与 `kb:preview:cn`，产生独立切块及质量报告。未改变 corpus schema、同步协议、本地问答运行方式、普通搜索、Meili 或发布流水线；未创建、上传或调用任何云资源。显式声明已存在的 MDX 编译器为开发依赖，锁文件只新增根依赖声明，没有升级解析器。

## 设计决策

- 采用 MDX/GFM AST 顶层完整块，默认软目标 3000 UTF-16 字符。代码、列表、表格和 JSX 组件保持完整。代价：超长结构块仍存在，不能声称满足模型上下文预算。
- 引用仅接受显式且在现有 Metadata 中的锚点，未知章节回到文档页并报告。代价：API 引用可能仅到页面，但不生成不存在的链接。
- 只输出离线预览，暂不接入问答或同步执行。代价：尚无新的检索质量提升或云端效果结论；避免提前锁定百炼未验证的 chunk 接口。

## 真实产物检查

`dist/ai-kb/cn-real-demo-v1/preview.json`：5 篇、88 块、0 errors、13 warnings（4 oversized-block、9 unmapped-heading），cloudVerified 为 false。逐篇验证拼接等于原文、偏移吻合、完整 Metadata 继承、ID 唯一、引用在文档页/已验证 section 集合内，全部通过。未重新抓取网站，链接有效性继承上轮构建校验。

块数及限制见 [使用说明](../../ai-kb/chunk-preview.md)。原文来源平台隔离保持；保留超长块和页面级 API 引用是明确边界，不是已修复的语料问题。

## 验证

- 新模块测试先观察缺失模块失败，再通过 5 项：无损重建/偏移/平台、完整复杂块、引用回退、revision 稳定/摘要篡改、非法 MDX。
- CLI 子进程测试验证可用输出、输入不变、拒绝覆盖输入。相关模块合计 14 文件、155 项通过。
- 独立 reviewer 无重要问题，独立运行 preview + CLI 12/12 通过。
- 类型检查发现上轮新增 `it.each` 的平台参数推断为 string。修正为 const tuple，独立 `bun run types:check` exit 0。本记录纠正上轮报告中“类型检查通过”的不准确表述；上轮组合 shell 的最后退出码掩盖了前面的 tsc 失败。
- 完整测试：2,962 项，2,922 通过、38 失败、2 跳过。与 Phase 1 按文件/fullName 比较，原 37 项均在，额外 1 项为侧栏 external IM entry 用例（约 5.14 秒失败）；单独重跑该项通过（385ms，1 passed/85 skipped）。仍报告完整套件失败，不能将单项重跑当作全套通过。
- 针对 5 个变更 TS 文件 Biome 检查通过，无错误，有 2 项测试字符串拼接 info；`git diff --check` 通过。
- 可重复执行命令：`bun run kb:preview:cn --corpus dist/ai-kb/cn-real-demo-v1/corpus.json --out dist/ai-kb/cn-real-demo-v1/preview.json`。终端报告 5 documents、88 chunks、0 errors、13 warnings。

未 push、merge 或 deploy；原始 CN-NEWDOC 工作区未修改。云端与全量验收继续待办。
