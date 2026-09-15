# API Jump New-Tab Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ambiguous right-facing chevron on REST and SDK API new-tab sidebar jumps with an up-right arrow, tooltip, and assistive new-tab text while preserving other sidebar indicators.

**Architecture:** Keep node production and the 20-product API registry unchanged. Extend the generic `SidebarPageLabel` renderer to receive `external` alongside `linked`: `linked + external` renders the new-tab indicator, `linked` alone retains the current right-facing chevron, and method badges remain highest priority.

**Tech Stack:** TypeScript, React 19, Lucide React, TanStack Router, Vitest, Testing Library, Bun, Vite, `agent-browser`.

---

### Task 1: Lock icon and accessibility semantics with failing tests

**Files:**
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx:287-375`

- [ ] **Step 1: Update the SDK new-tab test expectation**

Keep the existing linked external SDK node and new-tab anchor assertions. Change the link lookup and add the visual/accessibility contract:

```ts
const link = await screen.findByRole('link', {
  name: 'SDK API reference (opens in a new tab)',
});
const newTabIcon = link.querySelector('svg.lucide-arrow-up-right');

expect(link).toHaveAttribute('href', '/en/api-reference/api-ref');
expect(link).toHaveAttribute('rel', 'noreferrer noopener');
expect(link).toHaveAttribute('target', '_blank');
expect(link).toHaveAccessibleName(
  'SDK API reference (opens in a new tab)',
);
expect(screen.getByTitle('Opens in a new tab')).toContainElement(newTabIcon);
expect(newTabIcon).toHaveAttribute('aria-hidden', 'true');
expect(link.querySelector('svg.lucide-chevron-down')).toBeNull();
```

- [ ] **Step 2: Update the REST new-tab test expectation**

Keep the REST node and `_blank`/safe-rel assertions. Require the same up-right indicator and accessible name:

```ts
const link = await screen.findByRole('link', {
  name: 'RESTful API (opens in a new tab)',
});

expect(link.querySelector('svg.lucide-arrow-up-right')).toBeInTheDocument();
expect(link.querySelector('svg.lucide-chevron-down')).toBeNull();
expect(link).toHaveAccessibleName('RESTful API (opens in a new tab)');
expect(screen.getByTitle('Opens in a new tab')).toBeInTheDocument();
```

- [ ] **Step 3: Strengthen the internal-linked regression**

Keep the existing `API recipes` internal linked node. Assert it retains the current indicator and does not acquire new-tab semantics:

```ts
expect(link.querySelector('svg.lucide-chevron-down')).toHaveClass(
  '-rotate-90',
);
expect(link.querySelector('svg.lucide-arrow-up-right')).toBeNull();
expect(link).toHaveAccessibleName('API recipes');
expect(screen.queryByText('(opens in a new tab)')).toBeNull();
```

- [ ] **Step 4: Add an ordinary external-link regression**

Add an external node without `linked`:

```ts
const tree: DocsSidebarNode[] = [
  {
    external: true,
    href: 'https://example.com/resources',
    id: 'https://example.com/resources',
    title: 'External Resource',
    type: 'page',
    url: 'https://example.com/resources',
  },
];
```

Assert the native anchor still opens safely in a new tab but receives no linked-jump indicator:

```ts
expect(link).toHaveAttribute('target', '_blank');
expect(link).toHaveAttribute('rel', 'noreferrer noopener');
expect(link.querySelector('svg')).toBeNull();
expect(link).toHaveAccessibleName('External Resource');
```

- [ ] **Step 5: Add a method-badge priority regression**

Use an endpoint node with `method: 'POST'`, `linked: true`, `external: true`, and a safe external `href`. Assert:

```ts
expect(screen.getByText('POST')).toBeVisible();
expect(link.querySelector('svg.lucide-arrow-up-right')).toBeNull();
expect(link.querySelector('svg.lucide-chevron-down')).toBeNull();
expect(screen.queryByText('(opens in a new tab)')).toBeNull();
```

This proves HTTP method badges retain precedence over linked/external indicators.

- [ ] **Step 6: Run focused tests and verify RED**

```bash
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "new tab|linked internal|ordinary external|method badge"
```

Expected: SDK and REST new-tab tests fail because the renderer still emits the rotated chevron and no assistive text. Internal-linked, ordinary-external, and method-priority tests document preserved behavior.

- [ ] **Step 7: Commit the failing contract tests**

```bash
git diff --check
git add src/components/docs-shell/DocsSidebarTree.test.tsx
git commit -m "test: define API jump icon semantics"
```

### Task 2: Render semantic new-tab indicators

**Files:**
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx:1-15`
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx:695-845`
- Test: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [ ] **Step 1: Import the up-right icon**

Change the Lucide import to:

```ts
import { ArrowUpRightIcon, ChevronDownIcon } from 'lucide-react';
```

- [ ] **Step 2: Pass external semantics into the label**

Add `external={external}` to the `SidebarPageLabel` invocation:

```tsx
<SidebarPageLabel
  external={external}
  linked={linked}
  method={method}
  title={getSidebarDisplayTitle(title, url)}
/>
```

Add `external?: boolean` to `SidebarPageLabel` props.

- [ ] **Step 3: Implement indicator priority and accessibility**

Keep the method badge branch first. Replace the current linked branch with:

```tsx
{method ? (
  <span className="ml-auto shrink-0 rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] leading-none text-[color:var(--ink-4)]">
    {method}
  </span>
) : linked && external ? (
  <>
    <span className="sr-only"> (opens in a new tab)</span>
    <ArrowUpRightIcon
      aria-hidden="true"
      className="ml-auto size-4 shrink-0 text-[color:var(--ink-4)]"
      title="Opens in a new tab"
    />
  </>
) : linked ? (
  <ChevronDownIcon
    aria-hidden="true"
    className="ml-auto size-4 shrink-0 -rotate-90 text-[color:var(--ink-4)]"
  />
) : null}
```

Do not inspect `title`, URL prefixes, or product values. Do not add fields to sidebar nodes or the API registry.

- [ ] **Step 4: Run focused and complete sidebar tests**

```bash
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "new tab|linked internal|ordinary external|method badge"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: focused icon/accessibility tests and the complete sidebar suite pass.

- [ ] **Step 5: Run types and formatting checks**

```bash
bun run types:check
bunx biome check src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
git diff --check origin/main...HEAD
```

Expected: task files pass without new diagnostics.

- [ ] **Step 6: Commit the renderer change**

```bash
git add src/components/docs-shell/DocsSidebarTree.tsx
git commit -m "fix: distinguish API new-tab jumps"
```

### Task 3: Verify, preview, and update PR #1028

**Files:**
- Runtime screenshot: `/tmp/api-sidebar-rtc.png`
- Runtime screenshot: `/tmp/api-sidebar-on-premise-recording.png`
- Runtime screenshot: `/tmp/api-sidebar-cloud-recording.png`

- [ ] **Step 1: Run final automated verification**

```bash
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
bun run test src/components/docs-overview/mdx-components.test.tsx
bun run types:check
bunx biome check src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
git diff --check origin/main...HEAD
bun run test
bun run lint
```

Expected: all task-focused suites and type checks pass. Record unrelated full-suite and lint baselines without treating them as task success.

- [ ] **Step 2: Run final two-axis code review**

Use fixed point `origin/main`. Spec review checks `linked + external` uses the up-right icon and accessibility text, internal linked retains the chevron, ordinary external links remain unadorned, and method badges retain priority. Quality review checks generic semantic branching, accessible names/tooltips, Lucide icon usage, test reliability, and absence of title-based special cases.

- [ ] **Step 3: Start the local docs site**

```bash
bun run dev -- --host 127.0.0.1 --port 4310
```

Expected: `http://127.0.0.1:4310` is available until browser verification completes.

- [ ] **Step 4: Verify rendered semantics with `agent-browser`**

Read `.agents/skills/agent-browser/SKILL.md`; if the installed 0.25.4 CLI cannot load `core`, use `agent-browser --help` as its compatibility fallback.

Use session `api-jump-icons`, viewport `1440 × 1000`, and light mode. Inspect:

```text
/en/realtime-media/rtc
/en/realtime-media/on-premise-recording
/en/realtime-media/cloud-recording
```

For every REST/SDK jump present, verify:

- `target="_blank"` and safe `rel` remain present.
- The trailing SVG has the Lucide `arrow-up-right` class.
- No rotated chevron is present inside the API link.
- The link accessible name ends with `(opens in a new tab)`.
- The icon exposes the native tooltip `Opens in a new tab` while remaining `aria-hidden`.

Verify an internal linked Build/Reference navigation item still uses the rotated chevron and does not contain new-tab text.

- [ ] **Step 5: Capture and inspect refreshed sidebar screenshots**

Overwrite:

```text
/tmp/api-sidebar-rtc.png
/tmp/api-sidebar-on-premise-recording.png
/tmp/api-sidebar-cloud-recording.png
```

Capture each sidebar with the `Reference` heading, API entries, up-right arrows, and adjacent ordinary Reference pages visible. Inspect every PNG at original resolution for readable labels, correct icon shape, alignment, clipping, overlap, and accidental chevrons on the API entries.

Run browser errors/console, close the browser session, stop Vite, and confirm port 4310 is released.

- [ ] **Step 6: Push and update the existing PR**

```bash
git fetch origin main
git push origin codex/api-reference-guide-links
gh pr view 1028 --json url,baseRefName,headRefName,state
```

Update PR #1028 with the new icon/accessibility behavior, focused test results, visual verification, and refreshed screenshots. Keep the worktree for review feedback.
