# Top-Menu Layout-Shift Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the top docs-menu tabs from shifting horizontally when the active tab goes semibold, while keeping the bold emphasis.

**Architecture:** Each top-menu tab title is rendered twice inside a single-cell CSS grid — an invisible `font-semibold` ghost that fixes the width, and a visible copy whose weight toggles via the `Link`'s `group/tab` active state. The grid cell always sizes to the bold ghost, so the visible text never alters layout. The weight toggle moves off the `Link` (where `asChild` puts the Radix `data-state`) onto the visible span via `group-data-[state=active]/tab:font-semibold`.

**Tech Stack:** React, TanStack Router `Link`, Radix Tabs (`asChild`), Tailwind CSS, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-06-27-top-menu-layout-shift-design.md`

---

## File Structure

- Modify: `src/components/docs-shell/DocsShell.tsx` — the top-menu `TabsTrigger`/`Link` block (currently lines 349-368). Single, focused change; no new files.
- Test: `src/components/docs-shell/DocsShell.test.tsx` — add one test asserting the ghost structure and weight mechanism.

No other files change. The mobile vertical nav (line ~606) is intentionally out of scope (vertical stacking does not shift siblings horizontally).

---

### Task 1: Reserve bold width on top-menu tabs

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx:349-368`
- Test: `src/components/docs-shell/DocsShell.test.tsx`

Context for the implementer:
- The test fixture (top of `DocsShell.test.tsx`) defines two tabs with titles `Introduction` and `AI`.
- Top tabs are queried elsewhere with `within(docsTabsStrip).getByRole('tab', { name: 'Introduction' })`. The ghost copy MUST keep `aria-hidden` so it is excluded from the accessible name and those existing queries keep working.
- `getAllByText('Introduction')` matches leaf elements whose own text equals the string; the two leaf spans match, the wrapping grid span (textContent `IntroductionIntroduction`) does not. So the new test expects exactly 2 matches.

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('DocsShell', () => { ... })` block in `src/components/docs-shell/DocsShell.test.tsx` (place it after the existing `it('renders a separate desktop header row and docs tabs strip', ...)` test):

```tsx
  it('reserves bold width on top tabs so the menu does not shift on activation', async () => {
    renderDocsShell();

    const docsTabsStrip = await screen.findByTestId('docs-tabs-strip');
    const introTab = within(docsTabsStrip).getByRole('tab', {
      name: 'Introduction',
    });

    // Weight no longer toggles on the Link itself (that would shift siblings);
    // the Link exposes its active state as a named group instead.
    expect(introTab.className).not.toContain('data-[state=active]:font-semibold');
    expect(introTab.className).toContain('group/tab');

    // The title is rendered twice: an aria-hidden semibold ghost that reserves
    // width, and a visible copy whose weight follows the group's active state.
    const titles = within(introTab).getAllByText('Introduction');
    expect(titles).toHaveLength(2);

    const ghost = titles.find((el) => el.getAttribute('aria-hidden') === 'true');
    const visible = titles.find(
      (el) => el.getAttribute('aria-hidden') !== 'true',
    );

    expect(ghost).toBeDefined();
    expect(ghost?.className).toContain('invisible');
    expect(ghost?.className).toContain('font-semibold');

    expect(visible).toBeDefined();
    expect(visible?.className).toContain(
      'group-data-[state=active]/tab:font-semibold',
    );
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsShell.test.tsx -t "reserves bold width"`
Expected: FAIL — currently there is one `Introduction` text node, not two (`getAllByText` returns length 1), and the `Link` still contains `data-[state=active]:font-semibold` without `group/tab`.

- [ ] **Step 3: Implement the grid-stack ghost**

In `src/components/docs-shell/DocsShell.tsx`, replace the existing top-menu `Link` block:

```tsx
                    <TabsTrigger asChild key={tab.id} value={tab.id}>
                      <Link
                        className="h-10 rounded-none px-3.5 text-[13.5px] font-medium after:!bottom-[-3px] data-[state=active]:font-semibold"
                        params={{}}
                        search={{}}
                        to={tab.url}
                      >
                        {tab.icon ? (
                          <span className="docs-tab-icon">
                            <DocsConfiguredIcon
                              className="size-3.5"
                              icon={tab.icon}
                            />
                          </span>
                        ) : null}
                        {tab.title}
                      </Link>
                    </TabsTrigger>
```

with:

```tsx
                    <TabsTrigger asChild key={tab.id} value={tab.id}>
                      <Link
                        className="group/tab h-10 rounded-none px-3.5 text-[13.5px] font-medium after:!bottom-[-3px]"
                        params={{}}
                        search={{}}
                        to={tab.url}
                      >
                        {tab.icon ? (
                          <span className="docs-tab-icon">
                            <DocsConfiguredIcon
                              className="size-3.5"
                              icon={tab.icon}
                            />
                          </span>
                        ) : null}
                        <span className="grid">
                          <span
                            aria-hidden
                            className="invisible col-start-1 row-start-1 font-semibold"
                          >
                            {tab.title}
                          </span>
                          <span className="col-start-1 row-start-1 group-data-[state=active]/tab:font-semibold">
                            {tab.title}
                          </span>
                        </span>
                      </Link>
                    </TabsTrigger>
```

Changes made: removed `data-[state=active]:font-semibold` from the `Link`, added `group/tab` to the `Link`, and wrapped `{tab.title}` in the grid-stack. The visible copy inherits `font-medium` from the `Link` at rest and upgrades to `font-semibold` only when the group is active. The ghost always reserves the semibold width.

- [ ] **Step 4: Run the new test to verify it passes**

Run: `bunx vitest run src/components/docs-shell/DocsShell.test.tsx -t "reserves bold width"`
Expected: PASS.

- [ ] **Step 5: Run the full DocsShell suite to confirm no regression**

Run: `bunx vitest run src/components/docs-shell/DocsShell.test.tsx`
Expected: PASS — in particular the existing `getByRole('tab', { name: 'Introduction' })` / `'AI'` queries still resolve, because the ghost copy is `aria-hidden` and excluded from the accessible name.

- [ ] **Step 6: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx
git commit -m "fix: stop top docs menu shifting when active tab bolds"
```

---

### Task 2: One-time manual verification

jsdom cannot measure real layout, so the structural test above guards the technique but cannot prove pixel-level stability. Verify once by eye.

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: the docs site serves locally (note the printed URL).

- [ ] **Step 2: Eyeball the top menu**

In the browser, click each top menu tab in turn. Confirm that activating a tab does NOT nudge the other tabs left or right — only color, underline, and the active tab's own weight change. The reserved bold width should keep every tab's box static.

Expected: no horizontal sibling movement on activation. If tabs still shift, the ghost width is not being applied — recheck that the grid wrapper and the `invisible ... font-semibold` ghost are present and that the `Link` carries `group/tab`.

- [ ] **Step 3: Stop the dev server**

Stop the `bun run dev` process.

---

## Self-Review

**Spec coverage:**
- Problem (active tab bolds → siblings shift) → Task 1 reserves bold width. ✓
- Approach: grid-stack ghost, `group/tab` mechanism → Task 1 Step 3 exact code. ✓
- Changes 1-3 (remove weight toggle, add `group/tab`, grid-stack wrapper, icon untouched) → Task 1 Step 3. ✓
- Out of scope (mobile vertical nav, colors/underline) → File Structure note; the edit touches only the top-menu block. ✓
- Testing: structural guard + one-time manual check → Task 1 (test) + Task 2 (manual). ✓

**Placeholder scan:** No TBD/TODO; every code and command step is concrete. ✓

**Type consistency:** Uses existing `tab.id`, `tab.icon`, `tab.title`, `tab.url` from `TabSummary`; `DocsConfiguredIcon`, `Link`, `TabsTrigger` already imported in `DocsShell.tsx`. No new symbols introduced. Class string `group-data-[state=active]/tab:font-semibold` matches the `group/tab` marker on the `Link`. ✓
