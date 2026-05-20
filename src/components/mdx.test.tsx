import { render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from './mdx';

type TabsComponent = ComponentType<{ children: ReactNode }>;
type TabsChildComponent = ComponentType<{
  children: ReactNode;
  value: string;
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
