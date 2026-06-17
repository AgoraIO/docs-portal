# Docs Shell And Markdown Issues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the current docs-portal issues around misleading locale switching, missing scroll reset between docs pages, and broken API reference markdown viewing without expanding into a larger shell or MDX/OpenAPI migration.

**Architecture:** Keep the work scoped to the existing docs shell and published markdown export pipeline. For `#52`, adjust locale-switcher copy and presentation so it reflects a site switch instead of a translation toggle. For `#53`, add route-level scroll reset that only fires on cross-page navigation and preserves hash scrolling. For `#45`, fix the API reference markdown export path using the existing `llms.mdx` and OpenAPI markdown serializer flow instead of redesigning the renderer.

**Tech Stack:** TanStack Start, TanStack Router, React, TypeScript, Vitest, i18next, Fumadocs, fumadocs-openapi, fumadocs-ui/mdx

---

## File Structure

- Modify: `src/components/docs-shell/DocsShell.tsx`
  Responsibility: rename and restyle the locale/site switcher UI for `#52`.
- Modify: `src/components/docs-shell/DocsShell.test.tsx`
  Responsibility: assert the updated locale/site switcher copy and behavior for `#52`.
- Modify: `src/lib/i18n/resources/en/common.ts`
  Responsibility: provide English strings for the revised site-switcher labels and helper copy.
- Modify: `src/lib/i18n/resources/zh-CN/common.ts`
  Responsibility: provide Chinese strings for the revised site-switcher labels and helper copy.
- Modify: `src/components/docs-shell/DocsContent.tsx`
  Responsibility: reset scroll position only when a new docs page is loaded for `#53`, while preserving existing hash sync behavior.
- Modify: `src/components/docs-shell/DocsContent.test.tsx`
  Responsibility: cover cross-page scroll reset and hash-preserving behavior for `#53`.
- Modify: `src/lib/source.server.ts`
  Responsibility: generate `.md` export URLs for ordinary MDX pages and OpenAPI pages from source metadata instead of assuming the source path is already a markdown file, fixing `#45`.
- Modify: `src/lib/docs-page.server.test.ts`
  Responsibility: lock the markdown URL contract for both ordinary docs pages and API reference pages for `#45`.
- Modify: `src/routes/llms[.]mdx.docs.$.ts`
  Responsibility: ensure the raw markdown route resolves OpenAPI markdown requests correctly when the content path comes from the fixed URL contract.
- Modify: `src/lib/openapi/markdown.ts`
  Responsibility: reuse existing OpenAPI markdown serialization paths if route/content-path normalization needs a small fix for `#45`.
- Test/Verify: `bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/docs-page.server.test.ts`
- Test/Verify: `bun run types:check`
- Test/Verify: `bunx biome check src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/source.server.ts src/lib/docs-page.server.test.ts src/routes/llms[.]mdx.docs.$.ts src/lib/openapi/markdown.ts src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts`

### Task 1: Correct The Locale Switcher To A Site Switcher (`#52`)

**Files:**
- Modify: `src/components/docs-shell/DocsShell.tsx`
- Modify: `src/components/docs-shell/DocsShell.test.tsx`
- Modify: `src/lib/i18n/resources/en/common.ts`
- Modify: `src/lib/i18n/resources/zh-CN/common.ts`

- [ ] **Step 1: Write the failing tests for the revised switcher copy**

```tsx
it('renders the desktop switcher as a site switcher instead of a language toggle', async () => {
  renderDocsShell();

  const switcher = await within(
    screen.getByTestId('docs-main-header-row'),
  ).findByRole('button', {
    name: 'Site',
  });

  expect(switcher).toHaveTextContent('International site');

  fireEvent.click(switcher);

  expect(await screen.findByText('International site')).toBeInTheDocument();
  expect(screen.getByText('China site')).toBeInTheDocument();
  expect(
    screen.getByText('Product coverage differs between the two sites.'),
  ).toBeInTheDocument();
});

it('renders the mobile switcher with the same site-switch semantics', async () => {
  renderDocsShell();

  const buttons = screen.getAllByRole('button', { name: 'Site' });

  expect(buttons.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx`
Expected: FAIL because the current UI still exposes `Language`, `English`, and `简体中文`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
function LocaleSwitcher({
  currentLocale,
  localeLinks,
  onSelect,
  variant = 'all',
}: {
  currentLocale: AppLocale;
  localeLinks: LocaleLink[];
  onSelect: (locale: AppLocale) => Promise<void>;
  variant?: 'all' | 'desktop' | 'mobile';
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(currentLocale, 'common');

  return (
    <>
      {variant !== 'mobile' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('controls.site.label')}
              className="h-8 gap-1.5 rounded-md border border-transparent px-2.5 text-[13px] text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground data-[state=open]:border-border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              size="sm"
              variant="ghost"
            >
              <LanguagesIcon data-icon="inline-start" />
              <span>{t(siteLabelKeyByLocale[currentLocale])}</span>
              <ChevronDownIcon aria-hidden="true" className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            aria-label={t('controls.site.label')}
            className="w-56 rounded-lg p-1"
          >
            <div className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
              {t('controls.site.description')}
            </div>
            <LocaleOptions
              currentLocale={currentLocale}
              localeLinks={localeLinks}
              onSelect={onSelect}
              scopeKey="desktop"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {variant !== 'desktop' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('controls.site.label')}
              className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              size="icon"
              variant="ghost"
            >
              <LanguagesIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            aria-label={t('controls.site.label')}
            className="w-56 rounded-lg p-1"
          >
            <div className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
              {t('controls.site.description')}
            </div>
            <LocaleOptions
              currentLocale={currentLocale}
              localeLinks={localeLinks}
              onSelect={onSelect}
              scopeKey="mobile"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  );
}

const siteLabelKeyByLocale: Record<AppLocale, 'controls.site.international' | 'controls.site.china'> = {
  en: 'controls.site.international',
  'zh-CN': 'controls.site.china',
};
```

```ts
controls: {
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  site: {
    label: 'Site',
    description: 'Product coverage differs between the two sites.',
    international: 'International site',
    china: 'China site',
  },
},
```

```ts
controls: {
  theme: {
    label: '主题',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  },
  site: {
    label: '站点',
    description: '两个站点覆盖的产品范围并不完全相同。',
    international: '国际站',
    china: '中国站',
  },
},
```

```tsx
const label =
  locale === 'zh-CN'
    ? t('controls.site.china')
    : t('controls.site.international');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx`
Expected: PASS with the updated `Site` label and the revised menu copy.

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts
git commit -m "fix: clarify docs site switcher"
```

### Task 2: Reset Scroll Only On Cross-Page Navigation (`#53`)

**Files:**
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Modify: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Write the failing tests for page-to-page scroll reset**

```tsx
it('scrolls the active docs container to the top when a different docs page is rendered', async () => {
  const { rerender } = render(
    <AppProviders>
      <div
        data-testid="docs-main-desktop-scroll"
        style={{ height: 200, overflow: 'auto' }}
      >
        <DocsContent
          contentPath="en/introduction/about-agora.md"
          slug="about-agora"
          title="About Agora"
          toc={[]}
        />
      </div>
    </AppProviders>,
  );

  const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
  Object.defineProperty(scrollContainer, 'scrollTop', {
    configurable: true,
    value: 240,
    writable: true,
  });
  scrollContainer.scrollTo = vi.fn(({ top }) => {
    scrollContainer.scrollTop = top;
  });

  rerender(
    <AppProviders>
      <div
        data-testid="docs-main-desktop-scroll"
        style={{ height: 200, overflow: 'auto' }}
      >
        <DocsContent
          contentPath="en/introduction/quick-start.md"
          slug="quick-start"
          title="Quick Start"
          toc={[]}
        />
      </div>
    </AppProviders>,
  );

  await waitFor(() => {
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 0,
    });
  });
});

it('does not override hash scrolling when the route stays on the same docs page', async () => {
  window.history.replaceState(null, '', '/en/introduction/about-agora#overview');
  const syncSpy = vi.spyOn(
    await import('@/lib/docs-hash'),
    'syncDocsHashTargetFromLocation',
  );

  renderWithRouter(
    <DocsContent
      contentPath="en/introduction/about-agora.md"
      slug="about-agora"
      title="About Agora"
      toc={[]}
    />,
  );

  await waitFor(() => {
    expect(syncSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/docs-shell/DocsContent.test.tsx`
Expected: FAIL because no cross-page scroll reset is currently triggered from `DocsContent`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
```

```tsx
const MAIN_SCROLL_SELECTOR = '[data-testid="docs-main-desktop-scroll"]';
```

```tsx
  const pageScrollResetKey =
    resolvedBody?.kind === 'mdx'
      ? resolvedBody.contentPath
      : resolvedBody?.kind === 'openapi'
        ? `${slug ?? title ?? 'openapi'}::openapi`
        : undefined;
  const previousPageScrollResetKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!pageScrollResetKey) {
      return;
    }

    if (
      previousPageScrollResetKey.current &&
      previousPageScrollResetKey.current !== pageScrollResetKey
    ) {
      const scrollContainer = document.querySelector<HTMLElement>(
        MAIN_SCROLL_SELECTOR,
      );

      if (scrollContainer) {
        scrollContainer.scrollTo({
          behavior: 'auto',
          top: 0,
        });
      } else {
        window.scrollTo({
          behavior: 'auto',
          top: 0,
        });
      }
    }

    previousPageScrollResetKey.current = pageScrollResetKey;
  }, [pageScrollResetKey]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/components/docs-shell/DocsContent.test.tsx`
Expected: PASS with the new reset behavior only on cross-page navigation.

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx
git commit -m "fix: reset docs scroll on page navigation"
```

### Task 3: Fix API Reference Markdown Viewing (`#45`)

**Files:**
- Modify: `src/lib/source.server.ts`
- Modify: `src/lib/docs-page.server.test.ts`
- Modify: `src/routes/llms[.]mdx.docs.$.ts`
- Modify: `src/lib/openapi/markdown.ts`

- [ ] **Step 1: Write the failing tests for OpenAPI markdown URLs**

```ts
it('returns an llms markdown URL for ordinary docs pages', async () => {
  mockedGetPage.mockResolvedValueOnce({
    data: {
      description: 'Learn the platform basics.',
      title: 'About Agora',
    },
    path: 'en/introduction/about-agora.mdx',
    slugs: ['introduction', 'about-agora'],
    url: '/en/introduction/about-agora',
  });

  mockedGetPages.mockReturnValue([]);
  mockedGetPageTree.mockReturnValue(pageTree);
  mockedGetNodeMeta.mockReturnValue({});

  const payload = await loadDocsPagePayload({
    data: {
      locale: 'en',
      slugSegments: ['about-agora'],
      tab: 'introduction',
    },
  });

  expect(payload).toMatchObject({
    markdownUrl: '/llms.mdx/docs/en/introduction/about-agora.md',
  });
});

it('returns an llms markdown URL for API reference pages using the route slug, not the source yaml path', async () => {
  mockedGetPage.mockResolvedValueOnce({
    data: {
      description: 'Start a conversational AI agent.',
      getClientAPIPageProps: vi.fn().mockResolvedValue({ operations: [] }),
      title: 'Start a conversational AI agent',
    },
    path: 'en/api-reference/conversational-ai/rest-api/agent/join.md',
    slugs: ['api-reference', 'conversational-ai', 'rest-api', 'agent', 'join'],
    type: 'openapi',
    url: '/en/api-reference/conversational-ai/rest-api/agent/join',
  });

  mockedGetPages.mockReturnValue([]);
  mockedGetPageTree.mockReturnValue(pageTree);
  mockedGetNodeMeta.mockReturnValue({});

  const payload = await loadDocsPagePayload({
    data: {
      locale: 'en',
      slugSegments: ['conversational-ai', 'rest-api', 'agent', 'join'],
      tab: 'api-reference',
    },
  });

  expect(payload).toMatchObject({
    markdownUrl:
      '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md',
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/lib/docs-page.server.test.ts`
Expected: FAIL if the current URL builder leaks `.mdx` or source-path assumptions that break API reference markdown requests.

- [ ] **Step 3: Write the minimal implementation**

```ts
function normalizeMarkdownSegments(page: InferPageType<typeof source>) {
  const routeSegments = page.url.split('/').filter(Boolean);

  if (routeSegments.length === 0) {
    return [];
  }

  const leaf = routeSegments.at(-1);

  if (!leaf) {
    return routeSegments;
  }

  routeSegments[routeSegments.length - 1] = `${leaf}.md`;

  return routeSegments;
}

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const segments = normalizeMarkdownSegments(page);

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}
```

```ts
export async function GET({ params }: { params: { _splat?: string } }) {
  const path = params._splat ?? '';

  const openApiMarkdown = await getOpenApiMarkdownByContentPath(path);

  if (openApiMarkdown) {
    return new Response(openApiMarkdown, {
      headers: {
        'Content-Type': 'text/markdown',
      },
    });
  }

  const page = docs.getPage(path);

  if (!page) {
    throw notFound();
  }

  return new Response(await page.data.getText('processed'), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}
```

```ts
if (
  (locale !== 'en' && locale !== 'zh-CN') ||
  tab !== 'api-reference' ||
  fileName?.endsWith('.md') !== true
) {
  return null;
}
```

The key rule for this task: keep OpenAPI markdown generation on `getOpenApiMarkdownByContentPath()` and only normalize the published URL contract so API-reference markdown links resolve to that existing path correctly.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/lib/docs-page.server.test.ts`
Expected: PASS with stable `.md` URLs for both ordinary docs pages and API reference pages.

- [ ] **Step 5: Run focused integration verification**

Run: `bun run test src/components/docs-shell/DocsContent.test.tsx src/lib/docs-page.server.test.ts`
Expected: PASS, including the existing `View as Markdown` assertions.

- [ ] **Step 6: Commit**

```bash
git add src/lib/source.server.ts src/lib/docs-page.server.test.ts src/routes/llms[.]mdx.docs.$.ts src/lib/openapi/markdown.ts
git commit -m "fix: repair api reference markdown links"
```

### Task 4: Final Verification And Cleanup

**Files:**
- Modify: none
- Test: `src/components/docs-shell/DocsShell.test.tsx`
- Test: `src/components/docs-shell/DocsContent.test.tsx`
- Test: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Run the focused issue test suite**

Run: `bun run test src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/docs-page.server.test.ts`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `bun run types:check`
Expected: PASS

- [ ] **Step 3: Run Biome on touched files**

Run: `bunx biome check src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/source.server.ts src/lib/docs-page.server.test.ts src/routes/llms[.]mdx.docs.$.ts src/lib/openapi/markdown.ts src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts`
Expected: PASS

- [ ] **Step 4: Check whitespace and patch hygiene**

Run: `git diff --check`
Expected: no output

- [ ] **Step 5: Commit the verification-safe final state**

```bash
git status --short
git add src/components/docs-shell/DocsShell.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/source.server.ts src/lib/docs-page.server.test.ts src/routes/llms[.]mdx.docs.$.ts src/lib/openapi/markdown.ts src/lib/i18n/resources/en/common.ts src/lib/i18n/resources/zh-CN/common.ts
git commit -m "fix: resolve docs shell issue batch"
```

## Self-Review

- Spec coverage:
  - `#52` is covered by Task 1.
  - `#53` is covered by Task 2.
  - `#45` is covered by Task 3.
  - Repo-level verification is covered by Task 4.
- Placeholder scan:
  - No `TODO`, `TBD`, or “similar to task N” placeholders remain.
  - Every implementation task includes concrete code and exact commands.
- Type consistency:
  - `LocaleSwitcher` keeps `AppLocale` and `LocaleLink` unchanged.
  - Scroll reset logic keys off `contentPath` for MDX and a string key for OpenAPI, which matches current `DocsContentBodyPayload`.
  - Markdown URL generation stays on `getPageMarkdownUrl()` and `getOpenApiMarkdownByContentPath()` without inventing a second export path.

Plan complete and saved to `docs/superpowers/plans/2026-06-11-docs-shell-and-markdown-issues.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
