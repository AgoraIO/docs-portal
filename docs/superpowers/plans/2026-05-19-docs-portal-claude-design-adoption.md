# Docs Portal Claude Design Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the confirmed Claude standalone docs visual design to the current `docs-portal` shell without replacing the real docs content tree, routing, search, or i18n model.

**Architecture:** Keep the current TanStack Start + Fumadocs data flow and update the shell in focused slices: theme tokens first, then layout chrome, then server-derived page metadata, then article/footer chrome. Browser verification with `agent-browser` is part of acceptance because the change is primarily visual and layout-sensitive.

**Tech Stack:** TanStack Start, React 19, Fumadocs MDX, Tailwind CSS v4, shadcn-style local UI components, Vitest, Testing Library, `agent-browser`.

---

## File Structure

- Modify `src/styles/app.css`: reference theme tokens, shadcn/Fumadocs token bridge, prose, code, table, sidebar, TOC, pager, and feedback styles.
- Modify `src/components/docs-shell/DocsShell.tsx`: header density, always-visible tabs strip, shell grid classes, mobile drawer styling hooks.
- Modify `src/components/docs-shell/DocsSidebar.tsx`: 256px transparent sidebar rail and scroll container classes.
- Modify `src/components/docs-shell/DocsSidebarTree.tsx`: reference-style group labels, active indicators, link classes, and long-label behavior.
- Modify `src/components/docs-shell/DocsMainColumn.tsx`: main padding/readable width wrapper, helpful feedback bar, reference pager cards.
- Modify `src/components/docs-shell/DocsTocRail.tsx`: 220px transparent TOC rail.
- Modify `src/components/docs-shell/DocsContent.tsx`: breadcrumb, reading time pill, page header layout.
- Modify `src/lib/docs-page.server.ts`: compute reading time and breadcrumb from existing page/tree data.
- Modify `src/lib/docs-tree.ts`: add small helper for sidebar ancestor lookup if needed.
- Modify `src/routes/$locale/$tab/$.tsx` and `src/routes/$locale/$tab/index.tsx`: pass breadcrumb and reading time into `DocsContent`.
- Modify `src/lib/i18n/resources/en/common.ts` and `src/lib/i18n/resources/zh-CN/common.ts`: localized labels for reading time, breadcrumb fallback, feedback, pager.
- Modify tests:
  - `src/components/docs-shell/DocsShell.test.tsx`
  - `src/components/docs-shell/DocsSidebarTree.test.tsx`
  - `src/components/docs-shell/DocsSearchDialog.test.tsx` only if search trigger accessible text changes.
  - `src/lib/docs-page.server.test.ts`
  - Add `src/components/docs-shell/DocsContent.test.tsx` if current shell tests cannot cover the new page header cleanly.

## Task 1: Align Theme Tokens

**Files:**
- Modify: `src/styles/app.css`
- Test: `src/lib/theme/theme-preference.test.ts` only if existing theme semantics break

- [ ] **Step 1: Add failing theme token assertions**

Add a narrow test if there is an existing theme-token test surface. If not practical in Happy DOM, skip CSS computed-token unit testing and rely on browser verification in Task 6.

Preferred minimal assertion if feasible:

```ts
expect(document.documentElement).toHaveClass('light');
expect(getComputedStyle(document.body).fontFamily).toContain('MiSans');
```

- [ ] **Step 2: Update light and dark token blocks**

In `src/styles/app.css`, replace the current teal-centric tokens with the confirmed reference tokens:

```css
:root {
  --bg: #fbfaf7;
  --bg-card: #ffffff;
  --bg-elev: #ffffff;
  --bg-sunken: #f4f2ec;
  --ink-1: #0e0f12;
  --ink-2: #2a2c33;
  --ink-3: #5b606b;
  --ink-4: #8a8f9a;
  --line: rgba(14, 15, 18, 0.075);
  --line-strong: rgba(14, 15, 18, 0.12);
  --accent-brand: oklch(0.56 0.18 280);
  --accent-brand-soft: oklch(0.56 0.18 280 / 0.10);
  --accent-brand-ring: oklch(0.56 0.18 280 / 0.28);
}

.dark {
  --bg: #0b0c0e;
  --bg-card: #111316;
  --bg-elev: #15171b;
  --bg-sunken: #0a0b0d;
  --ink-1: #f3f4f6;
  --ink-2: #d8dae0;
  --ink-3: #9aa0ab;
  --ink-4: #6c7280;
  --line: rgba(255, 255, 255, 0.07);
  --line-strong: rgba(255, 255, 255, 0.12);
  --accent-brand: oklch(0.75 0.16 280);
  --accent-brand-soft: oklch(0.7 0.18 280 / 0.16);
}
```

Map existing variables to these:

```css
--background: var(--bg);
--foreground: var(--ink-1);
--card: var(--bg-card);
--card-foreground: var(--ink-1);
--popover: var(--bg-card);
--popover-foreground: var(--ink-1);
--primary: var(--accent-brand);
--primary-foreground: #ffffff;
--secondary: var(--bg-sunken);
--secondary-foreground: var(--ink-1);
--muted: var(--bg-sunken);
--muted-foreground: var(--ink-3);
--accent: var(--bg-sunken);
--accent-foreground: var(--ink-1);
--border: var(--line);
--input: var(--line-strong);
--ring: var(--accent-brand-ring);
```

Keep `--color-fd-*` mapped to the shadcn variables.

- [ ] **Step 3: Remove decorative body gradients**

Replace the current body radial/linear gradient with:

```css
html {
  background: var(--bg);
}

body {
  background: var(--bg);
  color: var(--ink-2);
}
```

- [ ] **Step 4: Update prose primitives**

Change prose headings, body copy, links, inline code, code blocks, tables, and blockquotes to use `--ink-*`, `--bg-*`, `--line*`, and `--accent-brand`.

- [ ] **Step 5: Run focused verification**

Run:

```bash
bun run test src/lib/theme/theme-preference.test.ts
```

Expected: PASS if the file exists and was touched. If there is no meaningful theme test change, run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/styles/app.css src/lib/theme/theme-preference.test.ts src/components/docs-shell/DocsShell.test.tsx
git commit -m "style: align docs portal theme tokens"
```

Only add files that changed.

## Task 2: Restyle Header, Tabs, Shell Grid, Sidebar, And TOC

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify: `src/components/docs-shell/DocsSidebar.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify: `src/components/docs-shell/DocsTocRail.tsx`
- Modify: `src/styles/app.css`
- Test: `src/components/docs-shell/DocsShell.test.tsx`
- Test: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [ ] **Step 1: Update tests for visible mobile tabs and shell regions**

In `DocsShell.test.tsx`, keep the current expectations and add assertions that:

```ts
expect(screen.getByTestId('docs-tabs-strip')).toBeInTheDocument();
expect(screen.getByTestId('docs-body-shell')).toHaveClass('lg:grid');
expect(screen.getByTestId('docs-sidebar')).toHaveStyle({
  '--sidebar-width': '16rem',
});
```

If exact class names differ, assert the stable test ids and accessible tabs instead of brittle utility strings.

- [ ] **Step 2: Run the failing focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: FAIL on the new layout/style expectations.

- [ ] **Step 3: Update `DocsShell.tsx` header and tabs**

Change the header to reference density:

- Header row: `h-[52px]`, max width `1440px`, desktop px `7` or `28px`.
- Search wrapper: `w-80` on wide desktop.
- Language and theme controls: compact 32-34px height.
- Tabs strip: remove `hidden ... lg:block`; keep sticky/horizontal scroll for mobile and desktop.
- Shell body: switch desktop layout to grid:

```tsx
className="mx-auto grid w-full max-w-[1440px] min-w-0 grid-cols-1 px-4 lg:h-[var(--docs-shell-body-height)] lg:grid-cols-[256px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[256px_minmax(0,1fr)_220px]"
```

- [ ] **Step 4: Update `DocsSidebar.tsx`**

Use a transparent desktop rail:

```tsx
style={{ '--sidebar-width': '16rem' } as React.CSSProperties}
className="hidden bg-transparent lg:flex"
```

The scroll content should keep `data-testid="docs-sidebar-scroll"` and use padding equivalent to `py-6 pr-3`.

- [ ] **Step 5: Update `DocsSidebarTree.tsx`**

Use classes equivalent to:

- Section label: uppercase `text-[11px] font-semibold tracking-[0.06em] text-[color:var(--ink-4)]`.
- Active page: `bg-[color:var(--accent-brand-soft)] text-[color:var(--accent-brand)] font-semibold` with a `before:` 2px indicator.
- Normal page: `text-[color:var(--ink-3)] hover:bg-card hover:text-[color:var(--ink-1)]`.
- Nested children keep border-left using `var(--line)`.

Preserve existing behavior:

- Collapsible sections.
- Realtime section default-open rule.
- SDK quickstart merge.
- Long label wrapping/clamping.

- [ ] **Step 6: Update `DocsTocRail.tsx`**

Use width `220px`, transparent background, no heavy border. Keep the test id.

- [ ] **Step 7: Update TOC link styles in `DocsContent.tsx` or CSS**

TOC links should use a muted left border and accent active/hover state. There is no active-heading observer in this phase unless already present, so hover/focus styling is enough.

- [ ] **Step 8: Run focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsSidebar.tsx src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsTocRail.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/styles/app.css
git commit -m "style: apply reference docs shell layout"
```

Only add files that changed.

## Task 3: Add Server Page Metadata For Breadcrumb And Reading Time

**Files:**
- Modify: `src/lib/docs-page.server.ts`
- Modify: `src/lib/docs-tree.ts`
- Modify: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Add failing server tests**

In `src/lib/docs-page.server.test.ts`, extend the mocked page text and expected payload:

```ts
await expect(
  loadDocsPagePayload('en', 'introduction', ['about-agora']),
).resolves.toMatchObject({
  breadcrumb: [
    { title: 'Introduction', url: '/en/introduction/about-agora' },
    { title: 'About Agora', url: '/en/introduction/about-agora' },
  ],
  readingTime: {
    minutes: 1,
    words: expect.any(Number),
  },
});
```

If the breadcrumb includes a nearest section from the sidebar, assert the exact real helper result. Avoid locale display labels unless they already exist in the tree data.

- [ ] **Step 2: Run the failing server test**

Run:

```bash
bun run test src/lib/docs-page.server.test.ts
```

Expected: FAIL because `breadcrumb` and `readingTime` do not exist.

- [ ] **Step 3: Add metadata helpers**

In `src/lib/docs-page.server.ts`, compute text once:

```ts
const processedText = await readProcessedText(page);
const toc = await resolvePageToc(page, processedText);
```

Add:

```ts
function getReadingTime(text: string | undefined) {
  const words = (text ?? '')
    .replace(/[\u4e00-\u9fff]/g, ' $& ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    minutes: Math.max(1, Math.ceil(words / 220)),
    words,
  };
}
```

Use `220` words/minute for English and mixed text. It is simple and deterministic.

- [ ] **Step 4: Add breadcrumb helper**

Prefer a helper in `src/lib/docs-tree.ts` that can walk `DocsSidebarNode[]`:

```ts
export function getSidebarBreadcrumb(
  nodes: DocsSidebarNode[],
  activePath: string,
): { title: string; url?: string }[] {
  // Depth-first search through section/page nodes.
}
```

Rules:

- Include ancestor section titles.
- Include the active page.
- If no sidebar match exists, fallback to `[{ title: page.data.title ?? slug, url: page.url }]`.
- Do not include fake route labels.

- [ ] **Step 5: Add metadata to payload**

Return:

```ts
breadcrumb,
readingTime: getReadingTime(processedText),
```

Do not change `contentPath`, `pages`, `sidebar`, `tabs`, or `toc` semantics.

- [ ] **Step 6: Run focused server tests**

Run:

```bash
bun run test src/lib/docs-page.server.test.ts src/lib/docs-tree.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/docs-page.server.ts src/lib/docs-tree.ts src/lib/docs-page.server.test.ts src/lib/docs-tree.test.ts
git commit -m "feat: derive docs page chrome metadata"
```

Only add files that changed.

## Task 4: Render Page Header, Feedback, And Pager

**Files:**
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Modify: `src/components/docs-shell/DocsMainColumn.tsx`
- Modify: `src/routes/$locale/$tab/$.tsx`
- Modify: `src/routes/$locale/$tab/index.tsx`
- Modify: `src/lib/i18n/resources/en/common.ts`
- Modify: `src/lib/i18n/resources/zh-CN/common.ts`
- Modify: `src/styles/app.css`
- Test: `src/components/docs-shell/DocsShell.test.tsx`
- Add or modify: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Add i18n keys**

In both common resource files, add:

```ts
docs: {
  readingTime: 'Reading time · {{count}} min',
  feedback: 'Was this page helpful?',
  feedbackYes: 'Yes',
  feedbackNo: 'No',
}
```

Chinese:

```ts
readingTime: '阅读时间 · {{count}} 分钟',
feedback: '这个页面有帮助吗？',
feedbackYes: '有',
feedbackNo: '没有',
```

- [ ] **Step 2: Add failing component tests**

Create `src/components/docs-shell/DocsContent.test.tsx` if needed. Assert:

```tsx
render(
  <AppProviders>
    <DocsContent
      breadcrumb={[
        { title: 'Introduction', url: '/en/introduction/about-agora' },
        { title: 'About Agora', url: '/en/introduction/about-agora' },
      ]}
      contentPath="en/introduction/about-agora.md"
      description="Build a working mental model."
      readingTime={{ minutes: 1, words: 42 }}
      slug="about-agora"
      title="About Agora"
      toc={[]}
    />
  </AppProviders>,
);

expect(screen.getByRole('heading', { level: 1, name: 'About Agora' })).toBeInTheDocument();
expect(screen.getByText('Reading time · 1 min')).toBeInTheDocument();
expect(screen.getByText('Introduction')).toBeInTheDocument();
```

If `DocsContentBodyClient` is hard to mount in a unit test, mock it.

- [ ] **Step 3: Run failing tests**

Run:

```bash
bun run test src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx
```

Expected: FAIL because props and UI do not exist yet.

- [ ] **Step 4: Update route components**

In both route files, destructure `breadcrumb` and `readingTime` from loader data and pass them to `DocsContent`.

- [ ] **Step 5: Update `DocsContent.tsx`**

Add props:

```ts
breadcrumb?: { title: string; url?: string }[];
readingTime?: { minutes: number; words: number };
```

Render:

- Breadcrumb above h1.
- H1 with reference classes.
- Description as lede.
- Reading time pill below description.
- Separator using `var(--line)` or remove `Separator` and use a CSS border in the meta row.

- [ ] **Step 6: Update `DocsMainColumn.tsx` feedback and pager**

Add a small client component state for feedback selection or keep it local inside `DocsMainColumn` since it is already client-side.

Render feedback before pager:

```tsx
<div className="docs-feedback" data-testid="docs-feedback">
  <span>{t('docs.feedback')}</span>
  <button>{t('docs.feedbackYes')}</button>
  <button>{t('docs.feedbackNo')}</button>
</div>
```

Restyle `FooterLink` into pager card classes. Keep accessible link labels containing `Previous`/`Next` and title so existing tests can be updated minimally.

- [ ] **Step 7: Run focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/i18n/i18n-config.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsMainColumn.tsx 'src/routes/$locale/$tab/$.tsx' 'src/routes/$locale/$tab/index.tsx' src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/styles/app.css
git commit -m "feat: add docs page chrome"
```

Only add files that changed.

## Task 5: Mobile Polish And Regression Coverage

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify: `src/components/docs-shell/DocsMainColumn.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify: `src/styles/app.css`
- Test: `src/components/docs-shell/DocsShell.test.tsx`

- [ ] **Step 1: Add regression assertions for mobile-safe controls**

In `DocsShell.test.tsx`, assert mobile header actions still exist:

```ts
expect(screen.getByTestId('docs-mobile-header-actions')).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
expect(screen.getByTestId('docs-tabs-strip')).toBeInTheDocument();
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx
```

Expected: PASS or FAIL only on expected class/visibility changes.

- [ ] **Step 3: Apply mobile CSS polish**

Ensure:

- Header content does not overflow below `390px`.
- Search is icon-only on mobile via existing mobile trigger.
- Tabs strip is horizontally scrollable and visible.
- Feedback wraps with `flex-wrap`.
- Pager cards stack under narrow width if needed:

```css
@media (max-width: 640px) {
  .docs-pager {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run all focused component tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsSearchDialog.test.tsx src/components/docs-shell/DocsContent.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsMainColumn.tsx src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsShell.test.tsx src/styles/app.css
git commit -m "style: polish docs shell mobile layout"
```

Only add files that changed.

## Task 6: Browser Verification And Final Checks

**Files:**
- No code changes unless verification finds a bug.

- [ ] **Step 1: Run full test suite**

Run:

```bash
bun run test
```

Expected: PASS.

- [ ] **Step 2: Run type check**

Run:

```bash
bun run types:check
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
bun run lint
```

Expected: PASS.

- [ ] **Step 4: Start local dev server**

Run:

```bash
bun run dev --host 127.0.0.1 --port 5173
```

Expected: dev server on `http://127.0.0.1:5173/`. If port is busy, use `5174`.

- [ ] **Step 5: Verify desktop with `agent-browser`**

Run:

```bash
agent-browser open http://127.0.0.1:5173/en/introduction/about-agora
agent-browser set viewport 1440 900
agent-browser wait --load networkidle
agent-browser screenshot /tmp/docs-portal-claude-design-desktop.png --full
```

Then evaluate layout:

```bash
cat <<'EOF' | agent-browser eval --stdin
(() => {
  const box = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  return {
    header: box('[data-testid="docs-main-header-row"]'),
    tabs: box('[data-testid="docs-tabs-strip"]'),
    shell: box('[data-testid="docs-body-shell"]'),
    sidebar: box('[data-testid="docs-sidebar"]'),
    main: box('[data-testid="docs-main-column"]'),
    toc: box('[data-testid="docs-toc-rail"]'),
    feedback: box('[data-testid="docs-feedback"]'),
    bodyBackground: getComputedStyle(document.body).backgroundColor,
  };
})()
EOF
```

Expected:

- Warm background.
- Header around 52px.
- Tabs around 40px.
- Sidebar around 256px.
- TOC around 220px on desktop.
- Feedback visible inside article/footer flow.

- [ ] **Step 6: Verify mobile with `agent-browser`**

Run:

```bash
agent-browser set viewport 390 844
agent-browser reload
agent-browser wait --load networkidle
agent-browser screenshot /tmp/docs-portal-claude-design-mobile-390.png --full
agent-browser set viewport 500 701
agent-browser screenshot /tmp/docs-portal-claude-design-mobile-500.png --full
```

Expected:

- Header and tabs visible.
- Sidebar and TOC hidden.
- No horizontal overflow.
- Breadcrumb, reading time, feedback, and pager fit.

- [ ] **Step 7: Verify sidebar scroll**

Run:

```bash
agent-browser set viewport 1440 900
cat <<'EOF' | agent-browser eval --stdin
(() => {
  const el = document.querySelector('[data-testid="docs-sidebar-scroll"]');
  if (!el) return null;
  const before = { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
  el.scrollTop = 220;
  return { before, after: { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight } };
})()
EOF
```

Expected: `scrollHeight > clientHeight` on long nav pages and `after.scrollTop > 0`.

- [ ] **Step 8: Verify theme toggle**

Use `agent-browser snapshot -i`, click the theme button, then inspect:

```bash
cat <<'EOF' | agent-browser eval --stdin
(() => ({
  htmlClass: document.documentElement.className,
  bodyBg: getComputedStyle(document.body).backgroundColor,
  foreground: getComputedStyle(document.body).color,
}))()
EOF
```

Expected: dark token set applies and controls remain visible.

- [ ] **Step 9: Fix any verification issues and commit**

If browser verification reveals a layout bug, patch the smallest relevant file, rerun the failing test/browser check, and commit:

```bash
git add <changed-files>
git commit -m "fix: polish docs design verification issues"
```

- [ ] **Step 10: Final status**

Run:

```bash
git status --short --branch
```

Expected: clean working tree, branch ahead by the planned commits.
