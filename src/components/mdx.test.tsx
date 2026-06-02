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
type PreComponent = ComponentType<{
  children: ReactNode;
  className?: string;
  icon?: string;
  title?: string;
  'data-line-numbers'?: boolean | string;
  'data-line-numbers-start'?: number;
}>;
type CommandBlockComponent = ComponentType<{
  code: string;
  language?: string;
}>;
type CalloutComponent = ComponentType<{
  children: ReactNode;
  title: string;
  type?: 'error' | 'info' | 'ok' | 'success' | 'warn' | 'warning' | 'zap';
}>;
type RecipesCatalogComponent = ComponentType<{
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  items: Array<{
    category: string;
    description: string;
    href: string;
    product: string;
    stack?: string;
    title: string;
    tone?: 'blue' | 'green' | 'pink' | 'purple' | 'sand';
  }>;
  productFilterLabel: string;
  searchPlaceholder: string;
  stackFilterLabel: string;
}>;

describe('MDX tabs', () => {
  it('selects the first tab by default for bare generated Tabs blocks', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="node">Node</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
        </TabsList>
        <TabsContent value="node">Node instructions</TabsContent>
        <TabsContent value="python">Python instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Node' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByText('Node instructions')).toBeVisible();
  });

  it('exposes Fumadocs generated code tab components', () => {
    const components = getMDXComponents();

    expect(components.CodeBlockTabs).toBeDefined();
    expect(components.CodeBlockTabsList).toBeDefined();
    expect(components.CodeBlockTabsTrigger).toBeDefined();
    expect(components.CodeBlockTab).toBeDefined();
  });

  it('persists grouped tabs across renders', () => {
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

  it('persists generated code tabs by group', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;

    const { unmount } = render(
      <CodeBlockTabs defaultValue="kotlin" groupId="platform" persist>
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="kotlin">Kotlin code</CodeBlockTab>
        <CodeBlockTab value="java">Java code</CodeBlockTab>
      </CodeBlockTabs>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Java' }));

    expect(window.localStorage.getItem('docs-tabs:platform')).toBe('java');
    unmount();

    render(
      <CodeBlockTabs defaultValue="kotlin" groupId="platform" persist>
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="kotlin">Kotlin code</CodeBlockTab>
        <CodeBlockTab value="java">Java code</CodeBlockTab>
      </CodeBlockTabs>,
    );

    expect(screen.getByRole('tab', { name: 'Java' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByText('Java code')).toBeVisible();
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
});

describe('MDX links', () => {
  it('renders relative markdown links as clean docs hrefs', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as ComponentType<{
      children: ReactNode;
      href: string;
    }>;

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
    const Anchor = components.a as ComponentType<{
      children: ReactNode;
      href: string;
    }>;

    render(<Anchor href="https://example.com/page.md">External</Anchor>);

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'href',
      'https://example.com/page.md',
    );
  });
});

describe('MDX code blocks', () => {
  it('wraps pre blocks with a copy button', () => {
    const components = getMDXComponents();
    const Pre = components.pre as PreComponent;
    const { container } = render(
      <Pre>
        <code>agora login</code>
      </Pre>,
    );

    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
    expect(screen.getByText('agora login')).toBeInTheDocument();
    expect(container.querySelector('.docs-code-block-root')).not.toHaveAttribute(
      'data-long-code',
    );
  });

  it('marks long single-line code blocks for elevated copy controls', () => {
    const components = getMDXComponents();
    const Pre = components.pre as PreComponent;
    const { container } = render(
      <Pre>
        <code>
          <span className="line">
            curl -fsSL https://raw.githubusercontent.com/AgoraIO/cli/main/install.sh
            | sh -s -- --add-to-path --project demo --channel voice-agent-demo
          </span>
        </code>
      </Pre>,
    );

    expect(container.querySelector('.docs-code-block-root')).toHaveAttribute(
      'data-long-code',
      'true',
    );
  });

  it('does not mark multiline code blocks as long command blocks', () => {
    const components = getMDXComponents();
    const Pre = components.pre as PreComponent;
    const { container } = render(
      <Pre>
        <code>
          <span className="line">
            const session = new AgentSession(&#123;
          </span>
          <span className="line">rtc: "voice",</span>
          <span className="line">llm: "gpt-5.3-chat",</span>
          <span className="line">&#125;);</span>
        </code>
      </Pre>,
    );

    expect(container.querySelector('.docs-code-block-root')).not.toHaveAttribute(
      'data-long-code',
    );
  });

  it('renders code block titles and icons from rehype-code props', () => {
    const components = getMDXComponents();
    const Pre = components.pre as PreComponent;

    render(
      <Pre
        icon="<svg viewBox='0 0 10 10'><path d='M0 0h10v10H0z' /></svg>"
        title="install.sh"
      >
        <code>agora login</code>
      </Pre>,
    );

    expect(screen.getByText('install.sh')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
  });

  it('does not render an icon-only header for plain code blocks', () => {
    const components = getMDXComponents();
    const Pre = components.pre as PreComponent;
    const { container } = render(
      <Pre icon="<svg viewBox='0 0 10 10'><path d='M0 0h10v10H0z' /></svg>">
        <code>agora login</code>
      </Pre>,
    );

    expect(container.querySelector('.docs-code-block-header')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
  });

  it('only renders line numbers when explicitly requested', () => {
    const components = getMDXComponents();
    const Pre = components.pre as PreComponent;
    const { rerender } = render(
      <Pre>
        <code>
          <span className="line">agora login</span>
        </code>
      </Pre>,
    );

    expect(screen.getByTestId('mdx-code-block')).not.toHaveAttribute(
      'data-line-numbers',
    );

    rerender(
      <Pre data-line-numbers data-line-numbers-start={7}>
        <code>
          <span className="line">agora login</span>
        </code>
      </Pre>,
    );

    expect(screen.getByTestId('mdx-code-block')).toHaveAttribute(
      'data-line-numbers',
      'true',
    );
    expect(screen.getByTestId('mdx-code-block')).toHaveAttribute(
      'data-line-numbers-start',
      '7',
    );
  });

  it('renders command blocks without implicit line numbers', () => {
    const components = getMDXComponents();
    const CommandBlock = components.CommandBlock as CommandBlockComponent;

    render(<CommandBlock code={`agora login\nbun run dev`} />);

    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
    expect(screen.getByText('agora login')).toBeInTheDocument();
    expect(screen.getByText('bun run dev')).toBeInTheDocument();
    expect(screen.getByTestId('mdx-code-block')).not.toHaveAttribute(
      'data-line-numbers',
    );
  });
});

describe('MDX callouts', () => {
  it('normalizes callout types for semantic styling', () => {
    const components = getMDXComponents();
    const Callout = components.Callout as CalloutComponent;
    const { container, rerender } = render(
      <Callout title="Heads up" type="warning">
        Watch this.
      </Callout>,
    );

    expect(container.querySelector('.docs-callout')).toHaveAttribute(
      'data-type',
      'warn',
    );

    rerender(
      <Callout title="Done" type="success">
        It worked.
      </Callout>,
    );

    expect(container.querySelector('.docs-callout')).toHaveAttribute(
      'data-type',
      'ok',
    );
  });
});

describe('RecipesCatalog', () => {
  it('filters cards by selected category and search query', () => {
    const components = getMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All recipe types"
        allProductsLabel="All products"
        allStacksLabel="All stacks"
        categoryFilterLabel="Recipe type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No recipes match the current filters."
        items={[
          {
            category: 'Quickstart',
            description: 'Create a voice agent in Python.',
            href: '/en/api-reference/recipes/python-quickstart',
            product: 'Voice AI',
            stack: 'Python',
            title: 'Python Quickstart',
            tone: 'blue',
          },
          {
            category: 'Use case',
            description: 'A wellness-oriented scenario reference.',
            href: '/en/api-reference/recipes/wellness-coach',
            product: 'Voice AI',
            stack: 'Python',
            title: 'Wellness Coach',
            tone: 'pink',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search recipes"
        stackFilterLabel="Stack"
      />,
    );

    expect(screen.getByRole('link', { name: /Python Quickstart/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Wellness Coach/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Use case' }));

    expect(
      screen.queryByRole('link', { name: /Python Quickstart/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wellness Coach/i })).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText('Search recipes'), {
      target: { value: 'nomatch' },
    });

    expect(
      screen.getByText('No recipes match the current filters.'),
    ).toBeVisible();
  });
});
