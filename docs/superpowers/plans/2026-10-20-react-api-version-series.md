# React API Contextual Version Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React SDK 页面显示 React SDK 版本；Web SDK API 及其后代显示 Web SDK 版本，侧栏和正文保持原样。

**Architecture:** React 根 meta 的 navScope.versions 为默认系列；新增 versionOverrides，以相对于同一 scope 的路径选择完整版本列表。路径匹配不创建新导航 scope，current 的 path 为 '.'，两套 current href 分别为各自本站概览。公共菜单组件直接使用既有 header.versionSwitcher，不新增客户端系列状态。

**Tech Stack:** TypeScript、Zod、Fumadocs page tree、Vitest、Bun、现有 React docs shell。

---

### Task 1: 通用路径版本覆盖（独立子任务）

**Files:** src/lib/docs-meta-schema.ts、docs-meta-schema.test.ts、docs-nav-scope.ts、docs-nav-scope.test.ts。

- [x] 先写 schema 与 resolver 失败测试，覆盖默认、Web 概览/接口/隐藏类型深链、边界不误匹配、最具体匹配、query/hash 不改系列、返回默认、没有 overrides 的旧行为。

```ts
expect(scope?.header.versionSwitcher?.versions[0].label).toBe('v4.22.0');
expect(scope?.header.versionSwitcher?.versions.map(v => v.label))
  .toEqual(['v4.22.0', 'v4.21.0']);
expect(scope?.scope.node).toBe(reactFolder);
expect(scope?.sidebarRoot).toBe(reactFolder);
```

- [x] 运行 `bun run test src/lib/docs-meta-schema.test.ts src/lib/docs-nav-scope.test.ts`，确认缺少覆盖能力导致失败。
- [x] 扩展 schema：versionOverrides 可选数组，元素为 `{path: string, versions: DocsNavScopeVersion[]}`；path 必须是非空相对路径，versions 非空。覆盖数组内的版本 ID 各自唯一；不同系列都可以有 current。

```ts
versionOverrides: z.array(z.object({
  path: z.string().min(1),
  versions: z.array(docsNavScopeVersionSchema).min(1),
})).optional()
```

- [x] resolver 根据 scope 下当前路径选择最长的匹配路径，匹配完整片段，不匹配 web-sdk-other。将选中列表同时用于 activeVersion 和 header 构建，current node 与 sidebarRoot 保持 React 根。不在 UI 上添加状态，不重构不相关 scope 逻辑。
- [x] 重跑上述测试及 DocsSidebarHeaderBlock.test.tsx，记录红绿结果并自审；独立规格和质量审核后合入本任务。

### Task 2: React 元数据与归档清单

**Files:** content/docs/zh-CN/api-reference/rtc/react-sdk/meta.json、scripts/api-reference-historical-archives.test.ts、src/lib/api-center-scoped-sidebar.test.ts。

- [x] 把先前的“React 暂不接入”断言改为清单驱动的两套系列断言。原 43 平台 219 项仍独立比对；新增 React 6 项和底层 Web 3 项逐条比对，不混入普通 RTC Web。
- [x] 真实页面测试沿用 #1245 的五个 React/Web 路由和完整侧栏检查，再覆盖 Hooks、类型定义及 Web globals；断言同一组侧栏不变、current 标签正确、history 列表为各自系列。

```ts
expect(payload.sidebarHeader?.versionSwitcher?.versions.map(v => v.label))
  .toEqual(route[0] === 'web-sdk'
    ? ['v4.22.0', 'v4.21.0', 'v4.20.0', 'v4.19.3']
    : ['v2.5.0', 'v2.4.0', 'v2.3.0', 'v2.2.0', 'v2.1.0', 'v2.0.0', 'v2.0.0-beta.0']);
```

- [x] 先运行新测试确认默认版本或 Web 列表缺失导致失败，然后只修改 React 根 navScope。保留 pages/sidebarLabels 和 web-sdk/meta.json 原样；不修改 MDX。

```json
{
  "defaultVersion": "current",
  "versions": [{"id":"current","label":"v2.5.0","path":".","href":"/zh-CN/api-reference/rtc/react-sdk/overview"}],
  "versionOverrides": [{
    "path":"web-sdk",
    "versions":[{"id":"current","label":"v4.22.0","path":".","href":"/zh-CN/api-reference/rtc/react-sdk/web-sdk/overview"}]
  }]
}
```

历史 9 项从 docs/migration/api-reference-historical-archive-inventory-20261020.md 的 React 表逐条导入上述各自数组，SDK id/path 为去掉首个 v 的标签，href 使用完整旧站入口。表内 React SDK current+历史总计 7 项，Web current+历史总计 4 项。

- [x] 对 9 个归档地址直接 GET，记录状态、最终 URL、标题与版本证据；不把单独的 HTTP 200 等同于内容版本正确。有疑点则定向调查，不静默换版。
- [x] 重跑清单测试及真实页面测试，确认 React→Web→接口→React 连续路径解析正确。

### Task 3: 生成器与完整验收

**Files:** scripts/api-center-navigation-runner.test.ts、docs/migration/react-api-version-series-validation-20261020.md。

- [x] 为已有 maintainedScopes fixture 加入 versionOverrides，验证导航重新生成及 check 都保留整个 navScope。既有实现如已通过，不新增无用生产逻辑。
- [x] `bun run test --maxWorkers=4`、`bun run types:check`、`bun run lint`、针对改动文件 Biome、`git diff --check`。
- [x] zh-CN 本地预览检查桌面/移动端系列切换、Web 深链刷新、浏览器前进后退、两套 current 与安全外链；截图仅在忽略目录 .agent/artifacts/。
- [x] 独立规格审核后再做质量审核，修复发现并复测。记录当前已知归档限制，不夸大内容验证范围。
- [x] 提交本地实现和验证记录，保留分支 codex/react-api-version-series；不自动推送、提 PR 或合并。
