# Resolve Main Conflicts And Template Build Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the branch conflicts against `origin/main` while preserving the useful docs-shell/content enhancements, then restore the TanStack Start + Fumadocs build contract to match the clean template: automatic prerender discovery and Vercel Nitro output.

**Architecture:** Treat `origin/main` as the content taxonomy source of truth, then reapply this branch's presentation-only enhancements: meta icons, MDX page support, custom MDX components, docs-shell polish, breadcrumbs, and markdown actions. Replace the hand-written docs prerender path list with TanStack Start's automatic prerender crawler and Vercel Nitro preset. Keep `/api/search` as a server handler instead of manually listing it as a prerender page.

**Tech Stack:** TanStack Start, TanStack Router, Nitro Vercel preset, Fumadocs Core, Fumadocs MDX, Vitest, Bun, Biome.

---

## Decisions Locked

- Content/navigation conflicts use `origin/main` as the base source of truth.
- Reapply this branch's icon and section-divider presentation changes onto `origin/main` meta files where the referenced pages still exist.
- Keep `about-agora` as `.mdx`, but start from `origin/main` text and reapply this branch's MDX enhancements: admonitions, `CardGrid`, `FeatureCard`, code sample, and updated absolute links.
- Use template-like build configuration: `tanstackStart({ prerender: { enabled: true } })` and `nitro({ preset: 'vercel' })`.
- Delete the hand-written static docs path machinery.
- Do not list `/api/search` in `tanstackStart.pages`; keep it as a route server handler.
- Change package start semantics away from `serve .output/public`; use `vite preview` for local preview and Vercel prebuilt output for deploy checks.

## File Structure

- `content/docs/**/meta.json`: conflict-resolution target. Preserve `origin/main` page arrays, then add compatible `icon` fields and `[Icon]` section dividers.
- `content/docs/en/introduction/about-agora.mdx`: final English About page. Keep `.mdx`, merge `origin/main` content with branch MDX enhancements.
- `content/docs/zh-CN/introduction/about-agora.mdx`: final Chinese About page. Keep `.mdx`, merge `origin/main` content with branch MDX enhancements.
- `source.config.ts`: preserve branch MDX preset/admonition/code configuration and keep main-compatible `remarkCodeTabOptions` if still required by current content.
- `src/components/mdx.tsx`: merge branch custom callout/card components with `origin/main` tab components.
- `src/components/docs-shell/DocsSidebarTree.tsx`: merge icon/divider handling with main's new default-open behavior.
- `src/components/docs-shell/DocsSidebarTree.test.tsx`: update tests to cover both icon dividers and main's new tree behavior.
- `src/components/docs-shell/**/*.tsx`: preserve branch docs-shell polish and current branch functionality unless it conflicts with main's content assumptions.
- `src/lib/docs-routing.ts`: keep `.md` and `.mdx` source-slug support.
- `src/lib/docs-static-paths.ts`: delete after removing hand-written prerender page enumeration.
- `src/lib/docs-static-paths.test.ts`: delete with the implementation.
- `vite.config.ts`: restore template-like build contract and Vercel preset.
- `package.json`: change `start` to `vite preview`; keep `preview`.
- `bun.lock`: update if dependency/script changes require it.

---

### Task 1: Reproduce And Resolve Merge Conflicts

**Files:**
- Modify: `content/docs/en/ai/meta.json`
- Modify: `content/docs/en/api-reference/meta.json`
- Modify: `content/docs/en/introduction/meta.json`
- Modify: `content/docs/en/realtime-media/meta.json`
- Modify: `content/docs/en/best-practices/meta.json`
- Modify: `content/docs/en/solutions/meta.json`
- Modify: `content/docs/zh-CN/ai/meta.json`
- Modify: `content/docs/zh-CN/api-reference/meta.json`
- Modify: `content/docs/zh-CN/introduction/meta.json`
- Modify: `content/docs/zh-CN/realtime-media/meta.json`
- Modify: `content/docs/zh-CN/best-practices/meta.json`
- Modify: `content/docs/zh-CN/solutions/meta.json`
- Modify: `content/docs/en/introduction/about-agora.mdx`
- Modify: `content/docs/zh-CN/introduction/about-agora.mdx`
- Modify: `source.config.ts`
- Modify: `src/components/mdx.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [ ] **Step 1: Create a checkpoint before merging**

Run:

```bash
git status --short --branch
```

Expected: clean branch state except for any intentionally uncommitted plan files. If the plan file is uncommitted, commit it before starting product conflict work or explicitly keep it staged separately.

- [ ] **Step 2: Start the merge**

Run:

```bash
git fetch origin
git merge --no-ff origin/main
```

Expected: conflicts in the known files from investigation:

```text
content/docs/en/ai/meta.json
content/docs/en/api-reference/meta.json
source.config.ts
src/components/docs-shell/DocsSidebarTree.test.tsx
src/components/docs-shell/DocsSidebarTree.tsx
src/components/mdx.tsx
```

Additional conflicts are possible if `origin/main` moved after this plan was written; inspect them rather than assuming.

- [ ] **Step 3: Resolve content meta conflicts with `origin/main` page arrays**

For each conflicted or changed `content/docs/**/meta.json`:

1. Keep the `origin/main` `pages` entries and ordering.
2. Add the current branch's top-level `icon` where the top-level section still exists.
3. Convert only surviving divider labels to the icon syntax:

```json
"---[BookOpen]Getting Started---"
```

Do not reintroduce pages deleted or moved by `origin/main`.

- [ ] **Step 4: Resolve `about-agora` as `.mdx`**

Use `origin/main` text as the base content and keep the final filename:

```text
content/docs/en/introduction/about-agora.mdx
content/docs/zh-CN/introduction/about-agora.mdx
```

Reapply these branch enhancements only where they still read naturally:

```mdx
:::info[One mental model]
Think of Agora as the realtime layer that keeps people, devices, media, messages, and AI services inside the same live context.
:::

<CardGrid>
  <FeatureCard title="Conversational AI">
    Voice assistants, companions, tutors, support agents, and AI-powered service flows.
  </FeatureCard>
  <FeatureCard title="Realtime audio and video">
    Calls, voice rooms, meetings, classrooms, and live interactive experiences.
  </FeatureCard>
  <FeatureCard title="Messaging and coordination">
    Room chat, shared state, event-driven interaction, and workflow synchronization.
  </FeatureCard>
  <FeatureCard title="Media services">
    Recording, transcription, processing, delivery, and production-grade media pipelines.
  </FeatureCard>
</CardGrid>
```

Use absolute app links such as `/en/ai` and `/en/api-reference/...` to avoid stale relative links after the `.mdx` rename.

- [ ] **Step 5: Resolve `source.config.ts`**

Keep the branch's MDX preset support:

```ts
import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
```

Keep `remarkImageOptions.external = false`, `useImport = false`, code language aliases, and admonition mappings.

If `origin/main` has `remarkCodeTabOptions`, keep it inside `applyMdxPreset` unless build/type-check proves it is incompatible:

```ts
remarkCodeTabOptions: {
  Tabs: 'Tabs',
  parseMdx: true,
},
```

- [ ] **Step 6: Resolve `src/components/mdx.tsx`**

Merge both sides. The final `getMDXComponents()` should expose:

```ts
Tabs,
TabsContent,
TabsList,
TabsTrigger,
Callout,
CalloutContainer,
CalloutDescription,
CalloutTitle,
CardGrid,
FeatureCard,
...components,
```

Preserve the branch's lucide callout icons and custom card components. Preserve main's tab wrappers and `cn()` styling.

- [ ] **Step 7: Resolve `DocsSidebarTree` conflict**

Keep both behavior branches:

```ts
const defaultOpen =
  !node.collapsible ||
  node.children.some((child) => isNodeActive(child, activePath)) ||
  node.title === 'Build';
```

Also preserve branch logic that parses configured icons from titles like:

```text
---[BookOpen]Getting Started---
```

- [ ] **Step 8: Resolve sidebar tree tests**

Update tests so they match the merged behavior:

- Icon divider parsing still renders expected label text.
- Main's expected nested group, such as `在线 KTV`, is still available.
- Active child sections remain open by default.
- The `"Build"` section remains open by default if main added that behavior.

- [ ] **Step 9: Check unresolved conflicts**

Run:

```bash
git diff --name-only --diff-filter=U
```

Expected: no output.

- [ ] **Step 10: Run focused tests for conflict-resolution behavior**

Run:

```bash
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx src/lib/docs-routing.test.ts src/lib/docs-tree.test.ts src/lib/docs-page.server.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 11: Commit conflict resolution**

Run:

```bash
git add content source.config.ts src/components/mdx.tsx src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/lib/docs-routing.ts src/lib/docs-tree.ts src/lib/docs-page.server.ts
git commit -m "merge: resolve main docs content conflicts"
```

Expected: merge commit records conflict resolution. If Git is already in a merge state, `git commit` should complete the merge.

---

### Task 2: Restore Template Build Contract

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Delete: `src/lib/docs-static-paths.ts`
- Delete: `src/lib/docs-static-paths.test.ts`
- Modify: `bun.lock` if script/dependency changes update it

- [ ] **Step 1: Remove hand-written static docs path import and mapper**

In `vite.config.ts`, delete:

```ts
import { getStaticDocsPaths } from './src/lib/docs-static-paths';

const staticDocsPages = isTest
  ? []
  : getStaticDocsPaths().map((path) => ({
      path,
      prerender: {
        enabled: true,
      },
    }));
```

- [ ] **Step 2: Replace TanStack Start config with template-like prerender**

Change the non-test plugin config to:

```ts
tanstackStart({
  prerender: {
    enabled: true,
  },
}),
react(),
nitro({
  preset: 'vercel',
}),
```

Do not list `/api/search`, `llms.txt`, `llms-full.txt`, or docs pages in `pages`. If automatic prerender misses docs pages, first investigate route links, redirects, and crawler behavior; do not reintroduce explicit page lists unless that investigation proves the route cannot be discovered or must be explicitly prerendered.

- [ ] **Step 3: Delete static docs path files**

Run:

```bash
git rm src/lib/docs-static-paths.ts src/lib/docs-static-paths.test.ts
```

Expected: both files are gone. Do not leave imports behind.

- [ ] **Step 4: Update package start script**

Change `package.json`:

```json
"start": "vite preview",
"preview": "vite preview"
```

Keep `serve` dependency only if another script or code path still uses it. If nothing uses `serve`, remove it and run `bun install` to update `bun.lock`.

- [ ] **Step 5: Run formatting on touched config files**

Run:

```bash
bunx biome format --write package.json vite.config.ts
```

Expected: formatting succeeds.

- [ ] **Step 6: Run focused config tests**

Run:

```bash
bun run test src/lib/docs-routing.test.ts src/routes/-docs-routing-guards.test.ts
```

Expected: all selected tests pass. The deleted `docs-static-paths.test.ts` should not be referenced.

- [ ] **Step 7: Build and inspect Vercel output**

Run:

```bash
bun run build
```

Expected:

- Build exits with code 0.
- Build output says `Nitro Preset: vercel`.
- Output is under `.vercel/output`, not `.output`.
- Prerender logs include at least `/`, `/en/introduction/about-agora`, and one nested docs URL from the current content tree.

Then run:

```bash
test -f .vercel/output/config.json
test -f .vercel/output/nitro.json
test -f .vercel/output/static/en/introduction/about-agora/index.html
sed -n '1,120p' .vercel/output/nitro.json
```

Expected: `nitro.json` includes `"preset": "vercel"`.

- [ ] **Step 8: Verify search route is not a bad prerendered HTML page**

Run a local preview:

```bash
bun run preview --host 127.0.0.1 --port 4173
```

In another terminal:

```bash
curl -I http://127.0.0.1:4173/api/search
curl -I http://127.0.0.1:4173/en/introduction/about-agora
```

Expected:

- `/en/introduction/about-agora` returns `200`.
- `/api/search` does not return the generic app shell as a fake static page. If it returns JSON or a handler-specific response, keep it. If it returns HTML, inspect `src/routes/api/search.ts` before changing build config.
- Treat `vite preview` as an app behavior smoke test, not a complete Vercel runtime simulation. Keep the `.vercel/output` artifact inspection from Step 7 as the source of truth for build output shape.

- [ ] **Step 9: Commit build contract restoration**

Run:

```bash
git add vite.config.ts package.json bun.lock
git commit -m "fix: restore template vercel prerender build"
```

Expected: commit includes only build-contract and deleted static-path helper changes. The deleted static-path files should already be staged by `git rm`.

---

### Task 3: Full Verification And Browser Smoke Test

**Files:**
- No expected source changes unless verification exposes a bug.

- [ ] **Step 1: Run type check**

Run:

```bash
bun run types:check
```

Expected: `fumadocs-mdx` generation succeeds and `tsc --noEmit` passes.

- [ ] **Step 2: Run full test suite**

Run:

```bash
bun run test
```

Expected: all tests pass.

- [ ] **Step 3: Run lint**

Run:

```bash
bun run lint
```

Expected: Biome passes. If it flags generated files, confirm whether they are expected in this repo before excluding anything.

- [ ] **Step 4: Rebuild after tests**

Run:

```bash
rm -rf .vercel/output .output
bun run build
```

Expected:

- Build exits with code 0.
- `.vercel/output/static/en/introduction/about-agora/index.html` exists.
- `.vercel/output/static/zh-CN/introduction/about-agora/index.html` exists.
- `.vercel/output/functions/__server.func/index.mjs` exists.

- [ ] **Step 5: Browser smoke test**

Use @agent-browser or the available browser automation skill to inspect the local preview.

Run:

```bash
bun run preview --host 127.0.0.1 --port 4173
```

Check:

- `http://127.0.0.1:4173/` redirects or lands on the English docs entry.
- `http://127.0.0.1:4173/en/introduction/about-agora` renders the merged MDX page.
- `http://127.0.0.1:4173/zh-CN/introduction/about-agora` renders.
- Sidebar icons/divider labels render.
- Search dialog opens without crashing.
- A nested page under main's new content tree renders.

- [ ] **Step 6: Commit any verification fixes**

If verification required code fixes, commit them narrowly:

```bash
git add <focused files>
git commit -m "fix: stabilize docs vercel preview"
```

If no fixes were needed, do not create an empty commit.

---

### Task 4: Final Status And Optional Deploy Check

**Files:**
- No source changes expected.

- [ ] **Step 1: Summarize final diff**

Run:

```bash
git status --short --branch
git log --oneline --decorate --max-count=6
git diff --stat origin/main..HEAD
```

Expected: branch is clean and includes merge/build commits.

- [ ] **Step 2: Optional Vercel prebuilt dry inspection**

If Vercel CLI is available and credentials are configured, run:

```bash
vercel build --yes
```

Expected:

- `.vercel/output/config.json` exists.
- `.vercel/output/nitro.json` has `"preset": "vercel"`.
- No Git-triggered deploy assumptions are required.

Do not deploy unless explicitly asked.

- [ ] **Step 3: Final handoff**

Report:

- Conflict files resolved.
- Which content source was used.
- Whether `.mdx` About pages were preserved.
- Build output mode and relevant evidence.
- Verification commands and results.
- Any remaining risk, especially `/api/search` behavior if it needs deeper product validation.
