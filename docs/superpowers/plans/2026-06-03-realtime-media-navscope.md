# Realtime Media Nav Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `navScope: {}` on `content/docs/en/realtime-media/rtc/meta.json` switch Voice & Video pages into an independent sidebar after entry, while keeping the full Voice & Video subtree visible in the parent Realtime & Media sidebar.

**Architecture:** Preserve the existing metadata-driven nav-scope model and do not add new `navScope` fields. A plain `navScope: {}` marks a folder as an independent sidebar scope without a version switcher. Parent sidebar rendering is inferred from existing tree shape:

- Versioned nav scopes stay compressed to a single folder entry in the parent sidebar.
- Plain nav scopes with no child folders stay compressed to a single folder entry.
- Plain nav scopes with ordinary child folders render as the full folder subtree in the parent sidebar, then switch to the scoped sidebar when a page inside the folder is active.

The fix should be in the nav-scope/sidebar resolver, with regression coverage that models the real `realtime-media` tree shape including separators and nested folders.

**Tech Stack:** TypeScript, Vitest, Fumadocs page-tree shapes, TanStack Start docs payload loaders.

---

### Task 1: Reproduce The Plain RTC Scope Sidebar Bug

**Files:**
- Modify: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that build a `realtime-media` page tree with an `rtc` folder marked by `navScope: {}`. Assert that `/en/realtime-media/rtc` gets a `Voice & Video` scoped sidebar with `/en/realtime-media/rtc`, `/en/realtime-media/rtc/quick-start`, and `/en/realtime-media/rtc/audio/audio-profiles-and-quality`, while excluding sibling `/en/realtime-media/rtm`.

Also assert that `/en/realtime-media` keeps the `Voice & Video` subtree expanded in the parent sidebar, including nested RTC child URLs and sibling `/en/realtime-media/rtm`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts -t "Voice & Video"
```

Expected: FAIL showing the real bug, or PASS if the root cause is outside mocked payload logic.

### Task 2: Fix Plain Scope Sidebar Resolution

**Files:**
- Modify: `src/lib/docs-nav-scope.ts`

- [ ] **Step 1: Implement the minimal resolver fix**

Keep `navScope: {}` truthy as a scope marker, but infer parent-sidebar behavior from existing metadata and tree shape. Do not require `versions` for `sidebarRoot`; only versioned scopes should swap `sidebarRoot` to a version folder, and no schema field should be added for this parent-sidebar mode.

- [ ] **Step 2: Run the focused regression**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts -t "Voice & Video"
```

Expected: PASS.

- [ ] **Step 3: Run adjacent nav tests**

Run:

```bash
bunx vitest run src/lib/docs-nav-scope.test.ts src/lib/docs-page.server.test.ts
```

Expected: PASS.

### Task 3: Apply Content Metadata And Verify The Real UI

**Files:**
- Modify: `content/docs/en/realtime-media/rtc/meta.json`

- [ ] **Step 1: Add the plain nav scope**

Set:

```json
{
  "title": "Voice & Video",
  "navScope": {},
  "pages": [
    "index",
    "quick-start",
    "audio",
    "video",
    "channel-and-connection",
    "security",
    "quality-and-diagnostics",
    "media",
    "reference"
  ]
}
```

- [ ] **Step 2: Run verification**

Run:

```bash
bunx vitest run src/lib/docs-nav-scope.test.ts src/lib/docs-page.server.test.ts src/lib/docs-journeys.test.ts
bun run types:check
NODE_OPTIONS='--max-old-space-size=8192' bun run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Browser-check rendered navigation**

Run:

```bash
NODE_OPTIONS='--max-old-space-size=8192' bun run dev --host 127.0.0.1
```

Open `/en/realtime-media/overview` and confirm the desktop sidebar shows `Voice & Video` expanded with child entries such as `Quick Start`, `Audio`, and `Video`, alongside sibling product areas such as `Signaling`. Open `/en/realtime-media/rtc` and confirm the desktop sidebar switches to the Voice & Video subtree with `Quick Start`, `Audio`, `Video`, and no sibling `RTM` section content.

### Task 4: Commit The Fix

**Files:**
- Commit: `src/lib/docs-page.server.test.ts`
- Commit: `src/lib/docs-nav-scope.ts`
- Commit: `content/docs/en/realtime-media/rtc/meta.json`
- Commit: `docs/superpowers/plans/2026-06-03-realtime-media-navscope.md`

- [ ] **Step 1: Check diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intended files changed.

- [ ] **Step 2: Commit**

Run:

```bash
git add src/lib/docs-page.server.test.ts src/lib/docs-nav-scope.ts content/docs/en/realtime-media/rtc/meta.json docs/superpowers/plans/2026-06-03-realtime-media-navscope.md
git commit -m "fix: preserve plain docs nav scopes"
```
