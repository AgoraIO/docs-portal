# Search Dialog Polish & Bugfixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four issues in the ⌘K docs search dialog shipped this session: (1) missing keyboard-hint bar, (2) the footer detail strip not updating as you highlight results, (3) the product/platform dropdowns not scrolling, (4) a plain search loader.

**Architecture:** Four independent, small changes. #2 is a cmdk bug — cmdk 1.1.1 only fires `onValueChange` when the `Command` is *controlled*, so we pass `value={activeValue ?? ''}`. #3 is a modal-scroll-lock bug — the search dialog is a modal Radix Dialog (react-remove-scroll blocks wheel scrolling outside the dialog), and the dropdown is a Popover portaled to `body`; we portal it into the dialog content instead. #1 and #4 are additive UI (a persistent keyboard-hint bar; skeleton loading rows).

**Tech Stack:** React, cmdk 1.1.1, Radix Popover/Dialog, TanStack Router, Tailwind, vitest + Testing Library (happy-dom), Biome.

**Design decisions baked in (flag on review if you disagree):**
- **Keyboard-hint bar:** a persistent slim row at the bottom of the dialog, right-aligned, `↑ ↓ navigate · ↵ select · esc close` using `<kbd>` chips — always visible while the dialog is open, grouped into the same bordered footer region as the detail strip.
- **Loader:** three pulsing skeleton rows (title + subtitle placeholders) shown while a search is in flight, replacing the plain "Searching…" text.

**Note on verification:** #2 and #3 are exactly the class of bug that unit tests missed (they depend on real browser layout / cmdk's controlled-mode behaviour / react-remove-scroll). Each has a **mandatory manual browser check** in Task 5. Do not consider those two done on green unit tests alone.

---

## File Structure

- **Modify** `src/components/docs-shell/DocsSearchDialog.tsx` — control the cmdk value (#2); keyboard-hint bar + footer restructure (#1); skeleton loader (#4).
- **Modify** `src/components/ui/popover.tsx` — add an optional `container` prop forwarded to the Radix `Portal` (#3).
- **Modify** `src/components/docs-shell/SearchFilterDropdown.tsx` — portal the dropdown into the enclosing dialog content (#3).
- **Modify** `src/lib/i18n/resources/en/common.ts`, `src/lib/i18n/resources/zh-CN/common.ts` — keyboard-hint strings (#1).
- **Modify** `src/components/docs-shell/DocsSearchDialog.test.tsx` — tests for #2, #1, #4.
- **Modify** `src/components/docs-shell/SearchFilterDropdown.test.tsx` — regression test that #3's container change doesn't break selection.

**Test command shape:** `bunx vitest run <path> -t "<name>"`. Typecheck: `bunx tsc --noEmit`. Lint: `bunx biome check <files>` (`--write` to auto-fix, then re-run).

---

## Task 1: Footer detail strip updates on highlight (#2)

**Root cause (verified in `node_modules/cmdk/dist/index.js`):** cmdk's internal `setState('value', …)` only calls `onValueChange` when `p.current.value !== undefined` — i.e. only when `Command` is controlled. `DocsSearchDialog` passes `onValueChange={setActiveValue}` but no `value`, so it is uncontrolled and `onValueChange` never fires; `activeValue` stays `null` and the footer is permanently stuck on `detailEntries[0]`. Fix: control the value.

**Files:**
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx` (the `<CommandDialog>` opening tag, ~line 306)
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('DocsSearchDialog', …)` block in `DocsSearchDialog.test.tsx` (after the "uses Algolia search" test). It renders two Algolia results, opens the dialog, presses ArrowDown to move the cmdk highlight to the second result, and asserts the footer now shows the SECOND result's snippet:

```tsx
  it('updates the footer detail as the highlighted result changes', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([
        {
          content: 'Voice Activity Detection',
          id: 'android-vad',
          objectType: 'docs',
          path: ['Realtime Media', 'Voice'],
          platform: ['android'],
          product: 'voice',
          snippet: 'Enable <mark>VAD</mark> on Android.',
          type: 'page',
          url: '/en/voice/vad#android',
        },
        {
          content: 'Voice Activity Detection',
          id: 'ios-vad',
          objectType: 'docs',
          path: ['Realtime Media', 'Voice'],
          platform: ['ios'],
          product: 'voice',
          snippet: 'Enable <mark>VAD</mark> on iOS.',
          type: 'page',
          url: '/en/voice/vad#ios',
        },
      ]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" tabs={[]} />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({ initialEntries: ['/en/introduction/about-agora'] }),
    });

    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText('Search docs, APIs, guides...');
    fireEvent.input(input, { target: { value: 'vad' } });

    await screen.findAllByText('Voice Activity Detection');
    // First result is auto-selected → footer shows its snippet.
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        'Enable VAD on Android.',
      ),
    );

    // Move highlight to the second result.
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        'Enable VAD on iOS.',
      ),
    );
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "updates the footer detail"`
Expected: FAIL — after ArrowDown the footer still reads "Enable VAD on Android." (uncontrolled cmdk never fired `onValueChange`).

Note: if this test does not reliably drive cmdk's keyboard nav under happy-dom even after the fix (cmdk moves selection via DOM queries that happy-dom may not fully model), keep the first assertion (auto-selected first item shows in footer) and convert the ArrowDown assertion to a `DONE_WITH_CONCERNS` note plus the mandatory browser check in Task 5. Do NOT delete the controlled-value fix — it is correct regardless.

- [ ] **Step 3: Control the cmdk value**

In `DocsSearchDialog.tsx`, in the `<CommandDialog …>` opening tag, add a `value` prop next to the existing `onValueChange`. It currently reads:

```tsx
      <CommandDialog
        className="max-w-4xl overflow-hidden border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={(nextOpen) => void handleOpenChange(nextOpen)}
        onValueChange={setActiveValue}
        open={open}
        shouldFilter={false}
        title={t('docs.search')}
      >
```

Change it to add `value={activeValue ?? ''}`:

```tsx
      <CommandDialog
        className="max-w-4xl overflow-hidden border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={(nextOpen) => void handleOpenChange(nextOpen)}
        onValueChange={setActiveValue}
        open={open}
        shouldFilter={false}
        title={t('docs.search')}
        value={activeValue ?? ''}
      >
```

Why `?? ''` and not `?? undefined`: cmdk treats `value === undefined` as *uncontrolled* (which reintroduces the bug). An empty string keeps it controlled; cmdk's auto-select-first then fires `onValueChange` with the first item's value, populating `activeValue`.

- [ ] **Step 4: Run tests**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS — including the existing "uses Algolia search" footer test (first item still shown) and, if happy-dom cooperates, the new ArrowDown test. If ArrowDown can't be driven in happy-dom, follow the Step 2 note.

- [ ] **Step 5: Typecheck + lint + commit**

Run: `bunx tsc --noEmit` (no new errors in this file).
Run: `bunx biome check src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx`
```bash
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx
git commit -m "fix: control cmdk value so the search footer tracks the active result"
```

---

## Task 2: Product/platform dropdowns scroll inside the dialog (#3)

**Root cause:** The search dialog is a modal Radix Dialog; modal dialogs use `react-remove-scroll`, which blocks wheel/touch scrolling on any element that is NOT a descendant of the dialog content. `SearchFilterDropdown`'s Popover content is portaled to `document.body` (via the shared `PopoverContent`'s `Portal`), so it lives outside the dialog content and its inner `CommandList` can't be wheel-scrolled. Fix: portal the dropdown content INTO the enclosing dialog content node (a descendant of the scroll-allowed subtree). Radix's `data-slot="dialog-content"` marks that node.

**Files:**
- Modify: `src/components/ui/popover.tsx` (add optional `container` prop)
- Modify: `src/components/docs-shell/SearchFilterDropdown.tsx` (find the dialog node, pass it as container)
- Test: `src/components/docs-shell/SearchFilterDropdown.test.tsx` (regression: selection still works)

- [ ] **Step 1: Add a `container` passthrough to `PopoverContent`**

`src/components/ui/popover.tsx` currently is:

```tsx
'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  align = 'end',
  className,
  sideOffset = 10,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          'z-50 w-72 rounded-[1.35rem] border border-border bg-popover/96 p-2 text-popover-foreground shadow-[0_24px_80px_-38px_rgba(15,23,42,0.38)] outline-none backdrop-blur',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
```

Change `PopoverContent` to accept an optional `container` and forward it to the `Portal`:

```tsx
export function PopoverContent({
  align = 'end',
  className,
  container,
  sideOffset = 10,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  container?: HTMLElement | null;
}) {
  return (
    <PopoverPrimitive.Portal container={container ?? undefined}>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          'z-50 w-72 rounded-[1.35rem] border border-border bg-popover/96 p-2 text-popover-foreground shadow-[0_24px_80px_-38px_rgba(15,23,42,0.38)] outline-none backdrop-blur',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
```

(`container ?? undefined` means: when no container is provided, Radix defaults to `document.body` exactly as before — so all other Popover usages are unaffected.)

- [ ] **Step 2: Write the regression test**

`SearchFilterDropdown`'s existing tests don't render inside a dialog, so its default (`container` undefined → body) path must keep working. Add this test to `src/components/docs-shell/SearchFilterDropdown.test.tsx` to lock that in:

```tsx
  it('still selects an option when rendered outside any dialog (container defaults to body)', async () => {
    const onChange = vi.fn();
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={onChange}
        searchPlaceholder="Filter products…"
        value={null}
      />,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'All products' }));
    fireEvent.click(await screen.findByText('Video Calling'));
    expect(onChange).toHaveBeenCalledWith('product:video');
  });
```

- [ ] **Step 3: Run test to verify it passes as a baseline**

Run: `bunx vitest run src/components/docs-shell/SearchFilterDropdown.test.tsx -t "still selects an option when rendered outside any dialog"`
Expected: PASS already (the component hasn't changed yet; this pins current behaviour before the container change).

- [ ] **Step 4: Portal the dropdown into the enclosing dialog content**

In `src/components/docs-shell/SearchFilterDropdown.tsx`:

4a. Update imports — add `useRef` (and `useState` is already imported):

```tsx
import { useRef, useState } from 'react';
```

4b. Inside the component, after `const [open, setOpen] = useState(false);`, add a ref for the trigger and container state:

```tsx
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
```

4c. Change the `<Popover …>` to resolve the container when opening. It currently is `<Popover onOpenChange={setOpen} open={open}>`. Replace with:

```tsx
    <Popover
      onOpenChange={(next) => {
        if (next) {
          // Portal into the enclosing modal dialog (if any) so react-remove-scroll
          // allows the dropdown's list to wheel-scroll. Falls back to body when
          // not inside a dialog.
          setContainer(
            triggerRef.current?.closest<HTMLElement>(
              '[data-slot="dialog-content"]',
            ) ?? null,
          );
        }
        setOpen(next);
      }}
      open={open}
    >
```

4d. Attach the ref to the trigger `Button` (it is wrapped by `PopoverTrigger asChild`, which forwards the ref to the Button, which forwards to the DOM `<button>`). The Button currently starts `<Button aria-expanded={open} …>`. Add `ref={triggerRef}`:

```tsx
        <Button
          aria-expanded={open}
          aria-label={selected ? `${allLabel}: ${selected.label}` : allLabel}
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          ref={triggerRef}
          role="combobox"
          size="sm"
          variant={selected ? 'secondary' : 'ghost'}
        >
```

4e. Pass the container to `PopoverContent` and give its `CommandList` an explicit scroll cap so it always scrolls when long. The content currently is `<PopoverContent align="start" className="w-64 overflow-hidden p-0">`. Change to:

```tsx
      <PopoverContent
        align="start"
        className="w-64 overflow-hidden p-0"
        container={container}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72 overflow-y-auto">
```

(The rest of the `Command` body is unchanged.)

- [ ] **Step 5: Run the dropdown tests**

Run: `bunx vitest run src/components/docs-shell/SearchFilterDropdown.test.tsx`
Expected: PASS (all — including the 3 original tests and the new container-defaults test). The `container` is `null` outside a dialog, so behaviour is unchanged in tests.

- [ ] **Step 6: Typecheck + lint + commit**

Run: `bunx tsc --noEmit` (no new errors).
Run: `bunx biome check src/components/ui/popover.tsx src/components/docs-shell/SearchFilterDropdown.tsx src/components/docs-shell/SearchFilterDropdown.test.tsx`
```bash
git add src/components/ui/popover.tsx src/components/docs-shell/SearchFilterDropdown.tsx src/components/docs-shell/SearchFilterDropdown.test.tsx
git commit -m "fix: portal search filter dropdown into the dialog so it can scroll"
```

**Browser verification is REQUIRED for this task — see Task 5.** (Radix Popper positions `absolute`; if a very long dropdown opening near the bottom of a short dialog appears clipped by the dialog's `overflow-hidden`, note it in Task 5 and we'll cap the list height further or adjust placement. In normal usage the dialog is tall — `CommandList` is `max-h-[min(620px,70vh)]` — and the filters sit at the top, so the ~288px dropdown fits.)

---

## Task 3: Persistent keyboard-hint bar (#1)

Add a slim, always-visible keyboard-hint row at the bottom of the dialog (`↑ ↓ navigate · ↵ select · esc close`), grouped with the detail strip into one bordered footer region.

**Files:**
- Modify: `src/lib/i18n/resources/en/common.ts`, `src/lib/i18n/resources/zh-CN/common.ts`
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx` (footer region)
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Add i18n strings**

In `src/lib/i18n/resources/en/common.ts`, next to the other `search*` keys, add:

```ts
    searchHintClose: 'close',
    searchHintNavigate: 'navigate',
    searchHintSelect: 'select',
```

In `src/lib/i18n/resources/zh-CN/common.ts`, add:

```ts
    searchHintClose: '关闭',
    searchHintNavigate: '导航',
    searchHintSelect: '选择',
```

(Match each file's existing indentation and alphabetical grouping.)

- [ ] **Step 2: Write the failing test**

Add to `DocsSearchDialog.test.tsx` inside the describe block:

```tsx
  it('shows a keyboard-hint bar while the dialog is open', async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" tabs={[]} />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({ initialEntries: ['/en/introduction/about-agora'] }),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));

    const hints = await screen.findByTestId('search-keyboard-hints');
    expect(hints).toHaveTextContent('navigate');
    expect(hints).toHaveTextContent('select');
    expect(hints).toHaveTextContent('close');
  });
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "keyboard-hint bar"`
Expected: FAIL — testid `search-keyboard-hints` not found.

- [ ] **Step 4: Restructure the footer to add the hint bar**

In `DocsSearchDialog.tsx`, replace the current footer detail-strip block (the comment + the `{activeDetail && (activeDetail.primary || activeDetail.path.length > 0) ? ( <div … data-testid="search-active-detail" …> … </div> ) : null}` that sits just after `</CommandList>`) with a single bordered footer region that contains the (now border-less) detail strip AND the always-visible hint bar:

```tsx
        {/* Footer region: active-item detail strip (when there is an active item)
            plus an always-visible keyboard-hint bar. */}
        <div className="shrink-0 border-t">
          {activeDetail &&
          (activeDetail.primary || activeDetail.path.length > 0) ? (
            <div
              className="min-h-[3.25rem] px-4 py-2"
              data-testid="search-active-detail"
            >
              {activeDetail.primary ? (
                <HighlightedText
                  className="line-clamp-2 text-xs leading-5 text-muted-foreground"
                  value={activeDetail.primary}
                />
              ) : null}
              {activeDetail.path.length > 0 ? (
                <div className="mt-1 line-clamp-1 text-[0.7rem] text-muted-foreground/80">
                  {activeDetail.path.join(' › ')}
                </div>
              ) : null}
            </div>
          ) : null}
          <div
            className="flex items-center justify-end gap-3 px-4 py-1.5 text-[0.7rem] text-muted-foreground"
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
        </div>
```

(The detail strip lost its own `border-t` — the border now lives on the wrapping `<div className="shrink-0 border-t">`. The detail strip's `data-testid="search-active-detail"` and inner markup are otherwise unchanged, so Task 1's and the prior footer tests still pass.)

- [ ] **Step 5: Run tests**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS (new hint test + all existing, including the `search-active-detail` assertions which still find that element).

- [ ] **Step 6: Typecheck + lint + commit**

Run: `bunx tsc --noEmit`
Run: `bunx biome check src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts`
```bash
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts
git commit -m "feat: add a persistent keyboard-hint bar to the search dialog"
```

---

## Task 4: Animated skeleton loader (#4)

Replace the plain "Searching…" text with three pulsing skeleton rows while a search is in flight.

**Files:**
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx` (the `CommandList` loading branch)
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Add to `DocsSearchDialog.test.tsx`. It mocks the Algolia client with a search that never resolves, so `isLoading` stays true, then asserts the skeleton appears and the plain loading text does not:

```tsx
  it('shows animated skeleton rows while a search is in flight', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn(() => new Promise(() => {})), // never resolves → perpetual loading
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" tabs={[]} />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({ initialEntries: ['/en/introduction/about-agora'] }),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'vad' } },
    );

    expect(await screen.findByTestId('search-loading')).toBeInTheDocument();
    expect(screen.queryByText('Searching…')).toBeNull();
  });
```

Note: the exact plain-text string is whatever `t('docs.searchLoading')` currently returns. Before writing the assertion, open `src/lib/i18n/resources/en/common.ts`, read the `searchLoading` value, and use that exact string in the `queryByText(...)` above (replace `'Searching…'` if it differs).

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "skeleton rows while a search"`
Expected: FAIL — testid `search-loading` not found (loader is still plain text).

- [ ] **Step 3: Render skeleton rows when loading**

In `DocsSearchDialog.tsx`, the `CommandList` currently begins:

```tsx
        <CommandList className="max-h-[min(620px,70vh)]">
          <CommandEmpty>
            {isLoading
              ? t('docs.searchLoading')
              : isSearchUnavailable
                ? t('docs.searchUnavailable')
                : t('docs.searchEmpty')}
          </CommandEmpty>
```

Replace that opening (the `<CommandList …>` line through the closing `</CommandEmpty>`) with a loading-aware branch. When `isLoading`, show skeleton rows and nothing else; otherwise keep the existing empty-state message:

```tsx
        <CommandList className="max-h-[min(620px,70vh)]">
          {isLoading ? (
            <div className="space-y-1 p-2" data-testid="search-loading">
              {[0, 1, 2].map((row) => (
                <div
                  className="space-y-2 rounded-md px-2 py-2.5"
                  key={row}
                >
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-muted/70" />
                </div>
              ))}
            </div>
          ) : (
            <CommandEmpty>
              {isSearchUnavailable
                ? t('docs.searchUnavailable')
                : t('docs.searchEmpty')}
            </CommandEmpty>
          )}
```

Leave the rest of the `CommandList` body (the tabs `CommandGroup` and the results `CommandGroup`) exactly as-is after this block. During loading, cmdk's result groups are empty anyway, so only the skeleton shows; once results arrive `isLoading` flips false and the normal content renders.

- [ ] **Step 4: Run tests**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS (skeleton test + all existing).

- [ ] **Step 5: Typecheck + lint + commit**

Run: `bunx tsc --noEmit`
Run: `bunx biome check src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx`
```bash
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx
git commit -m "feat: replace plain search loader with animated skeleton rows"
```

---

## Task 5: Final verification (unit + mandatory browser checks)

**Files:** none (verification only)

- [ ] **Step 1: Run every changed test file**

Run:
```bash
bunx vitest run \
  src/components/docs-shell/DocsSearchDialog.test.tsx \
  src/components/docs-shell/SearchFilterDropdown.test.tsx
```
Expected: all PASS.

- [ ] **Step 2: Typecheck + lint the full change set**

Run: `bunx tsc --noEmit` (no errors attributable to the changed files).
Run:
```bash
bunx biome check \
  src/components/docs-shell/DocsSearchDialog.tsx \
  src/components/docs-shell/SearchFilterDropdown.tsx \
  src/components/ui/popover.tsx \
  src/components/docs-shell/DocsSearchDialog.test.tsx \
  src/components/docs-shell/SearchFilterDropdown.test.tsx \
  src/lib/i18n/resources/en/common.ts \
  src/lib/i18n/resources/zh-CN/common.ts
```
Expected: clean.

- [ ] **Step 3: MANDATORY browser checks (unit tests cannot cover these)**

Start the dev server and open the docs search (⌘K) with Algolia configured, then confirm ALL of:
1. **#2** — type a query, then arrow ↑/↓ (and separately hover with the mouse) through results; the bottom detail strip updates to each highlighted result's snippet + path.
2. **#3** — open the Product dropdown with enough products to overflow; the list **wheel-scrolls** with the mouse and via trackpad, and is not visually clipped by the dialog edges. Repeat for Platform.
3. **#1** — the keyboard-hint bar (`↑ ↓ navigate · ↵ select · esc close`) is visible at the bottom the whole time.
4. **#4** — during the brief in-flight moment (throttle network if needed), skeleton rows animate instead of plain text.

If #3 shows any clipping of a long dropdown near the bottom of a short dialog, reduce the dropdown `CommandList` cap (e.g. `max-h-60`) or report back for a placement tweak.

- [ ] **Step 4: Commit any adjustment from Step 3** (only if needed)

```bash
git add -A && git commit -m "fix: adjust search dropdown height after browser check" || echo "no adjustment needed"
```

---

## Self-Review Notes

- **Coverage:** #2 → Task 1 (controlled value); #3 → Task 2 (portal into dialog + `container` prop); #1 → Task 3 (hint bar + i18n); #4 → Task 4 (skeleton). Task 5 verifies, including the two browser-only bugs.
- **Type consistency:** `container?: HTMLElement | null` added in Task 2 Step 1 is consumed in Task 2 Step 4e; `activeValue`/`setActiveValue` already exist from prior work and are only newly *read* by the `value` prop in Task 1; `search-active-detail` testid preserved through Task 3's footer restructure so Task 1's assertions keep working; `search-keyboard-hints` and `search-loading` testids introduced and asserted in the same tasks.
- **Known test-env caveat:** Task 1's ArrowDown assertion depends on cmdk keyboard nav under happy-dom; the fix is correct regardless and the browser check in Task 5 is authoritative (documented in Task 1 Step 2).
- **No unrelated refactors:** popover `container` is additive and backward-compatible (`?? undefined` preserves the body default for every other consumer).
