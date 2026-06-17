import { fireEvent, render, screen, within } from '@testing-library/react';
import * as fumadocsTabs from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentType, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { getMDXComponents } from './mdx';

type TabsComponent = ComponentType<{
  children: ReactNode;
  defaultValue?: string;
  groupId?: string;
  items?: string[];
  persist?: boolean;
  value?: string;
}>;
type TabsChildComponent = ComponentType<{
  children: ReactNode;
  value: string;
}>;
type CodeBlockPreComponent = ComponentType<{
  children: ReactNode;
  className?: string;
  title?: string;
  'data-line-numbers'?: boolean;
  'data-line-numbers-start'?: number | string;
}>;
type AnchorComponent = ComponentType<{
  children: ReactNode;
  href: string;
}>;
type CardComponent = ComponentType<{
  description?: ReactNode;
  href?: string;
  title: ReactNode;
}>;
type HeadingComponent = ComponentType<{
  children: ReactNode;
  id?: string;
}>;

function createStorageMock(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys()).at(index) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe('common MDX registry', () => {
  beforeEach(() => {
    const localStorage = createStorageMock();
    const sessionStorage = createStorageMock();

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorage,
    });
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: sessionStorage,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: localStorage,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: sessionStorage,
    });
  });

  it('uses Fumadocs MDX defaults except for repo-specific links and commands', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const defaults = defaultMdxComponents as Record<string, unknown>;

    expect(components.img).toBe(defaults.img);
    expect(components.table).toBe(defaults.table);
    expect(components.Card).not.toBe(defaults.Card);
    expect(components.Cards).toBe(defaults.Cards);
    expect(components.Callout).toBe(defaults.Callout);

    expect(components.a).not.toBe(defaults.a);
    expect(components.CommandBlock).toBeDefined();
    expect(components.CommandBlock).not.toBe(defaults.CommandBlock);

    expect(components.pre).not.toBe(defaults.pre);
    expect(components.CodeBlockTabs).not.toBe(defaults.CodeBlockTabs);
    expect(components.CodeBlockTabsList).not.toBe(defaults.CodeBlockTabsList);
    expect(components.CodeBlockTabsTrigger).toBe(defaults.CodeBlockTabsTrigger);
    expect(components.CodeBlockTab).not.toBe(defaults.CodeBlockTab);
    expect(components.h1).toBe(defaults.h1);
    expect(components.h2).toBe(defaults.h2);
    expect(components.h3).toBe(defaults.h3);

    expect(components.Tabs).not.toBe(fumadocsTabs.Tabs);
    expect(components.Tab).toBe(fumadocsTabs.Tab);
    expect(components.TabsList).toBe(fumadocsTabs.TabsList);
    expect(components.TabsTrigger).toBe(fumadocsTabs.TabsTrigger);
    expect(components.TabsContent).not.toBe(fumadocsTabs.TabsContent);
  });

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

  it('keeps external markdown links compatible with standard anchors', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    render(<Anchor href="https://example.com/page.md">External</Anchor>);

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'href',
      'https://example.com/page.md',
    );
  });

  it('adds jump affordance and normalizes docs card links', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Card = components.Card as CardComponent;

    render(
      <Card
        description="Build and run a working voice agent in under 15 minutes."
        href="choose-your-path/quickstart-coding.mdx"
        title="Quickstart"
      />,
    );

    const card = screen.getByRole('link', { name: /Quickstart/i });

    expect(card).toHaveAttribute(
      'href',
      '/en/ai/choose-your-path/quickstart-coding',
    );
    expect(card).toHaveClass('docs-card-link');
  });

  it('renders headings with Fumadocs copy-anchor chrome', () => {
    const components = getMDXComponents();
    const Heading = components.h2 as HeadingComponent;

    render(<Heading id="install">Install Agora skills</Heading>);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Install Agora skills',
    });

    expect(heading).toHaveAttribute('id', 'install');
    expect(
      within(heading).getByRole('button', { name: /copy anchor/i }),
    ).toBeInTheDocument();
    expect(within(heading).getByRole('link')).toHaveAttribute(
      'href',
      '#install',
    );
  });

  it('renders static headings without copy-anchor chrome', () => {
    const components = getMDXComponents(undefined, { staticRender: true });
    const Heading = components.h4 as HeadingComponent;

    render(<Heading id="install">Install Agora skills</Heading>);

    const heading = screen.getByRole('heading', {
      level: 4,
      name: 'Install Agora skills',
    });

    expect(heading).toHaveAttribute('id', 'install');
    expect(
      within(heading).queryByRole('button', { name: /copy anchor/i }),
    ).not.toBeInTheDocument();
    expect(within(heading).getByRole('link')).toHaveAttribute(
      'href',
      '#install',
    );
  });

  it('uses Fumadocs tabs for normal MDX tabs', () => {
    const components = getMDXComponents();

    expect(components.Tabs).not.toBe(fumadocsTabs.Tabs);
    expect(components.Tab).toBe(fumadocsTabs.Tab);
    expect(components.TabsList).toBe(fumadocsTabs.TabsList);
    expect(components.TabsTrigger).toBe(fumadocsTabs.TabsTrigger);
    expect(components.TabsContent).not.toBe(fumadocsTabs.TabsContent);
  });

  it('renders Fumadocs normal tab triggers', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;

    render(
      <Tabs defaultValue="mac">
        <TabsList>
          <TabsTrigger value="mac">macOS and Linux</TabsTrigger>
          <TabsTrigger value="windows">Windows PowerShell</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tablist = screen.getByRole('tablist');

    expect(tablist).toHaveClass('not-prose');
    expect(tablist).toHaveClass('overflow-x-auto');
  });

  it('selects the first normal tab when MDX omits defaultValue', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="mac-linux">macOS and Linux</TabsTrigger>
          <TabsTrigger value="windows-powershell">
            Windows PowerShell
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mac-linux">
          <Pre>
            <code>Install with curl</code>
          </Pre>
        </TabsContent>
        <TabsContent value="windows-powershell">Install with irm</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tablist').parentElement).toHaveClass('bg-fd-card');
    expect(
      screen.getByText('Install with curl').closest('[role=tabpanel]'),
    ).toHaveClass('bg-fd-background');
    expect(
      screen.getByText('Install with curl').closest('[role=tabpanel]')
        ?.className,
    ).toContain('[&>figure:only-child]:bg-fd-card');
    expect(screen.getByText('Install with curl').closest('figure')).toHaveClass(
      'shadow-none',
    );
    expect(
      screen.getByRole('tab', { name: 'macOS and Linux' }),
    ).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Install with curl')).toBeVisible();
    expect(
      screen.getByRole('tab', { name: 'Windows PowerShell' }),
    ).toHaveAttribute('data-state', 'inactive');
  });

  it('falls back when a controlled normal tab value is stale', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    render(
      <Tabs value="ios">
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="web">Web instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByText('Android instructions')).toBeVisible();
  });

  it('uses Fumadocs code block chrome with local state compatibility wrappers', () => {
    const components = getMDXComponents();
    const defaults = defaultMdxComponents;

    expect(components.CodeBlockTabs).not.toBe(defaults.CodeBlockTabs);
    expect(components.CodeBlockTabsList).not.toBe(defaults.CodeBlockTabsList);
    expect(components.CodeBlockTabsTrigger).toBe(defaults.CodeBlockTabsTrigger);
    expect(components.CodeBlockTab).not.toBe(defaults.CodeBlockTab);
    expect(components.pre).not.toBe(defaults.pre);
  });

  it('renders generated code tabs with Fumadocs chrome', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;

    render(
      <CodeBlockTabs defaultValue="python">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="typescript">
            TypeScript
          </CodeBlockTabsTrigger>
        </CodeBlockTabsList>
      </CodeBlockTabs>,
    );

    const tablist = screen.getByRole('tablist');

    expect(tablist).toHaveClass('overflow-x-auto');
    expect(tablist).toHaveClass('bg-fd-card');
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveClass(
      'text-nowrap',
    );
  });

  it('exposes Fumadocs code block components for generated code tabs', () => {
    const components = getMDXComponents();

    expect(components.CodeBlockTabs).toBeDefined();
    expect(components.CodeBlockTabsList).toBeDefined();
    expect(components.CodeBlockTabsTrigger).toBeDefined();
    expect(components.CodeBlockTab).toBeDefined();
    expect(components.pre).toBeDefined();
  });

  it('renders fenced code with Fumadocs copy chrome', () => {
    const components = getMDXComponents();
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Pre className="language-bash" title="Install">
        <code>
          <span className="line">npm install @agora/sdk</span>
        </code>
      </Pre>,
    );

    const figure = screen.getByText('Install').closest('figure');

    expect(figure).not.toBeNull();
    const codeBlock = figure as HTMLElement;
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveClass('bg-fd-card');
    expect(codeBlock).toHaveClass('shadow-none');
    expect(within(codeBlock).getByText('Install')).toBeInTheDocument();
    expect(
      within(codeBlock).getByRole('button', { name: 'Copy Text' }),
    ).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent('npm install @agora/sdk');
  });

  it('renders generated code tabs with Fumadocs grouped chrome', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <CodeBlockTabs defaultValue="python" groupId="sdk" persist>
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="ts">TypeScript</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="python">
          <Pre>
            <code>print("hello")</code>
          </Pre>
        </CodeBlockTab>
        <CodeBlockTab value="ts">
          <Pre>
            <code>console.log("hello")</code>
          </Pre>
        </CodeBlockTab>
      </CodeBlockTabs>,
    );

    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
    expect(screen.getByText('print("hello")').closest('figure')).toHaveClass(
      'bg-fd-card',
    );
    expect(
      screen.getByText('print("hello")').closest('[role=tabpanel]')?.className,
    ).toContain('[&>figure]:border-0');
    expect(
      screen.getByText('print("hello")').closest('[role=tabpanel]')?.className,
    ).toContain('[&>figure]:m-0');
    const inactiveCodePanel = screen
      .getByRole('tab', { name: 'TypeScript' })
      .getAttribute('aria-controls');

    expect(inactiveCodePanel).toBeTruthy();
    expect(
      document.getElementById(inactiveCodePanel as string),
    ).not.toBeVisible();
    expect(screen.queryByText('console.log("hello")')).not.toBeInTheDocument();
  });

  it('switches generated code tabs when a trigger is clicked', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <CodeBlockTabs defaultValue="npm">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="npm">npm</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="pnpm">pnpm</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="npm">
          <Pre>
            <code>npm install @agora/voice-agent</code>
          </Pre>
        </CodeBlockTab>
        <CodeBlockTab value="pnpm">
          <Pre>
            <code>pnpm add @agora/voice-agent</code>
          </Pre>
        </CodeBlockTab>
      </CodeBlockTabs>,
    );

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'pnpm' }), {
      button: 0,
      ctrlKey: false,
    });

    expect(screen.getByRole('tab', { name: 'npm' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
    expect(screen.getByRole('tab', { name: 'pnpm' })).toHaveAttribute(
      'data-state',
      'active',
    );
    const npmPanelId = screen
      .getByRole('tab', { name: 'npm' })
      .getAttribute('aria-controls');
    const pnpmPanelId = screen
      .getByRole('tab', { name: 'pnpm' })
      .getAttribute('aria-controls');

    expect(npmPanelId).toBeTruthy();
    expect(pnpmPanelId).toBeTruthy();
    expect(document.getElementById(npmPanelId as string)).not.toBeVisible();
    expect(document.getElementById(pnpmPanelId as string)).toBeVisible();
    expect(
      screen.queryByText('npm install @agora/voice-agent'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('pnpm add @agora/voice-agent')).toBeInTheDocument();
  });

  it('unmounts inactive generated code tab content', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <CodeBlockTabs defaultValue="python">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="ts">TypeScript</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="python">
          <Pre>
            <code>print("hello")</code>
          </Pre>
        </CodeBlockTab>
        <CodeBlockTab value="ts">
          <Pre>
            <code>console.log("hello")</code>
          </Pre>
        </CodeBlockTab>
      </CodeBlockTabs>,
    );

    expect(screen.queryByText('console.log("hello")')).not.toBeInTheDocument();

    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('renders grouped MDX tabs without custom platform tabs', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

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

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('falls back when persisted tab values no longer match current content', () => {
    window.localStorage.setItem('platform', 'ios');

    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    render(
      <Tabs defaultValue="android" groupId="platform" persist>
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="web">Web instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('renders only the active MDX tab content in static markup', () => {
    const components = getMDXComponents(undefined, { staticRender: true });
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    const html = renderToStaticMarkup(
      <Tabs defaultValue="android">
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iOS</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="ios">iOS instructions</TabsContent>
      </Tabs>,
    );

    expect(html).toContain('Android instructions');
    expect(html).not.toContain('iOS instructions');
  });

  it('renders static code blocks without Shiki token spans', () => {
    const components = getMDXComponents(undefined, { staticRender: true });
    const Pre = components.pre as CodeBlockPreComponent;

    const html = renderToStaticMarkup(
      <Pre className="language-js" title="Example">
        <code>
          <span className="line">
            <span style={{ color: '#ff0000' }}>const</span>
            <span style={{ color: '#00ff00' }}> value = 1;</span>
          </span>
        </code>
      </Pre>,
    );

    expect(html).toContain('<pre');
    expect(html).toContain('const value = 1;');
    expect(html).not.toContain('--shiki-light');
    expect(html).not.toContain('style=');
  });

  it('collapses blank lines in static code blocks', () => {
    const components = getMDXComponents(undefined, { staticRender: true });
    const Pre = components.pre as CodeBlockPreComponent;

    const html = renderToStaticMarkup(
      <Pre className="language-js">
        <code>
          <span className="line">const one = 1;</span>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line">const two = 2;</span>
        </code>
      </Pre>,
    );

    expect(html).toContain('const one = 1;\nconst two = 2;');
    expect(html).not.toContain('const one = 1;\n\nconst two = 2;');
  });

  it('does not expose overview-only widgets from the common registry by default', () => {
    const components = getMDXComponents() as Record<string, unknown>;

    expect(components.CardGrid).toBeUndefined();
    expect(components.FeatureCard).toBeUndefined();
    expect(components.SolutionCard).toBeUndefined();
    expect(components.SolutionCardGrid).toBeUndefined();
    expect(components.OverviewSpotlightGrid).toBeUndefined();
    expect(components.OverviewToolkits).toBeUndefined();
    expect(components.RecipesCatalog).toBeUndefined();
  });
});
