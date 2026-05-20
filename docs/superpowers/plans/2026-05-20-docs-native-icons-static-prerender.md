# Docs Native Icons And Static Prerender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the custom docs shell with Fumadocs conventions for page-tree icons and prerender ordinary docs pages so normal document routes load as static/prerendered pages instead of runtime-only SSR.

**Architecture:** Keep the current TanStack Start + Fumadocs Core/MDX stack. Move tab and section icon ownership into Fumadocs page-tree metadata, remove heuristic UI guesses from the shell, and configure TanStack Start prerendering for ordinary docs URLs while keeping Nitro/server capability available for future dynamic features.

**Tech Stack:** TanStack Start, React 19, Fumadocs Core/MDX, `lucideIconsPlugin`, Tailwind CSS v4, Vitest, Testing Library, `serve`, `agent-browser`.

---

## Decisions Locked

- Ordinary docs pages should be prerendered/static for fast deep-link loading.
- Backend/server functionality may remain for future dynamic search, language policy, redirects, or APIs.
- Fumadocs page-tree metadata is the source of truth for tab and section icons.
- Remove title/url heuristic icons and heuristic `New`/`Beta` badges from shell rendering.
- Configure every visible section title with an explicit icon in `meta.json`.

## Reference Contracts

- Fumadocs page conventions support separator icons in `meta.json` page arrays with syntax such as `---[Cpu]Media Infrastructure---`.
- Fumadocs page tree supports `icon` on page, folder, and separator nodes; this project already uses `lucideIconsPlugin()` in `src/lib/source.server.ts`.
- Fumadocs static build guidance says static output is configured through the host framework; built-in search requires static/client-side handling when route handlers are unavailable.
- TanStack Start SPA mode can emit a shell and can prerender specific routes; static prerendering generates static HTML instead of generating it on the fly.

## File Structure

- Modify `content/docs/en/meta.json` and `content/docs/zh-CN/meta.json`: add tab icons to top-level tab entries if supported by Fumadocs syntax in this tree; otherwise add icons to each tab root folder `meta.json`.
- Modify tab root meta files:
  - `content/docs/en/introduction/meta.json`
  - `content/docs/en/ai/meta.json`
  - `content/docs/en/realtime-media/meta.json`
  - `content/docs/en/solutions/meta.json`
  - `content/docs/en/api-reference/meta.json`
  - `content/docs/en/best-practices/meta.json`
  - `content/docs/zh-CN/introduction/meta.json`
  - `content/docs/zh-CN/ai/meta.json`
  - `content/docs/zh-CN/realtime-media/meta.json`
  - `content/docs/zh-CN/solutions/meta.json`
  - `content/docs/zh-CN/api-reference/meta.json`
  - `content/docs/zh-CN/best-practices/meta.json`
- Modify `src/lib/docs-tree.ts`: preserve Fumadocs `icon` values on tab summaries and sidebar section nodes.
- Modify `src/components/docs-shell/DocsShell.tsx`: render `tab.icon` directly and delete `TabIcon` inference.
- Modify `src/components/docs-shell/DocsSidebarTree.tsx`: render `node.icon` directly and delete `SidebarDecorativeIcon` inference and `SidebarBadge` inference.
- Modify `src/components/docs-shell/DocsShell.test.tsx`: assert configured tab icons render without title heuristics.
- Modify `src/components/docs-shell/DocsSidebarTree.test.tsx`: assert configured section icons render and no guessed badges render.
- Modify `src/lib/docs-tree.test.ts`: assert icons pass through from page-tree nodes into shell data.
- Modify `vite.config.ts`: enable prerendering for ordinary docs routes.
- Create `src/lib/docs-static-paths.ts`: provide a build-safe list of ordinary docs URLs for TanStack prerender config.
- Modify `package.json`: fix `start` if needed so it reflects the real production preview target, or add a separate static verification script.
- Modify or add test around static path generation, likely `src/lib/docs-static-paths.test.ts`.

## Icon Mapping

Use Lucide icon names, because `lucideIconsPlugin()` resolves those names.

Recommended tab icons:

```json
{
  "introduction": "BookOpen",
  "ai": "Zap",
  "realtime-media": "Cpu",
  "solutions": "Layers",
  "api-reference": "Wrench",
  "best-practices": "ShieldCheck"
}
```

Recommended section icons:

```json
{
  "Get started": "BookOpen",
  "Conversational AI": "Zap",
  "Realtime media": "Radio",
  "Media Infrastructure": "Cpu",
  "Other services": "Layers",
  "Account": "User",
  "Getting Started": "BookOpen",
  "SDK Quickstarts": "Terminal",
  "Build AI Experiences": "Bot",
  "Extensions": "Puzzle",
  "Products": "Boxes",
  "Media Workflows": "Workflow",
  "Platform Surfaces": "PanelTop",
  "Operations": "Settings",
  "API": "Braces",
  "Webhook": "Webhook"
}
```

For Chinese meta files, use the same Lucide icon names with localized section labels:

```json
{
  "开始使用": "BookOpen",
  "对话式 AI": "Zap",
  "实时媒体": "Radio",
  "媒体基础设施": "Cpu",
  "其他服务": "Layers",
  "账号": "User",
  "SDK 快速开始": "Terminal",
  "构建 AI 体验": "Bot",
  "扩展能力": "Puzzle",
  "产品": "Boxes",
  "媒体工作流": "Workflow",
  "平台能力面": "PanelTop",
  "操作": "Settings",
  "API": "Braces",
  "Webhook": "Webhook"
}
```

## Task 1: Move Icons Into Fumadocs Metadata

**Files:**
- Modify: `content/docs/en/meta.json`
- Modify: `content/docs/zh-CN/meta.json`
- Modify: all tab root `meta.json` files listed above
- Test: `src/lib/docs-tree.test.ts`

- [ ] **Step 1: Write failing page-tree icon passthrough tests**

In `src/lib/docs-tree.test.ts`, add a test that builds a minimal page tree with tab/root and separator icons:

```ts
it('preserves configured tab and section icons from the page tree', () => {
  const root = {
    name: 'Root',
    type: 'folder',
    children: [
      {
        name: 'en',
        type: 'folder',
        children: [
          {
            name: 'Introduction',
            type: 'folder',
            root: true,
            icon: 'BookOpen',
            index: {
              name: 'Overview',
              type: 'page',
              url: '/en/introduction',
            },
            children: [
              {
                name: 'Get started',
                type: 'separator',
                icon: 'BookOpen',
              },
              {
                name: 'About Agora',
                type: 'page',
                url: '/en/introduction/about-agora',
              },
            ],
          },
        ],
      },
    ],
  } satisfies Root;

  expect(getTabSummaries(root)[0]).toMatchObject({
    icon: 'BookOpen',
    id: 'introduction',
  });
  expect(getSidebarNodes(root, 'introduction')[0]).toMatchObject({
    icon: 'BookOpen',
    title: 'Get started',
    type: 'section',
  });
});
```

If Fumadocs types expose `icon` as `ReactNode`, use a local typed object and assert identity rather than string type.

- [ ] **Step 2: Run the failing test**

Run:

```bash
bun run test src/lib/docs-tree.test.ts
```

Expected: FAIL because `TabSummary` and `DocsSidebarSectionNode` do not yet preserve `icon`.

- [ ] **Step 3: Extend docs tree types and mapping**

In `src/lib/docs-tree.ts`:

- Add `icon?: ReactNode` to `TabSummary`.
- Add `icon?: ReactNode` to `DocsSidebarSectionNode`.
- In `getTabSummaries()`, set `icon` from the folder node icon first, then index/page icon if needed.
- In `getSidebarNodes()`, when converting separator nodes to section nodes, set `icon: child.icon`.
- In `pageTreeNodeToSidebarNodes()`, when converting folder nodes to section nodes, set `icon: node.icon ?? node.index?.icon`.
- In `mapSidebarEntriesToTree()`, preserve icon only if `SidebarEntry` is still used by tests; otherwise keep it simple and update tests to prefer `getSidebarNodes()`.

- [ ] **Step 4: Configure tab icons**

First test whether top-level meta entry syntax passes icons through for root folders:

```json
{
  "pages": [
    "[BookOpen][introduction](introduction)",
    "[Zap][ai](ai)",
    "[Cpu][realtime-media](realtime-media)",
    "[Layers][solutions](solutions)",
    "[Wrench][api-reference](api-reference)",
    "[ShieldCheck][best-practices](best-practices)"
  ]
}
```

If Fumadocs does not apply link-style icon metadata to filesystem root folders in this setup, configure each tab root folder meta instead:

```json
{
  "title": "Introduction",
  "root": true,
  "icon": "BookOpen",
  "pages": []
}
```

Use the same approach for `zh-CN`.

- [ ] **Step 5: Configure section icons**

Update every section separator in each tab root `meta.json` from:

```json
"---Media Infrastructure---"
```

to:

```json
"---[Cpu]Media Infrastructure---"
```

Do this for every section in both locales. Leave plain `"---"` visual dividers without icons.

- [ ] **Step 6: Run tests**

Run:

```bash
bun run test src/lib/docs-tree.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add content/docs src/lib/docs-tree.ts src/lib/docs-tree.test.ts
git commit -m "feat: configure docs page-tree icons"
```

## Task 2: Render Only Explicit Page-Tree Icons

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Test: `src/components/docs-shell/DocsShell.test.tsx`
- Test: `src/components/docs-shell/DocsSidebarTree.test.tsx`

- [ ] **Step 1: Write failing shell icon tests**

In `DocsShell.test.tsx`, update fixture tabs to include icons and assert those icons render. Use test ids only around the icon wrapper, not the SVG path:

```tsx
tabs={[
  {
    id: 'introduction',
    icon: <BookOpenIcon data-testid="configured-tab-icon" />,
    title: 'Introduction',
    url: '/en/introduction',
  },
]}
```

Expected assertion:

```ts
expect(screen.getByTestId('configured-tab-icon')).toBeInTheDocument();
```

Add a second tab without `icon` and assert it does not get a guessed fallback icon.

- [ ] **Step 2: Write failing sidebar icon and badge tests**

In `DocsSidebarTree.test.tsx`, add a section node with `icon` and a page titled `Start with AI`.

Expected:

```ts
expect(screen.getByTestId('configured-section-icon')).toBeInTheDocument();
expect(screen.queryByText('New')).not.toBeInTheDocument();
expect(screen.queryByText('Beta')).not.toBeInTheDocument();
```

- [ ] **Step 3: Run failing tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: FAIL due current `TabIcon()`, `SidebarDecorativeIcon()`, and `SidebarBadge()` heuristics.

- [ ] **Step 4: Remove tab heuristic rendering**

In `src/components/docs-shell/DocsShell.tsx`:

- Remove Lucide imports used only by `TabIcon`.
- Delete `TabIcon()`.
- Render only `tab.icon`:

```tsx
{tab.icon ? (
  <span aria-hidden="true" className="docs-tab-icon">
    {tab.icon}
  </span>
) : null}
```

If icon element sizing is not inherited reliably, wrap with CSS:

```css
.docs-tab-icon > svg {
  width: 0.875rem;
  height: 0.875rem;
}
```

- [ ] **Step 5: Remove sidebar heuristic rendering**

In `src/components/docs-shell/DocsSidebarTree.tsx`:

- Delete `SidebarDecorativeIcon()`.
- Delete `SidebarBadge()`.
- Remove Lucide imports used only by those helpers.
- Replace all `<SidebarDecorativeIcon title={node.title} />` calls with:

```tsx
{node.icon ? (
  <span aria-hidden="true" className="docs-side-icon">
    {node.icon}
  </span>
) : null}
```

- Remove all `<SidebarBadge ... />` calls.

- [ ] **Step 6: Run focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Browser visual check**

Run:

```bash
bun run dev --host 127.0.0.1 --port 5173
agent-browser open http://127.0.0.1:5173/en/introduction/about-agora
agent-browser wait --text "Media Infrastructure"
agent-browser screenshot /tmp/docs-icons.png
```

Expected:

- Tab icons appear where configured.
- Section icons appear where configured.
- No `New` or `Beta` badges appear unless explicitly implemented later.

- [ ] **Step 8: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/styles/app.css
git commit -m "fix: render explicit docs tree icons"
```

## Task 3: Generate Ordinary Docs Prerender Paths

**Files:**
- Create: `src/lib/docs-static-paths.ts`
- Test: `src/lib/docs-static-paths.test.ts`
- Modify: `vite.config.ts`

- [ ] **Step 1: Write failing static path test**

Create `src/lib/docs-static-paths.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getStaticDocsPaths } from './docs-static-paths';

describe('getStaticDocsPaths', () => {
  it('includes ordinary localized docs routes and static docs utilities', async () => {
    const paths = await getStaticDocsPaths();

    expect(paths).toContain('/en/introduction/about-agora');
    expect(paths).toContain('/zh-CN/introduction/about-agora');
    expect(paths).toContain('/llms.txt');
    expect(paths).toContain('/llms-full.txt');
    expect(paths).toContain('/api/search');
  });

  it('does not include llms.mdx per-page routes as ordinary document pages', async () => {
    const paths = await getStaticDocsPaths();

    expect(paths.some((path) => path.startsWith('/llms.mdx/'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
bun run test src/lib/docs-static-paths.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement static path generator**

Create `src/lib/docs-static-paths.ts`:

```ts
import { source } from './source.server';
import { SUPPORTED_LOCALES } from './i18n/i18n-config';

export async function getStaticDocsPaths() {
  const paths = new Set<string>(['/', '/llms.txt', '/llms-full.txt', '/api/search']);

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of source.getPages(locale)) {
      paths.add(page.url);
    }
  }

  return [...paths].sort();
}
```

If importing `source.server` in `vite.config.ts` causes build-time collection issues, move the implementation to a Node-only module under `src/lib/docs-static-paths.server.ts` and keep the test importing that file.

- [ ] **Step 4: Wire TanStack Start prerender**

In `vite.config.ts`, import the generator:

```ts
import { getStaticDocsPaths } from './src/lib/docs-static-paths';
```

Change `tanstackStart()` config to:

```ts
tanstackStart({
  prerender: {
    autoStaticPathsDiscovery: false,
    crawlLinks: false,
    enabled: true,
    failOnError: true,
    routes: await getStaticDocsPaths(),
  },
  spa: {
    enabled: true,
    prerender: {
      enabled: true,
      routes: await getStaticDocsPaths(),
    },
  },
  pages: [
    { path: '/api/search' },
    { path: 'llms-full.txt' },
    { path: 'llms.txt' },
  ],
})
```

Before implementing exactly, inspect the installed TanStack Start plugin type definitions to confirm whether the current version expects `routes`, `staticRoutes`, `output`, or `pages` for prerender entries:

```bash
rg -n "type.*Prerender|interface.*Prerender|routes" node_modules/@tanstack -g '*.d.ts' | head -80
```

Use the installed type contract over memory or docs snippets.

- [ ] **Step 5: Run test and typecheck**

Run:

```bash
bun run test src/lib/docs-static-paths.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/docs-static-paths.ts src/lib/docs-static-paths.test.ts vite.config.ts
git commit -m "feat: prerender ordinary docs routes"
```

## Task 4: Make Ordinary Docs Static Hosting Verifiable

**Files:**
- Modify: `package.json`
- Test: none, use build and static server verification

- [ ] **Step 1: Decide script naming**

Do not silently redefine `start` if the team expects Nitro preview. Prefer adding a separate script first:

```json
"start:static": "serve .output/public"
```

If ordinary deploy target is static hosting, then change `start` later in a separate deploy-focused commit.

- [ ] **Step 2: Build**

Run:

```bash
bun run build
```

Expected:

- Build completes.
- Prerender output includes ordinary docs pages, not only `_shell.html`.
- No image-size failure for external docs images.

- [ ] **Step 3: Verify static public output**

Run:

```bash
bunx serve .output/public -l 4180
```

Then verify with curl:

```bash
curl -I http://127.0.0.1:4180/en/introduction/about-agora
curl -sS http://127.0.0.1:4180/en/introduction/about-agora | rg "About Agora|What is"
curl -I http://127.0.0.1:4180/zh-CN/introduction/about-agora
curl -sS http://127.0.0.1:4180/zh-CN/introduction/about-agora | rg "Agora|声网"
curl -I http://127.0.0.1:4180/llms.txt
curl -I http://127.0.0.1:4180/api/search
```

Expected:

- Ordinary docs routes return 200.
- HTML contains real page content, not only an empty shell.
- `llms.txt` and `/api/search` return 200.

- [ ] **Step 4: Browser verification**

Run:

```bash
agent-browser open http://127.0.0.1:4180/en/introduction/about-agora
agent-browser wait --text "About Agora"
agent-browser wait --text "What is"
```

Expected:

- Page content appears from static server.
- Sidebar icons render from explicit configuration.
- TOC still clicks and highlights.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore: add static docs preview script"
```

Only commit `package.json` if a script was added or changed.

## Task 5: Full Regression Verification

**Files:**
- No planned edits unless verification exposes a bug.

- [ ] **Step 1: Run all tests**

Run:

```bash
bun run test
```

Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

Run:

```bash
bun run types:check
```

Expected: pass.

- [ ] **Step 3: Run lint**

Run:

```bash
bun run lint
```

Expected: pass, except the known `src/components/ui/sidebar.tsx` `document.cookie` warning if still present.

- [ ] **Step 4: Run build**

Run:

```bash
bun run build
```

Expected: pass. Chunk size and plugin timing warnings are acceptable unless new errors appear.

- [ ] **Step 5: Static server smoke**

Run:

```bash
bunx serve .output/public -l 4180
```

Verify:

```bash
curl -sS http://127.0.0.1:4180/en/introduction/about-agora | rg "About Agora"
curl -sS http://127.0.0.1:4180/en/ai/quick-start | rg "Quick Start|quick start"
curl -sS http://127.0.0.1:4180/zh-CN/introduction/about-agora | rg "Agora|声网"
```

Expected: all return content from static output.

- [ ] **Step 6: Browser smoke**

Use `agent-browser`:

```bash
agent-browser open http://127.0.0.1:4180/en/introduction/about-agora
agent-browser wait --text "About Agora"
agent-browser wait --text "On this page"
```

Run an eval to click TOC:

```bash
cat <<'EOF' | agent-browser eval --stdin
(async () => {
  const scroll = document.querySelector('[data-testid="docs-main-desktop-scroll"]');
  const link = [...document.querySelectorAll('aside a[href="#how-it-works"]')]
    .find((item) => item.getBoundingClientRect().width > 0);
  const before = scroll?.scrollTop ?? 0;
  link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    before,
    after: scroll?.scrollTop ?? 0,
    hash: location.hash,
    active: [...document.querySelectorAll('aside a[aria-current="location"]')].map((item) => item.textContent?.trim()),
  };
})()
EOF
```

Expected: `after > before`, hash is `#how-it-works`, active includes `How it works`.

- [ ] **Step 7: Final commit if verification edits were needed**

If any verification-only fix was needed:

```bash
git add <changed-files>
git commit -m "fix: stabilize docs static prerender"
```

Otherwise do not create an empty commit.

## Risk Notes

- The exact TanStack Start prerender config shape may differ from docs snippets because this repo pins current beta versions. Always inspect local type definitions before editing `vite.config.ts`.
- Static output must be tested with a plain static server, not only `vite preview`, because `vite preview` may use Nitro and hide static hosting failures.
- If `source.server` import in `vite.config.ts` has side effects during config evaluation, move static path generation behind a small async function and verify with `bun run build`.
- Do not reintroduce heuristic badges. If Product wants `New` or `Beta`, add explicit page-tree metadata in a later task.
- Do not migrate framework or reintroduce `fumadocs-ui` in this PR. The target is Fumadocs-compatible conventions inside the current shell.

## Review Checklist

- [ ] No title/id/url heuristic icon logic remains in shell components.
- [ ] No heuristic `New` or `Beta` badge logic remains.
- [ ] Every visible section separator in `meta.json` has explicit `[Icon]` syntax.
- [ ] Ordinary docs routes are present in static output after `bun run build`.
- [ ] `serve .output/public` can serve ordinary docs deep links with real content.
- [ ] Nitro/server capability is not removed unnecessarily.
