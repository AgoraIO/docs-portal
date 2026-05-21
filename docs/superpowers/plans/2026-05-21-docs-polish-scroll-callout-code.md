# Docs Polish Scroll Callout Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the docs reading surface by refining scrollbars, adding semantic callout color treatments, and preventing code copy buttons from visually colliding with long code lines.

**Architecture:** Keep this as a narrow style pass. Reuse existing MDX component hooks (`.docs-callout[data-type]`, `.docs-code-copy-button`, `.docs-code-block-root`) and add one shared scrollbar utility class to the three shell scroll containers plus code block scroll areas. No new runtime components or content syntax changes.

**Tech Stack:** TanStack Start, React, Tailwind utility classes, global CSS in `src/styles/app.css`, Vitest + Testing Library, Fumadocs MDX.

---

## File Structure

- Modify: `src/styles/app.css`
  - Add a reusable `.docs-scrollbar` utility for thin, low-contrast scrollbars.
  - Apply matching scrollbar styling to code block `pre` scroll areas.
  - Add semantic callout CSS variables keyed by `.docs-callout[data-type="..."]`.
  - Give `.docs-code-copy-button` a solid elevated background and slightly stronger right-side code padding.
- Modify: `src/components/docs-shell/DocsSidebar.tsx`
  - Add `docs-scrollbar` to the left navigation scroll container.
- Modify: `src/components/docs-shell/DocsMainColumn.tsx`
  - Add `docs-scrollbar` to the desktop middle content scroll container.
- Modify: `src/components/docs-shell/DocsTocRail.tsx`
  - Add `docs-scrollbar` to the TOC rail scroll container.
- Test: `src/components/docs-shell/DocsShell.test.tsx`
  - Update existing scroll-container assertions to include `docs-scrollbar`.
- Test: `src/components/mdx.test.tsx`
  - Add or update callout tests to assert semantic `data-type` normalization remains stable.

---

### Task 1: Shared Docs Scrollbars

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/components/docs-shell/DocsSidebar.tsx`
- Modify: `src/components/docs-shell/DocsMainColumn.tsx`
- Modify: `src/components/docs-shell/DocsTocRail.tsx`
- Test: `src/components/docs-shell/DocsShell.test.tsx`

- [ ] **Step 1: Update the shell scroll-container test**

In `src/components/docs-shell/DocsShell.test.tsx`, extend the existing test that checks `docs-sidebar-scroll`, `docs-main-desktop-scroll`, and `docs-toc-rail` overflow classes:

```tsx
expect(screen.getByTestId('docs-sidebar-scroll')).toHaveClass(
  'docs-scrollbar',
);
expect(screen.getByTestId('docs-main-desktop-scroll')).toHaveClass(
  'docs-scrollbar',
);
expect(screen.getByTestId('docs-toc-rail')).toHaveClass('docs-scrollbar');
```

- [ ] **Step 2: Run the focused shell test and confirm it fails**

Run:

```bash
bunx vitest run src/components/docs-shell/DocsShell.test.tsx
```

Expected: FAIL because the three scroll containers do not have `docs-scrollbar` yet.

- [ ] **Step 3: Add `docs-scrollbar` to the shell scroll containers**

Update classes:

```tsx
// src/components/docs-shell/DocsSidebar.tsx
<SidebarContent
  className="docs-scrollbar h-full min-h-0 overflow-y-auto"
  data-testid="docs-sidebar-scroll"
  ref={scrollContainerRef}
>
```

```tsx
// src/components/docs-shell/DocsMainColumn.tsx
<div
  className="docs-scrollbar hidden h-full min-h-0 overflow-y-auto lg:block"
  data-testid="docs-main-desktop-scroll"
>
```

```tsx
// src/components/docs-shell/DocsTocRail.tsx
<aside
  className="docs-scrollbar hidden h-full min-h-0 w-[220px] shrink-0 overflow-y-auto bg-transparent xl:block"
  data-testid="docs-toc-rail"
>
```

- [ ] **Step 4: Add the shared scrollbar CSS**

Add near the docs shell/global utility section in `src/styles/app.css`:

```css
.docs-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--ink-4) 38%, transparent)
    transparent;
}

.docs-scrollbar::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
}

.docs-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.docs-scrollbar::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--ink-4) 30%, transparent);
  background-clip: content-box;
}

.docs-scrollbar:hover::-webkit-scrollbar-thumb,
.docs-scrollbar:focus-within::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--ink-4) 48%, transparent);
}

.docs-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}
```

- [ ] **Step 5: Run the focused shell test and confirm it passes**

Run:

```bash
bunx vitest run src/components/docs-shell/DocsShell.test.tsx
```

Expected: PASS.

---

### Task 2: Semantic Callout Colors

**Files:**
- Modify: `src/styles/app.css`
- Test: `src/components/mdx.test.tsx`

- [ ] **Step 1: Add or update callout normalization tests**

In `src/components/mdx.test.tsx`, assert that `Callout` keeps the normalized semantic type on the rendered container:

```tsx
it('normalizes callout types for semantic styling', () => {
  const { Callout } = getMDXComponents();
  const { container, rerender } = render(
    <Callout title="Heads up" type="warning">
      Watch this.
    </Callout>,
  );

  expect(container.querySelector('.docs-callout')).toHaveAttribute(
    'data-type',
    'warn',
  );

  rerender(
    <Callout title="Done" type="success">
      It worked.
    </Callout>,
  );

  expect(container.querySelector('.docs-callout')).toHaveAttribute(
    'data-type',
    'ok',
  );
});
```

- [ ] **Step 2: Run the focused MDX test**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx
```

Expected: PASS or only fail if the existing test shape needs a minor import/type adjustment.

- [ ] **Step 3: Replace flat callout styling with semantic variables**

Update `src/styles/app.css` callout block:

```css
.docs-callout {
  --docs-callout-accent: var(--accent-brand);
  --docs-callout-bg: color-mix(in srgb, var(--accent-brand) 6%, var(--bg-card));
  --docs-callout-border: color-mix(
    in srgb,
    var(--accent-brand) 20%,
    var(--line)
  );

  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  margin-block: 1.25rem;
  border: 1px solid var(--docs-callout-border);
  border-radius: 10px;
  background: var(--docs-callout-bg);
  padding: 0.875rem 1rem;
  box-shadow: none;
}

.docs-callout::before {
  position: absolute;
  inset-block: 0.75rem;
  left: -1px;
  width: 2px;
  border-radius: 999px;
  background: var(--docs-callout-accent);
  content: "";
}

.docs-callout[data-type="info"] {
  --docs-callout-accent: #2563eb;
  --docs-callout-bg: color-mix(in srgb, #2563eb 5%, var(--bg-card));
  --docs-callout-border: color-mix(in srgb, #2563eb 18%, var(--line));
}

.docs-callout[data-type="warn"] {
  --docs-callout-accent: #b45309;
  --docs-callout-bg: color-mix(in srgb, #f59e0b 7%, var(--bg-card));
  --docs-callout-border: color-mix(in srgb, #d97706 22%, var(--line));
}

.docs-callout[data-type="ok"] {
  --docs-callout-accent: #15803d;
  --docs-callout-bg: color-mix(in srgb, #22c55e 6%, var(--bg-card));
  --docs-callout-border: color-mix(in srgb, #16a34a 20%, var(--line));
}

.docs-callout[data-type="error"] {
  --docs-callout-accent: #dc2626;
  --docs-callout-bg: color-mix(in srgb, #ef4444 6%, var(--bg-card));
  --docs-callout-border: color-mix(in srgb, #dc2626 22%, var(--line));
}

.docs-callout[data-type="zap"] {
  --docs-callout-accent: var(--accent-brand);
}

.docs-callout-icon {
  display: inline-flex;
  height: 24px;
  width: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: color-mix(
    in srgb,
    var(--docs-callout-accent) 12%,
    transparent
  );
  color: var(--docs-callout-accent);
}
```

- [ ] **Step 4: Verify the fixture page visually**

Open:

```text
http://localhost:3000/en/ai/get-started/test-mdx-comps#callout-directives
```

Expected: info is blue, warning is amber, tip/ok is green, error is red. The color is visible but restrained.

---

### Task 3: Code Copy Button Collision Fix

**Files:**
- Modify: `src/styles/app.css`
- Test: `src/components/mdx.test.tsx`

- [ ] **Step 1: Keep the existing copy-button behavior tests**

Run the current MDX tests before CSS changes:

```bash
bunx vitest run src/components/mdx.test.tsx
```

Expected: PASS. This confirms the copy button behavior remains stable before visual styling changes.

- [ ] **Step 2: Give copy buttons an elevated background**

Update `.docs-code-copy-button` in `src/styles/app.css`:

```css
.docs-code-copy-button {
  position: absolute;
  top: 0.42rem;
  right: 0.44rem;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.62rem;
  width: 1.62rem;
  border: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--bg-elev) 94%, white 6%);
  box-shadow: 0 4px 10px rgb(15 23 42 / 0.08);
  color: var(--ink-4);
  opacity: 0.94;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.docs-code-copy-button:hover {
  border-color: color-mix(in srgb, var(--ink-4) 28%, var(--line));
  background: var(--bg-elev);
  box-shadow: 0 6px 14px rgb(15 23 42 / 0.1);
  color: var(--ink-2);
  opacity: 1;
}
```

- [ ] **Step 3: Reserve more right padding for code text**

Update the existing Shiki pre padding:

```css
.docs-code-block-root > pre.shiki {
  overflow-x: auto;
  padding: var(--docs-code-pad-y) 3.25rem var(--docs-code-pad-y)
    var(--docs-code-pad-x);
}
```

- [ ] **Step 4: Apply the thin scrollbar treatment to code scroll areas**

Add:

```css
.docs-code-block-root > pre {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--ink-4) 38%, transparent)
    transparent;
}

.docs-code-block-root > pre::-webkit-scrollbar {
  height: 0.5rem;
  width: 0.5rem;
}

.docs-code-block-root > pre::-webkit-scrollbar-track {
  background: transparent;
}

.docs-code-block-root > pre::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--ink-4) 34%, transparent);
  background-clip: content-box;
}
```

- [ ] **Step 5: Run focused MDX tests**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Verify the long command fixture visually**

Open:

```text
http://localhost:3000/en/ai/get-started/test-mdx-comps#long-command-wrapping
```

Expected: the copy icon sits on a visible elevated background, the long command text does not visually merge with the icon, and the horizontal scrollbar is thin/subtle.

---

### Task 4: Final Verification

**Files:**
- Verify: all files above

- [ ] **Step 1: Run focused tests**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx src/components/docs-shell/DocsShell.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
bun run types:check
```

Expected: PASS.

- [ ] **Step 3: Run formatting/lint check on touched files**

Run:

```bash
bunx biome lint src/styles/app.css src/components/docs-shell/DocsSidebar.tsx src/components/docs-shell/DocsMainColumn.tsx src/components/docs-shell/DocsTocRail.tsx src/components/docs-shell/DocsShell.test.tsx src/components/mdx.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run whitespace diff check**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 5: Inspect the fixture page**

Open:

```text
http://localhost:3000/en/ai/get-started/test-mdx-comps
```

Expected:
- left nav, main content, TOC, and code block scrollbars are thin and quiet;
- callouts have semantic but restrained colors;
- long command copy button has a visible background and does not collide visually with code text.

