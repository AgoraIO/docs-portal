# 中文热更新逐 PR 修复：首两项实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 步骤按复核、红绿验证、规格审查、质量审查和独立 PR 执行。用户已同意当前会话主控、首两项串行，再按互不重叠产品组有限并行。

**Goal:** 完整补齐源 #2107 与 #2077，并建立每个源 PR 独立验证、独立修复 PR 的模式。

**Architecture:** 只恢复固定源 diff 的有效语义，保持现有 Fumadocs MDX、导航、锚点和平台结构。每项从目标分支新建独立工作树和分支，禁止跨任务共享未提交改动；同文件的后续修复按依赖串行。历史审计保持原样，进度另行记录；创建 PR 不等于已合入或线上生效。

**Tech Stack:** Markdown/MDX、TypeScript、Vitest、Fumadocs、Bun、GitHub CLI。

## 已批准约束与固定证据

- 目标：`codex/cn-newdoc-html-api-migration`，初始提交 `7c6c60ead44406e69906c5c3808cd489784aa89e`。
- 审计：PR #1216 的四份报告；源范围终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。
- 不操作用户主工作区未跟踪文件，不修改源仓库脏文件或读取环境凭据。
- 不自动合并 PR，不自动部署；未获新的明确选择，不机械恢复源 #2060 回退或猜测 #2113 归档方案。
- 20 个不完整项中 #2113 等待方案，其余 19 项进入修复队列。另有 #2060 源回退单独确认，不在机械修复队列中。

## Task 1：源 #2107 Agent 安装命令

**Files:**

- Modify: `content/docs/zh-CN/ai/get-started/quick-start-agent.mdx`
- Create/Test: `src/lib/convoai-pr2107-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2107-fix.md`

工作树：`/Users/yejiayi/.config/superpowers/worktrees/docs-portal/fix-hotfix-pr2107`；分支：`codex/fix-hotfix-pr2107`。

- [ ] 阅读源提交 `c201c2234334aab94cae46e98529e9dc8f6d1638` 的三个 diff hunk；确认目标仍有三条旧固定版本。
- [ ] `bun install --frozen-lockfile`，运行既有 `src/lib/source.server.test.ts`，确认此工作树基线。
- [ ] 先新增三个回归测试，每个语言独立断言实际 MDX 的新命令、旧固定版本消失；同时保留 dotenv/godotenv 版本约束。测试核心断言：

```ts
expect(content).toContain('go get github.com/AgoraIO/agora-agents-go/v2@latest');
expect(content).not.toContain('agora-agents-go/v2@v2.4.0');
expect(content).toMatch(/^agora-agents$/m);
expect(content).not.toContain('agora-agents==2.4.1');
expect(content).toContain('npm install agora-agents dotenv@16.4.7');
expect(content).not.toContain('npm install agora-agents@2.4.0');
```

- [ ] `bun run test -- src/lib/convoai-pr2107-sync.test.ts`：预期因三条旧值失败，不能是加载/语法错误。
- [ ] 仅替换三条命令，其他文本、依赖和平台结构不变：

```text
go get github.com/AgoraIO/agora-agents-go/v2@latest
agora-agents
npm install agora-agents dotenv@16.4.7
```

- [ ] 同一测试转绿；运行 `bun run types:check`、`bun run test`、新增测试文件 Biome 和 `git diff --check`。
- [ ] 修复记录注明源 SHA、目标基线、红绿证据、完整测试统计和没有安装/执行 SDK 的验证边界。
- [ ] 单独提交；依次完成规格符合性与质量审查。两项通过后，推送并创建目标为中文迁移分支的独立 PR。

## Task 2：源 #2077 metadata 截断

仅在 Task 1 的审查与 PR 创建完成后开始修改。

**Files:**

- Modify: `content/docs/zh-CN/api-reference/rtc/electron/(current)/metadata/metadata-observer.mdx`
- Modify: `content/docs/zh-CN/api-reference/rtc/flutter/(current)/metadata/metadata-observer.mdx`
- Modify: `content/docs/zh-CN/api-reference/rtc/react-native/(current)/metadata/metadata-observer.mdx`
- Modify: `content/docs/zh-CN/api-reference/rtc/unity/(current)/metadata/metadata-observer.mdx`
- Modify: `content/docs/zh-CN/api-reference/rtc/unreal-cpp/(current)/metadata/metadata-observer.mdx`
- Create/Test: `src/lib/rtc-pr2077-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2077-fix.md`

分支：`codex/fix-hotfix-pr2077`；独立工作树同名；从当时最新目标分支建立，不包含 Task 1 的未合入提交。

- [ ] 读取固定源提交 `5745b93af59f63df5fa6f2ea6bfbc9cc25b75a60`；核对源 8 平台及目标已覆盖的 Android/iOS/macOS，保留 C++ #2072 已有说明。
- [ ] 建立逐方法回归检查：Electron/Flutter/RN/Unity 的 send metadata 方法、Unity OnReadyToSendMetadata、Unreal C++ onReadyToSendMetadata 都必须在对应方法正文包含超限截断说明。检查大小限制链接/锚点和源 severity，而不是只查整页出现一次短语。
- [ ] 核心断言：

```ts
expect(methodSection).toContain('如果超过该值，SDK 会截除超出部分。');
expect(methodSection).toContain('#api_irtcengine_setmaxmetadatasize');
```

其中 Unreal C++ 对应源链接为 `#callback_imetadataobserver_getmaxmetadatasize`；Unity 大小限制显示名保持 `SetMaxMetadataSize`。已有 Android/iOS/macOS 作为完整范围的正向保护，C++ 不倒灌历史版本。

- [ ] 先运行 `bun run test -- src/lib/rtc-pr2077-sync.test.ts` 确认缺失方法失败。
- [ ] 为 Electron/Flutter/RN/Unity send 方法添加源 note 的等价 `:::note`；Unity ready 回调再添加一处；Unreal C++ 仅补原注意说明的截断句并保持注意语义，不把它误改为普通 note。不改签名、参数和历史版本。
- [ ] 同一回归测试转绿；`bun run types:check`、`bun run test`、改动文件 MDX 语法检查、相关大小限制链接/锚点存在性检查、测试 Biome 和 `git diff --check`。
- [ ] 新增独立修复记录，依次完成规格与质量审查；独立提交、推送和创建 PR。

## 后续产品组队列与依赖边界

以下是独立子任务队列，不是把多个源 PR 合并为同一个修复。每项开始时以对应审计节和源 diff 单独固定实施文件/回归检查；存在共享文件时先比较前一项提交，再串行移植，禁止互相覆盖。

| 产品组 | 源 PR 队列 | 约束 |
| --- | --- | --- |
| AI | 2063 → 2074 → 2101 | 共用 Agents SDK API / OpenAPI；同组串行，保留后续有效覆盖。 |
| RTC API | 2085 → 2084 → 2094 → 2056 | 同组先核对每项实际触及方法；2094 大型生成改动需逐文件语义验收，不能只补审计样本后称完整。 |
| RTC 指南 | 2108 → 2098 | 共用快速开始、release notes、裁包指南；顺序串行。 |
| RTM | 2067 → 2069 | 共用平台/下载/指南与 API 范围；顺序串行。 |
| 审核 | 2065 → 2106 | 核对开通服务与各消费平台，不恢复已下线厂商内容。 |
| RTSA | 2083 | 需完整核对核心 C API / 示例 / 性能数据，不仅改版本号。 |
| 云录制 | 2109 → 2091 | 保留已同步主线；针对独立 API 副本补齐，不默认用重定向替代正文。 |
| 门铃 | 2110 | 源明确删除的旧架构图移除，保留已正确的 PaaS 文字和导航。 |

各组互不重叠的实际写集确认后可同时最多 2–3 名实现者；主控统一复核、测试和创建 PR。每个 PR 都说明“已提交待审”，不把未合入修复记录为目标分支已生效。
