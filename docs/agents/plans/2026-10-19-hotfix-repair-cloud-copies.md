# 中文热更新修复：云录制 API 文档副本

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 每个源 PR 独立工作树、分支、回归和修复记录；主控双审后独立创建 PR，不自动合并。全量测试/构建集中串行，必须主控明确放行，实施与轻量回归可以并行。

**Goal:** 补齐源 #2109 和 #2091 在云录制 API lane 中仍可访问的旧副本；不重复修改已由 #1215 同步的主产品线/Go/OpenAPI。

**Architecture:** 沿用现有公开路由及 MDX，不新增重定向或 include/runtime 抽象。产品主线已核对正确：使用其固定基线正文作为等价迁移参考，保留 API 副本的 provenance frontmatter，按源有效语义同步遗漏。计费副本与两篇 raw 指南写集不交叉。

**Tech Stack:** MDX、Vitest、Bun、Git。

## Task A：源 #2109 机器人费用说明

源：`0b84dbe284c918372c72c87fce5d6b3e346b1027`。

**Files:**

- Modify: `content/docs/zh-CN/api-reference/cloud-recording/restful/overview/billing-strategy/billing.mdx`
- Create/Test: `src/lib/cloud-recording-pr2109-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2109-fix.md`

- [ ] 只读源 diff、目标路由与导航；主线 `content/docs/zh-CN/realtime-media/cloud-recording/reference/billing-strategy/billing.mdx` 已有同一句，不改它。
- [ ] 真实 API 副本的“录制时长” info callout 必须含 source 新说明，先 RED；主线作为既有保护先绿。
- [ ] 在该 info 列表开头加一条，其他正文逐字保持：

```md
- 录制机器人的订阅费用会自动减免，不会额外计入实时音视频费用。
```

- [ ] 正向保护既有计费公式、单价/示例和其余规则；不更新价格、不推断当前收费政策。本次只恢复历史源变更。
- [ ] GREEN、types、MDX 语法/实际编译、测试 Biome、整文件单次插入比对、diff 检查；等主控安排独占 full 并记录结果，然后提交，勿 push/建 PR。

## Task B：源 #2091 raw 指南副本

源：`af693efea0f640e39659a64d230760abf7e79928`。

**Files:**

- Modify: `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/individual-mode/set-individual.mdx`
- Modify: `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/manage-file/introduce-recorded-files.mdx`
- Create/Test: `src/lib/cloud-recording-pr2091-api-copies-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2091-api-copies-fix.md`

- [ ] 完整复核源实际 diff；主线、旧版保存页、Go 默认 180、中英文 YAML 已由 #1215 正确覆盖，不重复改写、不把英文 v1 强制改中文 v2。
- [ ] API lane 两页仍是未标旧版的旧正文，且现有 resolver 不接管；不把它们误认为自动重定向或历史归档。
- [ ] 先写真实两页的 RED 检查：新单流 mode=raw，去 streamMode，MP4/MP3 组合、Native/Web 限制、180 分钟/3 小时、stranded、codec/raw 文件命名与切片规则、旧版入口。按 source 实际适用页分项，不要求每页都出现所有字段。
- [ ] 以对应主线的**固定目标基线正文**作为已适配的等价参考：

```text
realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual.mdx
realtime-media/cloud-recording/build/manage-recorded-files/introduce-recorded-files.mdx
```

- [ ] 保留 API 两页现有 `_migration` sourceUrl/sourcePath 等 provenance，只按需要更新标题为“实现单流录制”/“录制文件介绍”，将正文同步为相应已验证主线正文；不要盲目复制主线 frontmatter 覆盖来源，不新增 include 或渲染器。
- [ ] 保留主线绝对规范链接及明确的旧版指南入口，其目标必须真实存在。旧版页继续使用主线已保存版本，不凭旧 API 副本另造一份历史来源。
- [ ] 核对 source 导航隐藏项在 API lane 是否仍有活动导航入口；若额外写集确有必要，先向主控列出证据，不擅自修改 meta/删除页面。source 未改、已隐藏的旧 direct route 不自动扩为全站清理。
- [ ] GREEN，新增回归之外还运行既有 `src/lib/cloud-recording-pr2091-sync.test.ts`；比较主线/Go/YAML/旧版页与基线均不变。两 API body 与主线参考的一致性、实际 MDX 编译、相关链接/fragment、types、测试 Biome、diff 检查；等待主控安排独占 full，再提交，勿 push/建 PR。

## 验收边界

- 所有源文件仅用固定 Git 对象读取，不用源工作区脏改或环境凭据。
- 本次不改端点 operationId、OpenAPI lane、公共 YAML、价格或部署。
- 本地通过和创建 PR 不等于目标分支已合入或线上已生效。
- 全量曾出现并发负载超时，不能重复启动多套全量，也不能增加 timeout 掩盖；明确记录原失败/中断和受控复跑结果。
