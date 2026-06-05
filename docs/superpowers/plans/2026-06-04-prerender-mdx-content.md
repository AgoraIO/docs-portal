# Prerender MDX Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make normal MDX docs pages render their main body into production prerendered HTML while keeping the existing `DocsShell` and Fumadocs client loader path.

**Architecture:** Keep the current TanStack Start route shape, `getDocsPagePayload` server function, and custom docs shell. Align normal MDX rendering with the Fumadocs TanStack Start example by preloading the MDX browser collection in route loaders, rendering the same loaded content through `Suspense`, and removing the `ClientOnly` boundary that currently forces prerendered HTML to contain only a skeleton. Fix sidebar scroll reset as a separate low-risk task in the same phase.

**Tech Stack:** TanStack Start, Fumadocs MDX (`collections/browser`, `collections/server`, `fumadocs-mdx`), Fumadocs Core/OpenAPI, React 19 Suspense, Vitest, Testing Library, Vite/Nitro, Bun.

---

## File Structure

- Create: `src/lib/docs-route-preload.ts`
  - Responsibility: route-loader helper that preloads MDX content only for successful normal MDX docs payloads. It must not preload OpenAPI pages, redirects, null results, or unknown payloads.
- Create: `src/lib/docs-route-preload.test.ts`
  - Responsibility: unit tests for preload behavior without reaching into TanStack route internals.
- Modify: `src/routes/$locale/$tab/$.tsx`
  - Responsibility: after `getDocsPagePayload()` returns a successful payload, call `preloadDocsPageContent(payload)` before returning loader data.
- Modify: `src/routes/$locale/$tab/index.tsx`
  - Responsibility: same preload behavior for tab index pages that resolve directly to a page.
- Modify: `src/components/docs-shell/DocsContent.tsx`
  - Responsibility: remove `ClientOnly`, wrap MDX body rendering in `Suspense`, and keep the existing skeleton as the Suspense fallback.
- Modify: `src/components/docs-shell/DocsContent.test.tsx`
  - Responsibility: update SSR expectations so MDX body content renders during server rendering when content has been preloaded/mocked; keep OpenAPI rendering coverage.
- Modify: `src/components/docs-shell/DocsSidebar.tsx`
  - Responsibility: reset sidebar scroll only when a stable reset key changes, not when `activePath` changes inside the same sidebar.
- Modify: `src/components/docs-shell/DocsShell.tsx`
  - Responsibility: pass a stable sidebar reset key into `DocsSidebar`. For Phase A, use `activeTab`.
- Modify: `src/components/docs-shell/DocsShell.test.tsx`
  - Responsibility: cover that sidebar reset identity is derived from tab-level shell scope, not page path, through the props passed to the sidebar or an integration-style scroll test.

## Decisions Already Made

- Keep the current custom `DocsShell`; do not migrate to Fumadocs `DocsLayout`.
- Keep using `fumadocs-mdx`, `fumadocs-core`, `fumadocs-openapi`, and `fumadocs-ui` MDX components.
- First implementation path is Fumadocs-style `preload + Suspense`, not explicit `.source/server` `serverBody`.
- Put preload in route loader flow, not inside `loadDocsPagePayload()`.
- Keep `DocsContentBodyClient.tsx` and its `'use client'` directive for now. The blocker is `ClientOnly`, not the file name.
- Fail fast if MDX preload fails; do not silently degrade to client-only skeleton.
- Do not change OpenAPI rendering in Phase A; only protect it from accidental MDX preload.
- Use production build/preview HTML containing normal MDX body text as the hard acceptance criterion.
- Do not touch `createServerFn`, payload splitting, static manifests, or `_serverFn` behavior in Phase A.
- Restore local dependency installation before implementation verification if `fumadocs-openapi` is missing from `node_modules`.

## Known Current Findings

- `src/components/docs-shell/DocsContent.tsx` imports `ClientOnly` and wraps MDX body rendering with it at the current MDX body branch. This forces SSR/prerender output to show `DocsContentSkeleton` instead of normal MDX body.
- `src/lib/source.client.tsx` already exposes `preloadDocsContent(path)` and `useDocsContent(path, props)` backed by `collections/browser.createClientLoader({ id: 'docs-content' })`.
- The Fumadocs TanStack Start OpenAPI example preloads MDX content in the route loader, then renders `clientLoader.useContent()` inside `Suspense`.
- `.source/server.ts` shows server collection entries are eager and contain MDX module data, but this plan intentionally tries the smaller official preload/Suspense route first.
- `src/components/docs-shell/DocsSidebar.tsx` currently resets scroll on every `activePath` change because the reset effect depends on `[activePath, activeTab, scrollToTop]`.
- Current local install may be incomplete: `bun run build` failed because `fumadocs-openapi/css/preset.css` could not be resolved and `node_modules/fumadocs-openapi` was missing, even though `package.json` and `bun.lock` declare it.

---

### Task 1: Restore And Verify Local Dependencies

**Files:**
- Verify only: `package.json`
- Verify only: `bun.lock`
- Verify only: `node_modules/fumadocs-openapi`

- [ ] **Step 1: Inspect the worktree before dependency repair**

Run:

```bash
git status --short
git diff -- package.json bun.lock
```

Expected:

```text
No functional Phase A edits have been made yet. Any existing package or lockfile diff is understood before running install.
```

- [ ] **Step 2: Restore installed packages**

Run:

```bash
bun install
```

Expected:

```text
Install completes successfully. It may regenerate `.source` files through the existing postinstall script.
```

- [ ] **Step 3: Confirm Fumadocs OpenAPI is resolvable**

Run:

```bash
test -d node_modules/fumadocs-openapi
test -f node_modules/fumadocs-openapi/css/preset.css
```

Expected:

```text
Both commands exit with code 0.
```

- [ ] **Step 4: Check whether dependency files changed**

Run:

```bash
git status --short
git diff -- package.json bun.lock
```

Expected:

```text
`package.json` and `bun.lock` are unchanged. If either changed, stop and inspect the diff before continuing; do not mix dependency updates with Phase A code changes unless the diff is clearly required and approved.
```

---

### Task 2: Add A Route Preload Helper

**Files:**
- Create: `src/lib/docs-route-preload.ts`
- Create: `src/lib/docs-route-preload.test.ts`

- [ ] **Step 1: Write failing preload helper tests**

Create `src/lib/docs-route-preload.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { preloadDocsPageContent } from './docs-route-preload';

const preloadDocsContentMock = vi.fn();

vi.mock('./source.client', () => ({
  preloadDocsContent: (path: string) => preloadDocsContentMock(path),
}));

describe('preloadDocsPageContent', () => {
  beforeEach(() => {
    preloadDocsContentMock.mockReset();
    preloadDocsContentMock.mockResolvedValue(undefined);
  });

  it('preloads normal MDX page content', async () => {
    await preloadDocsPageContent({
      body: {
        contentPath: 'en/introduction/about-agora.mdx',
        kind: 'mdx',
      },
    });

    expect(preloadDocsContentMock).toHaveBeenCalledExactlyOnceWith(
      'en/introduction/about-agora.mdx',
    );
  });

  it('does not preload OpenAPI page content', async () => {
    await preloadDocsPageContent({
      body: {
        kind: 'openapi',
        pageProps: {
          operations: [],
          payload: {
            bundled: {
              info: { title: 'Conversational AI API' },
              openapi: '3.1.0',
              paths: {},
            },
          },
        },
      },
    });

    expect(preloadDocsContentMock).not.toHaveBeenCalled();
  });

  it('does not preload redirects or missing pages', async () => {
    await preloadDocsPageContent(null);
    await preloadDocsPageContent({ redirectUrl: '/en/introduction' });

    expect(preloadDocsContentMock).not.toHaveBeenCalled();
  });

  it('fails fast when MDX preload fails', async () => {
    preloadDocsContentMock.mockRejectedValueOnce(
      new Error('missing MDX chunk'),
    );

    await expect(
      preloadDocsPageContent({
        body: {
          contentPath: 'en/missing-page.mdx',
          kind: 'mdx',
        },
      }),
    ).rejects.toThrow('missing MDX chunk');
  });
});
```

- [ ] **Step 2: Run the failing preload helper tests**

Run:

```bash
bun run test src/lib/docs-route-preload.test.ts
```

Expected:

```text
FAIL because `src/lib/docs-route-preload.ts` does not exist.
```

- [ ] **Step 3: Implement the preload helper**

Create `src/lib/docs-route-preload.ts`:

```ts
import type { DocsPagePayload } from './docs-page.server';
import { preloadDocsContent } from './source.client';

type DocsPagePreloadInput =
  | DocsPagePayload
  | null
  | { redirectUrl: string }
  | undefined;

export async function preloadDocsPageContent(
  payload: DocsPagePreloadInput,
): Promise<void> {
  if (!payload || 'redirectUrl' in payload || payload.body.kind !== 'mdx') {
    return;
  }

  await preloadDocsContent(payload.body.contentPath);
}
```

- [ ] **Step 4: Run the preload helper tests**

Run:

```bash
bun run test src/lib/docs-route-preload.test.ts
```

Expected:

```text
PASS src/lib/docs-route-preload.test.ts
```

- [ ] **Step 5: Commit the helper**

Run:

```bash
git add src/lib/docs-route-preload.ts src/lib/docs-route-preload.test.ts
git commit -m "feat: preload docs route content"
```

Expected:

```text
Commit succeeds with only the new helper and its test staged.
```

---

### Task 3: Preload MDX Content From Docs Route Loaders

**Files:**
- Modify: `src/routes/$locale/$tab/$.tsx`
- Modify: `src/routes/$locale/$tab/index.tsx`
- Test: `src/lib/docs-route-preload.test.ts`

- [ ] **Step 1: Import the route preload helper in the splat route**

Modify `src/routes/$locale/$tab/$.tsx` so the import block includes:

```ts
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload } from '@/lib/docs-page';
import { preloadDocsPageContent } from '@/lib/docs-route-preload';
import { isSupportedDocLocale } from '@/lib/docs-routing';
```

- [ ] **Step 2: Call the preload helper before returning splat route loader data**

In `src/routes/$locale/$tab/$.tsx`, change the successful loader tail to:

```ts
    if ('redirectUrl' in payload) {
      throw redirect({
        href: payload.redirectUrl,
      });
    }

    await preloadDocsPageContent(payload);

    return {
      ...payload,
    };
```

- [ ] **Step 3: Import the route preload helper in the tab index route**

Modify `src/routes/$locale/$tab/index.tsx` so the import block includes:

```ts
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload, getDocsTabIndex } from '@/lib/docs-page';
import { preloadDocsPageContent } from '@/lib/docs-route-preload';
import { isSupportedDocLocale } from '@/lib/docs-routing';
```

- [ ] **Step 4: Call the preload helper before returning tab index loader data**

In `src/routes/$locale/$tab/index.tsx`, change the successful loader tail to:

```ts
    if ('redirectUrl' in payload) {
      throw redirect({
        href: payload.redirectUrl,
      });
    }

    await preloadDocsPageContent(payload);

    return {
      ...payload,
    };
```

- [ ] **Step 5: Run focused tests and typecheck**

Run:

```bash
bun run test src/lib/docs-route-preload.test.ts
bun run types:check
```

Expected:

```text
The preload helper test passes. Typecheck passes, including route imports and payload typing.
```

- [ ] **Step 6: Commit route loader preload wiring**

Run:

```bash
git add 'src/routes/$locale/$tab/$.tsx' 'src/routes/$locale/$tab/index.tsx'
git commit -m "feat: preload MDX docs in route loaders"
```

Expected:

```text
Commit succeeds with only the two route files staged.
```

---

### Task 4: Replace ClientOnly With Suspense For MDX Body Rendering

**Files:**
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Modify: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Update the SSR test to expect MDX body HTML**

In `src/components/docs-shell/DocsContent.test.tsx`, replace the test named `renders a content skeleton before client-only MDX content hydrates` with:

```tsx
  it('renders preloaded MDX body content during server rendering', () => {
    const html = renderToString(
      <AppProviders>
        <DocsContent
          contentPath="en/introduction/about-agora.md"
          slug="about-agora"
          title="About Agora"
          toc={[]}
        />
      </AppProviders>,
    );

    expect(html).toContain('data-testid="docs-content-body"');
    expect(html).toContain('en/introduction/about-agora.md');
    expect(html).not.toContain('data-testid="docs-content-skeleton"');
  });
```

- [ ] **Step 2: Run the failing DocsContent test**

Run:

```bash
bun run test src/components/docs-shell/DocsContent.test.tsx
```

Expected:

```text
FAIL because `DocsContent` still uses `ClientOnly`, so server rendering outputs the skeleton instead of the mocked MDX body.
```

- [ ] **Step 3: Replace the ClientOnly import with Suspense**

In `src/components/docs-shell/DocsContent.tsx`, replace:

```ts
import { ClientOnly } from '@tanstack/react-router';
```

with:

```ts
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
```

Then remove `Suspense` from the later React import by changing:

```ts
import { useCallback, useEffect, useMemo, useState } from 'react';
```

to nothing, because that import has been merged into the new React import.

- [ ] **Step 4: Render MDX body inside Suspense instead of ClientOnly**

In `src/components/docs-shell/DocsContent.tsx`, replace the MDX body branch:

```tsx
          {resolvedBody?.kind === 'mdx' ? (
            <ClientOnly fallback={<DocsContentSkeleton />}>
              <DocsContentBodyClient contentPath={resolvedBody.contentPath} />
            </ClientOnly>
          ) : null}
```

with:

```tsx
          {resolvedBody?.kind === 'mdx' ? (
            <Suspense fallback={<DocsContentSkeleton />}>
              <DocsContentBodyClient contentPath={resolvedBody.contentPath} />
            </Suspense>
          ) : null}
```

- [ ] **Step 5: Run DocsContent focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsContent.test.tsx
```

Expected:

```text
PASS src/components/docs-shell/DocsContent.test.tsx
```

- [ ] **Step 6: Commit Suspense rendering**

Run:

```bash
git add src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx
git commit -m "feat: render MDX docs through suspense"
```

Expected:

```text
Commit succeeds with only DocsContent rendering and tests staged.
```

---

### Task 5: Stop Sidebar Scroll Reset On Page Path Changes

**Files:**
- Modify: `src/components/docs-shell/DocsSidebar.tsx`
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify: `src/components/docs-shell/DocsShell.test.tsx`

- [ ] **Step 1: Mock DocsSidebar in DocsShell tests to expose reset key behavior**

Near the existing mocks in `src/components/docs-shell/DocsShell.test.tsx`, add or update a mock for `./DocsSidebar`:

```tsx
vi.mock('./DocsSidebar', () => ({
  DocsSidebar: ({
    activePath,
    resetKey,
  }: {
    activePath: string;
    resetKey: string;
  }) => (
    <aside
      data-active-path={activePath}
      data-reset-key={resetKey}
      data-testid="docs-sidebar"
    />
  ),
}));
```

If the file already relies on the real `DocsSidebar` for unrelated assertions, do not use this global mock. Instead, add a direct `DocsSidebar` component test in a new `src/components/docs-shell/DocsSidebar.test.tsx` using a mocked `useTransientScrollbar`. Prefer the direct test if the global mock would invalidate existing `DocsShell` coverage.

- [ ] **Step 2: Add a reset key test**

Add this test to the `DocsShell` test suite if the mock is viable:

```tsx
  it('keeps sidebar reset identity stable when only active path changes', () => {
    const { rerender } = renderDocsShell({
      activePath: '/en/introduction/about-agora',
      activeTab: 'introduction',
    });

    expect(screen.getByTestId('docs-sidebar')).toHaveAttribute(
      'data-reset-key',
      'introduction',
    );

    rerender(
      <AppProviders>
        <DocsShell
          {...defaultDocsShellProps}
          activePath="/en/introduction/conversational-ai"
          activeTab="introduction"
        />
      </AppProviders>,
    );

    expect(screen.getByTestId('docs-sidebar')).toHaveAttribute(
      'data-active-path',
      '/en/introduction/conversational-ai',
    );
    expect(screen.getByTestId('docs-sidebar')).toHaveAttribute(
      'data-reset-key',
      'introduction',
    );
  });
```

If `defaultDocsShellProps` does not exist in the current test file, use the local fixture object that `renderDocsShell()` already builds. Do not invent a second fixture shape.

- [ ] **Step 3: Run the failing shell test**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx
```

Expected:

```text
FAIL because `DocsShell` does not pass `resetKey` to `DocsSidebar` yet, or because the direct `DocsSidebar` test sees path changes trigger scroll reset.
```

- [ ] **Step 4: Add resetKey to DocsSidebar props**

In `src/components/docs-shell/DocsSidebar.tsx`, update the component signature and props type:

```tsx
export function DocsSidebar({
  activePath,
  activeTab,
  header,
  nodes,
  onSelectPath,
  resetKey,
}: {
  activePath: string;
  activeTab: string;
  header?: DocsSidebarHeader;
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
  resetKey: string;
}) {
```

Then replace the current reset effect:

```tsx
  useEffect(() => {
    void activeTab;
    void activePath;

    scrollToTop();
  }, [activePath, activeTab, scrollToTop]);
```

with:

```tsx
  useEffect(() => {
    void activeTab;

    scrollToTop();
  }, [activeTab, resetKey, scrollToTop]);
```

The `void activeTab` line can be removed if `activeTab` is no longer needed for lint. Keep the dependency on `resetKey` as the behavior source of truth.

- [ ] **Step 5: Pass resetKey from DocsShell**

In `src/components/docs-shell/DocsShell.tsx`, find the desktop `DocsSidebar` call and add:

```tsx
            resetKey={activeTab}
```

The result should include the existing props plus `resetKey`:

```tsx
          <DocsSidebar
            activePath={activePath}
            activeTab={activeTab}
            header={sidebarHeader}
            nodes={sidebar}
            onSelectPath={closeMobileSheet}
            resetKey={activeTab}
          />
```

- [ ] **Step 6: Run shell focused tests**

Run:

```bash
bun run test src/components/docs-shell/DocsShell.test.tsx
```

Expected:

```text
PASS src/components/docs-shell/DocsShell.test.tsx
```

- [ ] **Step 7: Commit sidebar reset behavior**

Run:

```bash
git add src/components/docs-shell/DocsSidebar.tsx src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebar.test.tsx
git commit -m "fix: keep docs sidebar scroll stable"
```

Expected:

```text
Commit succeeds with only sidebar reset files staged. If `DocsSidebar.test.tsx` was not created, Git ignores that path or reports it as unmatched depending on shell; stage only files that exist.
```

---

### Task 6: Verify Production Prerendered HTML Contains Normal MDX Body

**Files:**
- Verify: production build output
- Verify: `src/components/docs-shell/DocsContent.tsx`
- Verify: `src/routes/$locale/$tab/$.tsx`
- Verify: `src/routes/$locale/$tab/index.tsx`

- [ ] **Step 1: Run focused test suite**

Run:

```bash
bun run test src/lib/docs-route-preload.test.ts src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsContentBody.client.test.tsx
```

Expected:

```text
All focused tests pass.
```

- [ ] **Step 2: Run full test suite**

Run:

```bash
bun run test
```

Expected:

```text
All Vitest tests pass.
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
bun run types:check
```

Expected:

```text
Fumadocs generated files are refreshed and TypeScript exits with code 0.
```

- [ ] **Step 4: Run production build**

Run:

```bash
bun run build
```

Expected:

```text
Build exits with code 0. Chunk-size warnings are acceptable if the build completes.
```

- [ ] **Step 5: Locate a prerendered normal MDX HTML file**

Run:

```bash
find .output public dist .vinxi -type f -name '*.html' 2>/dev/null | sort | rg '/en/introduction|about-agora|index.html'
```

Expected:

```text
At least one production HTML file for a normal MDX docs route is found.
```

- [ ] **Step 6: Confirm normal MDX HTML contains body text and not just skeleton**

Use the actual HTML path found in Step 5. For example:

```bash
HTML_FILE="$(find .output public dist .vinxi -type f -name '*.html' 2>/dev/null | sort | rg '/en/introduction/.*/index.html|/en/introduction/index.html' | head -1)"
test -n "$HTML_FILE"
rg -n "About Agora|Agora|data-testid=\"docs-content-body\"" "$HTML_FILE"
! rg -n "data-testid=\"docs-content-skeleton\"" "$HTML_FILE"
```

Expected:

```text
The HTML contains stable normal MDX page text or the docs body marker. It does not contain only `docs-content-skeleton` for the main body.
```

- [ ] **Step 7: Start production preview**

Run:

```bash
bun run preview -- --host 127.0.0.1 --port 4173
```

Expected:

```text
Preview server starts on http://127.0.0.1:4173. Keep this session running for browser verification.
```

- [ ] **Step 8: Browser-verify normal docs and OpenAPI pages**

Use agent-browser or the in-app Browser against `http://127.0.0.1:4173`:

```text
1. Open http://127.0.0.1:4173/en/introduction/about-agora.
2. Disable JavaScript or inspect the initial document response if the browser tool supports it.
3. Confirm normal MDX body text is visible without waiting for a runtime server response.
4. Click another page in the same left sidebar and confirm the sidebar does not jump to top.
5. Open an OpenAPI endpoint page such as /en/api-reference/conversational-ai/rest-api/agent/join and confirm operation content still renders.
```

Expected:

```text
Normal MDX content is present quickly from production preview output, OpenAPI content still renders, and same-tab sidebar navigation no longer resets scroll position on every page click.
```

- [ ] **Step 9: Stop preview server**

Stop the preview process with `Ctrl-C`.

Expected:

```text
No long-running server sessions remain.
```

- [ ] **Step 10: Run final diff and whitespace checks**

Run:

```bash
git diff --check
git status --short
```

Expected:

```text
No whitespace errors. Worktree shows only intentional committed changes or is clean if each task was committed.
```

---

### Task 7: Document The Phase A Result For Follow-Up Planning

**Files:**
- Modify: `docs/superpowers/plans/2026-06-04-prerender-mdx-content.md`

- [ ] **Step 1: Add a result note to this plan**

Append this section to the end of `docs/superpowers/plans/2026-06-04-prerender-mdx-content.md` after execution:

```markdown
## Execution Result

- Normal MDX production HTML body: PASS or FAIL, with the checked route and evidence path.
- OpenAPI regression: PASS or FAIL, with the checked route.
- Sidebar same-tab scroll stability: PASS or FAIL.
- Remaining blockers:
  - If normal MDX HTML still does not contain body text after preload + Suspense, Phase B should evaluate explicit `.source/server` MDX body rendering.
  - If runtime `_serverFn` remains a performance bottleneck after body HTML is present, Phase B should evaluate payload splitting and static route artifacts.
```

- [ ] **Step 2: Commit the result note if execution changed the plan**

Run:

```bash
git add docs/superpowers/plans/2026-06-04-prerender-mdx-content.md
git commit -m "docs: record MDX prerender plan result"
```

Expected:

```text
Commit succeeds only if the result note was added after execution. If the plan was not updated during execution, skip this commit.
```

---

## Out Of Scope For Phase A

- Do not replace the custom `DocsShell` with Fumadocs `DocsLayout`.
- Do not remove or rewrite `getDocsPagePayload`.
- Do not remove `createServerFn`.
- Do not split the full docs payload into shell/page artifacts.
- Do not introduce a build-time static manifest.
- Do not rewrite OpenAPI page rendering.
- Do not convert the site to a pure static MPA.
- Do not silently swallow MDX preload failures.

## Self-Review

- Spec coverage: The plan covers the confirmed Phase A scope: dependency restoration, Fumadocs-style MDX preload, `ClientOnly` removal, Suspense rendering, sidebar reset behavior, tests, build, production preview, OpenAPI regression, and explicit non-goals.
- Placeholder scan: No `TBD`, `TODO`, or unfilled implementation steps remain. The only conditional instructions are bounded by current test-file constraints and include exact fallback behavior.
- Type consistency: `preloadDocsPageContent`, `DocsPagePayload`, `preloadDocsContent`, `DocsContentBodyClient`, and `resetKey` are named consistently across tasks.
