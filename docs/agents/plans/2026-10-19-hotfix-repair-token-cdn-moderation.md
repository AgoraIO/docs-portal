# 中文热更新修复：Token、CDN 与视频审核

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 每项独立工作树/分支/PR；同项先 RED→GREEN，再规格与质量复核；主控统一外部推送和 PR 创建。

**Goal:** 补齐源 #2056、#2108、#2106，三项正文写集分别是 RTC channel API、RTC 指南、视频审核，不相交。

**Architecture:** 直接适配固定源有效 diff，不改渲染器，不机械回滚后续 SDK 版本，不修改历史版本。#2056 原排在大 API 生成项之后，但核查结果回调在当前页已存在，此次只改 Token 回调描述，不依赖历史版本/新焦距 API 的决策，故可以先行；未来 #2094 仍必须保留本项有效内容。

**Tech Stack:** Fumadocs MDX、TypeScript、Vitest、Bun、Git。

## 通用验证与提交

- [ ] 从最新中文迁移目标分支创建独立工作树，记录实际基线；不引用其他工作树未提交内容或源脏改/凭据。
- [ ] 固定源 merge SHA、复核完整 source diff；已覆盖内容作为正向保护，不重复修改。
- [ ] 使用真实 MDX 的方法/平台小节作作用域；先运行新测试确认预期缺失失败，再仅补有效源变更。
- [ ] 定向测试、类型检查、实际修改文件 MDX 编译和语法检查、相关链接/fragment 检查、新测试 Biome、`git diff --check`。
- [ ] 全量 `bun run test --maxWorkers=4`，记录最后退出码和准确统计，不将 socket/localStorage 日志当作未核实的成功或失败。
- [ ] 独立记录 source→target 映射、红绿证据、范围外内容保护和未验证线上/SDK的边界；提交精确文件，不 push、不建 PR，交主控双审后逐个操作。

## Task A：#2056 跨平台 Token 回调

源：`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。分支/工作树后缀：`fix-hotfix-pr2056`。

**Files:**

- Modify only where missing: `content/docs/zh-CN/api-reference/rtc/<平台>/(current)/channel.mdx`
- Platforms: android、cpp-all-platforms、csharp-windows、electron、flutter、harmonyos、react-native、unity、unreal-blueprint、unreal-cpp、ios、macos。
- Create/Test: `src/lib/rtc-pr2056-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2056-fix.md`

- [ ] 枚举源 12 文件实际修改的回调；iOS/macOS 只修改 willExpire，不把无关旧版方法加入此次范围。
- [ ] 按每个回调稳定详情锚点截取，检查 source 对应内容，而不是在同页只命中一次 renewToken 就判双回调齐全。既有正确的平台/回调保护通过，实际遗漏先 RED。
- [ ] 对缺失描述补等价两场景列表：`renewToken` / `RenewToken` 可直接更新、**无需先离开频道**；只有 App 自己需要重新入会时才走 leave/join。source 有更新结果回调的各平台保留相应名字和本地 fragment；不向 source 未声明的平台编造结果回调。
- [ ] 断言无离会前置要求、保留可选重新入会流程、正确调用结果信息和有效链接；不改参数、签名、API 方法结构、其他回调或历史版本。
- [ ] 验证改变范围之外与基线一致；完成通用门禁和独立记录。

## Task B：#2108 Android Maven CDN

源：`af6bffea6fda66b50097d3daa8779306296c471a`。分支/工作树后缀：`fix-hotfix-pr2108`。

**Files:**

- Modify: `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx`
- Modify: `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx`
- Create/Test: `src/lib/rtc-pr2108-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2108-fix.md`

- [ ] 完整复核 source 5 文件，视频/纯音快速开始与 Android 下载现有 CDN/Full-Lite/仓库保留说明已正确，禁止降回 4.6.4 或反向改包名。
- [ ] Android release-notes 平台段开头应有全局 caution（不是只塞进某一旧版本）：

```md
:::caution[注意]
自 2026 年 9 月 14 日开始，通过 Gradle 自动集成 Android SDK 时，需要额外配置声网 Maven CDN 仓库。具体配置方式请参考[下载 SDK](/zh-CN/realtime-media/rtc/reference/downloads/android#通过-gradle-自动集成-sdk)。
:::
```

- [ ] Android 裁包段的 Gradle 集成小节增加 source 前置引导：

```md
通过 Gradle 自动集成 Android SDK 前，请先确保已添加声网 Maven CDN 仓库。具体配置方式请参考[下载 SDK](/zh-CN/realtime-media/rtc/reference/downloads/android#通过-gradle-自动集成-sdk)。
```

- [ ] RED/GREEN 检查这两个特定平台小节的说明、日期、caution 和 canonical 锚点；其他平台段全文保持原样；source 本次改的 Gradle 术语若仍缺则同项定点补，不批量替换历史 Maven Central 记录。
- [ ] 目标下载页的真实标题和 fragment 必须存在，既有仓库 `mavenCentral()` 及两套配置正向保护；完成通用门禁。

## Task C：#2106 Web 视频审核前置条件

源：`39036aadcbdf939c4de94930074c2e95624f4d23`。分支/工作树后缀：`fix-hotfix-pr2106`。

**Files:**

- Modify: `content/docs/zh-CN/realtime-media/content-moderation/build/netease-yidun-video-moderation.mdx`
- Create/Test: `src/lib/content-moderation-pr2106-sync.test.ts`
- Create: `docs/agents/reports/2026-10-19-hotfix-pr2106-fix.md`

- [ ] 复核源两个共享片段及真实消费平台，Android/iOS 开通链接已覆盖，作为保护，不恢复已下线厂商页面。
- [ ] 仅在 Web 的 `<PlatformStructured platform="web">` 中、实现步骤之前补缺少的 source 前置条件：

```md
## 前提条件

开始前，请先按照[开通服务](/zh-CN/realtime-media/content-moderation/enable-service)中的步骤完成内容审核服务开通，并准备接收审核结果回调的业务服务器。
```

- [ ] 先用 Web 平台作用域检查 RED，补齐后 GREEN；Android/iOS 本文全部内容保持原样、Web 实现步骤/原业务服务器提示保留；不要把声明放到其他平台或仅全页搜链接。
- [ ] 检查开通目标文件实际存在，不改音频页/enable-service/配置页；完成通用门禁和独立记录。
