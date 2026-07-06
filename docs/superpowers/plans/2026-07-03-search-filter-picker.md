# Search Filter Picker + Hover Descriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the docs search dialog's native `<select>` product filter and platform pill row with two matching, searchable, keyboard-navigable dropdowns, surface product descriptions inside the product dropdown, and move result-row descriptions into a fixed footer detail strip.

**Architecture:** A reusable `SearchFilterDropdown` (Radix `Popover` wrapping a cmdk `Command`) renders both filters. `ProductScope` gains a `description` sourced from product index-page frontmatter. The result list keeps cmdk's existing selection model; the dialog mirrors cmdk's active item via `onValueChange` and renders that item's snippet + path in a fixed-height footer strip (no tooltip — cmdk parks DOM focus on the input, so a focus-triggered tooltip would never fire for keyboard users).

**Tech Stack:** React, cmdk, Radix Popover/Dialog, TanStack Router, Tailwind, vitest + Testing Library (happy-dom), Biome.

**Spec:** `docs/superpowers/specs/2026-07-03-search-filter-picker-design.md`

**Verification note:** `main` already fails lint/types/9 suites (pre-existing baseline). Scope every verification run to the files this plan changes — never run the whole suite as a gate.

**Test command shape:** `bunx vitest run <path> -t "<name>"`. Typecheck: `bunx tsc --noEmit`. Lint/format: `bunx biome check <files>`.

---

## File Structure

- **Modify** `src/lib/docs-tree.ts` — add `description` to `ProductScope`; populate it in `getProductScopes`.
- **Modify** `src/lib/docs-tree.test.ts` — new cases asserting descriptions flow through.
- **Modify** `src/components/ui/command.tsx` — forward `value`/`onValueChange` from `CommandDialog` to the inner cmdk `Command`.
- **Create** `src/components/docs-shell/SearchFilterDropdown.tsx` — the reusable Popover+Command combobox.
- **Create** `src/components/docs-shell/SearchFilterDropdown.test.tsx` — component tests.
- **Modify** `src/lib/i18n/resources/en/common.ts` and `src/lib/i18n/resources/zh-CN/common.ts` — two filter-placeholder strings.
- **Modify** `src/components/docs-shell/DocsSearchDialog.tsx` — swap the filter bar to two dropdowns; add the footer detail strip; remove inline row descriptions.
- **Modify** `src/components/docs-shell/DocsSearchDialog.test.tsx` — product-scope wiring test; update the path-count assertion; assert the footer.

---

## Task 1: `ProductScope.description` from frontmatter

**Files:**
- Modify: `src/lib/docs-tree.ts:17-22` (type), `src/lib/docs-tree.ts:104-129` (population)
- Test: `src/lib/docs-tree.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/lib/docs-tree.test.ts` (after the existing `getProductScopes` describe block, near line 119):

```ts
const scopeTreeWithDescriptions: Root = {
  children: [
    {
      $id: 'en-root',
      children: [
        {
          $id: 'rt-folder',
          children: [
            {
              $id: 'video-folder',
              children: [],
              index: {
                $id: 'video-index',
                description: 'Multi-party video with adaptive quality.',
                name: 'Video Calling',
                type: 'page',
                url: '/en/realtime-media/video',
              },
              name: 'Video Calling',
              type: 'folder',
            },
          ],
          index: {
            $id: 'rt-index',
            name: 'Realtime Media',
            type: 'page',
            url: '/en/realtime-media',
          },
          name: 'Realtime Media',
          root: true,
          type: 'folder',
        },
        {
          $id: 'ai-folder',
          children: [],
          index: {
            $id: 'ai-index',
            description: 'Voice agents with LLM, ASR, and TTS.',
            name: 'Voice Agent',
            type: 'page',
            url: '/en/ai',
          },
          name: 'Voice Agent',
          root: true,
          type: 'folder',
        },
      ],
      name: 'English',
      type: 'folder',
    },
  ],
  name: 'Docs',
};

describe('getProductScopes descriptions', () => {
  const scopes = getProductScopes(scopeTreeWithDescriptions);

  it('carries the product index description onto product-level scopes', () => {
    expect(scopes).toContainEqual({
      description: 'Multi-party video with adaptive quality.',
      filter: 'product:"video"',
      group: 'Realtime Media',
      id: 'product:video',
      label: 'Video Calling',
    });
  });

  it('carries the tab index description onto tab-level scopes', () => {
    expect(scopes).toContainEqual({
      description: 'Voice agents with LLM, ASR, and TTS.',
      filter: 'tab:"ai"',
      id: 'tab:ai',
      label: 'Voice Agent',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/docs-tree.test.ts -t "getProductScopes descriptions"`
Expected: FAIL — received objects have no `description` key.

- [ ] **Step 3: Add `description` to the type**

In `src/lib/docs-tree.ts`, change the `ProductScope` type (lines 17-22) to:

```ts
export type ProductScope = {
  description?: string;
  filter: string;
  group?: string;
  id: string;
  label: string;
};
```

- [ ] **Step 4: Populate `description` in `getProductScopes`**

In `src/lib/docs-tree.ts`, replace the product-level branch and the tab-level return (current lines 104-129) with:

```ts
    if (PRODUCT_SCOPE_TAB_IDS.has(tabId) && node.type === 'folder') {
      return node.children.flatMap((child): ProductScope[] => {
        if (child.type !== 'folder') {
          return [];
        }

        const childIndex = getTabIndex(child);
        // Product id = the folder's URL segment after locale + tab, which is
        // exactly the value the index stores in `product`.
        const productId = childIndex?.url.split('/').filter(Boolean)[2];
        if (!productId) {
          return [];
        }

        const scope: ProductScope = {
          filter: `product:"${productId}"`,
          group: tabLabel,
          id: `product:${productId}`,
          label: normalizeLabel(child.name, productId),
        };

        if (typeof childIndex?.description === 'string') {
          scope.description = childIndex.description;
        }

        return [scope];
      });
    }

    // A whole tab (e.g. AI, Reference) as one scope.
    const scope: ProductScope = {
      filter: `tab:"${tabId}"`,
      id: `tab:${tabId}`,
      label: tabLabel,
    };

    if (typeof item.description === 'string') {
      scope.description = item.description;
    }

    return [scope];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bunx vitest run src/lib/docs-tree.test.ts`
Expected: PASS — new cases pass AND the pre-existing `getProductScopes` cases still pass (they use `toContainEqual` with no `description` key; scopes for fixtures without a `description` omit the key entirely).

- [ ] **Step 6: Commit**

```bash
git add src/lib/docs-tree.ts src/lib/docs-tree.test.ts
git commit -m "feat: carry index-page description onto product search scopes"
```

---

## Task 2: Forward `value`/`onValueChange` through `CommandDialog`

The dialog needs to observe cmdk's active-item value to drive the footer. `CommandDialog` currently only forwards `shouldFilter` to the inner `Command`. This is a pure passthrough enabling change; it is exercised by Task 5's footer test.

**Files:**
- Modify: `src/components/ui/command.tsx:29-63`

- [ ] **Step 1: Add the props and forward them**

In `src/components/ui/command.tsx`, replace the `CommandDialog` function (lines 29-63) with:

```tsx
function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  shouldFilter,
  showCloseButton = true,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  shouldFilter?: React.ComponentProps<typeof Command>['shouldFilter'];
  showCloseButton?: boolean;
  value?: React.ComponentProps<typeof Command>['value'];
  onValueChange?: React.ComponentProps<typeof Command>['onValueChange'];
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn('overflow-hidden p-0', className)}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command
          className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          onValueChange={onValueChange}
          shouldFilter={shouldFilter}
          value={value}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no new errors referencing `command.tsx`.

- [ ] **Step 3: Verify existing command-dialog consumers still pass**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS (unchanged behavior — new props default to undefined).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/command.tsx
git commit -m "feat: let CommandDialog forward value/onValueChange to cmdk"
```

---

## Task 3: `SearchFilterDropdown` component

A reusable combobox: a `Popover` triggered by a `Button`, containing a cmdk `Command` with a search input and grouped options (label + optional description). Single-select; clicking the active option or the trigger's clear (×) resets to `null`.

**Files:**
- Create: `src/components/docs-shell/SearchFilterDropdown.tsx`
- Test: `src/components/docs-shell/SearchFilterDropdown.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/docs-shell/SearchFilterDropdown.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchFilterDropdown } from './SearchFilterDropdown';

const groups = [
  {
    label: 'Realtime Media',
    options: [
      {
        description: 'Real-time voice.',
        label: 'Voice Calling',
        value: 'product:voice',
      },
      {
        description: 'Multi-party video.',
        label: 'Video Calling',
        value: 'product:video',
      },
    ],
  },
];

describe('SearchFilterDropdown', () => {
  it('shows the all-label when nothing is selected', () => {
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={vi.fn()}
        searchPlaceholder="Filter products…"
        value={null}
      />,
    );
    expect(
      screen.getByRole('combobox', { name: 'All products' }),
    ).toHaveTextContent('All products');
  });

  it('shows the selected label and clears it without opening', () => {
    const onChange = vi.fn();
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={onChange}
        searchPlaceholder="Filter products…"
        value="product:video"
      />,
    );
    expect(
      screen.getByRole('combobox', { name: 'All products' }),
    ).toHaveTextContent('Video Calling');
    fireEvent.click(screen.getByTestId('search-filter-clear'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('selects an option from the open dropdown', async () => {
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
    fireEvent.click(await screen.findByText('Voice Calling'));
    expect(onChange).toHaveBeenCalledWith('product:voice');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/SearchFilterDropdown.test.tsx`
Expected: FAIL — module `./SearchFilterDropdown` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/docs-shell/SearchFilterDropdown.tsx`:

```tsx
'use client';

import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/cn';

export type FilterOption = {
  description?: string;
  label: string;
  value: string;
};

export type FilterGroup = {
  label?: string;
  options: FilterOption[];
};

export function SearchFilterDropdown({
  allLabel,
  groups,
  onChange,
  searchPlaceholder,
  value,
}: {
  allLabel: string;
  groups: FilterGroup[];
  onChange: (value: string | null) => void;
  searchPlaceholder: string;
  value: string | null;
}) {
  const [open, setOpen] = useState(false);
  const selected = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={allLabel}
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          role="combobox"
          size="sm"
          variant={selected ? 'secondary' : 'ghost'}
        >
          <span className="max-w-[12rem] truncate">
            {selected ? selected.label : allLabel}
          </span>
          {selected ? (
            <XIcon
              className="size-3 shrink-0"
              data-testid="search-filter-clear"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
            />
          ) : (
            <ChevronsUpDownIcon className="size-3 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 overflow-hidden p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>—</CommandEmpty>
            <CommandItem
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
              value={allLabel}
            >
              <CheckIcon
                className={cn(
                  'size-4 shrink-0',
                  value === null ? 'opacity-100' : 'opacity-0',
                )}
              />
              {allLabel}
            </CommandItem>
            {groups.map((group, index) => (
              <CommandGroup
                heading={group.label}
                key={group.label ?? `group-${index}`}
              >
                {group.options.map((option) => (
                  <CommandItem
                    className="items-start"
                    key={option.value}
                    onSelect={() => {
                      onChange(option.value === value ? null : option.value);
                      setOpen(false);
                    }}
                    value={`${option.label} ${option.value}`}
                  >
                    <CheckIcon
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        option.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span>{option.label}</span>
                      {option.description ? (
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run src/components/docs-shell/SearchFilterDropdown.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/SearchFilterDropdown.tsx src/components/docs-shell/SearchFilterDropdown.test.tsx
git commit -m "feat: add SearchFilterDropdown combobox for search filters"
```

---

## Task 4: Swap the filter bar to two dropdowns

Replace the native `<select>` (product) and the platform pill row with two `SearchFilterDropdown`s. Add two i18n placeholder strings.

**Files:**
- Modify: `src/lib/i18n/resources/en/common.ts:28-29`, `src/lib/i18n/resources/zh-CN/common.ts:28-29`
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx` (imports, filter-group memos, filter-bar JSX)
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Add i18n placeholder strings**

In `src/lib/i18n/resources/en/common.ts`, the lines currently read:

```ts
    searchAllPlatforms: 'All platforms',
    searchAllProducts: 'All products',
```

Add two keys immediately after them:

```ts
    searchAllPlatforms: 'All platforms',
    searchAllProducts: 'All products',
    searchFilterPlatforms: 'Filter platforms…',
    searchFilterProducts: 'Filter products…',
```

In `src/lib/i18n/resources/zh-CN/common.ts`, the lines currently read:

```ts
    searchAllPlatforms: '全部平台',
    searchAllProducts: '全部产品',
```

Add:

```ts
    searchAllPlatforms: '全部平台',
    searchAllProducts: '全部产品',
    searchFilterPlatforms: '筛选平台…',
    searchFilterProducts: '筛选产品…',
```

- [ ] **Step 2: Write the failing test**

Add this test inside the `describe('DocsSearchDialog', …)` block in `src/components/docs-shell/DocsSearchDialog.test.tsx` (e.g. after the "uses Algolia search" test, before the closing `});` at line 390):

```tsx
  it('scopes the Algolia query to a product when a product filter is chosen', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            productScopes={[
              {
                description: 'Real-time voice.',
                filter: 'product:"voice"',
                group: 'Realtime Media',
                id: 'product:voice',
                label: 'Voice Calling',
              },
            ]}
            tabs={[]}
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.click(
      await screen.findByRole('combobox', { name: 'All products' }),
    );
    fireEvent.click(await screen.findByText('Voice Calling'));

    await waitFor(() => {
      expect(createAlgoliaDocsClient).toHaveBeenCalledWith(
        expect.objectContaining({ scopeFilter: 'product:"voice"' }),
      );
    });
  });
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "scopes the Algolia query"`
Expected: FAIL — no `combobox` named "All products" (still a native `<select>`).

- [ ] **Step 4: Import the dropdown**

In `src/components/docs-shell/DocsSearchDialog.tsx`, add to the imports (near line 17, with the other `@/components` imports):

```tsx
import {
  type FilterGroup,
  SearchFilterDropdown,
} from '@/components/docs-shell/SearchFilterDropdown';
```

Then remove `XIcon` from the `lucide-react` import on line 5 (it is only used by the pills being deleted). The line becomes:

```tsx
import { SearchIcon } from 'lucide-react';
```

- [ ] **Step 5: Build the filter groups**

In `DocsSearchDialog`, immediately after the existing `platformOptions` memo (ends at line 157), add:

```tsx
  const productFilterGroups = useMemo<FilterGroup[]>(
    () =>
      groupProductScopes(productScopes).map((group) => ({
        label: group.label,
        options: group.scopes.map((scope) => ({
          description: scope.description,
          label: scope.label,
          value: scope.id,
        })),
      })),
    [productScopes],
  );
  const platformFilterGroups = useMemo<FilterGroup[]>(
    () => [
      {
        options: platformOptions.map((platform) => ({
          label: getPlatformLabel(platform, searchLocale),
          value: platform,
        })),
      },
    ],
    [platformOptions, searchLocale],
  );
```

- [ ] **Step 6: Replace the filter-bar JSX**

Replace the entire `algoliaConfig ? (...) : null` filter-bar block (current lines 253-311, the `<div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">` containing the `<select>` and platform `<Button>`s) with:

```tsx
        {algoliaConfig ? (
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            {productScopes.length > 0 ? (
              <SearchFilterDropdown
                allLabel={t('docs.searchAllProducts')}
                groups={productFilterGroups}
                onChange={setScopeId}
                searchPlaceholder={t('docs.searchFilterProducts')}
                value={scopeId}
              />
            ) : null}
            <SearchFilterDropdown
              allLabel={t('docs.searchAllPlatforms')}
              groups={platformFilterGroups}
              onChange={(next) => setPlatformFilter(next as PlatformKey | null)}
              searchPlaceholder={t('docs.searchFilterPlatforms')}
              value={platformFilter}
            />
          </div>
        ) : null}
```

- [ ] **Step 7: Run the new test and the file's suite**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "scopes the Algolia query"`
Expected: PASS.

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS (the "uses Algolia search" test is unaffected — no filter is selected there, so `scopeFilter` stays `undefined`).

- [ ] **Step 8: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no new errors in `DocsSearchDialog.tsx` (confirms `XIcon` was fully removed and `getPlatformLabel`, `PlatformKey`, `platformRegistry`, `groupProductScopes` are all still used).

- [ ] **Step 9: Commit**

```bash
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts
git commit -m "feat: replace search select+pills with matching filter dropdowns"
```

---

## Task 5: Footer detail strip + remove inline row descriptions

Mirror cmdk's active item into state via `onValueChange`, give each item a stable `value`, drop the always-inline row description, and render a fixed-height footer strip showing the active item's snippet + full path.

**Files:**
- Modify: `src/components/docs-shell/DocsSearchDialog.tsx` (active-value state, item values, footer, row cleanup)
- Test: `src/components/docs-shell/DocsSearchDialog.test.tsx`

- [ ] **Step 1: Update the failing test (footer + path count)**

In `src/components/docs-shell/DocsSearchDialog.test.tsx`, in the "uses Algolia search when configured…" test, find:

```tsx
    expect(screen.getAllByText('Realtime Media › Voice')).toHaveLength(2);
```

Replace it with (the footer adds one more occurrence of the active row's path, and shows its snippet):

```tsx
    expect(screen.getAllByText('Realtime Media › Voice')).toHaveLength(3);
    expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
      'Enable VAD on Android.',
    );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "uses Algolia search"`
Expected: FAIL — path count is 2 (no footer yet) and `search-active-detail` testid not found.

- [ ] **Step 3: Add active-value state**

In `DocsSearchDialog`, next to the other `useState` hooks (after `scopeId`, ~line 66), add:

```tsx
  // Mirrors cmdk's highlighted item (keyboard ↑/↓ AND mouse hover both set it)
  // so the footer can describe the active result without a focus-based tooltip.
  const [activeValue, setActiveValue] = useState<string | null>(null);
```

- [ ] **Step 4: Compute the rendered entries and active detail before the return**

In `DocsSearchDialog`, immediately before the `return (` of the component (just after `handleSelect`/effects, before the top-level `<>`), add:

```tsx
  const tabEntries = filterTabs(tabs, search);
  const resultEntries: RenderedSearchEntry[] = isSearchUnavailable
    ? []
    : showFallbackPages
      ? pages.map(localSearchEntryToRenderedEntry)
      : normalizedSearchResults.map(searchResultToEntry);

  // One detail record per rendered item, in render order (tabs first, then
  // results). `value` matches the cmdk item value set below.
  const detailEntries = [
    ...tabEntries.map((tab) => ({
      path: [] as string[],
      primary: tab.description,
      value: tab.url,
    })),
    ...resultEntries.map((page) => ({
      path: page.path,
      primary: page.description,
      value: page.id ?? page.url,
    })),
  ];

  const normalizedActive = activeValue?.toLowerCase();
  // cmdk lowercases values; match case-insensitively. Fall back to the first
  // rendered item (cmdk auto-selects it) so the strip is populated on open and
  // when the previously-active item is filtered out.
  const activeDetail =
    detailEntries.find(
      (entry) => entry.value.toLowerCase() === normalizedActive,
    ) ?? detailEntries[0];
```

- [ ] **Step 5: Wire `onValueChange` onto the dialog**

In the `<CommandDialog … >` opening tag (currently lines 240-247), add `onValueChange={setActiveValue}`:

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

- [ ] **Step 6: Give the tab items a stable value**

In the tabs `CommandGroup`, change the tab `CommandItem` (currently lines 322-324) to add `value={tab.url}`:

```tsx
              <CommandItem
                key={tab.url}
                onSelect={() => void handleSelect(tab.url)}
                value={tab.url}
              >
```

- [ ] **Step 7: Rebuild the results group from `resultEntries`, add item values, remove inline description**

Replace the results `CommandGroup` (currently lines 337-384 — the `<CommandGroup>` that renders `isSearchUnavailable ? … : (showFallbackPages ? … ).map(...)`) with:

```tsx
          <CommandGroup>
            {isSearchUnavailable ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                {t('docs.searchUnavailable')}
              </div>
            ) : (
              resultEntries.map((page) => (
                <CommandItem
                  className="items-start"
                  key={page.id ?? page.url}
                  onSelect={() => void handleSelect(page.url)}
                  value={page.id ?? page.url}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <HighlightedText
                      className="line-clamp-1 font-medium"
                      value={page.title}
                    />
                    {page.path.length > 0 ? (
                      <div className="line-clamp-1 text-[0.7rem] text-muted-foreground">
                        {page.path.join(' › ')}
                      </div>
                    ) : null}
                    {page.context.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {page.context.map((item) => (
                          <span
                            className="rounded border border-border bg-background/70 px-1.5 py-0.5 text-[0.68rem] leading-none text-muted-foreground"
                            key={`${page.id ?? page.url}:${item}`}
                          >
                            <HighlightedText value={item} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandGroup>
```

(The removed block is the trailing `{page.description ? <HighlightedText … /> : null}` inside each row.)

- [ ] **Step 8: Add the footer strip after `</CommandList>`**

Immediately after the closing `</CommandList>` (line 385) and before `</CommandDialog>`, add:

```tsx
        {activeDetail && (activeDetail.primary || activeDetail.path.length > 0) ? (
          <div
            className="min-h-[3.25rem] shrink-0 border-t px-4 py-2"
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
```

- [ ] **Step 9: Run the target test**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx -t "uses Algolia search"`
Expected: PASS — path count 3, footer shows `Enable VAD on Android.`

- [ ] **Step 10: Run the full file suite**

Run: `bunx vitest run src/components/docs-shell/DocsSearchDialog.test.tsx`
Expected: PASS (all tests, including Task 4's scope test).

- [ ] **Step 11: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no new errors in `DocsSearchDialog.tsx`.

- [ ] **Step 12: Commit**

```bash
git add src/components/docs-shell/DocsSearchDialog.tsx src/components/docs-shell/DocsSearchDialog.test.tsx
git commit -m "feat: show active search result detail in a fixed footer strip"
```

---

## Task 6: Final verification (changed files only)

**Files:** none (verification only)

- [ ] **Step 1: Run every changed test file**

Run:
```bash
bunx vitest run \
  src/lib/docs-tree.test.ts \
  src/components/docs-shell/SearchFilterDropdown.test.tsx \
  src/components/docs-shell/DocsSearchDialog.test.tsx
```
Expected: all PASS.

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors attributable to files this plan touched. (Ignore any pre-existing failures in unrelated files per the baseline note.)

- [ ] **Step 3: Lint/format the changed files**

Run:
```bash
bunx biome check \
  src/lib/docs-tree.ts \
  src/components/ui/command.tsx \
  src/components/docs-shell/SearchFilterDropdown.tsx \
  src/components/docs-shell/SearchFilterDropdown.test.tsx \
  src/components/docs-shell/DocsSearchDialog.tsx \
  src/lib/i18n/resources/en/common.ts \
  src/lib/i18n/resources/zh-CN/common.ts
```
Expected: clean (add `--write` to auto-fix formatting, then re-run and commit any changes).

- [ ] **Step 4: Manual smoke check (optional but recommended)**

Run the dev server, open search (⌘K) with Algolia configured, and confirm: two dropdowns render; the product dropdown lists grouped products with descriptions and `AI`/`API Reference` at the top; selecting a product narrows results; arrowing ↑/↓ through results updates the footer snippet; the clear (×) resets each filter.

- [ ] **Step 5: Commit any format fixes**

```bash
git add -A
git commit -m "chore: biome format for search filter picker" || echo "nothing to commit"
```

---

## Self-Review Notes

- **Spec coverage:** §1 filter dropdowns → Tasks 3–4; §2 footer strip + row cleanup → Task 5; §3 `ProductScope.description` → Task 1; §4 keyboard nav (cmdk + `onValueChange`) → Tasks 2 & 5; testing → tests embedded per task + Task 6. `icon` correctly omitted (spec Out of scope). "All products" label kept; tab-scopes stay ungrouped (Task 1 preserves existing grouping).
- **Type consistency:** `FilterGroup`/`FilterOption` defined in Task 3 and imported in Task 4; `RenderedSearchEntry`, `localSearchEntryToRenderedEntry`, `searchResultToEntry`, `filterTabs`, `groupProductScopes`, `HighlightedText` already exist in `DocsSearchDialog.tsx`; `setScopeId`/`setPlatformFilter` are existing setters. Item `value`s in Task 5 (`tab.url`, `page.id ?? page.url`) match the `detailEntries` keys.
- **Known intentional test change:** the path-count assertion moves 2→3 because the footer repeats the active row's (short) path — documented in Task 5 Step 1.
