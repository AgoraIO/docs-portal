import { fireEvent, render, screen, within } from '@testing-library/react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
type CodeBlockPreComponent = ComponentType<{
  children: ReactNode;
  className?: string;
  title?: string;
  'data-line-numbers'?: boolean | string;
  'data-line-numbers-start'?: number | string;
}>;
type AnchorComponent = ComponentType<{
  children: ReactNode;
  href: string;
}>;
type HeadingComponent = ComponentType<{
  children: ReactNode;
  id?: string;
}>;

describe('common MDX registry', () => {
  it('uses Fumadocs MDX defaults only as fallbacks behind repo-styled components', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const defaults = defaultMdxComponents as Record<string, unknown>;

    expect(components.img).toBe(defaults.img);
    expect(components.table).toBe(defaults.table);
    expect(components.Card).toBe(defaults.Card);
    expect(components.Cards).toBe(defaults.Cards);
    expect(components.Callout).toBe(defaults.Callout);

    expect(components.a).not.toBe(defaults.a);
    expect(components.pre).not.toBe(defaults.pre);
    expect(components.CodeBlockTabs).not.toBe(defaults.CodeBlockTabs);
    expect(components.CodeBlockTabsList).not.toBe(defaults.CodeBlockTabsList);
    expect(components.CodeBlockTabsTrigger).not.toBe(
      defaults.CodeBlockTabsTrigger,
    );
    expect(components.CodeBlockTab).not.toBe(defaults.CodeBlockTab);
    expect(components.h1).not.toBe(defaults.h1);
    expect(components.h2).not.toBe(defaults.h2);
    expect(components.h3).not.toBe(defaults.h3);
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

  it('renders headings without Fumadocs copy-anchor chrome', () => {
    const components = getMDXComponents();
    const Heading = components.h2 as HeadingComponent;

    render(<Heading id="install">Install Agora skills</Heading>);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Install Agora skills',
    });

    expect(heading).toHaveAttribute('id', 'install');
    expect(
      within(heading).queryByRole('button', { name: /copy anchor/i }),
    ).not.toBeInTheDocument();
    expect(within(heading).queryByRole('link')).not.toBeInTheDocument();
  });

  it('keeps normal tab triggers wrapping instead of overflowing', () => {
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

    expect(tablist).toHaveClass('flex-wrap');
    expect(tablist).toHaveClass('max-w-full');
  });

  it('keeps generated code tab triggers constrained to the code block', () => {
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

    expect(tablist).toHaveClass('max-w-full');
    expect(tablist).toHaveClass('overflow-x-auto');
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveClass(
      'shrink-0',
    );
  });

  it('exposes repo-styled code block components for generated code tabs', () => {
    const components = getMDXComponents();

    expect(components.CodeBlockTabs).toBeDefined();
    expect(components.CodeBlockTabsList).toBeDefined();
    expect(components.CodeBlockTabsTrigger).toBeDefined();
    expect(components.CodeBlockTab).toBeDefined();
    expect(components.pre).toBeDefined();
  });

  it('renders fenced code with a copy button and title chrome', () => {
    const components = getMDXComponents();
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Pre className="language-bash" title="Install">
        <code>
          <span className="line">npm install @agora/sdk</span>
        </code>
      </Pre>,
    );

    const figure = screen.getByTestId('mdx-code-block');

    expect(within(figure).getByText('Install')).toBeInTheDocument();
    expect(
      within(figure).getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
    expect(figure).toHaveTextContent('npm install @agora/sdk');
  });

  it('copies fenced code text without chrome labels', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const components = getMDXComponents();
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Pre>
        <code>
          <span className="line">const appId = "demo";</span>
        </code>
      </Pre>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(writeText).toHaveBeenCalledWith('const appId = "demo";');
  });

  it('renders generated code tabs with repo tabs and persistent group state', () => {
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

    fireEvent.click(screen.getByRole('tab', { name: 'TypeScript' }));

    expect(window.localStorage.getItem('docs-tabs:sdk')).toBe('ts');
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveAttribute(
      'data-state',
      'active',
    );
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

  it('ignores persisted tab values that are not present', () => {
    window.localStorage.setItem('docs-tabs:platform', 'ios');

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
