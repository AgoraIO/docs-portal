# 中文热更新修复：首个独立并行组

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 仅在首两项 #2107 / #2077 都完成验证、双审并创建 PR 后执行本组。用户已批准实际写集不重叠的产品组有限并行。

**Goal:** 为源 #2063、#2065、#2110 各创建一份独立修复 PR，不合并多个源 PR，不自动合入或部署。

**Architecture:** 三项正文分别位于 AI SDK、内容审核、门铃，实际写集不相交。每个独立工作树从中文迁移目标分支最新提交创建，测试和报告以源 PR 编号命名；主控独占进度表更新和推送/建 PR。共享后续源 PR 如 #2074 / #2101 不同时修改本组文件。

**Tech Stack:** Markdown/MDX、Vitest、Bun、Git、GitHub CLI。

## 通用执行门槛

- [ ] 读取对应源 merge diff 和冻结范围终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`，不读取源工作区脏改/凭据。
- [ ] 确认这次所涉源 PR 的其他 hunk 已覆盖，不能只修已知样本后未检查就宣称完整。
- [ ] 冻结安装并运行一个既有相关基线测试；新回归先 RED、最小正文改动后 GREEN。
- [ ] 运行 `bun run types:check`、`bun run test -- --maxWorkers=2`、新增测试 Biome、改动文件 MDX 语法及相应链接目标检查、`git diff --check`。三组并行时限制 Vitest workers，避免每组按机器核数开满。
- [ ] 新建编号独立的修复记录：源 SHA、目标 SHA、source→target 对照、已覆盖但未重复改动项、红绿证据与验证边界。未验证线上，不写成已上线。
- [ ] 提交精确任务文件，不修改锁文件、AGENTS、生成树、用户主工作区。完成后按规格、质量两个轴复核；通过后由主控逐个创建 PR。

## Task A：#2063 TypeScript 热词参数与 Python 错位表

源：`8a40a93329aec856e6ff0f2192e7ab1cd4ec2fd0`。

**Files:**

- Modify: `content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx`
- Modify: `content/docs/zh-CN/api-reference/conversational-ai/agent-python/index.mdx`
- Create/Test: `src/lib/convoai-pr2063-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2063-fix.md`

- [ ] source 的 Go/Python/指南/导航/REST 逐项复核；Python 已由 #2074 修正为 `asr.keywords`，不得倒退。执行时发现 Python 的 keywords 参数行误放进 TencentSTT 表，故同一源 PR 范围内补齐 Python，不另开第二个同源修复。
- [ ] 从真实目标内容提取 `#### FengmingSTT` 至 `#### TencentSTT` 小节；对可选构造器、两个表字段和旧“无需任何参数”分别检查，先观察失败。
- [ ] 仅将该小节补齐为源有效版本：

````md
声网自研的「风鸣」STT 服务，无需外部凭据，输出 `asr.vendor = "fengming"`。可选传入 `keywords` 热词列表和 `additionalParams`，这些参数会写入 `asr.params`。

```typescript
new FengmingSTT(options?: FengmingSTTOptions)
```

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `keywords` | `string[]` | No | 热词列表，用于提升 ASR 识别准确率 |
| `additionalParams` | `Record<string, unknown>` | No | 附加 Fengming 参数，合并进 `asr.params` |
````

- [ ] 验证 TypeScript 小节之外整篇内容保持基线；测试保护无参调用兼容的可选参数签名，不把 `options?` 改成必选。不要顺手混入 #2074 tools 或 #2101 类型别名。
- [ ] Python 新增小节级 RED 用例：FengmingSTT 必须有 keywords/List[str]/No/None 参数表及完整“声网自研、无需外部凭据、asr.vendor=fengming”描述，保留 `asr.keywords`；TencentSTT 不再包含误放的 keywords 行。将该行移动到 Fengming 的独立表，恢复完整描述，其他 Tencent 参数及全文保持不变；GREEN 后以最终集合重跑完整测试、两文件 MDX 编译。TS 源仍写 asr.params 的源内差异仅记录，不擅自推断 SDK 事实。
- [ ] 通用验证与双审后创建独立 PR，更新进度为“PR 已提交，待审”。

## Task B：#2065 音频审核控制台开通

源：`7f279055760413d6ff194b09abe5e403f434610d`。

**Files:**

- Modify: `content/docs/zh-CN/realtime-media/content-moderation/build/audio-moderation-api.mdx`
- Create/Test: `src/lib/content-moderation-pr2065-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2065-fix.md`

- [ ] 对开通语音审核服务步骤 3 做作用域检查，先要求新控制台流程与两个本地文档链接，确认旧“联系声网技术支持”导致失败。对两处已迁移的 `clientRequest` 说明做正向保护。
- [ ] 仅把步骤 3 的技术支持/公司名称/邮箱旧列表替换为：

```md
3. 在声网控制台的**内容审核**页面填写邮箱等必要信息，并开启音频审核服务。开通步骤详见[开通服务](/zh-CN/realtime-media/content-moderation/enable-service)，透传字段和回调地址设计建议详见[配置说明](/zh-CN/realtime-media/content-moderation/build/configuration)。
```

- [ ] 保留后续登录说明、接口参数和计费提醒，不删除实际 API 的 callback 参数。测试只禁止在该开通步骤额外要求回调地址，不能禁止整篇提及回调。
- [ ] 验证两个目标文档存在；其他两个 source hunk 的 clientRequest 均仍在，未退回 clientInfo。不要修改整个 enable-service 或视频审核页，它们属于不同源范围。
- [ ] 通用验证与双审后创建独立 PR。

## Task C：#2110 门铃旧架构图删除

源：`77d8e0e67e1bcd60c8f3d37e3cc2a1f02a9a3e3f`。

**Files:**

- Modify: `content/docs/zh-CN/solutions/smart-doorbell/index.mdx`
- Create/Test: `src/lib/smart-doorbell-pr2110-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2110-fix.md`

- [ ] 检查 source 三个文件：侧栏 aPaaS、首页文案、方案介绍；已有 PaaS-only 文案、表格、导航和有效方案指引不重复改写。
- [ ] 新测试要求实际 index 不再包含源明确删除的 `1666592737672`；首次运行应失败。同时保护 PaaS 描述、PaaS 方案链接及无 aPaaS 导航。
- [ ] 仅删除目标 `![解决方案架构图](https://web-cdn.agora.io/docs-files/1666592737672)` 一行及多余空行；保留 PaaS-only 表和技术架构链接，不下载/删除远端媒体，不删除本地目录。
- [ ] 检查整个门铃公开内容目录不再引用该图；源未要求删除 PaaS-only 表，不以机械逐字 diff 为由扩大删除。
- [ ] 通用验证与双审后创建独立 PR。
