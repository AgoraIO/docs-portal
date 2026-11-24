# API Reference Historical Archives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 中文版 API Reference 仅 current 使用本站内容，其余 219 个历史版本选项跳转旧站归档；RTC React 两个系列不变。

**Architecture:** 平台 meta.json 是运行时版本配置的唯一来源。保留审计清单作为测试依据，外链由已有版本解析器透传；公共下拉对外域 href 渲染原生安全新标签页链接。导航生成器保留明确维护的版本配置，避免重复生成覆盖。

**Tech Stack:** Bun、TypeScript、Vitest、React、Radix/shadcn DropdownMenu、Fumadocs。

---

### Task 1: 外链版本下拉（独立子任务）

**Files:** `src/components/docs-shell/DocsSidebarHeaderBlock.tsx`、新建 `src/components/docs-shell/DocsSidebarHeaderBlock.test.tsx`。

- [x] 先新增 desktop/mobile 参数化测试，真实渲染下拉，键盘打开菜单并检查本站 current 不带 target、archive 项带 target/rel，点击后调用 onSelectPath，关闭菜单后 current 标签不变。给路由 Link mock 增加 data 属性来证明外链不经过站内路由。

```tsx
expect(archive).toHaveAttribute('target', '_blank');
expect(archive).toHaveAttribute('rel', 'noopener noreferrer');
expect(archive).not.toHaveAttribute('data-router-link');
expect(current).toHaveAttribute('aria-current', 'page');
```

- [x] 运行 `bun run test src/components/docs-shell/DocsSidebarHeaderBlock.test.tsx`，确认因外链仍走 Link 且无 target 而失败。
- [x] 保留现有 DropdownMenuItem asChild/Group 结构，外部 http(s) 链接渲染 `<a href={version.href} target="_blank" rel="noopener noreferrer">`；站内仍使用 Link。复用标签与选中图标，不修改 React 内容或公共 UI 基础组件。
- [x] 重跑该测试及 DocsShell/DocsSidebar 测试，通过后进行规格与质量审核。

### Task 2: 清单完整性与 43 个平台配置

**Files:** 保留 `docs/migration/api-reference-historical-archive-inventory-20261020.md` 快照；新建 `scripts/api-reference-historical-archives.test.ts`；修改对应 43 份 `content/docs/zh-CN/api-reference/**/meta.json`。

- [x] 将用户提供清单复制到本分支，不改原工作区版本。测试只读取完整逐平台清单区段，以归档 URL 的产品/平台字段建立对应关系；排除 rtc/react。
- [x] 新增逐平台测试，对比历史选项 `{label, href}`，并断言 43 平台、219 选项、214 URL，current 在首位且为站内配置，所有 id 唯一。

```ts
expect(actualHistory.map(({ label, href }) => ({ label, href })))
  .toEqual(expectedHistory);
expect(meta.navScope.versions[0].id).toBe('current');
expect(meta.navScope.versions.slice(1).every(v =>
  v.href.startsWith('https://doc-archive.shengwang.cn/archive/'))).toBe(true);
```

- [x] 运行 `bun run test scripts/api-reference-historical-archives.test.ts`，确认配置缺失或现有错误 URL 导致失败。
- [x] 按清单原样填入完整 href。既有 current 保留原有 path/href；无版本配置的 current 使用 `path: '.'`。保留既有 current 标签，新建项用清单 current 标签；本地录制 current 改为数字 SDK 版本标签。历史 id/path 使用 SDK 版本去掉 v，历史项总是带 archive href，按清单顺序。
- [x] Android v4.6.0 改为外链；本地录制移除 legacy 版本菜单配置，保留源页面、路由和 sidebarLabels；为恢复 Legacy 直接页侧栏，将父组改为引用真实 legacy 目录，新增独立无版本 scope 的 meta，以 `(current)/...` 引用物理页；macOS/C++ v4.6.2 使用 0.0.519。
- [x] 增加版本解析器回归测试，证明 flat platform current 与 grouped current 均能列出不存在本地目录的 archive 项，同时 current 不误选 archive。
- [x] 重跑清单、schema、nav-scope 测试。核对 diff 不涉及 React、英文或正文。

### Task 3: 保留手工维护版本配置

**Files:** `scripts/lib/api-center/navigation-runner.mjs`、`scripts/api-center-navigation-runner.test.ts`。

- [x] 检查生成器的元数据合并顺序，在已有测试 fixture 中注入包含 archive 的 navScope；调用生成器输出构建函数，断言手工版本列表与 defaultVersion 不被生成的 current-only 或空对象覆盖。
- [x] 运行 `bun run test scripts/api-center-navigation-runner.test.ts`，确认新增断言失败。
- [x] 在输出合并阶段保留存在历史归档的现有 navScope，其他导航字段继续按原逻辑生成，不改变没有 archive 的平台。

```js
const maintainedScope = existing.navScope?.versions?.some(version =>
  version.href?.startsWith('https://doc-archive.shengwang.cn/archive/'))
  ? existing.navScope : undefined;
```

- [x] 运行同组测试验证保留行为，明确生成器不是历史配置来源。

### Task 4: 整体验证与交接

- [x] 运行 `bun run test`、`bun run types:check`、针对改动文件运行 Biome、`git diff --check`。
- [x] 使用 agent-browser 在独立端口启动开发站点，核对 RTC Android、RTM、白板等桌面和移动菜单；检查较长列表可滚动、选项数和 archive href、新标签页及 React 页面不新增版本菜单。
- [x] 单独请求具有异常编号/平台改名的归档入口，记录状态与内容核验结果；无法确认可达性或内容版本时如实标注，不自动修正 URL。
- [x] 对全部改动进行规格、质量审核；修复确认的问题并重跑受影响测试。
- [x] 提交实现与验证记录，保留工作分支及工作树，不自动推送、开 PR 或合并。

### 已确认的 13 条 URL 覆盖修复

- [x] 读取用户提供的 JSON 覆盖与 16:06 调查复核记录；保留 master 原始清单及首轮失效证据。
- [x] 先扩展回归测试为“原清单 + 平台/SDK 精确覆盖”，确认 24 项预期失败；只替换 11 份 meta 中的 13 个 href 后，61 项聚焦测试通过。
- [x] 独立核对全部 13 项仅修改 href，不修改 SDK 标签、ID、path、current、React 或正文；219 个选项和 214 个 URL 保持不变。
- [x] 对全部 214 个当前菜单 URL 重跑 GET：HTTP 200、零重定向、零软 404；RTC Web 两项的 HTML 标题匹配目标 SDK。保留后续审计 JSON，区分 HTTP 复查与用户提供的 13 项浏览器版本核验。
- [x] 后台中文预览确认 RTC Web v4.24.1 和 v4.23.0 菜单使用新 href，未打断用户已有的 Android 预览。
- [x] 完成完整测试、类型检查、格式与 diff 校验后提交本地修复，不推送。默认并发首次有 2 项无关集成超时，降低并发后独立 130 项及完整 4-worker 测试通过（3142 passed / 2 skipped），没有放宽测试阈值。
