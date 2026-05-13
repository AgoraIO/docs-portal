# New Doc Portal Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `docs-portal` as a new docs site that keeps `fumadocs-core` + `fumadocs-mdx`, removes all `fumadocs-ui` and old portal/query-route architecture, migrates `content/home` into a clean `content/docs/<locale>/<tab>/...` tree, and renders the entire site with `shadcn/ui` components and custom layout code.

**Architecture:** The new site treats the content tree as the product IA. Top-level tabs map to root folders under `content/docs/<locale>/`, `meta.json` files define sidebar ordering/grouping, and `fumadocs-core/source` remains the single source of truth for page resolution, page tree, search indexing, and `llms.txt`. The app shell, header, tabs, sidebar, page body, TOC, theme switcher, locale switcher, and search dialog are rebuilt with local React components and `shadcn/ui`, while all old homepage/portal/docs-shell code is deleted rather than adapted.

**Tech Stack:** TanStack Start, TanStack Router, React 19, Tailwind v4, `fumadocs-core`, `fumadocs-mdx`, `shadcn/ui`, `i18next`, Vitest, Biome

---

## POC Override Decisions

This plan intentionally overrides the older external-content-repository direction documented in `docs/superpowers/specs/2026-04-16-content-workspace-design.md`.

For this run, the explicit product decisions are:

- `docs-portal` itself becomes the source of truth for docs content and IA.
- `content/docs/<locale>/<tab>/...` is the canonical long-term tree for this POC.
- `meta.json` checked into this repo owns tab order and sidebar hierarchy for this POC.
- `external/docs-cortex` and the git submodule-based external content model are physically removed during execution, not merely deprecated in code paths.
- `/` becomes the docs entry and redirects to `/en/introduction`.
- Legacy public docs URLs do not need compatibility redirects. It is acceptable for `/docs/**` and `/doc/**` to disappear after the rebuild.
- Adjacent non-doc routes not covered by this rebuild, especially `/api-ref/**`, remain intact unless explicitly replaced.

These are not accidental implementation assumptions. They are scope decisions already agreed in the design discussion for this rebuild.

---

## File Structure

### Keep and repurpose

- `source.config.ts`
  - Point the docs collection at the new `content/docs` tree.
- `src/lib/source.ts`
  - Keep `fumadocs-core/source` loader as the canonical content source.
  - Rework `baseUrl` and markdown-content URL generation for the new route model.
- `src/routes/api/search.ts`
  - Keep static search generation from `fumadocs-core/search/server`.
- `src/routes/llms[.]txt.ts`
  - Keep `llms(source).index()` on the new content source.
- `src/routes/llms-full[.]txt.ts`
  - Keep full concatenated AI-readable output.
- `src/routes/llms[.]mdx.docs.$.ts`
  - Keep raw markdown endpoint, but update slug resolution against the new content tree.
- `src/lib/i18n/*`
  - Keep existing locale detection/storage primitives, but stop depending on `fumadocs-ui` i18n.
- `src/lib/theme/theme-preference.ts`
  - Keep theme storage key/type helpers.
- `src/components/ui/*`
  - Reuse existing shadcn components and add missing ones.

### Create

- `content/docs/en/...`
- `content/docs/zh-CN/...`
  - New canonical content tree organized by locale and top-level tab.
- `content/docs/en/meta.json`
- `content/docs/zh-CN/meta.json`
- `content/docs/en/<tab>/meta.json`
- `content/docs/zh-CN/<tab>/meta.json`
  - Page-tree metadata for tab ordering, sidebar section ordering, labels, and default pages.
- `scripts/migrate-home-content-to-docs.mjs`
  - One-off migration script that moves `content/home` files into the new tree and rewrites internal links/slugs.
- `src/lib/docs-routing.ts`
  - Helpers for locale-aware path parsing/building, tab extraction, sibling locale lookup, and root redirects.
- `src/lib/docs-navigation.ts`
  - Helpers around the `fumadocs-core` page tree: top-level tab extraction, sidebar section extraction, current-tab lookup, TOC helpers if needed.
- `src/lib/docs-search.ts`
  - Shared client-side search helpers if the new search dialog should be isolated from the old implementation.
- `src/components/docs-shell/DocsHeader.tsx`
  - Global header with brand, tab navigation, locale switch, theme switch, and search trigger.
- `src/components/docs-shell/DocsTabs.tsx`
  - Horizontal top-level tabs driven from page-tree roots.
- `src/components/docs-shell/DocsSidebar.tsx`
  - Left sidebar driven from the active tab subtree.
- `src/components/docs-shell/DocsToc.tsx`
  - Right TOC driven from page TOC data.
- `src/components/docs-shell/DocsPage.tsx`
  - Page body wrapper rendering title, description, article content, prev/next links if needed.
- `src/components/docs-shell/DocsLayout.tsx`
  - Main shell composing header + tabs + sidebar + content + TOC.
- `src/components/docs-shell/LocaleSwitcher.tsx`
- `src/components/docs-shell/ThemeSwitcher.tsx`
- `src/components/docs-shell/SearchDialog.tsx`
  - Shadcn-based controls replacing old `fumadocs-ui` provider/search widgets.
- `src/components/mdx/mdx-components.tsx`
  - New MDX component mapping without `fumadocs-ui/mdx`.
- `src/components/mdx/prose.tsx`
  - Shared prose wrappers if the MDX component map grows.
- `src/components/providers/ThemeProvider.tsx`
  - Local theme provider replacing `fumadocs-ui/provider/tanstack`.
- `src/components/providers/AppProviders.tsx`
  - Slimmed provider stack: i18n + theme only.
- `src/routes/$locale/$tab/index.tsx`
  - Default-page route for a tab.
- `src/routes/$locale/$tab/$slug.tsx`
  - Canonical docs page route.
- `src/routes/index.tsx`
  - Redirect `/` to `/en/introduction`.
- `src/routes/$locale/index.tsx`
  - Redirect `/en` -> `/en/introduction`, `/zh-CN` -> `/zh-CN/introduction`.
- `src/components/docs-shell/*.test.tsx`
- `src/lib/docs-routing.test.ts`
- `src/lib/docs-navigation.test.ts`
- `src/routes/$locale/$tab/$slug.test.tsx`
  - Focused tests for the new route model, shell rendering, and navigation helpers.

### Delete

- `content/home/**`
- `external/docs-cortex/**`
- `.gitmodules`
- `src/components/home/**`
- `src/components/docs/**`
- `src/components/search.tsx`
- `src/components/mdx.tsx`
- `src/lib/home-markdown.ts`
- `src/lib/home-markdown.server.ts`
- `src/lib/convoai-portal-localization.ts`
- `src/lib/convoai-portal.server.ts`
- `src/lib/layout.shared.tsx`
- `src/lib/i18n/fumadocs.ts`
- `src/routes/docs/**`
- Any tests that only cover the deleted portal/docs implementation

### Update dependencies

- `package.json`
  - Remove `fumadocs-ui` and any dependency that only exists for it.
  - Add shadcn dependencies required by newly added components.
- `src/styles/app.css`
  - Remove `fumadocs-ui/css/*` imports.
  - Keep font setup and semantic tokens; add only the minimum global docs-shell/prose CSS.

---

### Task 1: Freeze the new architecture boundary in code structure

**Files:**
- Modify: `src/routes/__root.tsx`, `src/components/providers/AppProviders.tsx`
- Create: `src/components/providers/ThemeProvider.tsx`
- Test: `src/components/providers/AppProviders.test.tsx`, `src/lib/theme/theme-preference.test.ts`

- [ ] **Step 1: Write the failing provider test for a local theme+i18n stack that can coexist during transition**

```tsx
it('renders children without fumadocs-ui provider', () => {
  render(
    <AppProviders>
      <div data-testid="probe">ok</div>
    </AppProviders>,
  )

  expect(screen.getByTestId('probe')).toHaveTextContent('ok')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/components/providers/AppProviders.test.tsx`
Expected: FAIL because the current provider does not expose a local theme+i18n stack independent of `fumadocs-ui`.

- [ ] **Step 3: Add the local provider stack without deleting search or docs UI yet**

Implement:
- Add a local `ThemeProvider` based on `next-themes`.
- Keep `I18nextProvider`.
- Keep the app runnable during transition. If a temporary bridge is needed so existing routes still mount before Task 9, allow it here and remove it later.
- Ensure `__root.tsx` still wraps the app in `AppProviders`.

- [ ] **Step 4: Run focused tests**

Run: `bun test src/components/providers/AppProviders.test.tsx src/lib/theme/theme-preference.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/__root.tsx src/components/providers/AppProviders.tsx src/components/providers/ThemeProvider.tsx src/components/providers/AppProviders.test.tsx
git commit -m "refactor: add local app providers for docs rebuild"
```

---

### Task 2: Define the new canonical content tree and migrate files

**Files:**
- Create: `scripts/migrate-home-content-to-docs.mjs`
- Create: `content/docs/en/**`, `content/docs/zh-CN/**`
- Delete: `content/home/**`, `external/docs-cortex/**`, `.gitmodules`
- Test: `content/docs/en/meta.json`, `content/docs/zh-CN/meta.json`

- [ ] **Step 1: Write the migration mapping as executable data**

Create a mapping table in `scripts/migrate-home-content-to-docs.mjs` like:

```js
const tabMap = {
  'overview-home': ['introduction', 'index'],
  'overview-about-agora': ['introduction', 'about-agora'],
  'ai-overview': ['ai', 'overview'],
  'rm-overview': ['realtime-media', 'overview'],
}
```

Include every current `content/home/en|zh-CN/*.md` file.

- [ ] **Step 2: Write the failing dry-run check**

Run: `node scripts/migrate-home-content-to-docs.mjs --dry-run`
Expected: FAIL or print incomplete mappings until every source file is covered.

- [ ] **Step 3: Implement the migration script**

The script must:
- Read both locales from `content/home/<locale>`.
- Rewrite each file into `content/docs/<locale>/<tab>/<slug>.md`.
- Convert tab landing pages to `index.md` where appropriate.
- Rewrite internal links from old query-string or old `/docs/...` targets to new locale/tab/slug paths.
- Generate root and tab-level `meta.json` files that encode tab order, sidebar grouping, and labels.
- Refuse to run if any source file lacks a destination mapping.

- [ ] **Step 4: Run the migration**

Run: `node scripts/migrate-home-content-to-docs.mjs`
Expected:
- `content/docs/en/...` and `content/docs/zh-CN/...` created
- all `content/home` files migrated
- internal links point to `/en/...` or `/zh-CN/...`

- [ ] **Step 5: Spot-check migrated content**

Run:
```bash
find content/docs/en -maxdepth 3 -type f | sort | head -40
find content/docs/zh-CN -maxdepth 3 -type f | sort | head -40
rg -n "\\?tab=|\\?domain=|/docs/convoai|/\\?tab=" content/docs
```

Expected:
- clean tree under the new tab names
- no old query-route links remain

- [ ] **Step 6: Commit**

```bash
git add scripts/migrate-home-content-to-docs.mjs content/docs
git rm -r external/docs-cortex .gitmodules
git rm -r content/home
git commit -m "refactor: migrate docs content into canonical tree"
```

---

### Task 3: Repoint Fumadocs MDX and source loading at the new tree

**Files:**
- Modify: `source.config.ts`, `src/lib/source.ts`, `src/lib/shared.ts`
- Test: `src/lib/docs-routing.test.ts` (new), `src/routes/llms[.]txt.ts`, `src/routes/llms-full[.]txt.ts`, `src/routes/llms[.]mdx.docs.$.ts`

- [ ] **Step 1: Write failing tests for new source path expectations**

```ts
it('builds markdown content URLs from the new content tree', () => {
  expect(getPageMarkdownUrl(mockPage).url).toBe('/llms.mdx/docs/en/ai/overview/content.md')
})
```

```ts
it('resolves the site root to locale-prefixed docs pages', () => {
  expect(buildDocPath('en', 'introduction', 'index')).toBe('/en/introduction')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/lib/docs-routing.test.ts`
Expected: FAIL because the current code still assumes `/docs` and the old path model.

- [ ] **Step 3: Update content configuration**

Implement:
- Change `defineDocs({ dir: ... })` in `source.config.ts` to `content/docs`.
- Remove the old `home` collection entirely.
- Update `src/lib/source.ts` so `loader()` targets the new docs tree and route base.
- Update `getPageMarkdownUrl()` to emit locale-aware content URLs.
- Update `src/lib/shared.ts` constants so route helpers no longer refer to the old `/docs` site path.

- [ ] **Step 4: Verify mdx/codegen + llms routes**

Run:
```bash
bun run types:check
bun test src/lib/docs-routing.test.ts
```

Expected:
- `fumadocs-mdx` regeneration succeeds
- helper tests pass

- [ ] **Step 5: Commit**

```bash
git add source.config.ts src/lib/source.ts src/lib/shared.ts src/lib/docs-routing.ts src/lib/docs-routing.test.ts src/routes/llms[.]txt.ts src/routes/llms-full[.]txt.ts src/routes/llms[.]mdx.docs.$.ts
git commit -m "refactor: repoint fumadocs source to new docs tree"
```

---

### Task 4: Build the new route model around locale + tab + slug

**Files:**
- Create: `src/routes/$locale/index.tsx`, `src/routes/$locale/$tab/index.tsx`, `src/routes/$locale/$tab/$slug.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/routes/doc/**`, `src/routes/docs/**`
- Create: `src/lib/docs-routing.ts`, `src/lib/docs-routing.test.ts`
- Test: `src/routes/$locale/$tab/$slug.test.tsx`

- [ ] **Step 1: Write failing route helper tests**

Cover:
- `/` redirects to `/en/introduction`
- `/en` redirects to `/en/introduction`
- `/en/ai` redirects to the tab default page
- `/en/ai/overview` resolves page `['en', 'ai', 'overview']`
- `/docs/**` and `/doc/**` are intentionally removed or hard-redirected according to the agreed no-compatibility policy
- `/api-ref/**` remains unaffected
- invalid locale/tab/slug returns not found

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/lib/docs-routing.test.ts src/routes/$locale/$tab/$slug.test.tsx`
Expected: FAIL because the new routes do not exist yet.

- [ ] **Step 3: Implement the new route files**

Implement:
- `/` hard redirect to `/en/introduction`
- `/$locale` hard redirect to that locale’s introduction tab landing page
- `/$locale/$tab` redirect to the tab’s default page from page-tree/meta data
- `/$locale/$tab/$slug` render a page loaded from `source.getPage([...])`
- remove or hard-redirect the old `src/routes/docs/$.tsx`, `src/routes/docs/index.tsx`, `src/routes/doc/$.tsx`, and `src/routes/doc/index.tsx`
- do not change `src/routes/api-ref/$`

- [ ] **Step 4: Run route tests**

Run: `bun test src/lib/docs-routing.test.ts src/routes/$locale/$tab/$slug.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/index.tsx src/routes/\$locale/index.tsx src/routes/\$locale/\$tab/index.tsx src/routes/\$locale/\$tab/\$slug.tsx src/lib/docs-routing.ts src/lib/docs-routing.test.ts src/routes/\$locale/\$tab/\$slug.test.tsx
git rm -r src/routes/docs src/routes/doc
git commit -m "feat: add canonical locale tab slug docs routes"
```

---

### Task 5: Build page-tree driven navigation helpers

**Files:**
- Create: `src/lib/docs-navigation.ts`, `src/lib/docs-navigation.test.ts`
- Modify: `src/lib/source.ts`
- Test: `src/lib/docs-navigation.test.ts`

- [ ] **Step 1: Write failing navigation helper tests**

Cover:
- extracting top-level tabs from the locale root
- finding the active tab from the current page
- building sidebar groups from a tab subtree and `meta.json`
- resolving previous/next links within the active tab

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/lib/docs-navigation.test.ts`
Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement the helpers**

Implement pure helpers that accept `source.getPageTree()` output and page data, then return:
- tab list for the header
- active tab
- sidebar sections/items
- locale sibling path if available
- prev/next page links

Avoid UI coupling in this layer.

- [ ] **Step 4: Run tests**

Run: `bun test src/lib/docs-navigation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/docs-navigation.ts src/lib/docs-navigation.test.ts
git commit -m "feat: add page tree navigation helpers"
```

---

### Task 6: Replace the old MDX component map and page chrome

**Files:**
- Delete: `src/components/mdx.tsx`, `src/components/docs/**`
- Create: `src/components/mdx/mdx-components.tsx`, `src/components/mdx/prose.tsx`
- Create: `src/components/docs-shell/DocsPage.tsx`, `src/components/docs-shell/DocsToc.tsx`
- Test: `src/components/docs-shell/DocsPage.test.tsx`

- [ ] **Step 1: Write failing page-chrome tests**

Cover:
- title and description render from frontmatter
- article content renders without `fumadocs-ui/layouts/docs/page`
- TOC shows headings from page TOC

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/components/docs-shell/DocsPage.test.tsx`
Expected: FAIL because the new page shell does not exist.

- [ ] **Step 3: Implement local MDX rendering**

Implement:
- new MDX components map without `fumadocs-ui/mdx`
- local article/prose wrappers
- TOC rendering component
- page chrome component using plain React + shadcn primitives + semantic classes only

- [ ] **Step 4: Run focused tests**

Run: `bun test src/components/docs-shell/DocsPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx src/components/docs-shell/DocsPage.tsx src/components/docs-shell/DocsToc.tsx src/components/docs-shell/DocsPage.test.tsx
git rm src/components/mdx.tsx
git rm -r src/components/docs
git commit -m "refactor: replace fumadocs ui page chrome"
```

---

### Task 7: Build the new docs shell with shadcn/ui

**Files:**
- Create: `src/components/docs-shell/DocsLayout.tsx`
- Create: `src/components/docs-shell/DocsHeader.tsx`
- Create: `src/components/docs-shell/DocsTabs.tsx`
- Create: `src/components/docs-shell/DocsSidebar.tsx`
- Create: `src/components/docs-shell/LocaleSwitcher.tsx`
- Create: `src/components/docs-shell/ThemeSwitcher.tsx`
- Modify: `package.json` and `src/components/ui/**` via shadcn CLI if needed
- Test: `src/components/docs-shell/DocsLayout.test.tsx`

- [ ] **Step 1: Install missing shadcn components**

Run:
```bash
bunx --bun shadcn@latest add sidebar tabs navigation-menu scroll-area collapsible command dialog sheet
```

Expected:
- components added under `src/components/ui`
- imports use `@/components/ui`

- [ ] **Step 2: Review generated component files before using them**

Read every new file under `src/components/ui`.
Fix any generated import or composition issues before composing the shell.

- [ ] **Step 3: Write failing shell tests**

Cover:
- header tab list renders from page-tree roots
- active tab is highlighted
- sidebar renders grouped items for the active tab
- locale switch and theme switch render
- mobile sidebar trigger opens a sheet

- [ ] **Step 4: Run tests to verify they fail**

Run: `bun test src/components/docs-shell/DocsLayout.test.tsx`
Expected: FAIL because the shell is not implemented yet.

- [ ] **Step 5: Implement the shell**

Implement:
- `DocsHeader` with brand, search trigger, locale switch, theme switch
- `DocsTabs` using shadcn tabs or navigation primitives strictly for structure
- `DocsSidebar` using page-tree helpers
- `DocsLayout` composing sidebar/content/toc with mobile sheet fallback

Do not reintroduce visual dependency on `fumadocs-ui`.

- [ ] **Step 6: Run focused tests**

Run: `bun test src/components/docs-shell/DocsLayout.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json src/components/ui src/components/docs-shell
git commit -m "feat: build shadcn docs shell"
```

---

### Task 8: Rebuild search UI on top of existing Fumadocs search data

**Files:**
- Delete: `src/components/search.tsx`
- Create: `src/components/docs-shell/SearchDialog.tsx`
- Modify: `src/routes/api/search.ts`
- Test: `src/components/docs-shell/SearchDialog.test.tsx`

- [ ] **Step 1: Write failing search dialog tests**

Cover:
- dialog opens and closes
- input value updates
- result rows render from mocked static search data
- selecting a result produces the new locale-aware route

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/components/docs-shell/SearchDialog.test.tsx`
Expected: FAIL because the new search dialog does not exist.

- [ ] **Step 3: Implement the shadcn search dialog**

Implement:
- local dialog + command palette UI
- keep `useDocsSearch` from `fumadocs-core/search/client`
- remove `fumadocs-ui/components/dialog/search`

- [ ] **Step 4: Run focused tests**

Run: `bun test src/components/docs-shell/SearchDialog.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/SearchDialog.tsx src/components/docs-shell/SearchDialog.test.tsx src/routes/api/search.ts
git rm src/components/search.tsx
git commit -m "feat: rebuild docs search dialog with shadcn"
```

---

### Task 9: Connect the new shell to the new routes and delete old portal code

**Files:**
- Modify: `src/routes/$locale/$tab/$slug.tsx`, `src/routes/$locale/$tab/index.tsx`
- Delete: `src/components/home/**`, `src/lib/home-markdown.ts`, `src/lib/home-markdown.server.ts`, `src/lib/convoai-portal-localization.ts`, `src/lib/convoai-portal.server.ts`
- Test: `src/components/home/*.test.tsx` (remove), `src/components/docs-shell/*.test.tsx`

- [ ] **Step 1: Update the route renderer to use the new shell**

Replace any old portal/home/docs render path with:
- page load from `source`
- shell data from docs-navigation helpers
- page body from local MDX renderer

- [ ] **Step 2: Delete dead code**

Remove:
- all `src/components/home/**`
- old home-markdown loaders
- old portal localization/data helpers
- tests that only cover deleted behavior

- [ ] **Step 3: Run targeted tests**

Run:
```bash
bun test src/components/docs-shell/DocsLayout.test.tsx src/components/docs-shell/DocsPage.test.tsx src/components/docs-shell/SearchDialog.test.tsx src/lib/docs-routing.test.ts src/lib/docs-navigation.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/routes src/components/docs-shell src/lib
git rm -r src/components/home
git rm src/lib/home-markdown.ts src/lib/home-markdown.server.ts src/lib/convoai-portal-localization.ts src/lib/convoai-portal.server.ts
git commit -m "refactor: remove legacy portal implementation"
```

---

### Task 10: Remove remaining Fumadocs UI usage and clean dependency edges

**Files:**
- Modify: `package.json`, `src/lib/i18n/fumadocs.ts` (delete), `src/styles/app.css`
- Test: `package.json`, `bun.lock`, repo-wide grep

- [ ] **Step 1: Remove the package and dead code**

Run:
```bash
bun remove fumadocs-ui
```

Delete any file that only exists for `fumadocs-ui`, including the old docs i18n adapter.

- [ ] **Step 1.5: Finish provider cutover now that the new shell and search exist**

Implement:
- remove any temporary bridge left in `AppProviders`
- remove `RootProvider` if it still exists
- remove `fumadocs-ui/css/*` imports from `src/styles/app.css`
- ensure the new shell and search dialog no longer rely on any `fumadocs-ui` runtime

- [ ] **Step 2: Verify there are no remaining imports**

Run:
```bash
rg -n "fumadocs-ui" src package.json
```

Expected: no matches

- [ ] **Step 3: Run install/codegen checks**

Run:
```bash
bun install
bun run types:check
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock src/styles/app.css
git rm src/lib/i18n/fumadocs.ts
git commit -m "chore: remove fumadocs ui dependency"
```

---

### Task 11: End-to-end verification and cleanup

**Files:**
- Modify as needed based on failures
- Test: repo-wide verification

- [ ] **Step 1: Run lint**

Run: `bun run lint`
Expected: PASS

- [ ] **Step 2: Run unit tests**

Run: `bun test`
Expected: PASS

- [ ] **Step 3: Run type checks**

Run: `bun run types:check`
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `bun run build`
Expected: PASS

- [ ] **Step 5: Manually verify the critical flows**

Run:
```bash
bun run dev
```

Then verify in the browser:
- `/` redirects to `/en/introduction`
- `/en/introduction` loads with top tabs
- switching tabs changes left nav and page content
- switching locale keeps the same doc if the counterpart exists
- theme toggle works for light/dark
- search opens and navigates correctly
- `llms.txt` and `llms-full.txt` still respond
- `/docs/...` and `/doc/...` no longer serve the old UI and behave exactly as intended by the no-compatibility decision
- `/api-ref/...` still behaves as before

- [ ] **Step 6: Commit final polish**

```bash
git add .
git commit -m "feat: ship rebuilt docs portal shell"
```

---

## Notes for the implementing agent

- This is a rebuild, not a compatibility pass. Do not preserve old public routes, old query-string navigation, or old portal components.
- Keep the scope hard: `fumadocs-core` and `fumadocs-mdx` stay; `fumadocs-ui` goes away entirely.
- Prefer the page tree as the source of truth. Do not invent a second nav model unless `meta.json` proves insufficient.
- When using shadcn, use CLI-installed components first and review generated files before composing them.
- Keep commits focused by task boundary. The user explicitly wants this done cleanly in one pass, but not as one giant unreviewable diff.
