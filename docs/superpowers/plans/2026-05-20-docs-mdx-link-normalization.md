# Docs MDX Link Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Internal Markdown/MDX links rendered from docs content should use clean docs URLs, for example `get-started/quickstart.md` on `/en/ai` becomes `/en/ai/get-started/quickstart`, while preserving standard Markdown/HTML anchor compatibility.

**Architecture:** Normalize links at the MDX render boundary instead of rewriting hundreds of content files. The resolver receives the current source `contentPath`, resolves relative `.md`/`.mdx` hrefs against it, converts the target content path through the existing docs routing helpers, and renders the result as a normal `<a href="...">`; external links, hash links, root absolute app links, and asset links keep normal `<a>` behavior. A separate audit script checks every docs file so unresolved migrated links and legacy `/doc/*` links are visible instead of hidden.

**Tech Stack:** React, TanStack Router, Fumadocs MDX runtime, Vitest, Biome, `agent-browser`.

---

## Current Evidence

- Reproduced in build preview on `http://127.0.0.1:4173/en/ai`: the DOM contains `<a href="get-started/quickstart.md">Voice AI quickstart</a>`.
- Clicking that link lands on `http://127.0.0.1:4173/en/get-started/quickstart.md` and renders the app 404 page.
- The incorrect target happens because `/en/ai` has no trailing slash, so the browser resolves `get-started/quickstart.md` relative to `/en/` instead of the source file directory `content/docs/en/ai/`.
- A full audit of `content/docs` found 669 docs files, 3251 total links, 1202 relative Markdown links, 12 root `/doc/*` links, and 294 relative Markdown links whose resolved content file is currently missing. The first implementation should fix valid relative Markdown links and report the missing ones explicitly.
- The sampled bad-link click did not hard-freeze the browser, but it did rebuild the inspected target during navigation. That matches the user's "more like refresh" observation and is enough to treat raw MDX `<a>` navigation as part of the bug.

## File Structure

- Create: `src/lib/docs-link-normalize.ts`
  - Owns deterministic href classification and conversion.
  - Exports `normalizeDocsHref(href, context)` returning `{ href, kind }`.
  - Uses `buildDocPath()` and `getSourceSlugsFromContentPath()` from `src/lib/docs-routing.ts`.

- Create: `src/lib/docs-link-normalize.test.ts`
  - Tests relative `.md` and `.mdx` conversion, `index.md` collapse, query/hash preservation, and unchanged non-doc links.

- Modify: `src/components/mdx.tsx`
  - Adds a docs-aware `a` component.
  - Keeps existing MDX components and override behavior.
  - Renders normalized internal docs paths as standard `<a href="...">`.
  - Renders external, hash-only, root absolute, mailto/tel, and asset links as standard `<a>`.

- Modify: `src/components/docs-shell/DocsContentBody.client.tsx`
  - Passes the current `contentPath` into `getMDXComponents()` so link resolution uses source-file context, not browser URL context.

- Modify: `src/components/mdx.test.tsx`
  - Covers the MDX anchor integration for a representative source path such as `en/ai/index.md`.

- Create: `scripts/audit-doc-links.mjs`
  - Scans `content/docs/**/*.md(x)` and reports:
    - valid relative Markdown links and their normalized clean routes;
    - missing relative Markdown targets;
    - root `/doc/*` legacy links;
    - links left untouched because they are external, hash-only, or assets.

- Modify: `package.json`
  - Adds `"docs:links": "node scripts/audit-doc-links.mjs"` for repeatable local verification.

- Optional create: `src/routes/doc/$.tsx`
  - Adds a tiny compatibility redirect for root `/doc/*` links only if the audit confirms those are old public docs URLs that should remain reachable from the portal.

## Design Decisions

- Normalize at render time rather than editing content in place. The content subtree is imported/migrated material, and the same relative link can be correct in source-file context while wrong in browser URL context.
- Do not normalize every relative href. Only relative `.md` and `.mdx` targets are docs-page links. Images, downloads, examples, hash links, and root app paths should not be rewritten by this resolver.
- Use source `contentPath`, not `location.pathname`, as the base. This fixes `/en/ai` and also works when the same MDX is rendered under localized or nested routes.
- Use standard anchor output for all MDX links. This keeps Markdown-generated HTML compatible and avoids coupling imported content to app-specific link components.
- Treat the 294 missing relative Markdown targets as migration debt until audited. The resolver can produce clean routes for syntactically valid source paths, but it cannot invent missing content.

### Task 1: Link Resolver

**Files:**
- Create: `src/lib/docs-link-normalize.ts`
- Create: `src/lib/docs-link-normalize.test.ts`
- Read: `src/lib/docs-routing.ts`

- [ ] **Step 1: Write failing resolver tests**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeDocsHref } from './docs-link-normalize';

describe('normalizeDocsHref', () => {
  it('resolves relative markdown links from the source content path', () => {
    expect(
      normalizeDocsHref('get-started/quickstart.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: '/en/ai/get-started/quickstart', kind: 'internal-doc' });
  });

  it('collapses index.md targets to their directory route', () => {
    expect(
      normalizeDocsHref('studio/index.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: '/en/ai/studio', kind: 'internal-doc' });
  });

  it('resolves parent traversal and preserves hash/search', () => {
    expect(
      normalizeDocsHref(
        '../api-reference/conversational-ai/rest-api/index.md?view=all#start',
        { contentPath: 'en/ai/index.md' },
      ),
    ).toEqual({
      href: '/en/api-reference/conversational-ai/rest-api?view=all#start',
      kind: 'internal-doc',
    });
  });

  it('leaves non-doc links unchanged', () => {
    expect(
      normalizeDocsHref('#overview', { contentPath: 'en/ai/index.md' }),
    ).toEqual({ href: '#overview', kind: 'hash' });
    expect(
      normalizeDocsHref('https://example.com/page.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: 'https://example.com/page.md', kind: 'external' });
    expect(
      normalizeDocsHref('./diagram.png', { contentPath: 'en/ai/index.md' }),
    ).toEqual({ href: './diagram.png', kind: 'relative-asset' });
  });
});
```

- [ ] **Step 2: Run resolver tests and verify failure**

Run:

```bash
bun run test src/lib/docs-link-normalize.test.ts
```

Expected: FAIL because `src/lib/docs-link-normalize.ts` does not exist yet.

- [ ] **Step 3: Implement minimal resolver**

Implementation requirements:

- Parse `href` into path/search/hash without requiring `window`.
- Return unchanged links for:
  - `''`
  - `#...`
  - `/...`
  - `//...`
  - protocol URLs like `https:`, `mailto:`, `tel:`
  - relative links whose path does not end in `.md` or `.mdx`
- Resolve relative Markdown targets against `dirname(contentPath)`.
- Normalize `.` and `..` path segments.
- Use the first resolved segment as locale and `getSourceSlugsFromContentPath()` for tab/slug extraction.
- Build the route with `buildDocPath(locale, sourceSlugs[0], sourceSlugs.slice(1))`.
- Preserve query and hash on the normalized route.

- [ ] **Step 4: Run resolver tests and verify pass**

Run:

```bash
bun run test src/lib/docs-link-normalize.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit resolver**

```bash
git add src/lib/docs-link-normalize.ts src/lib/docs-link-normalize.test.ts
git commit -m "fix: normalize docs markdown hrefs"
```

### Task 2: MDX Anchor Integration

**Files:**
- Modify: `src/components/mdx.tsx`
- Modify: `src/components/docs-shell/DocsContentBody.client.tsx`
- Modify: `src/components/mdx.test.tsx`

- [ ] **Step 1: Write failing MDX integration test**

Test behavior:

- `getMDXComponents(undefined, { contentPath: 'en/ai/index.md' }).a`
- Rendering the returned anchor with `href="get-started/quickstart.md"` should produce an internal link target `/en/ai/get-started/quickstart`.
- Rendering `href="https://example.com"` should preserve a normal external anchor.

The test should assert a standard anchor `href`, not a TanStack `Link`, to preserve Markdown syntax compatibility.

- [ ] **Step 2: Run test and verify failure**

Run:

```bash
bun run test src/components/mdx.test.tsx
```

Expected: FAIL because `getMDXComponents()` does not accept link context and does not provide an `a` component.

- [ ] **Step 3: Add docs-aware anchor**

Implementation requirements:

- Import `normalizeDocsHref` from `@/lib/docs-link-normalize`.
- Keep the existing `getMDXComponents(components?: MDXComponents)` call compatible by changing the signature to:

```ts
export function getMDXComponents(
  components?: MDXComponents,
  context?: { contentPath?: string },
) {
  return {
    a: createDocsAnchor(context?.contentPath),
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    CardGrid,
    FeatureCard,
    ...components,
  } satisfies MDXComponents;
}
```

- `createDocsAnchor(contentPath)` should:
  - call `normalizeDocsHref()` when `href` is a string;
  - render `<a href={normalized.href} ...>` for every normalized link kind;
  - preserve `className`, `children`, `target`, `rel`, `title`, and data attributes.

- [ ] **Step 4: Pass content path from docs content body**

Change `src/components/docs-shell/DocsContentBody.client.tsx`:

```ts
return useDocsContent(contentPath, {
  components: getMDXComponents(undefined, { contentPath }),
});
```

- [ ] **Step 5: Run MDX tests and verify pass**

Run:

```bash
bun run test src/components/mdx.test.tsx src/lib/docs-link-normalize.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit MDX integration**

```bash
git add src/components/mdx.tsx src/components/docs-shell/DocsContentBody.client.tsx src/components/mdx.test.tsx
git commit -m "fix: route docs mdx links through tanstack"
```

### Task 3: Full Docs Link Audit

**Files:**
- Create: `scripts/audit-doc-links.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add audit script**

Script requirements:

- Scan `content/docs/**/*.md` and `content/docs/**/*.mdx`.
- Extract Markdown inline links, reference links, and raw HTML anchor `href` values.
- Ignore images (`![alt](...)`) for route validation, but count them separately as assets.
- For each relative `.md`/`.mdx` link:
  - resolve it against the source file path;
  - check whether the target content file exists;
  - print the normalized clean route using the same resolver from Task 1 when it exists;
  - print missing target entries with source file, href, and resolved target.
- For each root `/doc/*` link:
  - report source file and href under a separate `legacyRootDocLinks` bucket.
- Exit `0` by default so the current migration debt can be reported without blocking builds.
- Support `--fail-on-missing` for future CI hardening.

- [ ] **Step 2: Add npm script**

In `package.json`:

```json
"docs:links": "node scripts/audit-doc-links.mjs"
```

- [ ] **Step 3: Run audit**

Run:

```bash
bun run docs:links
```

Expected:

- Shows total docs file count.
- Shows total link count.
- Shows relative Markdown link count.
- Shows missing relative Markdown target count.
- Shows legacy `/doc/*` count.
- Includes `content/docs/en/ai/index.md` quickstart/build/studio/rest-api links as valid normalized routes.

- [ ] **Step 4: Save audit output for handoff**

If the output is long, save a concise markdown report under:

```text
docs/superpowers/reports/2026-05-20-doc-link-audit.md
```

Do not manually rewrite all missing content links in this task unless the mapping is mechanical and obvious. The audit report is the source of truth for follow-up content migration cleanup.

- [ ] **Step 5: Commit audit tooling**

```bash
git add package.json scripts/audit-doc-links.mjs docs/superpowers/reports/2026-05-20-doc-link-audit.md
git commit -m "chore: audit docs content links"
```

### Task 4: Legacy `/doc/*` Compatibility Decision

**Files:**
- Optional create: `src/routes/doc/$.tsx`
- Generated modify: `src/routeTree.gen.ts`
- Optional test: `src/routes/-docs-routing-guards.test.ts`

- [ ] **Step 1: Decide from audit output**

If the audit reports root `/doc/*` links that are old public docs URLs, add a local compatibility route. If they are content mistakes that should be rewritten to current portal paths, skip this route and list them in the audit report.

Recommended answer: add the compatibility route only for root `/doc/*`, because current content already contains these links and the route currently 404s locally.

- [ ] **Step 2: Add route when needed**

Create `src/routes/doc/$.tsx`:

```ts
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/doc/$')({
  beforeLoad: ({ params }) => {
    const splat = params._splat ?? '';

    throw redirect({
      href: `https://doc.shengwang.cn/doc/${splat}`,
      statusCode: 308,
    });
  },
});
```

- [ ] **Step 3: Regenerate route tree**

Run:

```bash
bun run types:check
```

Expected: PASS and `src/routeTree.gen.ts` includes the `/doc/$` route.

- [ ] **Step 4: Test route behavior**

Add a route guard test or browser check that `/doc/console/general/quickstart` redirects to `https://doc.shengwang.cn/doc/console/general/quickstart`.

- [ ] **Step 5: Commit compatibility route**

```bash
git add src/routes/doc/$.tsx src/routeTree.gen.ts src/routes/-docs-routing-guards.test.ts
git commit -m "fix: redirect legacy docs links"
```

### Task 5: Build and Browser Verification

**Files:**
- No new source files expected.

- [ ] **Step 1: Run focused test suite**

Run:

```bash
bun run test src/lib/docs-link-normalize.test.ts src/components/mdx.test.tsx src/routes/-docs-routing-guards.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full project checks**

Run:

```bash
bun run test
bun run types:check
bun run build
bun run lint
```

Expected:

- Tests pass.
- Type check passes.
- Build passes.
- Lint has no new issues. If the existing `document.cookie` lint warning appears, mention that it is pre-existing and unrelated.

- [ ] **Step 3: Start production preview**

Run:

```bash
bun run preview --host 127.0.0.1 --port 4173
```

Expected: preview listens on `http://127.0.0.1:4173`.

- [ ] **Step 4: Verify `/en/ai` DOM links**

Run with `agent-browser`:

```bash
agent-browser --session docs-link-check open http://127.0.0.1:4173/en/ai
agent-browser --session docs-link-check eval "(() => [...document.querySelectorAll('a')].filter((a) => (a.textContent || '').includes('Voice AI quickstart')).map((a) => ({ text: a.textContent.trim(), attr: a.getAttribute('href'), href: a.href })))()"
```

Expected: `attr` is `/en/ai/get-started/quickstart`; no `.md` suffix.

- [ ] **Step 5: Verify click does not reload the document**

Use a browser-side counter before clicking:

```bash
agent-browser --session docs-link-check eval "(() => { window.__docsPageEvents = { beforeunload: 0, pagehide: 0 }; window.addEventListener('beforeunload', () => window.__docsPageEvents.beforeunload += 1); window.addEventListener('pagehide', () => window.__docsPageEvents.pagehide += 1); return true; })()"
agent-browser --session docs-link-check click "Voice AI quickstart"
agent-browser --session docs-link-check wait 1000
agent-browser --session docs-link-check eval "(() => ({ url: location.href, h1: document.querySelector('h1')?.textContent, events: window.__docsPageEvents }))()"
```

Expected:

- URL is `http://127.0.0.1:4173/en/ai/get-started/quickstart`.
- `h1` is the quickstart page heading.
- The target is no longer `/en/get-started/quickstart.md` or any `.md` URL. A document reload may still occur because the rendered output deliberately remains a normal anchor for Markdown compatibility.

- [ ] **Step 6: Verify console/network health**

Run:

```bash
agent-browser --session docs-link-check errors
agent-browser --session docs-link-check console --level error
```

Expected: no new errors caused by the link click.

- [ ] **Step 7: Final commit or amend**

If the user wants one commit for this issue:

```bash
git log --oneline --max-count=5
git status --short
```

Then either keep the task commits, squash them, or commit remaining changes according to the user's explicit instruction. Do not rewrite history without explicit approval.

## Open Questions

1. Should legacy root `/doc/*` links redirect to `https://doc.shengwang.cn/doc/*`, or should they be rewritten into current portal routes only when a current equivalent exists?

Recommended answer: redirect `/doc/*` now, because it is a narrow compatibility route and prevents local 404s for already-migrated content. Keep source rewrites for a separate content-migration pass.

2. Should the audit become CI-blocking immediately?

Recommended answer: no. Keep `bun run docs:links` non-blocking first, because the current audit found hundreds of migrated-link misses. Add `--fail-on-missing` later after those are cleaned.

## Completion Criteria

- `/en/ai` renders `Voice AI quickstart` with href `/en/ai/get-started/quickstart`.
- Clicking that link no longer navigates to a `.md` URL or to the wrong `/en/get-started/...` path.
- Build preview no longer routes the sample link to `/en/get-started/quickstart.md`.
- Full docs link audit is repeatable with `bun run docs:links`.
- Remaining unresolved content links are documented as a concrete report, not hidden.
- Verification commands and browser checks are recorded in the final handoff.
