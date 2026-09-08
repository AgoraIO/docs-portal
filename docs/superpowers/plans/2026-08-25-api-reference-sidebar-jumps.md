# API Reference Sidebar Jumps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render REST and SDK API jumps at deterministic positions in English Realtime Media Reference sidebars, with REST navigating in the current tab and SDK opening a new tab while both display the right-facing chevron.

**Architecture:** Move the 20-product SDK/REST capability matrix into a focused server-side registry module. `docs-page.server.ts` uses that registry to prepend canonical jump nodes to the final sidebar payload and filter duplicates; product `meta.json` returns to owning only normal Reference pages. Existing `DocsSidebarTree` behavior is reused: `linked` renders the chevron and `external` renders a safe `_blank` anchor.

**Tech Stack:** TypeScript, TanStack Router, React 19, Fumadocs page trees, Vitest, Testing Library, Bun, Vite, `agent-browser`.

---

### Task 1: Lock the final sidebar contract with failing tests

**Files:**
- Modify: `src/lib/docs-page.server.test.ts:806-940`
- Modify: `src/lib/docs-page.server.test.ts:3200-3380`
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx:287-310`

- [ ] **Step 1: Expand the Realtime Media page-tree fixture**

Add Cloud Recording and On-Premise Recording product folders to `createRealtimeMediaApiReferenceJumpPageTree()`. Each folder contains a `Reference` separator, a `Reference` folder, and one ordinary page so ordering can be observed:

```ts
{
  $id: 'realtime-media-cloud-recording-folder',
  children: [
    {
      $id: 'realtime-media-cloud-recording-reference-separator',
      name: 'Reference',
      type: 'separator',
    },
    {
      $id: 'realtime-media-cloud-recording-reference-folder',
      children: [
        {
          $id: 'realtime-media-cloud-recording-pricing',
          name: 'Pricing',
          type: 'page',
          url: '/en/realtime-media/cloud-recording/reference/pricing',
        },
      ],
      name: 'Reference',
      type: 'folder',
    },
  ],
  index: {
    $id: 'realtime-media-cloud-recording-index',
    name: 'Cloud Recording',
    type: 'page',
    url: '/en/realtime-media/cloud-recording',
  },
  name: 'Cloud Recording',
  type: 'folder',
},
{
  $id: 'realtime-media-on-premise-recording-folder',
  children: [
    {
      $id: 'realtime-media-on-premise-recording-reference-separator',
      name: 'Reference',
      type: 'separator',
    },
    {
      $id: 'realtime-media-on-premise-recording-reference-folder',
      children: [
        {
          $id: 'realtime-media-on-premise-recording-pricing',
          name: 'Pricing',
          type: 'page',
          url: '/en/realtime-media/on-premise-recording/reference/pricing',
        },
      ],
      name: 'Reference',
      type: 'folder',
    },
  ],
  index: {
    $id: 'realtime-media-on-premise-recording-index',
    name: 'On-Premise Recording',
    type: 'page',
    url: '/en/realtime-media/on-premise-recording',
  },
  name: 'On-Premise Recording',
  type: 'folder',
},
```

- [ ] **Step 2: Replace the loose API jump assertion with ordered contract assertions**

Add these test helpers in `docs-page.server.test.ts`:

```ts
function getSidebarSection(payload: { sidebar: DocsSidebarNode[] }, title: string) {
  const section = payload.sidebar.find(
    (node) => node.type === 'section' && node.title === title,
  );

  if (!section || section.type !== 'section') {
    throw new Error(`expected ${title} sidebar section`);
  }

  return section;
}

async function loadRealtimeMediaProductPayload(
  productSlug: string,
  title: string,
) {
  const page = createPage();
  const productPage = {
    ...page,
    data: {
      ...page.data,
      info: {
        fullPath: `/virtual/content/docs/en/realtime-media/${productSlug}/index.mdx`,
        path: `en/realtime-media/${productSlug}/index.mdx`,
      },
      title,
    },
    path: `en/realtime-media/${productSlug}/index.mdx`,
    slugs: ['en', 'realtime-media', productSlug, 'index'],
    url: `/en/realtime-media/${productSlug}`,
  };

  mockedGetPage.mockReturnValue(productPage);
  mockedGetPages.mockReturnValue([productPage]);
  mockedGetPageTree.mockReturnValue(
    createRealtimeMediaApiReferenceJumpPageTree(),
  );
  mockedGetNodeMeta.mockImplementation((node) =>
    node.$id === `realtime-media-${productSlug}-folder`
      ? ({
          data: {
            navScope: {},
            title,
          },
        } as unknown as ReturnType<typeof source.getNodeMeta>)
      : undefined,
  );

  return unwrapPayload(
    await loadDocsPagePayload('en', 'realtime-media', [productSlug]),
  );
}
```

Load the three representative payloads:

```ts
const videoPayload = await loadRealtimeMediaProductPayload(
  'video',
  'Video Calling',
);
const cloudRecordingPayload = await loadRealtimeMediaProductPayload(
  'cloud-recording',
  'Cloud Recording',
);
const onPremisePayload = await loadRealtimeMediaProductPayload(
  'on-premise-recording',
  'On-Premise Recording',
);
```

For the RTC-family page, assert the first two `Reference` children are exactly:

```ts
expect(getSidebarSection(videoPayload, 'Reference').children.slice(0, 2)).toEqual([
  {
    id: '/en/api-reference/api-ref/rtc',
    linked: true,
    title: 'RESTful API',
    type: 'page',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    external: true,
    href: '/en/api-reference/api-ref',
    id: '/en/api-reference/api-ref',
    linked: true,
    title: 'SDK API reference',
    type: 'page',
    url: '/en/api-reference/api-ref',
  },
]);
```

Add equivalent final-payload tests for:

```ts
expect(getSidebarSection(cloudRecordingPayload, 'Reference').children[0]).toEqual({
  id: '/en/api-reference/api-ref/cloud-recording',
  linked: true,
  title: 'RESTful API',
  type: 'page',
  url: '/en/api-reference/api-ref/cloud-recording',
});
expect(
  getSidebarSection(cloudRecordingPayload, 'Reference').children.some(
    (node) => node.type === 'page' && node.title === 'SDK API reference',
  ),
).toBe(false);

expect(
  getSidebarSection(onPremisePayload, 'Reference').children[0],
).toEqual({
  external: true,
  href: '/en/api-reference/api-ref/on-premise-recording',
  id: '/en/api-reference/api-ref/on-premise-recording',
  linked: true,
  title: 'SDK API reference',
  type: 'page',
  url: '/en/api-reference/api-ref/on-premise-recording',
});
```

- [ ] **Step 3: Verify the sidebar primitive renders linked external nodes correctly**

Update the existing external-link test node to include `linked: true`, then assert both new-tab attributes and the chevron:

```ts
const tree: DocsSidebarNode[] = [
  {
    external: true,
    href: '/en/api-reference/api-ref',
    id: '/en/api-reference/api-ref',
    linked: true,
    title: 'SDK API reference',
    type: 'page',
    url: '/en/api-reference/api-ref',
  },
];

const link = await screen.findByRole('link', {
  name: 'SDK API reference',
});
const chevron = link.querySelector('svg');

expect(link).toHaveAttribute('href', '/en/api-reference/api-ref');
expect(link).toHaveAttribute('rel', 'noreferrer noopener');
expect(link).toHaveAttribute('target', '_blank');
expect(chevron).toHaveClass('-rotate-90');
```

- [ ] **Step 4: Run tests and verify RED**

Run:

```bash
bun run test src/lib/docs-page.server.test.ts -t "API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external"
```

Expected: the server test fails because only the current REST node is injected. The sidebar primitive test may already pass because the renderer supports the combined node shape; it records the existing primitive relied upon by the implementation.

- [ ] **Step 5: Commit the failing server contract and primitive regression test**

```bash
git add src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx
git commit -m "test: define API sidebar jump behavior"
```

### Task 2: Centralize the product capability registry and inject ordered nodes

**Files:**
- Create: `src/lib/realtime-media-api-reference-links.ts`
- Modify: `src/lib/docs-page.server.ts:1290-1500`
- Test: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Create the complete product capability registry**

Create `src/lib/realtime-media-api-reference-links.ts` with the complete 20-product mapping:

```ts
export type RealtimeMediaApiReferenceLinks = {
  productSlug: string;
  restUrl?: string;
  sdkUrl?: string;
};

const genericSdkUrl = '/en/api-reference/api-ref';

export const realtimeMediaApiReferenceLinks = [
  { productSlug: 'rtc', restUrl: '/en/api-reference/api-ref/rtc', sdkUrl: genericSdkUrl },
  { productSlug: 'voice', restUrl: '/en/api-reference/api-ref/rtc', sdkUrl: genericSdkUrl },
  { productSlug: 'video', restUrl: '/en/api-reference/api-ref/rtc', sdkUrl: genericSdkUrl },
  { productSlug: 'broadcast-streaming', restUrl: '/en/api-reference/api-ref/rtc', sdkUrl: genericSdkUrl },
  { productSlug: 'interactive-live-streaming', restUrl: '/en/api-reference/api-ref/rtc', sdkUrl: genericSdkUrl },
  { productSlug: 'rtm', restUrl: '/en/api-reference/api-ref/signaling', sdkUrl: genericSdkUrl },
  { productSlug: 'im', restUrl: '/en/api-reference/api-ref/im', sdkUrl: genericSdkUrl },
  { productSlug: 'whiteboard', restUrl: '/en/api-reference/api-ref/whiteboard', sdkUrl: genericSdkUrl },
  {
    productSlug: 'flexible-classroom',
    restUrl: '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    sdkUrl: genericSdkUrl,
  },
  {
    productSlug: 'iot',
    restUrl: '/en/api-reference/api-ref/iot-channel-management-rest-api',
    sdkUrl: genericSdkUrl,
  },
  { productSlug: 'cloud-recording', restUrl: '/en/api-reference/api-ref/cloud-recording' },
  { productSlug: 'transcoding', restUrl: '/en/api-reference/api-ref/cloud-transcoding' },
  { productSlug: 'speech-to-text', restUrl: '/en/api-reference/api-ref/speech-to-text' },
  { productSlug: 'media-pull', restUrl: '/en/api-reference/api-ref/media-pull' },
  { productSlug: 'media-push', restUrl: '/en/api-reference/api-ref/media-push' },
  { productSlug: 'rtmp-gateway', restUrl: '/en/api-reference/api-ref/rtmp-gateway' },
  {
    productSlug: 'agora-analytics',
    restUrl: '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
  },
  {
    productSlug: 'marketplace',
    restUrl: '/en/api-reference/api-ref/extensions-marketplace/provisioning',
  },
  {
    productSlug: 'on-premise-recording',
    sdkUrl: '/en/api-reference/api-ref/on-premise-recording',
  },
  { productSlug: 'rtc-server-sdk', sdkUrl: genericSdkUrl },
] as const satisfies readonly RealtimeMediaApiReferenceLinks[];

export function getRealtimeMediaApiReferenceLinks(activePath?: string) {
  if (!activePath?.startsWith('/en/realtime-media/')) {
    return null;
  }

  const productSlug = activePath.split('/').filter(Boolean)[2];

  return (
    realtimeMediaApiReferenceLinks.find(
      (links) => links.productSlug === productSlug,
    ) ?? null
  );
}
```

- [ ] **Step 2: Replace the single-link injection with ordered jump-node creation**

In `docs-page.server.ts`, import `getRealtimeMediaApiReferenceLinks`, remove the old constant and lookup function, and replace `addRealtimeMediaApiReferenceSidebarItem` with:

```ts
function addRealtimeMediaApiReferenceSidebarItems(
  nodes: DocsSidebarNode[],
  activePath?: string,
): DocsSidebarNode[] {
  const links = getRealtimeMediaApiReferenceLinks(activePath);

  if (!links) {
    return nodes;
  }

  const jumpNodes: DocsSidebarPageNode[] = [];

  if (links.restUrl) {
    jumpNodes.push({
      id: links.restUrl,
      linked: true,
      title: 'RESTful API',
      type: 'page',
      url: links.restUrl,
    });
  }

  if (links.sdkUrl) {
    jumpNodes.push({
      external: true,
      href: links.sdkUrl,
      id: links.sdkUrl,
      linked: true,
      title: 'SDK API reference',
      type: 'page',
      url: links.sdkUrl,
    });
  }

  const existingUrls = new Set([
    ...jumpNodes.map((node) => node.url),
    ...getRealtimeMediaLegacyApiReferenceUrls(links.productSlug),
  ]);

  return nodes.map((node) => {
    if (node.type !== 'section' || node.title !== 'Reference') {
      return node;
    }

    return {
      ...node,
      children: [
        ...jumpNodes,
        ...filterSidebarNodes(
          node.children,
          (child) => child.type !== 'page' || !existingUrls.has(child.url),
        ),
      ],
    };
  });
}
```

Update the caller to use the plural function name. Keep `getRealtimeMediaLegacyApiReferenceUrls` for compatibility filtering.

- [ ] **Step 3: Run the focused server and sidebar tests**

```bash
bun run test src/lib/docs-page.server.test.ts -t "API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external"
```

Expected: PASS. RTC-family output begins REST then SDK; Cloud Recording has REST only; On-Premise Recording begins with SDK only; SDK anchors open `_blank` and show the chevron.

- [ ] **Step 4: Run type checking**

```bash
bun run types:check
```

Expected: exit 0.

- [ ] **Step 5: Commit the centralized injection**

```bash
git add src/lib/realtime-media-api-reference-links.ts src/lib/docs-page.server.ts
git commit -m "feat: order API reference sidebar jumps"
```

### Task 3: Return product metadata to ordinary Reference pages

**Files:**
- Modify: `content/docs/en/realtime-media/*/reference/meta.json` for the 20 classified products
- Modify: `src/lib/reference-api-navigation.test.ts`
- Modify: `src/lib/docs-content-regressions.test.ts:412-445`

- [ ] **Step 1: Rewrite the capability test against the centralized registry**

Import `realtimeMediaApiReferenceLinks` and build the expected registry from the three existing test matrices:

```ts
const expectedLinks = [
  ...Object.entries(sdkAndRestProducts).map(([productSlug, restUrl]) => ({
    productSlug,
    restUrl,
    sdkUrl: sdkApiReference,
  })),
  ...Object.entries(restOnlyProducts).map(([productSlug, restUrl]) => ({
    productSlug,
    restUrl,
  })),
  ...Object.entries(sdkOnlyProducts).map(([productSlug, sdkUrl]) => ({
    productSlug,
    sdkUrl,
  })),
];

expect(realtimeMediaApiReferenceLinks).toEqual(expectedLinks);
```

Preserve the existing assertions that:

```ts
expect(actualProducts.sort()).toEqual(expectedProducts.sort());
expect(unresolvedTargets).toEqual([]);
```

Replace raw metadata link assertions with an assertion that no classified product metadata contains injected jump strings:

```ts
for (const product of expectedProducts) {
  const pages = readReferencePages(product);

  expect(
    pages.filter(
      (page) =>
        page.startsWith('[SDK API reference](') ||
        page.startsWith('[REST API]('),
    ),
  ).toEqual([]);
}
```

- [ ] **Step 2: Run the capability test and verify RED**

```bash
bun run test src/lib/reference-api-navigation.test.ts
```

Expected: FAIL because the 20 metadata files still contain direct API jump strings.

- [ ] **Step 3: Remove direct API jump strings from product metadata**

Remove every `[SDK API reference](...)` and `[REST API](...)` string added by PR #1028 from the 20 classified `reference/meta.json` files. Do not restore old REST wrapper slugs. Preserve all unrelated pages, including `agora-console-rest-api`.

- [ ] **Step 4: Restore the Whiteboard raw metadata regression expectation**

Because API jumps are now injected after metadata tree construction, change the Whiteboard assertion back to ordinary Reference pages:

```ts
expect(referenceMeta.pages.slice(0, 5)).toEqual([
  'pricing',
  'core-concepts',
  'supported-platforms',
  'release-notes',
  'release-notes-uikit',
]);
```

- [ ] **Step 5: Run the capability and Whiteboard tests**

```bash
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-content-regressions.test.ts -t "keeps Whiteboard IA centered on the product root and Reference section"
```

Expected: 20-product capability matrix, target resolution, metadata ownership, and Whiteboard regression all pass.

- [ ] **Step 6: Commit metadata ownership cleanup**

```bash
git add content/docs/en/realtime-media src/lib/reference-api-navigation.test.ts src/lib/docs-content-regressions.test.ts
git commit -m "refactor: centralize API sidebar navigation"
```

### Task 4: Verify the complete change

**Files:**
- Verify: `src/lib/realtime-media-api-reference-links.ts`
- Verify: `src/lib/docs-page.server.ts`
- Verify: `src/components/docs-shell/DocsSidebarTree.test.tsx`
- Verify: `src/lib/reference-api-navigation.test.ts`
- Verify: modified `reference/meta.json` files

- [ ] **Step 1: Run focused tests**

```bash
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-page.server.test.ts -t "API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external"
bun run test src/lib/docs-content-regressions.test.ts -t "keeps Whiteboard IA centered on the product root and Reference section"
```

Expected: all focused tests pass.

- [ ] **Step 2: Run type and formatting checks**

```bash
bun run types:check
bunx biome check src/lib/realtime-media-api-reference-links.ts src/lib/reference-api-navigation.test.ts src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx src/lib/docs-content-regressions.test.ts
git diff --check origin/main...HEAD
```

Expected: task files and diff pass. If Biome reports pre-existing diagnostics in a touched legacy test file, verify the changed lines separately and report the baseline rather than formatting unrelated code.

- [ ] **Step 3: Run the full suite once**

```bash
bun run test
bun run lint
```

Expected repository baseline on 2026-08-25: full tests report 32 existing failures and lint reports 24 errors plus 13 warnings. Confirm there are no task-specific failures or regressions beyond that baseline.

- [ ] **Step 4: Run final two-axis code review**

Use the repository `code-review` workflow with fixed point `origin/main`. Standards review checks repository conventions and test quality; Spec review checks ordering, new-tab behavior, chevrons, the 20-product classification, metadata cleanup, and screenshot requirements. Resolve every Critical or Important finding and re-run affected checks.

### Task 5: Start the docs site and provide sampled screenshots

**Files:**
- Create runtime artifacts only: `/tmp/api-sidebar-rtc.png`
- Create runtime artifacts only: `/tmp/api-sidebar-on-premise-recording.png`
- Create runtime artifacts only: `/tmp/api-sidebar-cloud-recording.png`

- [ ] **Step 1: Start a stable local dev server**

```bash
bun run dev -- --host 127.0.0.1 --port 4310
```

Expected: Vite reports the local URL `http://127.0.0.1:4310`. Keep the process running until all browser checks finish.

- [ ] **Step 2: Read and use the `agent-browser` skill**

Use one named browser session at viewport `1440 × 1000`. For each route, wait for the product title, locate the `Reference` section, scroll its API jump into view, and capture the current viewport:

```bash
agent-browser --session api-sidebar open http://127.0.0.1:4310/en/realtime-media/rtc
agent-browser --session api-sidebar set viewport 1440 1000
agent-browser --session api-sidebar wait --load networkidle
agent-browser --session api-sidebar eval "(() => { const link = [...document.querySelectorAll('a')].find((node) => node.textContent?.trim() === 'RESTful API'); link?.scrollIntoView({ block: 'center' }); return Boolean(link); })()"
agent-browser --session api-sidebar screenshot /tmp/api-sidebar-rtc.png
```

Repeat with:

```text
http://127.0.0.1:4310/en/realtime-media/on-premise-recording
/tmp/api-sidebar-on-premise-recording.png

http://127.0.0.1:4310/en/realtime-media/cloud-recording
/tmp/api-sidebar-cloud-recording.png
```

Expected screenshots:

- RTC: `RESTful API` immediately followed by `SDK API reference`; both show right-facing chevrons.
- On-Premise Recording: `SDK API reference` is the first Reference item and shows a chevron.
- Cloud Recording: `RESTful API` is first and no SDK entry is present.

- [ ] **Step 3: Verify tab behavior with browser automation**

On RTC, record the tab list, click `SDK API reference`, and record the tab list again. Expected: one additional tab exists and its URL is `/en/api-reference/api-ref`; the original RTC tab remains open.

Return to the RTC tab, record its URL, click `RESTful API`, and inspect tabs and the active URL. Expected: tab count does not increase and the active tab navigates to `/en/api-reference/api-ref/rtc`.

Also run:

```bash
agent-browser --session api-sidebar errors
agent-browser --session api-sidebar console --level error
agent-browser --session api-sidebar close
```

Expected: no task-related page or console errors.

- [ ] **Step 4: Inspect all three screenshots**

Use the local image viewer to verify that API items, chevrons, section headings, and neighboring navigation labels are visible, not clipped, and not overlapped. Re-capture any screenshot that does not clearly show the intended ordering.

- [ ] **Step 5: Push the branch and update PR #1028**

```bash
git push origin codex/api-reference-guide-links
gh pr view 1028 --json url,baseRefName,headRefName,state
```

Update the PR description with the final verification results and add the three screenshots to the user handoff. Keep the worktree and branch available for review changes.
