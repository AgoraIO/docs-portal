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

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    expect(screen.getByText('agora login')).toBeInTheDocument();
  });

  it('renders command blocks with line numbers', () => {
    const components = getMDXComponents();
    const CommandBlock = components.CommandBlock as CommandBlockComponent;

    render(<CommandBlock code={`agora login\nbun run dev`} />);

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    expect(screen.getByText('agora login')).toBeInTheDocument();
    expect(screen.getByText('bun run dev')).toBeInTheDocument();
  });
});
