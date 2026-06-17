# Static Docs Bundle Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove normal MDX docs from the Nitro runtime bundle by replacing the Fumadocs server source for ordinary docs with a build-time docs manifest/tree pipeline, while preserving prerendered docs behavior, navigation, locale switching, LLM exports, and Vercel hosting.

**Architecture:** Keep TanStack Start plus Nitro plus Vercel as the hosting model, but split docs data into two planes. OpenAPI can keep using the existing server-side Fumadocs/OpenAPI runtime, while ordinary docs move to a generated manifest/tree/meta index that powers page lookup, sidebar generation, nav-scope resolution, prerender path seeding, and LLM routes without `docs.toFumadocsSource()` in Nitro.

**Tech Stack:** TanStack Start, Nitro, Vercel preset, React 19, TypeScript, Fumadocs core/page-tree types where useful, local docs-shell helpers in `src/lib`, Vitest, Biome, Bun build pipeline.

---

## File Structure

- Create: `src/lib/docs-static/build-docs-index.server.ts`
  - Build-time reader for `content/docs/**` and `meta.json`, returning a normalized ordinary-docs data model.
- Create: `src/lib/docs-static/docs-index-types.ts`
  - Shared type contract for ordinary-docs pages, folders, node meta, locale links, and nav traversal.
- Create: `src/lib/docs-static/docs-index.server.ts`
  - Cached runtime accessor for the generated ordinary-docs index inside the server bundle.
- Create: `src/lib/docs-static/docs-index-tree.ts`
  - Tree traversal helpers that replace the subset of `source.getPageTree()`, `source.getPage()`, `source.getPages()`, and `source.getNodeMeta()` needed by ordinary docs.
- Create: `src/lib/docs-static/docs-index-llms.server.ts`
  - Helpers for ordinary-docs LLM route export without `llms(source)`.
- Modify: `src/lib/source.server.ts`
  - Split normal docs and OpenAPI concerns so this module no longer constructs a unified Fumadocs server source for ordinary docs.
- Modify: `src/lib/docs-page-heavy.server.ts`
  - Route ordinary docs through the generated ordinary-docs index, keeping OpenAPI on the current server runtime path.
- Modify: `src/lib/prerender-pages.server.ts`
  - Seed normal docs prerender paths from the generated index instead of `source.getPages()`.
- Modify: `src/routes/llms-full[.]txt.ts`
  - Export ordinary-docs markdown/text from the generated index and keep OpenAPI concatenation.
- Modify: `src/routes/llms[.]mdx.docs.$.ts`
  - Resolve ordinary-docs markdown lookups from the generated index and keep OpenAPI fallback.
- Modify: `src/routes/llms[.]txt.ts`
  - Replace `llms(source).index()` for ordinary docs with generated ordinary-docs index output.
- Modify: `src/lib/docs-manifest.server.ts`
  - Either retire it into the new index builder or narrow it to become a low-level input used by the builder.
- Test: `src/lib/docs-static/build-docs-index.server.test.ts`
- Test: `src/lib/docs-static/docs-index-tree.test.ts`
- Test: `src/lib/docs-page.server.test.ts`
- Test: `src/lib/prerender-pages.server.test.ts`
- Test: `src/routes/llms-routes.test.ts` or focused route-adjacent helpers if route handlers are not directly unit-tested today.

## Scope Notes

- Do not modify `content/docs/**`.
- Do not remove TanStack Start, Nitro, or Vercel deployment support.
- Do not regress ordinary docs, deferred-sidebar docs, OpenAPI docs, or locale behavior.
- Bundle reduction success is measured by `.vercel/output/functions`, not only by total build success.
- OpenAPI runtime can remain on the current Fumadocs/OpenAPI path in this plan; shrinking that path is explicitly out of scope.

### Task 1: Freeze the Baseline and Protect Bundle Measurements

**Files:**
- Modify: `docs/superpowers/plans/2026-06-17-static-docs-bundle-reduction.md`
- Test/Verify: local shell commands only

- [ ] **Step 1: Record the current baseline artifact sizes**

Run:

```bash
du -sh .vercel/output .vercel/output/static .vercel/output/functions
find .vercel/output/functions -type f -exec stat -f '%z' {} + | awk '{s+=$1} END {print s}'
find .vercel/output/functions/__server.func/_ssr -type f -exec stat -f '%z %N' {} + | sort -nr | head -n 20
```

Expected: baseline remains around `143M` total, `71M` static, `72M` functions, with `source.server-*.mjs` among the largest `_ssr` files.

- [ ] **Step 2: Confirm the current ordinary-docs runtime dependency points**

Run:

```bash
rg -n "docs\\.toFumadocsSource|source\\.getPageTree|source\\.getPages\\(|source\\.getPage\\(|source\\.getNodeMeta|llms\\(source\\)" src
```

Expected: hits in `src/lib/source.server.ts`, `src/lib/docs-page-heavy.server.ts`, `src/lib/prerender-pages.server.ts`, and `src/routes/llms*.ts`.

- [ ] **Step 3: Commit if the branch does not already contain the measurement notes**

```bash
git add docs/superpowers/plans/2026-06-17-static-docs-bundle-reduction.md
git commit -m "docs: add static docs bundle reduction plan"
```

### Task 2: Build a Generated Ordinary-Docs Index Contract

**Files:**
- Create: `src/lib/docs-static/docs-index-types.ts`
- Create: `src/lib/docs-static/build-docs-index.server.ts`
- Test: `src/lib/docs-static/build-docs-index.server.test.ts`

- [ ] **Step 1: Write the failing tests for ordinary-docs index generation**

```ts
import { describe, expect, it } from 'vitest';
import { buildDocsIndex } from './build-docs-index.server';

describe('buildDocsIndex', () => {
  it('builds ordinary-docs pages with route lookup, markdown url, and locale grouping', () => {
    const index = buildDocsIndex();

    expect(index.pages.length).toBeGreaterThan(0);
    expect(index.pagesByRoutePath.get('/en/introduction')).toMatchObject({
      locale: 'en',
      routePath: '/en/introduction',
    });
    expect(index.pagesByLocale.en.length).toBeGreaterThan(0);
  });

  it('loads meta.json data for nav-scope folders without touching MDX bodies', () => {
    const index = buildDocsIndex();
    const node = index.nodesByKey.get('en/realtime-media/rtc');

    expect(node?.meta?.navScope).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run: `bunx vitest run src/lib/docs-static/build-docs-index.server.test.ts`

Expected: FAIL because the new builder/types do not exist yet.

- [ ] **Step 3: Implement the ordinary-docs index builder**

```ts
export type DocsIndexPage = {
  contentPath: string;
  description?: string;
  locale: AppLocale;
  markdownUrl: string;
  routePath: string;
  slugSegments: string[];
  sourceSlugs: string[];
  tab: string;
  title: string;
};

export type DocsIndexNode = {
  children: string[];
  key: string;
  meta?: DocsMeta;
  name: string;
  page?: DocsIndexPage;
  parentKey?: string;
  type: 'folder' | 'page';
};

export type DocsIndex = {
  nodesByKey: Map<string, DocsIndexNode>;
  pages: DocsIndexPage[];
  pagesByLocale: Record<AppLocale, DocsIndexPage[]>;
  pagesByRoutePath: Map<string, DocsIndexPage>;
};
```

Implementation notes:

- Reuse the existing `docs-manifest.server.ts` frontmatter/path parsing where it is correct.
- Add `meta.json` parsing via `docsMetaSchema` for folders that own navigation metadata.
- Keep the builder synchronous if possible so it remains easy to cache and test.
- Do not parse MDX body code at this stage; ordinary-docs body rendering remains on the browser source path.

- [ ] **Step 4: Run the tests again**

Run: `bunx vitest run src/lib/docs-static/build-docs-index.server.test.ts`

Expected: PASS with generated pages and `meta.json` coverage.

- [ ] **Step 5: Commit**

```bash
git add src/lib/docs-static/docs-index-types.ts src/lib/docs-static/build-docs-index.server.ts src/lib/docs-static/build-docs-index.server.test.ts
git commit -m "feat: add generated ordinary docs index"
```

### Task 3: Add Tree Traversal Helpers that Replace Ordinary Fumadocs Server Lookups

**Files:**
- Create: `src/lib/docs-static/docs-index.server.ts`
- Create: `src/lib/docs-static/docs-index-tree.ts`
- Test: `src/lib/docs-static/docs-index-tree.test.ts`

- [ ] **Step 1: Write the failing tests for page lookup, folder lookup, and nav traversal**

```ts
import { describe, expect, it } from 'vitest';
import { getDocsIndex } from './docs-index.server';
import {
  getDocsIndexPage,
  getDocsIndexPageTree,
  getDocsIndexPages,
  getDocsIndexNodeMeta,
} from './docs-index-tree';

describe('docs index tree helpers', () => {
  it('returns ordinary-docs pages by locale and source slugs', () => {
    const index = getDocsIndex();
    expect(getDocsIndexPages(index, 'en').length).toBeGreaterThan(0);
    expect(
      getDocsIndexPage(index, ['introduction'], 'en')?.routePath,
    ).toBe('/en/introduction');
  });

  it('returns folder meta for nav-scope consumers', () => {
    const index = getDocsIndex();
    const root = getDocsIndexPageTree(index, 'en');
    expect(root.children.length).toBeGreaterThan(0);
    expect(getDocsIndexNodeMeta(index, 'en/realtime-media/rtc')?.navScope).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run: `bunx vitest run src/lib/docs-static/docs-index-tree.test.ts`

Expected: FAIL because the helper layer does not exist yet.

- [ ] **Step 3: Implement the cached index accessor and traversal helpers**

```ts
let docsIndexCache: DocsIndex | null = null;

export function getDocsIndex() {
  if (!docsIndexCache) {
    docsIndexCache = buildDocsIndex();
  }

  return docsIndexCache;
}
```

Implementation notes:

- Keep helper names parallel to the current `source` API where that reduces call-site churn.
- Use plain tree nodes or a thin compatibility adapter; do not instantiate the full Fumadocs source loader for ordinary docs.
- Ensure helpers can answer:
  - pages by locale
  - page by route/source slugs
  - root page tree by locale
  - node meta by folder key
  - first-child fallback lookups for redirects

- [ ] **Step 4: Run the tests again**

Run: `bunx vitest run src/lib/docs-static/docs-index-tree.test.ts`

Expected: PASS with stable ordinary-docs traversal behavior.

- [ ] **Step 5: Commit**

```bash
git add src/lib/docs-static/docs-index.server.ts src/lib/docs-static/docs-index-tree.ts src/lib/docs-static/docs-index-tree.test.ts
git commit -m "feat: add ordinary docs tree helpers"
```

### Task 4: Move Ordinary Docs Payload Assembly off `source.server.ts`

**Files:**
- Modify: `src/lib/docs-page-heavy.server.ts`
- Modify: `src/lib/source.server.ts`
- Test: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Write or extend failing tests for ordinary-docs payloads staying correct after the source split**

Add assertions covering:

```ts
it('builds an ordinary-docs payload from the generated docs index', async () => {
  const payload = await loadDocsPagePayload('en', 'introduction', [], true);

  expect(payload).toMatchObject({
    activePath: '/en/introduction',
    layoutMode: 'docs',
  });
  expect(payload?.sidebar.length).toBeGreaterThan(0);
});
```

```ts
it('keeps OpenAPI pages on the runtime source path', async () => {
  const payload = await loadDocsPagePayload(
    'en',
    'api-reference',
    ['conversational-ai', 'rest-api', 'agent', 'join'],
    true,
  );

  expect(payload?.body.kind).toBe('openapi');
});
```

- [ ] **Step 2: Run the focused tests to verify the red state**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts
```

Expected: FAIL once the call sites are switched but the helper plumbing is incomplete.

- [ ] **Step 3: Implement the split ordinary-docs/OpenAPI source flow**

Implementation notes:

- In `src/lib/docs-page-heavy.server.ts`, branch earlier:
  - ordinary docs -> generated docs index helpers
  - OpenAPI -> current `source.server` or current OpenAPI-specific helper path
- Replace ordinary-docs uses of:
  - `source.getPageTree(locale)`
  - `source.getPage(...)`
  - `source.getPages(locale)`
  - `source.getNodeMeta(...)`
  with generated index/tree helpers.
- Keep `getPageMarkdownUrl` behavior intact for ordinary docs by using the generated page data.
- Narrow `src/lib/source.server.ts` so it no longer constructs `docs: docs.toFumadocsSource()` for normal docs.

- [ ] **Step 4: Re-run the focused payload tests**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts src/lib/docs-static/build-docs-index.server.test.ts src/lib/docs-static/docs-index-tree.test.ts
```

Expected: PASS for the ordinary-docs split and OpenAPI regression coverage.

- [ ] **Step 5: Commit**

```bash
git add src/lib/docs-page-heavy.server.ts src/lib/source.server.ts src/lib/docs-page.server.test.ts src/lib/docs-static
git commit -m "refactor: split ordinary docs from server source"
```

### Task 5: Remove Remaining Ordinary-Docs Server-Source Callers

**Files:**
- Modify: `src/lib/prerender-pages.server.ts`
- Modify: `src/routes/llms-full[.]txt.ts`
- Modify: `src/routes/llms[.]mdx.docs.$.ts`
- Modify: `src/routes/llms[.]txt.ts`
- Create: `src/lib/docs-static/docs-index-llms.server.ts`
- Test: `src/lib/prerender-pages.server.test.ts`
- Test: focused helper or route tests for `llms` output

- [ ] **Step 1: Write failing tests for prerender paths and LLM ordinary-docs output**

```ts
it('seeds prerender paths from the generated ordinary-docs index', () => {
  expect(getDocsPrerenderPaths()).toContain('/en/introduction');
});
```

```ts
it('builds ordinary-docs llms index entries without fumadocs source', () => {
  const markdown = buildDocsLlmsIndex();
  expect(markdown).toContain('/en/introduction');
});
```

- [ ] **Step 2: Run the focused failing tests**

Run:

```bash
bunx vitest run src/lib/prerender-pages.server.test.ts
```

Expected: FAIL once `source.getPages()` is removed and helper replacements are not in place yet.

- [ ] **Step 3: Implement the remaining caller replacements**

Implementation notes:

- `src/lib/prerender-pages.server.ts`: ordinary docs from generated index, OpenAPI paths from existing lanes helper.
- `src/routes/llms-full[.]txt.ts`: ordinary docs full markdown/text from generated helpers, OpenAPI appended separately.
- `src/routes/llms[.]mdx.docs.$.ts`: ordinary docs lookup by content path from the generated index, OpenAPI fallback retained.
- `src/routes/llms[.]txt.ts`: build an index markdown list for ordinary docs directly from the generated index instead of `llms(source).index()`.

- [ ] **Step 4: Run the focused regression tests**

Run:

```bash
bunx vitest run src/lib/prerender-pages.server.test.ts src/lib/docs-page.server.test.ts
```

Expected: PASS with ordinary-docs prerender and LLM behavior preserved.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prerender-pages.server.ts src/routes/llms-full[.]txt.ts src/routes/llms[.]mdx.docs.$.ts src/routes/llms[.]txt.ts src/lib/docs-static/docs-index-llms.server.ts src/lib/prerender-pages.server.test.ts
git commit -m "refactor: reroute ordinary docs exports and prerender paths"
```

### Task 6: Verify Bundle Reduction and Preserve Vercel Viability

**Files:**
- Modify: `docs/superpowers/plans/2026-06-17-static-docs-bundle-reduction.md`
- Test/Verify: build output and artifact inspection only

- [ ] **Step 1: Run the focused regression suite**

Run:

```bash
bunx vitest run src/lib/docs-page.server.test.ts src/lib/docs-static/build-docs-index.server.test.ts src/lib/docs-static/docs-index-tree.test.ts src/lib/prerender-pages.server.test.ts
```

Expected: PASS for the new ordinary-docs index path.

- [ ] **Step 2: Run the production build**

Run:

```bash
bun run build
```

Expected: PASS with `.vercel/output` regenerated.

- [ ] **Step 3: Measure the new bundle sizes**

Run:

```bash
du -sh .vercel/output .vercel/output/static .vercel/output/functions
find .vercel/output/functions -type f -exec stat -f '%z' {} + | awk '{s+=$1} END {print s}'
find .vercel/output/functions/__server.func/_ssr -type f -exec stat -f '%z %N' {} + | sort -nr | head -n 20
```

Expected:

- `.vercel/output/functions` drops materially below the `~72 MB` baseline.
- `source.server-*.mjs` is either gone from the top offenders or materially smaller.
- The build still emits Vercel-compatible output under `.vercel/output`.

- [ ] **Step 4: Inspect that ordinary-docs Fumadocs server loader code is absent from Nitro**

Run:

```bash
rg -n "docsLazy\\(|toFumadocsSource\\(|content/docs" .vercel/output/functions/__server.func/_ssr
```

Expected: no ordinary-docs server-source hits remain in Nitro, or remaining hits are limited to OpenAPI-only code paths with no `content/docs` loader runtime.

- [ ] **Step 5: Commit**

```bash
git add src/lib/docs-static src/lib/docs-page-heavy.server.ts src/lib/source.server.ts src/lib/prerender-pages.server.ts src/routes/llms-full[.]txt.ts src/routes/llms[.]mdx.docs.$.ts src/routes/llms[.]txt.ts src/lib/docs-page.server.test.ts src/lib/prerender-pages.server.test.ts docs/superpowers/plans/2026-06-17-static-docs-bundle-reduction.md
git commit -m "refactor: reduce ordinary docs server bundle"
```

## Self-Review

- Spec coverage:
  - ordinary-docs source removal from Nitro: Tasks 2-5
  - prerender/static path preservation: Tasks 4-6
  - OpenAPI separation: Tasks 4-5
  - Vercel/bundle verification: Task 6
- Placeholder scan:
  - no `TODO`/`TBD` placeholders remain
  - each task includes concrete files and verification commands
- Type consistency:
  - `DocsIndex`, `DocsIndexPage`, and `DocsIndexNode` are defined before later tasks rely on them

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-17-static-docs-bundle-reduction.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
