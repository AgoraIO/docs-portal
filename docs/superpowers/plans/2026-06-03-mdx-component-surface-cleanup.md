# MDX Component Surface Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the `062d6052337ca286ea4dfd6af0b75f04a9bd7ed6` MDX styling intent while reducing normal docs content to Markdown/Fumadocs-native components and isolating editorial overview custom components.

**Architecture:** Treat `src/components/mdx.tsx` as the narrow MDX runtime registry for common docs primitives only: link normalization plus repo-local shadcn/radix wrappers for Fumadocs/core outputs such as normal tabs, generated code tabs, fenced code blocks, copy buttons, and links. Move editorial overview decorative components into a separate `src/components/docs-overview/mdx-components.tsx` registry and inject them only for allowlisted human-written overview pages. Keep quickstarts, how-to guides, API reference parent pages, generated API docs, and migrated reference content mostly Markdown/Fumadocs-native.

**Tech Stack:** Fumadocs MDX (`fumadocs-mdx`, `fumadocs-ui/mdx`, `fumadocs-core` code-tab generation), React 19, TanStack Start/Vite, Tailwind CSS v4, shadcn/radix local primitives, Vitest, Biome.

---

## File Structure

- Modify: `src/components/mdx.tsx`
  - Responsibility: common MDX component map only. It should compose Fumadocs UI defaults, repo-local anchor normalization, and shadcn/radix wrappers for tabs, generated code tabs, fenced code blocks, copy buttons, and tab persistence.
- Create: `src/components/docs-overview/mdx-components.tsx`
  - Responsibility: decorative editorial overview MDX widgets only, such as `SolutionCardGrid`, `SolutionCard`, `OverviewToolkits`, `ToolkitGroup`, `ToolkitItem`, `OverviewSpotlightGrid`, and `OverviewSpotlightCard`.
- Modify: `src/components/mdx.test.tsx`
  - Responsibility: tests for common MDX registry behavior: links, tabs persistence, Fumadocs code block exposure, and absence of decorative implementation details in the common path.
- Create: `src/components/docs-overview/mdx-components.test.tsx`
  - Responsibility: tests for editorial overview-only widgets.
- Modify: `src/styles/app.css`
  - Responsibility: global theme tokens, prose styling, docs shell layout, transient scrollbars, and minimal Fumadocs/shadcn integration. The file is currently too large and must be aggressively reduced; MDX widgets, overview cards, callouts, custom code blocks, and decorative page components must not keep selector-heavy CSS here.
- Modify regular docs content:
  - `content/docs/en/api-reference/rtc/index.mdx`
  - `content/docs/zh-CN/api-reference/rtc/index.mdx`
  - `content/docs/en/introduction/get-started/start-with-ai.mdx`
  - Responsibility: remove decorative custom MDX from API reference parent pages and quickstart/how-to pages only when the component is acting as layout decoration rather than content.
- Allowlist editorial overview content:
  - `content/docs/en/introduction/index.mdx`
  - `content/docs/en/introduction/about-agora.mdx`
  - `content/docs/zh-CN/introduction/about-agora.mdx`
  - `content/docs/en/introduction/conversational-ai.mdx`
  - `content/docs/en/introduction/realtime-audio-video.mdx`
  - `content/docs/en/introduction/messaging-presence.mdx`
  - `content/docs/en/introduction/cloud-media-services.mdx`
  - `content/docs/en/solutions/index.mdx`
  - `content/docs/zh-CN/solutions/index.mdx`
  - Responsibility: continue to use overview widgets from the new overview registry because these pages are human-authored editorial overview pages.
- Modify: `.agents/skills/fumadocs-migration/SKILL.md`
  - Responsibility: encode the new standards: Markdown native first, Fumadocs UI tabs/code first, overview widgets only on approved editorial overview pages, no CSS-only custom component skins in `app.css`.

## Known Findings To Preserve

- `062d6052337ca286ea4dfd6af0b75f04a9bd7ed6` introduced the current theme, prose, MDX, code, tabs, and migration skill baseline.
- Current local Fumadocs UI package already exports `defaultMdxComponents` from `fumadocs-ui/mdx`, plus `Tabs` from `fumadocs-ui/components/tabs` and `CodeBlock*` from `fumadocs-ui/components/codeblock`.
- `Tabs` is widely used in normal docs and must remain a supported common MDX primitive.
- `SolutionCard*` is currently used only in `content/docs/en/solutions/index.mdx` and `content/docs/zh-CN/solutions/index.mdx`.
- `OverviewSpotlight*`, `OverviewToolkits`, `Toolkit*`, `CardGrid`, and `FeatureCard` appear in human-authored introduction overview pages. These are acceptable only when the page is explicitly allowlisted as editorial overview content; they should not be globally available to ordinary docs.
- The current working tree is dirty from a prior attempted style fix. Execution must inspect and either keep, replace, or discard those hunks deliberately. Do not commit them blindly.

---

### Task 1: Freeze The Regression Surface

**Files:**
- Modify: `src/components/mdx.test.tsx`
- Create: `src/components/docs-overview/mdx-components.test.tsx`
- Test: `src/components/mdx.test.tsx`
- Test: `src/components/docs-overview/mdx-components.test.tsx`

- [ ] **Step 1: Record the current dirty diff before editing**

Run:

```bash
git status --short
git diff -- src/components/mdx.tsx src/styles/app.css src/components/docs-shell/DocsContentBody.client.tsx src/components/docs-shell/DocsSidebarTree.tsx
```

Expected:

```text
The command shows the current uncommitted files and the temporary MDX/sidebar/body edits from the prior investigation.
```

- [ ] **Step 2: Write tests that define the common MDX registry**

In `src/components/mdx.test.tsx`, replace brittle custom style-class assertions with behavior and dependency assertions:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from './mdx';

type TabsComponent = ComponentType<{
  children: ReactNode;
  defaultValue?: string;
  groupId?: string;
  persist?: boolean;
  value?: string;
}>;
type TabsChildComponent = ComponentType<{
  children: ReactNode;
  value: string;
}>;
type AnchorComponent = ComponentType<{
  children: ReactNode;
  href: string;
}>;

describe('common MDX registry', () => {
  it('keeps relative docs links normalized', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    render(<Anchor href="get-started/quickstart.md">Quickstart</Anchor>);

    expect(screen.getByRole('link', { name: 'Quickstart' })).toHaveAttribute(
      'href',
      '/en/ai/get-started/quickstart',
    );
  });

  it('exposes Fumadocs code block tab components for generated code tabs', () => {
    const components = getMDXComponents();

    expect(components.CodeBlockTabs).toBeDefined();
    expect(components.CodeBlockTabsList).toBeDefined();
    expect(components.CodeBlockTabsTrigger).toBeDefined();
    expect(components.CodeBlockTab).toBeDefined();
    expect(components.pre).toBeDefined();
  });

  it('keeps grouped MDX tabs persistent without custom platform tabs', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    const { unmount } = render(
      <Tabs defaultValue="android" groupId="platform" persist>
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iOS</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="ios">iOS instructions</TabsContent>
      </Tabs>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'iOS' }));
    expect(window.localStorage.getItem('docs-tabs:platform')).toBe('ios');

    unmount();

    render(
      <Tabs defaultValue="android" groupId="platform" persist>
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iOS</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="ios">iOS instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('does not expose overview-only widgets from the common registry by default', () => {
    const components = getMDXComponents();

    expect(components.SolutionCard).toBeUndefined();
    expect(components.SolutionCardGrid).toBeUndefined();
    expect(components.OverviewSpotlightGrid).toBeUndefined();
    expect(components.OverviewToolkits).toBeUndefined();
  });
});
```

- [ ] **Step 3: Write tests for overview-only widgets**

Create `src/components/docs-overview/mdx-components.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getOverviewMDXComponents } from './mdx-components';

describe('overview MDX components', () => {
  it('renders solution cards as index-page widgets', () => {
    const components = getOverviewMDXComponents();
    const SolutionCardGrid = components.SolutionCardGrid;
    const SolutionCard = components.SolutionCard;

    render(
      <SolutionCardGrid>
        <SolutionCard
          description="Build realtime voice experiences."
          href="/en/solutions/voice"
          icon="rtc"
          tags={['Voice', 'RTC']}
          title="Voice Calling"
          tone="blue"
        />
      </SolutionCardGrid>,
    );

    expect(screen.getByRole('link', { name: /Voice Calling/i })).toHaveAttribute(
      'href',
      '/en/solutions/voice',
    );
    expect(screen.getByText('Build realtime voice experiences.')).toBeVisible();
    expect(screen.getByText('Voice')).toBeVisible();
  });

  it('renders toolkit groups for the docs home index', () => {
    const components = getOverviewMDXComponents();
    const OverviewToolkits = components.OverviewToolkits;
    const ToolkitGroup = components.ToolkitGroup;
    const ToolkitItem = components.ToolkitItem;

    render(
      <OverviewToolkits>
        <ToolkitGroup title="Agent frameworks">
          <ToolkitItem href="/en/ai/get-started/quickstart" icon="python" label="Python" />
        </ToolkitGroup>
      </OverviewToolkits>,
    );

    expect(screen.getByText('Agent frameworks')).toBeVisible();
    expect(screen.getByRole('link', { name: /Python/i })).toHaveAttribute(
      'href',
      '/en/ai/get-started/quickstart',
    );
  });
});
```

- [ ] **Step 4: Run tests to verify they fail for the right reasons**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx src/components/docs-overview/mdx-components.test.tsx
```

Expected:

```text
src/components/mdx.test.tsx fails because overview widgets are still exported from src/components/mdx.tsx.
src/components/docs-overview/mdx-components.test.tsx fails because src/components/docs-overview/mdx-components.tsx does not exist.
```

---

### Task 2: Split Common MDX From Overview Widgets

**Files:**
- Modify: `src/components/mdx.tsx`
- Create: `src/components/docs-overview/mdx-components.tsx`
- Test: `src/components/mdx.test.tsx`
- Test: `src/components/docs-overview/mdx-components.test.tsx`

- [ ] **Step 1: Create the overview component registry**

Create `src/components/docs-overview/mdx-components.tsx` with Tailwind classes inline. Move only the decorative components from `src/components/mdx.tsx`: `SolutionCardGrid`, `SolutionCard`, `OverviewToolkits`, `ToolkitGroup`, `ToolkitItem`, `OverviewSpotlightGrid`, and `OverviewSpotlightCard`.

The top-level export shape must be:

```tsx
import {
  AppWindowIcon,
  ArrowRightIcon,
  AudioLinesIcon,
  BlocksIcon,
  BotIcon,
  Code2Icon,
  CuboidIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  SmartphoneChargingIcon,
  TerminalSquareIcon,
  ZapIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/cn';

export function getOverviewMDXComponents(): MDXComponents {
  return {
    OverviewSpotlightCard,
    OverviewSpotlightGrid,
    OverviewToolkits,
    SolutionCard,
    SolutionCardGrid,
    ToolkitGroup,
    ToolkitItem,
  } satisfies MDXComponents;
}
```

Use Tailwind classes directly on each returned element. Do not use CSS selectors named `.solution-card`, `.overview-spotlight-*`, or `.overview-toolkits-*`.

- [ ] **Step 2: Reduce `src/components/mdx.tsx` to common components**

Modify `getMDXComponents()` to compose Fumadocs UI defaults and local link normalization:

```tsx
import defaultMdxComponents from 'fumadocs-ui/mdx';
import {
  Tabs as FumaTabs,
  TabsContent as FumaTabsContent,
  TabsList as FumaTabsList,
  TabsTrigger as FumaTabsTrigger,
} from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import {
  type AnchorHTMLAttributes,
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { normalizeDocsHref } from '@/lib/docs-link-normalize';

type MDXContext = {
  contentPath?: string;
};

type PersistableTabsProps = React.ComponentProps<typeof FumaTabs> & {
  groupId?: string;
  persist?: boolean;
};

function Tabs(props: PersistableTabsProps) {
  const { className, groupId, persist, ...tabsProps } = props;
  const defaultValue =
    props.defaultValue ??
    props.value ??
    getFirstTabsTriggerValue(props.children);
  const tabState = usePersistentTabsValue({
    ...props,
    defaultValue,
    groupId,
    persist,
  });

  return (
    <FumaTabs
      className={cn(className)}
      {...tabsProps}
      {...tabState}
      data-tabs-group-id={groupId}
      data-tabs-persist={persist ? 'true' : undefined}
    />
  );
}

function TabsList(props: React.ComponentProps<typeof FumaTabsList>) {
  return <FumaTabsList {...props} />;
}

function TabsTrigger(props: React.ComponentProps<typeof FumaTabsTrigger>) {
  const { onClick, ...triggerProps } = props;

  return (
    <FumaTabsTrigger
      onClick={(event) => {
        persistTabsTriggerValue(event, props.value);
        onClick?.(event);
      }}
      {...triggerProps}
    />
  );
}

function TabsContent(props: React.ComponentProps<typeof FumaTabsContent>) {
  return <FumaTabsContent {...props} />;
}

export function getMDXComponents(
  components?: MDXComponents,
  context?: MDXContext,
) {
  return {
    ...defaultMdxComponents,
    a: createDocsAnchor(context?.contentPath),
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ...components,
  } satisfies MDXComponents;
}
```

Keep the existing `getTabsTriggerValues`, `usePersistentTabsValue`, `persistTabsTriggerValue`, and `createDocsAnchor` helpers, but delete local `Pre`, `CommandBlock`, `CodeBlockTabs*`, `Callout*`, `CardGrid`, `FeatureCard`, `SolutionCard*`, `Overview*`, and icon helper implementations from this file.

- [ ] **Step 3: Run focused MDX tests**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx src/components/docs-overview/mdx-components.test.tsx
```

Expected:

```text
Both test files pass.
```

- [ ] **Step 4: Commit the split**

Run:

```bash
git add src/components/mdx.tsx src/components/mdx.test.tsx src/components/docs-overview/mdx-components.tsx src/components/docs-overview/mdx-components.test.tsx
git commit -m "refactor: split overview mdx components from common mdx"
```

---

### Task 3: Scope Decorative MDX To Editorial Pages

**Files:**
- Modify: `content/docs/en/api-reference/rtc/index.mdx`
- Modify: `content/docs/zh-CN/api-reference/rtc/index.mdx`
- Modify: `content/docs/en/introduction/get-started/start-with-ai.mdx`

- [ ] **Step 1: Keep editorial overview pages as MDX but do not globalize their components**

Do not rewrite these human-authored editorial overview pages to plain Markdown just to remove components:

```text
content/docs/en/introduction/index.mdx
content/docs/en/introduction/about-agora.mdx
content/docs/zh-CN/introduction/about-agora.mdx
content/docs/en/introduction/conversational-ai.mdx
content/docs/en/introduction/realtime-audio-video.mdx
content/docs/en/introduction/messaging-presence.mdx
content/docs/en/introduction/cloud-media-services.mdx
content/docs/en/solutions/index.mdx
content/docs/zh-CN/solutions/index.mdx
```

Instead, keep their MDX component syntax and make the components Tailwind-only in `src/components/docs-overview/mdx-components.tsx`.

- [ ] **Step 2: Replace RTC API reference cards with Markdown links**

In `content/docs/en/api-reference/rtc/index.mdx`, replace:

```mdx
<CardGrid>
  <FeatureCard title="Android API Reference">
    Browse the Android RTC API reference for the current version.
  </FeatureCard>
</CardGrid>
```

with:

```md
## Platforms

- [Android API Reference](android): Browse the Android RTC API reference for the current version.
```

In `content/docs/zh-CN/api-reference/rtc/index.mdx`, use:

```md
## 平台

- [Android API Reference](android)：查看当前版本的 Android RTC API Reference。
```

- [ ] **Step 3: Convert non-editorial spotlight grids to Markdown sections**

In `content/docs/en/introduction/get-started/start-with-ai.mdx`, convert `OverviewSpotlightGrid` to a normal link list because this is a how-to/get-started page, not an editorial product overview page:

```md
## Related paths

- [Voice agent quickstart](/en/ai/choose-your-path/quickstart-coding): Set up a working voice agent with Agora CLI.
- [Build a backend and client](/en/ai/build/build-server-client): Implement the server and client path directly.
```

- [ ] **Step 4: Verify only allowlisted editorial pages import overview widgets**

Run:

```bash
rg -n "<(CardGrid|FeatureCard|OverviewSpotlightGrid|OverviewSpotlightCard|OverviewToolkits|ToolkitGroup|ToolkitItem|SolutionCardGrid|SolutionCard)\\b" content/docs \
  | rg -v "content/docs/en/introduction/index\\.mdx|content/docs/en/introduction/about-agora\\.mdx|content/docs/zh-CN/introduction/about-agora\\.mdx|content/docs/en/introduction/conversational-ai\\.mdx|content/docs/en/introduction/realtime-audio-video\\.mdx|content/docs/en/introduction/messaging-presence\\.mdx|content/docs/en/introduction/cloud-media-services\\.mdx|content/docs/en/solutions/index\\.mdx|content/docs/zh-CN/solutions/index\\.mdx"
```

Expected:

```text
No output.
```

- [ ] **Step 5: Commit the content cleanup**

Run:

```bash
git add content/docs
git commit -m "refactor: scope overview mdx content"
```

---

### Task 4: Wire Overview Components Only Into Editorial Overview Pages

**Files:**
- Modify: `src/components/docs-shell/DocsContentBody.client.tsx`
- Modify: `src/components/docs-shell/DocsContentBody.client.test.tsx`
- Modify: `content/docs/en/introduction/index.mdx`
- Modify: `content/docs/en/introduction/about-agora.mdx`
- Modify: `content/docs/zh-CN/introduction/about-agora.mdx`
- Modify: `content/docs/en/introduction/conversational-ai.mdx`
- Modify: `content/docs/en/introduction/realtime-audio-video.mdx`
- Modify: `content/docs/en/introduction/messaging-presence.mdx`
- Modify: `content/docs/en/introduction/cloud-media-services.mdx`
- Modify: `content/docs/en/solutions/index.mdx`
- Modify: `content/docs/zh-CN/solutions/index.mdx`

- [ ] **Step 1: Add route-aware overview component injection**

Modify `src/components/docs-shell/DocsContentBody.client.tsx`:

```tsx
'use client';

import { getMDXComponents } from '@/components/mdx';
import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { useDocsContent } from '@/lib/source.client';

function isOverviewContentPath(contentPath: string) {
  return new Set([
    'en/introduction/index.mdx',
    'en/introduction/about-agora.mdx',
    'zh-CN/introduction/about-agora.mdx',
    'en/introduction/conversational-ai.mdx',
    'en/introduction/realtime-audio-video.mdx',
    'en/introduction/messaging-presence.mdx',
    'en/introduction/cloud-media-services.mdx',
    'en/solutions/index.mdx',
    'zh-CN/solutions/index.mdx',
  ]).has(contentPath);
}

export function DocsContentBodyClient({
  contentPath,
}: {
  contentPath: string;
}) {
  const content = useDocsContent(contentPath, {
    components: getMDXComponents(
      isOverviewContentPath(contentPath) ? getOverviewMDXComponents() : undefined,
      { contentPath },
    ),
  });

  return <div className="docs-body">{content}</div>;
}
```

- [ ] **Step 2: Test that overview components are injected only for index paths**

Update `src/components/docs-shell/DocsContentBody.client.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocsContentBodyClient } from './DocsContentBody.client';

const useDocsContentMock = vi.fn();

vi.mock('@/lib/source.client', () => ({
  useDocsContent: (...args: unknown[]) => useDocsContentMock(...args),
}));

describe('DocsContentBodyClient', () => {
  it('wraps hydrated MDX content with the docs body styling hook', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Install the Agora CLI.</p>);

    const { container } = render(
      <DocsContentBodyClient contentPath="en/ai/choose-your-path/quickstart-coding.mdx" />,
    );

    expect(container.querySelector('.docs-body')).toContainElement(
      screen.getByText('Install the Agora CLI.'),
    );
  });

  it('injects overview widgets only for approved editorial overview pages', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Overview</p>);

    render(<DocsContentBodyClient contentPath="en/introduction/about-agora.mdx" />);

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.FeatureCard).toBeDefined();
    expect(options.components.OverviewSpotlightGrid).toBeDefined();
  });

  it('does not inject overview widgets into regular docs pages', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Regular page</p>);

    render(
      <DocsContentBodyClient contentPath="en/ai/choose-your-path/quickstart-coding.mdx" />,
    );

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.SolutionCard).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run focused docs body tests**

Run:

```bash
bunx vitest run src/components/docs-shell/DocsContentBody.client.test.tsx
```

Expected:

```text
All tests pass.
```

- [ ] **Step 4: Commit route-aware injection**

Run:

```bash
git add src/components/docs-shell/DocsContentBody.client.tsx src/components/docs-shell/DocsContentBody.client.test.tsx
git commit -m "refactor: scope overview mdx widgets to index pages"
```

---

### Task 5: Collapse MDX CSS Into Tailwind And Theme Tokens

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/components/docs-overview/mdx-components.tsx`
- Modify: `src/components/mdx.tsx`
- Test: `src/components/mdx.test.tsx`
- Test: `src/components/docs-overview/mdx-components.test.tsx`

- [ ] **Step 1: Classify every `app.css` section before deleting**

Run:

```bash
nl -ba src/styles/app.css | sed -n '1,220p'
nl -ba src/styles/app.css | sed -n '220,520p'
nl -ba src/styles/app.css | sed -n '520,920p'
nl -ba src/styles/app.css | sed -n '920,1260p'
nl -ba src/styles/app.css | sed -n '1260,1660p'
nl -ba src/styles/app.css | sed -n '1660,1940p'
```

Classify sections into exactly these buckets:

```text
KEEP: global theme tokens, Tailwind theme mappings, base html/body, prose typography, docs shell layout, transient scrollbar, OpenAPI operation shell, shadcn sidebar token bridge.
MOVE: overview/index widgets that still need rich layout; move styling into src/components/docs-overview/mdx-components.tsx Tailwind classes.
DELETE: custom MDX code block skin, custom MDX tabs skin, custom callout skin, custom card grid/card skin, overview/solution selector skins, duplicate compatibility selectors for local components that no longer exist.
REVIEW: any selector still referenced by content or runtime after Tasks 2-4.
```

After classification, write the result into the implementation notes section of the PR or commit message. Do not preserve a selector because it “might be used”; prove it with `rg`.

- [ ] **Step 2: Remove custom MDX component CSS selectors from `app.css`**

Delete selector blocks for:

```text
.docs-code-block-root
.docs-code-block-header
.docs-code-block-icon
.docs-code-block-title
.docs-code-copy-button
.docs-mdx-tabs
.docs-code-tabs
.docs-code-tabs-list
.docs-code-tabs-trigger
.docs-code-tabs-content
.docs-card-grid
.docs-card
.docs-card-body
.docs-callout
.docs-callout-icon
.docs-callout-title
.docs-callout-body
.solution-card-grid
.solution-card
.solution-card-*
.overview-toolkits
.overview-toolkits-*
.overview-spotlight-grid
.overview-spotlight-*
```

Keep prose and shell selectors:

```text
.prose
.docs-body
.docs-scrollbar
.openapi-operation
```

- [ ] **Step 3: Remove obsolete component-local CSS variables**

Remove variables that are only used by deleted CSS blocks:

```text
--docs-code-pad-y
--docs-code-pad-x
--docs-code-pad-top
--docs-code-pad-right
--docs-code-pad-bottom
--docs-code-pad-left
--docs-code-line-height
--docs-code-line-number-width
--docs-code-line-gap
--docs-callout-accent
--docs-callout-bg
--docs-callout-border
```

Keep global shell/theme tokens that still serve app layout and shadcn/Fumadocs integration:

```text
--bg
--bg-card
--bg-elev
--bg-sunken
--ink-1
--ink-2
--ink-3
--ink-4
--line
--line-strong
--accent-brand
--accent-brand-soft
--accent-brand-ring
--docs-shadow-sm
--docs-shadow-md
--content-max
--docs-header-h
--docs-tabs-h
--color-fd-*
--sidebar-*
```

- [ ] **Step 4: Move retained rich overview styling into Tailwind component classes**

In `src/components/docs-overview/mdx-components.tsx`, ensure every visual style is expressed in `className` strings. Example:

```tsx
function SolutionCardGrid({
  children,
  size = 'large',
}: {
  children: ReactNode;
  size?: 'large' | 'small';
}) {
  return (
    <section
      className={cn(
        'not-prose grid gap-4',
        size === 'small'
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2',
      )}
    >
      {children}
    </section>
  );
}
```

- [ ] **Step 5: Assert `app.css` did not remain a dumping ground**

Run:

```bash
wc -l src/styles/app.css
rg -n "\\.(docs-code-block-root|docs-code-tabs|docs-mdx-tabs|docs-card|solution-card|overview-spotlight|overview-toolkits|docs-callout)" src/styles/app.css
rg -n -- "--docs-code|--docs-callout|--solution|--overview" src/styles/app.css
```

Expected:

```text
wc -l should be materially lower than the current roughly 1900-line file. Treat anything above 1100 lines as a failed cleanup unless a reviewer-approved KEEP section explains it.
The two rg commands should print no output.
```

- [ ] **Step 6: Run style and component tests**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx src/components/docs-overview/mdx-components.test.tsx
bunx biome check src/components/mdx.tsx src/components/docs-overview/mdx-components.tsx src/styles/app.css
```

Expected:

```text
Vitest passes.
Biome reports no errors.
```

- [ ] **Step 7: Commit CSS cleanup**

Run:

```bash
git add src/styles/app.css src/components/docs-overview/mdx-components.tsx src/components/mdx.tsx src/components/mdx.test.tsx src/components/docs-overview/mdx-components.test.tsx
git commit -m "refactor: move mdx widget styling to tailwind"
```

---

### Task 6: Restore Sidebar And Body Regression Fixes Cleanly

**Files:**
- Modify: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify: `src/components/docs-shell/DocsSidebarTree.test.tsx`
- Modify: `src/components/docs-shell/DocsContentBody.client.tsx`
- Modify: `src/components/docs-shell/DocsContentBody.client.test.tsx`

- [ ] **Step 1: Keep ordinary sidebar items compact and OpenAPI endpoints flexible**

In `src/components/docs-shell/DocsSidebarTree.tsx`, keep these class constants:

```tsx
const sidebarToggleClassName =
  'h-[30px] items-center justify-between rounded-[7px] px-3 text-[13.5px] font-medium text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]';

const sidebarSubButtonClassName =
  'h-[30px] rounded-[7px] px-3 text-[13px] text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:text-[color:var(--accent-brand)]';

const sidebarPageButtonClassName =
  'relative h-[30px] items-center rounded-[7px] px-3 text-[13.5px] font-medium text-[color:var(--ink-3)] before:absolute before:left-1 before:top-1/2 before:h-3.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:text-[color:var(--accent-brand)] data-[active=true]:before:bg-[color:var(--accent-brand)]';

const openApiSidebarButtonClassName =
  'h-auto min-h-[30px] items-start overflow-visible py-1.5';
```

- [ ] **Step 2: Keep `.docs-body` wrapper**

`src/components/docs-shell/DocsContentBody.client.tsx` must return:

```tsx
return <div className="docs-body">{content}</div>;
```

- [ ] **Step 3: Run focused shell tests**

Run:

```bash
bunx vitest run src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsContentBody.client.test.tsx
```

Expected:

```text
Both test files pass.
```

- [ ] **Step 4: Commit shell regression fixes**

Run:

```bash
git add src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsContentBody.client.tsx src/components/docs-shell/DocsContentBody.client.test.tsx
git commit -m "fix: restore compact docs sidebar and body styling hook"
```

---

### Task 7: Update The Fumadocs Migration Skill

**Files:**
- Modify: `.agents/skills/fumadocs-migration/SKILL.md`
- Test: `.agents/skills/fumadocs-migration/SKILL.md`

- [ ] **Step 1: Add the MDX component surface rules**

Add these hard rules to `.agents/skills/fumadocs-migration/SKILL.md` under `## Hard Rules`:

```md
- Normal docs pages must be Markdown-native first. Do not introduce decorative MDX widgets for ordinary prose, quickstarts, guides, or API reference parent pages.
- Common MDX components must come from Fumadocs UI or the repo shadcn/radix primitives. Do not hand-roll tabs, code blocks, callouts, or cards when Fumadocs UI already provides them.
- `src/components/mdx.tsx` is the common MDX registry only: Fumadocs defaults, link normalization, and approved shared behavior such as persistent tabs.
- Editorial overview components must live outside the common MDX registry, currently in `src/components/docs-overview/mdx-components.tsx`, use Tailwind classes for styling, and may only be injected for approved human-authored overview routes.
- Component styling should use Tailwind classes colocated with the component. Do not add large selector-based MDX widget skins to `src/styles/app.css`.
- Global CSS custom properties are reserved for theme, shell layout, shadcn, and Fumadocs integration tokens. Remove component-local CSS variables when the component can express the style with Tailwind.
```

- [ ] **Step 2: Add a migration workflow check**

Add this step to `## Workflow` after the classification step:

```md
Before preserving any JSX component in migrated content, classify it as one of:
common Fumadocs UI primitive, approved editorial overview widget, or content that should be rewritten to native Markdown. If it is not one of the first two, rewrite it to native Markdown.
```

- [ ] **Step 3: Verify the skill wording**

Run:

```bash
rg -n "Normal docs pages must be Markdown-native first|Editorial overview components|Fumadocs UI primitive" .agents/skills/fumadocs-migration/SKILL.md
```

Expected:

```text
The command prints all newly added rules and the workflow classification sentence.
```

- [ ] **Step 4: Commit skill update**

Run:

```bash
git add .agents/skills/fumadocs-migration/SKILL.md
git commit -m "docs: document mdx component migration standards"
```

---

### Task 8: Full Verification On Port 3000

**Files:**
- No code changes unless verification exposes a regression.

- [ ] **Step 1: Run compile and test gates**

Run:

```bash
bun run types:check
bunx vitest run src/components/mdx.test.tsx src/components/docs-overview/mdx-components.test.tsx src/components/docs-shell/DocsContentBody.client.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx
bun run build
```

Expected:

```text
types:check exits 0.
Vitest exits 0.
build exits 0.
```

- [ ] **Step 2: Use the user's existing port 3000 for browser validation**

Open these URLs on the already-running dev server:

```text
http://127.0.0.1:3000/en/ai/choose-your-path/quickstart-coding
http://127.0.0.1:3000/en/api-reference/rtc
http://127.0.0.1:3000/en/solutions
```

For `/en/ai/choose-your-path/quickstart-coding`, verify:

```js
({
  docsBodyCount: document.querySelectorAll('.docs-body').length,
  tabs: Boolean(document.querySelector('[role="tablist"]')),
  codeBlock: Boolean(document.querySelector('figure.shiki, [data-component-part="code-block-root"], .shiki')),
  inlineCodeText: document.querySelector('.prose p code, .prose li code')?.textContent ?? null,
})
```

Expected:

```js
{
  docsBodyCount: 2,
  tabs: true,
  codeBlock: true,
  inlineCodeText: "agora"
}
```

For `/en/api-reference/rtc`, verify:

```js
Array.from(document.querySelectorAll('a')).filter((link) =>
  link.textContent?.includes('Android API Reference')
).map((link) => link.getAttribute('href'))
```

Expected:

```js
["/en/api-reference/rtc/android"]
```

For `/en/solutions`, verify:

```js
Boolean(document.querySelector('[data-overview-component="solution-card-grid"]'))
```

Expected:

```js
true
```

- [ ] **Step 3: Check no stale MDX widget CSS remains**

Run:

```bash
rg -n "\\.(docs-code-block-root|docs-code-tabs|docs-mdx-tabs|docs-card|solution-card|overview-spotlight|overview-toolkits|docs-callout)" src/styles/app.css
```

Expected:

```text
No output.
```

- [ ] **Step 4: Final commit if verification required small fixes**

If verification required edits, run:

```bash
git add src content .agents/skills/fumadocs-migration/SKILL.md
git commit -m "fix: complete mdx component cleanup verification"
```

If no edits were required, do not create an empty commit.

---

## Self-Review

- Spec coverage:
  - Full MDX component audit: Task 1 and Known Findings.
  - Tabs/code style regression: Tasks 1, 2, 5, and 8.
  - Avoid many custom components in ordinary docs: Tasks 2 and 3.
  - Move editorial overview special components out of `mdx.tsx`: Tasks 2 and 4.
  - Remove selector-heavy CSS and component-local CSS variables: Task 5.
  - Update `.agents/skills/fumadocs-migration`: Task 7.
  - Verify on port 3000: Task 8.
- Placeholder scan: no implementation step uses unresolved `TBD`, deferred code, or unspecified tests.
- Type consistency:
  - `getMDXComponents()` remains the common registry.
  - `getOverviewMDXComponents()` is the overview/index registry.
  - `DocsContentBodyClient` is the only injection point for overview widgets.
