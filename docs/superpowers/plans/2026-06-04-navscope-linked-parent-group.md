# NavScope Linked Parent Group Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render folders with `navScope: {}` as collapsed-looking linked groups in the parent sidebar while preserving the parent `meta.json` separator labels, and keep the full scoped sidebar after navigation.

**Architecture:** Keep `navScope` routing and scoped sidebar resolution in `src/lib/docs-nav-scope.ts`. Add a parent-sidebar-only linked section node shape so the parent tree can preserve separators and icons, while the active scoped tree still renders the full folder contents. Render linked section nodes in `DocsSidebarTree` with the existing collapsed group visual style but as a TanStack Router link.

**Tech Stack:** TypeScript, React, TanStack Router, Fumadocs page-tree, Vitest, Testing Library.

---

### Task 1: Capture Parent Sidebar Regression

**Files:**
- Modify: `src/lib/docs-nav-scope.test.ts`
- Modify: `src/lib/docs-page.server.test.ts`

- [x] **Step 1: Write the failing unit test for parent separators**

Add `preserves parent separators while rendering plain nav scopes as linked folder groups` to `src/lib/docs-nav-scope.test.ts`. The test builds a minimal `realtime-media` tree with `Build Live Interaction`, `rtc`, and `rtm`, marks only `rtc` with `navScope: {}`, then expects:

```ts
{
  children: [
    {
      children: [],
      collapsible: true,
      id: 'folder-realtime-media-rtc-folder',
      title: 'Voice & Video',
      type: 'section',
      url: '/en/realtime-media/rtc',
    },
    {
      id: '/en/realtime-media/rtm',
      title: 'Signaling',
      type: 'page',
      url: '/en/realtime-media/rtm',
    },
  ],
  collapsible: false,
  id: 'separator-Build Live Interaction',
  title: 'Build Live Interaction',
  type: 'section',
}
```

- [x] **Step 2: Run the test and verify RED**

Run: `bun x vitest run src/lib/docs-nav-scope.test.ts -t "preserves parent separators"`

Expected before implementation: FAIL because the current parent sidebar returns `Voice & Video` as a plain page and drops the `Build Live Interaction` separator.

- [x] **Step 3: Update payload-level regression coverage**

Rename the old `keeps a plain nav scope expanded...` test in `src/lib/docs-page.server.test.ts` to `keeps a plain nav scope as a linked folder group...`. Assert that the parent payload contains a section named `Build Live Interaction` with a child section `Voice & Video` whose `url` is `/en/realtime-media/rtc`, and assert that nested RTC pages do not appear in the parent sidebar.

### Task 2: Implement Linked Section Data

**Files:**
- Modify: `src/lib/docs-tree.ts`
- Modify: `src/lib/docs-nav-scope.ts`

- [x] **Step 1: Extend the sidebar section type**

Add optional `url?: string` to `DocsSidebarSectionNode` in `src/lib/docs-tree.ts`.

- [x] **Step 2: Export existing sidebar helpers**

Export `getConfiguredIconName` and `isCollapsibleSectionTitle` from `src/lib/docs-tree.ts` so nav-scope parent rendering can reuse the existing icon and collapsible-section rules.

- [x] **Step 3: Replace parent nav-scope flattening**

In `src/lib/docs-nav-scope.ts`, make `getNavScopeSidebarNodes` call `flattenParentNavScopeSidebarNodes(tabNode, tab, getNodeMeta)` only when the tab contains navScope descendants. The helper should:

```ts
const nodes: DocsSidebarNode[] = [];
const indexUrl = folder.index?.url;

if (folder.index) {
  nodes.push({
    id: folder.index.url,
    title: normalizeLabel(folder.index.name, tab),
    type: 'page',
    url: folder.index.url,
  });
}
```

Then iterate `folder.children`, preserve separator sections with `getConfiguredIconName(child)` and `isCollapsibleSectionTitle(title)`, and append child sidebar nodes into the active section when present.

- [x] **Step 4: Compress only scoped folders into linked groups**

Add `navScopeParentNodeToSidebarNodes`. For folders with `meta?.navScope`, return:

```ts
{
  children: [],
  collapsible: true,
  id: `folder-${String(node.$id ?? node.name ?? 'folder')}`,
  title: getMetaTitle(meta, node),
  type: 'section',
  url: getFolderHref(node),
}
```

For non-scoped folders, delegate to the existing `navScopeNodeToSidebarNodes(node, getNodeMeta)` path.

- [x] **Step 5: Run unit tests**

Run: `bun x vitest run src/lib/docs-nav-scope.test.ts`

Expected: all tests pass, including versioned API reference scope behavior.

### Task 3: Render Linked Section Groups

**Files:**
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [x] **Step 1: Write the failing component test**

Add `renders linked collapsed sections as navigation entries` to `DocsSidebarTree.test.tsx`. Use a section node with `url: '/en/realtime-media/rtc'`, assert `screen.findByRole('link', { name: /Voice & Video/i })`, assert its `href`, and assert there is no `button` named `Voice & Video`.

- [x] **Step 2: Run the test and verify RED**

Run: `bun x vitest run src/components/docs-shell/DocsSidebarTree.test.tsx -t "renders linked collapsed sections"`

Expected before implementation: FAIL because section nodes render as buttons even when a `url` exists.

- [x] **Step 3: Add `SidebarLinkedSection`**

In `DocsSidebarTree.tsx`, before the existing non-collapsible/collapsible branches in `SidebarSection`, route `node.url` to a new `SidebarLinkedSection` component. The component should use `SidebarMenuButton asChild`, `Link`, `sidebarToggleClassName`, the optional configured icon, the section title, and a left-rotated chevron so it visually matches a collapsed group entry.

- [x] **Step 4: Run component tests**

Run: `bun x vitest run src/components/docs-shell/DocsSidebarTree.test.tsx -t "renders linked collapsed sections|supports collapsible sections"`

Expected: the linked section test and existing collapsible section test pass.

### Task 4: Verify the Slice

**Files:**
- Verify: `src/lib/docs-nav-scope.test.ts`
- Verify: `src/components/docs-shell/DocsSidebarTree.test.tsx`
- Verify: `src/lib/docs-page.server.test.ts`
- Verify: project lint, typecheck, and build

- [x] **Step 1: Run focused tests**

Run:

```bash
bun x vitest run src/lib/docs-nav-scope.test.ts
bun x vitest run src/components/docs-shell/DocsSidebarTree.test.tsx -t "renders linked collapsed sections|supports collapsible sections"
bun x vitest run src/lib/docs-page.server.test.ts -t "plain navScope|parent versioned API reference scope"
```

Expected: each command exits 0.

- [x] **Step 2: Run project verification**

Run:

```bash
bun run lint
bun run types:check
bun run build
git diff --check
```

Expected: each command exits 0.

Actual: focused tests, touched-file Biome, `bun run types:check`, `bun run build`, and `git diff --check` exited 0. `bun run lint` still reports unrelated pre-existing issues outside this slice, including `src/components/ui/sidebar.tsx`, `src/components/providers/i18n-bootstrap.tsx`, `src/components/docs-overview/mdx-components.tsx`, `src/components/docs-overview/mdx-components.test.tsx`, `src/lib/docs-hash.ts`, `src/lib/docs-journeys.test.ts`, and `src/routes/llms*.txt.ts`.
