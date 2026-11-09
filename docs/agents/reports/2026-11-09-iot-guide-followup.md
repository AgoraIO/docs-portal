# IoT 指南渲染回归与冲突处理

日期：2026-11-09。PR #1402，分支 `codex/iot-compatibility-followup`。

## 当前范围

`main` 已通过 PR #1405 合入 IoT 互通指南重定向、历史锚点、迁移映射及兼容性源回归。本分支已合并 `main` 的 `57a1420dd`，保留它的完整实现，不重复添加同类规则和测试。

本 PR 相对当前 main 只保留两项渲染回归及本记录：

- 将认证页渲染回归切换到现行 `authenticate-and-secure-channels/authentication-workflow` 路径，验证现有 C 示例；不再要求已主动移除的 Java/Kotlin 标签页。
- 通过真实 MDX 渲染验证 4 个历史兼容性小节锚点仍存在。

认证页与初始基线 `553dbe7f8`、合入的 main 均逐字一致；没有添加 SDK scope 或 Android 迁移提示。没有修改 SDK 声明、参数或兼容性值。

## 冲突与验证

- 冲突涉及互通指南锚点、`docs-moved-redirects.ts`、`vercel.base.json`、`vercel.json`。保留 main 的规则和锚点形式，从已合并输入重新生成部署配置；Git 无未合并条目或冲突标记。
- IoT 相关定向回归：8 项通过。
- `bun run types:check`、`bun run legacy-redirects:check`、涉及测试文件的 Biome、diff whitespace：通过。
- 本次完整测试：1966 通过、13 失败。其中 10 项属于此前已在未修改基线中复现的内容/旧链接问题；另 3 项为搜索组件超时。单独复验整个 `DocsSearchDialog.test.tsx`，39 项全部通过。完整测试不声明为全绿，未修改这些无关断言。
- 未运行生产构建或新一轮浏览器验收；当前相对 main 无产品页面或运行时代码变化。

日志保存在忽略的 `.agent/artifacts/iot-followup/conflicts/`。本次未执行部署。
