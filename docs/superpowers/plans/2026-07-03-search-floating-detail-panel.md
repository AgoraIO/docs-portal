# Search Floating Detail Panel + Stable Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the ⌘K search dialog from resizing as the highlight moves, by taking the active-item description out of the footer's layout flow: show it in a floating window beside the dialog (with an in-footer fixed-height strip fallback when there's no room), and narrow the dialog so "beside" fits on laptops.

**Architecture:** A new `SearchDetailPanel` owns the placement decision at runtime — measure the dialog rect + viewport and pick `right` / `left` / `strip`. Beside modes portal a `position: fixed` card to `document.body` (out of the dialog's layout, so the dialog never resizes); `strip` renders a fixed-height reserved strip in the footer. The dialog narrows from `max-w-4xl` (896px) to `max-w-2xl` (672px) so the ~274px panel fits beside it at viewports ≥ ~1220px. A `placement` override prop is the test seam (happy-dom can't compute layout).

**Tech Stack:** React (`createPortal`, `useLayoutEffect`), cmdk, Radix Dialog, Tailwind, vitest + Testing Library (happy-dom), Biome.

**Spec:** `docs/superpowers/specs/2026-07-03-search-floating-detail-panel-design.md`

**Verification note:** `main` has a pre-existing lint/type/test baseline — scope verification to changed files. Placement pixel math is **not** unit-testable under happy-dom; Task 3 has a mandatory browser check.

**Test command shape:** `bunx vitest run <path> -t "<name>"`. Typecheck: `bunx tsc --noEmit`. Lint: `bunx biome check <files>`.

---

## File Structure

- **Create** `src/components/docs-shell/SearchDetailPanel.tsx` — placement decision + rect math + listeners; renders the floating card (portal) or the in-footer strip.
- **Create** `src/components/docs-shell/SearchDetailPanel.test.tsx` — unit tests using the `placement` override.
- **Modify** `src/components/docs-shell/DocsSearchDialog.tsx` — narrow to `max-w-2xl`; add `title` to `detailEntries`; replace the footer detail block with `<SearchDetailPanel>`.
- **Modify** `src/components/docs-shell/DocsSearchDialog.test.tsx` — update the path-count assertion (3→2) and keep the snippet assertions (shared `search-active-detail` testid is preserved).

---

## Task 1: `SearchDetailPanel` component

**Files:**
- Create: `src/components/docs-shell/SearchDetailPanel.tsx`
- Test: `src/components/docs-shell/SearchDetailPanel.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/docs-shell/SearchDetailPanel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchDetailPanel } from './SearchDetailPanel';

const renderText = (value: string) => <span>{value}</span>;

describe('SearchDetailPanel', () => {
  it('renders a floating card with title + description when placement is beside (right)', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description="Connect to a channel."
        open
        placement="right"
        renderText={renderText}
        title="Join a channel"
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).toHaveAttribute('data-mode', 'beside');
    expect(el).toHaveTextContent('Join a channel');
    expect(el).toHaveTextContent('Connect to a channel.');
  });

  it('renders the in-footer strip with the description when placement is strip', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description="Connect to a channel."
        open
        placement="strip"
        renderText={renderText}
        title="Join a channel"
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).toHaveAttribute('data-mode', 'strip');
    expect(el).toHaveTextContent('Connect to a channel.');
  });

  it('renders a blank reserved strip (no crash) when there is no description in strip mode', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description={undefined}
        open
        placement="strip"
        renderText={renderText}
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).toHaveAttribute('data-mode', 'strip');
    expect(el).toHaveTextContent('');
  });

  it('renders nothing beside when there is no description', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description={undefined}
        open
        placement="right"
        renderText={renderText}
      />,
    );
    expect(screen.queryByTestId('search-active-detail')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run src/components/docs-shell/SearchDetailPanel.test.tsx`
Expected: FAIL — module `./SearchDetailPanel` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/docs-shell/SearchDetailPanel.tsx`:

```tsx
'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type DetailPlacement = 'right' | 'left' | 'strip';

const PANEL_WIDTH = 260;
const GAP = 14;
const NEED = PANEL_WIDTH + GAP;

export function SearchDetailPanel({
  activeValue,
  description,
  open,
  placement: placementOverride,
  renderText,
  title,
}: {
  activeValue: string | null;
  description?: string;
  open: boolean;
  // Test seam: force a mode instead of measuring the DOM.
  placement?: DetailPlacement;
  renderText: (value: string) => ReactNode;
  title?: string;
}) {
  const [placement, setPlacement] = useState<DetailPlacement>(
    placementOverride ?? 'strip',
  );
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (placementOverride) {
      setPlacement(placementOverride);
      return;
    }
    if (!open) {
      return;
    }
    const dialog = document.querySelector<HTMLElement>(
      '[data-slot="dialog-content"]',
    );
    if (!dialog) {
      return;
    }
    const list = dialog.querySelector<HTMLElement>('[data-slot="command-list"]');

    function compute() {
      if (!dialog) {
        return;
      }
      const dr = dialog.getBoundingClientRect();
      let next: DetailPlacement;
      if (window.innerWidth - dr.right >= NEED) {
        next = 'right';
      } else if (dr.left >= NEED) {
        next = 'left';
      } else {
        next = 'strip';
      }
      setPlacement(next);

      if (next !== 'strip') {
        const row = dialog.querySelector<HTMLElement>(
          '[data-slot="command-item"][aria-selected="true"]',
        );
        const rr = row?.getBoundingClientRect();
        const top = Math.min(
          Math.max(rr ? rr.top : dr.top, dr.top + 8),
          Math.max(dr.top + 8, dr.bottom - 96),
        );
        setStyle({
          left: next === 'right' ? dr.right + GAP : dr.left - GAP - PANEL_WIDTH,
          position: 'fixed',
          top,
          width: PANEL_WIDTH,
        });
      }
    }

    compute();
    window.addEventListener('resize', compute);
    list?.addEventListener('scroll', compute);
    return () => {
      window.removeEventListener('resize', compute);
      list?.removeEventListener('scroll', compute);
    };
  }, [activeValue, open, placementOverride]);

  if (placement === 'strip') {
    // Fixed-height reserved strip, rendered in place (the footer). Blank when
    // there is no description so the dialog stays height-stable in strip mode.
    return (
      <div
        className="h-[54px] shrink-0 overflow-hidden border-t px-4 py-2"
        data-mode="strip"
        data-testid="search-active-detail"
      >
        {description ? (
          <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {renderText(description)}
          </div>
        ) : null}
      </div>
    );
  }

  // Beside: nothing lives in the footer; the card floats out of layout flow.
  if (!description) {
    return null;
  }
  return createPortal(
    <div
      className="pointer-events-none fixed z-[60] w-[260px] rounded-xl border border-border bg-popover/95 p-3 shadow-2xl backdrop-blur"
      data-mode="beside"
      data-testid="search-active-detail"
      style={style}
    >
      {title ? (
        <div className="mb-1 font-medium text-sm text-foreground">{title}</div>
      ) : null}
      <div className="text-xs leading-5 text-muted-foreground">
        {renderText(description)}
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run src/components/docs-shell/SearchDetailPanel.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck + lint + commit**

Run: `bunx tsc --noEmit` (no new errors in the new file).
Run: `bunx biome check src/components/docs-shell/SearchDetailPanel.tsx src/components/docs-shell/SearchDetailPanel.test.tsx` (`--write` if needed, re-run).
```bash
git add src/components/docs-shell/SearchDetailPanel.tsx src/components/docs-shell/SearchDetailPanel.test.tsx
git commit -m "feat: add SearchDetailPanel (floating beside / in-footer strip)"
```

---

## Task 2: Integrate into `DocsSearchDialog`

Narrow the dialog, carry `title` in the detail records, and replace the in-footer detail block with `<SearchDetailPanel>`.

**Files:**
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx`
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Update the failing test (path count 3 → 2)**

In `src/components/docs-shell/DocsSearchDialog.test.tsx`, in the "uses Algolia search when configured…" test, the footer detail strip previously repeated the active row's path, making the path appear 3×. With the detail moved to the panel/strip (which carry **no path**), it appears only on the 2 rows. Change:

```tsx
    expect(screen.getAllByText('Realtime Media › Voice')).toHaveLength(3);
    expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
      'Enable VAD on Android.',
    );
```
to:
```tsx
    expect(screen.getAllByText('Realtime Media › Voice')).toHaveLength(2);
    expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
      'Enable VAD on Android.',
    );
```

(The `search-active-detail` testid is preserved by `SearchDetailPanel` in both modes, so this and the existing "updates the footer detail as the highlighted result changes" ArrowDown test keep working without further change.)

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "uses Algolia search"`
Expected: FAIL — currently the path count is still 3 (old footer strip repeats the path).

- [ ] **Step 3: Import `SearchDetailPanel`**

In `src/components/docs-shell/DocsSearchDialog.tsx`, add near the other `@/components/docs-shell` imports:

```tsx
import { SearchDetailPanel } from '@/components/docs-shell/SearchDetailPanel';
```

- [ ] **Step 4: Narrow the dialog**

Change the `<CommandDialog>` className from:

```tsx
        className="max-w-4xl overflow-hidden border-border p-0"
```
to:
```tsx
        className="max-w-2xl overflow-hidden border-border p-0"
```

- [ ] **Step 5: Add `title` to the detail records**

In the `detailEntries` computation (currently around lines 260-271), add a `title` to each record:

```tsx
  const detailEntries = [
    ...tabEntries.map((tab) => ({
      path: [] as string[],
      primary: tab.description,
      title: tab.title,
      value: tab.url,
    })),
    ...resultEntries.map((page) => ({
      path: page.path,
      primary: page.description,
      title: page.title,
      value: page.id ?? page.url,
    })),
  ];
```

(`tab.title` exists on `TabSummary`; `page.title` exists on `RenderedSearchEntry` — both are already rendered in the list rows above.)

- [ ] **Step 6: Replace the footer detail block with `SearchDetailPanel`**

Replace the entire footer block that currently sits after `</CommandList>` — the `<div className="shrink-0 border-t">` wrapper containing the `data-testid="search-active-detail"` strip AND the `data-testid="search-keyboard-hints"` bar — with:

```tsx
        {/* Active-item detail: floats beside the dialog when there's room,
            otherwise a fixed-height strip in the footer. Either way it's out of
            the height-varying flow, so the dialog doesn't resize on focus change. */}
        <SearchDetailPanel
          activeValue={activeValue}
          description={activeDetail?.primary}
          open={open}
          renderText={(value) => <HighlightedText value={value} />}
          title={activeDetail?.title}
        />
        <div
          className="flex shrink-0 items-center justify-end gap-3 border-t px-4 py-1.5 text-[0.7rem] text-muted-foreground"
          data-testid="search-keyboard-hints"
        >
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted/60 px-1 py-px text-[0.65rem] leading-none">
              ↑
            </kbd>
            <kbd className="rounded border border-border bg-muted/60 px-1 py-px text-[0.65rem] leading-none">
              ↓
            </kbd>
            {t('docs.searchHintNavigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted/60 px-1 py-px text-[0.65rem] leading-none">
              ↵
            </kbd>
            {t('docs.searchHintSelect')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted/60 px-1 py-px text-[0.65rem] leading-none">
              esc
            </kbd>
            {t('docs.searchHintClose')}
          </span>
        </div>
```

Notes:
- `activeDetail` may be `undefined` when the list is empty — hence `activeDetail?.primary` / `activeDetail?.title`. With no description the panel renders nothing (beside) or a blank strip.
- `HighlightedText` is the existing helper defined lower in this file; passing it via `renderText` keeps `SearchDetailPanel` decoupled from the mark-parsing logic.
- The strip (strip-mode) renders above this hint bar because `SearchDetailPanel` is placed before it.

- [ ] **Step 7: Run tests**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS — the "uses Algolia search" test (path 2×, snippet in `search-active-detail`) and the ArrowDown "updates the footer detail" test both pass. (Under happy-dom, `getBoundingClientRect` is zero-valued so `SearchDetailPanel` resolves to whichever mode the default `innerWidth` yields; both modes carry the `search-active-detail` testid and render the snippet, so the assertions are mode-agnostic.)

- [ ] **Step 8: Typecheck + lint + commit**

Run: `bunx tsc --noEmit` (no new errors in this file).
Run: `bunx biome check src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx` (`--write` if needed, re-run).
```bash
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx
git commit -m "feat: move search detail to floating panel; narrow dialog to 2xl"
```

---

## Task 3: Verification + mandatory browser check

**Files:** none (verification only)

- [ ] **Step 1: Run the changed test files**

Run:
```bash
bunx vitest run \
  src/components/docs-shell/SearchDetailPanel.test.tsx \
  src/components/docs-shell/DocsSearchDialog.test.tsx
```
Expected: all PASS.

- [ ] **Step 2: Typecheck + lint**

Run: `bunx tsc --noEmit` (no errors attributable to the changed files).
Run:
```bash
bunx biome check \
  src/components/docs-shell/SearchDetailPanel.tsx \
  src/components/docs-shell/SearchDetailPanel.test.tsx \
  src/components/docs-shell/DocsSearchDialog.tsx \
  src/components/docs-shell/DocsSearchDialog.test.tsx
```
Expected: clean.

- [ ] **Step 3: MANDATORY browser check (happy-dom can't verify layout)**

Open the docs search (⌘K) with Algolia configured and confirm ALL of:
1. **Stability** — arrow ↑/↓ and hover through results of varying description length; the **dialog does not change size**.
2. **Beside (wide window ≥ ~1220px)** — the detail floats **beside** the dialog, aligned to the highlighted row, and follows arrow/hover/scroll; it flips to the **left** side if the window is positioned so the right side is tight.
3. **Strip (narrow window)** — shrink the window; the detail falls back to a **fixed-height strip** above the keyboard-hint bar, still stable.
4. **No-description item** — highlighting a result with no snippet shows no card (beside) or a blank strip (strip); no flicker.
5. **Width** — the dialog is visibly narrower (672px) but the result list is still comfortable.

- [ ] **Step 4: Commit any adjustment from Step 3** (only if needed)

```bash
git add -A && git commit -m "fix: adjust search detail panel after browser check" || echo "no adjustment needed"
```

---

## Self-Review Notes

- **Coverage:** narrow dialog → Task 2 Step 4; floating panel + placement + strip → Task 1 (`SearchDetailPanel`) integrated in Task 2 Step 6; `title` in data → Task 2 Step 5; footer becomes hint-bar-only in beside mode → Task 2 Step 6; testing via `placement` seam → Task 1 tests; browser-only placement → Task 3 Step 3.
- **Type consistency:** `DetailPlacement` and the `SearchDetailPanel` prop shape defined in Task 1 are used unchanged in Task 2 Step 6; `renderText: (value: string) => ReactNode` is satisfied by `(value) => <HighlightedText value={value} />`; `detailEntries` records gain `title` (Task 2 Step 5) which `activeDetail?.title` (Step 6) reads.
- **Preserved contract:** the `search-active-detail` testid is intentionally kept on both panel and strip so the two existing detail tests need only the path-count 3→2 change.
- **Known happy-dom caveat:** the beside-vs-strip pixel math isn't unit-tested; Task 3's browser check is authoritative (documented in the plan header and Task 3).
