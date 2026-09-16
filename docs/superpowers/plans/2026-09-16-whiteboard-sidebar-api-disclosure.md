# Whiteboard SDK Sidebar API Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a shared Chinese Whiteboard RESTful API page is opened from one SDK section, reveal only that SDK section's embedded service API disclosure.

**Architecture:** Carry the validated product source path from the parsed `from` context into `revealActiveSidebarPath`. A sidebar page matches the active API URL only when its `search.from` also matches that source path, so duplicate API URLs remain isolated to their originating SDK section. Existing URL-only matching remains available when no product source is supplied.

**Tech Stack:** TypeScript, Vitest, Fumadocs sidebar node types.

---

### Task 1: Add a regression test for source-scoped disclosure

**Files:**
- Modify: `src/lib/docs-page.server.test.ts` (imports and sidebar restoration tests)
- Test: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Add the failing test**

Import `revealActiveSidebarPath` from `./docs-page.server`, then add this test near the existing Chinese API/sidebar tests:

```ts
it('reveals only the embedded service API section matching the product source', () => {
  const activeApiUrl =
    '/zh-CN/api-reference/api-ref/whiteboard/restful/create-room';
  const whiteboardPath = '/zh-CN/realtime-media/whiteboard/whiteboard-sdk';
  const fastboardPath = '/zh-CN/realtime-media/whiteboard/fastboard-sdk';
  const nodes: DocsSidebarNode[] = [
    {
      children: [
        {
          children: [
            {
              id: 'whiteboard-api-page',
              search: { from: whiteboardPath },
              title: '创建房间',
              type: 'page',
              url: activeApiUrl,
            },
          ],
          collapsible: true,
          defaultOpen: false,
          id: 'whiteboard-service-api',
          title: '服务端 API',
          type: 'section',
        },
      ],
      id: 'whiteboard-sdk',
      title: '互动白板 SDK',
      type: 'section',
    },
    {
      children: [
        {
          children: [
            {
              id: 'fastboard-api-page',
              search: { from: fastboardPath },
              title: '创建房间',
              type: 'page',
              url: activeApiUrl,
            },
          ],
          collapsible: true,
          defaultOpen: false,
          id: 'fastboard-service-api',
          title: '服务端 API',
          type: 'section',
        },
      ],
      id: 'fastboard-sdk',
      title: 'Fastboard SDK',
      type: 'section',
    },
  ];

  const revealed = revealActiveSidebarPath(
    nodes,
    activeApiUrl,
    whiteboardPath,
  );

  expect((revealed[0] as Extract<DocsSidebarNode, { type: 'section' }>).children[0]).toMatchObject({
    defaultOpen: true,
  });
  expect((revealed[1] as Extract<DocsSidebarNode, { type: 'section' }>).children[0]).toMatchObject({
    defaultOpen: false,
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the current behavior**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts -t "matching the product source"
```

Expected: the test cannot compile because `revealActiveSidebarPath` is not exported; after exposing the current URL-only behavior for the test, the assertion must fail with the Fastboard section also marked `defaultOpen: true`. The failure must identify the missing source-path filtering, not a fixture or import error.

### Task 2: Scope active sidebar restoration to the originating product

**Files:**
- Modify: `src/lib/docs-page.server.ts:890-895, 2095-2120`

- [ ] **Step 1: Pass the parsed product pathname into the reveal helper**

Change the product sidebar payload construction to pass `productSidebarContext.pathname`:

```ts
sidebar: revealActiveSidebarPath(
  sidebar,
  activePath,
  context.pathname,
),
```

- [ ] **Step 2: Match API page source metadata while preserving URL matching without context**

Update the helper signature and recursive calls, and export it for the focused unit test:

```ts
export function revealActiveSidebarPath(
  nodes: DocsSidebarNode[],
  activePath: string,
  productPath?: string,
): DocsSidebarNode[] {
  return nodes.map((node) => {
    if (node.type === 'page') {
      return node;
    }

    const children = revealActiveSidebarPath(
      node.children,
      activePath,
      productPath,
    );
    const containsActivePath = children.some((child) =>
      sidebarNodeContainsPath(child, activePath, productPath),
    );

    return containsActivePath
      ? { ...node, children, defaultOpen: true }
      : { ...node, children };
  });
}

function sidebarNodeContainsPath(
  node: DocsSidebarNode,
  activePath: string,
  productPath?: string,
): boolean {
  if (node.type === 'page') {
    return (
      node.url === activePath &&
      (productPath === undefined || node.search?.from === productPath)
    );
  }

  return (
    node.url === activePath ||
    node.children.some((child) =>
      sidebarNodeContainsPath(child, activePath, productPath),
    )
  );
}
```

- [ ] **Step 3: Run the focused test and verify it passes**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts -t "matching the product source"
```

Expected: PASS, with only the Whiteboard SDK branch marked `defaultOpen: true`.

### Task 3: Verify the complete affected surface

**Files:**
- No additional files.

- [ ] **Step 1: Run related Sidebar and server tests**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsShell.test.tsx
```

Expected: all tests pass.

- [ ] **Step 2: Run type checking**

Run:

```bash
bun run types:check
```

Expected: command exits with status 0 and TypeScript reports no errors.

- [ ] **Step 3: Review the final diff and commit the implementation**

Run:

```bash
git diff --check
git diff -- src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts
git add src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts
git commit -m "fix: scope whiteboard API sidebar disclosure"
```

Expected: no whitespace errors, the diff contains only source-scoped disclosure and its regression test, and the commit succeeds.
