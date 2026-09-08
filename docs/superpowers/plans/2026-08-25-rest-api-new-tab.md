# REST API New-Tab Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open every injected Realtime Media `RESTful API` sidebar jump in a safe new browser tab while preserving ordering, chevrons, product classification, and ordinary Reference pages.

**Architecture:** Reuse the same sidebar node contract already used by `SDK API reference`: `linked` keeps the chevron, while `external` plus `href` makes the internal docs URL render as a native `_blank` anchor with safe `rel`. The 20-product capability registry and API jump ordering remain unchanged; only REST node shape, tests, and browser acceptance change.

**Tech Stack:** TypeScript, React 19, TanStack Router, Vitest, Testing Library, Bun, Vite, `agent-browser`.

---

### Task 1: Lock the REST new-tab contract with failing tests

**Files:**
- Modify: `src/lib/docs-page.server.test.ts:3335-3430`
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx:310-345`

- [ ] **Step 1: Update final sidebar payload expectations**

For every expected REST node in the Realtime Media API sidebar test, add the same external-link fields used by SDK nodes.

Video Calling REST expectation:

```ts
{
  external: true,
  href: '/en/api-reference/api-ref/rtc',
  id: '/en/api-reference/api-ref/rtc',
  linked: true,
  title: 'RESTful API',
  type: 'page',
  url: '/en/api-reference/api-ref/rtc',
}
```

Cloud Recording REST expectation:

```ts
{
  external: true,
  href: '/en/api-reference/api-ref/cloud-recording',
  id: '/en/api-reference/api-ref/cloud-recording',
  linked: true,
  title: 'RESTful API',
  type: 'page',
  url: '/en/api-reference/api-ref/cloud-recording',
}
```

Whiteboard REST expectation:

```ts
{
  external: true,
  href: '/en/api-reference/api-ref/whiteboard',
  id: '/en/api-reference/api-ref/whiteboard',
  linked: true,
  title: 'RESTful API',
  type: 'page',
  url: '/en/api-reference/api-ref/whiteboard',
}
```

Keep all existing ordering, SDK, legacy-filter, Pricing, Release Notes, Console REST, and Cloud Recording authentication assertions unchanged.

- [ ] **Step 2: Change the REST renderer test to the external contract**

Rename the test to `renders linked external REST API jumps with a chevron in a new tab`. Use this node:

```ts
const tree: DocsSidebarNode[] = [
  {
    external: true,
    href: '/en/api-reference/api-ref/rtc',
    id: '/en/api-reference/api-ref/rtc',
    linked: true,
    title: 'RESTful API',
    type: 'page',
    url: '/en/api-reference/api-ref/rtc',
  },
];
```

Replace the current-tab assertions with:

```ts
expect(link).toHaveAttribute('href', '/en/api-reference/api-ref/rtc');
expect(link).toHaveAttribute('target', '_blank');
expect(link).toHaveAttribute('rel', 'noreferrer noopener');
expect(link.querySelector('svg')).toHaveClass('-rotate-90');
```

- [ ] **Step 3: Run focused tests and verify RED**

```bash
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external REST API jumps"
```

Expected:

- Server payload test fails because REST nodes do not contain `external` or `href`.
- REST renderer test passes because `DocsSidebarTree` already supports the target node shape; it records the existing primitive used by the implementation.

- [ ] **Step 4: Check changed test lines and commit**

```bash
git diff --check
git add src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx
git commit -m "test: require REST API new-tab links"
```

### Task 2: Render REST API jumps as safe new-tab anchors

**Files:**
- Modify: `src/lib/docs-page.server.ts:1330-1345`
- Test: `src/lib/docs-page.server.test.ts`
- Test: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [ ] **Step 1: Add the external node fields to REST jumps**

Change REST node creation to:

```ts
if (links.restUrl) {
  jumpNodes.push({
    external: true,
    href: links.restUrl,
    id: links.restUrl,
    linked: true,
    title: 'RESTful API',
    type: 'page',
    url: links.restUrl,
  });
}
```

Do not change SDK nodes, registry entries, jump ordering, duplicate filtering, legacy filtering, or metadata.

- [ ] **Step 2: Run focused tests and verify GREEN**

```bash
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external SDK API jumps|linked external REST API jumps"
bun run test src/lib/reference-api-navigation.test.ts
```

Expected: server payload, SDK renderer, REST renderer, and 20-product matrix tests all pass.

- [ ] **Step 3: Run type and formatting checks**

```bash
bun run types:check
bunx biome check src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx
git diff --check origin/main...HEAD
```

Expected: production code and new changed lines pass. Existing whole-file test diagnostics, if any, remain explicitly reported rather than triggering unrelated formatting changes.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/lib/docs-page.server.ts
git commit -m "fix: open REST API jumps in new tabs"
```

### Task 3: Verify, preview, and update PR #1028

**Files:**
- Runtime screenshot: `/tmp/api-sidebar-rtc.png`
- Runtime screenshot: `/tmp/api-sidebar-on-premise-recording.png`
- Runtime screenshot: `/tmp/api-sidebar-cloud-recording.png`

- [ ] **Step 1: Run final automated verification**

```bash
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external SDK API jumps|linked external REST API jumps"
bun run types:check
git diff --check origin/main...HEAD
bun run test
bun run lint
```

Expected repository baseline on 2026-08-25: focused tests and types pass; full tests retain 31-32 unrelated failures depending on the known `source.server` concurrency fluctuation; lint retains unrelated repository diagnostics. No task-specific failure is allowed.

- [ ] **Step 2: Run final two-axis code review**

Use fixed point `origin/main`. Spec review checks all 18 REST-capable products inherit the external node contract without changing classification or order. Quality review checks safe `_blank` anchors, test reliability, and absence of title-based renderer special cases. Resolve every Critical or Important finding and re-run affected tests.

- [ ] **Step 3: Start the local documentation site**

```bash
bun run dev -- --host 127.0.0.1 --port 4310
```

Expected: `http://127.0.0.1:4310` is available until browser verification completes.

- [ ] **Step 4: Use `agent-browser` for visual and tab verification**

Read `.agents/skills/agent-browser/SKILL.md`. Attempt to load the installed CLI's `core` workflow; if version 0.25.4 reports `Skill not found: core`, use `agent-browser --help` as the documented compatibility fallback.

Use session `api-sidebar`, viewport `1440 × 1000`, and light mode. Re-capture:

```text
/en/realtime-media/rtc                  -> /tmp/api-sidebar-rtc.png
/en/realtime-media/on-premise-recording -> /tmp/api-sidebar-on-premise-recording.png
/en/realtime-media/cloud-recording      -> /tmp/api-sidebar-cloud-recording.png
```

For RTC, record the initial tab list, click `RESTful API`, and verify:

```text
Original tab: /en/realtime-media/rtc
New tab:      /en/api-reference/api-ref/rtc
```

Return to the RTC tab, click `SDK API reference`, and verify another new tab opens at `/en/api-reference/api-ref` while the product-guide tab remains.

For Cloud Recording, click `RESTful API` and verify a new tab opens at `/en/api-reference/api-ref/cloud-recording` while the original Cloud Recording tab remains. Confirm `RESTful authentication` remains visible in the original sidebar.

Run browser `errors` and `console`, close the browser session, and stop the dev server. Inspect all three PNGs to confirm the API ordering, chevrons, labels, and neighboring Reference pages remain clear and unobstructed.

- [ ] **Step 5: Push and update the existing PR**

```bash
git fetch origin main
git push origin codex/api-reference-guide-links
gh pr view 1028 --json url,baseRefName,headRefName,state
```

Update PR #1028 verification text so both REST and SDK are documented as new-tab jumps. Provide the three refreshed screenshots in the user handoff and keep the worktree for review changes.
