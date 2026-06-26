import { execFileSync } from 'node:child_process';

const repo = 'AgoraIO/docs-portal';

const issues = [
  {
    title:
      'Fix broken Voice Agent app CTA links / 修复 Voice Agent 应用路径入口坏链',
    labels: ['bug', 'P0', 'documentation'],
    body: `## What to build / 要构建什么

Fix stale English docs links that still point to \`/en/ai/apps/...\`, or add backwards-compatible redirects for those paths.

修复英文文档中仍指向 \`/en/ai/apps/...\` 的旧链接，或为这些旧路径增加兼容重定向。

Known examples / 已知示例:
- \`/en/ai\`: "In apps quickstart" currently points to \`/en/ai/apps/get-started/quickstart\` and returns 404.
- \`/en/introduction/conversational-ai\`: quickstart/reference links use stale \`/en/ai/apps/...\` paths.

Expected working paths / 预期可用路径:
- \`/en/ai/get-started/quickstart\`
- \`/en/ai/reference/openai-realtime-integration\` or the current equivalent page

## Acceptance criteria / 验收标准

- [ ] Clicking "In apps quickstart" on \`/en/ai\` opens a 200 page.
- [ ] Visible Voice Agent app links on \`/en/introduction\` and \`/en/introduction/conversational-ai\` do not return 404.
- [ ] Add or update link coverage for these visible English entry links.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Fix broken Analytics API reference card link / 修复 Analytics API Reference 卡片坏链',
    labels: ['bug', 'P0', 'documentation'],
    body: `## What to build / 要构建什么

Fix the Analytics card on the English Reference overview so it links to the actual in-portal Analytics API reference.

修复英文 Reference overview 中 Analytics 卡片的链接，使其跳转到真实存在的 Analytics API reference 页面。

Known broken path / 已知坏链:
- \`/en/api-reference/api-ref/analytics-rest-api\` returns 404.

Likely working path / 可能正确路径:
- \`/en/api-reference/api-ref/agora-analytics/analytics-rest-api\`

## Acceptance criteria / 验收标准

- [ ] Clicking the Analytics card on \`/en/api-reference\` opens a 200 page.
- [ ] The card target matches the page exposed from the API reference catalog.
- [ ] Add or update coverage so visible overview-card links fail CI if they 404.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Make docs search work in dev and preview / 让文档搜索在 dev 和 preview 可用',
    labels: ['bug', 'P0', 'enhancement'],
    body: `## What to build / 要构建什么

Ensure the docs search dialog can search English pages in local dev and preview. Today the local dev server can return 404 for \`/__static/docs-search/en.json\`, causing the dialog to show "No matching pages found" for real queries such as "cloud recording start".

确保文档搜索弹窗在本地 dev 和 preview 环境中能搜索英文页面。目前本地 dev server 可能对 \`/__static/docs-search/en.json\` 返回 404，导致搜索真实关键词时只显示 "No matching pages found"。

## Acceptance criteria / 验收标准

- [ ] In local dev or preview, searching "cloud recording start" returns Cloud Recording results.
- [ ] Searching "voice agent quickstart" returns the Voice Agent quickstart.
- [ ] If the static index is missing, the UI does not silently imply that no matching docs exist.
- [ ] Add a test or documented check covering the missing-index fallback or generation path.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Improve mobile docs navigation spacing and active hierarchy / 优化移动端文档导航间距和当前状态层级',
    labels: ['enhancement', 'P1'],
    body: `## What to build / 要构建什么

Improve the mobile docs navigation sheet so the "Tabs" and "Pages" group labels, active top tab, and active sidebar page do not visually collide around narrow widths.

优化移动端文档导航抽屉，使 "Tabs"、"Pages" 分组标签、当前顶层 tab 和当前页面高亮在窄屏下不会视觉拥挤或重叠。

Observed case / 观察到的场景:
- Viewport: 390px wide.
- Page: \`/en/api-reference/api-ref/cloud-recording/acquire\`.
- Opening the mobile menu shows cramped/overlapping visual hierarchy around "Tabs", "Pages", "Reference", and "API Reference".

## Acceptance criteria / 验收标准

- [ ] At 390px width, "Tabs" and "Pages" labels have clear spacing from the items they label.
- [ ] The active top-level tab and active current page are both visually clear.
- [ ] The mobile menu has no horizontal overflow.
- [ ] Keyboard focus and active styles remain distinguishable.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Use specific H1 titles for English overview pages / 为英文概览页使用更具体的 H1 标题',
    labels: ['documentation', 'P1'],
    body: `## What to build / 要构建什么

Replace generic H1 titles like "Overview" on English top-level overview pages with page-specific titles that help users orient through breadcrumbs, browser history, and search.

将英文顶层概览页中泛泛的 H1 标题（如 "Overview"）替换为更具体的页面标题，帮助用户通过面包屑、浏览器历史和搜索结果理解当前位置。

Candidate pages / 候选页面:
- \`/en/ai\`: "Voice Agent overview"
- \`/en/realtime-media/overview\`: "Realtime Media overview"
- \`/en/solutions\`: "Solutions overview"
- \`/en/api-reference\`: "Reference overview"

## Acceptance criteria / 验收标准

- [ ] Top-level English overview pages no longer rely only on the H1 "Overview".
- [ ] Breadcrumb and page header still read naturally.
- [ ] Search results or copy-page metadata remain coherent after title updates.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Add accessible names to API reference catalog filters / 为 API Reference 目录筛选控件添加可访问名称',
    labels: ['bug', 'P1', 'enhancement'],
    body: `## What to build / 要构建什么

Ensure every focusable filter/search input in the API reference catalog has an accessible name.

确保 API Reference catalog 中所有可聚焦的筛选/搜索输入都有可访问名称。

Observed page / 观察页面:
- \`/en/api-reference/api-ref\`

## Acceptance criteria / 验收标准

- [ ] Every visible input in the catalog has a label, \`aria-label\`, \`aria-labelledby\`, or meaningful placeholder.
- [ ] Keyboard users can still tab through filters in a logical order.
- [ ] Existing product/platform/reference type filtering behavior does not regress.
- [ ] Add a component-level accessibility test if practical.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Fix Voice Calling page copy that references Video SDK / 修复 Voice Calling 页面误写 Video SDK 的文案',
    labels: ['bug', 'P1', 'documentation'],
    body: `## What to build / 要构建什么

Fix the English Voice Calling product overview copy so the quickstart description references Voice SDK, not Video SDK.

修复英文 Voice Calling 产品概览页文案，使 quickstart 描述指向 Voice SDK，而不是 Video SDK。

Observed page / 观察页面:
- \`/en/realtime-media/voice\`
- The "Start building with" section says: "SDK quickstart - Customize your experience from the start with our flexible Video SDK."

## Acceptance criteria / 验收标准

- [ ] The Voice Calling page no longer describes the Voice quickstart as a Video SDK quickstart.
- [ ] The "Start building with" list uses product-consistent labels and descriptions.
- [ ] The linked quickstart still resolves successfully.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Add a clear platform selector entry to Voice quickstart / 在 Voice quickstart 增加清晰的平台入口',
    labels: ['enhancement', 'P2', 'documentation'],
    body: `## What to build / 要构建什么

Make the Voice Calling quickstart clearly communicate which platform the reader is viewing and how to switch to other platform quickstarts.

让 Voice Calling quickstart 清楚说明当前正在阅读哪个平台的文档，并提供切换到其他平台 quickstart 的入口。

Observed page / 观察页面:
- \`/en/realtime-media/voice/quickstart\`
- The content is Android-first, but the page title is generic "Quickstart".

## Acceptance criteria / 验收标准

- [ ] The first screen makes it clear when the current quickstart is Android.
- [ ] Users can find iOS/Web/other platform quickstart paths, if available.
- [ ] The platform entry does not overwhelm the mobile first screen.
- [ ] If product/design wording needs confirmation, note the proposed copy in the PR.

## Blocked by / 阻塞关系

May need human review for final wording and platform taxonomy. / 最终文案和平台分类可能需要人工确认。`,
  },
  {
    title:
      'Improve mobile affordance for wide OpenAPI code blocks / 优化移动端 OpenAPI 宽代码块的可滚动提示',
    labels: ['enhancement', 'P2'],
    body: `## What to build / 要构建什么

Improve the mobile presentation of wide OpenAPI code examples so users can tell the block scrolls horizontally without causing whole-page overflow.

优化移动端 OpenAPI 宽代码示例的展示，让用户能明显感知代码块可横向滚动，同时避免整页横向溢出。

Observed page / 观察页面:
- \`/en/api-reference/api-ref/cloud-recording/acquire\`
- At 390px width, the page itself does not overflow, but curl examples are much wider than the viewport inside the code block.

## Acceptance criteria / 验收标准

- [ ] At 390px width, OpenAPI endpoint pages have no document-level horizontal overflow.
- [ ] Wide code blocks have a visible horizontal scroll affordance, such as edge shadow, scroll hint, or clearer overflow treatment.
- [ ] Copy controls remain usable on mobile.
- [ ] Existing desktop code block layout does not regress.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
  {
    title:
      'Add link-check coverage for visible English overview cards / 为英文概览页可见卡片增加链接检查',
    labels: ['enhancement', 'P1', 'documentation'],
    body: `## What to build / 要构建什么

Add automated coverage for visible English overview-card and toolkit links so stale internal links fail before release.

为英文概览页中可见卡片和 toolkit 链接增加自动化检查，避免内部链接失效后才在页面中暴露。

Candidate pages / 候选页面:
- \`/en/introduction\`
- \`/en/ai\`
- \`/en/realtime-media/overview\`
- \`/en/solutions\`
- \`/en/api-reference\`

## Acceptance criteria / 验收标准

- [ ] Visible internal links on the listed overview pages are checked.
- [ ] 404 links fail the test or CI check.
- [ ] The checker understands in-portal OpenAPI virtual routes.
- [ ] The checker avoids false negatives for external links and intentionally hosted references.

## Blocked by / 阻塞关系

None - can start immediately. / 无，可直接开始。`,
  },
];

for (const issue of issues) {
  const args = [
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    issue.title,
    '--body',
    issue.body,
  ];

  for (const label of issue.labels) {
    args.push('--label', label);
  }

  const output = execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  console.log(`${issue.title}\n${output}\n`);
}
