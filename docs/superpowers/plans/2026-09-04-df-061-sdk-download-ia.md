# DF-061 SDK Download IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Reorganize the Chinese SDK download catalog according to the /zh-CN/api-reference/api capability groups, use product accordions, and replace every Chinese platform tab with a platform dropdown while preserving current download behavior.

**Architecture:** Keep the SDK data files as the facts source. Add one pure mapping module that consumes the shared API_REFERENCE_CAPABILITY_GROUPS order and maps the 15 SDK product IDs into capability groups. SdksCatalog applies its existing URL and version filters before rendering groups. The full Chinese catalog gets grouped accordions; English rendering remains unchanged, while Chinese embedded catalogs keep their compact product-specific shape and receive the same platform dropdown.

**Tech Stack:** React 19, TypeScript, Fumadocs MDX, Tailwind utility classes, Vitest, Testing Library, native details/summary/select, agent-browser.

---

## File map

- Create: src/components/docs-overview/sdk-download-capability-groups.ts — explicit SDK-product-to-capability mapping and pure grouping function.
- Create: src/components/docs-overview/sdk-download-capability-groups.test.ts — mapping order, product coverage, and empty-group tests.
- Modify: src/components/docs-overview/SdksCatalog.tsx — grouped Chinese catalog, product accordions, Chinese platform dropdown, version-details disclosure, and localized labels.
- Modify: src/components/docs-overview/SdksCatalog.test.tsx — capability-group, accordion, dropdown, metadata, and regression assertions.
- Reference only: src/lib/api-reference-navigation.ts — reuse API_REFERENCE_CAPABILITY_GROUPS; do not modify it.
- Reference only: content/docs/zh-CN/reference/sdks.mdx — the route already renders the catalog; no content edit is required.

### Task 1: Add capability-group mapping as pure logic

**Files:**
- Create: src/components/docs-overview/sdk-download-capability-groups.ts
- Test: src/components/docs-overview/sdk-download-capability-groups.test.ts

- [ ] **Step 1: Write the failing mapping tests.**

Use fake groups so the unit tests do not depend on the complete SDK dataset:

~~~ts
import { describe, expect, it } from 'vitest';
import {
  groupSdkDownloadProductsByCapability,
  SDK_DOWNLOAD_PRODUCTS_BY_CAPABILITY,
} from './sdk-download-capability-groups';

describe('SDK capability groups', () => {
  it('uses API-reference capability order and labels', () => {
    const groups = groupSdkDownloadProductsByCapability([
      { productId: 'video', label: '视频 SDK' },
      { productId: 'agents', label: '对话式 AI 引擎 SDK' },
      { productId: 'iot', label: '物联网 aPaaS SDK' },
      { productId: 'meeting', label: '智能云会议引擎 SDK' },
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      'conversational-ai',
      'realtime-core',
      'meeting-collaboration',
      'smart-hardware',
    ]);
  });

  it('keeps products in explicit mapping order', () => {
    const groups = groupSdkDownloadProductsByCapability([
      { productId: 'chat', label: '即时通讯 SDK' },
      { productId: 'video', label: '视频 SDK' },
      { productId: 'voice', label: '语音 SDK' },
      { productId: 'signaling', label: '实时消息 SDK' },
    ]);

    expect(groups[0].products.map((product) => product.productId)).toEqual([
      'voice',
      'video',
      'signaling',
      'chat',
    ]);
  });

  it('hides empty groups and unmapped products', () => {
    expect(
      groupSdkDownloadProductsByCapability([
        { productId: 'unknown', label: '未知 SDK' },
      ]),
    ).toEqual([]);
    expect(SDK_DOWNLOAD_PRODUCTS_BY_CAPABILITY['media-processing']).toEqual([]);
  });
});
~~~

- [ ] **Step 2: Run the focused test and verify it fails.**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/sdk-download-capability-groups.test.ts
~~~

Expected: module-resolution failure because the grouping module does not exist.

- [ ] **Step 3: Implement the mapping and grouping function.**

The module imports API_REFERENCE_CAPABILITY_GROUPS and defines this complete mapping:

~~~ts
export const SDK_DOWNLOAD_PRODUCTS_BY_CAPABILITY = {
  'conversational-ai': ['agents'],
  'realtime-core': ['voice', 'video', 'signaling', 'chat'],
  'media-processing': [],
  'meeting-collaboration': ['meeting'],
  'monitoring-analytics': [],
  'extensions-ecosystem': [
    'whiteboard',
    'fastboard',
    'mediaplayer-kit',
    'server-gateway',
    'on-premise-recording',
  ],
  'social-entertainment': [],
  education: ['flexible-classroom', 'cloud-scene', 'proctor'],
  'smart-hardware': ['iot'],
  'platform-management': [],
} as const;
~~~

Implement groupSdkDownloadProductsByCapability<T extends { productId: string }>(products). Build a productId map, iterate API_REFERENCE_CAPABILITY_GROUPS in order, look up the mapped SDK IDs in mapping order, discard missing products, and return only groups whose products array is non-empty. Return each group as { id, label, products }.

- [ ] **Step 4: Run the focused test and verify it passes.**

Run the same Vitest command. Expected: all mapping tests PASS.

- [ ] **Step 5: Commit the pure grouping unit.**

~~~bash
git add src/components/docs-overview/sdk-download-capability-groups.ts \
  src/components/docs-overview/sdk-download-capability-groups.test.ts
git commit -m "feat: group SDK downloads by API capability"
~~~

### Task 2: Add failing component assertions for the confirmed Chinese IA

**File:** src/components/docs-overview/SdksCatalog.test.tsx

- [ ] **Step 1: Replace the Chinese card-grid assertion.**

Replace the test named uses a responsive card grid for the full catalog with assertions that the Chinese catalog is single-column and contains these non-empty capability groups: 对话式 AI 引擎, 实时互动基础能力, 会议协作, 扩展能力与生态, 教育, 智能硬件. Assert that 实时媒体处理 is absent and that the catalog is not a grid with md:grid-cols-2.

- [ ] **Step 2: Add default-open accordion assertions.**

Add this focused behavior:

~~~ts
it('opens only the first product in each Chinese capability group', () => {
  render(<SdksCatalog locale="zh-CN" />);

  const group = screen.getByTestId(
    'sdk-capability-group-realtime-core',
  );
  const voice = within(group).getByRole('article', { name: '语音 SDK' });
  const video = within(group).getByRole('article', { name: '视频 SDK' });

  expect(voice.querySelector('details')).toHaveAttribute('open');
  expect(video.querySelector('details')).not.toHaveAttribute('open');

  fireEvent.click(video.querySelector('summary') as HTMLElement);
  expect(video.querySelector('details')).toHaveAttribute('open');
});
~~~

- [ ] **Step 3: Replace Chinese platform-tab assertions with dropdown assertions.**

For each Chinese test that currently calls getByRole('tab'), use:

~~~ts
const platformSelect = within(voiceCard).getByRole('combobox', {
  name: '语音 SDK 平台',
});
fireEvent.change(platformSelect, { target: { value: 'web' } });
expect(
  within(voiceCard).getByText('npm i agora-rtc-sdk-ng@4.24.6'),
).toBeVisible();
expect(within(voiceCard).queryByRole('tablist')).not.toBeInTheDocument();
~~~

Keep English platform-tab tests unchanged.

- [ ] **Step 4: Add version-details disclosure assertions.**

Add a Chinese test that finds the product-scoped details element named 版本详情, asserts it is initially closed, and asserts it contains 发布日期, 包名, and MD5.

- [ ] **Step 5: Run the focused component tests and verify new assertions fail.**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx
~~~

Expected: the new IA assertions FAIL against the current grid/tab implementation. Do not fix unrelated baseline failures.

### Task 3: Render API capability groups and product accordions

**File:** src/components/docs-overview/SdksCatalog.tsx

- [ ] **Step 1: Compute visible capability groups after existing filters.**

Import the grouping function and add this after visibleProductGroupsWithVersionFilter:

~~~ts
const visibleCapabilityGroups = useMemo(
  () =>
    groupSdkDownloadProductsByCapability(
      visibleProductGroupsWithVersionFilter,
    ),
  [visibleProductGroupsWithVersionFilter],
);
const usesCapabilityGroups = redesigned && !isEmbedded;
~~~

Do not alter existing product, platform, version-prefix normalization, or English filtering logic.

- [ ] **Step 2: Render grouped Chinese sections.**

For usesCapabilityGroups, render one single-column section per returned group. Each section needs:
- data-sdk-download-capability-group-id equal to the capability group id;
- an accessible level-2 heading using the shared group label;
- a product count;
- products in mapper order;
- ProductCard with defaultOpen set to true only for index 0.

Keep the existing direct product mapping for English and Chinese embedded catalogs. Use the existing data-sdk-download-catalog attribute.

- [ ] **Step 3: Add optional accordion rendering to ProductCard.**

Add defaultOpen?: boolean. Keep article as the anchor and accessibility boundary. When defaultOpen is defined, render a native details inside article, with the product summary in summary and the existing details body below it. When it is undefined, preserve the current direct article layout.

Extract ProductSummary and ProductDetails so the embedded path shares the same content implementation. The summary preserves icon, localized title and description, a disclosure affordance, and a compact platform/version summary. The detail body preserves all current download links, package-manager links, install commands, version selection, and metadata.

- [ ] **Step 4: Run focused tests.**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run \
  src/components/docs-overview/sdk-download-capability-groups.test.ts \
  src/components/docs-overview/SdksCatalog.test.tsx
~~~

Expected: group order, empty-group, accordion, and default-open assertions pass; dropdown assertions remain pending until Task 4.

- [ ] **Step 5: Commit grouping and accordion rendering.**

~~~bash
git add src/components/docs-overview/SdksCatalog.tsx
git commit -m "feat: add capability accordions to SDK catalog"
~~~

### Task 4: Replace Chinese platform tabs and normalize version details

**Files:**
- Modify: src/components/docs-overview/SdksCatalog.tsx
- Modify: src/components/docs-overview/SdksCatalog.test.tsx

- [ ] **Step 1: Add localized labels.**

Add to Chinese catalogCopy:
- platformLabel: 平台
- versionDetails: 版本详情
- versionLabel: product name plus 版本 / 语言 / 架构

Keep English copy and English tabs unchanged.

- [ ] **Step 2: Render a native platform select for every Chinese product.**

In the shared product detail body, branch on redesigned. The Chinese branch renders one labeled native select for every product:

~~~tsx
<label className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
  <span className="shrink-0 font-medium text-foreground">
    {copy.platformLabel}
  </span>
  <select
    aria-label={copy.platformTabsLabel(group.label)}
    className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    onChange={(event) => {
      setPlatformId(event.target.value);
      setVersionIndex('0');
    }}
    value={platformId}
  >
    {group.platforms.map((entry) => (
      <option key={entry.platformId} value={entry.platformId}>
        {entry.platformLabel}
      </option>
    ))}
  </select>
</label>
~~~

Retain the existing tab implementation only for English. Do not add horizontal overflow to the Chinese platform control. Chinese embedded product pages receive the same select.

- [ ] **Step 3: Put Chinese package metadata inside a closed version-details disclosure.**

Update VersionMetadata so it returns null when there are no items. For Chinese, wrap the existing metadata values in a native details/summary named 版本详情. Render the existing items in the details body; for English retain the current always-visible dl shape.

- [ ] **Step 4: Preserve version behavior.**

Use the new Chinese version label for the existing version select. Keep getLatestVersions, getVersionMeta, latest-variant filtering, platform-change reset, download links, package-manager links, and install-command derivation unchanged. Do not expose historical versions.

- [ ] **Step 5: Run all SDK catalog tests.**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run src/components/docs-overview/SdksCatalog.test.tsx
~~~

Expected: all SDK catalog tests PASS. English tests still find tabs; Chinese tests find comboboxes and no platform tablists.

- [ ] **Step 6: Commit dropdown and metadata changes.**

~~~bash
git add src/components/docs-overview/SdksCatalog.tsx \
  src/components/docs-overview/SdksCatalog.test.tsx
git commit -m "feat: simplify SDK platform selection"
~~~

### Task 5: Verify rendering, URL behavior, and responsive layout

**Files:** no source changes expected unless verification finds a concrete defect.

- [ ] **Step 1: Start the Chinese local preview.**

~~~bash
VITE_DOCS_REGION=cn /Users/yejiayi/.bun/bin/bun run dev -- \
  --host 127.0.0.1 --port 3002
~~~

Use the actual printed port if 3002 is occupied. Open /zh-CN/reference/sdks in agent-browser.

- [ ] **Step 2: Verify desktop at 1440 × 900.**

Expected:
- capability groups follow API reference order and empty groups are absent;
- only the first product in each non-empty group is expanded;
- every visible product has a platform select and no platform tablist;
- Video SDK → Web changes the command to npm i agora-rtc-sdk-ng@4.24.6;
- version details are closed initially and reveal release date, package, and MD5 when opened;
- document scrollWidth equals clientWidth.

- [ ] **Step 3: Verify mobile at 390 × 844.**

Expected:
- headings, summaries, selects, commands, actions, and details fit without clipping;
- no platform list requires horizontal scrolling;
- only an install-command region may scroll horizontally;
- native summary and select controls are keyboard/touch reachable;
- document scrollWidth equals clientWidth.

- [ ] **Step 4: Verify URL filters and embedded consumers.**

Open:
- /zh-CN/reference/sdks?product=video&platform=android — only 视频 SDK, Android selected, no redundant group heading;
- /zh-CN/reference/sdks?platform=unity — only products supporting Unity and the current filter summary;
- a known Chinese product-specific download page such as /zh-CN/realtime-media/rtc/reference/downloads/android — requested content still renders with a Chinese platform select.

- [ ] **Step 5: Run focused tests, lint, and type checking.**

~~~bash
/Users/yejiayi/.bun/bin/bun x vitest run \
  src/components/docs-overview/sdk-download-capability-groups.test.ts \
  src/components/docs-overview/SdksCatalog.test.tsx \
  src/components/docs-shell/SdkDownloadProductNav.test.tsx

/Users/yejiayi/.bun/bin/bun x biome check \
  src/components/docs-overview/SdksCatalog.tsx \
  src/components/docs-overview/SdksCatalog.test.tsx \
  src/components/docs-overview/sdk-download-capability-groups.ts \
  src/components/docs-overview/sdk-download-capability-groups.test.ts

/Users/yejiayi/.bun/bin/bun run types:check
~~~

Expected: focused tests, Biome, and type checking pass. Record unrelated full-suite or environment failures separately.

- [ ] **Step 6: Inspect final diff and status.**

~~~bash
git diff --check codex/cn-newdoc-html-api-migration...HEAD
git diff --stat codex/cn-newdoc-html-api-migration...HEAD
git status --short --branch
~~~

Expected implementation changes are limited to the SDK catalog component/tests and new grouping module/tests, plus the design and plan documents. No SDK data, generated output, or unrelated route files should change.

- [ ] **Step 7: Commit only a concrete final verification fix.**

~~~bash
git add src/components/docs-overview/
git commit -m "fix: polish DF-061 SDK catalog layout"
~~~

Create this commit only if verification finds and fixes a concrete issue; do not create an empty commit.
