# SDK Overview Download Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让中文 SDK 总览卡片展开后复用产品下载页的详细下载卡片，同时保留平台选择和下载页入口。

**Architecture:** 保留 `SdksCatalog` 的产品 Accordion 和平台状态；新增集中式中文下载页路由映射。总览卡片展开后使用现有 `SdkDownloadCard` 渲染当前平台的最新版本及最新变体，旧的集成命令区域只继续服务英文卡片。

**Tech Stack:** React, TypeScript, Tailwind utility classes, Vitest, Testing Library, Fumadocs MDX components.

---

### Follow-up adjustment: 拆分对话式 AI 引擎 SDK

在执行原计划时，中文 SDK 数据确认“对话式 AI 引擎 SDK”只对应服务端 `Agora Agents SDK`。新增 `客户端组件 SDK` 产品，平台为 Android、iOS、Web，当前文档中的统一版本为 2.9.0；同步更新产品分组映射、中文产品文案、SDK 导航和组件测试。客户端组件没有独立下载页，因此继续使用总览卡片内的安装命令和包管理器入口。

### Task 1: 建立下载页路由映射

**Files:**

- Create: `src/components/docs-overview/sdk-download-page-links.ts`
- Test: `src/components/docs-overview/sdk-download-page-links.test.ts`

- [ ] **Step 1: 写失败测试**

覆盖 RTC 视频、RTM Linux、白板 Web、RTC 服务端通用页和没有独立下载页的 Agents：

```ts
expect(getZhCNSdkDownloadPageHref('video', 'android')).toBe(
  '/zh-CN/realtime-media/rtc/reference/downloads/android',
);
expect(getZhCNSdkDownloadPageHref('signaling', 'linux')).toBe(
  '/zh-CN/realtime-media/rtm/reference/downloads/linux-cpp',
);
expect(getZhCNSdkDownloadPageHref('whiteboard', 'web')).toBe(
  '/zh-CN/realtime-media/whiteboard/whiteboard-sdk/reference/downloads/web',
);
expect(getZhCNSdkDownloadPageHref('server-gateway', 'linux')).toBe(
  '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads',
);
expect(getZhCNSdkDownloadPageHref('agents', 'python')).toBeNull();
```

- [ ] **Step 2: 运行测试确认失败**

运行 `bun x vitest run src/components/docs-overview/sdk-download-page-links.test.ts`，预期因模块不存在而失败。

- [ ] **Step 3: 实现映射函数**

定义 `getZhCNSdkDownloadPageHref(productId: string, platformId: string): string | null`。映射 `video`、`voice` 到 RTC，`signaling` 到 RTM，`whiteboard` 和 `fastboard` 到对应白板产品，`flexible-classroom` 到灵动课堂；将 `linux` 转为 RTM 的 `linux-cpp`，将 `react-js` 转为 RTC 的 `react`，将 `unreal-engine` 转为 RTC 的 `unreal`。RTC 服务端和本地录制返回各自的通用下载页。没有已迁移独立下载页的产品返回 `null`。

- [ ] **Step 4: 运行测试并提交**

运行同一条 Vitest 命令，预期全部通过；提交 `git add src/components/docs-overview/sdk-download-page-links.ts src/components/docs-overview/sdk-download-page-links.test.ts && git commit -m "feat: map SDK download page links"`。

### Task 2: 让总览卡片复用详细下载卡片

**Files:**

- Modify: `src/components/docs-overview/SdksCatalog.tsx`
- Modify: `src/components/docs-overview/SdksCatalog.test.tsx`

- [ ] **Step 1: 写失败组件测试**

新增测试，渲染 `SdksCatalog locale="zh-CN"` 后展开视频卡片，断言：

```ts
const video = screen.getByRole('article', { name: '视频 SDK' });
fireEvent.click(video.querySelector('summary') as HTMLElement);
expect(within(video).getByRole('article', { name: 'Android Full' })).toBeVisible();
expect(within(video).getByRole('combobox', { name: '视频 SDK 平台' })).toHaveValue('android');
expect(within(video).getByRole('link', { name: '查看下载页 ↗' })).toHaveAttribute(
  'href',
  '/zh-CN/realtime-media/rtc/reference/downloads/android',
);
expect(within(video).queryByText("implementation 'cn.shengwang.rtc:full-sdk:4.6.3'")).not.toBeInTheDocument();
```

再切换平台到 iOS，断言出现 `iOS Full`，下载页链接更新为 `/zh-CN/realtime-media/rtc/reference/downloads/ios`。对 Agents 卡片断言没有“查看下载页”链接。

- [ ] **Step 2: 运行组件测试确认失败**

运行 `bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx`，预期新增断言失败，因为当前总览仍渲染命令区域且没有下载页链接。

- [ ] **Step 3: 接入下载页链接和详细卡片**

在 `ProductCard` 中导入 `getPlatformIconSrc`、`SdkDownloadCard` 和路由映射函数。摘要行只在 `redesigned` 且映射结果不为 `null` 时渲染链接，并在链接点击时调用 `stopPropagation`。详情区保留平台 `select`；当 `redesigned` 为真时，遍历 `getLatestVersions(activePlatform.product.versions)`，为每个版本渲染 `SdkDownloadCard`，使用当前平台图标和产品/版本变体标题。将旧 `InstallArea` 放到 `!redesigned` 分支，保证英文总览不变。对当前产品没有版本时不创建空卡片网格。

- [ ] **Step 4: 运行测试并修正**

运行 `bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/ProductSdkDownloads.test.tsx src/components/docs-overview/RtcSdkDownloads.test.tsx`，预期全部通过。若标题或平台路由与既有数据不一致，只调整映射/标题推导，不修改 SDK 事实数据。

- [ ] **Step 5: 提交组件改动**

运行 `bun x biome check src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-download-page-links.ts src/components/docs-overview/sdk-download-page-links.test.ts`，预期退出码为 0；提交 `git add src/components/docs-overview && git commit -m "feat: show download cards in SDK catalog"`。

### Task 3: 回归验证和浏览器检查

**Files:**

- Verify: `src/components/docs-overview/SdksCatalog.tsx`
- Verify: `src/components/docs-overview/sdk-download-page-links.ts`

- [ ] **Step 1: 运行相关回归测试**

运行 `bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-download-page-links.test.ts src/components/docs-overview/ProductSdkDownloads.test.tsx src/components/docs-overview/RtcSdkDownloads.test.tsx`，记录通过数量和失败数量。

- [ ] **Step 2: 运行类型检查和 whitespace 检查**

运行 `bun run types:check` 与 `git diff --check`；若类型检查触发仓库既有失败，记录具体输出，不把它归因于本改动。

- [ ] **Step 3: 浏览器检查中文总览页**

在 `1440 × 900` 和 `390 × 844` 视口打开 `/zh-CN/reference/sdks`，展开视频 SDK，确认平台下拉、Android Full/Lite 详细卡片、“查看下载页”链接和卡片局部布局；切换 iOS 后确认卡片和链接更新，页面没有级横向溢出。

- [ ] **Step 4: 审核最终差异**

运行 `git status --short --branch` 和 `git diff --stat codex/cn-newdoc-html-api-migration...HEAD`，确认正式改动只包含设计文档、下载页映射、总览组件和相关测试；原型文件不纳入正式改动。
