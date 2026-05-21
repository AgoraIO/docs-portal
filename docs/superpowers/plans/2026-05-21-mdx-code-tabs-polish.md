# MDX Code Tabs Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MDX tabs and code blocks compact, theme-consistent, and compatible with Fumadocs rehype-code output.

**Architecture:** Keep Shiki in the Fumadocs compile-time pipeline and render the generated `.shiki`, `.line`, `icon`, `title`, and line-number attributes through local MDX components. Keep document chrome on MiSans, code content on monospace, and use a temporary MDX fixture only for browser validation.

**Tech Stack:** React 19, Radix tabs, Fumadocs MDX/rehype-code, Shiki via fumadocs-core, Vitest, Tailwind CSS v4.

---

### Task 1: MDX Code Component Contract

**Files:**
- Modify: `src/components/mdx.test.tsx`
- Modify: `src/components/mdx.tsx`

- [ ] **Step 1: Write failing tests for code block metadata**

Add tests proving `pre` renders a title, icon HTML, copy button, no line-number state by default, and explicit line-number state when `data-line-numbers` is passed.

- [ ] **Step 2: Run the focused test**

Run: `bun test src/components/mdx.test.tsx`
Expected: FAIL because `Pre` currently ignores `title`, `icon`, and explicit line-number attributes.

- [ ] **Step 3: Implement the minimal component changes**

Update `Pre` to accept Fumadocs rehype-code props, render an optional header, preserve Shiki children, and only add line numbering classes when requested. Add `CodeBlockTabs`, `CodeBlockTabsList`, `CodeBlockTabsTrigger`, and `CodeBlockTab` wrappers that follow the existing MDX tabs default-value behavior.

- [ ] **Step 4: Run the focused test again**

Run: `bun test src/components/mdx.test.tsx`
Expected: PASS.

### Task 2: MDX Code Tab Generation

**Files:**
- Modify: `source.config.ts`
- Modify: `src/components/mdx.test.tsx`

- [ ] **Step 1: Write a failing component availability test**

Assert `getMDXComponents()` exposes `CodeBlockTabs`, `CodeBlockTabsList`, `CodeBlockTabsTrigger`, and `CodeBlockTab`.

- [ ] **Step 2: Run the focused test**

Run: `bun test src/components/mdx.test.tsx`
Expected: FAIL until the new components are exported.

- [ ] **Step 3: Switch remark code tabs to Fumadocs code tab names**

Change `remarkCodeTabOptions.Tabs` from `Tabs` to `CodeBlockTabs` so generated code-tab groups use the code-specific wrappers.

- [ ] **Step 4: Run MDX/type generation**

Run: `bun run types:check`
Expected: PASS.

### Task 3: Compact Visual Polish

**Files:**
- Modify: `src/styles/app.css`

- [ ] **Step 1: Replace heavy code block styles**

Use neutral shell surfaces, compact padding, 8-10px radius, 1px border, restrained hover, and horizontal scrolling. Keep Shiki token colors and only style the surrounding chrome.

- [ ] **Step 2: Replace heavy MDX tabs styles**

Make MDX tabs compact and flush with their content. Remove card-like tab list styling and avoid font-weight changes that cause width jumps.

- [ ] **Step 3: Run lint on changed source**

Run: `bun run lint`
Expected: PASS.

### Task 4: Quickstart Structure Fix and Browser Fixture

**Files:**
- Modify: `content/docs/en/ai/get-started/quickstart.mdx`
- Temporarily create/delete: `content/docs/en/ai/get-started/test-mdx-comps.mdx`
- Temporarily modify/revert: `content/docs/en/ai/get-started/meta.json`

- [ ] **Step 1: Fix the quickstart tabs nesting**

Close the Windows install tab before `## Sign in, scaffold, and run` so the rest of the page is outside the install tabs.

- [ ] **Step 2: Add temporary fixture**

Create `test-mdx-comps.mdx` with titled code, icon-bearing code, explicit line numbers, plain code, and generated code tabs; add it to `meta.json`.

- [ ] **Step 3: Validate in browser on port 3000**

Run or reuse the dev server at `http://localhost:3000`. Check `/en/ai/get-started/quickstart` and `/en/ai/get-started/test-mdx-comps` for compact tabs, neutral code blocks, readable Shiki tokens, and no layout overflow.

- [ ] **Step 4: Delete fixture**

Remove `test-mdx-comps.mdx` and revert `meta.json` to its original pages.

### Task 5: Final Verification

**Files:**
- All changed files

- [ ] **Step 1: Run focused tests**

Run: `bun test src/components/mdx.test.tsx`
Expected: PASS.

- [ ] **Step 2: Run type check**

Run: `bun run types:check`
Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: PASS.

- [ ] **Step 4: Review diff**

Run: `git diff --stat && git diff --check`
Expected: no whitespace errors and only scoped files changed.
