# 中文 API 参考 Sidebar 信息架构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/zh-CN/api-reference/api` 的旧站三组 sidebar 改为已确认的十组两层目录，并让 sidebar、产品卡片和筛选项使用一致的新站产品名称。

**Architecture:** 保留现有 `API_REFERENCE_CAPABILITY_GROUPS` 作为 sidebar 与正文卡片排序的单一显式数据源，只替换分组 ID、标题和产品顺序。产品显示名从 API Center 导航生成器产生，不能只手改生成的 JSON；先修生成器规范化映射，再重新生成目录数据。现有滚动定位、筛选、锚点和卡片渲染逻辑保持不变。

**Tech Stack:** TypeScript、React、Fumadocs、Lucide React、Vitest、Testing Library、Bun

---

## 执行位置与基线

所有命令都在以下 worktree 中执行：

```bash
cd /Users/yejiayi/.codex/worktrees/docs-portal/cn-newdoc-html-api-migration
export PATH="/Users/yejiayi/.bun/bin:$PATH"
git branch --show-current
git status --short
```

预期：

- 当前分支为 `codex/cn-newdoc-html-api-migration`。
- `git status --short` 无输出。
- 已包含设计提交 `7d665a74c`。
- 不要切换或修改 `/Users/yejiayi/Documents/docs-portal` 中的另一个脏工作区。

## 文件职责

- `scripts/lib/api-center/navigation-runner.mjs`：API Center 产品规范名、产品 ID、图标和 API 类型生成规则的源文件。
- `scripts/api-center-navigation-runner.test.ts`：保护生成器对当前中文产品名的规范化行为。
- `src/lib/api-reference-cards-data.zh-cn.json`：生成的 API 产品目录数据；只能通过生成器更新。
- `src/lib/api-reference-navigation.ts`：十个 sidebar 分类以及各分类内的产品 ID 顺序。
- `src/components/docs-shell/ApiReferenceProductNav.tsx`：分组图标和现有两层 sidebar 渲染。
- `src/components/docs-shell/ApiReferenceProductNav.test.tsx`：验证 sidebar 分类、产品归属、筛选隐藏和锚点行为。
- `src/components/docs-overview/ApiReferenceCards.test.tsx`：验证新产品名称在卡片、链接和筛选中的一致性。
- `src/lib/api-center-scoped-sidebar.test.ts`：保护普通“API 参考”侧栏不泄漏产品目录。
- `docs/migration/api-center-navigation-*`：运行生成器时可能同步更新的生成报告和校验数据。

### Task 1: 统一 API 目录的产品显示名

**Files:**

- Modify: `scripts/api-center-navigation-runner.test.ts:61-131`
- Modify: `scripts/lib/api-center/navigation-runner.mjs:77-137`
- Modify: `scripts/lib/api-center/navigation-runner.mjs:1450-1483`
- Modify: `src/components/docs-overview/ApiReferenceCards.test.tsx:72-191`
- Modify: `src/components/docs-shell/ApiReferenceProductNav.test.tsx:56-113`
- Modify: `src/lib/api-center-scoped-sidebar.test.ts:74-92`
- Generate: `src/lib/api-reference-cards-data.zh-cn.json`
- Generate if changed: `docs/migration/api-center-navigation-generated-files.json`
- Generate if changed: `docs/migration/api-center-navigation-parity.json`
- Generate if changed: `docs/migration/api-center-navigation-parity.md`
- Generate if changed: `docs/migration/api-center-navigation-report.json`
- Generate if changed: `docs/migration/api-center-navigation-report.md`

- [ ] **Step 1: 为生成器写一个当前产品规范名测试**

在 `scripts/api-center-navigation-runner.test.ts` 的外部 IM 目录测试之后加入：

```ts
  it('keeps current Chinese product names in generated catalog data', () => {
    const entries = [
      {
        product: '对话式 AI 引擎',
        apiGroup: 'server',
        label: 'agent-go',
        targetRoute: '/zh-CN/api-reference/conversational-ai/agent-go',
        urlFamily: 'api-ref',
      },
      {
        product: '微呼叫',
        apiGroup: 'server',
        label: 'RESTful API',
        targetRoute: '/zh-CN/api-reference/api-ref/voip-callkit',
        urlFamily: 'api-ref',
      },
      {
        product: '灵动会议',
        apiGroup: 'client',
        label: 'Android',
        targetRoute: '/zh-CN/api-reference/meeting/android',
        urlFamily: 'doc',
      },
      {
        product: '1v1 私密房',
        apiGroup: 'client',
        label: 'Android',
        targetRoute: '/zh-CN/api-reference/private-room/android/rtm/api/call-api',
        urlFamily: 'doc',
      },
    ];
    const groups = buildApiReferenceCatalogGroups([], [], entries, null);
    const catalog = buildApiReferenceCatalogData(groups);

    expect(
      catalog.all.map((entry: {
        apiType: string;
        product: string;
        productId: string;
      }) => ({
        apiType: entry.apiType,
        product: entry.product,
        productId: entry.productId,
      })),
    ).toEqual([
      {
        apiType: 'server-sdk',
        product: '对话式 AI 引擎',
        productId: 'conversational-ai',
      },
      {
        apiType: 'restful-api',
        product: '微呼叫',
        productId: 'voip-callkit',
      },
      {
        apiType: 'client-api',
        product: '智能云会议引擎',
        productId: 'meeting',
      },
      {
        apiType: 'client-api',
        product: '1v1 私密房',
        productId: 'private-room',
      },
    ]);
  });
```

- [ ] **Step 2: 更新产品目录消费者测试中的预期名称**

在 `src/components/docs-overview/ApiReferenceCards.test.tsx` 中做以下精确替换：

```text
heading name: '对话式 AI'                         → '对话式 AI 引擎'
/对话式 AI Android 客户端 SDK/i                  → /对话式 AI 引擎 Android 客户端 SDK/i
/对话式 AI Python Agent SDK 服务端 SDK/i          → /对话式 AI 引擎 Python Agent SDK 服务端 SDK/i
/对话式 AI RESTful API/i                          → /对话式 AI 引擎 RESTful API/i
```

不要修改子分区标题 `对话式 AI Toolkit`。在同一测试文件新增名称一致性断言：

```ts
    expect(screen.getByRole('option', { name: '对话式 AI 引擎' })).toBeVisible();
    expect(screen.getByRole('option', { name: '1v1 私密房' })).toBeVisible();
    expect(screen.queryByRole('option', { name: '对话式 AI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '私密房' })).not.toBeInTheDocument();
```

在 `src/components/docs-shell/ApiReferenceProductNav.test.tsx` 中把产品链接或正文卡片标题的 `对话式 AI` 改为 `对话式 AI 引擎`。在 `src/lib/api-center-scoped-sidebar.test.ts` 的禁止泄漏产品名数组中也把 `对话式 AI` 改为 `对话式 AI 引擎`。

- [ ] **Step 3: 运行测试，确认旧生成规则失败**

```bash
bun run test scripts/api-center-navigation-runner.test.ts src/components/docs-overview/ApiReferenceCards.test.tsx src/components/docs-shell/ApiReferenceProductNav.test.tsx src/lib/api-center-scoped-sidebar.test.ts
```

预期：FAIL。生成器测试会得到旧名称 `对话式 AI`、`VoIP 呼叫服务`、`会议`、`私密房`；组件测试仍会读到旧 JSON 名称。

- [ ] **Step 4: 更新 API Center 产品规范化源**

在 `scripts/lib/api-center/navigation-runner.mjs` 中把产品名称相关映射改为：

```js
const ROOT_PRODUCT_TITLES = new Map([
  ['对话式 AI', '对话式 AI 引擎'],
  ['微呼叫', '微呼叫'],
  ['VoIP 呼叫服务', '微呼叫'],
  ['会议', '智能云会议引擎'],
  ['灵动会议', '智能云会议引擎'],
  ['私密房', '1v1 私密房'],
  ['1v1 私密房', '1v1 私密房'],
]);
```

在 `buildApiReferenceCatalogGroups` 中将 `preservedGroups` 传入归并前先归一化旧生成数据，避免旧产品标题作为未消费分组再次保留：

```js
  const normalizedPreservedGroups = preservedGroups.map((group) => ({
    ...group,
    title: rootProductTitle(group.title),
  }));
  return reconcileRootProductGroups(
    normalizedPreservedGroups,
    entries,
    apiReferenceRehome,
  ).filter(visibleRootProductGroup);
```

在 `ROOT_PRODUCT_ICONS` 中只替换以下键，图标值保持不变：

```js
  ['对话式 AI 引擎', 'Bot'],
  ['微呼叫', 'PhoneCall'],
  ['智能云会议引擎', 'Users'],
  ['1v1 私密房', 'Lock'],
```

在 `API_REFERENCE_CATALOG_PRODUCT_IDS` 中只替换以下键，产品 ID 保持不变：

```js
  ['对话式 AI 引擎', 'conversational-ai'],
  ['微呼叫', 'voip-callkit'],
  ['智能云会议引擎', 'meeting'],
  ['1v1 私密房', 'private-room'],
```

为兼容现有测试夹具和旧生成数据，在同一个 Map 中保留旧键 `对话式 AI`、`VoIP 呼叫服务`、`会议`、`私密房`，分别指向相同的产品 ID；这些旧键只用于读取兼容，不会写入重新生成的目录。

最后将 `catalogEntryLabelParts` 和 `catalogApiType` 中三个产品判断改为同时接受规范名和兼容旧名：

```js
  if (
    (product === '对话式 AI 引擎' || product === '对话式 AI') &&
    action.label.startsWith('agent-')
  ) {
```

```js
  if (
    (product === '对话式 AI 引擎' || product === '对话式 AI') &&
    action.route.includes('/restclient-')
  ) {
```

```js
    ((product === '对话式 AI 引擎' || product === '对话式 AI') &&
      !['Android', 'iOS', 'Web'].includes(platform))
```

- [ ] **Step 5: 运行生成器更新目录 JSON 和生成报告**

```bash
bun run api-center:navigation
git diff --name-only
```

预期：`src/lib/api-reference-cards-data.zh-cn.json` 中所有 `conversational-ai` 条目显示 `对话式 AI 引擎`，所有 `private-room` 条目显示 `1v1 私密房`；生成报告文件可以同步变化。除上方 **Files** 列出的生成器源、测试、目录 JSON 和生成报告外，不应出现其他文件。

用以下命令核对不存在旧目录名：

```bash
rg -n '"product": "(对话式 AI|私密房)"' src/lib/api-reference-cards-data.zh-cn.json
```

预期：无输出。

- [ ] **Step 6: 运行产品名称相关测试，确认通过**

```bash
bun run test scripts/api-center-navigation-runner.test.ts src/components/docs-overview/ApiReferenceCards.test.tsx src/components/docs-shell/ApiReferenceProductNav.test.tsx src/lib/api-center-scoped-sidebar.test.ts
```

预期：PASS。

- [ ] **Step 7: 提交产品名称统一修改**

```bash
git add scripts/lib/api-center/navigation-runner.mjs scripts/api-center-navigation-runner.test.ts src/lib/api-reference-cards-data.zh-cn.json src/components/docs-overview/ApiReferenceCards.test.tsx src/components/docs-shell/ApiReferenceProductNav.test.tsx src/lib/api-center-scoped-sidebar.test.ts docs/migration/api-center-navigation-generated-files.json docs/migration/api-center-navigation-parity.json docs/migration/api-center-navigation-parity.md docs/migration/api-center-navigation-report.json docs/migration/api-center-navigation-report.md
git commit -m "fix: align Chinese API product labels"
```

如果某个生成报告未变化，`git add` 会安全忽略该路径；提交前用 `git diff --cached --stat` 确认没有 `content/docs/**` 等无关文件。

### Task 2: 将 sidebar 改为十组两层分类

**Files:**

- Modify: `src/lib/api-reference-navigation.ts:7-59`
- Modify: `src/components/docs-shell/ApiReferenceProductNav.tsx:3-32`
- Modify: `src/components/docs-shell/ApiReferenceProductNav.test.tsx:21-113`

- [ ] **Step 1: 把旧三组渲染测试改成完整十组归属测试**

在 `src/components/docs-shell/ApiReferenceProductNav.test.tsx` 的 imports 后加入：

```ts
const expectedGroups = [
  ['对话式 AI 引擎', ['对话式 AI 引擎']],
  [
    '实时互动基础能力',
    ['实时互动 RTC', '实时消息 RTM', '即时通讯 IM', '媒体流加速 RTSA'],
  ],
  [
    '实时媒体处理',
    [
      '实时转录翻译',
      '云端录制',
      '本地服务端录制',
      '云端转码',
      '旁路推流',
      '输入在线媒体流',
      'RTMP 网关',
      '融合 CDN 直播',
    ],
  ],
  ['会议协作', ['智能云会议引擎']],
  ['监控与分析', ['水晶球']],
  ['扩展能力与生态', ['RTC 服务端 SDK', '互动白板']],
  ['社交娱乐', ['在线 K 歌房', '1v1 私密房']],
  [
    '教育',
    ['灵动课堂', '在线美术教学', '在线音乐教学', 'PPT 转码服务'],
  ],
  ['智能硬件', ['微呼叫', '平行操控']],
  ['平台管理', ['控制台']],
] as const;
```

用以下测试替换现有 `renders grouped products...` 测试：

```ts
  it('renders products under the current Chinese documentation categories', () => {
    render(<ApiReferenceProductNav />);

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });
    const scrollArea = screen.getByTestId('api-reference-product-scroll');
    const headings = within(navigation)
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(expectedGroups.map(([label]) => label));

    for (const [label, products] of expectedGroups) {
      const section = within(navigation)
        .getByRole('heading', { level: 2, name: label })
        .closest('section');

      expect(section).not.toBeNull();
      expect(
        within(section as HTMLElement)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(products);
    }

    expect(
      within(navigation).queryByRole('link', { name: '全部产品' }),
    ).not.toBeInTheDocument();
    expect(
      scrollArea.querySelector('[data-slot="scroll-area-scrollbar"]'),
    ).toBeInTheDocument();
  });
```

同时将筛选测试的最终断言改为：

```ts
    expect(
      within(navigation).queryByRole('heading', {
        name: '对话式 AI 引擎',
      }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).queryByRole('heading', {
        name: '实时媒体处理',
      }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).getByRole('heading', {
        name: '会议协作',
      }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('heading', {
        name: '教育',
      }),
    ).toBeVisible();
```

- [ ] **Step 2: 运行 sidebar 测试，确认旧三组数据失败**

```bash
bun run test src/components/docs-shell/ApiReferenceProductNav.test.tsx
```

预期：FAIL。实际标题仍为 `实时互动基础能力`、`实时互动扩展能力`、`场景化解决方案`，与十组预期不一致。

- [ ] **Step 3: 用最终目录替换 sidebar 分组数据**

将 `src/lib/api-reference-navigation.ts` 中的分组类型和 `API_REFERENCE_CAPABILITY_GROUPS` 替换为：

```ts
export type ApiReferenceCapabilityGroup = {
  id:
    | 'conversational-ai'
    | 'realtime-core'
    | 'media-processing'
    | 'meeting-collaboration'
    | 'monitoring-analytics'
    | 'extensions-ecosystem'
    | 'social-entertainment'
    | 'education'
    | 'smart-hardware'
    | 'platform-management';
  label: string;
  productIds: readonly string[];
};

export const API_REFERENCE_CAPABILITY_GROUPS: readonly ApiReferenceCapabilityGroup[] =
  [
    {
      id: 'conversational-ai',
      label: '对话式 AI 引擎',
      productIds: ['conversational-ai'],
    },
    {
      id: 'realtime-core',
      label: '实时互动基础能力',
      productIds: ['rtc', 'rtm', 'im', 'rtsa'],
    },
    {
      id: 'media-processing',
      label: '实时媒体处理',
      productIds: [
        'speech-to-text',
        'cloud-recording',
        'local-server-recording',
        'cloud-transcoding',
        'media-push',
        'media-pull',
        'rtmp-gateway',
        'fusion-cdn',
      ],
    },
    {
      id: 'meeting-collaboration',
      label: '会议协作',
      productIds: ['meeting'],
    },
    {
      id: 'monitoring-analytics',
      label: '监控与分析',
      productIds: ['analytics'],
    },
    {
      id: 'extensions-ecosystem',
      label: '扩展能力与生态',
      productIds: ['rtc-server-sdk', 'whiteboard'],
    },
    {
      id: 'social-entertainment',
      label: '社交娱乐',
      productIds: ['online-ktv', 'private-room'],
    },
    {
      id: 'education',
      label: '教育',
      productIds: [
        'flexible-classroom',
        'online-art-teaching',
        'online-music-teaching',
        'ppt-conversion-service',
      ],
    },
    {
      id: 'smart-hardware',
      label: '智能硬件',
      productIds: ['voip-callkit', 'teleoperation'],
    },
    {
      id: 'platform-management',
      label: '平台管理',
      productIds: ['console'],
    },
  ];
```

不要修改文件顶部的 selector 常量和底部的 `getApiReferenceProductSectionId`。

- [ ] **Step 4: 为十个分类配置图标**

将 `src/components/docs-shell/ApiReferenceProductNav.tsx` 顶部 Lucide imports 改为：

```ts
import {
  ActivityIcon,
  BriefcaseIcon,
  CpuIcon,
  GraduationCapIcon,
  type LucideIcon,
  PuzzleIcon,
  RadioIcon,
  SettingsIcon,
  SparklesIcon,
  WorkflowIcon,
  ZapIcon,
} from 'lucide-react';
```

将 `groupIconById` 改为：

```ts
const groupIconById: Record<
  (typeof API_REFERENCE_CAPABILITY_GROUPS)[number]['id'],
  LucideIcon
> = {
  'conversational-ai': ZapIcon,
  'realtime-core': RadioIcon,
  'media-processing': WorkflowIcon,
  'meeting-collaboration': BriefcaseIcon,
  'monitoring-analytics': ActivityIcon,
  'extensions-ecosystem': PuzzleIcon,
  'social-entertainment': SparklesIcon,
  education: GraduationCapIcon,
  'smart-hardware': CpuIcon,
  'platform-management': SettingsIcon,
};
```

不要修改 `ApiReferenceProductNav`、`ProductNavGroup`、锚点 href 或 active 样式。

- [ ] **Step 5: 运行 sidebar 与卡片测试，确认通过**

```bash
bun run test src/components/docs-shell/ApiReferenceProductNav.test.tsx src/components/docs-overview/ApiReferenceCards.test.tsx
```

预期：PASS。正文产品卡片顺序也会因为共享 `API_REFERENCE_CAPABILITY_GROUPS` 而同步改变。

- [ ] **Step 6: 提交 sidebar 分类修改**

```bash
git add src/lib/api-reference-navigation.ts src/components/docs-shell/ApiReferenceProductNav.tsx src/components/docs-shell/ApiReferenceProductNav.test.tsx
git diff --cached --check
git commit -m "feat: align Chinese API sidebar categories"
```

### Task 3: 完整验证与视觉验收

**Files:**

- Verify only; no planned source changes.

- [ ] **Step 1: 验证生成文件与生成器一致**

```bash
bun run api-center:navigation:check
```

预期：PASS，不报告目录或生成报告漂移。

- [ ] **Step 2: 运行相关测试和完整测试套件**

```bash
bun run test scripts/api-center-navigation-runner.test.ts src/components/docs-shell/ApiReferenceProductNav.test.tsx src/components/docs-overview/ApiReferenceCards.test.tsx src/lib/api-center-scoped-sidebar.test.ts
bun run test
```

预期：两条命令均 PASS。

- [ ] **Step 3: 运行 lint 和类型检查**

```bash
bun run lint
bun run types:check
```

预期：两条命令退出码均为 0。`types:check` 可以重新生成 Fumadocs 输出，但不应留下手工需要提交的路由文件修改。

- [ ] **Step 4: 启动本地站点进行桌面视觉验收**

```bash
bun run dev
```

打开 `http://localhost:3000/zh-CN/api-reference/api`，在桌面宽度完成以下检查：

1. sidebar 从“对话式 AI 引擎”开始，按设计中的十组顺序显示，以“平台管理 / 控制台”结束。
2. 每个产品只出现在一个分类中；不再出现“实时互动扩展能力”或“场景化解决方案”。
3. 滚动正文时，左侧 active 产品随可见产品变化并自动滚入 sidebar 可视区。
4. 选择 `Electron` 平台后，“对话式 AI 引擎”和“实时媒体处理”分类隐藏，“会议协作”和“教育”仍显示。
5. 产品卡片标题和移动端产品筛选显示“对话式 AI 引擎”“1v1 私密房”，不显示旧称“对话式 AI”“私密房”。

停止开发服务器后继续下一步。

- [ ] **Step 5: 确认提交和工作区状态**

```bash
git log -3 --oneline
git status --short
```

预期：最近提交包含：

```text
feat: align Chinese API sidebar categories
fix: align Chinese API product labels
docs: design Chinese API sidebar IA
```

`git status --short` 无输出。如果验证命令产生了未提交文件，先确认它们确实属于本计划；不要提交与本次 sidebar 无关的生成内容。
