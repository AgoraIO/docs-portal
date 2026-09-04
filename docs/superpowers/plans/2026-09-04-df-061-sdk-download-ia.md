# DF-061 SDK Download IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将中文 SDK 下载页改为复用 API 参考能力分组的产品 Accordion，并统一筛选、平台选择和版本详情交互。

**Architecture:** 保留 SDK 下载数据为事实源；新增纯逻辑模块把 SDK 产品 ID 映射到 API_REFERENCE_CAPABILITY_GROUPS。SdksCatalog 负责 URL 筛选与能力组渲染，ProductCard 负责原生 details/summary、平台下拉和版本操作。

**Tech Stack:** TypeScript, React 19, Tailwind utility classes, native details/summary and select, Vitest, Testing Library, agent-browser.

---

## 文件结构

- Create: src/components/docs-overview/sdk-download-capabilities.ts — 能力组映射和纯分组函数。
- Test: src/components/docs-overview/sdk-download-capabilities.test.ts — 顺序、映射、空组测试。
- Modify: src/components/docs-overview/SdksCatalog.tsx — 筛选、能力组、Accordion、平台下拉、版本详情。
- Modify: src/components/docs-overview/SdksCatalog.test.tsx — 组件行为测试。
- Modify: src/components/docs-overview/sdk-download-products.ts — 只在确实缺少中文展示文案时补充文案。

### Task 1: 建立能力分组纯逻辑

**Files:**

- Create: src/components/docs-overview/sdk-download-capabilities.ts
- Test: src/components/docs-overview/sdk-download-capabilities.test.ts

- [ ] **Step 1: 编写失败测试。**

使用包含 video-sdk-android、voice-sdk-android、fastboard-sdk-android 和 agents-sdk-android 的小型 SdkDownloadPlatform 数据。断言 buildSdkCapabilityGroups 输出的 ID 顺序为 conversational-ai、realtime-core、extensions-ecosystem；断言四个产品分别进入 agents、voice/video、fastboard 对应的组；只传入空平台时输出空数组。

- [ ] **Step 2: 运行测试确认失败。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/sdk-download-capabilities.test.ts
~~~

预期：因 sdk-download-capabilities 模块不存在而失败。

- [ ] **Step 3: 实现映射模块。**

导入 API_REFERENCE_CAPABILITY_GROUPS、SdkDownloadPlatform、SdkDownloadProduct 和 getSdkDownloadProductCatalogId。定义 SdkCapabilityGroup：

~~~ts
type SdkCapabilityGroup = {
  id: (typeof API_REFERENCE_CAPABILITY_GROUPS)[number]['id'];
  label: string;
  products: SdkCapabilityProduct[];
};

type SdkCapabilityProduct = {
  info: string;
  label: string;
  platforms: SdkDownloadPlatform[];
  productId: string;
};
~~~

定义映射：

~~~ts
const SDK_PRODUCT_CAPABILITY = {
  agents: 'conversational-ai',
  voice: 'realtime-core',
  video: 'realtime-core',
  signaling: 'realtime-core',
  chat: 'realtime-core',
  meeting: 'meeting-collaboration',
  whiteboard: 'extensions-ecosystem',
  fastboard: 'extensions-ecosystem',
  'mediaplayer-kit': 'extensions-ecosystem',
  'server-gateway': 'extensions-ecosystem',
  'on-premise-recording': 'extensions-ecosystem',
  'flexible-classroom': 'education',
  'cloud-scene': 'education',
  proctor: 'education',
  iot: 'smart-hardware',
} as const;
~~~

遍历每个平台的 core 和 addOns，按 catalog product ID 聚合产品平台；同一产品的平台按 platform.id 去重。最后按 API_REFERENCE_CAPABILITY_GROUPS 顺序返回非空组，使用 API 参考组的 id 和 label，保留产品首次出现顺序。

- [ ] **Step 4: 运行测试并提交。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/sdk-download-capabilities.test.ts
git add src/components/docs-overview/sdk-download-capabilities.ts src/components/docs-overview/sdk-download-capabilities.test.ts
git commit -m "feat: align SDK groups with API reference capabilities"
~~~

预期：3 个纯逻辑测试通过。

### Task 2: 渲染能力组和产品 Accordion

**Files:**

- Modify: src/components/docs-overview/SdksCatalog.tsx
- Modify: src/components/docs-overview/SdksCatalog.test.tsx

- [ ] **Step 1: 编写失败组件测试。**

新增测试，断言中文页面显示“对话式 AI 引擎”“实时互动基础能力”“扩展能力与生态”“教育”“智能硬件”，不显示“监控与分析”；断言“实时互动基础能力”组中只有“语音 SDK”对应的 details 默认 open，“视频 SDK”闭合。

- [ ] **Step 2: 运行组件测试确认失败。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx
~~~

预期：当前实现没有能力组标题和 details 元素，新增断言失败。

- [ ] **Step 3: 接入能力组数据。**

在 SdksCatalog 中用 useMemo 调用 buildSdkCapabilityGroups。对现有 product/platform/version 过滤后的产品建立 productId 集合，再过滤每个能力组的 products；产品为空的能力组不渲染。使用能力组标题、产品数量和一组带 border/divide 的产品条目。

保持现有 ProductGroup 的合并版本逻辑，不复制 SDK 版本数据。若纯分组模块只提供平台聚合，则在 SdksCatalog 中通过 productId 映射回已合并 ProductGroup。

- [ ] **Step 4: 改造 ProductCard 外壳。**

增加 defaultOpen 属性；将 article 外壳改为原生 details/summary，保留 data-sdk-download-product-id 和现有 SDK 锚点。summary 只放箭头、产品图标、产品名、简短说明、平台数量，不能放 select、button 或 link。详情 body 放现有安装工具、版本、命令、下载和包管理器内容。

每个能力组调用 ProductCard 时传入 defaultOpen 为该组产品索引是否为 0。details 内容必须直接渲染在 DOM 中，不能懒加载。

- [ ] **Step 5: 运行测试并提交。**

focused component test 中能力组和默认折叠断言通过后提交：

~~~bash
git add src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx
git commit -m "feat: group SDK downloads by capability"
~~~

### Task 3: 增加顶部筛选并统一平台下拉

**Files:**

- Modify: src/components/docs-overview/SdksCatalog.tsx
- Modify: src/components/docs-overview/SdksCatalog.test.tsx

- [ ] **Step 1: 编写失败测试。**

断言完整中文 catalog 有名为“产品”和“平台”的顶部 combobox；页面不再有 role=tablist；每个产品有名为“产品名 平台”的 combobox。把已有点击平台 tab 的测试改成对产品内部 select 使用 fireEvent.change。

- [ ] **Step 2: 运行 focused test 确认失败。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx
~~~

预期：顶部筛选不存在，平台 tablist 仍存在。

- [ ] **Step 3: 实现顶部筛选 URL 同步。**

从现有 productFilters 生成产品选项，从当前 locale 数据生成去重的平台 id/label 选项。只在非 embedded catalog 渲染两个 label/select；嵌入式产品卡片不渲染全局筛选器。

实现 updateSdkCatalogSearch，读取 window.location.search，选择 all 时删除 product/platform 参数，否则写入选定值；保留其它参数和 hash；调用 history.replaceState 并派发现有 LOCATION_CHANGE_EVENT。select 值使用 queryFilters 的 productId/platformId，空值回退 all。

- [ ] **Step 4: 替换所有平台 tablist。**

ProductCard 内使用原生 select，label 文案为产品名加“平台”，选项为 group.platforms 的真实 platformLabel，value 为 platformId。保留 initialPlatformId 预选逻辑；切换平台时 setPlatformId 并把 versionIndex 重置为 0。所有产品包括单平台产品都使用同一交互。

- [ ] **Step 5: 运行测试并提交。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx
git add src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx
git commit -m "feat: use select controls for SDK filters and platforms"
~~~

预期：focused catalog tests 通过，不再出现平台 tablist。

### Task 4: 统一版本详情并保护边界行为

**Files:**

- Modify: src/components/docs-overview/SdksCatalog.tsx
- Modify: src/components/docs-overview/SdksCatalog.test.tsx

- [ ] **Step 1: 编写失败测试。**

断言视频 SDK 版本选项仍为“v4.6.3 完整版 - 最新”和“v4.6.3 轻量版 - 最新”；语音 SDK 展示“版本详情”、发布日期、包名和 MD5。

- [ ] **Step 2: 运行测试确认元数据标签失败。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx
~~~

预期：当前没有“版本详情”标签。

- [ ] **Step 3: 添加版本详情 disclosure。**

新增 hasVersionMetadata(version)，当 releaseDate、packageName 或 md5 任一存在时返回 true。将 VersionMetadata 包在原生 details 中：

~~~tsx
{hasVersionMetadata(activeVersion) ? (
  <details className="mt-4 border-border border-t pt-3">
    <summary className="cursor-pointer text-xs font-medium text-foreground">
      版本详情
    </summary>
    <VersionMetadata copy={copy} version={activeVersion} />
  </details>
) : null}
~~~

details 关闭时仍保留 VersionMetadata 在 SSR DOM 中。

- [ ] **Step 4: 保持下载和空数据行为。**

继续由 deriveInstallCommand 控制命令和复制按钮，由 downloadLink 控制下载链接，由 packageManager 控制包管理器链接。没有版本数据时不渲染空 body；没有链接时不创建伪链接；ScrollableInstallCommand 继续保留局部横向滚动、accessible label、overflow cue 和键盘焦点。

- [ ] **Step 5: 运行 focused tests、Biome 并提交。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-download-capabilities.test.ts
/Users/yejiayi/.bun/bin/bun x biome check src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-download-capabilities.ts src/components/docs-overview/sdk-download-capabilities.test.ts
git add src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx
git commit -m "feat: organize SDK version details"
~~~

预期：focused tests 全部通过，Biome 退出码为 0。

### Task 5: 全量验证和可视化预览

**Files:**

- Verify: src/components/docs-overview/SdksCatalog.tsx
- Verify: src/components/docs-overview/SdksCatalog.test.tsx
- Verify: src/components/docs-overview/sdk-download-capabilities.ts

- [ ] **Step 1: 运行相关回归测试。**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-download-capabilities.test.ts src/components/docs-shell/SdkDownloadProductNav.test.tsx src/components/docs-shell/DocsSidebar.reference-navigation.test.tsx
~~~

预期：选定文件中的测试全部通过；不修改无关 fixture。

- [ ] **Step 2: 运行类型检查和变更文件 lint。**

~~~bash
/Users/yejiayi/.bun/bin/bun run types:check
/Users/yejiayi/.bun/bin/bun x biome check src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-download-capabilities.ts src/components/docs-overview/sdk-download-capabilities.test.ts
~~~

预期：两条命令退出码均为 0；若出现基线已知失败，记录准确测试名称和输出。

- [ ] **Step 3: 验证桌面端。**

以 VITE_DOCS_REGION=cn 启动开发服务器，打开 /zh-CN/reference/sdks，视口设为 1440 × 900。检查 API 能力组的实际顺序、空组隐藏、每组首个展开、顶部筛选、全部产品平台 select、下载/包管理器/复制/版本详情入口和页面无横向溢出。

- [ ] **Step 4: 验证移动端。**

视口设为 390 × 844。检查 summary 和 select 无裁切；展开产品后内容和元数据可见；切换平台更新命令并重置版本；长命令只在自身容器内滚动；键盘焦点可见；控制台没有 SDK catalog 相关错误或警告。

- [ ] **Step 5: 审核最终 diff。**

~~~bash
git diff --check
git status --short --branch
git diff --stat codex/cn-newdoc-html-api-migration...HEAD
~~~

预期：只修改计划中的 SDK 组件、测试、能力模块和设计/计划文档，不提交无关生成文件。
