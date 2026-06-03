# Nav Scope Versioned API Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hard-coded independent sidebar behavior with lightweight `meta.json` driven `navScope`, preserve nested left navigation, add platform-scoped RTC Android API reference versioning, and support persistent Fumadocs-compatible tabs.

**Architecture:** Keep Fumadocs as the source-of-truth page-tree lifecycle. Extend Fumadocs meta validation with one repo-local `navScope` field, then derive scoped sidebars, breadcrumbs, prev/next, back links, and version switch URLs from the page tree plus `source.getNodeMeta`. Current-version clean URLs use Fumadocs route groups like `(current)`. Platform guide variants use existing MDX `Tabs` wrappers with `groupId` and `persist`.

**Tech Stack:** Fumadocs Core/MDX, TanStack Start, React 19, local docs-shell components, shadcn/Radix primitives already in the repo, Vitest, Biome, Bun.

---

## Confirmed Scope

- Metadata field name is `navScope`, not `subnav`.
- `navScope` exists means the folder starts an independent navigation scope.
- `navScope.versions` exists means the scope is versioned.
- No `type` field in `navScope`; the folder location defines product/platform meaning.
- No JSON `$schema` links in content JSON for this round.
- API reference versions are platform-scoped for RTC Android:
  - `content/docs/{locale}/api-reference/rtc/android/(current)/**`
  - `content/docs/{locale}/api-reference/rtc/android/4.6.0/**`
- Current version label is `v4.6.2`; previous version label is `v4.6.0`.
- Current version URLs omit `(current)`.
- Previous version URLs include `/4.6.0/`.
- The Android scope sidebar shows only the active version's pages, not the version folder list.
- Parent sidebars compress any `navScope` folder to one page-like entry.
- Back link target is the nearest parent `navScope`; if absent, use the tab root.
- Do not solve duplicated search or `llms-full.txt` indexing yet.

## Task 0: Baseline And Safety Check

**Files:**
- Read only

- [ ] **Step 1: Confirm branch and dirty state**

Run:

```bash
git status --short --branch
git log --oneline -5
```

Expected:

- Current branch is the feature branch rebased on `origin/main`.
- Any dirty files are only the current agent's plan/design files. If user-owned unrelated changes appear, leave them untouched.

- [ ] **Step 2: Confirm Fumadocs generated source is current**

Run:

```bash
bun run types:check
```

Expected:

- This may reveal unrelated current repo issues. If it fails before implementation, record the exact failure and still continue with targeted tests for touched areas.

## Task 1: Add Lightweight Docs Meta Schema

**Files:**
- Create: `src/lib/docs-meta-schema.ts`
- Create: `src/lib/docs-meta-schema.test.ts`
- Modify: `source.config.ts`

- [ ] **Step 1: Add the schema extension test first**

Create `src/lib/docs-meta-schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { docsMetaSchema } from './docs-meta-schema';

describe('docsMetaSchema', () => {
  it('accepts a plain nav scope', () => {
    expect(
      docsMetaSchema.parse({
        pages: ['index', 'android'],
        title: 'RTC',
        navScope: {},
      }),
    ).toEqual({
      pages: ['index', 'android'],
      title: 'RTC',
      navScope: {},
    });
  });

  it('accepts a versioned nav scope', () => {
    expect(
      docsMetaSchema.parse({
        title: 'Android API Reference',
        navScope: {
          defaultVersion: 'current',
          versions: [
            { id: 'current', label: 'v4.6.2', path: '(current)' },
            { id: '4.6.0', label: 'v4.6.0', path: '4.6.0' },
          ],
        },
        pages: ['(current)', '4.6.0'],
      }).navScope?.versions,
    ).toHaveLength(2);
  });

  it('rejects incomplete version entries', () => {
    expect(() =>
      docsMetaSchema.parse({
        navScope: {
          versions: [{ id: 'current', label: 'v4.6.2' }],
        },
      }),
    ).toThrow();
  });
});
```

Run:

```bash
bunx vitest run src/lib/docs-meta-schema.test.ts
```

Expected: FAIL because `docs-meta-schema.ts` does not exist yet.

- [ ] **Step 2: Implement the schema**

Create `src/lib/docs-meta-schema.ts`:

```ts
import { metaSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docsNavScopeVersionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
});

export const docsNavScopeSchema = z.object({
  defaultVersion: z.string().min(1).optional(),
  versions: z.array(docsNavScopeVersionSchema).min(1).optional(),
});

export const docsMetaSchema = metaSchema.extend({
  navScope: docsNavScopeSchema.optional(),
});

export type DocsMeta = z.infer<typeof docsMetaSchema>;
export type DocsNavScope = z.infer<typeof docsNavScopeSchema>;
export type DocsNavScopeVersion = z.infer<typeof docsNavScopeVersionSchema>;
```

Modify `source.config.ts`:

```ts
import { docsMetaSchema } from './src/lib/docs-meta-schema';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: rawDocSchema,
  },
  meta: {
    schema: docsMetaSchema,
  },
});
```

Keep the existing `docs.mdxOptions` and `docs.postprocess` configuration exactly where it is; only add the sibling `meta` object at the top level of `defineDocs`.

Do not add `$schema` keys to content JSON.

- [ ] **Step 3: Verify and commit**

Run:

```bash
bunx vitest run src/lib/docs-meta-schema.test.ts
bun run types:check
git diff --check
git add source.config.ts src/lib/docs-meta-schema.ts src/lib/docs-meta-schema.test.ts
git commit -m "feat: add docs nav scope meta schema"
```

Expected: schema tests pass. `types:check` should pass or the failure should be unrelated and recorded.

## Task 2: Add Nav Scope Resolver

**Files:**
- Create: `src/lib/docs-nav-scope.ts`
- Create: `src/lib/docs-nav-scope.test.ts`
- Modify: `src/lib/docs-tree.ts` only if helper exports are needed

- [ ] **Step 1: Write resolver tests**

Create a synthetic page tree with these folders:

```text
/en/api-reference
  /rtc                  navScope
    /android            navScope with versions
      /(current)
        /overview
        /audio/audio-basic
      /4.6.0
        /overview
```

Mock `getNodeMeta(node)` by `$id`:

```ts
const metaById = new Map<string, DocsMeta>([
  ['rtc-folder', { title: 'RTC', navScope: {}, pages: ['index', 'android'] }],
  [
    'android-folder',
    {
      title: 'Android API Reference',
      navScope: {
        defaultVersion: 'current',
        versions: [
          { id: 'current', label: 'v4.6.2', path: '(current)' },
          { id: '4.6.0', label: 'v4.6.0', path: '4.6.0' },
        ],
      },
      pages: ['(current)', '4.6.0'],
    },
  ],
]);
```

Tests:

- Current URL `/en/api-reference/rtc/android/overview` resolves to Android scope and current version.
- Previous URL `/en/api-reference/rtc/android/4.6.0/overview` resolves to Android scope and `4.6.0`.
- Sidebar root for a versioned scope is the active version folder.
- Back link for Android scope points to `/en/api-reference/rtc` with label `RTC`.
- Switching from current overview to `4.6.0` points to `/en/api-reference/rtc/android/4.6.0/overview`.
- Switching from `4.6.0` overview to current points to `/en/api-reference/rtc/android/overview`.
- If the relative target page is missing, switcher href falls back to target version index or first descendant page.

Run:

```bash
bunx vitest run src/lib/docs-nav-scope.test.ts
```

Expected: FAIL because resolver does not exist yet.

- [ ] **Step 2: Implement resolver types**

Create `src/lib/docs-nav-scope.ts` with these exported types:

```ts
import type { Folder, Node, Root } from 'fumadocs-core/page-tree';
import type { DocsMeta, DocsNavScopeVersion } from './docs-meta-schema';
import type { DocsSidebarNode } from './docs-tree';

export type DocsSidebarHeaderVersion = {
  href: string;
  id: string;
  label: string;
};

export type DocsSidebarHeader = {
  backHref: string;
  backLabel: string;
  title: string;
  versionSwitcher?: {
    currentId: string;
    versions: DocsSidebarHeaderVersion[];
  };
};

export type DocsNavScopeResolution = {
  activeVersion?: DocsNavScopeVersion & { node: Folder };
  header: DocsSidebarHeader;
  parentScope?: {
    href: string;
    node: Folder;
    title: string;
  };
  scope: {
    meta: DocsMeta;
    node: Folder;
  };
  sidebarRoot: Folder;
};

export type GetDocsNodeMeta = (node: Node) => DocsMeta | undefined;
```

- [ ] **Step 3: Implement resolver functions**

Export these functions:

```ts
export function resolveDocsNavScope({
  activePath,
  getNodeMeta,
  root,
  tab,
}: {
  activePath: string;
  getNodeMeta: GetDocsNodeMeta;
  root: Root;
  tab: string;
}): DocsNavScopeResolution | null;

export function getNavScopeSidebarNodes({
  getNodeMeta,
  root,
  tab,
}: {
  getNodeMeta: GetDocsNodeMeta;
  root: Root;
  tab: string;
}): DocsSidebarNode[];
```

Implementation rules:

- Find the tab folder using its index URL segment.
- Walk the page tree and keep the ancestor stack for `activePath`.
- A folder is a scope when `getNodeMeta(folder)?.navScope` is present.
- Nearest scope wins.
- Parent scope is the previous scoped folder in the ancestor stack.
- For versioned scopes, find the version folder by matching the active path inside each version folder subtree.
- For `(current)`, match by subtree URL, not by literal path segment, because Fumadocs removes route groups from URLs.
- The active version folder becomes `sidebarRoot`.
- Build version hrefs by preserving the relative URL below the active version folder and falling back to `getFirstDescendantPageUrl(targetVersionNode)`.
- For current target hrefs, use the target node URL directly; no `(current)` URL segment should appear.
- For previous target hrefs, keep the version segment already emitted by Fumadocs page-tree URLs.

Keep implementation data-driven. Do not check strings like `rtc`, `android`, `device-kit`, or `ai` in this file.

- [ ] **Step 4: Verify and commit**

Run:

```bash
bunx vitest run src/lib/docs-nav-scope.test.ts
bun run types:check
git diff --check
git add src/lib/docs-nav-scope.ts src/lib/docs-nav-scope.test.ts src/lib/docs-tree.ts
git commit -m "feat: resolve docs nav scopes from metadata"
```

Expected: resolver tests pass. Typecheck should pass or record unrelated failures.

## Task 3: Integrate Scoped Sidebar, Breadcrumbs, And Prev/Next

**Files:**
- Modify: `src/lib/docs-page.server.ts`
- Modify: `src/lib/docs-tree.ts`
- Modify: `src/lib/docs-page.server.test.ts`
- Modify: `src/lib/docs-tree.test.ts`

- [ ] **Step 1: Add failing integration tests**

Update `src/lib/docs-page.server.test.ts` mock:

```ts
source: {
  getNodeMeta: vi.fn(),
  getPage: vi.fn(),
  getPages: vi.fn(),
  getPageTree: vi.fn(),
},
```

Add tests:

- A Device Kit page with `content/docs/en/ai/device-kit/meta.json` declaring `navScope` returns a scoped sidebar and header without hard-coded AI-specific filtering.
- An Android current page returns:

```ts
sidebarHeader: {
  backHref: '/en/api-reference/rtc',
  backLabel: 'RTC',
  title: 'Android API Reference',
  versionSwitcher: {
    currentId: 'current',
    versions: [
      { id: 'current', label: 'v4.6.2', href: '/en/api-reference/rtc/android/overview' },
      { id: '4.6.0', label: 'v4.6.0', href: '/en/api-reference/rtc/android/4.6.0/overview' },
    ],
  },
}
```

- Current Android navigation does not include links from `/4.6.0/`.
- Previous Android navigation does not include links from current.
- Breadcrumbs are derived from the scoped sidebar and start at the active version tree.

Update `src/lib/docs-tree.test.ts` or add tests in `docs-nav-scope.test.ts` for parent sidebar compression:

- API Reference parent sidebar shows a single `RTC` entry.
- It does not expose `Android API Reference`, `(current)`, `4.6.0`, or API method pages under parent tab sidebar.

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts src/lib/docs-tree.test.ts src/lib/docs-nav-scope.test.ts
```

Expected: FAIL until integration is complete.

- [ ] **Step 2: Replace hard-coded scoped sidebar code**

In `src/lib/docs-page.server.ts`, remove these product-specific sidebar branches:

- `OPENAPI_TAB` remains; it is still needed for OpenAPI overlay endpoints.
- `DEVICE_KIT_PATH_ENTRY_SLUG` remains only for legacy redirects.
- Remove `resolveScopedSidebar`.
- Remove `isDeviceKitPathEntry` as a sidebar/header predicate. Keep or replace only the redirect-specific logic.
- Remove `getDeviceKitScopedSidebar`.
- Remove `filterAiSidebar`.
- Remove hard-coded `getDocsSidebarHeader`.

Use `resolveDocsNavScope` in one place:

```ts
const navScope = activePath
  ? resolveDocsNavScope({
      activePath,
      getNodeMeta: source.getNodeMeta,
      root: pageTree,
      tab,
    })
  : null;

const sidebar = navScope
  ? pageTreeNodeToSidebarNodes(navScope.sidebarRoot).flatMap((node) =>
      node.type === 'section' ? node.children : [node],
    )
  : getNavScopeSidebarNodes({
      getNodeMeta: source.getNodeMeta,
      root: pageTree,
      tab,
    });
```

Use the same `navScope` result for:

- `sidebarHeader`
- breadcrumb fallback
- prev/next root

For prev/next:

```ts
navigation: getPrevNextLinks(navScope?.sidebarRoot ?? pageTree, page.url)
```

If `findNeighbour` requires a `Root`, add a local helper in `docs-tree.ts`:

```ts
export function getPrevNextLinksFromNode(node: Folder | Root, currentUrl: string) {
  return getPrevNextLinks({ children: [node], name: 'Scoped root' }, currentUrl);
}
```

- [ ] **Step 3: Preserve OpenAPI overlay behavior**

Keep `addOpenApiEndpointSidebarItems` for generated OpenAPI endpoints.

Rule:

- If a `navScope` is active, use scoped sidebar first, then add OpenAPI overlay items only when relevant.
- If no `navScope` is active and tab is `api-reference`, parent sidebar uses `getNavScopeSidebarNodes` so `rtc` compresses to one entry.
- Existing Conversational AI OpenAPI sidebar behavior must still pass tests.

- [ ] **Step 4: Verify and commit**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts src/lib/docs-tree.test.ts src/lib/docs-nav-scope.test.ts
bun run types:check
git diff --check
git add src/lib/docs-page.server.ts src/lib/docs-tree.ts src/lib/docs-page.server.test.ts src/lib/docs-tree.test.ts src/lib/docs-nav-scope.test.ts
git commit -m "feat: render docs sidebars from nav scopes"
```

Expected: all targeted tests pass. No product names are hard-coded in new sidebar-scope logic.

## Task 4: Restructure RTC Android API Reference Content

**Files:**
- Modify: `content/docs/en/api-reference/rtc/meta.json`
- Modify: `content/docs/zh-CN/api-reference/rtc/meta.json`
- Modify: `content/docs/en/api-reference/rtc/android/meta.json`
- Modify: `content/docs/zh-CN/api-reference/rtc/android/meta.json`
- Create: `content/docs/en/api-reference/rtc/index.md`
- Move/copy: `content/docs/{en,zh-CN}/api-reference/rtc/android/**`

- [ ] **Step 1: Move current content into route group**

For each locale:

```bash
mkdir -p 'content/docs/en/api-reference/rtc/android/(current)'
find content/docs/en/api-reference/rtc/android -mindepth 1 -maxdepth 1 \
  ! -name meta.json \
  ! -name '(current)' \
  ! -name '4.6.0' \
  -exec git mv {} 'content/docs/en/api-reference/rtc/android/(current)'/ \;
```

Repeat for `zh-CN`.

Expected:

- `android/meta.json` remains at the scope container.
- All real Android pages and nested section metadata move under `(current)`.
- There is no top-level `android/index.mdx`.

- [ ] **Step 2: Duplicate current content to previous version**

Run:

```bash
cp -R 'content/docs/en/api-reference/rtc/android/(current)' 'content/docs/en/api-reference/rtc/android/4.6.0'
cp -R 'content/docs/zh-CN/api-reference/rtc/android/(current)' 'content/docs/zh-CN/api-reference/rtc/android/4.6.0'
git add content/docs/en/api-reference/rtc/android/4.6.0 content/docs/zh-CN/api-reference/rtc/android/4.6.0
```

Expected: `4.6.0` is a byte-for-byte fixture copy for this round.

- [ ] **Step 3: Update RTC and Android meta files**

Set `content/docs/en/api-reference/rtc/meta.json`:

```json
{
  "title": "RTC",
  "navScope": {},
  "pages": ["index", "android"]
}
```

Create `content/docs/en/api-reference/rtc/index.md`:

```md
---
title: RTC API Reference
description: API reference for Agora RTC SDKs.
---

# RTC API Reference

Explore SDK API references by platform.
```

Set `content/docs/zh-CN/api-reference/rtc/meta.json`:

```json
{
  "title": "RTC",
  "navScope": {},
  "pages": ["index", "android"]
}
```

Update both Android scope meta files:

```json
{
  "title": "Android API Reference",
  "navScope": {
    "defaultVersion": "current",
    "versions": [
      { "id": "current", "label": "v4.6.2", "path": "(current)" },
      { "id": "4.6.0", "label": "v4.6.0", "path": "4.6.0" }
    ]
  },
  "pages": ["(current)", "4.6.0"]
}
```

For `zh-CN`, keep the title localized if the existing file uses localized wording, but keep the same `navScope` object.

- [ ] **Step 4: Add Device Kit nav scope metadata**

Update `content/docs/en/ai/device-kit/meta.json`:

```json
{
  "title": "Convo AI Device Kit",
  "navScope": {}
}
```

Keep the existing `pages` array and any existing metadata keys in that file; only add the sibling `navScope` object. If `content/docs/zh-CN/ai/device-kit/meta.json` exists, apply the same `navScope` addition. If it does not exist, do not create a zh-CN Device Kit tree in this task.

- [ ] **Step 5: Verify content URLs**

Run:

```bash
bun run types:check
bunx vitest run src/lib/docs-page.server.test.ts src/lib/docs-nav-scope.test.ts
```

Expected:

- Fumadocs generation succeeds with route groups.
- `/en/api-reference/rtc/android/overview` is generated from `(current)/overview.mdx`.
- `/en/api-reference/rtc/android/4.6.0/overview` is generated from `4.6.0/overview.mdx`.

- [ ] **Step 6: Commit content restructuring**

Run:

```bash
git diff --check
git add content/docs
git commit -m "feat: add versioned rtc android api reference content"
```

Expected: commit mostly contains renames/copies and metadata changes.

## Task 5: Add Sidebar Version Selector UI

**Files:**
- Modify: `src/components/docs-shell/DocsSidebar.tsx`
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify or create: `src/components/docs-shell/DocsShell.test.tsx`

- [ ] **Step 1: Add component tests first**

Add a test that renders `DocsShell` with:

```ts
sidebarHeader={{
  backHref: '/en/api-reference/rtc',
  backLabel: 'RTC',
  title: 'Android API Reference',
  versionSwitcher: {
    currentId: 'current',
    versions: [
      { id: 'current', label: 'v4.6.2', href: '/en/api-reference/rtc/android/overview' },
      { id: '4.6.0', label: 'v4.6.0', href: '/en/api-reference/rtc/android/4.6.0/overview' },
    ],
  },
}}
```

Assert:

- Desktop sidebar contains `Android API Reference`.
- Desktop sidebar contains a button or link labeled `v4.6.2`.
- Opening the popover shows `v4.6.0`.
- Mobile sidebar header also receives the selector payload.

Run:

```bash
bunx vitest run src/components/docs-shell/DocsShell.test.tsx
```

Expected: FAIL until UI is wired.

- [ ] **Step 2: Extract shared header type**

Import `DocsSidebarHeader` from `src/lib/docs-nav-scope.ts` and use it in both `DocsSidebar.tsx` and `DocsShell.tsx`.

Do not duplicate the type inline.

- [ ] **Step 3: Render version switcher**

In `DocsSidebar.tsx`, use existing primitives:

```tsx
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
```

Render:

```tsx
{header.versionSwitcher ? (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        aria-label="Select documentation version"
        className="mt-2 h-8 max-w-full justify-between gap-2 rounded-lg px-2 text-[13px]"
        size="sm"
        variant="outline"
      >
        <span className="truncate">{currentVersionLabel}</span>
        <ChevronDownIcon className="size-3.5 shrink-0" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-44 p-1">
      {header.versionSwitcher.versions.map((version) => (
        <Button asChild className="w-full justify-between rounded-lg" key={version.id} variant="ghost">
          <Link to={version.href} onClick={onSelectPath} params={{}} search={{}}>
            <span>{version.label}</span>
            {version.id === header.versionSwitcher.currentId ? <CheckIcon className="size-4" /> : null}
          </Link>
        </Button>
      ))}
    </PopoverContent>
  </Popover>
) : null}
```

Keep the control compact and constrained so long labels cannot resize the sidebar.

- [ ] **Step 4: Render the same selector in mobile header**

In `DocsShell.tsx`, either reuse a small `DocsSidebarHeaderBlock` component or mirror the same UI in `MobileSidebar`.

Rules:

- Mobile header should not nest cards inside cards.
- The version button should sit below the scope title.
- Selecting a version closes the sheet through `onSelectPath`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
bunx vitest run src/components/docs-shell/DocsShell.test.tsx
bunx vitest run src/lib/docs-page.server.test.ts
bun run types:check
git diff --check
git add src/components/docs-shell/DocsSidebar.tsx src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx
git commit -m "feat: add docs sidebar version selector"
```

Expected: selector tests pass; sidebar header remains stable on desktop and mobile.

## Task 6: Add Persistent Fumadocs-Compatible Tabs

**Files:**
- Modify: `src/components/mdx.tsx`
- Modify: `src/components/mdx.test.tsx`

- [ ] **Step 1: Add tests first**

Add tests for `Tabs` and `CodeBlockTabs`:

- With `groupId="platform"` and `persist`, selecting `ios` writes `docs-tabs:platform = ios`.
- A later render with default `android` reads `ios` from local storage.
- Controlled tabs with explicit `value` do not read from local storage.
- If stored value is not present in triggers, fall back to default/first trigger.

Run:

```bash
bunx vitest run src/components/mdx.test.tsx
```

Expected: FAIL until persistence is implemented.

- [ ] **Step 2: Extend wrapper props**

In `src/components/mdx.tsx`, add:

```ts
type PersistableTabsProps = React.ComponentProps<typeof UiTabs> & {
  groupId?: string;
  persist?: boolean;
};
```

Use it for both `Tabs` and `CodeBlockTabs`.

- [ ] **Step 3: Implement persistence helper**

Add:

```ts
function usePersistentTabsValue({
  children,
  defaultValue,
  groupId,
  onValueChange,
  persist,
  value,
}: PersistableTabsProps) {
  const validValues = getTabsTriggerValues(children);
  const fallbackValue =
    defaultValue ?? value ?? validValues.at(0);
  const storageKey = persist && groupId ? `docs-tabs:${groupId}` : null;
  const isControlled = value !== undefined;
  const [storedValue, setStoredValue] = useState(() => {
    if (!storageKey || isControlled || typeof window === 'undefined') {
      return fallbackValue;
    }
    const saved = window.localStorage.getItem(storageKey);
    return saved && validValues.includes(saved) ? saved : fallbackValue;
  });

  return {
    defaultValue: isControlled ? defaultValue : undefined,
    value: isControlled ? value : storedValue,
    onValueChange: (nextValue: string) => {
      if (storageKey && validValues.includes(nextValue)) {
        window.localStorage.setItem(storageKey, nextValue);
      }
      if (!isControlled) {
        setStoredValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
  };
}
```

Also add `getTabsTriggerValues(children)` beside `getFirstTabsTriggerValue`.

- [ ] **Step 4: Wire both wrappers**

For `Tabs` and `CodeBlockTabs`:

```tsx
const tabState = usePersistentTabsValue(props);

return (
  <UiTabs
    className={cn('docs-mdx-tabs my-6', props.className)}
    {...props}
    {...tabState}
  />
);
```

Do not create a new `PlatformTabs` component.

- [ ] **Step 5: Verify and commit**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx
bun run types:check
git diff --check
git add src/components/mdx.tsx src/components/mdx.test.tsx
git commit -m "feat: persist docs tabs by group"
```

Expected: tabs persistence tests pass and existing MDX tests remain green.

## Task 7: Update Fumadocs Migration Skill

**Files:**
- Modify: `.agents/skills/fumadocs-migration/SKILL.md`
- Modify: `.agents/skills/fumadocs-migration/references/standards.md`
- Modify other direct reference files only if they already describe API reference migration

- [ ] **Step 1: Add migration rules**

Update the skill with these rules:

- Use `navScope` in `meta.json` for independent product/platform navigation.
- Do not hard-code scoped navigation in docs-shell code.
- For API references whose versions differ by platform, place versions under the platform folder.
- Use `(current)` for the clean current-version URL.
- Keep the scope folder as a container with `pages: ["(current)", "..."]`.
- The version folder owns the real page order.
- Use existing `Tabs`/`CodeBlockTabs` with `groupId` and `persist` for same-page platform variants.
- Do not create custom platform tab components for migrations.
- Do not add JSON `$schema` relative paths in migrated `meta.json`.

- [ ] **Step 2: Add a concrete RTC Android example**

Include this example:

```text
content/docs/en/api-reference/rtc/android/
  meta.json                 navScope with versions
  (current)/meta.json       real sidebar order
  4.6.0/meta.json           real sidebar order
```

Routes:

```text
/en/api-reference/rtc/android/overview
/en/api-reference/rtc/android/4.6.0/overview
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
git diff --check
git add .agents/skills/fumadocs-migration
git commit -m "docs: update fumadocs migration nav scope guidance"
```

Expected: skill docs are updated without removing the generated HTML API reference guidance added from `main`.

## Task 8: Full Verification And Browser Smoke

**Files:**
- No planned edits unless verification finds issues

- [ ] **Step 1: Run focused test suite**

Run:

```bash
bunx vitest run \
  src/lib/docs-meta-schema.test.ts \
  src/lib/docs-nav-scope.test.ts \
  src/lib/docs-tree.test.ts \
  src/lib/docs-page.server.test.ts \
  src/components/docs-shell/DocsShell.test.tsx \
  src/components/docs-shell/DocsSidebarTree.test.tsx \
  src/components/mdx.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run repo verification**

Run:

```bash
bun run types:check
bun run docs:links
bun run build
git diff --check
```

Expected:

- Typecheck passes.
- Link audit passes or only reports known pre-existing unrelated issues.
- Build passes.
- No whitespace errors.

- [ ] **Step 3: Run local browser smoke**

Start the dev server:

```bash
bun run dev
```

Open these routes:

```text
http://localhost:5173/en/api-reference/rtc
http://localhost:5173/en/api-reference/rtc/android/overview
http://localhost:5173/en/api-reference/rtc/android/4.6.0/overview
http://localhost:5173/zh-CN/api-reference/rtc/android/overview
http://localhost:5173/zh-CN/api-reference/rtc/android/4.6.0/overview
http://localhost:5173/en/ai/device-kit/start-here/quickstart
```

Verify:

- Parent API Reference sidebar shows `RTC` as a compressed scope entry.
- Android API Reference sidebar shows active version pages only.
- Version selector appears in desktop and mobile sidebar headers.
- Switching versions preserves the relative page when available.
- Current version URLs do not include `(current)`.
- Previous version URLs include `/4.6.0/`.
- Device Kit still has independent navigation but no product-specific shell code.
- Left nav item layout is stable and text does not overlap.

- [ ] **Step 4: Final status and optional final commit**

Run:

```bash
git status --short --branch
git log --oneline -8
```

If verification fixes were made, commit them:

```bash
git add <changed-files>
git commit -m "fix: polish nav scope verification issues"
```

Expected final branch contains small commits by task and no untracked implementation files.

## Risk Notes

- Fumadocs route groups may affect generated page-tree `$id` or node naming. Resolver tests should rely on URLs and meta, not fragile `$id` values outside synthetic fixtures.
- `source.getNodeMeta` typing may differ from the mock shape. Keep the resolver callback typed locally so tests and production can adapt without leaking Fumadocs internals.
- The RTC Android copy is intentionally duplicated for `4.6.0` as a fixture. Do not try to fetch real previous-version docs in this task.
- Existing Conversational AI OpenAPI overlay is separate from Fumadocs API reference MDX. Preserve its generated endpoint behavior.
- Search and `llms-full.txt` duplicates are accepted this round; do not add indexing filters until a separate decision is made.
