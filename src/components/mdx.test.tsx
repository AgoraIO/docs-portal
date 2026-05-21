import { render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from './mdx';

type TabsComponent = ComponentType<{ children: ReactNode }>;
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

    render(
      <Pre>
        <code>agora login</code>
      </Pre>,
    );

    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
    expect(screen.getByText('agora login')).toBeInTheDocument();
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
