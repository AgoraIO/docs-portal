# Docs Shell State Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish docs shell interaction states so hover, active navigation, tabs, header actions, and TOC highlighting feel subtle, aligned, and layout-stable.

**Architecture:** Keep the current docs shell structure and data flow. Update focused component tests first, then adjust local class constants and the existing TOC scroll-state algorithm in place; touch shared primitives only for the line-tabs underline baseline.

**Tech Stack:** TanStack Start, React 19, Tailwind CSS v4, shadcn-style primitives, Radix Tabs, Vitest, Testing Library, agent-browser.

---

## Source Spec

- `docs/superpowers/specs/2026-05-21-docs-shell-state-polish-design.md`

## File Structure

- Modify `src/components/docs-shell/DocsShell.tsx`: ghost desktop language trigger, ghost mobile sheet theme trigger, subtle header action hover classes.
- Modify `src/components/docs-shell/DocsShell.test.tsx`: assert language/theme controls no longer use outline/card-like styling while retaining labels and behavior.
- Modify `src/components/docs-shell/DocsSidebarTree.tsx`: remove active `font-semibold`, replace abrupt `hover:bg-card` with softer hover/fill classes, keep left active indicator.
- Modify `src/components/docs-shell/DocsSidebarTree.test.tsx`: assert active sidebar links avoid `font-semibold` and retain active indicator/fill classes.
- Modify `src/components/docs-shell/DocsContent.tsx`: track primary active TOC URL plus visible section URLs; apply regular-weight primary/visible styling; soften right-rail action hover.
- Modify `src/components/docs-shell/DocsContent.test.tsx`: cover multiple visible TOC items with exactly one `aria-current="location"`, and preserve click-to-scroll.
- Modify `src/components/ui/tabs.tsx`: align line-variant active underline to the tabs strip separator baseline.
- Create `src/components/ui/tabs.test.tsx` if no existing shared tabs test is present: assert the line variant no longer uses the old negative bottom offset and keeps active underline classes.

## State Class Contracts

Use these class intentions, adjusting exact Tailwind syntax only if tests or rendering require it:

```ts
const subtleHoverClassName =
  'hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]';

const sidebarActiveClassName =
  'data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:text-[color:var(--accent-brand)] data-[active=true]:before:bg-[color:var(--accent-brand)]';

const tocVisibleClassName =
  'data-[visible=true]:border-[color:var(--line-strong)] data-[visible=true]:text-[color:var(--ink-2)]';

const tocPrimaryClassName =
  'data-[primary=true]:border-[color:var(--accent-brand)] data-[primary=true]:text-[color:var(--ink-1)]';
```

Do not add `font-semibold` to active sidebar or TOC links.

## Task 1: Header Actions And Sidebar State Styling

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify: `src/components/docs-shell/DocsShell.test.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [ ] **Step 1: Write failing header action tests**

In `src/components/docs-shell/DocsShell.test.tsx`, extend the existing `renders a separate desktop header row and docs tabs strip` test:

```ts
expect(languageControl).toHaveAttribute('data-variant', 'ghost');
expect(languageControl.className).not.toContain('border-[color:var(--line-strong)]');
expect(languageControl.className).not.toContain('bg-card');
expect(languageControl.className).toContain('hover:bg-[color:var(--docs-soft-fill)]');
expect(languageControl).toHaveTextContent('English');
expect(themeControl.className).not.toContain('hover:bg-transparent');
expect(themeControl.className).toContain('hover:bg-[color:var(--docs-soft-fill)]');
expect(githubControl.className).not.toContain('hover:bg-transparent');
expect(githubControl.className).toContain('hover:bg-[color:var(--docs-soft-fill)]');
```

In the mobile sheet test, after opening the sheet:

```ts
const mobileThemeControl = within(mobileSheet).getByRole('button', {
  name: 'Theme: Light',
});

expect(mobileThemeControl).toHaveAttribute('data-variant', 'ghost');
```

- [ ] **Step 2: Write failing sidebar active stability tests**

In `src/components/docs-shell/DocsSidebarTree.test.tsx`, extend `renders section labels and active page links`:

```ts
const activeLink = screen.getByRole('link', { name: 'About Agora' });

expect(activeLink.className).not.toContain('font-semibold');
expect(activeLink.className).toContain(
  'data-[active=true]:before:bg-[color:var(--accent-brand)]',
);
expect(activeLink.className).toContain(
  'data-[active=true]:bg-[color:var(--accent-brand-soft)]',
);
```

If the active classes are on the wrapping Radix slot element rather than the accessible link in the rendered DOM, use `closest('[data-sidebar="menu-button"]')` and assert that element instead.

- [ ] **Step 3: Run focused tests to confirm failures**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: FAIL because desktop language is still `outline`, mobile theme is still `outline`, and active sidebar classes still include `font-semibold`.

- [ ] **Step 4: Implement header ghost actions**

In `src/components/docs-shell/DocsShell.tsx`:

- Change desktop `LocaleSwitcher` trigger from `variant="outline"` to `variant="ghost"`.
- Replace its outline/card classes with compact ghost action classes:

```tsx
className="h-8 gap-2 rounded-lg px-2.5 text-[13px] text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] dark:hover:bg-[color:var(--docs-soft-fill)]"
```

- Keep `LanguagesIcon` and locale text.
- Keep desktop theme and GitHub as `variant="ghost"` and switch their hover class from transparent to the same subtle fill:

```tsx
className="hidden text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] dark:hover:bg-[color:var(--docs-soft-fill)] lg:inline-flex lg:size-[34px] lg:rounded-lg"
```

- Change mobile sheet theme button from `variant="outline"` to `variant="ghost"` and apply a matching compact class if needed.

- [ ] **Step 5: Implement sidebar state classes**

In `src/components/docs-shell/DocsSidebarTree.tsx`:

- Update `sidebarToggleClassName` to replace `hover:bg-card` with `hover:bg-[color:var(--docs-soft-fill)]`.
- Update `sidebarSubButtonClassName`:
  - Replace `hover:bg-card`.
  - Remove `data-[active=true]:font-semibold`.
  - Keep active fill and active text color.
- Update `sidebarPageButtonClassName`:
  - Replace `hover:bg-card`.
  - Remove `data-[active=true]:font-semibold`.
  - Keep the existing left `before` indicator.

- [ ] **Step 6: Run focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
git commit -m "style: soften docs navigation states"
```

## Task 2: TOC Visible Section Highlighting

**Files:**
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Modify: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Write failing visible-section TOC test**

In `src/components/docs-shell/DocsContent.test.tsx`, add a new test under `describe('DocsTableOfContents')`:

```tsx
it('marks every visible content section while keeping one primary aria-current item', async () => {
  render(
    <AppProviders>
      <div
        data-testid="docs-main-desktop-scroll"
        style={{ height: 400, overflow: 'auto' }}
      >
        <div className="prose" data-testid="article-body">
          <h2 id="first-heading">First heading</h2>
          <p>First content</p>
          <h2 id="second-heading">Second heading</h2>
          <p>Second content</p>
          <h2 id="third-heading">Third heading</h2>
        </div>
      </div>
      <DocsTableOfContents
        toc={[
          { depth: 2, title: 'First heading', url: '#first-heading' },
          { depth: 2, title: 'Second heading', url: '#second-heading' },
          { depth: 2, title: 'Third heading', url: '#third-heading' },
        ]}
      />
    </AppProviders>,
  );

  const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
  const article = screen.getByTestId('article-body');
  const firstHeading = document.getElementById('first-heading');
  const secondHeading = document.getElementById('second-heading');
  const thirdHeading = document.getElementById('third-heading');

  expect(firstHeading).toBeInstanceOf(HTMLElement);
  expect(secondHeading).toBeInstanceOf(HTMLElement);
  expect(thirdHeading).toBeInstanceOf(HTMLElement);

  vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
    bottom: 500,
    height: 400,
    left: 0,
    right: 800,
    top: 100,
    width: 800,
    x: 0,
    y: 100,
    toJSON: () => ({}),
  });
  vi.spyOn(article, 'getBoundingClientRect').mockReturnValue({
    bottom: 900,
    height: 800,
    left: 0,
    right: 800,
    top: 100,
    width: 800,
    x: 0,
    y: 100,
    toJSON: () => ({}),
  });
  vi.spyOn(firstHeading as HTMLElement, 'getBoundingClientRect').mockReturnValue({
    bottom: 80,
    height: 28,
    left: 0,
    right: 800,
    top: 50,
    width: 800,
    x: 0,
    y: 50,
    toJSON: () => ({}),
  });
  vi.spyOn(secondHeading as HTMLElement, 'getBoundingClientRect').mockReturnValue({
    bottom: 180,
    height: 28,
    left: 0,
    right: 800,
    top: 150,
    width: 800,
    x: 0,
    y: 150,
    toJSON: () => ({}),
  });
  vi.spyOn(thirdHeading as HTMLElement, 'getBoundingClientRect').mockReturnValue({
    bottom: 620,
    height: 28,
    left: 0,
    right: 800,
    top: 590,
    width: 800,
    x: 0,
    y: 590,
    toJSON: () => ({}),
  });

  fireEvent.scroll(scrollContainer);

  await waitFor(() => {
    expect(screen.getByRole('link', { name: 'First heading' })).toHaveAttribute(
      'data-visible',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Second heading' })).toHaveAttribute(
      'data-visible',
      'true',
    );
  });
  expect(screen.getByRole('link', { name: 'Second heading' })).toHaveAttribute(
    'aria-current',
    'location',
  );
  expect(screen.getByRole('link', { name: 'First heading' })).not.toHaveAttribute(
    'aria-current',
  );
  expect(screen.getByRole('link', { name: 'First heading' })).not.toHaveAttribute(
    'data-primary',
    'true',
  );
  expect(screen.getByRole('link', { name: 'Third heading' })).not.toHaveAttribute(
    'data-visible',
    'true',
  );
});
```

This fixture intentionally proves that visible-active and primary-active are separate states: the first section range is `firstHeading.top` to `secondHeading.top`, so it still intersects the viewport and must be visible; the second heading is the last heading before the primary active boundary and must be the only `aria-current` item. Adjust helper assertions if the DOM exposes `data-visible="false"` instead of omitting it.

- [ ] **Step 2: Update existing active test expectations**

In the existing `updates the active item from the desktop container scroll position` test, add:

```ts
expect(screen.getByRole('link', { name: 'Second heading' })).toHaveAttribute(
  'data-primary',
  'true',
);
```

- [ ] **Step 3: Run failing TOC tests**

Run:

```bash
bun run test src/components/docs-shell/DocsContent.test.tsx
```

Expected: FAIL because `DocsTableOfContents` only tracks one `activeUrl`.

- [ ] **Step 4: Implement TOC state model**

In `src/components/docs-shell/DocsContent.tsx`:

- Add constants near the existing offsets:

```ts
const TOC_VISIBLE_INTERSECTION_THRESHOLD = 4;
```

- Add state:

```ts
const [primaryActiveUrl, setPrimaryActiveUrl] = useState(
  () => items[0]?.url ?? '',
);
const [visibleUrls, setVisibleUrls] = useState<Set<string>>(
  () => new Set(items[0]?.url ? [items[0].url] : []),
);
```

- Replace `setActiveUrl(url)` in click handling with:

```ts
setPrimaryActiveUrl(url);
setVisibleUrls((current) => {
  const next = new Set(current);
  next.add(url);
  return next;
});
```

- In the scroll effect, compute both primary and visible URLs inside the animation frame:
  - Get `scrollContainer = getActiveDocsScrollContainer()`.
  - Get viewport top/bottom from `scrollContainer.getBoundingClientRect()` or `window.innerHeight`.
  - Keep current primary algorithm: last heading whose top is before `boundary`.
  - For every item, find its heading.
  - Find the next item with `depth <= item.depth`; if found, its heading top is the section bottom.
  - If no next heading exists, use the bottom of the closest `.prose` or `article` content container, then fall back to `document.body`.
  - Mark visible when `sectionBottom - viewportTop > 4` and `viewportBottom - sectionTop > 4`.

Use helpers to keep the effect readable:

```ts
function getScrollViewportRect(scrollContainer: HTMLElement | null) {
  if (scrollContainer) {
    return scrollContainer.getBoundingClientRect();
  }

  return {
    top: 0,
    bottom: window.innerHeight,
  };
}

function getSectionBottomForItem(
  itemIndex: number,
  headings: Array<HTMLElement | null>,
  items: TOCItemType[],
) {
  for (let index = itemIndex + 1; index < items.length; index += 1) {
    if (items[index].depth <= items[itemIndex].depth && headings[index]) {
      return headings[index].getBoundingClientRect().top;
    }
  }

  return (
    headings[itemIndex]
      ?.closest('.prose, article')
      ?.getBoundingClientRect().bottom ?? document.body.getBoundingClientRect().bottom
  );
}
```

If TypeScript complains about `TOCItemType[]` after filtering titles, define a small local type alias for the filtered item shape.

- [ ] **Step 5: Apply TOC link data attributes and classes**

In `DocsTableOfContents` render loop:

```tsx
const isPrimary = item.url === primaryActiveUrl;
const isVisible = visibleUrls.has(item.url);
```

Add:

```tsx
aria-current={isPrimary ? 'location' : undefined}
data-primary={isPrimary ? 'true' : undefined}
data-visible={isVisible ? 'true' : undefined}
```

Update classes:

- Base: regular font, border transparent, `transition-colors`.
- Hover: subtle fill/text, not abrupt.
- Visible: muted indicator/text.
- Primary: accent indicator and `--ink-1`.
- No `font-semibold`.

Example:

```tsx
className={cn(
  '-ml-px rounded-r-md border-l-2 border-transparent px-3 py-1.5 text-sm leading-5 text-[color:var(--ink-3)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
  isVisible && 'border-[color:var(--line-strong)] text-[color:var(--ink-2)]',
  isPrimary && 'border-[color:var(--accent-brand)] text-[color:var(--ink-1)]',
  item.depth > 2 && 'pl-6',
  item.depth > 3 && 'pl-8',
)}
```

- [ ] **Step 6: Soften right-rail action links**

In the two right-rail action link classes in `DocsContent.tsx`, replace `hover:bg-card` with `hover:bg-[color:var(--docs-soft-fill)]`.

- [ ] **Step 7: Run focused TOC tests**

Run:

```bash
bun run test src/components/docs-shell/DocsContent.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx
git commit -m "feat: highlight visible docs toc sections"
```

## Task 3: Tabs Underline Baseline

**Files:**
- Modify: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/tabs.test.tsx`

- [ ] **Step 1: Write failing tabs class contract test**

Create `src/components/ui/tabs.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsList, TabsTrigger } from './tabs';

describe('Tabs primitive', () => {
  it('aligns line variant active underline to the tabs strip baseline', () => {
    render(
      <Tabs value="intro">
        <TabsList variant="line">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const trigger = screen.getByRole('tab', { name: 'Introduction' });

    expect(trigger.className).not.toContain('after:bottom-[-5px]');
    expect(trigger.className).toContain(
      'group-data-[orientation=horizontal]/tabs:after:bottom-[-1px]',
    );
    expect(trigger.className).toContain(
      'group-data-[orientation=horizontal]/tabs:after:h-0.5',
    );
  });
});
```

- [ ] **Step 2: Run failing tabs test**

Run:

```bash
bun run test src/components/ui/tabs.test.tsx
```

Expected: FAIL because the current trigger still uses `after:bottom-[-5px]`.

- [ ] **Step 3: Implement underline baseline alignment**

In `src/components/ui/tabs.tsx`, update the line underline class:

```ts
group-data-[orientation=horizontal]/tabs:after:bottom-[-1px]
```

Keep:

- `after:h-0.5`
- active opacity behavior
- vertical orientation behavior

Do not change default tabs styling except as required by the shared class string.

- [ ] **Step 4: Run tabs test**

Run:

```bash
bun run test src/components/ui/tabs.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run shell header test**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/ui/tabs.tsx src/components/ui/tabs.test.tsx
git commit -m "style: align docs tabs underline"
```

## Task 4: Integrated Verification And Browser Check

**Files:**
- No planned source edits unless verification finds a regression.

- [ ] **Step 1: Run focused test suite**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsContent.test.tsx src/components/ui/tabs.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
bun run lint
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
bun run build
```

Expected: PASS.

- [ ] **Step 4: Start dev server**

Run:

```bash
bun run dev
```

Expected: dev server starts and prints a localhost URL.

- [ ] **Step 5: Browser verification**

Use `agent-browser` against the local dev URL. Capture both visual observations and DOM evidence:

- Open `/en/introduction` or another page with several headings.
- Check desktop around `1440x900`:
  - Header language/theme/GitHub are ghost actions.
  - Tabs underline sits on the separator baseline.
  - Sidebar hover does not appear as an abrupt card.
  - Sidebar active item does not shift text width.
  - TOC highlights every visible section and exactly one item has primary styling.
  - TOC right-rail action hover is subtle.
- Inspect the TOC DOM:
  - At least two TOC links have `data-visible="true"` on a page section boundary where two content sections are visible.
  - Exactly one TOC link has `aria-current="location"`.
  - The non-primary visible TOC links do not have `aria-current`.
- Check mobile around `390x844` or `500x701`:
  - Header controls still fit.
  - Mobile sheet opens.
  - Locale/theme controls are not outline-heavy.

- [ ] **Step 6: Stop dev server**

Stop the dev server session before final handoff.

- [ ] **Step 7: Fix any verification findings**

If browser verification exposes visual or behavior issues, make the narrowest source/test update, rerun the relevant focused test, then rerun browser verification for the affected viewport.

- [ ] **Step 8: Final status**

Run:

```bash
git status --short
```

Expected: clean except for intentional uncommitted artifacts, if any. Report commits and verification evidence.
